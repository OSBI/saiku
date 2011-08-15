var SaveQuery = Modal.extend({
    type: "save",
    closeText: "Save",
    
    events: {
        'submit #save_query_form': 'save',
        'click .close': 'save'
    },
    
    initialize: function(args) {
        var name = args.query.name ? args.query.name : "";
        this.query = args.query;
        this.message = _.template("<form id='save_query_form'>" +
            "<label for='name'>To save a new query, " + 
            "please type a name in the text box below:</label><br />" +
            "<input type='text' name='name' value='<%= name %>' />" +
            "</form>")({ name: name });
        _.extend(this.options, {
            title: "Save query"
        });
        
        // Focus on query name
        $(this.el).find('input').select().focus();
        
        // Maintain `this`
        _.bindAll(this, "copy_to_repository", "close");
    },
    
    save: function(event) {
        // Save the name for future reference
        var name = $(this.el).find('input[name="name"]').val();
        this.query.set({ name: name });
        this.query.trigger('query:save');
        $(this.el).find('form').html("Saving query...");
        
        // Fetch query XML and save to repository
        this.query.action.get("/xml", {
            success: this.copy_to_repository
        });
        
        event.preventDefault();
        return false;
    },
    
    copy_to_repository: function(model, response) {
        (new SavedQuery({
            name: this.query.uuid,
            newname: this.query.get('name'),
            xml: response
        })).save({ success: this.close });
    }
});