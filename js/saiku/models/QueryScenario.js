var QueryScenario = Backbone.Model.extend({
    initialize: function(args, options) {
        this.query = options.query;
        this.query.workspace.bind('table:render', this.attach_listeners);
    },
    
    attach_listeners: function(args) {
        $(args.workspace.el).find("td.data").click(function(event) {
            $target = $(event.target).hasClass('data') ?
                $(event.target).find('div') : $(event.target);
            var value = $target.text();
            var $input = $("<input type='text' value='" + value + "' />")
                .keyup(this.check_input);
            $target.html('').append($input);
        });
    },
    
    check_input: function(event) {
        console.log("KEY:", event.which);
    },
    
    parse: function() {
        this.query.run();
    },

    url: function() {
        return this.query.url() + "/cell/" + this.position + "/" + this.value; 
    }
});