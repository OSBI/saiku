/**  
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
 *
 * \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
 *
 * Description: Module License Upload.
 * Version: 1.0.0
 * Last update: 2014/09/10
 * Author: Breno Polanski <breno.polanski@gmail.com>
 */

var upload = (function($, window, document, undefined) {

    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window and document are passed through as local variable rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).

    'use strict';    

    var module = {
        _baseURL: window.location.origin + '/saiku/rest/saiku/api/license',

        formChange: function() {
            $('#file-chooser').change(function() {
                $('.form-upload p').text(this.files.length + ' file selected');
            });
        },

        _notifyUser: function(alertType, msg) {
            $('#notification').removeClass();        
            $('#notification').addClass(alertType);
            $('#notification').slideDown();
            module._setNotificationMessage(msg);
            setTimeout(function() {
                $('#notification').slideUp();
            }, 3000);
        },

        _setNotificationMessage: function(msg) {
            $('#notification p').text(msg);
        },

        _clearInputFile: function() {
            var inputFile = $('#file-chooser');

            inputFile.replaceWith(inputFile.val('').clone(true));
        },

        _loadingButton: function(isLoadBtn) {
            if (isLoadBtn) {
                $('#btn-sendfile').attr('disabled', 'disabled');
                $('#btn-sendfile').text('Loading file...');
            }
            else {
                $('#btn-sendfile').removeAttr('disabled');
                $('#btn-sendfile').text('Upload');
            }
        },

        _xhr: function(options, callback) {
            var xhttp = new window.XMLHttpRequest();
            xhttp.open(options.type, options.url, true);
            xhttp.setRequestHeader('Content-Type', 'application/x-java-serialized-object');            
            xhttp.send(options.data);
            xhttp.onreadystatechange = function() {
                if (xhttp.status === 200 && xhttp.readyState === 4) {
                    module._clearInputFile();
                    module._loadingButton(false);
                    callback('alert-success', xhttp.responseText);
                }
                else {
                    module._clearInputFile();
                    module._loadingButton(false);
                    callback('alert-danger', 'Error while uploading the file: (' + xhttp.statusText + ')');
                }
            };
        },

        sendFile: function() {
            $('#btn-sendfile').on('click', function() {
                var file = $('#file-chooser')[0].files[0];
                
                if (file !== undefined) {
                    module._loadingButton(true);
                    module._xhr({type: 'POST', url: module._baseURL, data: file}, module._notifyUser);
                    $('.form-upload p').text('Drag your license or click in this area.');
                }
                else {
                    module._notifyUser('alert-danger', 'Oops... Select a file!');
                }
            });
        },

        init: function() {
            module.formChange();
            module.sendFile();
        }
    };

    return {
        init: module.init
    }

}(jQuery, window, document));