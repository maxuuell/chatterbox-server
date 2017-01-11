var fs = require('fs');
var path = require('path');
var url = require('url');

var headers = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var sendFileResponse = function (response, status, contentType, filePath) {
  fs.readFile(filePath, function (err, data) {
    
    if (err) {
      throw err;
      response.end('ERROR');
    }

    headers['Content-Type'] = contentType;
    response.writeHead(status, headers);
    response.end(data.toString());
  });
};

var payload = {results: []};
var idCounter = 1;
var clientRoot = path.dirname(__dirname) + '/client';

var requestHandler = function(request, response) {
  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  var urlParts = url.parse(request.url);
  var index = clientRoot + urlParts.pathname;
  var statusCode = 200;

  if (urlParts.pathname === '/') {
    index = index + 'index.html';
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
    sendFileResponse(response, 200, "text/css", index);
  } else if (urlParts.pathname === "/bower_components/jquery/dist/jquery.js") {
    sendFileResponse(response, 200, "application/javascript", index);
  } else if (urlParts.pathname === '/scripts/app.js') {
    sendFileResponse(response, 200, "application/javascript", index);
  } else {
    response.writeHead(404, headers);
    response.end();
  }
};

exports.requestHandler = requestHandler;
