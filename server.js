/*  
 *   Copyright 2012 OSBI Ltd
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
 
/**
 * Node.js proxy for Saiku
 * Use this proxy to develop for the UI without having to install the server.
 * Requests will be proxied to demo.analytical-labs.com,
 * or a Saiku server installation of your choice.
 * 
 * To play with the chaos monkey, set the CHAOS_MONKEY environment variable
 * to anything (Preferably a nice name for your chaos monkey).
 * 
 * To start the server, run `node server.js [port] [backend_host] [backend_port]`
 */

// newer versions of node.js use the lower-case argv
var argv = process.ARGV || process.argv;

var http = require('http');
var express = require('express');
var app = express.createServer();
var port = process.env.C9_PORT || parseInt(argv[2], 10) || 8080;
var backend_host = argv[3] || 'dev.analytical-labs.com';
var backend_port = argv[4] || 80;
var proxy = http.createClient(backend_port, backend_host);

proxy.on('error', function() {
    proxy = http.createClient(backend_port, backend_host);
});

// Load static server
var twoHours = 1000 * 60 * 60 * 2;
app.use(express['static'](__dirname));

// Proxy request
function get_from_proxy(request, response) {
    var proxy_request = proxy.request(request.method, request.url, request.headers);
    
    proxy_request.addListener('response', function (proxy_response) {
        proxy_response.addListener('data', function(chunk) {
            response.write(chunk, 'binary');
        });
        
        proxy_response.addListener('end', function() {
            if (process.env.CHAOS_MONKEY) {
                setTimeout(function() {
                    response.end();
                }, Math.floor(Math.random() * 3000));
            } else {
                response.end();
            }
        });
        
        response.writeHead(proxy_response.statusCode, proxy_response.headers);
    });
    
    request.addListener('data', function(chunk) {
        proxy_request.write(chunk, 'binary');
    });
    
    proxy_request.end();
}

// Unleash the chaos monkey!
function unleash_chaos_monkey(request, response) {
    var monkey = "The chaos monkey strikes again!";
    response.writeHead(500, {
        "Content-Type": "text/plain",
        "Content-Length": monkey.length
    });
    response.write(monkey);
    response.end();
}

// Handle incoming requests
app.all("/saiku/*", function(request, response) {
    console.log(request.method, request.url);
    request.headers.host = backend_host;

    if (process.env.CHAOS_MONKEY && Math.random() < 0.25) {
        unleash_chaos_monkey(request, response);
    } else {
        get_from_proxy(request, response);
    }
});
console.log("Connected to '", backend_host, ":", backend_port,"'");
console.log("Proxy listening on", port);

app.listen(port, '0.0.0.0');
