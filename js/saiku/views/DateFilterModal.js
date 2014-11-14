/*
 *   Copyright 2014 OSBI Ltd
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
		'focus #selection-date'  : 'selection_date',
		'click .selection-radio' : 'disable_divselections',
		'click .operator-radio'  : 'show_fields',
		'click #add-date'        : 'add_selected_date',
		'click .del-date'        : 'del_selected_date'
	},

	template_mdx: '{parent} CurrentDateMember([{dimension}].[{hierarchy}], \'[\"{dimension}.{hierarchy}\"]\\\.{AnalyzerDateFormat}\', EXACT)',

	template_last_mdx: '{parent} LastPeriods({periodamount}, CurrentDateMember([{dimension}].[{hierarchy}], \'[\"{dimension}.{hierarchy}\"]\\\.{AnalyzerDateFormat}\', EXACT))',

	template_selection: _.template(
		'<div class="box-selections">' +
			'<div class="selection-option">' +
				'<input type="radio" class="selection-radio" name="selection-radio" id="selection-radio-operator" level-type="TIME_DAYS" disabled>' +
			'</div>' +
			'<div class="available-selections" selection-name="operator" available="false">' +
				'<span class="i18n">Operator:</span><br>' +
				'<div class="selection-options">' +
					'<div class="form-group-selection">' +
						'<label><input type="radio" name="operator-radio" class="operator-radio op-equals" value="="> Equals</label>' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<label><input type="radio" name="operator-radio" class="operator-radio op-after" value=">"> After</label>' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<label><input type="radio" name="operator-radio" class="operator-radio op-before" value="<"> Before</label>' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<label><input type="radio" name="operator-radio" class="operator-radio op-between" value=""> Between</label><br>' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<label><input type="radio" name="operator-radio" class="operator-radio op-different" value="<>"> Different</label>' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<label><input type="radio" name="operator-radio" class="operator-radio op-after-equals" value=">="> After&Equals</label>' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<label><input type="radio" name="operator-radio" class="operator-radio op-before-equals" value="<="> Before&Equals</label>' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<label><input type="radio" name="operator-radio" class="operator-radio op-notbetween"> Not Between</label><br>' +
					'</div>' +
					'<div class="inline-form-group">' +
						'<div class="form-group" id="div-selection-date" hidden>' +
							'<label>Select a date:</label>' +
							'<input type="text" id="selection-date" placeholder="Choose a date">' +
							'<a class="form_button" id="add-date">add</a>' +
						'</div>' +
						'<div class="form-group" id="div-selected-date" hidden>' +
							'<fieldset>' +
								'<legend>Selected date:</legend>' +
								'<ul id="selected-date"></ul>' +
							'</fieldset>' +
						'</div>' +
					'</div>' +
					'<div class="form-group" id="div-select-start-date" hidden>' +
						'<label>Select a start date:</label>' +
						'<input type="text" placeholder="Choose a date">' +
					'</div>' +
					'<div class="form-group" id="div-select-end-date" hidden>' +
						'<label>Select an end date:</label>' +
						'<input type="text" placeholder="Choose a date">' +
					'</div>' +
				'</div>' +
			'</div>' +
		'</div>' +
		'<div class="box-selections">' +
			'<div class="selection-option">' +
				'<input type="radio" class="selection-radio" name="selection-radio" id="selection-radio-fixed-date">' +
			'</div>' +
			'<div class="available-selections" selection-name="fixed-date" available="false">' +
				'<span class="i18n">Fixed Date:</span><br>' +
				'<div class="selection-options">' +
					'<label><input type="radio" name="fixed-radio" id="fd-yesterday"> Yesterday</label>' +
					'<label><input type="radio" name="fixed-radio" id="fd-day"> Today</label>' +
					'<label><input type="radio" name="fixed-radio" id="fd-week"> Current Week</label>' +
					'<label><input type="radio" name="fixed-radio" id="fd-month"> Current Month</label>' +
					'<label><input type="radio" name="fixed-radio" id="fd-quarter"> Current Quarter</label><br>' +
					'<label><input type="radio" name="fixed-radio" id="fd-year"> Current Year</label>' +
				'</div>' +
			'</div>' +
		'</div>' +
		'<div class="box-selections">' +
			'<div class="selection-option">' +
				'<input type="radio" class="selection-radio" name="selection-radio" id="selection-radio-available">' +
			'</div>' +
			'<div class="available-selections" selection-name="rolling-date" available="false">' +
				'<span class="i18n">Rolling Date:</span><br>' +
				'<div class="selection-options">' +
					'<div class="form-group-selection">' +
						'<select id="">' +
							'<option value="last">Last</option>' +
							'<option value="next" disabled class="keep-disabled">Next</option>' +
						'</select>' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<input type="text" id="date-input">' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<select id="period-select">' +
							'<option name="TIME_DAYS" value="">Day(s)</option>' +
							'<option name="TIME_WEEKS" value="">Week(s)</option>' +
							'<option name="TIME_MONTHS" value="">Month(s)</option>' +
							'<option name="TIME_YEARS" value="">Year(s)</option>' +
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
		// 		'<a class="form_button">&nbsp;&gt;&nbsp;</a><br><br>' +
		// 		'<a class="form_button">&gt;&gt;</a><br><br>' +
		// 		'<a class="form_button">&lt;&lt;</a><br><br>' +
		// 		'<a class="form_button">&nbsp;&lt;&nbsp;</a>' +
		// 	'</div>' +
		// '</div>' +
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

		this.$el.find('.available-selections *').prop('disabled', true).off('click');

		// Save data of levels
		this.dataLevels = this.save_data_levels();

		// Check level type in input radio
		this.check_leveltype_radio();

		// Initialize adding values
		this.add_values_fixed_date();
		this.add_values_last_periods();
	},

	post_render: function(args) {
		var left = ($(window).width() - 600) / 2,
			width = $(window).width() < 600 ? $(window).width() : 600;
		$(args.modal.el).parents('.ui-dialog')
			.css({ width: width, left: 'inherit', margin: '0', height: 490 })
			.offset({ left: left});
	},

	check_leveltype_radio: function() {
		var self = this,
			levelType;
		this.$el.find('.selection-radio').each(function(key, radio) {
			levelType = $(radio).attr('level-type');
			_.find(self.dataLevels, function(value, key, list) {
				if (levelType === value.levelType) {
					$(radio).prop('disabled', false);
				}
			});
		});
	},

	show_fields: function(event) {
		var $currentTarget = $(event.currentTarget),
			name = $currentTarget.parent('label').text().split(' ')[1];
		switch (name) {
		case 'Equals':
		case 'Different':
			$currentTarget.closest('.selection-options').find('#div-selection-date').show();
			$currentTarget.closest('.selection-options').find('#div-selected-date').show();
			$currentTarget.closest('.selection-options').find('#div-select-start-date').hide();
			$currentTarget.closest('.selection-options').find('#div-select-end-date').hide();
			$currentTarget.closest('.selection-options').find('#add-date').show();
			break;
		case 'After':
		case 'After&Equals':
		case 'Before':
		case 'Before&Equals':
			$currentTarget.closest('.selection-options').find('#div-selection-date').show();
			$currentTarget.closest('.selection-options').find('#div-selected-date').hide();
			$currentTarget.closest('.selection-options').find('#div-select-start-date').hide();
			$currentTarget.closest('.selection-options').find('#div-select-end-date').hide();
			$currentTarget.closest('.selection-options').find('#add-date').hide();
			break;
		case 'Between':
		case 'Not':
			$currentTarget.closest('.selection-options').find('#div-selection-date').hide();
			$currentTarget.closest('.selection-options').find('#div-selected-date').hide();
			$currentTarget.closest('.selection-options').find('#div-select-start-date').show();
			$currentTarget.closest('.selection-options').find('#div-select-end-date').show();
			$currentTarget.closest('.selection-options').find('#add-date').hide();
			break;
		default:
			$currentTarget.closest('.selection-options').find('#div-selection-date').hide();
			$currentTarget.closest('.selection-options').find('#div-selected-date').hide();
			$currentTarget.closest('.selection-options').find('#div-select-start-date').hide();
			$currentTarget.closest('.selection-options').find('#div-select-end-date').hide();
			$currentTarget.closest('.selection-options').find('#add-date').hide();
		}
	},

	save_data_levels: function() {
		var dataLevels = [];
		_.each(this.data.hierarchies.levels, function(value, key, list) {
			if (list[key].annotations.AnalyzerDateFormat !== undefined) {
				dataLevels.push({
					name: list[key].name,
					analyzerDateFormat: list[key].annotations.AnalyzerDateFormat.replace(/[.]/gi, '\\\.'),
					levelType: list[key].levelType
				});
			}
		});

		return dataLevels;
	},

	add_values_fixed_date: function() {
		var self = this;
		this.$el.find('.available-selections').each(function(key, selection) {
			if ($(selection).attr('selection-name') === 'fixed-date') {
				$(selection).find('input:radio').each(function(key, radio) {
					var name = $(radio).attr('id').split('-')[1];
					_.find(self.dataLevels, function(value, key, list) {
						if (name === value.name.toLowerCase()) {
							$(radio).val(self.dataLevels[key].analyzerDateFormat);
						}
						else if (name === 'yesterday' && value.name.toLowerCase() === 'day') {
							$(radio).val(self.dataLevels[key].analyzerDateFormat);
						}
					});
				});

				$(selection).find('input:radio').each(function(key, radio) {
						if ($(radio).val() === null ||$(radio).val() === undefined ||$(radio).val() === "" || $(radio).val()=="on") {
							$(radio).addClass("keep-disabled");
						}
				});

			}
		});
	},

	add_values_last_periods: function() {
		var self = this;
		this.$el.find('.available-selections').each(function(key, selection) {
			if ($(selection).attr('selection-name') === 'rolling-date') {
				$(selection).find('#period-select > option').each(function(key, radio) {
					var name = $(radio).attr('name');
					_.find(self.dataLevels, function(value, key, list) {
						if (name === value.levelType) {
							$(radio).val(self.dataLevels[key].analyzerDateFormat);
						}

					});
				});
				$(selection).find('#period-select > option').each(function(key, radio) {
						if ($(radio).val() === null ||$(radio).val() === undefined ||$(radio).val() === "") {
							$(radio).addClass("keep-disabled");
						}
				});
			}
		});
	},

	selection_date: function(event) {
		var $currentTarget = $(event.currentTarget);
		$currentTarget.datepicker({ 
			dateFormat: 'yy-mm-dd' 
		});
	},

	disable_divselections: function(event) {
		var $currentTarget = $(event.currentTarget);
		this.$el.find('.available-selections').attr('available', false);
		this.$el.find('.available-selections *').prop('disabled', true).off('click');
		$currentTarget.closest('.box-selections').find('.available-selections').attr('available', true);
		$currentTarget.closest('.box-selections').find('.available-selections *:not(.keep-disabled)')
			.prop('disabled', false).on('click');
		$currentTarget.closest('.box-selections').find('select').each(function(key, selection){
			$(selection).find("option:not([disabled])").first().attr("selected", "selected");
		} );


	},

	add_selected_date: function(event) {
		event.preventDefault();
		var $currentTarget = $(event.currentTarget),
			sDate = this.$el.find('#selection-date'),
			selectedDate = $currentTarget.closest('.inline-form-group')
				.find('#div-selected-date').find('#selected-date');

		if (sDate.val() !== '') {
			sDate.css('border', '1px solid #ccc');
			selectedDate.append($('<li></li>').text(sDate.val())
				.append('<a href="#" class="del-date">x</a>'));
		}
		else {
			sDate.css('border', '1px solid red');
		}

		sDate.val('');
	},

	del_selected_date: function(event) {
		event.preventDefault();
		var $currentTarget = $(event.currentTarget);
		$currentTarget.parent().remove();
	},

	populate_mdx: function(logExp, fixedDateName, periodamount) {
		if(logExp.level!=undefined){
			logExp.parent = "[{dimension}].[{hierarchy}].[{level}].members,";
			logExp.parent = logExp.parent.replace(/{(\w+)}/g, function(m, p) {
				return logExp[p];
			});
		}

		this.template_mdx = this.template_mdx.replace(/{(\w+)}/g, function(m, p) {
			return logExp[p];
		});



		if(fixedDateName == 'lastperiods'){
			this.template_last_mdx = this.template_last_mdx.replace(/{(\w+)}/g, function(m, p) {
				return logExp[p];
			});

			return this.template_last_mdx;
		}
		else if (fixedDateName !== 'yesterday') {
			return this.template_mdx;
		}
		else {
			return this.template_mdx + '.lag(1)';
		}
	},

	save: function(event) {
		event.preventDefault();
		// Notify user that updates are in progress
		var $loading = $('<div>Saving...</div>');
		$(this.el).find('.dialog_body').children().hide();
		$(this.el).find('.dialog_body').prepend($loading);

		var self = this,
			fixedDateName,
			mdx,
			parentmembers,
			periodamount;

		this.$el.find('.available-selections').each(function(key, selection) {
			var analyzerDateFormat;

			if ($(selection).attr('available') === 'true') {
				if ($(selection).attr('selection-name') === 'fixed-date') {
					$(selection).find('input:radio').each(function (key, radio) {
						if ($(radio).is(":checked") === true) {
							fixedDateName = $(radio).attr('id').split('-')[1];
							analyzerDateFormat = $(radio).val();
						}
					});

				}
				else if($(selection).attr('selection-name') === 'rolling-date') {


					analyzerDateFormat = $('#period-select').find(':selected').val();
					fixedDateName = 'lastperiods';
					periodamount = $(selection).find('input:text').val();

				}

				for (var i = 0, len = self.dataLevels.length; i < len; i++) {
					if (self.dataLevels[i].analyzerDateFormat === analyzerDateFormat)
						if(self.dataLevels[i].name != self.name) {
							parentmembers = self.name;
						}
				}

				var logExp = {
					dimension: self.dimension,
					hierarchy: self.hierarchy,
					level: parentmembers,
					parent: "",
					AnalyzerDateFormat: analyzerDateFormat,
					periodamount: periodamount
				};

				mdx = self.populate_mdx(logExp, fixedDateName);
			}
		});

		var hName = decodeURIComponent(this.member.hierarchy),
			lName = decodeURIComponent(this.member.level),
			hierarchy = this.workspace.query.helper.getHierarchy(hName);

		var updates = [];

		updates.push({ mdx: mdx });

		if (hierarchy && hierarchy.levels.hasOwnProperty(lName)) {
			hierarchy.levels[lName] = { mdx: mdx, name: lName };
		}

		this.finished();
	},

	finished: function() {
		this.$el.dialog('destroy');
		this.$el.remove();
		this.query.run();
	}
});
