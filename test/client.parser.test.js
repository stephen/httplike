"use strict";

var assert = require('assert');
var stream = require('stream');

var httplike = require('../');
var Parser = httplike.ClientParser;

describe('Parser', function() {
  it('should parse a response', function(done) {
    var mockStream = new stream.PassThrough();
    var parser = new Parser(mockStream);

    parser.on('message', function(m) {

      assert.equal(m.protocol, 'HTTP/1.1');
      assert.equal(m.statusCode, 200);
      assert.equal(m.statusMessage, 'OK');
      assert.equal(m.getHeader('Data'), 'Hello');
      assert.equal(m.getHeader('Data-2'), 'More Hello');
      assert.equal(typeof m.statusCode, 'number');
      done();
    });

    mockStream.write('HTTP/1.1 200 OK\r\nData:Hello\r\nData-2:More Hello\r\n\r\n');
  });
});
