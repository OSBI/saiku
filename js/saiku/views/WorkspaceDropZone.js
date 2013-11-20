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
        'sortstop .fields_list_body.details': 'select_measure',
        'sortbeforestop .axis_fields': 'select_dimension',
        'click .d_measure a' : 'remove_measure_click',
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
//            forcePlaceholderSize: true,
//            forceHelperSize: true,
            items: '> li',
            opacity: 0.60,
            placeholder: 'placeholder',
            tolerance: 'pointer',
            start: function(event, ui) {
                ui.placeholder.text(ui.helper.text());
            }
        });
        
        $(this.el).find('.axis_fields ul.connectable').sortable({
            connectWith: $(this.el).find('.axis_fields ul.connectable'),
            forcePlaceholderSize: false,
            forceHelperSize: false,
            items: 'li.selection',
            opacity: 0.60,
            placeholder: 'placeholder',
            tolerance: 'touch',
            //cursorAt: { top: 10, left: 10 },
            start: function(event, ui) {
                var hierarchy = $(ui.helper).find('a').parent().parent().attr('hierarchycaption');
                ui.placeholder.text(hierarchy);
                $(ui.helper).css({ width: "auto"});
                
                /*
                $(self.el).find('.axis_fields ul.hierarchy').each( function(index, element) {
                    $(element).find('li.d_level').hide();
                    var group = $(element).attr('hierarchy');
                    $('<li class="d_group d_level">' + group + "</li>").appendTo( $(element) );    
                });
                $(ui.helper).find('li.d_level').hide();
                $('<li class="d_group d_level">' + hierarchy + "</li>").appendTo(ui.helper.find('ul'));
                */
            }
        });
        
        return this; 
    },

    select_measure: function(event) {
        var details = [];

        $(this.el).find('.fields_list_body.details ul.connectable li.d_measure').each( function(index, element) {
            var measure = {
                "name": $(element).find('a').attr('measure'),
                "type": $(element).find('a').attr('type')
            };
            details.push(measure);

            $('.measure_tree li a[measure="' + measure.name + '"]').parent().draggable('disable');

        });
        this.workspace.query.helper.setMeasures(details);
        this.workspace.query.run();
        this.update_dropzones();

    },

    remove_measure_click: function(event) {
        var m = $(event.target).attr('measure');
        $(event.target).parent().remove();
        event.preventDefault();
        this.remove_measure(m);
        this.update_dropzones();
    },

    remove_measure: function(m) {
        $(this.workspace.el).find('.measure_tree li a[measure="' + m + '"]').parent().draggable('enable');
        this.select_measure();
    },

    update_dropzones: function() {
        $(this.workspace.el).find('.fields_list_body').each(function(idx, ael) {
            var $axis = $(ael);
            if ($axis.find('ul.connectable li').length == 0) {
                $axis.siblings('.clear_axis').addClass('hide');
            } else {
                $axis.siblings('.clear_axis').removeClass('hide');
            }
        });


    },
    
    clear_axis: function(event) {
            var self = this;
            
            if (typeof this.workspace.query == "undefined") {
                return false;
            }
            if (this.workspace.query.helper.model().type != 'QUERYMODEL' || Settings.MODE == "view") {
                return false;
            }
            var $target =  $(event.target);
            var $axis = $target.siblings('.fields_list_body');
            var source = "";
            var target = "";
            if ($axis.hasClass('rows')) { target = "ROWS";  }
            if ($axis.hasClass('columns')) { target = "COLUMNS";  }
            if ($axis.hasClass('filter')) { target = "FILTER";  }
            

            if ($axis.hasClass('details')) {
                this.workspace.query.helper.clearMeasures();
            } else {
                this.workspace.query.helper.clearAxis(target);
            }

/* TODO - maybe we should do this all in a synchronize? */
            $axis.find('ul.hierarchy li.d_level').each( function(index, element) {
                var hierarchy = $(element).find('a').attr('hierarchy');
                var level = $(element).find('a').attr('level');
                $(self.workspace.el).find('.dimension_tree li.d_level a[hierarchy="' + hierarchy + '"][level="' + level + '"]').parent().draggable('enable');
            });
            if (!$axis.hasClass('details')) {
                    $axis.find('ul.hierarchy li.d_level').each( function(index, element) {
                        var hierarchy = $(element).find('a').attr('hierarchy');
                        var level = $(element).find('a').attr('level');
                        $(self.workspace.el).find('.dimension_tree li.d_level a[hierarchy="' + hierarchy + '"][level="' + level + '"]').parent().draggable('enable');
                    });

            } else {
                $axis.find('ul.connectable li.d_measure').each( function(index, element) {
                        var measure = $(element).find('a').attr('measure');
                        
                        $(self.workspace.el).find('.measure_tree li.d_measure a[measure="' + measure + '"]').parent().draggable('enable');
                    });
            }

            $axis.find('.connectable').empty();
/* up until here */

            this.workspace.query.run();
            this.update_dropzones();
            event.preventDefault();
            return false;
    },

    select_dimension: function(event, ui) {
        var self = this;
        /*
        $(self.el).find('.axis_fields ul.hierarchy').each( function(index, element) {
            $(element).find('li.d_level').show();
            $(element).find('.d_group').remove();
        });
        */
        if( $(ui.helper).hasClass('selection') ) {
            var hierarchy = ui.item.find('ul.hierarchy').attr('hierarchy');
            var indexHierarchy = -1;
            ui.helper.parents('ul.connectable').find('li.selection').each( function(index, element) {
                if ( $(element).find('ul.hierarchy').attr('hierarchy') == hierarchy) {
                    indexHierarchy = index;
                }
            });

            var toAxis = ui.helper.parents('.axis_fields').parent().attr('title');
            var fromAxis = $(event.target).parents('.axis_fields').parent().attr('title');
            self.workspace.query.helper.moveHierarchy(fromAxis, toAxis, hierarchy, indexHierarchy);
            self.workspace.query.run();
            return;
        }
        var hierarchy = $(ui.helper).find('a').attr('hierarchy');
        var level =  $(ui.helper).find('a').attr('level');

        var h = $(self.workspace.el).find('.dimension_tree a.level[hierarchy="' + hierarchy +'"]').parent().parent().clone().removeClass('d_hierarchy').addClass('hierarchy');
        h.find('.ui-draggable-dragging').remove();
        h.find('li a[hierarchy="' + hierarchy + '"]').parent().hide();
        h.find('li a[level="' + level + '"]').parent().show();

        $(self.workspace.el).find('.dimension_tree a.level[hierarchy="' + hierarchy +'"][level="' + level + '"]').parent().not('.ui-draggable-dragging').draggable('disable');

        var selection = $('<li class="selection"></li>');
        selection.append(h);
        $(ui.item).empty().removeClass('hide d_level').addClass('selection').append(h);
        self.update_dropzones();
        return true;
        //$(ui.helper).html(selection.html())
    },

    sort_measure: function(event, ui) {
        var $axis = $(event.target).parent().parents('.fields_list_body');
        var source = "";
        var target = "ROWS";
        
        if ($axis.hasClass('rows')) { source = "ROWS"; target= "COLUMNS"; }
        if ($axis.hasClass('columns')) { source = "COLUMNS"; target="ROWS"; }
        if ($axis.hasClass('filter')) { source = "FILTER"; target="COLUMNS"; }

        var sortOrder = "";
        if ($(event.target).hasClass('none')) sortOrder = "none";
        if ($(event.target).hasClass('BASC')) sortOrder = "BASC";
        if ($(event.target).hasClass('BDESC')) sortOrder = "BDESC";

        var memberpath = $(event.target).parent().find('a').attr('href').replace('#', '').split('/');
        var member = "-";
        if ($(event.target).parent().hasClass('d_dimension')) {
            member = memberpath[2] + ".CurrentMember.Name";
            $axis.find('.d_dimension .sort').removeClass('BASC').removeClass('BDESC').addClass('none');
            $axis.parent().parent().find("." + target.toLowerCase() + " .d_measure .sort").removeClass('BASC').removeClass('BDESC').addClass('none');
            target = source;
        } else {
            member = memberpath[memberpath.length -1];
            $axis.find('.d_measure .sort').removeClass('BASC').removeClass('BDESC').addClass('none');
            $axis.parent().parent().find("." + target.toLowerCase() + " .d_dimension .sort").removeClass('BASC').removeClass('BDESC').addClass('none');
        }

        var futureSortOrder = "none";
        if (sortOrder == "none") futureSortOrder = "BASC";
        if (sortOrder == "BASC") futureSortOrder = "BDESC";
        if (sortOrder == "BDESC") futureSortOrder = "none";
        


        $(event.target).removeClass('none').addClass(futureSortOrder);

        if (futureSortOrder == "none") {
            var url = "/axis/" + target + "/sort/";
            this.workspace.query.action.del(url, {
                success: this.workspace.query.run
            });
        } else {
            var url = "/axis/" + target + "/sort/" + futureSortOrder + "/" + member;
            this.workspace.query.action.post(url, {
                success: this.workspace.query.run
            });
        }

    },
    
    


    remove_dimension: function(event, ui) {
        // Reenable original element
        var $source = ui ? ui.draggable : $(event.target).parent();
        var original_href = $source.find('a').attr('href');
        var $original = $(this.workspace.el).find('.sidebar')
            .find('a[href="' + original_href + '"]').parent('li').first();
        $original
            .draggable('enable')
            .css({ fontWeight: 'normal' });
        
        // Unhighlight the parent if applicable
        if ($original.parents('.parent_dimension')
                .children().children('.ui-state-disabled').length === 0) {
            $original.parents('.parent_dimension')
                .find('.folder_collapsed')
                .css({fontWeight: "normal"});
        }
        
        // Notify server
        var target = '';
        var dimension = original_href.replace('#', '');
        $target_el = $source.parent().parent('div.fields_list_body');
        if ($target_el.hasClass('rows')) target = "ROWS";
        if ($target_el.hasClass('columns')) target = "COLUMNS";
        if ($target_el.hasClass('filter')) target = "FILTER";
        
        var url = "/axis/" + target + "/dimension/" + dimension;
        this.workspace.query.action.del(url, {
            success: this.workspace.query.run,
            dataType: "text"
        });
        
        // Remove element
        $source.addClass('deleted').remove();
        if ($target_el.find('li.d_dimension, li.d_measure, li.ui-draggable').length == 0) {
            $target_el.siblings('.clear_axis').addClass('hide');
        }
        
        // Prevent workspace from getting this event
        event.stopPropagation();
        event.preventDefault();
        return false;
    },
    
    selections: function(event, ui) {
        // Determine dimension
        var $target = $(event.target).hasClass('sprite') ?
            $(event.target).parent().find('.level') :
            $(event.target);
        var key = $target.attr('href').replace('#', '');
        
        // Launch selections dialog
        (new SelectionsModal({
            target: $target,
            name: $target.text(),
            key: key,
            workspace: this.workspace
        })).open();
        
        // Prevent default action
        try {
            event.preventDefault();
        } catch (e) { }
        return false;
    }
});
