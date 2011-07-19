/**
 * Node.js proxy for Saiku
 * Use this proxy to develop for the UI without having to install the server.
 * Requests will be proxied to demo.analytical-labs.com,
 * or a Saiku server installation of your choice.
 * 
 * To start the server, run `node server.js port [url]`
 */

var http = require('http');
var express = require('express');
var app = express.createServer();
var port = parseInt(process.ARGV[2]) || 8080;
var url = process.env.C9_PORT || process.ARGV[3] || 'demo.analytical-labs.com';
var proxy = http.createClient(80, url);

// Load static server
app.use(express['static'](__dirname));

app.all("/saiku/rest/*", function(request, response) {
    console.log(request.method, request.url);
    request.headers.host = url;
    var proxy_request = proxy.request(request.method, request.url, request.headers);
    
    proxy_request.addListener('response', function (proxy_response) {
        proxy_response.addListener('data', function(chunk) {
            response.write(chunk, 'binary');
        });
        
        proxy_response.addListener('end', function() {
            response.end();
        });
        
        response.writeHead(proxy_response.statusCode, proxy_response.headers);
    });
    
    request.addListener('data', function(chunk) {
        proxy_request.write(chunk, 'binary');
    });
    
    proxy_request.end();
});

console.log("Proxy listening on ", port);
app.listen(port);