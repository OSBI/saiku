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
                '<h4>Calculated Measures:</h4>' +
                '<div class="cms-box">' +
                    '<table class="cms-list measures-list">' +
                        '<%= tplCalculatedMeasures %>' +
                    '</table>' +
                '</div>' +
            '</div>' +
            '<div class="calculated-member-group">' +
                '<h4>Calculated Members:</h4>' +
                '<div class="cms-box">' +
                    '<table class="cms-list members-list">' +
                        '<%= tplCalculatedMembers %>' +
                    '</table>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div class="cms-container-form">' +
            '<form class="form-group-inline" data-action="cad">' +
                '<label for="cms-name">Name:</label>' +
                '<input type="text" id="cms-name" autofocus>' +
                '<label for="cms-measure">Measure:</label>' +
                '<select id="cms-measure">' +
                    '<option value="" selected>-- Add a measure in formula --</option>' +
                    '<% _(measures).each(function(measure) { %>' +
                        '<option value="<%= measure.uniqueName %>"><%= measure.name %></option>' +
                    '<% }); %>' +
                '</select>' +
                '<label for="<%= idEditor %>">Formula:</label>' +
                '<div class="formula-editor" id="<%= idEditor %>"></div>' +
                '<div class="btn-group-math">' +
                    '<a class="form_button btn-math" href="#add_math_operator_formula" data-math="+">&nbsp;+&nbsp;</a>' +
                    '<a class="form_button btn-math" href="#add_math_operator_formula" data-math="-">&nbsp;-&nbsp;</a>' +
                    '<a class="form_button btn-math" href="#add_math_operator_formula" data-math="*">&nbsp;*&nbsp;</a>' +
                    '<a class="form_button btn-math" href="#add_math_operator_formula" data-math="/">&nbsp;/&nbsp;</a>' +
                    '<a class="form_button btn-math" href="#add_math_operator_formula" data-math="(">&nbsp;(&nbsp;</a>' +
                    '<a class="form_button btn-math" href="#add_math_operator_formula" data-math=")">&nbsp;)&nbsp;</a>' +
                    '<a class="form_button btn-math" href="#add_math_operator_formula" data-math="and">&nbsp;and&nbsp;</a>' +
                    '<a class="form_button btn-math" href="#add_math_operator_formula" data-math="or">&nbsp;or&nbsp;</a>' +
                    '<a class="form_button btn-math" href="#add_math_operator_formula" data-math="not">&nbsp;not&nbsp;</a>' +
                '</div>' +
                '<label for="cms-dimension">Dimension:</label>' +
                '<select id="cms-dimension">' +
                    '<option value="" selected>-- Select an existing dimension --</option>' +
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
                '<label for="cms-format">Format:</label>' +
                '<select id="cms-format">' +
                    '<option value="" selected>-- Select a format --</option>' +
                    '<option value="custom">Custom</option>' +
                    '<option value="#,##0.00">#,##0.00 Decimal</option>' +
                    '<option value="#,###">#,### Integer</option>' +
                    '<option value="##.##%">##.##% Decimal percentage</option>' +
                    '<option value="##%">##% Interger percentage</option>' +
                    '<option value="mmmm dd yyyy">mmmm dd yyyy Month Day Year</option>' +
                    '<option value="mmmm yyyy">mmmm yyyy Month Year</option>' +
                    '<option value="yyyy-mm-dd">yyyy-mm-dd ISO format date</option>' +
                    '<option value="yyyy-mm-dd hh:mi:ss">yyyy-mm-dd hh:mi:ss Date and time</option>' +
                    '<option value="##h ##m">##h ##m Minutes</option>' +
                '</select>' +
                '<div class="div-format-custom">' +
                    '<label for="cms-format-custom">Format Custom:</label>' +
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
        'click  .dialog_footer a' : 'call',
        'change #cms-measure'     : 'add_measure_formula',
        'click  .btn-math'        : 'add_math_operator_formula',
        'change #cms-format'      : 'type_format',
        'click  .btn-action-edit' : 'edit_cms',
        'click  .btn-action-del'  : 'show_del_cms'
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
        this.dataMeasures = {
            name: measures ? measures[0].dimensionUniqueName.replace(/[\[\]]/gi, '') : null,
            uniqueName: measures ? measures[0].hierarchyUniqueName : null
        };

        // console.log(this.workspace.query.helper);
        // console.log(JSON.stringify(this.workspace.query.helper.query.model));
        // console.log(Saiku.session.sessionworkspace.cube[cube]);
        // console.log(this.dataMeasures);

        // Load template
        this.message = this.template_modal({
            tplCalculatedMeasures: $tplCalculatedMeasures,
            tplCalculatedMembers: $tplCalculatedMembers,
            idEditor: this.id,
            measures: measures,
            dataMeasures: this.dataMeasures,
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
        var tPerc = (((($('body').height() - 500) / 2) * 100) / $('body').height());
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
                $tpl = '<p class="msg-no-cms">No calculated measures created</p>';
            }
            else {
                $tpl = '<p class="msg-no-cms">No calculated members created</p>';    
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
        var cmsType = $currentTarget.data('type') === 'calcmeasure' ? 'Measure' : 'Member';
        this.$delcms = $currentTarget;
        this.new();
        (new WarningModal({
            title: 'Delete Member',
            message: 'You want to delete this Calculated ' + cmsType + ' <b>' + $currentTarget.data('name') + '</b>?',
            okay: this.del_cms,
            okayobj: this
        })).render().open();
        this.$el.parents('.ui-dialog').find('.ui-dialog-title').text('Calculated Member');
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
        if (!args.is_cms(args.$delcms.data('type'))) {
            if (args.$delcms.data('type') === 'calcmeasure') {
                args.$el.find('.measures-list').append('<p class="msg-no-cms">No calculated measures created</p>');
            }
            else {
                args.$el.find('.members-list').append('<p class="msg-no-cms">No calculated members created</p>');
            }
        }
    },

    /**
     * Check if calculated measure/member exists
     *
     * @method is_cms
     * @private
     * @param  {String}  type Type calcmeasure or calcmember
     * @return {Boolean} True/False if calculated measure/member exists
     */
    is_cms: function(type) {
        var calculatedMembers = type === 'calcmeasure' 
            ? this.workspace.query.helper.getCalculatedMeasures() 
            : this.workspace.query.helper.getCalculatedMembers();
        if (calculatedMembers.length > 0) {
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
        var cmsNameOld = this.$el.find('.form-group-inline').data('oldcms');
        var cmsName = this.$el.find('#cms-name').val();
        var cmsFormula = this.formulaEditor.getValue();
        var cmsDimension = {
            val: this.$el.find('#cms-dimension option:selected').val(),
            txt: this.$el.find('#cms-dimension option:selected').text(),
            dataDimension: this.$el.find('#cms-dimension option:selected').data('dimension'),
            dataType: this.$el.find('#cms-dimension option:selected').data('type')
        };
        var cmsFormat = this.$el.find('#cms-format option:selected').val();
        var formAction = this.$el.find('.form-group-inline').data('action');
        var alertMsg = '';
        var objMember;

        if (cmsFormat === 'custom') {
            cmsFormat = this.$el.find('#cms-format-custom').val();
        }
        else {
            cmsFormat = this.$el.find('#cms-format option:selected').val();
        }

        if (typeof cmsName === 'undefined' || cmsName === '' || !cmsName) {
            alertMsg += 'You have to enter a name for the member! ';
        }
        if (typeof cmsFormula === 'undefined' || cmsFormula === '' || !cmsFormula) {
            alertMsg += 'You have to enter a MDX formula for the calculated member! ';
        }
        if (typeof cmsDimension.val === 'undefined' || cmsDimension.val === '' || !cmsDimension.val) {
            alertMsg += 'You have to choose a dimension for the calculated member! ';
        }
        if (alertMsg !== '') {
            alert(alertMsg);
        } 
        else {
            if (cmsDimension.dataType === 'calcmeasure') {
                if (formAction === 'cad') {
                    objMember = { 
                        name: cmsName,
                        formula: cmsFormula, 
                        properties: {}, 
                        uniqueName: cmsName, 
                        hierarchyName: cmsDimension.val
                    };
                    
                    if (cmsFormat) {
                        objMember.properties.FORMAT_STRING = cmsFormat;
                    }

                    this.workspace.query.helper.addCalculatedMeasure(objMember);
                    this.workspace.sync_query();
                }
                else {
                    objMember = { 
                        name: cmsName,
                        formula: cmsFormula, 
                        properties: {}, 
                        uniqueName: cmsName, 
                        hierarchyName: cmsDimension.val
                    };
                    
                    if (cmsFormat) {
                        objMember.properties.FORMAT_STRING = cmsFormat;
                    }

                    this.workspace.query.helper.editCalculatedMeasure(cmsNameOld, objMember);
                    this.workspace.sync_query();
                    this.workspace.drop_zones.set_measures();
                }
            }
            else {
                if (formAction === 'cad') {
                    objMember = { 
                        name: cmsName,
                        dimension: cmsDimension.dataDimension,
                        uniqueName: '[' + cmsDimension.txt + '].[' + cmsName + ']',
                        caption: cmsName,
                        properties: {},
                        formula: cmsFormula,
                        hierarchyName: cmsDimension.val
                    };
                    
                    if (cmsFormat) {
                        objMember.properties.FORMAT_STRING = cmsFormat;
                    }

                    this.workspace.query.helper.addCalculatedMember(objMember);
                    this.workspace.sync_query();
                }
                else {
                    objMember = { 
                        name: cmsName,
                        dimension: cmsDimension.dataDimension,
                        uniqueName: '[' + cmsDimension.txt + '].[' + cmsName + ']',
                        caption: cmsName,
                        properties: {},
                        formula: cmsFormula,
                        hierarchyName: cmsDimension.val
                    };
                    
                    if (cmsFormat) {
                        objMember.properties.FORMAT_STRING = cmsFormat;
                    }

                    this.workspace.query.helper.editCalculatedMember(cmsNameOld, objMember);
                    this.workspace.sync_query();
                    this.workspace.drop_zones.set_measures();
                }
            }

            this.$el.dialog('close');
        }
    }
});