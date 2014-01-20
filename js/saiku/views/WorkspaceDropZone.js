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
        'sortstop .fields_list_body.details': 'drop_measure',
        'sortbeforestop .axis_fields': 'select_dimension',
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

    drop_measure: function(event) {
        var details = [];

        $(this.el).find('.fields_list_body.details ul.connectable li.d_measure').each( function(index, element) {
            var measure = {
                "name": $(element).find('a').attr('measure'),
                "type": $(element).find('a').attr('type')
            };
            details.push(measure);

// TODO - sync query stuff
//            $('.measure_tree li a[measure="' + measure.name + '"]').parent().draggable('disable');

        });
        this.workspace.query.helper.setMeasures(details);
        this.workspace.query.run();
        this.update_dropzones();

    },

    remove_measure_click: function(event) {
        event.preventDefault();
        var target = $(event.target).hasClass('d_measure') ?  $(event.target).find('a') :  $(event.target);
        target.parent().remove();
        
//        $(this.workspace.el).find('.measure_tree li a[measure="' + m + '"]').parent().draggable('enable');
        this.drop_measure();
    },

    remove_dimension: function(event, ui) {
        if ($(ui.helper).hasClass('d_measure')) {
                var measureName = $(ui.helper).find('a').attr('measure');
                $(ui.helper).detach();
                this.drop_measure();
            } else {
                var hierarchy = $(ui.helper).find('a').attr('hierarchy');
                var fromAxis = $(this.el).find('ul.hierarchy[hierarchy="' + hierarchy + '"]').parents('.fields_list').attr('title');
                var level =  $(ui.helper).find('a').attr('level');
                this.toggle_draggable(true);
                $(ui.helper).detach();

                this.workspace.query.helper.removeHierarchy(fromAxis, hierarchy);
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
                    }
                    var selection = $('<li class="selection"></li>');
                    selection.append(h);
                    selection.appendTo($axis.find('ul.connectable'));
                });
            }
            var measures = model.queryModel.details.measures || [];
            _.each(measures, function (measure) {
                var h = $(self.workspace.dimension_list.el).find('.measure_tree a.measure[measure="' + measure.name + '"]').parent().clone();
                h.appendTo( $(self.el).find('.fields_list_body.details ul.connectable'));
            });

            this.update_dropzones();
        }
    },

    reset_dropzones: function() {
            var self = this;
            $(self.el).find('.fields_list_body ul.connectable').empty();
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
            
            if (typeof this.workspace.query == "undefined" || this.workspace.query.helper.model().type != 'QUERYMODEL' || Settings.MODE == "view") {
                return false;
            }
            
            var $axis = $(event.target).siblings('.fields_list_body');
            var target = $axis.parent().attr('title');;

            if (target == "DETAILS") {
                this.workspace.query.helper.clearMeasures();
            } else {
                this.workspace.query.helper.clearAxis(target);
            }

/* TODO - maybe we should do this all in a synchronize? */
            this.toggle_draggable(true);
            $axis.find('.connectable').empty();
            this.update_dropzones();
/* up until here */

            this.workspace.query.run();
            return false;
    },

    toggle_draggable: function(enable) {
        var self = this;
        $(this.el).find('.fields_list_body').each(function (i, axiselement ) {
            var $axis = $(axiselement);
            if (!$axis.hasClass('details')) {
                    $axis.find('ul.hierarchy li.d_level').each( function(index, element) {
                        var hierarchy = $(element).find('a').attr('hierarchy');
                        var level = $(element).find('a').attr('level');
                        if (enable) {
                            $(self.workspace.el).find('.dimension_tree li.d_level a[hierarchy="' + hierarchy + '"][level="' + level + '"]').parent().draggable('enable');
                        } else {
                            $(self.workspace.el).find('.dimension_tree li.d_level a[hierarchy="' + hierarchy + '"][level="' + level + '"]').parent().draggable('disable');
                        }
                    });

            } else {
                $axis.find('ul.connectable li.d_measure').each( function(index, element) {
                        var measure = $(element).find('a').attr('measure');
                        if (enable) {
                            $(self.workspace.el).find('.measure_tree li.d_measure a[measure="' + measure + '"]').parent().draggable('enable');
                        } else {
                            $(self.workspace.el).find('.measure_tree li.d_measure a[measure="' + measure + '"]').parent().draggable('disable');
                        }
                    });
            }
        });
    },

    select_dimension: function(event, ui) {
        var self = this;
        
        $(self.el).find('.axis_fields ul.hierarchy').each( function(index, element) {
            $(element).find('li.temphide').show().removeClass('temphide');
        });
        
        // if we drop to remove dont execute the following
        if ( !$(ui.helper).is(':visible')) {
            //$(ui.placeholder).detach();
            this.update_dropzones();
            return;
        }
        if( $(ui.helper).hasClass('selection') ) {

            var hierarchy = ui.helper.find('ul.hierarchy').attr('hierarchy');
            var indexHierarchy = -1;
            ui.placeholder.parents('ul.connectable').find('li.selection').each( function(index, element) {
                if ( $(element).find('ul.hierarchy').attr('hierarchy') == hierarchy) {
                    indexHierarchy = index;
                }
            });

            var toAxis = ui.placeholder.parents('.axis_fields').parent().attr('title');
            var fromAxis = $(event.target).parents('.axis_fields').parent().attr('title');

            var isNew = ui.placeholder.parent().find('ul.hierarchy[hierarchy="' + hierarchy + '"]').length == 0;
            if (isNew) {
                var level = ui.helper.find('ul.hierarchy li.d_level a:visible').attr('level');
                var parent = $(self.workspace.el).find('.dimension_tree .d_hierarchy a.level[hierarchy="' + hierarchy +'"][level="' + level + '"]').parent().parent().not('.hierarchy');
                parent.children('li.hide').find('a.level[hierarchy="' + hierarchy +'"][level="' + level + '"]').parent().draggable('disable');
                this.workspace.query.helper.includeLevel(toAxis, hierarchy, level);
            } else {
                self.workspace.query.helper.moveHierarchy(fromAxis, toAxis, hierarchy, indexHierarchy);
            }

            //ui.helper.detach();
            var sel = ui.helper.clone();
            sel.removeAttr('style').removeClass('ui-draggable-dragging').removeClass('ui-sortable-helper');
            ui.item.replaceWith( sel );
            
            
            self.workspace.query.run();
            self.update_dropzones();

            return;
        }
        alert("There might be dragons! We probably need that again!");
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
