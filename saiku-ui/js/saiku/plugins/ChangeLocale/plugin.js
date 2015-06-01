/*  
 *   Copyright 2015 OSBI
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
        _.bindAll(this, "render", "show", "handleClick", "fetch_datasources");

        this.datasources = new Connections({}, { dialog: this });

        // Add change locale button to saiku toolbar
        this.add_button();
        this.workspace.toolbar.changeLocale = this.show;

        // Listen to adjust event and rerender
        this.workspace.bind('workspace:adjust', this.render);

        // Create locale screen
        this.localeOptionsScreen = $("<div>  " +
            "<ul>" +
            "<li>         <button id='en_US' > English </button></li> " +
            "<li>   	    <button id='nl_BE' > Dutch </button>  </li> " +
            "<li>   	    <button id='fr_FR' > French </button> </li>" +
            " </ul>" +
            "</div> " +
            "<div id ='feedback' class='dialog_body' style='display: inline;'> Choose your language </div>")
        ;

        // attach event handler
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
                    'background-repeat': 'no-repeat',
                    'background-position': '7px 7px'
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

    fetch_datasources: function () {
        return true;
    },

    handleClick: function (event) {
        // Keep a reference to the main plugin object.
        var this_p = this;

        // get selected locale
        var newLocale = $(event.target).attr('id');

        // get current selected connection name (without URL data)
        selectedCube = $(".cubes option:selected").val();
        selectedConnectionName = selectedCube.substring(0, selectedCube.indexOf("/"));

        // Get all connections from back-end
        getUrl = Settings.REST_URL + "admin" + "/datasources";
        $.get(getUrl, function (data) {
            allConnections = data;
            // match
            selectedConnection = _.find(allConnections, function (connection) {
                return connection.connectionname == selectedConnectionName
            });

            selectedDataSource = new DataSource(selectedConnection);

            // change locale
            if (selectedConnection.advanced == null) {
                alert("Change the URL connection string to advanced");
            } else {
                referenceText = "locale=";
                start = selectedConnection.advanced.toLowerCase().indexOf(referenceText);
                start = start + referenceText.length;
                if (start == -1) {
                    alert("no locale defined in connection string of data source")
                }
                else {
                    end = selectedConnection.advanced.indexOf(";", start);
                    oldLocale = selectedConnection.advanced.substring(start, end);
                    selectedDataSource.set({"advanced": selectedConnection.advanced.replace(oldLocale, newLocale)});
                    // post update
                    this_p.saveDataSource(selectedDataSource);
                    // refresh datasources
                    Saiku.session.sessionworkspace.refresh()
                }
            }
        });
        return false;
    },

    saveDataSource: function (selectedDataSource) {
        selectedDataSource.save({}, {
                data: JSON.stringify(selectedDataSource.attributes),
                contentType: "application/json",
                success: function (model, respose, options) {
                    console.log("The model has been updated to the server");
                },
                error: function (model, xhr, options) {
                    console.log("Something went wrong while updating the model: " + xhr.responseText);
                }
            }
        );
    },

    render: function (chartOptions) {


    }
});

var DataSource = Backbone.Model.extend({
//    url: "admin/datasources",
    urlRoot: "admin/datasources",
    refresh: function () {
        $.ajax({
            type: 'GET',
            url: Settings.REST_URL + "admin" + "/datasources/" + this.get("connectionname") + "/refresh"
        });
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
    };

    function clear_workspace(args) {
        if (typeof args.workspace.changeLocale != "undefined") {
            $(args.workspace.changeLocale.localeOptionsScreen).hide();
            $(args.workspace.changeLocale.el).parents().find('.workspace_results table').show();
            $(args.workspace.changeLocale.el).hide();
        }
    };


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
