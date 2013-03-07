var ChartEditor = Backbone.View.extend({


    events: {
        'change .chartlist': 'change_chart',
        'click  td' : 'click_property',
        'click input.save_chart' : 'save_chart'
    },

    templateEditor :
     '<div id="chartworkspace" class="chartworkspace">' 
    +'    <div class="sidebar">'
    +'<span>'
    +'        <div>'
    +'            <h3 class="top i18n">Charts</h3>'
    +'        </div>'
    +'        <div class="sidebar_inner">'
    +'            <%= chartList %>'
    +'        </div>'
    +'        <h3 class="i18n">Properties</h3>'
    +'        <div class="sidebar_inner properties_table"></div>'
    +'    </div>  '
    +'    <div class="sidebar_separator"></div>'
    +' </span></span>'
    +' <input class="save_chart" type="submit" value="SAVE CHART" /> <br >'
    +'        <div class="chartworkspace_inner">'
    +'        </div></span>'
    +'    </div>' ,
    
    chartDefinition: {},

    initialize: function(args) {
        // Don't lose this
        _.bindAll(this, "change_chart", "render_chart_properties", "click_property", "save_property", "cancel_property", 
                            "check_input", "get_chart_definition", "getData", "render_chart");
        
        this.id = _.uniqueId("chartpopup_");
        // Bind parent element
        this.workspace = args.workspace;
        this.ChartProperties = args.ChartProperties;
        this.ChartTypes = args.ChartTypes;
        this.getData = args.data;
        this.getChartProperties = args.getChartProperties;
        this.chartDefinition = {};
        var chartList = "<select class='chartlist'>";

         chartList += "<option value='select'>Select chart type...</option>";

        _.each(this.ChartTypes, function(chart) {
            chartList += "<option value='" + chart.ChartObject + "'>" + chart.ChartName + "</option>";
        });
        chartList += "</select>";

        $(this.el).html(_.template(this.templateEditor)({chartList : chartList}));
        $(this.el).find('.chartworkspace_inner').css({ 'margin-left': 400 });
        $(this.el).find('.sidebar').css({ 'width': "400" });
        this.chartId = _.uniqueId("chartobject_");
        $(this.el).find('.chartworkspace_inner').html("<div id='"+ this.chartId + "'></div>")

        this.change_chart();

    },

    getData: function() {},

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
            + "<td class='data property' title='" + property.Tooltip + "' href='#" + property.Name + "'>" + property.Description + "</td>"
            + "<td class='data value' alt='" + property.DefaultValue + "'>" + property.DefaultValue + "</td></tr>";
        });
        table += "</table>";

        $(this.el).find('.properties_table').html(table);
        $(this.el).find('.properties_table td').css({ "border-bottom" : "1px solid grey"});

        this.render_chart();
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
        this.get_chart_definition();
    },

    get_chart_definition: function() {
    this.chartDefinition = {};
    var self = this;
        $(this.el).find('.properties_table tr').each(function(index, element) {
            var property = $(element).find('.property').attr('href').replace('#','');
            var value = $(element).find('.value').text();
            if (typeof value != "undefined" && value.length > 0) {
                self.chartDefinition[property] = value;
            }
            
        });
    this.render_chart();
    
    },

    render_chart: function() {
        var chartName = $(this.el).find('.chartlist').val().replace('pvc.','');
        
        if (chartName == "select") {
            return false;
        }
        var options = this.chartDefinition;
        options['canvas'] = this.chartId;
        
        this.chart = new pvc[chartName](options);
        
        this.chart.setData(this.getData(), {
            crosstabMode: true,
            seriesInRows: false
        });
        
        try {
            this.chart.render();
            Saiku.i18n.automatic_i18n();
        } catch (e) {
            $(this.el).find('#' + this.chartId ).text("Could not render chart<br>" + e);
        }
    },

    cancel_property: function(event) {
        var $input = $(event.target).closest('input');
        $input.parent().text($input.parent().attr('alt'));
    },

    save_chart: function(event) {
    	//this.workspace.chart.chart = _.clone(this.chart);
    	//this.workspace.chart.chart.options.canvas = this.workspace.chart.id;
    	//this.workspace.chart.chart.render();
    	return false;
    }
    

});