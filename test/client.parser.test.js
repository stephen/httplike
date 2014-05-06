"use strict";

var assert = require('assert');
var stream = require('stream');
var Parser = require('../lib/client/parser');

describe('Parser', function() {
  it('should parse a response', function(done) {
    var mockStream = new stream.PassThrough();
    var parser = new Parser(mockStream);

    parser.on('message', function(m) {

      assert(m.protocol === 'HTTP/1.1');
      assert(m.statusCode === 200);
      assert(m.statusMessage === 'OK');
      assert(m.getHeader('Data') === 'Hello');
      assert(m.getHeader('Data-2') === 'More Hello');
      done();
    });

    mockStream.write('HTTP/1.1 200 OK\r\nData:Hello\r\nData-2:More Hello\r\n\r\n');
  });
});