var statusMessages = require('./statusMessages');
var _ = require('lodash');

var CRLF = '\r\n';

var Response = function(socket, options) {
	this.socket = socket;
	this.statusCode = 200;
	this.options = options || {};
	this.headers = {};
  	this.statusMessages = (this.options.statusMessages ? _.extend(statusMessages, this.options.statusMessages) : statusMessages);
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

Response.prototype.send = function(status, body) {
	var protocol = this.options.protocol || 'HTTP/1.1';

	body = (typeof status === 'string' || typeof status === 'object' ? status : body);
	status = (typeof status === 'number' ? status : this.statusCode);

	if (typeof body === 'object') {
		body = JSON.stringify(body);
	}

	if (typeof body === 'string') {
		this.set('Content-Length', body.length);
	}


	var buffer = protocol + ' ' + status + ' ' + this.statusMessages[status] + CRLF;
	Object.keys(this.headers).forEach(function(field) {
		buffer += field + ':' + this.headers[field] + CRLF;
	}.bind(this));

	buffer += CRLF;
	if (body) {
		buffer += body;
	}
	this.socket.write(buffer);
};

module.exports = Response;