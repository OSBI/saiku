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
 * Model which fetches the dimensions for a cube
 */
var Dimension = Backbone.Model.extend({
    initialize: function(args) {
        this.url = Saiku.session.username + "/discover/" +
            args.key + "/dimensions";
    },
    
    parse: function(response) {
        this.set({
            template: _.template($("#template-dimensions").html())({
                dimensions: response
            }),
            
            data: response
        });
        
        typeof localStorage !== "undefined" && localStorage && localStorage.setItem("dimension." + this.get('key'),
                JSON.stringify(this));
        
        return response;
    }
});

/**
 * Model which fetches the measures for a cube
 */
var Measure = Backbone.Model.extend({
    initialize: function(args) {
        this.url = Saiku.session.username + "/discover/" +
            args.key + "/measures";
    },
    
    parse: function(response) {
        this.set({ 
            template: _.template($("#template-measures").html())({
                measures: response
            }),
            
            data: response
        });
        
        typeof localStorage !== "undefined" && localStorage && localStorage.setItem("measure." + this.get('key'),
                JSON.stringify(this));
        
        return response;
    }
});
