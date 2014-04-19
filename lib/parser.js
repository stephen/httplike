"use strict";

var events = require('events');

var HEADER_TERMINATOR = '\r\n\r\n';
var LINE_TERMINATOR = '\r\n';

var parseHeader = function(header) {
  var lines = header.split(LINE_TERMINATOR);

  var methodline = lines[0];
  var method = methodline.split(' ')[0].toUpperCase();
  var path = methodline.split(' ')[1];
  var output = {};

  output.method = method;
  output.path = path;

  var headers = {};
  for (var i = 1; i < lines.length; i++) {
    var line = lines[i];
    var header = line.split(/:(.+)/);
    if (header.length >= 2) {
      headers[header[0]] = header[1].replace(/^\s+|\s+$/gm, ''); 
    } else {
      output.error = true;
      output.message = 'invalid header specified (' + header[0] + ')';
      return output;
    }
  }

  if (headers.hasOwnProperty('Content-Length')) {
    output.contentLength = parseInt(headers['Content-Length']);
    output.hasContent = true;
  }
  output.headers = headers;
  return output;
};

var Parser = function(socket) {
  var self = this;
  var buffer = new Buffer(0);
  var collectingContent = -1;
  var headerData = null;

  socket.on('data', function(d) {
    buffer = Buffer.concat([ buffer, d ]);
    var strBuffer = buffer.toString();

    if (collectingContent == -1 && strBuffer.indexOf(HEADER_TERMINATOR) != -1) {
      var msgs = strBuffer.split(HEADER_TERMINATOR);

      // parse first header
      var headerData = parseHeader(msgs[0]);
      if (headerData.error) {
        self.emit('error', headerData.message);
      } else {
        buffer = buffer.slice(msgs[0].length + 4);
        if (!headerData.hasContent) {
          // done - need to forward request
          self.emit('message', { headers: headerData.headers, method: headerData.method });
        } else {
          // not done - need to get content data
          collectingContent = headerData.contentLength;
        }
      }
    }

    if (collectingContent >= 0 && collectingContent - buffer.length <= 0) { 
      // done
      var content = buffer.slice(0, collectingContent);
      self.emit('message', { headers: headerData.headers, method: headerData.method, content: content });

      buffer = buffer.slice(collectingContent + 1);

      collectingContent = -1;
    }
  });
};

Parser.prototype.__proto__ = events.EventEmitter.prototype;

module.exports = Parser;
module.exports.parseHeader = parseHeader;
