var Template = function() {
    this._catalog = ["WorkspaceToolbar", "Workspace"];
    this._templates = {};
    
    this.get = function(template) {
        return this._templates[template] || function() {};
    };
    
    for (var i = 0; i < this._catalog.length; i++) {
        var template_name = this._catalog[i];
        var fetch = $.get("js/saiku/templates/" + template_name + ".html", 
                function(data, textStatus, jqXHR) {
            jqXHR.templates[jqXHR.index] = _.template(data);
        });
        
        fetch.index = template_name;
        fetch.templates = this._templates;
    }
};