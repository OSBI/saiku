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
 * Sets up workspace drop zones for DnD and other interaction
 */
var WorkspaceDropZone = Backbone.View.extend({

    template: function() {
        var template = $("#template-workspace-dropzones").html() || "";
        return _.template(template)();
    },
    
    events: {
        'sortstop .fields_list_body.details': 'set_measures',
        'sortstop .axis_fields': 'select_dimension',
        'click .d_measure' : 'remove_measure_click',
        'click .d_level': 'selections',
//        'click .d_measure span.sort' : 'sort_measure',
        'click .clear_axis' : 'clear_axis'
    },
    
    initialize: function(args) {
        // Keep track of parent workspace
        this.workspace = args.workspace;
        
        // Maintain `this` in jQuery event handlers
        _.bindAll(this, "clear_axis");
    },
    
    render: function() {
        var self = this;
        // Generate drop zones from template
        $(this.el).html(this.template());

        // Activate drop zones
        $(this.el).find('.fields_list_body.details ul.connectable').sortable({
            items:          '> li',
            opacity:        0.60,
            placeholder:    'placeholder',
            tolerance:      'pointer',
            containment:    $(self.workspace.el),
            start:          function(event, ui) {
                ui.placeholder.text(ui.helper.text());
            }
        });

        $(this.el).find('.axis_fields ul.connectable').sortable({
            connectWith: $(self.el).find('.axis_fields ul.connectable'),
            forcePlaceholderSize:   false,
            forceHelperSize:        true,
            items:                  'li.selection',
            opacity:                0.60,
            placeholder:            'placeholder',
            tolerance:              'touch',
            cursorAt:               { top: 10, left: 60 },
            containment:            $(self.workspace.el),
            start:                  function(event, ui) {
                    var hierarchy = $(ui.helper).find('a').parent().parent().attr('hierarchycaption');
                    ui.placeholder.text(hierarchy);
                    $(ui.helper).css({ width: "auto", height: "auto"});
                    $(self.el).find('.axis_fields ul.hierarchy li.d_level:visible').addClass('temphide').hide();
            }
        });
        
        return this; 
    },

    set_measures: function(event, ui) {
        var details = [];

        $(this.el).find('.fields_list_body.details ul.connectable li.d_measure').each( function(index, element) {
            var measure = {
                "name": $(element).find('a').attr('measure'),
                "type": $(element).find('a').attr('type')
            };
            details.push(measure);
        });
        this.workspace.query.helper.setMeasures(details);
        this.workspace.sync_query();
        this.workspace.query.run();
    },

    remove_measure_click: function(event) {
        event.preventDefault();
        var target = $(event.target).hasClass('d_measure') ?  $(event.target).find('a') :  $(event.target);
        target.parent().remove();
        this.set_measures();
    },

    remove_dimension: function(event, ui) {
        if ($(ui.helper).hasClass('d_measure')) {
                $(ui.helper).detach();
                this.set_measures();
            } else {
                var hierarchy = $(ui.helper).find('a').attr('hierarchy');
                var fromAxis = $(this.el).find('ul.hierarchy[hierarchy="' + hierarchy + '"]').parents('.fields_list').attr('title');
                var level =  $(ui.helper).find('a').attr('level');
                this.workspace.query.helper.removeHierarchy(hierarchy);
                this.workspace.sync_query();
                this.workspace.query.run();
        }
    },


    synchronize_query: function() {
        var self = this;
        this.reset_dropzones();

        var model = this.workspace.query.helper.model();

        if (model.hasOwnProperty('queryModel') && model.queryModel.hasOwnProperty('axes')) {
            var axes = model.queryModel.axes;
            for (var axis in axes) {
                var $axis = $(self.el).find('.fields_list[title="' + axis + '"]');
                _.each(axes[axis].hierarchies, function(hierarchy) {
                    var h = $(self.workspace.dimension_list.el).find('ul.d_hierarchy[hierarchy="' + hierarchy.name + '"]').clone().removeClass('d_hierarchy').addClass('hierarchy');
                    h.find('li.d_level').hide();
                    for (var level in hierarchy.levels) {
                        h.find('li a[level="' + level + '"]').parent().show();

                        // sync attribute list
                        $(self.workspace.dimension_list.el).find('ul.d_hierarchy[hierarchy="' + hierarchy.name + '"] li a[level="' + level + '"]').parent()
                                .draggable('disable')
                                .parents('.parent_dimension')
                                .find('.folder_collapsed')
                                .addClass('selected');


                    }
                    var selection = $('<li class="selection"></li>');
                    selection.append(h);
                    selection.appendTo($axis.find('ul.connectable'));
                });
            }
            var measures = model.queryModel.details.measures || [];
            _.each(measures, function (measure) {
                var m = $(self.workspace.dimension_list.el).find('.measure_tree a.measure[measure="' + measure.name + '"]').parent();
                var m2 = m.clone();
                m2.appendTo( $(self.el).find('.fields_list_body.details ul.connectable'));

                m.draggable('disable');
            });

            this.update_dropzones();
        }
    },

    reset_dropzones: function() {
            var self = this;
            $(self.el).find('.fields_list_body ul.connectable').find('li.selection, li.d_measure').remove();
            $(self.workspace.dimension_list.el).find('li.ui-draggable-disabled').draggable('enable');
            $(self.el).find('.fields_list[title="ROWS"] .limit').removeClass('on');
            $(self.el).find('.fields_list[title="COLUMNS"] .limit').removeClass('on');
            $(this.workspace.el).find('.fields_list_body .clear_axis').addClass('hide');

    },

    update_dropzones: function() {
        $(this.workspace.el).find('.fields_list_body').each(function(idx, ael) {
            var $axis = $(ael);
            if ($axis.find('ul.connectable li.selection, ul.connectable li.d_measure').length == 0) {
                $axis.siblings('.clear_axis').addClass('hide');
            } else {
                $axis.siblings('.clear_axis').removeClass('hide');
            }
        });


    },
    
    clear_axis: function(event) {
            var self = this;
            event.preventDefault();
            var axis = $(event.target).siblings('.fields_list_body').parent().attr('title');
            if (axis == "DETAILS") {
                this.workspace.query.helper.clearMeasures();
            } else {
                this.workspace.query.helper.clearAxis(axis);
            }
            
            this.workspace.sync_query();
            this.workspace.query.run();
            return false;
    },



    select_dimension: function(event, ui) {
        var self = this;
        // if we drop to remove dont execute the following
        
        if ( false || $(ui.item).is(':visible')) {
            $(self.el).find('.axis_fields ul.hierarchy').each( function(index, element) {
                $(element).find('li.temphide').show().removeClass('temphide');
            });

            var hierarchy = ui.item.find('.level').attr('hierarchy');
            var indexHierarchy = -1;
            ui.item.parents('ul.connectable').find('li.selection').each( function(index, element) {
                if ( $(element).find('ul.hierarchy').attr('hierarchy') == hierarchy) {
                    indexHierarchy = index;
                }
            });

            var toAxis = ui.item.parents('.axis_fields').parent().attr('title');
            var fromAxis = $(event.target).parents('.axis_fields').parent().attr('title');
            var isNew = ui.item.hasClass('d_level');
            if (isNew) {
                var level = ui.item.find('a.level').attr('level');
                this.workspace.query.helper.includeLevel(toAxis, hierarchy, level, indexHierarchy);
            } else {
                self.workspace.query.helper.moveHierarchy(fromAxis, toAxis, hierarchy, indexHierarchy);
            }
            
            $(ui.item).detach();
            this.workspace.sync_query();
            self.workspace.query.run();
            return;
        }
        return;
    },
    
    selections: function(event, ui) {
        if (event) {
            event.preventDefault();
        }
        // Determine dimension
        var $target = $(event.target).hasClass('d_level') ?
            $(event.target).find('.level') :
            $(event.target);
        var key = $target.attr('href').replace('#', '');
        
        // Launch selections dialog
        (new SelectionsModal({
            target: $target,
            name: $target.text(),
            key: key,
            workspace: this.workspace
        })).open();
        
        return false;
    }
});
