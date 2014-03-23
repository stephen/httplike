var assert = require('assert');
var stream = require('stream');
var Parser = require('../index');

describe('Parser', function() {
	describe('#Parser', function() {
		it('should parse a request without content', function(done) {
	    	var mockStream = new stream.PassThrough();
	    	var parser = new Parser(mockStream);
	    	parser.on('message', function(m) {
	    		assert(m.method == 'GET');
	    		assert(m.headers['Data'] == 'Hello');
	    		assert(m.headers['Data-2'] == 'More Hello');
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
	    		assert(expected.shift() == m.headers['Data']);

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
});