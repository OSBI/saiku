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
        'click a': 'click_tag',
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
            var t = "<div class='buckets'>" +
                "<a href='#' class='add_bucket i18n'> + </a>";
            _.each(this.tags, function(tag) {
              t += self.tag_template(tag);
            });     
            t += "</div>";
            return t;
    },

    tag_template: function(tag) {
          var title = tag.name + ": ";
          var first = true;
          _.each(tag.saikuMembers, function(member) {
                    if (!first) {
                        title += ",  ";
                    }
                    first = false;
                    title += member.uniqueName;
          });
          return "<a href='#" + tag.name + "' title='" + title + "' class='bucket'>" + tag.name + "</a>";
    },
    

    initialize: function(args) {
        this.workspace = args.workspace;
        
        // Create a unique ID for use as the CSS selector
        this.id = _.uniqueId("buckets_");
        $(this.el).attr({ id: this.id });
        
        // Bind table rendering to query result event
        _.bindAll(this, "render",  "show",  "setOptions", "buildTemplate", "render");
        
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
    
    setOptions: function(event) {
        var type = $(event.target).attr('href').replace('#', '');
        try {
            alert("setOptions");
            this[type]();
        } catch (e) { }
        
        return false;
    },
    
    render: function() {
        if (! $(this.workspace.toolbar.el).find('.buckets').hasClass('on')) {
            return;
        }

        $(this.el).empty();

        
        var rendered = this.tags_template();
        var $table = $(rendered)
                        .css({
                            'padding-bottom': '10px'
                        });
        $table.find('a').css(this.bucket_css);
    
        $(this.el).append($table)
        
    },

        click_tag: function(event) {
                    var self = this;

                    if ($(event.target).hasClass('on')) {
                        $(event.target).removeClass('on').css({
                            'background' : 'white'
                        });
                        var tagName = $(event.target).attr('href');
                        tagName = tagName.replace('#','');
                        self.workspace.query.action.del("/tags/" + tagName, { 
                            success: self.workspace.query.run
                        });
                    }
                    else {

                        $(event.target).addClass('on').css({
                            'background' : 'lightblue'
                        });
                        var tagName = $(event.target).attr('href');
                        tagName = tagName.replace('#','');
                        

                        if ($(event.target).hasClass('add_bucket')) {
                            var addBucketBtn = $(event.target);
                            var saveBucket = function(model, response) {
                                  $tag = $(self.tag_template(model))
                                    .css(self.bucket_css)
                                    .appendTo($(self.el).find('.buckets'));

                            };

                            var clicked = function(event) {
                                $target = $(event.target).hasClass('data') ?
                                $(event.target).find('div') : $(event.target);
                                var pos = $target.attr('rel');
                                (new BucketModal({
                                    workspace: self.workspace,
                                    maxrows: "tag...",
                                    title: "New Tag",
                                    position: pos,
                                    successCallback: saveBucket,
                                    query: self.workspace.query
                                })).open();

                                $(addBucketBtn).removeClass('on').css({
                                    'background' : 'white'
                                });
                                $(self.workspace.el).find("td.data").removeClass('cellhighlight').unbind('click');

                            };
                            $(self.workspace.el).find("td.data").addClass('cellhighlight').unbind('click').click(clicked);
                            $(self.workspace.el).find(".query_scenario, .drillthrough, .drillthrough_export").removeClass('on');
                        } else {
                            self.workspace.query.action.put("/tags/" + tagName, { 
                                success: self.workspace.query.run
                            });
                        }
                    }
                        
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
            }
        }

        function clear_workspace(args) {
                    if (typeof args.buckets != "undefined") {
                        $(args.buckets.el).hide();
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

 var BucketModal = Modal.extend({
    type: "drillthrough",
    
    buttons: [
        { text: "Ok", method: "ok" },
        { text: "Cancel", method: "close" }
    ],

    tag_template: '<div class="new_tag"><br />' +
                'Tag Name: <input id="maxrows" name="tagname" class="tagname" type="text" /><br />' +
               '</div>',
    
    initialize: function(args) {
        // Initialize properties
        _.extend(this, args);
        this.options.title = args.title;
        this.query = args.workspace.query;
        
        this.position = args.position;
        this.successCallback = args.successCallback;
        Saiku.ui.unblock();
        _.bindAll(this, "ok");

        // Resize when rendered
        this.bind('open', this.post_render);
        this.render();
               // Load template
       $(this.el).find('.dialog_body')
          .html(_.template(this.tag_template)(this));
        // Show dialog
        $(this.el).find('.tagname').val(this.tagname);

        
    },
    
    
    post_render: function(args) {
        $(args.modal.el).parents('.ui-dialog').css({ width: "150px" });
    },
    
    ok: function() {
        // Notify user that updates are in progress
        var $loading = $("<div>Saving tag...</div>");
        $(this.el).find('.dialog_body').children().hide();
        $(this.el).find('.dialog_body').prepend($loading);
        
        var tagname = $(this.el).find('.tagname').val();
        var params = "?tagname=" + tagname;
        params = params + (typeof this.position !== "undefined" ? "&position=" + this.position : "" );


        this.query.action.post("/tags/" + tagname + "/" + this.position, { 
                success: this.successCallback
        });
        this.close();
        
        
        //alert(this.successCallback);
        
        return false;
    },

    
    finished: function() {
        $(this.el).dialog('destroy').remove();
        this.query.run();
    }
});

