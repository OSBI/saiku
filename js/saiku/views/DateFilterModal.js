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
		{ text: 'Save', method: 'save' },
		{ text: 'Cancel', method: 'close' }
	],

	events: {
		'click a': 'call',
		'focus #select-date': 'select_date'
	},

	template_selection: _.template(
		'<div class="box-selections">' +
			'<div class="selection-option">' +
				'<input type="radio" name="selection-option" id="selection-option-operator">' +
			'</div>' +
			'<div class="available-selections">' +
				'<span class="i18n">Operator:</span><br>' +
				'<div class="selection-options">' +
					'<div class="form-group-selection">' +
						'<label><input type="radio" id="operator-equals"> Equals</label>' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<label><input type="radio" id="operator-after"> After</label>' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<label><input type="radio" id="operator-before"> Before</label>' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<label><input type="radio" id="operator-between"> Between</label><br>' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<label><input type="radio" id="operator-different"> Different</label>' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<label><input type="radio" id="operator-after-equals"> After&Equals</label>' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<label><input type="radio" id="operator-before-equals"> Before&Equals</label>' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<label><input type="radio" id="operator-notbetween"> Not Between</label><br>' +
					'</div>' +
					'<div class="inline-form-group">' +
						'<div class="form-group">' +
							'<label>Select a date:</label>' +
							'<input type="text" id="select-date" placeholder="Choose a date">' +
						'</div>' +
						'<div class="form-group">' +
							'<fieldset id="selected-date">' +
								'<legend>Selected date:</legend>' +
							'</fieldset>' +
						'</div>' +
					'</div>' +
					// '<div class="form-group">' +
					// 	'<label>Select a start date:</label>' +
					// 	'<input type="text" placeholder="Choose a date">' +
					// '</div>' +
					// '<div class="form-group">' +
					// 	'<label>Select an end date:</label>' +
					// 	'<input type="text" placeholder="Choose a date">' +
					// '</div>' +
				'</div>' +
			'</div>' +
		'</div>' +
		'<div class="box-selections">' +
			'<div class="selection-option">' +
				'<input type="radio" name="selection-option" id="selection-option-fixed-date">' +
			'</div>' +			
			'<div class="available-selections">' +
				'<span class="i18n">Fixed Date:</span><br>' +
				'<div class="selection-options">' +
					'<label><input type="radio" id="fd-today">Today</label>' +
					'<label><input type="radio" id="fd-yesterday">Yesterday</label>' +
					'<label><input type="radio" id="fd-current-week">Current Week</label>' +
					'<label><input type="radio" id="fd-current-month">Current Month</label><br>' +
					'<label><input type="radio" id="fd-current-year">Current Year</label>' +
				'</div>' +
			'</div>' +
		'</div>' +
		'<div class="box-selections">' +
			'<div class="selection-option">' +
				'<input type="radio" name="selection-option" id="selection-option-available">' +
			'</div>' +
			'<div class="available-selections">' +
				'<span class="i18n">Rolling Date:</span><br>' +
				'<div class="selection-options">' +
					'<div class="form-group-selection">' +
						'<select id="">' +
							'<option value="last">Last</option>' +
							'<option value="next">Next</option>' +
						'</select>' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<select id="">' +
							'<option value="days">Day(s)</option>' +
							'<option value="weeks">Week(s)</option>' +
							'<option value="months">Month(s)</option>' +
							'<option value="years">Year(s)</option>' +
						'</select>' +
					'</div>' +
				'</div>' +
			'</div>' +
		'</div>'
		// '<div class="box-selections">' +
		// 	'<div class="available-selections">' +
		// 		'<span class="i18n">Available member:</span><br>' +
		// 		'<div class="selection-options"></div>' +
		// 	'</div>' +
		// '</div>' +
		// '<div class="box-selections">' +
		// 	'<div class="selection_buttons">' +
	 //            '<a class="form_button">&nbsp;&gt;&nbsp;</a><br><br>' +
	 //            '<a class="form_button">&gt;&gt;</a><br><br>' +
	 //            '<a class="form_button">&lt;&lt;</a><br><br>' +
	 //            '<a class="form_button">&nbsp;&lt;&nbsp;</a>' +
	 //        '</div>' +
  //       '</div>' +
		// '<div class="box-selections">' +
		// 	'<div class="available-selections">' +
		// 		'<span class="i18n">Used members:</span><br>' +
		// 		'<div class="selection-options"></div>' +
		// 	'</div>' +
		// '</div>'
	),

	initialize: function(args) {
		// Initialize properties
		_.extend(this, args);
		this.options.title = 'Selections for Year';
		this.message = 'Loading...';
		this.query = args.workspace.query;

		// _.bind(this);

		// Resize when rendered
		this.bind('open', this.post_render);
		this.render();
        
        this.$el.parent().find('.ui-dialog-titlebar-close').bind('click', this.finished);

        // Fetch available members
        this.member = new Member({}, {
            cube: this.workspace.selected_cube,
            dimension: this.key
        });

		// Load template
        this.$el.find('.dialog_body')
        	.html(this.template_selection);
	},

    post_render: function(args) {
        var left = ($(window).width() - 600)/2;
        var width = $(window).width() < 600 ? $(window).width() : 600;
        $(args.modal.el).parents('.ui-dialog')
            .css({ width: width, left: 'inherit', margin: '0', height: 490 })
            .offset({ left: left});
    },

    select_date: function(event) {
    	var $currentTarget = $(event.currentTarget);
    	$currentTarget.datepicker();
    },

    save: function() {
        // Notify user that updates are in progress
        var $loading = $('<div>Saving...</div>');
        $(this.el).find('.dialog_body').children().hide();
        $(this.el).find('.dialog_body').prepend($loading);

        var hName = decodeURIComponent(this.member.hierarchy),
        	lName = decodeURIComponent(this.member.level),
        	hierarchy = this.workspace.query.helper.getHierarchy(hName);

        this.finished();
    },

    finished: function() {
    	this.$el.dialog('destroy');
    	this.$el.remove();
    	this.query.run();
    }
});