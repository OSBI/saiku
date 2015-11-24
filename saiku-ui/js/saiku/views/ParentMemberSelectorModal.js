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
 * Class for get a parent member
 *
 * @class ParentMemberSelectorModal
 */
var ParentMemberSelectorModal = Modal.extend({

    /**
     * Type name
     *
     * @property type
     * @type {String}
     * @private
     */
	type: 'parent-member-selector',

    /**
     * Property with main template of modal
     *
     * @property template_modal
     * @type {String}
     * @private
     */
	template_modal: _.template(
        '<form class="form-group">' +
        	'<div class="group-elements" style="padding-top: 0;">' +
				'<nav class="breadcrumbs">' +
					'<a href="#">Breadcrumb</a> &gt;' +
					'<a href="#">Breadcrumb</a> &gt;' +
					'<a href="#">Breadcrumb</a> &gt;' +
					'<span class="last-crumb">Breadcrumb</span>' +
				'</nav>' +
			'</div>' +
			'<div class="group-elements">' +
				'<label>Selected Level: <span class="selected-level"></span></label>' +
			'</div>' +
			'<div class="group-elements">' +
				'<ul class="members-list">' +
				'<ul>' +
			'</div>' +
			'<div class="group-elements">' +
				'<input type="search" id="auto-filter" placeholder="Autocomplete Filter">' +
			'</div>' +
        '</form>'
	),

    /**
     * Events of buttons
     *
     * @property buttons
     * @type {Array}
     * @private
     */
    buttons: [
        { text: 'Add', method: 'save' },
        { text: 'Clear', method: 'clear' },
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
        this.workspace = args.workspace;
        this.options.title = 'Parent Member Selector';

        // Load template
        this.message = this.template_modal({
        });

        this.bind('open', function() {
        });
    }
});