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
 * @dependencies
 * - models/SaikuOlapQuery.js
 * - views/DimensionList.js
 * - views/Workspace.js
 * - views/WorkspaceDropZone.js
 * - views/WorkspaceToolbar.js
 * - css/saiku/src/saiku.dropzone.css
 * - css/saiku/src/styles.css
 * - index.html
 */

/**
 * Class for calculated measure/member
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
     * @property template_modal
     * @type {String}
     * @private
     */
    template_modal: _.template(
        '<div class="cms-container-group">' +
            '<div class="calculated-measure-group">' +
                '<h4 class="i18n">Calculated Measures:</h4>' +
                '<div class="cms-box">' +
                    '<table class="cms-list measures-list">' +
                        '<%= tplCalculatedMeasures %>' +
                    '</table>' +
                '</div>' +
            '</div>' +
            '<div class="calculated-member-group">' +
                '<h4 class="i18n">Calculated Members:</h4>' +
                '<div class="cms-box">' +
                    '<table class="cms-list members-list">' +
                        '<%= tplCalculatedMembers %>' +
                    '</table>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div class="cms-container-form">' +
            '<form class="form-group-inline" data-action="cad">' +
                '<label for="cms-name" class="i18n">Name:</label>' +
                '<input type="text" id="cms-name" autofocus>' +
                '<label for="cms-measure" class="i18n">Measure:</label>' +
                '<select id="cms-measure">' +
                    '<option class="i18n" value="" selected>-- Add a measure in formula --</option>' +
                    '<% _(measures).each(function(measure) { %>' +
                        '<option value="<%= measure.uniqueName %>"><%= measure.name %></option>' +
                    '<% }); %>' +
                '</select>' +
                '<label for="<%= idEditor %>" class="i18n">Formula:</label>' +
                '<div class="formula-editor" id="<%= idEditor %>"></div>' +
                '<div class="btn-groups">' +
                    '<a class="form_button btn-math" href="#add_math_operator_formula" data-math="+">&nbsp;+&nbsp;</a>' +
                    '<a class="form_button btn-math" href="#add_math_operator_formula" data-math="-">&nbsp;-&nbsp;</a>' +
                    '<a class="form_button btn-math" href="#add_math_operator_formula" data-math="*">&nbsp;*&nbsp;</a>' +
                    '<a class="form_button btn-math" href="#add_math_operator_formula" data-math="/">&nbsp;/&nbsp;</a>' +
                    '<a class="form_button btn-math" href="#add_math_operator_formula" data-math="(">&nbsp;(&nbsp;</a>' +
                    '<a class="form_button btn-math" href="#add_math_operator_formula" data-math=")">&nbsp;)&nbsp;</a>' +
                    '<a class="form_button btn-math i18n" href="#add_math_operator_formula" data-math="and">&nbsp;and&nbsp;</a>' +
                    '<a class="form_button btn-math i18n" href="#add_math_operator_formula" data-math="or">&nbsp;or&nbsp;</a>' +
                    '<a class="form_button btn-math i18n" href="#add_math_operator_formula" data-math="not">&nbsp;not&nbsp;</a>' +
                '</div>' +
				'<div class="cms-function">' +
					'<label for="cms-function" class="i18n">Functions:</label>' +
					' <input type="button" class="form_button growthBtn" style="padding-bottom: 18px;" value="Growth"  ' +
					'         title="Calculate difference. Good to calculate previous period growth "   id="growthBtn" >  </input> ' +
					' <input type="button" class="form_button formatBtn" style="padding-bottom: 18px;" value="Format %" id="formatBtn"  ' +
					'title="Post-process step: format this view as percentage of rows, columns or grand total. " />' +
				'</div>' +
                '<label for="cms-dimension" class="i18n">Dimension:</label>' +
                '<select id="cms-dimension">' +
                    '<option class="i18n" value="" selected>-- Select an existing dimension --</option>' +
                    '<% if (measures.length > 0) { %>' +
                        '<optgroup label="<%= dataMeasures.name %>">' +
                            '<option value="<%= dataMeasures.uniqueName %>" data-type="calcmeasure"><%= dataMeasures.name %></option>' +
                        '</optgroup>' +
                    '<% } %>' +
                    '<% _(dimensions).each(function(dimension) { %>' +
                        '<optgroup label="<%= dimension.name %>">' +
                            '<% _(dimension.hierarchies).each(function(hierarchy) { %>' +
                                '<option value="<%= hierarchy.uniqueName %>" data-dimension="<%= dimension.name %>" data-type="calcmember"><%= hierarchy.name %></option>' +
                            '<% }); %>' +
                        '</optgroup>' +
                    '<% }); %>' +
                '</select>' +
                '<div class="btn-groups">' +
                    '<a class="form_button btn-parent-member" href="#add_math_operator_formula" disabled>&nbsp;Parent Member Selector&nbsp;</a>' +
                '</div>' +
                '<label for="cms-format" class="i18n">Format:</label>' +
                '<select id="cms-format">' +
                    '<option class="i18n" value="" selected>-- Select a format --</option>' +
                    '<option class="i18n" value="custom">Custom</option>' +
                    '<option class="i18n" value="#,##0.00">#,##0.00 Decimal</option>' +
                    '<option class="i18n" value="#,###">#,### Integer</option>' +
                    '<option class="i18n" value="##.##%">##.##% Decimal percentage</option>' +
                    '<option class="i18n" value="##%">##% Integer percentage</option>' +
                    '<option class="i18n" value="mmmm dd yyyy">mmmm dd yyyy Month Day Year</option>' +
                    '<option class="i18n" value="mmmm yyyy">mmmm yyyy Month Year</option>' +
                    '<option class="i18n" value="yyyy-mm-dd">yyyy-mm-dd ISO format date</option>' +
                    '<option class="i18n" value="yyyy-mm-dd hh:mi:ss">yyyy-mm-dd hh:mi:ss Date and time</option>' +
                    '<option class="i18n" value="##h ##m">##h ##m Minutes</option>' +
                '</select>' +
                '<div class="div-format-custom">' +
                    '<label for="cms-format-custom" class="i18n">Format Custom:</label>' +
                    '<input type="text" id="cms-format-custom" value="" placeholder="Add a format custom">' +
                '</div>' +
            '</form>' +
        '</div>'
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
        { text: 'Edit', method: 'save' },
        { text: 'New', method: 'new' },
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
        'click  .dialog_footer a'       : 'call',
        'blur   #cms-name'              : 'trigger_input_name',
        'change #cms-measure'           : 'add_measure_formula',
        'click  .btn-math'              : 'add_math_operator_formula',
        'change #cms-dimension'         : 'type_dimension',
        'change #cms-format'            : 'type_format',
        'click  .btn-action-edit'       : 'edit_cms',
        'click  .btn-action-del'        : 'show_del_cms',
		'click  .form_button.growthBtn' : 'openGrowthModal',
        'click  .form_button.formatBtn' : 'openFormatModal',
		'click  .btn-parent-member'     : 'open_parent_member_selector'
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
        this.options.title = 'Calculated Member';
        this.id = _.uniqueId('cms-formula-');

        var self = this;
        var cube = this.workspace.selected_cube;
        var measures = Saiku.session.sessionworkspace.cube[cube].get('data').measures;
        var dimensions = Saiku.session.sessionworkspace.cube[cube].get('data').dimensions;
        var calculatedMeasures = this.workspace.query.helper.getCalculatedMeasures();
        var calculatedMembers = this.workspace.query.helper.getCalculatedMembers();
        var $tplCalculatedMeasures = this.template_cms(calculatedMeasures, 'calcmeasure');
        var $tplCalculatedMembers = this.template_cms(calculatedMembers, 'calcmember');
        var dataMeasures = {
            name: measures ? measures[0].dimensionUniqueName.replace(/[\[\]]/gi, '') : null,
            uniqueName: measures ? measures[0].hierarchyUniqueName : null
        };

        Saiku.ui.block('<span class="i18n">Loading...</span>');

        // Load template
        this.message = this.template_modal({
            tplCalculatedMeasures: $tplCalculatedMeasures,
            tplCalculatedMembers: $tplCalculatedMembers,
            idEditor: this.id,
            measures: measures,
            dataMeasures: dataMeasures,
            dimensions: dimensions
        });

        this.bind('open', function() {
            var calcHeight = this.$el.find('.cms-container-form').height();
            this.post_render();
            this.$el.find('.dialog_footer a:nth-child(2)').hide();
            this.$el.find('.dialog_footer a:nth-child(3)').hide();
            this.$el.find('.cms-container-group').height(calcHeight);
            this.$el.find('.calculated-measure-group').height(calcHeight / 2);
            this.$el.find('.calculated-member-group').height(calcHeight / 2);
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
        var tPerc = (((($('body').height() - 570) / 2) * 100) / $('body').height());
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
        this.formulaEditor = ace.edit(this.id);
        this.formulaEditor.getSession().setMode('ace/mode/text');
        this.formulaEditor.getSession().setUseWrapMode(true);
        Saiku.ui.unblock();
    },

    /**
     * Template for add calculated measure/member
     *
     * @method template_cms
     * @private
     * @param  {Object} data Data calculated measures/members
     * @param  {String} type Type calcmeasure or calcmember
     * @return {String}      Template HTML
     */
    template_cms: function(data, type) {
        var self = this;
        var $tpl = '';

        if (data && data.length !== 0) {
            if (type === 'calcmeasure') {
                _.each(data, function(value) {
                    $tpl += 
                        '<tr class="row-cms-' + self.replace_cms(value.name) + '">' +
                            '<td class="cms-name">' + value.name + '</td>' +
                            '<td class="cms-actions">' +
                                '<a class="edit button sprite btn-action-edit" href="#edit_cms" data-name="' + value.name + '" data-type="calcmeasure"></a>' +
                                '<a class="delete button sprite btn-action-del" href="#show_del_cms" data-name="' + value.name + '" data-type="calcmeasure"></a>' +
                            '</td>' +
                        '</tr>';
                });
            }
            else {
                _.each(data, function(value) {
                    $tpl += 
                        '<tr class="row-cms-' + self.replace_cms(value.name) + '">' +
                            '<td class="cms-name">' + value.name + '</td>' +
                            '<td class="cms-actions">' +
                                '<a class="edit button sprite btn-action-edit" href="#edit_cms" data-name="' + value.name + '" data-type="calcmember"></a>' +
                                '<a class="delete button sprite btn-action-del" href="#show_del_cms" data-name="' + value.name + '" data-type="calcmember"></a>' +
                            '</td>' +
                        '</tr>';
                });
            }
        }
        else {
            if (type === 'calcmeasure') {
                $tpl = '<p class="msg-no-cms i18n">No calculated measures created</p>';
            }
            else {
                $tpl = '<p class="msg-no-cms i18n">No calculated members created</p>';    
            }
        }

        return $tpl;
    },

    /**
     * Replace a measure/member name and add a caractere "-"
     *
     * @method replace_cms
     * @private
     * @param  {String} name Measure/Member name
     * @return {String}      Measure/Member name
     * @example
     *     this.replace_cms('My Member 1');
     *     Output: My-Member-1
     */
    replace_cms: function(name) {
        name = name.replace(/\s/g, '-');
        return name;
    },

    /**
     * Edit calculated measure/member
     *
     * @method edit_cms
     * @private
     * @param {Object} event The Event interface represents any event of the DOM
     */
    edit_cms: function(event) {
        event.preventDefault();
        var self = this;
        var $currentTarget = $(event.currentTarget);
        var cms = $currentTarget.data('type') === 'calcmeasure' 
            ? this.workspace.query.helper.getCalculatedMeasures() 
            : this.workspace.query.helper.getCalculatedMembers();

        this.$el.find('.cms-actions a').removeClass('on');

        _.each(cms, function(value) {
            if (value.name === $currentTarget.data('name')) {
                $currentTarget.addClass('on');
                self.$el.find('#cms-name').val(value.name);
                self.formulaEditor.setValue(value.formula);
                self.$el.find('#cms-dimension').val(value.hierarchyName);
                if ((0 !== $('#cms-format option[value="' + value.properties.FORMAT_STRING + '"]').length) ||
                    (value.properties.FORMAT_STRING === undefined && !(0 !== $('#cms-format option[value="' + value.properties.FORMAT_STRING + '"]').length))) {
                    self.$el.find('#cms-format').val(value.properties.FORMAT_STRING);
                    self.$el.find('.div-format-custom').hide();
                }
                else {
                    self.$el.find('#cms-format').prop('selectedIndex', 1);
                    self.$el.find('.div-format-custom').show();
                    self.$el.find('#cms-format-custom').val(value.properties.FORMAT_STRING);
                }

                self.pmsUniqueName = value.properties.PMS_UNIQUENAME || '';
                self.pmsBreadcrumbs = value.properties.PMS_BREADCRUMBS || [];

                self.type_dimension();

                self.$el.find('.form-group-inline').data('action', 'edit');
                self.$el.find('.form-group-inline').data('oldcms', value.name);
            }
        });
        this.$el.find('.dialog_footer a:nth-child(1)').hide();
        this.$el.find('.dialog_footer a:nth-child(2)').show();
        this.$el.find('.dialog_footer a:nth-child(3)').show();
    },

    /**
     * show dialog to delete calculated measure/member
     *
     * @method show_del_cms
     * @private
     * @param {Object} event The Event interface represents any event of the DOM
     */
    show_del_cms: function(event) {
        event.preventDefault();
        var $currentTarget = $(event.currentTarget);
        var cmsType = $currentTarget.data('type') === 'calcmeasure' ? '<span class="i18n">measure</span>' : '<span class="i18n">member</span>';
        this.$delcms = $currentTarget;
        this.new();
        (new WarningModal({
            title: '<span class="i18n">Delete Member</span>',
            message: '<span class="i18n">You want to delete this</span> ' + cmsType + ' <b>' + $currentTarget.data('name') + '</b>?',
            okay: this.del_cms,
            okayobj: this
        })).render().open();
        this.$el.parents('.ui-dialog').find('.ui-dialog-title').text('Calculated Member');
        Saiku.i18n.translate();
    },

    /**
     * Delete calculated measure/member
     *
     * @method del_cms
     * @private
     * @param  {Object} args Object `this` of class CalculatedMemberModal
     */
    del_cms: function(args) {
        args.$delcms.parent().closest('.row-cms-' + args.replace_cms(args.$delcms.data('name'))).remove();

        if (args.$delcms.data('type') === 'calcmeasure') {
            args.workspace.query.helper.removeCalculatedMeasure(args.$delcms.data('name'));
        }
        else {
            args.workspace.query.helper.removeCalculatedMember(args.$delcms.data('name'));    
        }
        
        args.workspace.sync_query();
        args.workspace.drop_zones.set_measures();
        args.new();
        if (!args.check_len_cms(args.$delcms.data('type'))) {
            if (args.$delcms.data('type') === 'calcmeasure') {
                args.$el.find('.measures-list').append('<p class="msg-no-cms i18n">No calculated measures created</p>');
            }
            else {
                args.$el.find('.members-list').append('<p class="msg-no-cms i18n">No calculated members created</p>');
            }
        }

        Saiku.i18n.translate();
    },

    /**
     * Trigger to verify if value of input name exists in calc measures or members
     *
     * @method trigger_input_name
     * @private
     */
    trigger_input_name: function() {
        var formAction = this.$el.find('.form-group-inline').data('action');
        var name = this.$el.find('#cms-name').val();
        var dimensionDataType = this.$el.find('#cms-dimension option:selected').data('type');
        var alertMsg = '';

        if (dimensionDataType === 'calcmeasure') {
            if (this.check_name_cms(dimensionDataType, name) && formAction === 'cad') {
                alertMsg = 'Exists a measure with the same name added!';
                // this.$el.find('#cms-name').focus();
            }
        }
        else if (dimensionDataType === 'calcmember') {
            if (this.check_name_cms(dimensionDataType, name) && formAction === 'cad') {
                alertMsg = 'Exists a member with the same name added!';
                // this.$el.find('#cms-name').focus();
            }
        }
        else {
            if (this.check_name_cms(dimensionDataType, name) && formAction === 'cad') {
                alertMsg = 'Exists a measure or member with the same name added!';
                // this.$el.find('#cms-name').focus();
            }
        }

        if (alertMsg !== '') {
            alert(alertMsg);
        }
    },

    /**
     * Check if calculated measure/member exists
     *
     * @method check_name_cms
     * @private
     * @param  {String} type type Type calcmeasure or calcmember
     * @param  {String} name name Measure/Member name
     * @return {Boolean}     True/False if calculated measure/member exists
     */
    check_name_cms: function(type, name) {
        var cms = type === 'calcmeasure' 
            ? this.workspace.query.helper.getCalculatedMeasures() 
            : this.workspace.query.helper.getCalculatedMembers();

        if (type === null || type === undefined) {
            var measures = this.workspace.query.helper.getCalculatedMeasures();
            var members = this.workspace.query.helper.getCalculatedMembers();
            cms = [];
            cms = cms.concat(measures, members);
        }

        for (var i = 0; i < cms.length; i++) {
            if (cms[i].name === name) {
                return true;
            }
            else {
                return false;
            }
        }
    },


    /**
     * Check if calculated measure/member length is > 0
     *
     * @method check_len_cms
     * @private
     * @param  {String}  type Type calcmeasure or calcmember
     * @return {Boolean} True/False if calculated measure/member length is > 0
     */
    check_len_cms: function(type) {
        var cms = type === 'calcmeasure' 
            ? this.workspace.query.helper.getCalculatedMeasures() 
            : this.workspace.query.helper.getCalculatedMembers();
        if (cms.length > 0) {
            return true;
        }
        else {
            return false;
        }
    },

    /**
     * Reset form
     *
     * @method reset_form
     * @private
     */
    reset_form: function() {
        this.$el.find('#cms-name').val('');
        this.$el.find('#cms-measure').prop('selectedIndex', 0);
        this.formulaEditor.setValue('');
        this.$el.find('#cms-dimension').prop('selectedIndex', 0);
        this.$el.find('#cms-format').prop('selectedIndex', 0);
        this.$el.find('.div-format-custom').hide();
        this.$el.find('#cms-format-custom').val('');
        this.pmsUniqueName = '';
        this.pmsBreadcrumbs = [];
    },

    /**
     * Reset dropdown "Measure"
     *
     * @method reset_dropdown
     * @private
     */
    reset_dropdown: function() {
        this.$el.find('#cms-measure').prop('selectedIndex', 0);
    },

    /**
     * Add measure in formula
     *
     * @method add_measure_formula
     * @private
     * @param {Object} event The Event interface represents any event of the DOM
     */
    add_measure_formula: function(event) {
        event.preventDefault();
        var measureName = this.$el.find('#cms-measure option:selected').val();
        var formula = this.formulaEditor.getValue();
        formula = formula + measureName;
        this.formulaEditor.setValue(formula);
        this.reset_dropdown();
    },

    /**
     * Add math operator in formula
     *
     * @method add_math_operator_formula
     * @private
     * @param {Object} event The Event interface represents any event of the DOM
     */
    add_math_operator_formula: function(event) {
        event.preventDefault();
        var $currentTarget = $(event.currentTarget);
        var formula = this.formulaEditor.getValue();
        formula = formula + ' ' + $currentTarget.data('math') + ' ';
        this.formulaEditor.setValue(formula);
    },

    /**
     * Type dimension - Measure/Member
     *
     * @method type_dimension
     * @private
     * @param {Object} event The Event interface represents any event of the DOM
     */
    type_dimension: function(event) {
        if (event) { event.preventDefault(); }
        var dimensionDataType = this.$el.find('#cms-dimension option:selected').data('type');
        if (dimensionDataType === 'calcmember') {
            this.$el.find('.btn-parent-member').removeAttr('disabled');
        }
        else {
            this.$el.find('.btn-parent-member').attr('disabled', 'disabled');
        }
    },

    /**
     * Type format - Decimal, Integer, Custom etc
     *
     * @method type_format
     * @private
     * @param {Object} event The Event interface represents any event of the DOM
     */
    type_format: function(event) {
        event.preventDefault();
        var format = this.$el.find('#cms-format option:selected').val();
        if (format === 'custom') {
            this.$el.find('.div-format-custom').show();
        }
        else {
            this.$el.find('.div-format-custom').hide();
        }
    },

    /**
     * New calculated measure/member
     *
     * @method new
     * @private
     * @param {Object} event The Event interface represents any event of the DOM
     */
    new: function(event) {
        if (event) { event.preventDefault(); }
        this.$el.find('.cms-actions a').removeClass('on');
        this.$el.find('.form-group-inline').data('action', 'cad');
        this.$el.find('.form-group-inline').data('oldcms', '');
        this.$el.find('.dialog_footer a:nth-child(1)').show();
        this.$el.find('.dialog_footer a:nth-child(2)').hide();
        this.$el.find('.dialog_footer a:nth-child(3)').hide();
        this.reset_form();
    },

    openGrowthModal: function (event) {
    	var selectedHierarchies = this.workspace.query.helper.model().queryModel.axes.ROWS.hierarchies.concat(this.workspace.query.helper.model().queryModel.axes.COLUMNS.hierarchies);

    	function extractDimensionChoices(hierarchies) {
    		var dimensionNames = [];
    		_.each(hierarchies, function (hierarchy) {
    			dimensionNames.push(hierarchy.name)
    		}, this);
    		return dimensionNames;
    	}

    	var selectedDimensions = extractDimensionChoices(selectedHierarchies);
    	var cube = this.workspace.selected_cube;
    	var measures = Saiku.session.sessionworkspace.cube[cube].get('data').measures;

    	this.close();
    	(new GrowthModal({
    		workspace: this.workspace,
    		measures: measures,
    		dimensions: selectedDimensions
    	})).render().open();
    },

    openFormatModal: function (event) {
    	var selectedMeasures = this.workspace.query.helper.model().queryModel.details.measures;
    	this.close();
    	(new FormatAsPercentageModal({
    		workspace: this.workspace,
    		measures: selectedMeasures
    	})).render().open();
    },

    /**
     * Show dialog for get a parent member
     *
     * @method open_parent_member_selector
     * @private
     * @param {Object} event The Event interface represents any event of the DOM
     */
    open_parent_member_selector: function(event) {
        event.preventDefault();

        // var formAction = this.$el.find('.form-group-inline').data('action');
        var dimension = {
            txt: this.$el.find('#cms-dimension option:selected').text(),
            dataDimension: this.$el.find('#cms-dimension option:selected').data('dimension'),
            dataType: this.$el.find('#cms-dimension option:selected').data('type')
        };

        if (dimension.dataType === 'calcmember') {
            (new ParentMemberSelectorModal({
                dialog: this,
                workspace: this.workspace,
                cube: this.workspace.selected_cube,
                dimensions: Saiku.session.sessionworkspace.cube[this.workspace.selected_cube].get('data').dimensions,
                dimension: dimension.dataDimension,
                hierarchy: dimension.txt,
                uniqueName: this.pmsUniqueName,
                breadcrumbs: this.pmsBreadcrumbs
            })).render().open();

            this.$el.parents('.ui-dialog').find('.ui-dialog-title').text('Connection Details');
        }
    },

    /**
     * Save calculated member
     *
     * @method save
     * @private
     * @param {Object} event The Event interface represents any event of the DOM
     */
    save: function(event) {
        event.preventDefault();
        var $currentTarget = $(event.currentTarget);
        var nameOld = this.$el.find('.form-group-inline').data('oldcms');
        var name = this.$el.find('#cms-name').val();
        var formula = this.formulaEditor.getValue();
        var dimension = {
            val: this.$el.find('#cms-dimension option:selected').val(),
            txt: this.$el.find('#cms-dimension option:selected').text(),
            dataDimension: this.$el.find('#cms-dimension option:selected').data('dimension'),
            dataType: this.$el.find('#cms-dimension option:selected').data('type')
        };
        var format = this.$el.find('#cms-format option:selected').val();
        var formAction = this.$el.find('.form-group-inline').data('action');
        var alertMsg = '';
        var objMember;

        if (format === 'custom') {
            format = this.$el.find('#cms-format-custom').val();
        }
        else {
            format = this.$el.find('#cms-format option:selected').val();
        }

        if (typeof name === 'undefined' || name === '' || !name) {
            alertMsg += 'You have to enter a name for the member! ';
        }
        if (typeof formula === 'undefined' || formula === '' || !formula) {
            alertMsg += 'You have to enter a MDX formula for the calculated member! ';
        }
        if (typeof dimension.val === 'undefined' || dimension.val === '' || !dimension.val) {
            alertMsg += 'You have to choose a dimension for the calculated member! ';
        }
        if (alertMsg !== '') {
            alert(alertMsg);
        } 
        else {
            if (dimension.dataType === 'calcmeasure') {
                objMember = { 
                    name: name,
                    formula: formula, 
                    properties: {}, 
                    uniqueName: name, 
                    hierarchyName: dimension.val
                };
                
                if (format) {
                    objMember.properties.FORMAT_STRING = format;
                }

                if (formAction === 'cad') {
                    this.workspace.query.helper.addCalculatedMeasure(objMember);
                    this.workspace.sync_query();
                }
                else {
                    this.workspace.query.helper.editCalculatedMeasure(nameOld, objMember);
                    this.workspace.sync_query();
                    this.workspace.drop_zones.set_measures();
                }
            }
            else {
                objMember = { 
                    name: name,
                    dimension: dimension.dataDimension,
                    uniqueName: '[' + dimension.txt + '].[' + name + ']',
                    caption: name,
                    properties: {},
                    formula: formula,
                    hierarchyName: dimension.val
                };
                
                if (format) {
                    objMember.properties.FORMAT_STRING = format;
                }
                
                if (this.pmsUniqueName && !(_.isEmpty(this.pmsUniqueName))) {
                    objMember.properties.PMS_UNIQUENAME = this.pmsUniqueName;
                    objMember.properties.PMS_BREADCRUMBS = this.pmsBreadcrumbs;
                }

                if (formAction === 'cad') {
                    this.workspace.query.helper.addCalculatedMember(objMember);
                    this.workspace.sync_query();
                }
                else {
                    this.workspace.query.helper.removeLevelCalculatedMember(dimension.val, '[' + dimension.txt + '].[' + nameOld + ']');
                    this.workspace.query.helper.editCalculatedMember(nameOld, objMember);
                    this.workspace.sync_query();
                    this.workspace.drop_zones.set_measures();
                }
            }

            this.$el.dialog('close');
        }
    }
});
