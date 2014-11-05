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
		'<div class="box_selections">' +
			'<div class="available_selections">' +
				'<div class="checkbox-selection">' +
					'<input type="checkbox">' +
				'</div>' +
			'</div>' +
			'<div class="available_selections">' +
				'<span class="i18n">Operator:</span><br>' +
				'<div class="selection_options">' +
					'<div class="form-group-selection">' +
						'<label><input type="radio"> Equals</label>' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<label><input type="radio"> After</label>' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<label><input type="radio"> Before</label>' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<label><input type="radio"> Between</label><br>' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<label><input type="radio"> Different</label>' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<label><input type="radio"> After&Equals</label>' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<label><input type="radio"> Before&Equals</label>' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<label><input type="radio"> Not Between</label><br>' +
					'</div>' +
					// '<label>Select a date:</label>' +
					// '<input type="text">' +
				'</div>' +
			'</div>' +
		'</div>'

		// '<div class="available_selections">' +
		// 	'<span class="i18n">Fixed Date:</span><br>' +
		// 	'<div class="selection_options">' +
		// 		'<label><input type="radio">Today</label>' +
		// 		'<label><input type="radio">Yesterday</label>' +
		// 		'<label><input type="radio">Current Week</label>' +
		// 		'<label><input type="radio">Current Month</label><br>' +
		// 		'<label><input type="radio">Current Year</label>' +
		// 	'</div>' +
		// '</div>' +

		// '<div class="available_selections">' +
		// 	'<span class="i18n">Rolling Date:</span><br>' +
		// 	'<div class="selection_options">' +
		// 		'<select>' +
		// 			'<option>Last</option>' +
		// 			'<option>Next</option>' +
		// 		'</select>' +
		// 		'<select>' +
		// 			'<option>Day(s)</option>' +
		// 			'<option>Week(s)</option>' +
		// 			'<option>Month(s)</option>' +
		// 			'<option>Year(s)</option>' +
		// 		'</select>' +
		// 	'</div>' +
		// '</div>'
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
        	.html(this.template_selection_operator);
	},

    post_render: function(args) {
        var left = ($(window).width() - 800)/2;
        var width = $(window).width() < 800 ? $(window).width() : 800;
        $(args.modal.el).parents('.ui-dialog')
            .css({ width: width, left: "inherit", margin:"0", height: 490 })
            .offset({ left: left});
    }
});