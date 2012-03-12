/*
 * plugin.js
 * 
 * Copyright (c) 2011, OSBI Ltd. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301  USA
 */

/**
 * Allow the creation of buckets for queries
 */
var Buckets = Backbone.View.extend({

    events: {
        'click .add_bucket': 'add_bucket',
        'click  a.save' : 'save_bucket',
        'click .bucket' : 'click_bucket'
    },

    bucket_css: { 
        'color': '#555', 
        'margin-right': '5px', 
        'text-decoration': 'none', 
        'border': '1px solid #ccc', 
        'padding': '5px',
        '-moz-border-radius': '3px',
        '-webkit-border-radius': '3px'
    },

    tags: [],


     tags_template: function() {
            var self = this;
            var t = "<div class='buckets'><ul>" +
                "<li><a href='#' class='add_bucket i18n button'> + </a></li>";
            _.each(this.tags, function(tag) {
              t += self.tag_template(tag);
            });     
            t += "</div>";
            return t;
    },

    tag_template: function(tag) {
          var title = tag.name + ": ";
        _.each(tag.saikuTuples, function(tuple) {
            var first = true;
            title += " (";
            _.each(tuple.saikuMembers, function(member) {
                    if (!first) {
                        title += ",  ";
                    }
                    first = false;
                    title += member.uniqueName;
            });
            title += ")";
        });

          return "<li class='seperator'><a href='#" + tag.name + "' title='" + title + "' class='bucket button'>" + tag.name + "</a></li>";
    },
    

    initialize: function(args) {
        this.workspace = args.workspace;
        
        // Create a unique ID for use as the CSS selector
        this.id = _.uniqueId("buckets_");
        $(this.el).attr({ id: this.id });
        
        // Bind table rendering to query result event
        _.bindAll(this, "render",  "show", "buildTemplate", "render", "deactivate_add_bucket", 
            "add_bucket", "save_bucket", "click_bucket");
        
        // Add buckets button
        this.add_button();
        this.workspace.toolbar.buckets = this.show;
        
        // Listen to adjust event and rerender buckets
        this.workspace.bind('workspace:adjust', this.render);
        
        $(this.workspace.el).find('.workspace_results')
            .prepend($(this.el).hide());


    },
    
    add_button: function() {
        var $stats_button = 
            $('<a href="#buckets" class="buckets button disabled_toolbar i18n" title="Tags">Tag</a>')
            .css({ 'background': 
                "url('js/saiku/plugins/Buckets/xxx.png') 30% 30% no-repeat" });
        var $stats_li = $('<li class="seperator"></li>').append($stats_button);
        $(this.workspace.toolbar.el).find("ul").append($stats_li);
    },
    
    show: function(event, ui) {
        $(this.el).toggle();
        $(event.target).toggleClass('on');
        
        if ($(event.target).hasClass('on')) {
            this.workspace.query.action.get("/tags/", { 
                success: this.buildTemplate
            });
        }
    },

    buildTemplate: function(model,response) {
        this.tags = response;
        this.render();
    },
    
    render: function() {
        if (! $(this.workspace.toolbar.el).find('.buckets').hasClass('on')) {
            return;
        }

        $(this.el).empty();

        
        var rendered = this.tags_template();
        var $table = $(rendered);
    
        $(this.el).append($table)
        
    },

    deactivate_add_bucket: function() {
        var self = this;
        var $addBtn = $(self.el).find('.add_bucket');
        $addBtn.removeClass('on');
        $(self.el).find('.new_bucket').parent().remove();
        return;
    },

    add_bucket: function(event) {
        var self = this;
        var $addBtn = $(self.el).find('.add_bucket');
        if ($addBtn.hasClass('on')) {
            self.deactivate_add_bucket();
            return;
        }
        $addBtn.addClass('on');

        
        $("<li><input id='new_bucket' type='text' class='new_bucket'/></li><li>" 
            + "<a href='#save_bucket' class='i18n save sprite button new_bucket' title='Save Tag'></a></li>")
                            .insertAfter($(self.el).find('.buckets .add_bucket').parent());

        var clicked = function(event) {
            $target = $(event.target).hasClass('data') ?
                            $(event.target).find('div') : $(event.target);

            if ($target.parent().hasClass('selected')) {
                $target.parent().removeClass('selected');
            } else {
                $target.parent().addClass('selected');
            }
        };

        $(self.workspace.el).find("td.data").addClass('cellhighlight').unbind('click').click(clicked);
        $(self.workspace.el).find(".query_scenario, .drillthrough, .drillthrough_export").removeClass('on');
    },

    save_bucket: function() {
        var self = this;
        var $cells = $(self.workspace.el).find("td.selected div");
        if($cells.size() < 1) {
            alert("You need to select at least 1 cell for tagging before you can save!");
            return;
        }
        var positions = "";
        $.each($cells, function(index,element) {
            if (index > 0) {
                positions += ",";
            }
            positions += $(element).attr('rel');
            
        });

        $(self.workspace.el).find("td.data").removeClass('cellhighlight').unbind('click');
        $(self.workspace.el).find("td.selected").removeClass('selected');

        var tagname = $(self.el).find('#new_bucket').val();
        
        var saveBucket = function(model, response) {
            self.deactivate_add_bucket();
                $tag = $(self.tag_template(model))
                            .appendTo($(self.el).find('.buckets ul'));
        };

        this.workspace.query.action.post("/tags/" + tagname, { 
                  success: saveBucket,
                  data: { positions: positions }
        });


    },
    click_bucket: function(event) {
        var tagName = $(event.target).attr('href').replace('#','');

        if ($(event.target).hasClass('on')) {
            $(event.target).removeClass('on');
            this.workspace.query.action.del("/tags/" + tagName, { 
                            success: this.workspace.query.run
            });
        } else {
            $(event.target).addClass('on');
            this.workspace.query.action.put("/tags/" + tagName, { 
                          success: this.workspace.query.run
            });
        }

        $(event.target).parent().siblings().find('.on').removeClass('on');


    }
    
});

/**
 * Start Plugin
 */ 
 Saiku.events.bind('session:new', function(session) {

        function new_workspace(args) {
            // Add stats element
            if (typeof args.workspace.buckets == "undefined") {
                args.workspace.buckets = new Buckets({ workspace: args.workspace });
                args.workspace.bind('query:result', args.workspace.buckets.deactivate_add_bucket);
            }
        }

        function clear_workspace(args) {
                    if (typeof args.workspace.buckets != "undefined") {
                        $(args.workspace.buckets.el).hide();

                    }
        }
        
        // Attach stats to existing tabs
        for(var i = 0; i < Saiku.tabs._tabs.length; i++) {
            var tab = Saiku.tabs._tabs[i];
            new_workspace({
                workspace: tab.content
            });
        };

        // Attach stats to future tabs
        Saiku.session.bind("workspace:new", new_workspace);
        Saiku.session.bind("workspace:clear", clear_workspace);
    });

 
