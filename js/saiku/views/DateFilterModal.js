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

	template_selection: _.template(
		'<div class="box-selections">' +
			'<div class="available-selections">' +
				'<div class="checkbox-selection">' +
					'<input type="checkbox">' +
				'</div>' +
			'</div>' +
			'<div class="available-selections">' +
				'<span class="i18n">Operator:</span><br>' +
				'<div class="selection-options">' +
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
				'</div>' +
			'</div>' +
		'</div>' +
		'<div class="box-selections">' +
			'<div class="clearfix"></div>' +
			'<div class="available-selections">' +
				'<div class="checkbox-selection">' +
					'<input type="checkbox">' +
				'</div>' +
			'</div>' +
			'<div class="available-selections">' +
				'<span class="i18n">Fixed Date:</span><br>' +
				'<div class="selection-options">' +
					'<label><input type="radio">Today</label>' +
					'<label><input type="radio">Yesterday</label>' +
					'<label><input type="radio">Current Week</label>' +
					'<label><input type="radio">Current Month</label><br>' +
					'<label><input type="radio">Current Year</label>' +
				'</div>' +
			'</div>' +
		'</div>' +
		'<div class="box-selections">' +
			'<div class="clearfix"></div>' +
			'<div class="available-selections">' +
				'<div class="checkbox-selection">' +
					'<input type="checkbox">' +
				'</div>' +
			'</div>' +
			'<div class="available-selections">' +
				'<span class="i18n">Rolling Date:</span><br>' +
				'<div class="selection-options">' +
					'<select>' +
						'<option>Last</option>' +
						'<option>Next</option>' +
					'</select>' +
					'<select>' +
						'<option>Day(s)</option>' +
						'<option>Week(s)</option>' +
						'<option>Month(s)</option>' +
						'<option>Year(s)</option>' +
					'</select>' +
				'</div>' +
			'</div>' +
		'</div>'
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
        	.html(this.template_selection);
	},

    post_render: function(args) {
        var left = ($(window).width() - 600)/2;
        var width = $(window).width() < 600 ? $(window).width() : 600;
        $(args.modal.el).parents('.ui-dialog')
            .css({ width: width, left: "inherit", margin:"0", height: 490 })
            .offset({ left: left});
    }
});