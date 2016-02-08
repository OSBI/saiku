var saikuWidgetComponent = BaseComponent.extend({

	update : function() {
		var myself=this;
		var htmlId = "#" + myself.htmlObject;
		if (myself.saikuFilePath.substr(0,1) == "/") {
			myself.saikuFilePath = myself.saikuFilePath.substr(1,myself.saikuFilePath.length - 1 );
		}

		var parameters = {};
		if (myself.parameters) {
			_.each(myself.parameters, function(parameter) {
				var k = parameter[0];
				var v = parameter[1];
				
				if (window.hasOwnProperty(v)) {
					v = window[v];
				}
				parameters[k] = v;
			});
		}
		if (myself.width) {
			$(htmlId).width(myself.width);
		}
		if (myself.width) {
			$(htmlId).height(myself.height);
		}
		if ("table" == myself.renderMode) {
			$(htmlId).addClass('workspace_results');
			var t = $("<div></div>");
			$(htmlId).html(t);
			htmlId = t;
		}
		var myClient = new SaikuClient({
		    server: "/pentaho/plugin/saiku/api",
		    path: "/cde-component"
		});

		myClient.execute({
		    file: myself.saikuFilePath,
		    htmlObject: htmlId,
		    render: myself.renderMode,
		    mode: myself.renderType,
		    zoom: true,
		    params: parameters
		});

	}
});
