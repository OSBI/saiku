/**
* Description: Module License Upload.
* Version: 1.0.0
* Last update: 2014/09/09
* Author: Breno Polanski <breno.polanski@gmail.com>
*/

// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
var app = (function($, window, document, undefined) {

    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window and document are passed through as local variable rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).

    'use strict';

    var BASE_URL = window.location.origin + '/saiku/rest/saiku/api/license';

    var app = {
        init: function() {
            this.formChange();
            this.sendFile();
        },

        formChange: function() {
            $('#file-chooser').change(function() {
                $('.form-upload p').text(this.files.length + ' file selected');
            });
        },

        notifyUser: function(alertType, msg) {
            $('#notification').removeClass();        
            $('#notification').addClass(alertType);
            app.setNotificationMessage(msg);
            $('#notification').slideDown();
            setTimeout(function() {
                $('#notification').slideUp();
            }, 3000);
        },

        setNotificationMessage: function(msg) {
            $('#notification p').text(msg);
        },

        sendFile: function() {
            $('#btn-sendfile').on('click', function() {
                var file = $('#file-chooser')[0].files[0];
                
                if (file !== undefined) {
                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', BASE_URL);
                    xhr.onload = function() {
                        if (xhr.status === 201) {
                            app.notifyUser('alert-success', xhr.responseText);
                            $('.form-upload p').text('Drag your license or click in this area.');
                        } else {
                            app.notifyUser('alert-success', xhr.responseText);
                            $('.form-upload p').text('Drag your license or click in this area.');
                        }
                    };
                    xhr.setRequestHeader('Content-Type', 'application/x-java-serialized-object');
                    xhr.send(file);
                }
                else {
                    app.notifyUser('alert-danger', 'Ops! Select file.');
                }
            });
        }
    };

    return app;

}(jQuery, window, document));