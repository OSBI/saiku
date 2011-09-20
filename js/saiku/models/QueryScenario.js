var QueryScenario = Backbone.Model.extend({
    initialize: function(args, options) {
        this.query = options.query;
        this.query.workspace.bind('table:render', this.attach_listeners);
    },
    
        
    leaver: function() {
        alert('test');
    },
    
    attach_listeners: function(args) {
        $(args.workspace.el).find("td.data").click(function(event) {
            $target = $(event.target).hasClass('data') ?
                $(event.target).find('div') : $(event.target);
            var value = $target.attr('alt');
                        var pos = $target.attr('rel');
                        
            saving = function(e) {
                 if (e.keyCode == 13) {
                    this.value = value;
                    this.position = pos;
                    $target.text('');
                    alert('enter');
                 }
                 if (e.keyCode == 27 || e.keyCode == 9) {
                    $target..text('');
                    alert('esc');
                 }
                 (this.leaver);
                 
                return (false);


            };
            
            var $input = $("<input type='text' value='" + value + "' />")
                .keyup(saving);
            $target.html('').append($input);
        });
    },
    
    check_input: function(event) {
    },
    
    parse: function() {
        this.query.run();
    },

    url: function() {
        return this.query.url() + "/cell/" + this.position + "/" + this.value; 
    }
});