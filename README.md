httplike
========

[![Build Status](https://travis-ci.org/stephen/httplike.svg?branch=master)](https://travis-ci.org/stephen/httplike)

node.js package for parsing http-like protocols

## Installation
```
npm install httplike
```

## Usage
```
var Parser = require('httplike');
var p = new Parser(socket);
p.on('message', function(msg) {
  console.log(msg.method);
  console.log(msg.headers);
  console.log(msg.content);
});
```

## Protocol Assumptions

```httplike``` assumes that the incoming protocol follows HTTP standards on using the Content-Length header to determine how many bytes to wait for in a response body.

## Changelog

##### 0.0.5
- Breaking changes to how headers are accessed (```getHeader()``` function instead of ```headers[]```). See tests for example usage.
