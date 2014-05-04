var statusMessages = {
  200: 'OK',
  401: 'Unauthorized',
  453: 'Not Enough Bandwidth'
};

var CRLF = '\r\n';

var Response = function(socket, options) {
	this.socket = socket;
	this.statusCode = 200;
	this.options = options || {};
	this.headers = {};
};

Response.prototype.status = function(statusCode) {
	this.statusCode = statusCode;
	return this;
};

Response.prototype.get = function(field) {
	return this.headers[field];
};

Response.prototype.set = function(field, value) {
	this.header(field, value);
};

Response.prototype.header = function(field, value) {
	this.headers[field] = value;
};

Response.prototype.send = function(body) {
	var protocol = this.options.protocol || 'HTTP/1.1';

	if (typeof body === 'object') {
		body = JSON.stringify(body);
	}

	if (typeof body === 'string') {
		this.set('Content-Length', body.length);
	}

	var buffer = protocol + ' ' + this.statusCode + ' ' + statusMessages[this.statusCode] + CRLF;
	Object.keys(this.headers).forEach(function(field) {
		buffer += field + ':' + this.headers[field] + CRLF;
	}.bind(this));

	buffer += CRLF;
	if (body) {
		buffer += body;
	}
	this.socket.end(buffer);
};

/*
Response.prototype.addHeader = function(header, data) {
  this.buffer += header + ": " + data + "\r\n";
};

Response.prototype.setStatus = function(statusCode, cseq) {
  this.buffer += "RTSP/1.0 " + statusCode + " " + statusMessages[statusCode] + '\r\n';
  this.addHeader('Server', 'AirTunes/105.1');
  this.addHeader('CSeq', cseq);
}

Response.prototype.setOK = function(cseq) {
  this.setStatus(200, cseq);
};

Response.prototype.send = function() {
  this.socket.write(this.buffer + '\r\n');
};

Response.prototype.status = function(err) {
  this.socket.end("RTSP/1.0 " + err + ' ' + statusMessages[err] + '\r\n');
};
*/

module.exports = Response;