var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./lib/config');
var fs = require('fs');
var _data = require('./lib/data');
var handlers = require('./lib/handlers');
var helpers = require('./lib/helpers');


// TESTING
// @TODO Delete this
// _data.create('test', 'newFile', {'x': 'y'}, function(err) {
//   console.log('This was an error:', err);
// });

var httpServer = http.createServer(function(req, res) {
  unifiedServer(req, res);
});

httpServer.listen(config.httpPort, function() {
  console.log('The server has been started on port ' + config.httpPort);
  // To change the running mode: NODE_ENV=production/staging node index.js
});

var httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};
var httpsServer = https.createServer(httpsServerOptions, function(req, res) {
  unifiedServer(req, res);
});

httpsServer.listen(config.httpsPort, function() {
  console.log('The server has been started on port ' + config.httpsPort);
  // To change the running mode: NODE_ENV=production/staging node index.js
});

var unifiedServer = function(req, res) {
  var parseUrl = url.parse(req.url, true);

  var path = parseUrl.pathname;
  var trimmedPath = path.replace(/\/+|\/+$/g, '');

  var method = req.method.toLowerCase();

  var queryStringObject = parseUrl.query;

  var headers = req.headers;

  var decoder = new StringDecoder('utf-8');
  var buffer = '';
  req.on('data', function(data) {
    buffer += decoder.write(data);
  });

  req.on('end', function() {
    buffer += decoder.end();


    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
    var data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': helpers.parseJsonToObject(buffer)
    };

    chosenHandler(data, function(statusCode, payload) {
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
      payload = typeof(payload) == 'object' ? payload : {};
      var payloadString = JSON.stringify(payload);

      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      res.end('Hello World\n');
      console.log('Returning this response:', statusCode, payloadString);
    });
  });
};



var router = {
  'sample': handlers.sample,
  'users': handlers.users
};
