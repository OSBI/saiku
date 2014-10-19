/**
 * Created by bugg on 16/06/14.
 */
Saiku.Dashboards = {
    show_admin: function () {
        new DashboardModal().render().open();
        return false;
    }
};
var DashboardModal = Modal.extend({
    type: "dashboard",
    closeText: "Save",

    events: {
        'submit form': 'save',
        'click .dialog_footer a' : 'call'
    },

    buttons: [
        { text: "OK", method: "save" },
        { text: "Cancel", method: "close" }
    ],

    message: "",

    expression_text: function() {
        var c = "<form id='custom_dashboard'>Rows: <input class='input_rows' name='input_rows' value='2'/><br/>Columns:<input class='input_columns' name='input_columns' value='2'/><br/></form>";
        return c;
    },

    expression: " ",
    expressonType: "",

    initialize: function(args) {
        var self = this;
        _.bindAll(this, "save", "expression_text");

        _.extend(this.options, {
            title: "Configure Dashboard"
        });

        this.message = this.expression_text(this.expressionType);

        this.bind( 'open', function( ) {
           // $(this.el).find('textarea').val('').val(self.expression);
        });



        // fix event listening in IE < 9
        if(isIE && isIE < 9) {
            $(this.el).find('form').on('submit', this.save);
        }

    },


    save: function( event ) {
        event.preventDefault( );
        var self = this;
        this.rows = $(this.el).find('.input_rows').val();
        this.columns = $(this.el).find('.input_columns').val();

        var alert_msg = "";
        if (typeof this.rows == "undefined" || !this.rows || this.rows == "") {
            alert_msg += "You have to enter a value for the amount of rows! ";
            alert(alert_msg);
        } else if (typeof this.columns == "undefined" || !this.columns || this.columns == "") {
            alert_msg += "You have to enter a value for the amount of columns! ";
            alert(alert_msg);
        } else {
            Saiku.tabs.add(new Dashboard({rows:this.rows, cols:this.columns}));

            this.close();
        }

        return false;
    },

    error: function() {
        $(this.el).find('dialog_body')
            .html("Could not add new folder");
    }
});

var Dashboard = Backbone.View.extend({
    initialize: function (args) {
        this.rows = args.rows;
        this.columns = args.cols;

        this.myClient = new SaikuClient({
            server: "/saiku",
            path: "/rest/saiku/embed",
            user: "admin",
            password: "admin"
        });
    },
    template: function () {
        return _.template("<div class='gridster'>"+
        "<ul class='gridsterul'>"+
          //  this.create_grid()+
        "</ul>"+
        "</div>")},
    caption: function () {
        return "Dashboards";
    },
    create_grid : function (){
        var grid = "";
      for(var i = 0; i<this.rows; i++){
          for(var j = 0; j<this.columns; j++){
              var r = i+1;
              var c = j+1;
              if((r!=1 && c!=1)||(r!=2 && c!=2)) {
                  grid = grid + "<li data-row='" + r + "' data-col='" + c + "' data-sizex='1' data-sizey='1'></li>"
              }
          }
      }
        return grid;
    },
    render: function () {

        $(this.el).html(this.template());
        gridster = $(this.el).find(".gridsterul").gridster({
            widget_margins: [10, 10],
            widget_base_dimensions: [300, 300],
            min_cols:this.columns,
            min_rows:this.rows,
            resize: {
                enabled: true
            }
        }).data('gridster');

        var widgets = [
            ['<li><div class="workspace_results" style="width:100%;height:100%;margin: 0 auto" id="slot1"></div></li>', 1, 1, 1, 1],
            ['<li><div id="slot3"></div></li>', 1, 1, 2, 1],
            ['<li><div style="width:100%;height:100%;margin: 0 auto" id="slot2"></div></li>', 1, 1, 2, 2],
            ['<li><div id="slot4"></div></li>', 1, 1, 1, 2]

        ];

        $.each(widgets, function(i, widget){
            gridster.add_widget.apply(gridster, widget)
        });
        this.tab.bind('tab:select', this.gridster);

        this.myClient.execute({
            file: "/homes/test2.saiku",
            htmlObject: "#slot1",
            render: "table",
            params: {

            }});
        this.myClient.execute({
            file: "/homes/test2.saiku",
            htmlObject: "#slot2",
            render: "chart",
            mode: "heatgrid",
            chartDefinition: {
                colors: ['grey','red','blue'],
                extensionPoints: {
                    xAxisLabel_textAngle: - Math.PI/3,
                    panel_fillStyle: "#EAEAEA"
                }
            },
            zoom: true

        });
        $(function() {
            /*$(".gridster ul")*/
        });
    }

    });

Saiku.events.bind('session:new', function (session) {

    var $link = $("<a />")
        .attr({
            href: "#dashboard",
            title: "Improve this translation"
        })
        .click(Saiku.Dashboards.show_admin)
        .addClass("dashboard");
    var $li = $("<li />").append($link);
    $(Saiku.toolbar.el).find('ul').append($li);

});