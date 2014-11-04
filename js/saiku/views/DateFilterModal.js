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
 * Dialog for date filter
 */
var DateFilterModal = Modal.extend({
	type: 'date-filter',

	buttons: [
		{ text: 'Save', method: 'close' },
		{ text: 'Cancel', method: 'close' }
	],

	events: {
		'click a': 'call'
	},

	template_selection_operator: _.template(
		'<span><%= name %></span>'
	),

	initialize: function(args) {
		// Initialize properties
		this.options.title = 'Selections for Year';
		this.message = 'Loading...';

		// Resize when rendered
		this.bind('open', this.post_render);
		this.render();

		// _.bind(this);

		// Load template
        this.$el.find('.dialog_body')
        	.html(this.template_selection_operator({ name: 'test' }));
	},

    post_render: function(args) {
        var left = ($(window).width() - 1000)/2;
        var width = $(window).width() < 1040 ? $(window).width() : 1040;
        $(args.modal.el).parents('.ui-dialog')
            .css({ width: width, left: "inherit", margin:"0", height: 490 })
            .offset({ left: left});
    }
});