/*
 * Copyright (C) 2011 Paul Stoellberger
 *
 * This program is free software; you can redistribute it and/or modify it 
 * under the terms of the GNU General Public License as published by the Free 
 * Software Foundation; either version 2 of the License, or (at your option) 
 * any later version.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along 
 * with this program; if not, write to the Free Software Foundation, Inc., 
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA 
 *
 */
 
var saikuHost = "demo.analytical-labs.com";
var saikuPort = 80;
var saikuDemo = saikuHost + ":" + saikuPort;

var sys = require('sys'),
    http = require('http');
var connection = http.createClient(saikuPort, saikuHost);
var selection = "";
var header = "<html><head>" + "<link rel=\"stylesheet\" href=\"http://" + saikuDemo + "/css/blueprint/src/reset.css\" type=\"text/css\" media=\"screen, projection\">" 
+ "<link rel=\"stylesheet\" href=\"http://" + saikuDemo + "/css/blueprint/src/typography.css\" type=\"text/css\" media=\"screen, projection\">" 
+ "<link rel=\"stylesheet\" href=\"http://" + saikuDemo + "/css/blueprint/src/forms.css\" type=\"text/css\" media=\"screen, projection\">" 
+ "<link rel=\"stylesheet\" href=\"http://" + saikuDemo + "/css/saiku/src/styles.css\" type=\"text/css\" media=\"screen, projection\"></head><body>";

http.createServer(function (req, resp) {
    setTimeout(function () {
        resp.writeHead(200, { 'Content-Type': 'text/html' });
        resp.write(header);

        var selectionBody = "";
        var request = connection.request('GET', "/saiku/json/saiku/admin/query/", { "host": saikuHost,"User-Agent": "NodeJS HTTP Client" });
        request.end();
        request.on('response', function (response) {
            response.setEncoding("utf8");
            response.on('data', function (chunk) { selectionBody += chunk  });
            response.on('end', function () {
                selection = getSelection(selectionBody);
                resp.write(selection);
                if (req.url == "/") {
                    resp.end();
                }
            });
            response.on('error', function () {
                if (req.url == "/") {
                    resp.end();
                }

            });
        });
        if (req.url != "/" && req.method == 'GET') {
            var responseBody = "";
            if (req.url[req.url.length - 1] == "?") {
                req.url = req.url.substring(0, req.url.length - 1);
            }
            var request = connection.request('GET', "/saiku/json/saiku/admin/query" + req.url + "/result/", { "host": saikuHost, "User-Agent": "NodeJS HTTP Client" });
            request.end();
            request.on('response', function (response) {
                response.setEncoding("utf8");
                response.on('data', function (chunk) {
                    responseBody += chunk
                });
                response.on('end', function () {
                    table = getTable(responseBody);
                    resp.write(table + "</body>");
                    resp.end();
                });
                response.on('error', function () {
                    resp.write("ERROR" + "</body>");
                    resp.end();
                });
            });
        }
    }, 0);
}).listen(8000);

function getTable(json) {
    var body = "<div class=\"workspace_results\" align=\"center\"><table><tbody>";
    try {
        var rows = JSON.parse(json);
        var t = rows,
            length = t.length;
        for (var i = 0; i < length; i++) {
            body += "<tr>";
            var res = t[i],
                innerlength = res.length;
            for (var k = 0; k < innerlength; k++) {
                if (res[k].type === "COLUMN_HEADER" && res[k].value === "null") {
                    body += '<th class="all_null" />';
                } else if (res[k].type === "COLUMN_HEADER") {
                    body += '<th class="col">' + res[k].value + '</th>';
                } else if (res[k].type === "ROW_HEADER" && res[k].value === "null") {
                    body += '<th class="row_null" />';
                } else if (res[k].type === "ROW_HEADER") {
                    body += '<th class="row">' + res[k].value + '</th>';
                }
                else if (res[k].type === "DATA_CELL") {
                    value = res[k].value == "" ? "&nbsp;" : res[k].value ;
                    body += '<td class="data">' + value + '</td>';
                }
            }
            body += "</tr>";
        }
    } catch (err) {
        body += "</tbody></table>";
        body += "ERROR:" + err;
    }
    body += "</tbody></table>";
    return body;

}

function getSelection(json) {
    var body = "<form method=\"get\">' <select onChange=\"this.form.action=this.options[this.selectedIndex].value;\" class=\"cubes\">" + "<option>Select a query</option>";
    try {
        var rows = JSON.parse(json);
        var t = rows, length = t.length;
        for (var i = 0; i < length; i++) {
            body += "<option value=\"" + t[i] + "\">" + t[i] + "</option>";
        }
        body += "</select><input type=\"submit\" value=\"Go\"></form>";
    } catch (err) {
        body += "</select><input type=\"submit\" value=\"Go\"></form> Error: " + err;
    }
    return body;
}