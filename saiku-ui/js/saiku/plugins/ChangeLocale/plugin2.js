/*  
 *   Copyright 2015 myself
 */

/**
 * Changes the locale of the cube
 */
var ChangeLocale = Backbone.View.extend({

    initialize: function (args) {
        this.workspace = args.workspace;

        // Create a unique ID for use as the CSS selector
        this.id = _.uniqueId("changeLocale_");
        $(this.el).attr({ id: this.id });

        // Bind table rendering to query result event
        _.bindAll(this, "render", "receive_data", "process_data", "show", "handleClick");

        this.workspace.bind('query:result', this.receive_data);

        // Add change locale button
        this.add_button();
        this.workspace.toolbar.changeLocale = this.show;

        // Listen to adjust event and rerender chart
        this.workspace.bind('workspace:adjust', this.render);

        // Create locale screen
        this.localeOptionsScreen = $("<div>  " +
            "       	<button id='en_US' > English </button> " +
            "   	    <button id='nl_BE' > Dutch </button> " +
            "   	    <button id='fr_FR' > French </button> " +
            "</div> ");

        this.localeOptionsScreen.find('button').click(this.handleClick);

        //function for menu
        $("#nav ul ").css({display: "none"}); // Opera Fix
        $("#nav li").hover(function () {
            $(this).find('ul:first').css({visibility: "visible", display: "none"}).show(400);
        }, function () {
            $(this).find('ul:first').css({visibility: "hidden"});
        });

        // Append chart to workspace
        $(this.workspace.el).find('.workspace_results')
            .prepend($(this.el).hide())
            .prepend(this.localeOptionsScreen.hide());


    },

    add_button: function () {
        var $chart_button =
            $('<a href="#changeLocale" class="i18n change_locale button disabled_toolbar sprite" title="Change locale"></a>')
                .css({  'background-image': "url('js/saiku/plugins/ChangeLocale/images/change_locale.png')",
                    'background-repeat': 'no-repeat'
                });

        var $chart_li = $('<li class="seperator"></li>').append($chart_button);
        $(this.workspace.toolbar.el).find("ul").append($chart_li);
    },

    show: function (event, ui) {
        $(this.workspace.table.el).toggle();
        $(this.el).toggle();
        $(this.localeOptionsScreen).toggle();
        $(event.target).toggleClass('on');

        if ($(event.target).hasClass('on')) {
            this.render();
        } else {
            this.workspace.table.render({ data: this.workspace.query.result.lastresult() });
        }
    },

    handleClick: function (event) {
        var locale = $(event.target).attr('id');

        return false;
    },

    render: function (chartOptions) {


    },

    receive_data: function (args) {
        return _.delay(this.process_data, 0, args);
    },

    process_data: function (args) {
        this.data = {};
        this.data.resultset = [];
        this.data.metadata = [];
        this.data.height = 0;
        this.data.width = 0;

        if (args.data.cellset && args.data.cellset.length > 0) {

            var lowest_level = 0;

            for (var row = 0; row < args.data.cellset.length; row++) {
                if (args.data.cellset[row][0].type == "ROW_HEADER_HEADER") {
                    this.data.metadata = [];
                    for (var field = 0; field < args.data.cellset[row].length; field++) {
                        if (args.data.cellset[row][field].type == "ROW_HEADER_HEADER") {
                            this.data.metadata.shift();
                            lowest_level = field;
                        }

                        this.data.metadata.push({
                            colIndex: field,
                            colType: typeof(args.data.cellset[row + 1][field].value) !== "number" &&
                                isNaN(args.data.cellset[row + 1][field].value
                                    .replace(/[^a-zA-Z 0-9.]+/g, '')) ? "String" : "Numeric",
                            colName: args.data.cellset[row][field].value
                        });
                    }
                } else if (args.data.cellset[row][0].value !== "null" && args.data.cellset[row][0].value !== "") {
                    var record = [];
                    this.data.width = args.data.cellset[row].length;
                    for (var col = lowest_level; col < args.data.cellset[row].length; col++) {
                        var value = args.data.cellset[row][col].value;
                        // check if the resultset contains the raw value, if not try to parse the given value
                        if (args.data.cellset[row][col].properties.raw && args.data.cellset[row][col].properties.raw !== "null" && col > 0) {
                            value = parseFloat(args.data.cellset[row][col].properties.raw);
                        } else if (typeof(args.data.cellset[row][col].value) !== "number" &&
                            parseFloat(args.data.cellset[row][col].value.replace(/[^a-zA-Z 0-9.]+/g, '')) && col > 0) {
                            value = parseFloat(args.data.cellset[row][col].value.replace(/[^a-zA-Z 0-9.]+/g, ''));
                        }
                        record.push(value);
                    }
                    this.data.resultset.push(record);
                }
            }
            this.data.height = this.data.resultset.length;
            this.render();
        } else {
            $(this.el).text("No results");
        }
    }
});


/**
 * Start Plugin
 */
Saiku.events.bind('session:new', function (session) {

    function new_workspace(args) {
        // Add stats element
        if (typeof args.workspace.changeLocale == "undefined") {
            args.workspace.changeLocale = new ChangeLocale({ workspace: args.workspace });
        }
    }

    function clear_workspace(args) {
        if (typeof args.workspace.changeLocale != "undefined") {
            $(args.workspace.changeLocale.localeOptionsScreen).hide();
            $(args.workspace.changeLocale.el).parents().find('.workspace_results table').show();
            $(args.workspace.changeLocale.el).hide();
        }
    }


    // Attach stats to existing tabs
    for (var i = 0; i < Saiku.tabs._tabs.length; i++) {
        var tab = Saiku.tabs._tabs[i];
        new_workspace({
            workspace: tab.content
        });
    }
    ;

    // Attach stats to future tabs
    Saiku.session.bind("workspace:new", new_workspace);
    Saiku.session.bind("workspace:clear", clear_workspace);
});
