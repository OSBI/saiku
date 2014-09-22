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
        var template = $("#template-splash").html() || "";
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
    }

});