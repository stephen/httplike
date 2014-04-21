"use strict";

var assert = require('assert');
var stream = require('stream');
var Parser = require('../index');

describe('Parser', function() {
	describe('#Parser e2e', function() {
		it('should parse a request without content', function(done) {
			var mockStream = new stream.PassThrough();
			var parser = new Parser(mockStream);
			parser.on('message', function(m) {
				assert(m.method == 'GET');

				assert(m.getHeader('Data') == 'Hello');
				assert(m.getHeader('Data-2') == 'More Hello');
				done();
			});
			mockStream.write('GET /test HTTP/1.1\r\nData:Hello\r\nData-2:More Hello\r\n\r\n');
		});

		it('should parse a request with content', function(done) {
			var mockStream = new stream.PassThrough();
			var parser = new Parser(mockStream);
			parser.on('message', function(m) {
				assert(m.content == 'dat content');
				done();
			});

			var content = 'dat content';
			mockStream.write('GET /test HTTP/1.1\r\nData:Hello\r\nContent-Length:' + content.length + '\r\n\r\n' + content);
		});

		it('should parse multiple http requests without content', function(done) {
			var mockStream = new stream.PassThrough();
			var parser = new Parser(mockStream);

			var expected = [ 'Hello', 'Goodbye' ];

			parser.on('message', function(m) {
				assert(expected.shift() == m.getHeader('Data'));

				if (expected.length == 0)
					done();
			});

			mockStream.write('GET / HTTP/1.1\r\nData:Hello\r\n\r\n');
			mockStream.write('GET / HTTP/1.1\r\nData:Goodbye\r\n\r\n');
		});

		it('should parse multiple http requests with content', function(done) {
			var mockStream = new stream.PassThrough();
			var parser = new Parser(mockStream);

			var expected = [ 'Hello', 'Goodbye' ];

			parser.on('message', function(m) {
				assert(expected.shift() == m.content);

				if (expected.length == 0)
					done();
			});

			mockStream.write('GET / HTTP/1.1\r\nContent-Length:' + expected[0].length + '\r\n\r\n' + expected[0]);
			mockStream.write('GET / HTTP/1.1\r\nContent-Length:' + expected[0].length + '\r\n\r\n' + expected[0]);
		});
	});
	describe('#parseHeader', function() {
		it('should parse headers', function() {
			var headerData = Parser.parseHeader('GET /test/path HTTP/1.1\r\nData:Hello\r\nData-2:More Hello');

			assert(headerData.path == '/test/path');
			assert(headerData.method == 'GET');
			assert(headerData.headers['data'] == 'Hello');
			assert(headerData.headers['data-2'] == 'More Hello');
			assert(!headerData.hasContent);
		});

		it('should should fail on malformed headers', function() {
			assert(Parser.parseHeader('GET /test/path HTTP/1.1\r\nData\r\nData-2:More Hello').error);
		});

		it('should handle multiple colons in header', function() {
			var headerData = Parser.parseHeader('GET /test/path HTTP/1.1\r\nData:Hello:There\r\nData-2:More Hello');

			assert(headerData.headers['data'] == 'Hello:There');
			assert(headerData.headers['data-2'] == 'More Hello');
		});

	});
});