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
 * Renders a chart for each workspace
 */
var Chart = Backbone.View.extend({

    events: {
        'click .zoomin' : 'zoomin',
        'click .zoomout' : 'zoomout',
        'click .rerender' : 'rerender'
    },

    initialize: function(args) {
        
        this.workspace = args.workspace;
        
        // Create a unique ID for use as the CSS selector
        this.id = _.uniqueId("chart_");
        $(this.el).attr({ id: this.id });
        
        var btns = "<span style='float:left;'><a href='#' class='button rerender' title='Re-render chart'></a><a href='#' class='button zoomout' style='display:none;' title='Zoom back out'></a></span>";
        $( btns).appendTo($(this.el));

        this.renderer = new SaikuChartRenderer(null, { htmlObject: $(this.el), mode: "bar" });

        // Bind table rendering to query result event
        _.bindAll(this, "receive_data", "show", "render_view", "rerender", "zoomin", "zoomout", "exportChart");
        var self = this;
        this.workspace.bind('query:run',  function() {
            if (! $(self.workspace.querytoolbar.el).find('.render_chart').hasClass('on')) {
                return false;
            }
            self.renderer.data = {};
            self.renderer.data.resultset = [];
            self.renderer.data.metadata = [];
            $(self.el).find('.canvas_wrapper').hide();
            return false;
        });
        
        this.workspace.bind('query:result', this.receive_data);

         var pseudoForm = "<div id='nav" + this.id + "' style='display:none' class='nav'><form id='svgChartPseudoForm' target='_blank' method='POST'>" +
                "<input type='hidden' name='type' class='type'/>" +
                "<input type='hidden' name='svg' class='svg'/>" +
                "</form></div>";
        if (isIE) {
            pseudoForm = "<div></div>";
        }
        this.nav =$(pseudoForm);

        $(this.el).append(this.nav);


    },

    rerender: function(event) {
        this.renderer.render();
        event.preventDefault();
        return false;
    },

    zoomin: function(event) {
            this.renderer.zoomout();
            event.preventDefault();
    },

    zoomout: function(event) {
            this.renderer.zoomout();
            event.preventDefault();
    },

    exportChart: function(type) {
        var svgContent = new XMLSerializer().serializeToString($('svg')[0]);
        var rep = '<svg xmlns="http://www.w3.org/2000/svg" ';
        if (svgContent.substr(0,rep.length) != rep) {
            svgContent = svgContent.replace('<svg ', rep);    
        }
        
        var form = $('#svgChartPseudoForm');
        form.find('.type').val(type);
        form.find('.svg').val(svgContent);
        form.attr('action', Settings.REST_URL + this.workspace.query.url() + escape("/../../export/saiku/chart"));
        form.submit();
        return false;
    },

    render_view: function() {
    	// Append chart to workspace, called by workspace
        $(this.workspace.el).find('.workspace_results')
            .prepend($(this.el).hide());
    },
    
    show: function(event, ui) {

        if (this.renderer.cccOptions.width <= 0) {
            this.renderer.cccOptions.width = $(this.workspace.el).find('.workspace_results').width() - 20;
        }
        if (this.renderer.cccOptions.height <= 0) {
            this.renderer.cccOptions.height = $(this.workspace.el).find('.workspace_results').height() - 20;
        }
        
        $(this.el).show();

        var hasRun = this.workspace.query.result.hasRun();
        if (hasRun) {
            this.renderer.process_data_tree({ data: this.workspace.query.result.lastresult() }, true, true);
            this.workspace.adjust();
            this.renderer.render();
        }



    },


    export_button: function(event) {
        var self = this;
        var $target = $(event.target).hasClass('button') ? $(event.target) : $(event.target).parent();
        
        var self = this;
        var $body = $(document);
        //$body.off('.contextMenu .contextMenuAutoHide');
        //$('.context-menu-list').remove();
        $.contextMenu('destroy', '.export_button');
        $.contextMenu({
                selector: '.export_button',
                trigger: 'left',
                ignoreRightClick: true,
                callback: function(key, options) {
                    self.workspace.chart.exportChart(key);
                },
                items: {
                    "png": {name: "PNG"},
                    "jpg": {name: "JPEG"},
                    "pdf": {name: "PDF"},
                    "svg": {name: "SVG"}
                }
        });
        $target.contextMenu();
    },

    button: function(event) {
        var btn = $(event.target).hasClass('button') ? $(event.target) : $(event.target).parent();
        if (btn.hasClass('chartoption')) {
            btn.parent().siblings().find('.chartoption.on').removeClass('on');
            btn.addClass('on');
            if ($(this.workspace.querytoolbar.el).find('.render_chart').hasClass('on')) {
                $(this.el).find('.canvas_wrapper').hide();
            }
        }
    },
            
    receive_data: function(args) {
        if (! $(this.workspace.querytoolbar.el).find('.render_chart').hasClass('on')) {
            return;
        }
        this.renderer.process_data_tree(args, true, true);
        this.workspace.adjust();
        this.renderer.render();
        //_.delay(this.renderer.process_data_tree, 0, args, true, true);


    }
});


