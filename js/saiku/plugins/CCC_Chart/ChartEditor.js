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
 * Controls the appearance and behavior of the dimension list
 * 
 * This is where drag and drop lives
 */
var ChartEditor = Backbone.View.extend({
    events: {
        'change .chartlist': 'change_chart',
        'click .properties_table td' : 'click_property'
    },

    },

    templateEditor : 
     '<div class="workspace">' 
    +'        <div class="workspace_inner">'
    +'            <div class="workspace_results">'
    +'            </div>'
    +'        </div>'
    +'    </div>'
    +'    <div class="sidebar">'
    +'        <div>'
    +'            <h3 class="top i18n">Charts</h3>'
    +'        </div>'
    +'        <div class="sidebar_inner">'
    +'            <%= chart_list %>'
    +'        </div>'
    +'        <h3 class="i18n">Properties</h3>'
    +'        <div class="sidebar_inner properties_table"></div>'
    +'    </div>  '
    +'    <div class="sidebar_separator"></div>'
    +'    <div class="clear"></div>',
    
    initialize: function(args) {
        // Don't lose this
        _.bindAll(this, "change_chart", "render_chart_properties","getChartProperties", "click_property", "save_property", "cancel_property", "check_input");
        
        // Bind parent element
        this.workspace = args.workspace;
        this.ChartProperties = args.ChartProperties;
        this.ChartTypes = args.ChartTypes;
        this.data = args.data;
        this.getChartProperties = args.getChartProperties;
        
        var chartList = "<select class='chartlist'>";
        _.each(this.ChartTypes, function(chart) {
            chartList += "<option value='" + chart.ChartObject + "'>" + chart.ChartName + "</option>";
        });
        chartList += "</select>";

        $(this.el).html(_.template(this.templateEditor)(chartList));
        this.change_chart();

    },

    change_chart: function() {
        var chart = $(this.el).find('.chartlist').val();
        this.render_chart_properties(chart);

    },

    render_chart_properties: function(chartName) {
        var options = this.getChartProperties(chartName);
        options = _.sortBy(options, function(property){ return property.Order; });

        var table = "<table class='propertiesviewer' style='border: 1px solid grey'>";
        _.each(options, function(property) {
            table += "<tr>"
            + "<td class='data' title='" + property.Tooltip + "' href='#" + property.Name + "'>" + property.Description + "</td>"
            + "<td class='data value' alt='" + property.DefaultValue + "'>" + property.DefaultValue + "</td></tr>";
        });
        table += "</table>";

        $(this.el).find('.properties_table').html(table);
    },

    click_property: function(event) {
        $target = $(event.target).hasClass('value') ?
            $(event.target) : $(event.target).parent().find('.value');

        var value = $target.text();
        
        
        var $input = $("<input type='text' value='" + value + "' />").css({ "width" : $target.width() })
            .keyup(this.check_input)
            .blur(this.cancel_property);
        $target.html('').append($input);
        $input.focus();
    },
    
    check_input: function(event) {
        if (event.which == 13) {
            this.save_property(event);
        } else if (event.which == 27 || event.which == 9) {
            this.cancel_property(event);
        }
         
        return false;
    },
    
    save_property: function(event) {
        var $input = $(event.target).closest('input');
        var value = $input.val();
        $input.parent().text(value);
    },
    
    cancel_property: function(event) {
        var $input = $(event.target).closest('input');
        $input.parent().text($input.parent().attr('alt'));
    },
    

});
