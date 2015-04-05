/**
 * Created by bugg on 17/06/14.
 */
var SplashScreen = Backbone.View.extend({
    events: {
        'click .run_query': 'run_query',
        'click .run_dashboard': 'run_dashboard'
    },
    run_query : function(){
        Saiku.tabs.add(new Workspace());
        return false;
    },
    run_dashboard : function(){
        new DashboardModal().render().open();
        return false;
    },
    template: function() {
        var template = $("<div> <div id='splash'> <nav> <ul> <li class='active'><a class='welcome' href='#'>Welcome</a></li><li><a class='features' href='#'>Features</a></li><li><a class='help' href='#'>Get Help</a></li><li class='enterprisetoggle enterprise'><a class='enterprise' href='#'>Enterprise</a></li></ul> <h2>Explore Data. Visualise. Act.</h2> </nav> <section class='tabs'> <section style='margin-top:50px' id='welcome'> <h1 class='saikulogo'>Saiku</h1> <p>Saiku has the power to change the way you think about your business and make decisions. Saiku provides powerful, web based analytics for everyone in your organisation. Quickly and easily analyse data from any data source to discover what is really happening inside and outside your organisation. </p><h2>Quick Links</h2> <ul class='quicklinks'> <li><a class='run_query' href='#'>Create a new query</a></li><li><a href='http://saiku.meteorite.bi' target='_blank'>Visit the website</a></li><li><a href='http://jira.meteorite.bi' target='_blank'>Report a bug</a></li></ul> <p class='fixed'><a class='enterprisetoggle button' href='http://meteorite.bi' target='_blank'>Get Enterprise</a></p><h2>News</h2> <div id='news'></div></section> <section style='display:none !important;margin-top:50px' id='features'> <h1 class='saikulogo'>Saiku</h1> <h2>Features</h2> <h3>Web Based Analysis</h3> <p>Saiku provides the user with an entirely browser based experience. We support all modern browsers, and our user interface is 100% HTML and Javascript. <br/>Saiku uses REST based communications, this allows the development of custom user interfaces and facilitates the easy integration of the Saiku Server into other applications and services.</p><h3>Standards Compliant</h3> <p>Saiku is based upon the Microsoft MDX query language and will work on most JDBC compliant data sources. We also provide a number of connectors to NOSQL data sources.</p><h3>Dynamic charting</h3> <p>Saiku uses a flexible charting engine to provide a wide range of charts and graphs. These are all HTML & Javascript only and don't require flash to be installed on the computer.</p><h3>Pluggable visualisation engine</h3> <p>Saiku Enterprise boasts a fully pluggable visualisation engine. This allows developers to build third party extensions and plug them into Saiku Enterprise to extend or replace the existing visualisations.</p></section> <section style='display:none !important;margin-top:50px' id='help'> <h1 class='saikulogo'>Saiku</h1> <h2>Help</h2> <p>We provide Training, Consulting and Support to ensure you get the most from Saiku and your data. Our services cover all aspects of data analysis including data strategy, design, architecture, deployment and application/software support.</p><table style='margin-bottom:100px;'> <tr> <th>Wiki</th>  <th>Support</th> </tr><tr> <td>Why not try our new <a href='http://wiki.meteorite.bi' target='_blank'>Wiki site</a><br/>for community documentation.</td><td>If you require more, <br/><a href='mailto:info@meteorite.bi'>contact us</a> for support!.</td></tr></table> </section> <section style='display:none !important;margin-top:50px' id='enterprise'> <h1 class='saikulogo'>Saiku</h1> <h2>Enterprise</h2> <p>Saiku Enterprise is our fully supported and tested server and Pentaho plugin system. Buy Saiku Enterprise from as little as $15 per user per month and enjoy the addtional features Saiku Enterprise has to offer</p><p>To find out more visit our <a href='http://meteorite.bi' target='_blank'>site</a> or <a href='mailto:info@meteorite.bi'>schedule a call</a> with one of us and we can show you why you should choose Saiku Enterprise!</p></section> </section> </div></div>").html() || "";
        return _.template(template)({
        //    cube_navigation: Saiku.session.sessionworkspace.cube_navigation
        });
    },
    setupPage: function(e){
        var height = $(window).height();
        $('body').height(height);
        $('.tabs section').each(function(){
            var vH = $(this).height();
            var dif = ((height - vH)/2)-50;
            if(dif<0){
                dif = 20;
            }
            //$(this).css('margin-top',dif+'px').hide();
        });
        var active = $('nav li.active a').attr('class');
        $('#'+active).fadeIn();
    },
    render: function(){
      $(this.el).html(this.template()).appendTo($('body'));
		var license = new License();
		var that = this;
		if(Settings.BIPLUGIN5){
			license.fetch_license('api/api/license', function (opt) {
				if (opt.status !== 'error' && opt.data.get("licenseType") != "trial") {
					$(".enterprisetoggle").css("visibility", "hidden");
				}
			});
		}
		else {
			license.fetch_license('api/license/', function (opt) {
				if (opt.status !== 'error' && opt.data.get("licenseType") != "trial") {
					$(".enterprisetoggle").css("visibility", "hidden");
				}
			});
		}
		this.getNews();

      this.setupPage();
      $('nav li a').click(function(){
          var active = $(this).attr('class');
          $('nav li').removeClass('active');
          $(this).parent().addClass('active');
          $('.tabs section').hide();
          $('#'+active).fadeIn();
      });
      return this;
  },
    remove:function(){
        $(this.el).remove();
    },
    caption: function(increment) {
        return "Home";
    },
	getNews: function(){
		var that = this;
		$.ajax({
			type: 'GET',
			url: "http://meteorite.bi/news.json",
			async: false,
			contentType: "application/json",
			dataType: 'jsonp',    
			jsonpCallback: 'jsonCallback',

			success: function(json) {
				for(var i = 0; i<json.item.length;i++){
					$(that.el).find("#news").append("<h4 style='margin-left: 0.5%;color:#6D6E71;'>"+json.item[i].title+"</h4><strong style='margin-left: 0.5%;color:#6D6E71;'>"+json.item[i].date+"</strong>" +
					"<br/><p style='color:#6D6E71;'>"+json.item[i].body+"</p>")
				}
				console.dir(json.item[0].tid);
			},
			error: function(e) {
				console.log(e.message);
			}
		});
	}

});
