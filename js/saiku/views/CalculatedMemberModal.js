/*
 *   Copyright 2015 OSBI Ltd
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
 * Class for calculated member
 * 
 * @class CalculatedMemberModal
 */
var CalculatedMemberModal = Modal.extend({
    /**
     * Type name
     *
     * @property type
     * @type {String}
     * @private
     */
    type: 'calculated-member',

    /**
     * Property with main template of modal
     *
     * @property message
     * @type {String}
     * @private
     */
    message:
        // measures
        '<div class="calculated-member-group">' +
            '<ul class="members-list">' +
                '<li class="members-box">' +
                    '<table>' +
                        '<tr>' +
                            '<td class="member-name">Attributes 1</td>' +
                            '<td class="member-actions">' +
                               '<a class="" href="#">edit</a>' +
                               '<a class="" href="#">del</a>' +
                            '</td>' +
                        '</tr>' +
                    '</table>' +
                '</li>' +
            '</ul>' +
        '</div>' +
        // form
        '<div class="calculated-member-form">' +
            '<form class="form-group-inline">' +
                '<label for="">Name:</label>' +
                '<input type="text" id="">' +
                '<label for="">Measure:</label>' +
                '<select id="data-sources"></select>' +
                '<label for="">Formula:</label>' +
                '<div id="editor-formula"></div>' +
                '<label for="">Dimension:</label>' +
                '<select id="data-sources"></select>' +
                '<label for="">Format:</label>' +
                '<input type="text" id="">' +
            '</form>' +
        '</div>',

    /**
     * Events of buttons
     *
     * @property buttons
     * @type {Array}
     * @private
     */
    buttons: [
        { text: 'Save', method: 'save' },
        { text: 'Cancel', method: 'close' }
    ],

    /**
     * The events hash (or method) can be used to specify a set of DOM events 
     * that will be bound to methods on your View through delegateEvents
     * 
     * @property events
     * @type {Object}
     * @private
     */
    events: {
        'click .dialog_footer a' : 'call'
    },

    /**
     * The constructor of view, it will be called when the view is first created
     *
     * @constructor
     * @private
     * @param  {Object} args Attributes, events and others things
     */
    initialize: function(args) {
        // Initialize properties
        _.extend(this, args);
        this.options.title = 'Calculated Member';
        var self = this;
        this.bind('open', function() {
            this.post_render();
            this.$el.find('.calculated-member-group').height(this.$el.find('.calculated-member-form').height());
            _.defer(function() {
                self.start_editor();
            });
        });
    },

    /**
     * Centralize dialog in screen
     *
     * @method post_render
     * @public
     */
    post_render: function() {
        var tPerc = (((($('body').height() - 480) / 2) * 100) / $('body').height());
        var lPerc = (((($('body').width() - 800) / 2) * 100) / $('body').width());

        this.$el.dialog('option', 'position', 'center');
        this.$el.parents('.ui-dialog').css({ 
            width: '800px', 
            top: tPerc + '%', 
            left: lPerc + '%' 
        });
    },

    /**
     * Start editor ace.js
     *
     * @method start_editor
     * @public
     */
    start_editor: function() {
        this.editorJS = ace.edit('editor-formula');
        this.editorJS.getSession().setMode('ace/mode/text');
        this.editorJS.getSession().setUseWrapMode(true);
        this.editorJS.setValue(this.codeJS);
        Saiku.ui.unblock();
    },
});