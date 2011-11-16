/*
 * Content-Type:text/javascript
 *
 * A bridge between iPad and iPhone touch events and jquery draggable,
 * sortable etc. mouse interactions.
 * @author Oleg Slobodskoi
 *
 * modified by John Hardy to use with any touch device
 * fixed breakage caused by jquery.ui so that mouseHandled internal flag is reset
 * before each touchStart event
 *
 * modified by Nik Graf to trigger click event inside widgets in case they haven't be moved
 *
 */
(function( $ ) {

    $.support.touch = typeof Touch === 'object';

    if (!$.support.touch) {
        return;
    }

    var proto =  $.ui.mouse.prototype,
    _mouseInit = proto._mouseInit;

    $.extend( proto, {
        _mouseInit: function() {
 			console.log("this:" + this);
 			console.log("this.element:" + this.element);
            this.element
            .bind( "touchstart." + this.widgetName, $.proxy( this, "_touchStart" ) );
            _mouseInit.apply( this, arguments );
        },

        _touchStart: function( event ) {
            if ( event.originalEvent.targetTouches.length != 1 ) {
                return false;
            }

 			
            // reset touchMoved to provide a clean state after touch start
            this._touchMoved = false;

            this.element
            .bind( "touchmove." + this.widgetName, $.proxy( this, "_touchMove" ) )
            .bind( "touchend." + this.widgetName, $.proxy( this, "_touchEnd" ) );

            this._modifyEvent( event );

            $( document ).trigger($.Event("mouseup")); //reset mouseHandled flag in ui.mouse
            this._mouseDown( event );

            return false;
        },

        _touchMove: function( event ) {
 	 			console.log('######### first:' + event);

            this._touchMoved = true;
            this._modifyEvent( event );
 			console.log('this._modifyEvent:' + this._modifyEvent);
 			console.log('this._mouseMove:' + this._mouseMove);
 			console.log('######### event:' + event);
            this._mouseMove( event );
 			console.log('######### after:' + event);
        },

        _touchEnd: function( event ) {
            this.element
            .unbind( "touchmove." + this.widgetName )
            .unbind( "touchend." + this.widgetName );
            this._mouseUp( event );
            if (!this._touchMoved) {
                this._touchMoved = false;
                // since $(event.target).click() does not work properly on ios we need to call the click event in this way
                // see http://stackoverflow.com/questions/3543733/jquery-trigger-click-mobile-safari-ipad
                var clickEvent = document.createEvent("MouseEvents");
                clickEvent.initMouseEvent("click", true, true, window, 0, event.screenX, event.screenY, event.clientX, event.clientY, false, false, false, false, 0, null);
                $(event.currentTarget)[0].dispatchEvent(clickEvent);
            }
        },

        _modifyEvent: function( event ) {
            event.which = 1;
            var target = event.originalEvent.targetTouches[0];
            event.pageX = target.clientX;
            event.pageY = target.clientY;
        }

    });

})( jQuery );