var MDXModal = Modal.extend({
    type: "mdx",
    
    events: {
        'submit #login_form': 'close',
        'click .close': 'close'
    },
    
    initialize: function(args) {
        this.options.title = "View MDX";
        this.options.closeText = "OK";
        this.message = _.template("<textarea><%= mdx %></textarea>")(args);
        console.log(this.message);
    }
});