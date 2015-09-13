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
     * @property template_modal
     * @type {String}
     * @private
     */
    template_modal: _.template(
        '<div class="calculated-member-group">' +
            '<ul class="members-list">' +
                '<li class="members-box">' +
                    '<table>' +
                        '<tr>' +
                            '<td class="member-name">Attributes 1</td>' +
                            '<td class="member-actions">' +
                               '<a class="btn-action" href="#">edit</a>' +
                               '<a class="btn-action" href="#">del</a>' +
                            '</td>' +
                        '</tr>' +
                    '</table>' +
                '</li>' +
            '</ul>' +
        '</div>' +
        '<div class="calculated-member-form">' +
            '<form class="form-group-inline">' +
                '<label for="member-name">Name:</label>' +
                '<input type="text" id="member-name" autofocus>' +
                '<label for="member-measure">Measure:</label>' +
                '<select id="member-measure">' +
                    // '<option value="" selected>-- Select an existing measure --</option>' +
                    '<option value="" selected>-- Add a measure in formula --</option>' +
                    '<% _(measures).each(function(measure) { %>' +
                        '<option value="<%= measure.uniqueName %>"><%= measure.name %></option>' +
                    '<% }); %>' +
                '</select>' +
                '<label for="<%= idEditor %>">Formula:</label>' +
                '<div class="formula-editor" id="<%= idEditor %>"></div>' +
                '<div class="btn-group-math">' +
                    '<a class="form_button btn-math" href="#add_math_operator" data-math="+">&nbsp;+&nbsp;</a>' +
                    '<a class="form_button btn-math" href="#add_math_operator" data-math="-">&nbsp;-&nbsp;</a>' +
                    '<a class="form_button btn-math" href="#add_math_operator" data-math="*">&nbsp;*&nbsp;</a>' +
                    '<a class="form_button btn-math" href="#add_math_operator" data-math="/">&nbsp;/&nbsp;</a>' +
                    '<a class="form_button btn-math" href="#add_math_operator" data-math="(">&nbsp;(&nbsp;</a>' +
                    '<a class="form_button btn-math" href="#add_math_operator" data-math=")">&nbsp;)&nbsp;</a>' +
                    '<a class="form_button btn-math" href="#add_math_operator" data-math="and">&nbsp;and&nbsp;</a>' +
                    '<a class="form_button btn-math" href="#add_math_operator" data-math="or">&nbsp;or&nbsp;</a>' +
                    '<a class="form_button btn-math" href="#add_math_operator" data-math="not">&nbsp;not&nbsp;</a>' +
                '</div>' +
                '<label for="member-dimension">Dimension:</label>' +
                '<select id="member-dimension">' +
                    '<option value="" selected>-- Select an existing dimension --</option>' +
                    '<% _(dimensions).each(function(dimension) { %>' +
                        '<option value="<%= dimension.uniqueName %>"><%= dimension.name %></option>' +
                    '<% }); %>' +
                '</select>' +
                '<label for="member-format">Format:</label>' +
                // '<input type="text" id="member-format" value="#,##0.00">' +
                '<select id="member-format">' +
                    '<option value="custom">Custom</option>' +
                    '<option value="#,##0.00" selected>#,##0.00 Decimal</option>' +
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
                    '<label for="member-format-custom">Format Custom:</label>' +
                    '<input type="text" id="member-format-custom" value="" placeholder="Add a format custom">' +
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
        'click  .dialog_footer a' : 'call',
        'change #member-measure'  : 'add_measure',
        'click  .btn-math'        : 'add_math_operator',
        'change #member-format'   : 'type_format'
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
        var self = this;
        var cube = this.workspace.selected_cube;
        var measures = Saiku.session.sessionworkspace.cube[cube].get('data').measures;
        var dimensions = Saiku.session.sessionworkspace.cube[cube].get('data').dimensions;

        // console.log(cube);
        // console.log(measures);
        // console.log(dimensions);
        console.log(Saiku.session.sessionworkspace.cube[cube].get('data'));

        this.options.title = 'Calculated Member';
        this.id = _.uniqueId('member-formula-');

        // Load template
        this.message = this.template_modal({
            measures: measures,
            idEditor: this.id,
            dimensions: dimensions
        });

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

    add_measure: function(event) {
        event.preventDefault();
        var measureName = this.$el.find('#member-measure option:selected').val();
        var formula = this.formulaEditor.getValue();
        formula = formula + measureName;
        this.formulaEditor.setValue(formula);
        this.reset_dropdown();
    },

    add_math_operator: function(event) {
        event.preventDefault();
        var $currentTarget = $(event.currentTarget);
        var formula = this.formulaEditor.getValue();
        formula = formula + ' ' + $currentTarget.data('math') + ' ';
        this.formulaEditor.setValue(formula);
    },

    reset_dropdown: function () {
        this.$el.find('#member-measure').prop('selectedIndex', 0);
    },

    type_format: function(event) {
        event.preventDefault();
        var format = this.$el.find('#member-format option:selected').val();
        if (format === 'custom') {
            this.$el.find('.div-format-custom').show();
            // this.memberFormat = this.$el.find('#member-format-custom').val();
        }
        else {
            this.$el.find('.div-format-custom').hide();
            // this.memberFormat = this.$el.find('#member-format option:selected').val();
        }
    },

    // save: function (event) {
    //     event.preventDefault();
    //     var self = this;
    //     var measure_name = $(this.el).find('.measure_name').val();
    //     var measure_formula = $(this.el).find('.measureFormula').val();
    //     var measure_format = $(this.el).find('.measure_format').val();


    //     var alert_msg = "";
    //     if (typeof measure_name == "undefined" || !measure_name) {
    //         alert_msg += "You have to enter a name for the measure! ";
    //     }
    //     if (typeof measure_formula == "undefined" || !measure_formula || measure_formula === "") {
    //         alert_msg += "You have to enter a MDX formula for the calculated measure! ";
    //     }
    //     if (alert_msg !== "") {
    //         alert(alert_msg);
    //     } else {
    //         var m = { name: measure_name, formula: measure_formula, properties: {}, uniqueName: "[Measures]." + measure_name };
    //         if (measure_format) {
    //             m.properties.FORMAT_STRING = measure_format;
    //         }
    //         self.workspace.query.helper.addCalculatedMeasure(m);
    //         self.workspace.sync_query();
    //         this.close();
    //     }

    //     return false;
    // },

    save: function(event) {
        event.preventDefault();
        var memberName = this.$el.find('#member-name').val();
        var memberFormula = this.formulaEditor.getValue();
        var memberDimension = this.$el.find('#member-dimension option:selected').val();
        var memberFormat = this.$el.find('#member-format option:selected').val();
        var alertMsg = '';
        var objMeasure;

        console.log(memberName);
        console.log(memberFormula);
        console.log(memberDimension);
        console.log(memberFormat);

        if (memberFormat === 'custom') {
            memberFormat = this.$el.find('#member-format-custom').val();
        }
        else {
            memberFormat = this.$el.find('#member-format option:selected').val();
        }

        if (typeof memberName === 'undefined' || !memberName) {
            alertMsg += 'You have to enter a name for the measure!';
        }
        if (typeof memberFormula === 'undefined' || memberFormula === '' || !memberFormula) {
            alertMsg += 'You have to enter a MDX formula for the calculated measure!';
        }
        if (alertMsg !== '') {
            alert(alertMsg);
        } 
        else {
            objMeasure = { 
                name: memberName, 
                formula: memberFormula, 
                properties: {}, 
                uniqueName: '[Measures].' + memberName 
            };
            
            if (memberFormat) {
                objMeasure.properties.FORMAT_STRING = memberFormat;
            }

            this.workspace.query.helper.addCalculatedMeasure(objMeasure);
            this.workspace.sync_query();
            this.$el.dialog('close');
        }
    }
});