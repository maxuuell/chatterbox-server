var fs = require('fs');
var path = require('path');
var url = require('url');

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};




var payload = {results: []};
var idCounter = 1;
var clientRoot = path.dirname(__dirname) + '/client';

var requestHandler = function(request, response) {
  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  var urlParts = url.parse(request.url);

  // The outgoing status.
  var statusCode = 200;

  var headers = defaultCorsHeaders;

  if (urlParts.pathname === '/') {
    var index = __dirname + '/../client/index.html';
    fs.readFile(index, function (err, html) {
      if (err) {
        throw err;
        response.end('ERROR');
      }

      headers['Content-Type'] = 'text/html';
      response.writeHead(200, headers);
      response.end(html.toString());
    });
  } else if (urlParts.pathname === '/classes/messages') {
    if (request.method === 'GET') {
      var res = JSON.stringify(payload);

      headers['Content-Type'] = 'application/json';
      response.writeHead(statusCode, headers);
      response.end(res);
    }
    if (request.method === 'POST') {
      idCounter++;
      request.on('data', function(data) {
        var data = JSON.parse(data);

        data.objectId = idCounter;
        payload.results.push(data);
      });

      headers['Content-Type'] = 'application/json';
      response.writeHead(201, headers);
      response.end(JSON.stringify(payload));
    }
    if (request.method === 'OPTIONS') {
      if (request.headers['access-control-request-method'] === 'GET') {
        var res = JSON.stringify(payload);

        headers['Content-Type'] = 'application/json';
        response.writeHead(statusCode, headers);
        response.end(res);
      }
    }
  } else if (urlParts.pathname === '/styles/styles.css') {
    var index =  clientRoot + request.url;
    fs.readFile(index, function (err, sheet) {
      if (err) {
        throw err;
        response.end('ERROR');
      }

      headers['Content-Type'] = "text/css";
      response.writeHead(200, headers);
      response.end(sheet.toString());
    });
  } else if (urlParts.pathname === "/bower_components/jquery/dist/jquery.js") {
    var index =  clientRoot + urlParts.pathname;
    fs.readFile(index, function (err, sheet) {
      if (err) {
        throw err;
        response.end('ERROR');
      }

      headers['Content-Type'] = "application/javascript";
      response.writeHead(200, headers);
      response.end(sheet.toString());
    });
  } else if (urlParts.pathname === '/scripts/app.js') {
    var index =  clientRoot + urlParts.pathname;
    fs.readFile(index, function (err, sheet) {
      if (err) {
        throw err;
        response.end('ERROR');
      }

      headers['Content-Type'] = "application/javascript";
      response.writeHead(200, headers);
      response.end(sheet.toString());
    });
  } else {
    response.writeHead(404, headers);
    response.end();
  }
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
exports.requestHandler = requestHandler;
