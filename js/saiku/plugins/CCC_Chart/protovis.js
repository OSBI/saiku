// 2fdb46e8b162967f09d64a40655084644b1ab08c
/**
 * @class The built-in Array class.
 * @name Array
 */

/**
 * Creates a new array with the results of calling a provided function on every
 * element in this array. Implemented in Javascript 1.6.
 *
 * @function
 * @name Array.prototype.map
 * @see <a
 * href="https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Objects/Array/Map">map</a>
 * documentation.
 * @param {function} f function that produces an element of the new Array from
 * an element of the current one.
 * @param [o] object to use as <tt>this</tt> when executing <tt>f</tt>.
 */
if (!Array.prototype.map) Array.prototype.map = function(f, o) {
  var n = this.length;
  var result = new Array(n);
  for (var i = 0; i < n; i++) {
    if (i in this) {
      result[i] = f.call(o, this[i], i, this);
    }
  }
  return result;
};

/**
 * Creates a new array with all elements that pass the test implemented by the
 * provided function. Implemented in Javascript 1.6.
 *
 * @function
 * @name Array.prototype.filter
 * @see <a
 * href="https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Objects/Array/filter">filter</a>
 * documentation.
 * @param {function} f function to test each element of the array.
 * @param [o] object to use as <tt>this</tt> when executing <tt>f</tt>.
 */
if (!Array.prototype.filter) Array.prototype.filter = function(f, o) {
  var n = this.length;
  var result = new Array();
  for (var i = 0; i < n; i++) {
    if (i in this) {
      var v = this[i];
      if (f.call(o, v, i, this)) result.push(v);
    }
  }
  return result;
};

/**
 * Executes a provided function once per array element. Implemented in
 * Javascript 1.6.
 *
 * @function
 * @name Array.prototype.forEach
 * @see <a
 * href="https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Objects/Array/ForEach">forEach</a>
 * documentation.
 * @param {function} f function to execute for each element.
 * @param [o] object to use as <tt>this</tt> when executing <tt>f</tt>.
 */
if (!Array.prototype.forEach) Array.prototype.forEach = function(f, o) {
  var n = this.length >>> 0;
  for (var i = 0; i < n; i++) {
    if (i in this) f.call(o, this[i], i, this);
  }
};

/**
 * Apply a function against an accumulator and each value of the array (from
 * left-to-right) as to reduce it to a single value. Implemented in Javascript
 * 1.8.
 *
 * @function
 * @name Array.prototype.reduce
 * @see <a
 * href="https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Objects/Array/Reduce">reduce</a>
 * documentation.
 * @param {function} f function to execute on each value in the array.
 * @param [v] object to use as the first argument to the first call of
 * <tt>t</tt>.
 */
if (!Array.prototype.reduce) Array.prototype.reduce = function(f, v) {
  var len = this.length;
  if (!len && (arguments.length == 1)) {
    throw new Error("reduce: empty array, no initial value");
  }

  var i = 0;
  if (arguments.length < 2) {
    while (true) {
      if (i in this) {
        v = this[i++];
        break;
      }
      if (++i >= len) {
        throw new Error("reduce: no values, no initial value");
      }
    }
  }

  for (; i < len; i++) {
    if (i in this) {
      v = f(v, this[i], i, this);
    }
  }
  return v;
};

if (!Array.prototype.indexOf) Array.prototype.indexOf = function (s, from) {
  var n = this.length >>> 0,
      i = (!isFinite(from) || from < 0) ? 0 : (from > this.length) ? this.length : from;
  for (; i < n; i++) { if (this[i] === s) { return i; } }
  return -1;
};

/**
 * The top-level Protovis namespace. All public methods and fields should be
 * registered on this object. Note that core Protovis source is surrounded by an
 * anonymous function, so any other declared globals will not be visible outside
 * of core methods. This also allows multiple versions of Protovis to coexist,
 * since each version will see their own <tt>pv</tt> namespace.
 *
 * @namespace The top-level Protovis namespace, <tt>pv</tt>.
 */
var pv = {};

/**
 * Protovis major and minor version numbers.
 *
 * @namespace Protovis major and minor version numbers.
 */
pv.version = {
  /**
   * The major version number.
   *
   * @type number
   * @constant
   */
  major: 3,

  /**
   * The minor version number.
   *
   * @type number
   * @constant
   */
  minor: 3
};

/**
 * Returns the passed-in argument, <tt>x</tt>; the identity function. This method
 * is provided for convenience since it is used as the default behavior for a
 * number of property functions.
 *
 * @param x a value.
 * @returns the value <tt>x</tt>.
 */
pv.identity = function(x) { return x; };

/**
 * Returns <tt>this.index</tt>. This method is provided for convenience for use
 * with scales. For example, to color bars by their index, say:
 *
 * <pre>.fillStyle(pv.Colors.category10().by(pv.index))</pre>
 *
 * This method is equivalent to <tt>function() this.index</tt>, but more
 * succinct. Note that the <tt>index</tt> property is also supported for
 * accessor functions with {@link pv.max}, {@link pv.min} and other array
 * utility methods.
 *
 * @see pv.Scale
 * @see pv.Mark#index
 */
pv.index = function() { return this.index; };

/**
 * Returns <tt>this.childIndex</tt>. This method is provided for convenience for
 * use with scales. For example, to color bars by their child index, say:
 *
 * <pre>.fillStyle(pv.Colors.category10().by(pv.child))</pre>
 *
 * This method is equivalent to <tt>function() this.childIndex</tt>, but more
 * succinct.
 *
 * @see pv.Scale
 * @see pv.Mark#childIndex
 */
pv.child = function() { return this.childIndex; };

/**
 * Returns <tt>this.parent.index</tt>. This method is provided for convenience
 * for use with scales. This method is provided for convenience for use with
 * scales. For example, to color bars by their parent index, say:
 *
 * <pre>.fillStyle(pv.Colors.category10().by(pv.parent))</pre>
 *
 * This method is equivalent to <tt>function() this.parent.index</tt>, but more
 * succinct.
 *
 * @see pv.Scale
 * @see pv.Mark#index
 */
pv.parent = function() { return this.parent.index; };

/**
 * Stores the current event. This field is only set within event handlers.
 *
 * @type Event
 * @name pv.event
 */
(function() {
/**
 * @private Returns a prototype object suitable for extending the given class
 * <tt>f</tt>. Rather than constructing a new instance of <tt>f</tt> to serve as
 * the prototype (which unnecessarily runs the constructor on the created
 * prototype object, potentially polluting it), an anonymous function is
 * generated internally that shares the same prototype:
 *
 * <pre>function g() {}
 * g.prototype = f.prototype;
 * return new g();</pre>
 *
 * For more details, see Douglas Crockford's essay on prototypal inheritance.
 *
 * @param {function} f a constructor.
 * @returns a suitable prototype object.
 * @see Douglas Crockford's essay on <a
 * href="http://javascript.crockford.com/prototypal.html">prototypal
 * inheritance</a>.
 */
pv.extend = Object.create ?
    function(f){
      return Object.create(f.prototype || f);
    } :
    function(f) {
      function g() {}
      g.prototype = f.prototype || f;
      return new g();
    };

pv.extendType = function(g, f) {
    var sub = g.prototype = pv.extend(f);

    // Fix the constructor
    sub.constructor = g;

    return g;
};

// Is there any browser (still) supporting this syntax?
// Commented cause this messes up with the debugger's break on exceptions.

//try {
//  eval("pv.parse = function(x) x;"); // native support
//} catch (e) {

/**
 * @private Parses a Protovis specification, which may use JavaScript 1.8
 * function expresses, replacing those function expressions with proper
 * functions such that the code can be run by a JavaScript 1.6 interpreter. This
 * hack only supports function expressions (using clumsy regular expressions, no
 * less), and not other JavaScript 1.8 features such as let expressions.
 *
 * @param {string} s a Protovis specification (i.e., a string of JavaScript 1.8
 * source code).
 * @returns {string} a conformant JavaScript 1.6 source code.
 */
 pv.parse = function(js) { // hacky regex support
    var re = new RegExp("function\\s*(\\b\\w+)?\\s*\\([^)]*\\)\\s*", "mg"), m, d, i = 0, s = "";
    while (m = re.exec(js)) {
      var j = m.index + m[0].length;
      if (js.charAt(j) != '{') {
        s += js.substring(i, j) + "{return ";
        i = j;
        for (var p = 0; p >= 0 && j < js.length; j++) {
          var c = js.charAt(j);
          switch (c) {
            case '"': case '\'': {
              while (++j < js.length && (d = js.charAt(j)) != c) {
                if (d == '\\') j++;
              }
              break;
            }
            case '[': case '(': p++; break;
            case ']': case ')': p--; break;
            case ';':
            case ',': if (p == 0) p--; break;
          }
        }
        s += pv.parse(js.substring(i, --j)) + ";}";
        i = j;
      }
      re.lastIndex = j;
    }
    s += js.substring(i);
    return s;
  };

/**
 * @private Reports the specified error to the JavaScript console. Mozilla only
 * allows logging to the console for privileged code; if the console is
 * unavailable, the alert dialog box is used instead.
 *
 * @param e the exception that triggered the error.
 */
pv.error = function(e) {
  (typeof console === "undefined" || !console.error) ? alert(e) : console.error(e);
};

/**
 * @private Registers the specified listener for events of the specified type on
 * the specified target. For standards-compliant browsers, this method uses
 * <tt>addEventListener</tt>; for Internet Explorer, <tt>attachEvent</tt>.
 *
 * @param target a DOM element.
 * @param {string} type the type of event, such as "click".
 * @param {function} the event handler callback.
 */
pv.listen = function(target, type, listener) {
  listener = pv.listener(listener);

  if (type === 'load' || type === 'onload'){
      return pv.listenForPageLoad(listener);
  }

  if(target.addEventListener){
    target.addEventListener(type, listener, false);
  } else {
      if (target === window) {
        target = document.documentElement;
      }

      target.attachEvent('on' + type, listener);
  }

  return listener;
};

/**
 * @private Unregisters the specified listener for events of the specified type on
 * the specified target.
 *
 * @param target a DOM element.
 * @param {string} type the type of event, such as "click".
 * @param {function} the event handler callback or the result of {@link pv.listen}.
 */
pv.unlisten = function(target, type, listener){
    if(listener.$listener){
        listener = listener.$listener;
    }

    target.removeEventListener
        ? target.removeEventListener(type, listener, false)
        : target.detachEvent('on' + type, listener);
};

/**
 * @private Returns a wrapper for the specified listener function such that the
 * {@link pv.event} is set for the duration of the listener's invocation. The
 * wrapper is cached on the returned function, such that duplicate registrations
 * of the wrapped event handler are ignored.
 *
 * @param {function} f an event handler.
 * @returns {function} the wrapped event handler.
 */
pv.listener = function(f) {
  return f.$listener || (f.$listener = function(ev) {
      try {
        // In some rare cases, there's no event... (see {@see #listenForPageLoad})
        pv.event = ev = ev && pv.fixEvent(ev);

        return f.call(this, ev);
      } catch (ex) {
          // swallow top level error
          pv.error(ex);
      } finally {
        delete pv.event;
      }
  });
};

pv.fixEvent = function(ev){
    // Fix event (adapted from jQuery)
    if(ev.pageX == null && ev.clientX != null) {
        var eventDoc = (ev.target && ev.target.ownerDocument) || document;
        var doc  = eventDoc.documentElement;
        var body = eventDoc.body;

        ev.pageX = (ev.clientX * 1) + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
        ev.pageY = (ev.clientY * 1) + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
    }

    return ev;
};

/**
 * @private Returns true iff <i>a</i> is an ancestor of <i>e</i>. This is useful
 * for ignoring mouseout and mouseover events that are contained within the
 * target element.
 */
pv.ancestor = function(a, e) {
  while (e) {
    if (e == a) return true;
    e = e.parentNode;
  }
  return false;
};

pv.getWindow = function(elem) {
    return (elem != null && elem == elem.window) ?
        elem :
        elem.nodeType === 9 ?
            elem.defaultView || elem.parentWindow :
            false;
};

var _reHiphenSep = /\-([a-z])/g;

pv.hiphen2camel = function(prop) {
    if (_reHiphenSep.test(prop)) {
        return prop.replace(_reHiphenSep, function($0, $1) {
            return $1.toUpperCase();
        });
    }
    return prop;
};

// Capture the "most" native possible version, not some poly-fill
var _getCompStyle = window.getComputedStyle;

/**
 * @private Computes the value of the specified CSS property <tt>p</tt> on the
 * specified element <tt>e</tt>.
 *
 * @param {string} p the name of the CSS property.
 * @param e the element on which to compute the CSS property.
 */
pv.css = function(e, p) {
  // Assuming element is of the same window as this script.
  return _getCompStyle ?
         _getCompStyle.call(window, e, null).getPropertyValue(p) :
         e.currentStyle[p === 'float' ? 'styleFloat' : pv.hiphen2camel(p)];
};

pv.cssStyle = function(e) {
    var style;
    if(_getCompStyle) {
        style = _getCompStyle.call(window, e, null);
        return function(p) { return style.getPropertyValue(p); };
    }

    style = e.currentStyle;
    return function(p) { return style[p === 'float' ? 'styleFloat' : pv.hiphen2camel(p)]; };
};

pv._getElementsByClass = function(searchClass, node) {
  if(node == null) { node = document; }

  var classElements = [],
      els = node.getElementsByTagName("*"),
      L = els.length,
      pattern = new RegExp("(^|\\s)" + searchClass + "(\\s|$)"), i, j;

  for (i = 0, j = 0 ; i < L ; i++) {
    if (pattern.test(els[i].className)) {
      classElements[j] = els[i];
      j++;
    }
  }

  return classElements;
};

pv.getElementsByClassName = function(node, classname) {
  // use native implementation if available
  return node.getElementsByClassName ?
         node.getElementsByClassName(classname) :
         pv._getElementsByClass(classname, node);
};

/* Adapted from jQuery.offset()
 */
pv.elementOffset = function(elem) {
    var docElem, body, win, clientTop, clientLeft, scrollTop, scrollLeft,
        box = { top: 0, left: 0 },
        doc = elem && elem.ownerDocument;

    if (!doc) {
        return;
    }

    body = doc.body;
    if(body === elem)  {
        return; // not supported
    }

    docElem = doc.documentElement;

    if ( typeof elem.getBoundingClientRect !== "undefined" ) {
        box = elem.getBoundingClientRect();
    }

    win = pv.getWindow(doc);

    clientTop  = docElem.clientTop  || body.clientTop  || 0;
    clientLeft = docElem.clientLeft || body.clientLeft || 0;
    scrollTop  = win.pageYOffset || docElem.scrollTop;
    scrollLeft = win.pageXOffset || docElem.scrollLeft;
    return {
        top:  box.top  + scrollTop  - clientTop,
        left: box.left + scrollLeft - clientLeft
    };
};

/**
 * Binds to the page ready event in a browser-agnostic
 * fashion (i.e. that works under IE!)
 */
pv.listenForPageLoad = function(listener) {

    // Catch cases where $(document).ready() is called after the
    // browser event has already occurred.
    if ( document.readyState === "complete" ) {
        listener(null); // <-- no event object to give
    }

    if (pv.renderer() === "svgweb") {
        // SVG web adds addEventListener to IE.
        window.addEventListener("SVGLoad", listener, false);
    } else {
        // Mozilla, Opera and webkit nightlies currently support this event
        if ( document.addEventListener ) {
            window.addEventListener("load", listener, false);

        // If IE event model is used
        } else if ( document.attachEvent ) {
            window.attachEvent("onload", listener);
        }
    }
};

/**
 * @public Returns the name of the renderer we're using -
 *
 * 'nativesvg' is the default - the native svg of the browser.
 * 'svgweb' is if we identify svgweb is there.
 */

pv.renderer = function(){
    var renderer = (typeof document.svgImplementation !== "undefined") ?
                   document.svgImplementation :
                   (typeof window.svgweb === "undefined") ? "nativesvg" : "svgweb";

    pv.renderer = function(){ return renderer; };

    return renderer;
};

/** @private Returns a locally-unique positive id. */
pv.id = function() {
  var id = 1; return function() { return id++; };
}();

/** @private Returns a function wrapping the specified constant. */
pv.functor = function(v) {
  return typeof v == "function" ? v : function() { return v; };
};

/**
 * Gets the value of an existing, own or inherited, and not "nully", property of an object,
 * or if unsatisfied, a specified default value.
 *
 * @param {object} [o] The object whose property value is desired.
 * @param {string} p The desired property name.
 * If the value is not a string,
 * it is converted to one, as if String(p) were used.
 * @param [dv=undefined] The default value.
 *
 * @returns {any} The satisfying property value or the specified default value.
 */
pv.get = function(o, p, dv){
    var v;
    return o && (v = o[p]) != null ? v : dv;
};

}());/*
 * Parses the Protovis specifications on load, allowing the use of JavaScript
 * 1.8 function expressions on browsers that only support JavaScript 1.6.
 * This should only happen for browser environments, so we exclude batik.
 * @see pv.parse
 */
if (pv.renderer() !== "batik") {
  pv.listen(window, "load", function() {
     /*
      * Note: in Firefox any variables declared here are visible to the eval'd
      * script below. Even worse, any global variables declared by the script
      * could overwrite local variables here (such as the index, `i`)!  To protect
      * against this, all variables are explicitly scoped on a pv.$ object.
      */
     pv.$ = {i:0, x:document.getElementsByTagName("script")};
      pv.$.xlen = pv.$.x.length;
      for (; pv.$.i < pv.$.xlen; pv.$.i++) {
        pv.$.s = pv.$.x[pv.$.i];
        if (pv.$.s.type == "text/javascript+protovis") {
          try {
            window.eval(pv.parse(pv.$.s.text));
          } catch (e) {
            pv.error(e);
          }
        }
      }
      delete pv.$;
    });
}
/**
 * Abstract; see an implementing class.
 *
 * @class Represents an abstract text formatter and parser. A <i>format</i> is a
 * function that converts an object of a given type, such as a <tt>Date</tt>, to
 * a human-readable string representation. The format may also have a
 * {@link #parse} method for converting a string representation back to the
 * given object type.
 *
 * <p>Because formats are themselves functions, they can be used directly as
 * mark properties. For example, if the data associated with a label are dates,
 * a date format can be used as label text:
 *
 * <pre>    .text(pv.Format.date("%m/%d/%y"))</pre>
 *
 * And as with scales, if the format is used in multiple places, it can be
 * convenient to declare it as a global variable and then reference it from the
 * appropriate property functions. For example, if the data has a <tt>date</tt>
 * attribute, and <tt>format</tt> references a given date format:
 *
 * <pre>    .text(function(d) format(d.date))</pre>
 *
 * Similarly, to parse a string into a date:
 *
 * <pre>var date = format.parse("4/30/2010");</pre>
 *
 * Not all format implementations support parsing. See the implementing class
 * for details.
 *
 * @see pv.Format.date
 * @see pv.Format.number
 * @see pv.Format.time
 */
pv.Format = {};

/**
 * Formats the specified object, returning the string representation.
 *
 * @function
 * @name pv.Format.prototype.format
 * @param {object} x the object to format.
 * @returns {string} the formatted string.
 */

/**
 * Parses the specified string, returning the object representation.
 *
 * @function
 * @name pv.Format.prototype.parse
 * @param {string} x the string to parse.
 * @returns {object} the parsed object.
 */

/**
 * @private Given a string that may be used as part of a regular expression,
 * this methods returns an appropriately quoted version of the specified string,
 * with any special characters escaped.
 *
 * @param {string} s a string to quote.
 * @returns {string} the quoted string.
 */
pv.Format.re = function(s) {
  return s.replace(/[\\\^\$\*\+\?\[\]\(\)\.\{\}]/g, "\\$&");
};

/**
 * @private Optionally pads the specified string <i>s</i> so that it is at least
 * <i>n</i> characters long, using the padding character <i>c</i>.
 *
 * @param {string} c the padding character.
 * @param {number} n the minimum string length.
 * @param {string} s the string to pad.
 * @returns {string} the padded string.
 */
pv.Format.pad = function(c, n, s) {
  var m = n - String(s).length;
  return (m < 1) ? s : new Array(m + 1).join(c) + s;
};
/**
 * Constructs a new date format with the specified string pattern.
 *
 * @class The format string is in the same format expected by the
 * <tt>strftime</tt> function in C. The following conversion specifications are
 * supported:<ul>
 *
 * <li>%a - abbreviated weekday name.</li>
 * <li>%A - full weekday name.</li>
 * <li>%b - abbreviated month names.</li>
 * <li>%B - full month names.</li>
 * <li>%c - locale's appropriate date and time.</li>
 * <li>%C - century number.</li>
 * <li>%d - day of month [01,31] (zero padded).</li>
 * <li>%D - same as %m/%d/%y.</li>
 * <li>%e - day of month [ 1,31] (space padded).</li>
 * <li>%h - same as %b.</li>
 * <li>%H - hour (24-hour clock) [00,23] (zero padded).</li>
 * <li>%I - hour (12-hour clock) [01,12] (zero padded).</li>
 * <li>%m - month number [01,12] (zero padded).</li>
 * <li>%M - minute [0,59] (zero padded).</li>
 * <li>%n - newline character.</li>
 * <li>%p - locale's equivalent of a.m. or p.m.</li>
 * <li>%r - same as %I:%M:%S %p.</li>
 * <li>%R - same as %H:%M.</li>
 * <li>%S - second [00,61] (zero padded).</li>
 * <li>%t - tab character.</li>
 * <li>%T - same as %H:%M:%S.</li>
 * <li>%x - same as %m/%d/%y.</li>
 * <li>%X - same as %I:%M:%S %p.</li>
 * <li>%y - year with century [00,99] (zero padded).</li>
 * <li>%Y - year including century.</li>
 * <li>%% - %.</li>
 *
 * </ul>The following conversion specifications are currently <i>unsupported</i>
 * for formatting:<ul>
 *
 * <li>%j - day number [1,366].</li>
 * <li>%u - weekday number [1,7].</li>
 * <li>%U - week number [00,53].</li>
 * <li>%V - week number [01,53].</li>
 * <li>%w - weekday number [0,6].</li>
 * <li>%W - week number [00,53].</li>
 * <li>%Z - timezone name or abbreviation.</li>
 *
 * </ul>In addition, the following conversion specifications are currently
 * <i>unsupported</i> for parsing:<ul>
 *
 * <li>%a - day of week, either abbreviated or full name.</li>
 * <li>%A - same as %a.</li>
 * <li>%c - locale's appropriate date and time.</li>
 * <li>%C - century number.</li>
 * <li>%D - same as %m/%d/%y.</li>
 * <li>%I - hour (12-hour clock) [1,12].</li>
 * <li>%n - any white space.</li>
 * <li>%p - locale's equivalent of a.m. or p.m.</li>
 * <li>%r - same as %I:%M:%S %p.</li>
 * <li>%R - same as %H:%M.</li>
 * <li>%t - same as %n.</li>
 * <li>%T - same as %H:%M:%S.</li>
 * <li>%x - locale's equivalent to %m/%d/%y.</li>
 * <li>%X - locale's equivalent to %I:%M:%S %p.</li>
 *
 * </ul>
 *
 * @see <a
 * href="http://www.opengroup.org/onlinepubs/007908799/xsh/strftime.html">strftime</a>
 * documentation.
 * @see <a
 * href="http://www.opengroup.org/onlinepubs/007908799/xsh/strptime.html">strptime</a>
 * documentation.
 * @extends pv.Format
 * @param {string} pattern the format pattern.
 */
pv.Format.date = function(pattern) {
  var pad = pv.Format.pad;

  /** @private */
  function format(d) {
    return pattern.replace(/%[a-zA-Z0-9]/g, function(s) {
        switch (s) {
          case '%a': return [
              "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
            ][d.getDay()];
          case '%A': return [
              "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
              "Saturday"
            ][d.getDay()];
          case '%h':
          case '%b': return [
              "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep",
              "Oct", "Nov", "Dec"
            ][d.getMonth()];
          case '%B': return [
              "January", "February", "March", "April", "May", "June", "July",
              "August", "September", "October", "November", "December"
            ][d.getMonth()];
          case '%c': return d.toLocaleString();
          case '%C': return pad("0", 2, Math.floor(d.getFullYear() / 100) % 100);
          case '%d': return pad("0", 2, d.getDate());
          case '%x':
          case '%D': return pad("0", 2, d.getMonth() + 1)
                    + "/" + pad("0", 2, d.getDate())
                    + "/" + pad("0", 2, d.getFullYear() % 100);
          case '%e': return pad(" ", 2, d.getDate());
          case '%H': return pad("0", 2, d.getHours());
          case '%I': {
            var h = d.getHours() % 12;
            return h ? pad("0", 2, h) : 12;
          }
          // TODO %j: day of year as a decimal number [001,366]
          case '%m': return pad("0", 2, d.getMonth() + 1);
          case '%M': return pad("0", 2, d.getMinutes());
          case '%n': return "\n";
          case '%p': return d.getHours() < 12 ? "AM" : "PM";
          case '%T':
          case '%X':
          case '%r': {
            var h = d.getHours() % 12;
            return (h ? pad("0", 2, h) : 12)
                    + ":" + pad("0", 2, d.getMinutes())
                    + ":" + pad("0", 2, d.getSeconds())
                    + " " + (d.getHours() < 12 ? "AM" : "PM");
          }
          case '%R': return pad("0", 2, d.getHours()) + ":" + pad("0", 2, d.getMinutes());
          case '%S': return pad("0", 2, d.getSeconds());
          case '%Q': return pad("0", 3, d.getMilliseconds());
          case '%t': return "\t";
          case '%u': {
            var w = d.getDay();
            return w ? w : 1;
          }
          // TODO %U: week number (sunday first day) [00,53]
          // TODO %V: week number (monday first day) [01,53] ... with weirdness
          case '%w': return d.getDay();
          // TODO %W: week number (monday first day) [00,53] ... with weirdness
          case '%y': return pad("0", 2, d.getFullYear() % 100);
          case '%Y': return d.getFullYear();
          // TODO %Z: timezone name or abbreviation
          case '%%': return "%";
        }
        return s;
      });
  }

  /**
   * Converts a date to a string using the associated formatting pattern.
   *
   * @function
   * @name pv.Format.date.prototype.format
   * @param {Date} date a date to format.
   * @returns {string} the formatted date as a string.
   */
  format.format = format;

  /**
   * Parses a date from a string using the associated formatting pattern.
   *
   * @function
   * @name pv.Format.date.prototype.parse
   * @param {string} s the string to parse as a date.
   * @returns {Date} the parsed date.
   */
  format.parse = function(s) {
    var year = 1970, month = 0, date = 1, hour = 0, minute = 0, second = 0;
    var fields = [function() {}];

    /* Register callbacks for each field in the format pattern. */
    var re = pv.Format.re(pattern).replace(/%[a-zA-Z0-9]/g, function(s) {
        switch (s) {
          // TODO %a: day of week, either abbreviated or full name
          // TODO %A: same as %a
          case '%b': {
            fields.push(function(x) { month = {
                  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7,
                  Sep: 8, Oct: 9, Nov: 10, Dec: 11
                }[x]; });
            return "([A-Za-z]+)";
          }
          case '%h':
          case '%B': {
            fields.push(function(x) { month = {
                  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
                  July: 6, August: 7, September: 8, October: 9, November: 10,
                  December: 11
                }[x]; });
            return "([A-Za-z]+)";
          }
          // TODO %c: locale's appropriate date and time
          // TODO %C: century number[0,99]
          case '%e':
          case '%d': {
            fields.push(function(x) { date = x; });
            return "([0-9]+)";
          }
          // TODO %D: same as %m/%d/%y
          case '%I':
          case '%H': {
            fields.push(function(x) { hour = x; });
            return "([0-9]+)";
          }
          // TODO %j: day number [1,366]
          case '%m': {
            fields.push(function(x) { month = x - 1; });
            return "([0-9]+)";
          }
          case '%M': {
            fields.push(function(x) { minute = x; });
            return "([0-9]+)";
          }
          // TODO %n: any white space
          // TODO %p: locale's equivalent of a.m. or p.m.
          case '%p': { // TODO this is a hack
            fields.push(function(x) {
              if (hour == 12) {
                if (x == "am") hour = 0;
              } else if (x == "pm") {
                hour = Number(hour) + 12;
              }
            });
            return "(am|pm)";
          }
          // TODO %r: %I:%M:%S %p
          // TODO %R: %H:%M
          case '%S': {
            fields.push(function(x) { second = x; });
            return "([0-9]+)";
          }
          // TODO %t: any white space
          // TODO %T: %H:%M:%S
          // TODO %U: week number [00,53]
          // TODO %w: weekday [0,6]
          // TODO %W: week number [00, 53]
          // TODO %x: locale date (%m/%d/%y)
          // TODO %X: locale time (%I:%M:%S %p)
          case '%y': {
            fields.push(function(x) {
                x = Number(x);
                year = x + (((0 <= x) && (x < 69)) ? 2000
                    : (((x >= 69) && (x < 100) ? 1900 : 0)));
              });
            return "([0-9]+)";
          }
          case '%Y': {
            fields.push(function(x) { year = x; });
            return "([0-9]+)";
          }
          case '%%': {
            fields.push(function() {});
            return "%";
          }
        }
        return s;
      });

    var match = s.match(re);
    if (match) match.forEach(function(m, i) { fields[i](m); });
    return new Date(year, month, date, hour, minute, second);
  };

  return format;
};
/**
 * Returns a time format of the given type, either "short" or "long".
 *
 * @class Represents a time format, converting between a <tt>number</tt>
 * representing a duration in milliseconds, and a <tt>string</tt>. Two types of
 * time formats are supported: "short" and "long". The <i>short</i> format type
 * returns a string such as "3.3 days" or "12.1 minutes", while the <i>long</i>
 * format returns "13:04:12" or similar.
 *
 * @extends pv.Format
 * @param {string} type the type; "short" or "long".
 */
pv.Format.time = function(type) {
  var pad = pv.Format.pad;

  /*
   * MILLISECONDS = 1
   * SECONDS = 1e3
   * MINUTES = 6e4
   * HOURS = 36e5
   * DAYS = 864e5
   * WEEKS = 6048e5
   * MONTHS = 2592e6
   * YEARS = 31536e6
   */

  /** @private */
  function format(t) {
    t = Number(t); // force conversion from Date
    switch (type) {
      case "short": {
        if (t >= 31536e6) {
          return (t / 31536e6).toFixed(1) + " years";
        } else if (t >= 6048e5) {
          return (t / 6048e5).toFixed(1) + " weeks";
        } else if (t >= 864e5) {
          return (t / 864e5).toFixed(1) + " days";
        } else if (t >= 36e5) {
          return (t / 36e5).toFixed(1) + " hours";
        } else if (t >= 6e4) {
          return (t / 6e4).toFixed(1) + " minutes";
        }
        return (t / 1e3).toFixed(1) + " seconds";
      }
      case "long": {
        var a = [],
            s = ((t % 6e4) / 1e3) >> 0,
            m = ((t % 36e5) / 6e4) >> 0;
        a.push(pad("0", 2, s));
        if (t >= 36e5) {
          var h = ((t % 864e5) / 36e5) >> 0;
          a.push(pad("0", 2, m));
          if (t >= 864e5) {
            a.push(pad("0", 2, h));
            a.push(Math.floor(t / 864e5).toFixed());
          } else {
            a.push(h.toFixed());
          }
        } else {
          a.push(m.toFixed());
        }
        return a.reverse().join(":");
      }
    }
  }

  /**
   * Formats the specified time, returning the string representation.
   *
   * @function
   * @name pv.Format.time.prototype.format
   * @param {number} t the duration in milliseconds. May also be a <tt>Date</tt>.
   * @returns {string} the formatted string.
   */
  format.format = format;

  /**
   * Parses the specified string, returning the time in milliseconds.
   *
   * @function
   * @name pv.Format.time.prototype.parse
   * @param {string} s a formatted string.
   * @returns {number} the parsed duration in milliseconds.
   */
  format.parse = function(s) {
    switch (type) {
      case "short": {
        var re = /([0-9,.]+)\s*([a-z]+)/g, a, t = 0;
        while (a = re.exec(s)) {
          var f = parseFloat(a[0].replace(",", "")), u = 0;
          switch (a[2].toLowerCase()) {
            case "year": case "years": u = 31536e6; break;
            case "week": case "weeks": u = 6048e5; break;
            case "day": case "days": u = 864e5; break;
            case "hour": case "hours": u = 36e5; break;
            case "minute": case "minutes": u = 6e4; break;
            case "second": case "seconds": u = 1e3; break;
          }
          t += f * u;
        }
        return t;
      }
      case "long": {
        var a = s.replace(",", "").split(":").reverse(), t = 0;
        if (a.length) t += parseFloat(a[0]) * 1e3;
        if (a.length > 1) t += parseFloat(a[1]) * 6e4;
        if (a.length > 2) t += parseFloat(a[2]) * 36e5;
        if (a.length > 3) t += parseFloat(a[3]) * 864e5;
        return t;
      }
    }
  }

  return format;
};
/**
 * Returns a default number format.
 *
 * @class Represents a number format, converting between a <tt>number</tt> and a
 * <tt>string</tt>. This class allows numbers to be formatted with variable
 * precision (both for the integral and fractional part of the number), optional
 * thousands grouping, and optional padding. The thousands (",") and decimal
 * (".") separator can be customized.
 *
 * @returns {pv.Format.number} a number format.
 */
pv.Format.number = function() {
  var mini = 0, // default minimum integer digits
      maxi = Infinity, // default maximum integer digits
      mins = 0, // mini, including group separators
      minf = 0, // default minimum fraction digits
      maxf = 0, // default maximum fraction digits
      maxk = 1, // 10^maxf
      padi = "0", // default integer pad
      padf = "0", // default fraction pad
      padg = true, // whether group separator affects integer padding
      decimal = ".", // default decimal separator
      group = ",", // default group separator
      np = "\u2212", // default negative prefix
      ns = ""; // default negative suffix

  /** @private */
  function format(x) {
    /* Round the fractional part, and split on decimal separator. */
    if (Infinity > maxf) x = Math.round(x * maxk) / maxk;
    var s = String(Math.abs(x)).split(".");
        
    /* Pad, truncate and group the integral part. */
    var i = s[0];
    if (i.length > maxi) i = i.substring(i.length - maxi);
    if (padg && (i.length < mini)) i = new Array(mini - i.length + 1).join(padi) + i;
    if (i.length > 3) i = i.replace(/\B(?=(?:\d{3})+(?!\d))/g, group);
    if (!padg && (i.length < mins)) i = new Array(mins - i.length + 1).join(padi) + i;
    s[0] = x < 0 ? np + i + ns : i;

    /* Pad the fractional part. */
    var f = s[1] || "";
    if (f.length > maxf){
        // In IE9 64 bit strange things happen with floating points
        // and the above division by maxk seems to sometimes result in 
        // floating point precision problems...
        f = s[1] = f.substr(0, maxf);
    }

    if (f.length < minf) s[1] = f + new Array(minf - f.length + 1).join(padf);

    return s.join(decimal);
  }

  /**
   * @function
   * @name pv.Format.number.prototype.format
   * @param {number} x
   * @returns {string}
   */
  format.format = format;

  /**
   * Parses the specified string as a number. Before parsing, leading and
   * trailing padding is removed. Group separators are also removed, and the
   * decimal separator is replaced with the standard point ("."). The integer
   * part is truncated per the maximum integer digits, and the fraction part is
   * rounded per the maximum fraction digits.
   *
   * @function
   * @name pv.Format.number.prototype.parse
   * @param {string} x the string to parse.
   * @returns {number} the parsed number.
   */
  format.parse = function(x) {
    var re = pv.Format.re;

    /* Remove leading and trailing padding. Split on the decimal separator, if exists. */
    var s = String(x).split(decimal);
    if(s.length == 1)
      s[1]="";
    s[0].replace(new RegExp("^(" + re(padi) + ")*"), "");
    s[1].replace(new RegExp("(" + re(padf) + ")*$"), "")

    /* Remove grouping and truncate the integral part. */
    var i = s[0].replace(new RegExp(re(group), "g"), "");
    if (i.length > maxi) i = i.substring(i.length - maxi);

    /* Round the fractional part. */
    var f = s[1] ? Number("0." + s[1]) : 0;
    if (Infinity > maxf) f = Math.round(f * maxk) / maxk;

    return Math.round(i) + f;
  };

  /**
   * Sets or gets the minimum and maximum number of integer digits. This
   * controls the number of decimal digits to display before the decimal
   * separator for the integral part of the number. If the number of digits is
   * smaller than the minimum, the digits are padded; if the number of digits is
   * larger, the digits are truncated, showing only the lower-order digits. The
   * default range is [0, Infinity].
   *
   * <p>If only one argument is specified to this method, this value is used as
   * both the minimum and maximum number. If no arguments are specified, a
   * two-element array is returned containing the minimum and the maximum.
   *
   * @function
   * @name pv.Format.number.prototype.integerDigits
   * @param {number} [min] the minimum integer digits.
   * @param {number} [max] the maximum integer digits.
   * @returns {pv.Format.number} <tt>this</tt>, or the current integer digits.
   */
  format.integerDigits = function(min, max) {
    if (arguments.length) {
      mini = Number(min);
      maxi = (arguments.length > 1) ? Number(max) : mini;
      mins = mini + Math.floor(mini / 3) * group.length;
      return this;
    }
    return [mini, maxi];
  };

  /**
   * Sets or gets the minimum and maximum number of fraction digits. The
   * controls the number of decimal digits to display after the decimal
   * separator for the fractional part of the number. If the number of digits is
   * smaller than the minimum, the digits are padded; if the number of digits is
   * larger, the fractional part is rounded, showing only the higher-order
   * digits. The default range is [0, 0].
   *
   * <p>If only one argument is specified to this method, this value is used as
   * both the minimum and maximum number. If no arguments are specified, a
   * two-element array is returned containing the minimum and the maximum.
   *
   * @function
   * @name pv.Format.number.prototype.fractionDigits
   * @param {number} [min] the minimum fraction digits.
   * @param {number} [max] the maximum fraction digits.
   * @returns {pv.Format.number} <tt>this</tt>, or the current fraction digits.
   */
  format.fractionDigits = function(min, max) {
    if (arguments.length) {
      minf = Number(min);
      maxf = (arguments.length > 1) ? Number(max) : minf;
      maxk = Math.pow(10, maxf);
      return this;
    }
    return [minf, maxf];
  };

  /**
   * Sets or gets the character used to pad the integer part. The integer pad is
   * used when the number of integer digits is smaller than the minimum. The
   * default pad character is "0" (zero).
   *
   * @param {string} [x] the new pad character.
   * @returns {pv.Format.number} <tt>this</tt> or the current pad character.
   */
  format.integerPad = function(x) {
    if (arguments.length) {
      padi = String(x);
      padg = /\d/.test(padi);
      return this;
    }
    return padi;
  };

  /**
   * Sets or gets the character used to pad the fration part. The fraction pad
   * is used when the number of fraction digits is smaller than the minimum. The
   * default pad character is "0" (zero).
   *
   * @param {string} [x] the new pad character.
   * @returns {pv.Format.number} <tt>this</tt> or the current pad character.
   */
  format.fractionPad = function(x) {
    if (arguments.length) {
      padf = String(x);
      return this;
    }
    return padf;
  };

  /**
   * Sets or gets the character used as the decimal point, separating the
   * integer and fraction parts of the number. The default decimal point is ".".
   *
   * @param {string} [x] the new decimal separator.
   * @returns {pv.Format.number} <tt>this</tt> or the current decimal separator.
   */
  format.decimal = function(x) {
    if (arguments.length) {
      decimal = String(x);
      return this;
    }
    return decimal;
  };

  /**
   * Sets or gets the character used as the group separator, grouping integer
   * digits by thousands. The default decimal point is ",". Grouping can be
   * disabled by using "" for the separator.
   *
   * @param {string} [x] the new group separator.
   * @returns {pv.Format.number} <tt>this</tt> or the current group separator.
   */
  format.group = function(x) {
    if (arguments.length) {
      group = x ? String(x) : "";
      mins = mini + Math.floor(mini / 3) * group.length;
      return this;
    }
    return group;
  };

  /**
   * Sets or gets the negative prefix and suffix. The default negative prefix is
   * "&minus;", and the default negative suffix is the empty string.
   *
   * @param {string} [x] the negative prefix.
   * @param {string} [y] the negative suffix.
   * @returns {pv.Format.number} <tt>this</tt> or the current negative format.
   */
  format.negativeAffix = function(x, y) {
    if (arguments.length) {
      np = String(x || "");
      ns = String(y || "");
      return this;
    }
    return [np, ns];
  };

  return format;
};
(function(){
    
    var _cache;
    
    pv.Text = {};
    
    pv.Text.createCache = function(){
        return new FontSizeCache();
    };
    
    pv.Text.usingCache = function(cache, fun, ctx){
        if(!(cache instanceof FontSizeCache)){
            throw new Error("Not a valid cache.");
        }
        
        var prevCache = _cache;
        
        _cache = cache;
        try{
            return fun.call(ctx);
        } finally {
            _cache = prevCache;
        }
    };
    
    pv.Text.measure = function(text, font){
        if(text == null){
            text = "";
        } else {
            text = "" + text;
        }
        
        var bbox = _cache && _cache.get(font, text);
        if(!bbox){
            if(!text){
                bbox = {width: 0, height: 0};
            } else {
                bbox = this.measureCore(text, font);
            }
            
            if(_cache){
                _cache.put(font, text, bbox);
            }
        }
        
        return bbox;
    };
    
    pv.Text.fontHeight = function(font){
        return pv.Text.measure('M', font).height;
    };
    
    // Replace with another custom implementation if necessary
    pv.Text.measureCore = (function(){
        
        // SVG implementation
        var _svgText, _lastFont = '10px sans-serif';
        
        function getTextSizeElement(){
            return _svgText || (_svgText = createTextSizeElement());
        }
        
        function createTextSizeElement(){
            var div =  document.createElement('div');
            div.id = 'pvSVGText_' + new Date().getTime();
            
            var style = div.style;
            style.position   = 'absolute';
            style.visibility = 'hidden';
            style.width  = 0;
            style.height = 0;
            style.left = 0;
            style.top  = 0;
            
            var svgElem = pv.SvgScene.create('svg');
            svgElem.setAttribute('font-size',   '10px');
            svgElem.setAttribute('font-family', 'sans-serif');
            div.appendChild(svgElem);
            
            
            var svgText = pv.SvgScene.create('text');
            svgElem.appendChild(svgText);
            
            var textNode;
            if (pv.renderer() === "svgweb") { 
                // SVGWeb needs an extra 'true' to create SVG text nodes properly in IE.
                textNode = document.createTextNode('', true);
            } else {
                textNode = document.createTextNode('');
            }
            svgText.appendChild(textNode);
            
            document.body.appendChild(div);
            
            return svgText;
        }
        
        return function(text, font){
            if(!font){ font = null; }
            
            var svgText = getTextSizeElement();
            if(_lastFont !== font){
                _lastFont = font;
                pv.SvgScene.setStyle(svgText, {'font': font});
            }
            
            svgText.firstChild.nodeValue = '' + text;
            
            var box;
            try{
                box = svgText.getBBox();
            } catch(ex){
                if(typeof console.error === 'function'){
                    console.error("GetBBox failed: ", ex);
                }
                
                throw ex;
            }
            
            return {width: box.width, height: box.height};
        };
    }());
    
    // --------
    
    var FontSizeCache = function(){
        this._fontsCache = {};
    };
    
    var hasOwnProp = Object.prototype.hasOwnProperty;
    
    FontSizeCache.prototype._getFont = function(font){
        font = font || '';
        return hasOwnProp.call(this._fontsCache, font) ?
               this._fontsCache[font] :
               (this._fontsCache[font] = {});
    };
        
    FontSizeCache.prototype.get = function(font, text){
        text = text || '';
        
        var fontCache = this._getFont(font);
        return hasOwnProp.call(fontCache, text) ?
               fontCache[text] :
               null;
    };
        
    FontSizeCache.prototype.put = function(font, text, size){
        return this._getFont(font)[text||''] = size;
    };
        
}());/**
 * @private A private variant of Array.prototype.map that supports the index
 * property.
 */
pv.map = function(array, f) {
  var o = {};
  return f
      ? array.map(function(d, i) { o.index = i; return f.call(o, d); })
      : array.slice();
};

/**
 * Concatenates the specified array with itself <i>n</i> times. For example,
 * <tt>pv.repeat([1, 2])</tt> returns [1, 2, 1, 2].
 *
 * @param {array} a an array.
 * @param {number} [n] the number of times to repeat; defaults to two.
 * @returns {array} an array that repeats the specified array.
 */
pv.repeat = function(array, n) {
  if (arguments.length == 1) n = 2;
  return pv.blend(pv.range(n).map(function() { return array; }));
};

/**
 * Creates an array of the specified length,
 * and, optionally, initializes it with the specified default value.
 * 
 * @param {number} [len] the length of the array; defaults to 0.
 * @param {number} [dv] the default value with which to initialize each position; defaults to undefined.
 * @returns {array} an array as specified.
 */
pv.array = function(len, dv){
    var a = len >= 0 ? new Array(len) : [];
    if(dv !== undefined){
        for(var i = 0 ; i < len ; i++){
            a[i] = dv;
        }
    }
    
    return a;
};

/**
 * Given two arrays <tt>a</tt> and <tt>b</tt>, <style
 * type="text/css">sub{line-height:0}</style> returns an array of all possible
 * pairs of elements [a<sub>i</sub>, b<sub>j</sub>]. The outer loop is on array
 * <i>a</i>, while the inner loop is on <i>b</i>, such that the order of
 * returned elements is [a<sub>0</sub>, b<sub>0</sub>], [a<sub>0</sub>,
 * b<sub>1</sub>], ... [a<sub>0</sub>, b<sub>m</sub>], [a<sub>1</sub>,
 * b<sub>0</sub>], [a<sub>1</sub>, b<sub>1</sub>], ... [a<sub>1</sub>,
 * b<sub>m</sub>], ... [a<sub>n</sub>, b<sub>m</sub>]. If either array is empty,
 * an empty array is returned.
 *
 * @param {array} a an array.
 * @param {array} b an array.
 * @returns {array} an array of pairs of elements in <tt>a</tt> and <tt>b</tt>.
 */
pv.cross = function(a, b) {
  var array = [];
  for (var i = 0, n = a.length, m = b.length; i < n; i++) {
    for (var j = 0, x = a[i]; j < m; j++) {
      array.push([x, b[j]]);
    }
  }
  return array;
};

/**
 * Given the specified array of arrays, concatenates the arrays into a single
 * array. If the individual arrays are explicitly known, an alternative to blend
 * is to use JavaScript's <tt>concat</tt> method directly. These two equivalent
 * expressions:<ul>
 *
 * <li><tt>pv.blend([[1, 2, 3], ["a", "b", "c"]])</tt>
 * <li><tt>[1, 2, 3].concat(["a", "b", "c"])</tt>
 *
 * </ul>return [1, 2, 3, "a", "b", "c"].
 *
 * @param {array[]} arrays an array of arrays.
 * @returns {array} an array containing all the elements of each array in
 * <tt>arrays</tt>.
 */
pv.blend = function(arrays) {
  return Array.prototype.concat.apply([], arrays);
};

/**
 * Given the specified array of arrays, <style
 * type="text/css">sub{line-height:0}</style> transposes each element
 * array<sub>ij</sub> with array<sub>ji</sub>. If the array has dimensions
 * <i>n</i>&times;<i>m</i>, it will have dimensions <i>m</i>&times;<i>n</i>
 * after this method returns. This method transposes the elements of the array
 * in place, mutating the array, and returning a reference to the array.
 *
 * @param {array[]} arrays an array of arrays.
 * @returns {array[]} the passed-in array, after transposing the elements.
 */
pv.transpose = function(arrays) {
  var n = arrays.length, m = pv.max(arrays, function(d) { return d.length; });

  if (m > n) {
    arrays.length = m;
    for (var i = n; i < m; i++) {
      arrays[i] = new Array(n);
    }
    for (var i = 0; i < n; i++) {
      for (var j = i + 1; j < m; j++) {
        var t = arrays[i][j];
        arrays[i][j] = arrays[j][i];
        arrays[j][i] = t;
      }
    }
  } else {
    for (var i = 0; i < m; i++) {
      arrays[i].length = n;
    }
    for (var i = 0; i < n; i++) {
      for (var j = 0; j < i; j++) {
        var t = arrays[i][j];
        arrays[i][j] = arrays[j][i];
        arrays[j][i] = t;
      }
    }
  }

  arrays.length = m;
  for (var i = 0; i < m; i++) {
    arrays[i].length = n;
  }

  return arrays;
};

/**
 * Returns a normalized copy of the specified array, such that the sum of the
 * returned elements sum to one. If the specified array is not an array of
 * numbers, an optional accessor function <tt>f</tt> can be specified to map the
 * elements to numbers. For example, if <tt>array</tt> is an array of objects,
 * and each object has a numeric property "foo", the expression
 *
 * <pre>pv.normalize(array, function(d) d.foo)</pre>
 *
 * returns a normalized array on the "foo" property. If an accessor function is
 * not specified, the identity function is used. Accessor functions can refer to
 * <tt>this.index</tt>.
 *
 * @param {array} array an array of objects, or numbers.
 * @param {function} [f] an optional accessor function.
 * @returns {number[]} an array of numbers that sums to one.
 */
pv.normalize = function(array, f) {
  var norm = pv.map(array, f), sum = pv.sum(norm);
  for (var i = 0; i < norm.length; i++) norm[i] /= sum;
  return norm;
};

/**
 * Returns a permutation of the specified array, using the specified array of
 * indexes. The returned array contains the corresponding element in
 * <tt>array</tt> for each index in <tt>indexes</tt>, in order. For example,
 *
 * <pre>pv.permute(["a", "b", "c"], [1, 2, 0])</pre>
 *
 * returns <tt>["b", "c", "a"]</tt>. It is acceptable for the array of indexes
 * to be a different length from the array of elements, and for indexes to be
 * duplicated or omitted. The optional accessor function <tt>f</tt> can be used
 * to perform a simultaneous mapping of the array elements. Accessor functions
 * can refer to <tt>this.index</tt>.
 *
 * @param {array} array an array.
 * @param {number[]} indexes an array of indexes into <tt>array</tt>.
 * @param {function} [f] an optional accessor function.
 * @returns {array} an array of elements from <tt>array</tt>; a permutation.
 */
pv.permute = function(array, indexes, f) {
  if (!f) f = pv.identity;
  var p = new Array(indexes.length), o = {};
  indexes.forEach(function(j, i) { o.index = j; p[i] = f.call(o, array[j]); });
  return p;
};

/**
 * Returns a map from key to index for the specified <tt>keys</tt> array. For
 * example,
 *
 * <pre>pv.numerate(["a", "b", "c"])</pre>
 *
 * returns <tt>{a: 0, b: 1, c: 2}</tt>. Note that since JavaScript maps only
 * support string keys, <tt>keys</tt> must contain strings, or other values that
 * naturally map to distinct string values. Alternatively, an optional accessor
 * function <tt>f</tt> can be specified to compute the string key for the given
 * element. Accessor functions can refer to <tt>this.index</tt>.
 *
 * @param {array} keys an array, usually of string keys.
 * @param {function} [f] an optional key function.
 * @returns a map from key to index.
 */
pv.numerate = function(keys, f) {
  if (!f) f = pv.identity;
  var map = {}, o = {};
  keys.forEach(function(x, i) { o.index = i; map[f.call(o, x)] = i; });
  return map;
};

/**
 * Returns the unique elements in the specified array, in the order they appear.
 * Note that since JavaScript maps only support string keys, <tt>array</tt> must
 * contain strings, or other values that naturally map to distinct string
 * values. Alternatively, an optional accessor function <tt>f</tt> can be
 * specified to compute the string key for the given element. Accessor functions
 * can refer to <tt>this.index</tt>.
 *
 * @param {array} array an array, usually of string keys.
 * @param {function} [f] an optional key function.
 * @returns {array} the unique values.
 */
pv.uniq = function(array, f) {
  if (!f) f = pv.identity;
  var map = {}, keys = [], o = {}, y;
  array.forEach(function(x, i) {
    o.index = i;
    y = f.call(o, x);
    if (!(y in map)) map[y] = keys.push(y);
  });
  return keys;
};

/**
 * The comparator function for natural order. This can be used in conjunction with
 * the built-in array <tt>sort</tt> method to sort elements by their natural
 * order, ascending. Note that if no comparator function is specified to the
 * built-in <tt>sort</tt> method, the default order is lexicographic, <i>not</i>
 * natural!
 *
 * @see <a
 * href="http://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Array/sort">Array.sort</a>.
 * @param a an element to compare.
 * @param b an element to compare.
 * @returns {number} negative if a &lt; b; positive if a &gt; b; otherwise 0.
 */
pv.naturalOrder = function(a, b) {
  return (a < b) ? -1 : ((a > b) ? 1 : 0);
};

/**
 * The comparator function for reverse natural order. This can be used in
 * conjunction with the built-in array <tt>sort</tt> method to sort elements by
 * their natural order, descending. Note that if no comparator function is
 * specified to the built-in <tt>sort</tt> method, the default order is
 * lexicographic, <i>not</i> natural!
 *
 * @see #naturalOrder
 * @param a an element to compare.
 * @param b an element to compare.
 * @returns {number} negative if a &lt; b; positive if a &gt; b; otherwise 0.
 */
pv.reverseOrder = function(b, a) {
  return (a < b) ? -1 : ((a > b) ? 1 : 0);
};

/**
 * Searches the specified array of numbers for the specified value using the
 * binary search algorithm. The array must be sorted (as by the <tt>sort</tt>
 * method) prior to making this call. If it is not sorted, the results are
 * undefined. If the array contains multiple elements with the specified value,
 * there is no guarantee which one will be found.
 *
 * <p>The <i>insertion point</i> is defined as the point at which the value
 * would be inserted into the array: the index of the first element greater than
 * the value, or <tt>array.length</tt>, if all elements in the array are less
 * than the specified value. Note that this guarantees that the return value
 * will be nonnegative if and only if the value is found.
 *
 * @param {number[]} array the array to be searched.
 * @param {number} value the value to be searched for.
 * @returns the index of the search value, if it is contained in the array;
 * otherwise, (-(<i>insertion point</i>) - 1).
 * @param {function} [f] an optional key function.
 */
pv.search = function(array, value, f) {
  if (!f) f = pv.identity;
  var low = 0, high = array.length - 1;
  while (low <= high) {
    var mid = (low + high) >> 1, midValue = f(array[mid]);
    if (midValue < value) low = mid + 1;
    else if (midValue > value) high = mid - 1;
    else return mid;
  }
  return -low - 1;
};

pv.search.index = function(array, value, f) {
  var i = pv.search(array, value, f);
  return (i < 0) ? (-i - 1) : i;
};
/**
 * Returns an array of numbers, starting at <tt>start</tt>, incrementing by
 * <tt>step</tt>, until <tt>stop</tt> is reached. The stop value is
 * exclusive. If only a single argument is specified, this value is interpreted
 * as the <i>stop</i> value, with the <i>start</i> value as zero. If only two
 * arguments are specified, the step value is implied to be one.
 *
 * <p>The method is modeled after the built-in <tt>range</tt> method from
 * Python. See the Python documentation for more details.
 *
 * @see <a href="http://docs.python.org/library/functions.html#range">Python range</a>
 * @param {number} [start] the start value.
 * @param {number} stop the stop value.
 * @param {number} [step] the step value.
 * @returns {number[]} an array of numbers.
 */
pv.range = function(start, stop, step) {
  if (arguments.length == 1) {
    stop = start;
    start = 0;
  }
  if (step == undefined) step = 1;
  if ((stop - start) / step == Infinity) throw new Error("range must be finite");
  var array = [], i = 0, j;
  stop -= (stop - start) * 1e-10; // floating point precision!
  if (step < 0) {
    while ((j = start + step * i++) > stop) {
      array.push(j);
    }
  } else {
    while ((j = start + step * i++) < stop) {
      array.push(j);
    }
  }
  return array;
};

/**
 * Returns a random number in the range [<tt>start</tt>, <tt>stop</tt>) that is
 * a multiple of <tt>step</tt>. More specifically, the returned number is of the
 * form <tt>start</tt> + <i>n</i> * <tt>step</tt>, where <i>n</i> is a
 * nonnegative integer. If <tt>step</tt> is not specified, it defaults to 1,
 * returning a random integer if <tt>start</tt> is also an integer.
 *
 * @param {number} [start] the start value value.
 * @param {number} stop the stop value.
 * @param {number} [step] the step value.
 * @returns {number} a random number between <i>start</i> and <i>stop</i>.
 */
pv.random = function(start, stop, step) {
  if (arguments.length == 1) {
    stop = start;
    start = 0;
  }
  if (step == undefined) step = 1;
  return step
      ? (Math.floor(Math.random() * (stop - start) / step) * step + start)
      : (Math.random() * (stop - start) + start);
};

/**
 * Returns the sum of the specified array. If the specified array is not an
 * array of numbers, an optional accessor function <tt>f</tt> can be specified
 * to map the elements to numbers. See {@link #normalize} for an example.
 * Accessor functions can refer to <tt>this.index</tt>.
 *
 * @param {array} array an array of objects, or numbers.
 * @param {function} [f] an optional accessor function.
 * @returns {number} the sum of the specified array.
 */
pv.sum = function(array, f) {
  var o = {};
  return array.reduce(f
      ? function(p, d, i) { o.index = i; return p + f.call(o, d); }
      : function(p, d) { return p + d; }, 0);
};

/**
 * Returns the maximum value of the specified array. If the specified array is
 * not an array of numbers, an optional accessor function <tt>f</tt> can be
 * specified to map the elements to numbers. See {@link #normalize} for an
 * example. Accessor functions can refer to <tt>this.index</tt>.
 *
 * @param {array} array an array of objects, or numbers.
 * @param {function} [f] an optional accessor function.
 * @returns {number} the maximum value of the specified array.
 */
pv.max = function(array, f) {
  if (f == pv.index) return array.length - 1;
  return Math.max.apply(null, f ? pv.map(array, f) : array);
};

/**
 * Returns the index of the maximum value of the specified array. If the
 * specified array is not an array of numbers, an optional accessor function
 * <tt>f</tt> can be specified to map the elements to numbers. See
 * {@link #normalize} for an example. Accessor functions can refer to
 * <tt>this.index</tt>.
 *
 * @param {array} array an array of objects, or numbers.
 * @param {function} [f] an optional accessor function.
 * @returns {number} the index of the maximum value of the specified array.
 */
pv.max.index = function(array, f) {
  if (!array.length) return -1;
  if (f == pv.index) return array.length - 1;
  if (!f) f = pv.identity;
  var maxi = 0, maxx = -Infinity, o = {};
  for (var i = 0; i < array.length; i++) {
    o.index = i;
    var x = f.call(o, array[i]);
    if (x > maxx) {
      maxx = x;
      maxi = i;
    }
  }
  return maxi;
};

/**
 * Returns the minimum value of the specified array of numbers. If the specified
 * array is not an array of numbers, an optional accessor function <tt>f</tt>
 * can be specified to map the elements to numbers. See {@link #normalize} for
 * an example. Accessor functions can refer to <tt>this.index</tt>.
 *
 * @param {array} array an array of objects, or numbers.
 * @param {function} [f] an optional accessor function.
 * @returns {number} the minimum value of the specified array.
 */
pv.min = function(array, f) {
  if (f == pv.index) return 0;
  return Math.min.apply(null, f ? pv.map(array, f) : array);
};

/**
 * Returns the index of the minimum value of the specified array. If the
 * specified array is not an array of numbers, an optional accessor function
 * <tt>f</tt> can be specified to map the elements to numbers. See
 * {@link #normalize} for an example. Accessor functions can refer to
 * <tt>this.index</tt>.
 *
 * @param {array} array an array of objects, or numbers.
 * @param {function} [f] an optional accessor function.
 * @returns {number} the index of the minimum value of the specified array.
 */
pv.min.index = function(array, f) {
  if (!array.length) return -1;
  if (f == pv.index) return 0;
  if (!f) f = pv.identity;
  var mini = 0, minx = Infinity, o = {};
  for (var i = 0; i < array.length; i++) {
    o.index = i;
    var x = f.call(o, array[i]);
    if (x < minx) {
      minx = x;
      mini = i;
    }
  }
  return mini;
};

/**
 * Returns the arithmetic mean, or average, of the specified array. If the
 * specified array is not an array of numbers, an optional accessor function
 * <tt>f</tt> can be specified to map the elements to numbers. See
 * {@link #normalize} for an example. Accessor functions can refer to
 * <tt>this.index</tt>.
 *
 * @param {array} array an array of objects, or numbers.
 * @param {function} [f] an optional accessor function.
 * @returns {number} the mean of the specified array.
 */
pv.mean = function(array, f) {
  return pv.sum(array, f) / array.length;
};

/**
 * Returns the median of the specified array. If the specified array is not an
 * array of numbers, an optional accessor function <tt>f</tt> can be specified
 * to map the elements to numbers. See {@link #normalize} for an example.
 * Accessor functions can refer to <tt>this.index</tt>.
 *
 * @param {array} array an array of objects, or numbers.
 * @param {function} [f] an optional accessor function.
 * @returns {number} the median of the specified array.
 */
pv.median = function(array, f) {
  if (f == pv.index) return (array.length - 1) / 2;
  array = pv.map(array, f).sort(pv.naturalOrder);
  if (array.length % 2) return array[Math.floor(array.length / 2)];
  var i = array.length / 2;
  return (array[i - 1] + array[i]) / 2;
};

/**
 * Returns the unweighted variance of the specified array. If the specified
 * array is not an array of numbers, an optional accessor function <tt>f</tt>
 * can be specified to map the elements to numbers. See {@link #normalize} for
 * an example. Accessor functions can refer to <tt>this.index</tt>.
 *
 * @param {array} array an array of objects, or numbers.
 * @param {function} [f] an optional accessor function.
 * @returns {number} the variance of the specified array.
 */
pv.variance = function(array, f) {
  if (array.length < 1) return NaN;
  if (array.length == 1) return 0;
  var mean = pv.mean(array, f), sum = 0, o = {};
  if (!f) f = pv.identity;
  for (var i = 0; i < array.length; i++) {
    o.index = i;
    var d = f.call(o, array[i]) - mean;
    sum += d * d;
  }
  return sum;
};

/**
 * Returns an unbiased estimation of the standard deviation of a population,
 * given the specified random sample. If the specified array is not an array of
 * numbers, an optional accessor function <tt>f</tt> can be specified to map the
 * elements to numbers. See {@link #normalize} for an example. Accessor
 * functions can refer to <tt>this.index</tt>.
 *
 * @param {array} array an array of objects, or numbers.
 * @param {function} [f] an optional accessor function.
 * @returns {number} the standard deviation of the specified array.
 */
pv.deviation = function(array, f) {
  return Math.sqrt(pv.variance(array, f) / (array.length - 1));
};

/**
 * Returns the logarithm with a given base value.
 *
 * @param {number} x the number for which to compute the logarithm.
 * @param {number} b the base of the logarithm.
 * @returns {number} the logarithm value.
 */
pv.log = function(x, b) {
  return Math.log(x) / Math.log(b);
};

/**
 * Computes a zero-symmetric logarithm. Computes the logarithm of the absolute
 * value of the input, and determines the sign of the output according to the
 * sign of the input value.
 *
 * @param {number} x the number for which to compute the logarithm.
 * @param {number} b the base of the logarithm.
 * @returns {number} the symmetric log value.
 */
pv.logSymmetric = function(x, b) {
  return (x == 0) ? 0 : ((x < 0) ? -pv.log(-x, b) : pv.log(x, b));
};

/**
 * Computes a zero-symmetric logarithm, with adjustment to values between zero
 * and the logarithm base. This adjustment introduces distortion for values less
 * than the base number, but enables simultaneous plotting of log-transformed
 * data involving both positive and negative numbers.
 *
 * @param {number} x the number for which to compute the logarithm.
 * @param {number} b the base of the logarithm.
 * @returns {number} the adjusted, symmetric log value.
 */
pv.logAdjusted = function(x, b) {
  if (!isFinite(x)) return x;
  var negative = x < 0;
  if (x < b) x += (b - x) / b;
  return negative ? -pv.log(x, b) : pv.log(x, b);
};

/**
 * Rounds an input value down according to its logarithm. The method takes the
 * floor of the logarithm of the value and then uses the resulting value as an
 * exponent for the base value.
 *
 * @param {number} x the number for which to compute the logarithm floor.
 * @param {number} b the base of the logarithm.
 * @returns {number} the rounded-by-logarithm value.
 */
pv.logFloor = function(x, b) {
  return (x > 0)
      ? Math.pow(b, Math.floor(pv.log(x, b)))
      : -Math.pow(b, -Math.floor(-pv.log(-x, b)));
};

/**
 * Rounds an input value up according to its logarithm. The method takes the
 * ceiling of the logarithm of the value and then uses the resulting value as an
 * exponent for the base value.
 *
 * @param {number} x the number for which to compute the logarithm ceiling.
 * @param {number} b the base of the logarithm.
 * @returns {number} the rounded-by-logarithm value.
 */
pv.logCeil = function(x, b) {
  return (x > 0)
      ? Math.pow(b, Math.ceil(pv.log(x, b)))
      : -Math.pow(b, -Math.ceil(-pv.log(-x, b)));
};

(function() {
  var radians = Math.PI / 180,
      degrees = 180 / Math.PI;

  /** Returns the number of radians corresponding to the specified degrees. */
  pv.radians = function(degrees) { return radians * degrees; };

  /** Returns the number of degrees corresponding to the specified radians. */
  pv.degrees = function(radians) { return degrees * radians; };
})();
/**
 * Returns all of the property names (keys) of the specified object (a map). The
 * order of the returned array is not defined.
 *
 * @param map an object.
 * @returns {string[]} an array of strings corresponding to the keys.
 * @see #entries
 */
pv.keys = function(map) {
  var array = [];
  for (var key in map) {
    array.push(key);
  }
  return array;
};

/**
 * Returns all of the entries (key-value pairs) of the specified object (a
 * map). The order of the returned array is not defined. Each key-value pair is
 * represented as an object with <tt>key</tt> and <tt>value</tt> attributes,
 * e.g., <tt>{key: "foo", value: 42}</tt>.
 *
 * @param map an object.
 * @returns {array} an array of key-value pairs corresponding to the keys.
 */
pv.entries = function(map) {
  var array = [];
  for (var key in map) {
    array.push({ key: key, value: map[key] });
  }
  return array;
};

/**
 * Returns all of the values (attribute values) of the specified object (a
 * map). The order of the returned array is not defined.
 *
 * @param map an object.
 * @returns {array} an array of objects corresponding to the values.
 * @see #entries
 */
pv.values = function(map) {
  var array = [];
  for (var key in map) {
    array.push(map[key]);
  }
  return array;
};

/**
 * Returns a map constructed from the specified <tt>keys</tt>, using the
 * function <tt>f</tt> to compute the value for each key. The single argument to
 * the value function is the key. The callback is invoked only for indexes of
 * the array which have assigned values; it is not invoked for indexes which
 * have been deleted or which have never been assigned values.
 *
 * <p>For example, this expression creates a map from strings to string length:
 *
 * <pre>pv.dict(["one", "three", "seventeen"], function(s) s.length)</pre>
 *
 * The returned value is <tt>{one: 3, three: 5, seventeen: 9}</tt>. Accessor
 * functions can refer to <tt>this.index</tt>.
 *
 * @param {array} keys an array.
 * @param {function} f a value function.
 * @returns a map from keys to values.
 */
pv.dict = function(keys, f) {
  var m = {}, o = {};
  for (var i = 0; i < keys.length; i++) {
    if (i in keys) {
      var k = keys[i];
      o.index = i;
      m[k] = f.call(o, k);
    }
  }
  return m;
};

/** @private */
pv.hasOwnProp = Object.prototype.hasOwnProperty;

/**
 * Copies own properties of <tt>b</tt> into <tt>a</tt>.
 *
 * @param {object} a the target object.
 * @param {object} [b] the source object.
 * @returns {object} the target object.
 */
pv.copyOwn = function(a, b){
  if(b){
    var hop = pv.hasOwnProp;
      for(var p in b){
        if(hop.call(b, p)){
          a[p] = b[p];
        }
    }
  }
  return a;
};
/**
 * Returns a {@link pv.Dom} operator for the given map. This is a convenience
 * factory method, equivalent to <tt>new pv.Dom(map)</tt>. To apply the operator
 * and retrieve the root node, call {@link pv.Dom#root}; to retrieve all nodes
 * flattened, use {@link pv.Dom#nodes}.
 *
 * @see pv.Dom
 * @param map a map from which to construct a DOM.
 * @returns {pv.Dom} a DOM operator for the specified map.
 */
pv.dom = function(map) {
  return new pv.Dom(map);
};

/**
 * Constructs a DOM operator for the specified map. This constructor should not
 * be invoked directly; use {@link pv.dom} instead.
 *
 * @class Represets a DOM operator for the specified map. This allows easy
 * transformation of a hierarchical JavaScript object (such as a JSON map) to a
 * W3C Document Object Model hierarchy. For more information on which attributes
 * and methods from the specification are supported, see {@link pv.Dom.Node}.
 *
 * <p>Leaves in the map are determined using an associated <i>leaf</i> function;
 * see {@link #leaf}. By default, leaves are any value whose type is not
 * "object", such as numbers or strings.
 *
 * @param map a map from which to construct a DOM.
 */
pv.Dom = function(map) {
  this.$map = map;
};

/** @private The default leaf function. */
pv.Dom.prototype.$leaf = function(n) {
  return typeof n != "object";
};

/**
 * Sets or gets the leaf function for this DOM operator. The leaf function
 * identifies which values in the map are leaves, and which are internal nodes.
 * By default, objects are considered internal nodes, and primitives (such as
 * numbers and strings) are considered leaves.
 *
 * @param {function} f the new leaf function.
 * @returns the current leaf function, or <tt>this</tt>.
 */
pv.Dom.prototype.leaf = function(f) {
  if (arguments.length) {
    this.$leaf = f;
    return this;
  }
  return this.$leaf;
};

/**
 * Applies the DOM operator, returning the root node.
 *
 * @returns {pv.Dom.Node} the root node.
 * @param {string} [nodeName] optional node name for the root.
 */
pv.Dom.prototype.root = function(nodeName) {
  var leaf = this.$leaf, root = recurse(this.$map);

  /** @private */
  function recurse(map) {
    var n = new pv.Dom.Node();
    for (var k in map) {
      var v = map[k];
      n.appendChild(leaf(v) ? new pv.Dom.Node(v) : recurse(v)).nodeName = k;
    }
    return n;
  }

  root.nodeName = nodeName;
  return root;
};

/**
 * Applies the DOM operator, returning the array of all nodes in preorder
 * traversal.
 *
 * @returns {array} the array of nodes in preorder traversal.
 */
pv.Dom.prototype.nodes = function() {
  return this.root().nodes();
};

/**
 * Constructs a DOM node for the specified value. Instances of this class are
 * not typically created directly; instead they are generated from a JavaScript
 * map using the {@link pv.Dom} operator.
 *
 * @class Represents a <tt>Node</tt> in the W3C Document Object Model.
 */
pv.Dom.Node = function(value) {
  if(value !== undefined){
    this.nodeValue = value;
  }
  
  this.childNodes = [];
};

/**
 * The node name. When generated from a map, the node name corresponds to the
 * key at the given level in the map. Note that the root node has no associated
 * key, and thus has an undefined node name (and no <tt>parentNode</tt>).
 *
 * @type string
 * @field pv.Dom.Node.prototype.nodeName
 */

/**
 * The node value. When generated from a map, node value corresponds to the leaf
 * value for leaf nodes, and is undefined for internal nodes.
 *
 * @field pv.Dom.Node.prototype.nodeValue
 */
pv.Dom.Node.prototype.nodeValue = undefined;

/**
 * The array of child nodes. This array is empty for leaf nodes. An easy way to
 * check if child nodes exist is to query <tt>firstChild</tt>.
 *
 * @type array
 * @field pv.Dom.Node.prototype.childNodes
 */

/**
 * The parent node, which is null for root nodes.
 *
 * @type pv.Dom.Node
 */
pv.Dom.Node.prototype.parentNode = null;

/**
 * The first child, which is null for leaf nodes.
 *
 * @type pv.Dom.Node
 */
pv.Dom.Node.prototype.firstChild = null;

/**
 * The last child, which is null for leaf nodes.
 *
 * @type pv.Dom.Node
 */
pv.Dom.Node.prototype.lastChild = null;

/**
 * The previous sibling node, which is null for the first child.
 *
 * @type pv.Dom.Node
 */
pv.Dom.Node.prototype.previousSibling = null;

/**
 * The next sibling node, which is null for the last child.
 *
 * @type pv.Dom.Node
 */
pv.Dom.Node.prototype.nextSibling = null;

/**
 * The index of the first child 
 * whose {@link #_childIndex} is dirty.
 * 
 * @private
 * @type number | null
 */
pv.Dom.Node.prototype._firstDirtyChildIndex = Infinity;

/**
 * Removes the specified child node from this node.
 *
 * @throws Error if the specified child is not a child of this node.
 * @returns {pv.Dom.Node} the removed child.
 */
pv.Dom.Node.prototype.removeChild = function(n) {
  var i = this.childNodes.indexOf(n);
  if (i === -1) throw new Error("child not found");
  
  return this.removeAt(i);
};

/**
 * Appends the specified child node to this node. If the specified child is
 * already part of the DOM, the child is first removed before being added to
 * this node.
 *
 * @returns {pv.Dom.Node} the appended child.
 */
pv.Dom.Node.prototype.appendChild = function(n){
  var pn = n.parentNode;
  if (pn) pn.removeChild(n);
  
  var lc = this.lastChild;
  n.parentNode = this;
  n.previousSibling = lc;
  if (lc) {
      lc.nextSibling = n;
      n._childIndex  = lc._childIndex + 1;
  } else {
      this.firstChild = n;
      n._childIndex   = 0;
  }
  
  this.lastChild = n;
  this.childNodes.push(n);
  
  return n;
};
  
/**
 * Inserts the specified child <i>n</i> before the given reference child
 * <i>r</i> of this node. If <i>r</i> is null, this method is equivalent to
 * {@link #appendChild}. If <i>n</i> is already part of the DOM, it is first
 * removed before being inserted.
 *
 * @throws Error if <i>r</i> is non-null and not a child of this node.
 * @returns {pv.Dom.Node} the inserted child.
 */
pv.Dom.Node.prototype.insertBefore = function(n, r){
  if (!r) return this.appendChild(n);
  
  var ns = this.childNodes;
  var i = ns.indexOf(r);
  if (i === -1) throw new Error("child not found");
  
  return this.insertAt(n, i);
};

/**
 * Inserts the specified child <i>n</i> at the given index. 
 * Any child from the given index onwards will be moved one position to the end. 
 * If <i>i</i> is null, this method is equivalent to
 * {@link #appendChild}. 
 * If <i>n</i> is already part of the DOM, it is first
 * removed before being inserted.
 *
 * @throws Error if <i>i</i> is non-null and greater than the current number of children.
 * @returns {pv.Dom.Node} the inserted child.
 */
pv.Dom.Node.prototype.insertAt = function(n, i) {
    if (i == null){
        return this.appendChild(n);
    }
    
    var ns = this.childNodes;
    var L  = ns.length;
    if (i === L){
        return this.appendChild(n);
    }
    
    if(i > L){
        throw new Error("Index out of range.");
    }

    var pn = n.parentNode;
    if (pn) { // may be that: pn === this, but should i be corrected in case n is below i?
        pn.removeChild(n);
    }
    
    var ni = i + 1;
    var firstDirtyIndex = this._firstDirtyChildIndex;
    if(ni < firstDirtyIndex){
        this._firstDirtyChildIndex = ni;
    }
    
    var r = ns[i];
    n.parentNode  = this;
    n.nextSibling = r;
    n._childIndex = i;
    
    var psib = n.previousSibling = r.previousSibling;
    r.previousSibling = n;
    if (psib) {
        psib.nextSibling = n;
    } else {
        if (r === this.lastChild) {
            this.lastChild = n;
        }
        this.firstChild = n;
    }
    
    this.childNodes.splice(i, 0, n);
    return n;
};

/**
 * Removes the child node at the specified index from this node.
 */
pv.Dom.Node.prototype.removeAt = function(i) {
  var ns = this.childNodes;
  var n = ns[i];
  if(n){
      ns.splice(i, 1);
      
      if(i < ns.length){
          var firstDirtyIndex = this._firstDirtyChildIndex;
          if(i < firstDirtyIndex){
              this._firstDirtyChildIndex = i;
          }
      }
      
      var psib = n.previousSibling;
      var nsib = n.nextSibling;
      if (psib) { 
          psib.nextSibling = nsib;
      } else {
          this.firstChild = nsib;
      }
      
      if (nsib) {
          nsib.previousSibling = psib;
      } else {
          this.lastChild = psib;
      }
      
      n.nextSibling = null;
      n.previousSibling = null;
      n.parentNode = null;
  }
  
  return n;
};

/**
 * Replaces the specified child <i>r</i> of this node with the node <i>n</i>. If
 * <i>n</i> is already part of the DOM, it is first removed before being added.
 *
 * @throws Error if <i>r</i> is not a child of this node.
 */
pv.Dom.Node.prototype.replaceChild = function(n, r) {
  var ns = this.childNodes;
  var i = ns.indexOf(r);
  if (i === -1) throw new Error("child not found");
  
  var pn = n.parentNode;
  if (pn) pn.removeChild(n);
  
  n.parentNode  = this;
  n.nextSibling = r.nextSibling;
  n._childIndex = r._childIndex;
  
  var psib = n.previousSibling = r.previousSibling;
  if (psib) psib.nextSibling = n;
  else this.firstChild = n;
  
  var nsib = r.nextSibling;
  if (nsib) nsib.previousSibling = n;
  else this.lastChild = n;
  
  ns[i] = n;
  
  return r;
};


/**
 * Obtains the child index of this node.
 * Returns -1, if the node has no parent.
 * 
 * @type number
 */
pv.Dom.Node.prototype.childIndex = function(){
  var p = this.parentNode;
  if(p){
      var i = p._firstDirtyChildIndex;
      if(i < Infinity){
          var ns = p.childNodes;
          if(i < ns.length){
              for(var c = ns[i] ; c ; c = c.nextSibling){
                  c._childIndex = i++;
              }
          }
          
          p._firstDirtyChildIndex = Infinity;
      }
      
      return this._childIndex;
  }
  
  return -1;
};

/**
 * Visits each node in the tree in preorder traversal, applying the specified
 * function <i>f</i>. The arguments to the function are:<ol>
 *
 * <li>The current node.
 * <li>The current depth, starting at 0 for the root node.</ol>
 *
 * @param {function} f a function to apply to each node.
 */
pv.Dom.Node.prototype.visitBefore = function(f) {
  function visit(n, i) {
    f(n, i);
    for (var c = n.firstChild; c; c = c.nextSibling) {
      visit(c, i + 1);
    }
  }
  visit(this, 0);
};

/**
 * Visits each node in the tree in postorder traversal, applying the specified
 * function <i>f</i>. The arguments to the function are:<ol>
 *
 * <li>The current node.
 * <li>The current depth, starting at 0 for the root node.</ol>
 *
 * @param {function} f a function to apply to each node.
 */
pv.Dom.Node.prototype.visitAfter = function(f) {
  function visit(n, i) {
    for (var c = n.firstChild; c; c = c.nextSibling) {
      visit(c, i + 1);
    }
    f(n, i);
  }
  visit(this, 0);
};

/**
 * Sorts child nodes of this node, and all descendent nodes recursively, using
 * the specified comparator function <tt>f</tt>. The comparator function is
 * passed two nodes to compare.
 *
 * <p>Note: during the sort operation, the comparator function should not rely
 * on the tree being well-formed; the values of <tt>previousSibling</tt> and
 * <tt>nextSibling</tt> for the nodes being compared are not defined during the
 * sort operation.
 *
 * @param {function} f a comparator function.
 * @returns this.
 */
pv.Dom.Node.prototype.sort = function(f) {
  if (this.firstChild) {
    this._firstDirtyChildIndex = Infinity;
    
    this.childNodes.sort(f);
    
    var p = this.firstChild = this.childNodes[0], c;
    delete p.previousSibling;
    p._childIndex = 0;
    
    for (var i = 1; i < this.childNodes.length; i++) {
      p.sort(f);
      c = this.childNodes[i];
      c._childIndex = i;
      c.previousSibling = p;
      p = p.nextSibling = c;
    }
    
    this.lastChild = p;
    delete p.nextSibling;
    
    p.sort(f);
  }
  
  return this;
};

/**
 * Reverses all sibling nodes.
 *
 * @returns this.
 */
pv.Dom.Node.prototype.reverse = function() {
  var childNodes = [];
  this.visitAfter(function(n) {
      this._firstDirtyChildIndex = Infinity;
      
      while (n.lastChild) childNodes.push(n.removeChild(n.lastChild));
      for (var c; c = childNodes.pop();) n.insertBefore(c, n.firstChild);
    });
  return this;
};

/** Returns all descendants of this node in preorder traversal. */
pv.Dom.Node.prototype.nodes = function() {
  var array = [];

  /** @private */
  function flatten(node) {
    array.push(node);
    node.childNodes.forEach(flatten);
  }

  flatten(this, array);
  return array;
};

/**
 * Toggles the child nodes of this node. If this node is not yet toggled, this
 * method removes all child nodes and appends them to a new <tt>toggled</tt>
 * array attribute on this node. Otherwise, if this node is toggled, this method
 * re-adds all toggled child nodes and deletes the <tt>toggled</tt> attribute.
 *
 * <p>This method has no effect if the node has no child nodes.
 *
 * @param {boolean} [recursive] whether the toggle should apply to descendants.
 */
pv.Dom.Node.prototype.toggle = function(recursive) {
  if (recursive) return this.toggled
      ? this.visitBefore(function(n) { if (n.toggled) n.toggle(); })
      : this.visitAfter(function(n) { if (!n.toggled) n.toggle(); });
  var n = this;
  if (n.toggled) {
    for (var c; c = n.toggled.pop();) n.appendChild(c);
    delete n.toggled;
  } else if (n.lastChild) {
    n.toggled = [];
    while (n.lastChild) n.toggled.push(n.removeChild(n.lastChild));
  }
};

/**
 * Given a flat array of values, returns a simple DOM with each value wrapped by
 * a node that is a child of the root node.
 *
 * @param {array} values.
 * @returns {array} nodes.
 */
pv.nodes = function(values) {
  var root = new pv.Dom.Node();
  for (var i = 0; i < values.length; i++) {
    root.appendChild(new pv.Dom.Node(values[i]));
  }
  return root.nodes();
};
/**
 * Returns a {@link pv.Tree} operator for the specified array. This is a
 * convenience factory method, equivalent to <tt>new pv.Tree(array)</tt>.
 *
 * @see pv.Tree
 * @param {array} array an array from which to construct a tree.
 * @returns {pv.Tree} a tree operator for the specified array.
 */
pv.tree = function(array) {
  return new pv.Tree(array);
};

/**
 * Constructs a tree operator for the specified array. This constructor should
 * not be invoked directly; use {@link pv.tree} instead.
 *
 * @class Represents a tree operator for the specified array. The tree operator
 * allows a hierarchical map to be constructed from an array; it is similar to
 * the {@link pv.Nest} operator, except the hierarchy is derived dynamically
 * from the array elements.
 *
 * <p>For example, given an array of size information for ActionScript classes:
 *
 * <pre>{ name: "flare.flex.FlareVis", size: 4116 },
 * { name: "flare.physics.DragForce", size: 1082 },
 * { name: "flare.physics.GravityForce", size: 1336 }, ...</pre>
 *
 * To facilitate visualization, it may be useful to nest the elements by their
 * package hierarchy:
 *
 * <pre>var tree = pv.tree(classes)
 *     .keys(function(d) d.name.split("."))
 *     .map();</pre>
 *
 * The resulting tree is:
 *
 * <pre>{ flare: {
 *     flex: {
 *       FlareVis: {
 *         name: "flare.flex.FlareVis",
 *         size: 4116 } },
 *     physics: {
 *       DragForce: {
 *         name: "flare.physics.DragForce",
 *         size: 1082 },
 *       GravityForce: {
 *         name: "flare.physics.GravityForce",
 *         size: 1336 } },
 *     ... } }</pre>
 *
 * By specifying a value function,
 *
 * <pre>var tree = pv.tree(classes)
 *     .keys(function(d) d.name.split("."))
 *     .value(function(d) d.size)
 *     .map();</pre>
 *
 * we can further eliminate redundant data:
 *
 * <pre>{ flare: {
 *     flex: {
 *       FlareVis: 4116 },
 *     physics: {
 *       DragForce: 1082,
 *       GravityForce: 1336 },
 *   ... } }</pre>
 *
 * For visualizations with large data sets, performance improvements may be seen
 * by storing the data in a tree format, and then flattening it into an array at
 * runtime with {@link pv.Flatten}.
 *
 * @param {array} array an array from which to construct a tree.
 */
pv.Tree = function(array) {
  this.array = array;
};

/**
 * Assigns a <i>keys</i> function to this operator; required. The keys function
 * returns an array of <tt>string</tt>s for each element in the associated
 * array; these keys determine how the elements are nested in the tree. The
 * returned keys should be unique for each element in the array; otherwise, the
 * behavior of this operator is undefined.
 *
 * @param {function} k the keys function.
 * @returns {pv.Tree} this.
 */
pv.Tree.prototype.keys = function(k) {
  this.k = k;
  return this;
};

/**
 * Assigns a <i>value</i> function to this operator; optional. The value
 * function specifies an optional transformation of the element in the array
 * before it is inserted into the map. If no value function is specified, it is
 * equivalent to using the identity function.
 *
 * @param {function} k the value function.
 * @returns {pv.Tree} this.
 */
pv.Tree.prototype.value = function(v) {
  this.v = v;
  return this;
};

/**
 * Returns a hierarchical map of values. The hierarchy is determined by the keys
 * function; the values in the map are determined by the value function.
 *
 * @returns a hierarchical map of values.
 */
pv.Tree.prototype.map = function() {
  var map = {}, o = {};
  for (var i = 0; i < this.array.length; i++) {
    o.index = i;
    var value = this.array[i], keys = this.k.call(o, value), node = map;
    for (var j = 0; j < keys.length - 1; j++) {
      node = node[keys[j]] || (node[keys[j]] = {});
    }
    node[keys[j]] = this.v ? this.v.call(o, value) : value;
  }
  return map;
};
/**
 * Returns a {@link pv.Nest} operator for the specified array. This is a
 * convenience factory method, equivalent to <tt>new pv.Nest(array)</tt>.
 *
 * @see pv.Nest
 * @param {array} array an array of elements to nest.
 * @returns {pv.Nest} a nest operator for the specified array.
 */
pv.nest = function(array) {
  return new pv.Nest(array);
};

/**
 * Constructs a nest operator for the specified array. This constructor should
 * not be invoked directly; use {@link pv.nest} instead.
 *
 * @class Represents a {@link Nest} operator for the specified array. Nesting
 * allows elements in an array to be grouped into a hierarchical tree
 * structure. The levels in the tree are specified by <i>key</i> functions. The
 * leaf nodes of the tree can be sorted by value, while the internal nodes can
 * be sorted by key. Finally, the tree can be returned either has a
 * multidimensional array via {@link #entries}, or as a hierarchical map via
 * {@link #map}. The {@link #rollup} routine similarly returns a map, collapsing
 * the elements in each leaf node using a summary function.
 *
 * <p>For example, consider the following tabular data structure of Barley
 * yields, from various sites in Minnesota during 1931-2:
 *
 * <pre>{ yield: 27.00, variety: "Manchuria", year: 1931, site: "University Farm" },
 * { yield: 48.87, variety: "Manchuria", year: 1931, site: "Waseca" },
 * { yield: 27.43, variety: "Manchuria", year: 1931, site: "Morris" }, ...</pre>
 *
 * To facilitate visualization, it may be useful to nest the elements first by
 * year, and then by variety, as follows:
 *
 * <pre>var nest = pv.nest(yields)
 *     .key(function(d) d.year)
 *     .key(function(d) d.variety)
 *     .entries();</pre>
 *
 * This returns a nested array. Each element of the outer array is a key-values
 * pair, listing the values for each distinct key:
 *
 * <pre>{ key: 1931, values: [
 *   { key: "Manchuria", values: [
 *       { yield: 27.00, variety: "Manchuria", year: 1931, site: "University Farm" },
 *       { yield: 48.87, variety: "Manchuria", year: 1931, site: "Waseca" },
 *       { yield: 27.43, variety: "Manchuria", year: 1931, site: "Morris" },
 *       ...
 *     ] },
 *   { key: "Glabron", values: [
 *       { yield: 43.07, variety: "Glabron", year: 1931, site: "University Farm" },
 *       { yield: 55.20, variety: "Glabron", year: 1931, site: "Waseca" },
 *       ...
 *     ] },
 *   ] },
 * { key: 1932, values: ... }</pre>
 *
 * Further details, including sorting and rollup, is provided below on the
 * corresponding methods.
 *
 * @param {array} array an array of elements to nest.
 */
pv.Nest = function(array) {
  this.array = array;
  this.keys = [];
};

/**
 * Nests using the specified key function. Multiple keys may be added to the
 * nest; the array elements will be nested in the order keys are specified.
 *
 * @param {function} key a key function; must return a string or suitable map
 * key.
 * @returns {pv.Nest} this.
 */
pv.Nest.prototype.key = function(key) {
  this.keys.push(key);
  return this;
};

/**
 * Sorts the previously-added keys. The natural sort order is used by default
 * (see {@link pv.naturalOrder}); if an alternative order is desired,
 * <tt>order</tt> should be a comparator function. If this method is not called
 * (i.e., keys are <i>unsorted</i>), keys will appear in the order they appear
 * in the underlying elements array. For example,
 *
 * <pre>pv.nest(yields)
 *     .key(function(d) d.year)
 *     .key(function(d) d.variety)
 *     .sortKeys()
 *     .entries()</pre>
 *
 * groups yield data by year, then variety, and sorts the variety groups
 * lexicographically (since the variety attribute is a string).
 *
 * <p>Key sort order is only used in conjunction with {@link #entries}, which
 * returns an array of key-values pairs. If the nest is used to construct a
 * {@link #map} instead, keys are unsorted.
 *
 * @param {function} [order] an optional comparator function.
 * @returns {pv.Nest} this.
 */
pv.Nest.prototype.sortKeys = function(order) {
  this.keys[this.keys.length - 1].order = order || pv.naturalOrder;
  return this;
};

/**
 * Sorts the leaf values. The natural sort order is used by default (see
 * {@link pv.naturalOrder}); if an alternative order is desired, <tt>order</tt>
 * should be a comparator function. If this method is not called (i.e., values
 * are <i>unsorted</i>), values will appear in the order they appear in the
 * underlying elements array. For example,
 *
 * <pre>pv.nest(yields)
 *     .key(function(d) d.year)
 *     .key(function(d) d.variety)
 *     .sortValues(function(a, b) a.yield - b.yield)
 *     .entries()</pre>
 *
 * groups yield data by year, then variety, and sorts the values for each
 * variety group by yield.
 *
 * <p>Value sort order, unlike keys, applies to both {@link #entries} and
 * {@link #map}. It has no effect on {@link #rollup}.
 *
 * @param {function} [order] an optional comparator function.
 * @returns {pv.Nest} this.
 */
pv.Nest.prototype.sortValues = function(order) {
  this.order = order || pv.naturalOrder;
  return this;
};

/**
 * Returns a hierarchical map of values. Each key adds one level to the
 * hierarchy. With only a single key, the returned map will have a key for each
 * distinct value of the key function; the correspond value with be an array of
 * elements with that key value. If a second key is added, this will be a nested
 * map. For example:
 *
 * <pre>pv.nest(yields)
 *     .key(function(d) d.variety)
 *     .key(function(d) d.site)
 *     .map()</pre>
 *
 * returns a map <tt>m</tt> such that <tt>m[variety][site]</tt> is an array, a subset of
 * <tt>yields</tt>, with each element having the given variety and site.
 *
 * @returns a hierarchical map of values.
 */
pv.Nest.prototype.map = function() {
  var map = {}, values = [];

  /* Build the map. */
  for (var i, j = 0; j < this.array.length; j++) {
    var x = this.array[j];
    var m = map;
    for (i = 0; i < this.keys.length - 1; i++) {
      var k = this.keys[i](x);
      if (!m[k]) m[k] = {};
      m = m[k];
    }
    k = this.keys[i](x);
    if (!m[k]) {
      var a = [];
      values.push(a);
      m[k] = a;
    }
    m[k].push(x);
  }

  /* Sort each leaf array. */
  if (this.order) {
    for (var i = 0; i < values.length; i++) {
      values[i].sort(this.order);
    }
  }

  return map;
};

/**
 * Returns a hierarchical nested array. This method is similar to
 * {@link pv.entries}, but works recursively on the entire hierarchy. Rather
 * than returning a map like {@link #map}, this method returns a nested
 * array. Each element of the array has a <tt>key</tt> and <tt>values</tt>
 * field. For leaf nodes, the <tt>values</tt> array will be a subset of the
 * underlying elements array; for non-leaf nodes, the <tt>values</tt> array will
 * contain more key-values pairs.
 *
 * <p>For an example usage, see the {@link Nest} constructor.
 *
 * @returns a hierarchical nested array.
 */
pv.Nest.prototype.entries = function() {

  /** Recursively extracts the entries for the given map. */
  function entries(map) {
    var array = [];
    for (var k in map) {
      var v = map[k];
      array.push({ key: k, values: (v instanceof Array) ? v : entries(v) });
    };
    return array;
  }

  /** Recursively sorts the values for the given key-values array. */
  function sort(array, i) {
    var o = this.keys[i].order;
    if (o) array.sort(function(a, b) { return o(a.key, b.key); });
    if (++i < this.keys.length) {
      for (var j = 0; j < array.length; j++) {
        sort.call(this, array[j].values, i);
      }
    }
    return array;
  }

  return sort.call(this, entries(this.map()), 0);
};

/**
 * Returns a rollup map. The behavior of this method is the same as
 * {@link #map}, except that the leaf values are replaced with the return value
 * of the specified rollup function <tt>f</tt>. For example,
 *
 * <pre>pv.nest(yields)
 *      .key(function(d) d.site)
 *      .rollup(function(v) pv.median(v, function(d) d.yield))</pre>
 *
 * first groups yield data by site, and then returns a map from site to median
 * yield for the given site.
 *
 * @see #map
 * @param {function} f a rollup function.
 * @returns a hierarchical map, with the leaf values computed by <tt>f</tt>.
 */
pv.Nest.prototype.rollup = function(f) {

  /** Recursively descends to the leaf nodes (arrays) and does rollup. */
  function rollup(map) {
    for (var key in map) {
      var value = map[key];
      if (value instanceof Array) {
        map[key] = f(value);
      } else {
        rollup(value);
      }
    }
    return map;
  }

  return rollup(this.map());
};
/**
 * Returns a {@link pv.Flatten} operator for the specified map. This is a
 * convenience factory method, equivalent to <tt>new pv.Flatten(map)</tt>.
 *
 * @see pv.Flatten
 * @param map a map to flatten.
 * @returns {pv.Flatten} a flatten operator for the specified map.
 */
pv.flatten = function(map) {
  return new pv.Flatten(map);
};

/**
 * Constructs a flatten operator for the specified map. This constructor should
 * not be invoked directly; use {@link pv.flatten} instead.
 *
 * @class Represents a flatten operator for the specified array. Flattening
 * allows hierarchical maps to be flattened into an array. The levels in the
 * input tree are specified by <i>key</i> functions.
 *
 * <p>For example, consider the following hierarchical data structure of Barley
 * yields, from various sites in Minnesota during 1931-2:
 *
 * <pre>{ 1931: {
 *     Manchuria: {
 *       "University Farm": 27.00,
 *       "Waseca": 48.87,
 *       "Morris": 27.43,
 *       ... },
 *     Glabron: {
 *       "University Farm": 43.07,
 *       "Waseca": 55.20,
 *       ... } },
 *   1932: {
 *     ... } }</pre>
 *
 * To facilitate visualization, it may be useful to flatten the tree into a
 * tabular array:
 *
 * <pre>var array = pv.flatten(yields)
 *     .key("year")
 *     .key("variety")
 *     .key("site")
 *     .key("yield")
 *     .array();</pre>
 *
 * This returns an array of object elements. Each element in the array has
 * attributes corresponding to this flatten operator's keys:
 *
 * <pre>{ site: "University Farm", variety: "Manchuria", year: 1931, yield: 27 },
 * { site: "Waseca", variety: "Manchuria", year: 1931, yield: 48.87 },
 * { site: "Morris", variety: "Manchuria", year: 1931, yield: 27.43 },
 * { site: "University Farm", variety: "Glabron", year: 1931, yield: 43.07 },
 * { site: "Waseca", variety: "Glabron", year: 1931, yield: 55.2 }, ...</pre>
 *
 * <p>The flatten operator is roughly the inverse of the {@link pv.Nest} and
 * {@link pv.Tree} operators.
 *
 * @param map a map to flatten.
 */
pv.Flatten = function(map) {
  this.map = map;
  this.keys = [];
};

/**
 * Flattens using the specified key function. Multiple keys may be added to the
 * flatten; the tiers of the underlying tree must correspond to the specified
 * keys, in order. The order of the returned array is undefined; however, you
 * can easily sort it.
 *
 * @param {string} key the key name.
 * @param {function} [f] an optional value map function.
 * @returns {pv.Nest} this.
 */
pv.Flatten.prototype.key = function(key, f) {
  this.keys.push({name: key, value: f});
  delete this.$leaf;
  return this;
};

/**
 * Flattens using the specified leaf function. This is an alternative to
 * specifying an explicit set of keys; the tiers of the underlying tree will be
 * determined dynamically by recursing on the values, and the resulting keys
 * will be stored in the entries <tt>keys</tt> attribute. The leaf function must
 * return true for leaves, and false for internal nodes.
 *
 * @param {function} f a leaf function.
 * @returns {pv.Nest} this.
 */
pv.Flatten.prototype.leaf = function(f) {
  this.keys.length = 0;
  this.$leaf = f;
  return this;
};

/**
 * Returns the flattened array. Each entry in the array is an object; each
 * object has attributes corresponding to this flatten operator's keys.
 *
 * @returns an array of elements from the flattened map.
 */
pv.Flatten.prototype.array = function() {
  var entries = [], stack = [], keys = this.keys, leaf = this.$leaf;

  /* Recursively visit using the leaf function. */
  if (leaf) {
    function recurse(value, i) {
      if (leaf(value)) {
        entries.push({keys: stack.slice(), value: value});
      } else {
        for (var key in value) {
          stack.push(key);
          recurse(value[key], i + 1);
          stack.pop();
        }
      }
    }
    recurse(this.map, 0);
    return entries;
  }

  /* Recursively visits the specified value. */
  function visit(value, i) {
    if (i < keys.length - 1) {
      for (var key in value) {
        stack.push(key);
        visit(value[key], i + 1);
        stack.pop();
      }
    } else {
      entries.push(stack.concat(value));
    }
  }

  visit(this.map, 0);
  return entries.map(function(stack) {
      var m = {};
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i], v = stack[i];
        m[k.name] = k.value ? k.value.call(null, v) : v;
      }
      return m;
    });
};
/**
 * Returns a new identity transform.
 *
 * @class Represents a transformation matrix. The transformation matrix is
 * limited to expressing translate and uniform scale transforms only; shearing,
 * rotation, general affine, and other transforms are not supported.
 *
 * <p>The methods on this class treat the transform as immutable, returning a
 * copy of the transformation matrix with the specified transform applied. Note,
 * alternatively, that the matrix fields can be get and set directly.
 */
pv.Transform = function() {};
pv.Transform.prototype = {k: 1, x: 0, y: 0};

/**
 * The scale magnitude; defaults to 1.
 *
 * @type number
 * @name pv.Transform.prototype.k
 */

/**
 * The x-offset; defaults to 0.
 *
 * @type number
 * @name pv.Transform.prototype.x
 */

/**
 * The y-offset; defaults to 0.
 *
 * @type number
 * @name pv.Transform.prototype.y
 */

/**
 * @private The identity transform.
 *
 * @type pv.Transform
 */
pv.Transform.identity = new pv.Transform();

// k 0 x   1 0 a   k 0 ka+x
// 0 k y * 0 1 b = 0 k kb+y
// 0 0 1   0 0 1   0 0 1

/**
 * Returns a translated copy of this transformation matrix.
 *
 * @param {number} x the x-offset.
 * @param {number} y the y-offset.
 * @returns {pv.Transform} the translated transformation matrix.
 */
pv.Transform.prototype.translate = function(x, y) {
  var v = new pv.Transform();
  v.k = this.k;
  v.x = this.k * x + this.x;
  v.y = this.k * y + this.y;
  return v;
};

// k 0 x   d 0 0   kd  0 x
// 0 k y * 0 d 0 =  0 kd y
// 0 0 1   0 0 1    0  0 1

/**
 * Returns a scaled copy of this transformation matrix.
 *
 * @param {number} k
 * @returns {pv.Transform} the scaled transformation matrix.
 */
pv.Transform.prototype.scale = function(k) {
  var v = new pv.Transform();
  v.k = this.k * k;
  v.x = this.x;
  v.y = this.y;
  return v;
};

/**
 * Returns the inverse of this transformation matrix.
 *
 * @returns {pv.Transform} the inverted transformation matrix.
 */
pv.Transform.prototype.invert = function() {
  var v = new pv.Transform(), k = 1 / this.k;
  v.k = k;
  v.x = -this.x * k;
  v.y = -this.y * k;
  return v;
};

// k 0 x   d 0 a   kd  0 ka+x
// 0 k y * 0 d b =  0 kd kb+y
// 0 0 1   0 0 1    0  0    1

/**
 * Returns this matrix post-multiplied by the specified matrix <i>m</i>.
 *
 * @param {pv.Transform} m
 * @returns {pv.Transform} the post-multiplied transformation matrix.
 */
pv.Transform.prototype.times = function(m) {
  var v = new pv.Transform();
  v.k = this.k * m.k;
  v.x = this.k * m.x + this.x;
  v.y = this.k * m.y + this.y;
  return v;
};
/**
 * Abstract; see the various scale implementations.
 *
 * @class Represents a scale; a function that performs a transformation from
 * data domain to visual range. For quantitative and quantile scales, the domain
 * is expressed as numbers; for ordinal scales, the domain is expressed as
 * strings (or equivalently objects with unique string representations). The
 * "visual range" may correspond to pixel space, colors, font sizes, and the
 * like.
 *
 * <p>Note that scales are functions, and thus can be used as properties
 * directly, assuming that the data associated with a mark is a number. While
 * this is convenient for single-use scales, frequently it is desirable to
 * define scales globally:
 *
 * <pre>var y = pv.Scale.linear(0, 100).range(0, 640);</pre>
 *
 * The <tt>y</tt> scale can now be equivalently referenced within a property:
 *
 * <pre>    .height(function(d) y(d))</pre>
 *
 * Alternatively, if the data are not simple numbers, the appropriate value can
 * be passed to the <tt>y</tt> scale (e.g., <tt>d.foo</tt>). The {@link #by}
 * method similarly allows the data to be mapped to a numeric value before
 * performing the linear transformation.
 *
 * @see pv.Scale.quantitative
 * @see pv.Scale.quantile
 * @see pv.Scale.ordinal
 * @extends function
 */
pv.Scale = function() {};

/**
 * @private Returns a function that interpolators from the start value to the
 * end value, given a parameter <i>t</i> in [0, 1].
 *
 * @param start the start value.
 * @param end the end value.
 */
pv.Scale.interpolator = function(start, end) {
  if (typeof start == "number") {
    return function(t) {
      return t * (end - start) + start;
    };
  }

  /* For now, assume color. */
  
  // Gradients are not supported in animations
  // Just show the first one if < 0.5 and the other if >= 0.5
  var startGradient = (start.type && start.type !== 'solid');
  var endGradient   = (end.type   && end  .type !== 'solid');
  if (startGradient || endGradient) {
      start = startGradient ? start : pv.color(start).rgb();
      end   = endGradient   ? end   : pv.color(end  ).rgb();
      return function(t){
          return t < 0.5 ? start : end;
      };
  }
  
  start = pv.color(start).rgb();
  end   = pv.color(end  ).rgb();
  return function(t) {
    var a = start.a * (1 - t) + end.a * t;
    if (a < 1e-5) a = 0; // avoid scientific notation
    return (start.a == 0) ? pv.rgb(end.r, end.g, end.b, a)
        : ((end.a == 0) ? pv.rgb(start.r, start.g, start.b, a)
        : pv.rgb(
            Math.round(start.r * (1 - t) + end.r * t),
            Math.round(start.g * (1 - t) + end.g * t),
            Math.round(start.b * (1 - t) + end.b * t), a));
  };
};

/**
 * Returns a view of this scale by the specified accessor function <tt>f</tt>.
 * Given a scale <tt>y</tt>, <tt>y.by(function(d) d.foo)</tt> is equivalent to
 * <tt>function(d) y(d.foo)</tt>.
 *
 * <p>This method is provided for convenience, such that scales can be
 * succinctly defined inline. For example, given an array of data elements that
 * have a <tt>score</tt> attribute with the domain [0, 1], the height property
 * could be specified as:
 *
 * <pre>    .height(pv.Scale.linear().range(0, 480).by(function(d) d.score))</pre>
 *
 * This is equivalent to:
 *
 * <pre>    .height(function(d) d.score * 480)</pre>
 *
 * This method should be used judiciously; it is typically more clear to invoke
 * the scale directly, passing in the value to be scaled.
 *
 * @function
 * @name pv.Scale.prototype.by
 * @param {function} f an accessor function.
 * @returns {pv.Scale} a view of this scale by the specified accessor function.
 */

pv.Scale.common = {
    by: function(f) {
      var scale = this;
      function by() { return scale(f.apply(this, arguments)); }
      for (var method in scale) by[method] = scale[method];
      return by;
    },
      
    by1: function(f) {
      var scale = this;
      function by1(x) { return scale(f.call(this, x)); }
      for (var method in scale) by1[method] = scale[method];
      return by1;
    },
    
    transform: function(t){
      var scale = this;
      function transfScale(){
        return t.call(this, scale.apply(scale, arguments)); 
      }
        
      for (var method in scale) transfScale[method] = scale[method];

      return transfScale;
    }
};
/**
 * Returns a default quantitative, linear, scale for the specified domain. The
 * arguments to this constructor are optional, and equivalent to calling
 * {@link #domain}. The default domain and range are [0,1].
 *
 * <p>This constructor is typically not used directly; see one of the
 * quantitative scale implementations instead.
 *
 * @class Represents an abstract quantitative scale; a function that performs a
 * numeric transformation. This class is typically not used directly; see one of
 * the quantitative scale implementations (linear, log, root, etc.)
 * instead. <style type="text/css">sub{line-height:0}</style> A quantitative
 * scale represents a 1-dimensional transformation from a numeric domain of
 * input data [<i>d<sub>0</sub></i>, <i>d<sub>1</sub></i>] to a numeric range of
 * pixels [<i>r<sub>0</sub></i>, <i>r<sub>1</sub></i>]. In addition to
 * readability, scales offer several useful features:
 *
 * <p>1. The range can be expressed in colors, rather than pixels. For example:
 *
 * <pre>    .fillStyle(pv.Scale.linear(0, 100).range("red", "green"))</pre>
 *
 * will fill the marks "red" on an input value of 0, "green" on an input value
 * of 100, and some color in-between for intermediate values.
 *
 * <p>2. The domain and range can be subdivided for a non-uniform
 * transformation. For example, you may want a diverging color scale that is
 * increasingly red for negative values, and increasingly green for positive
 * values:
 *
 * <pre>    .fillStyle(pv.Scale.linear(-1, 0, 1).range("red", "white", "green"))</pre>
 *
 * The domain can be specified as a series of <i>n</i> monotonically-increasing
 * values; the range must also be specified as <i>n</i> values, resulting in
 * <i>n - 1</i> contiguous linear scales.
 *
 * <p>3. Quantitative scales can be inverted for interaction. The
 * {@link #invert} method takes a value in the output range, and returns the
 * corresponding value in the input domain. This is frequently used to convert
 * the mouse location (see {@link pv.Mark#mouse}) to a value in the input
 * domain. Note that inversion is only supported for numeric ranges, and not
 * colors.
 *
 * <p>4. A scale can be queried for reasonable "tick" values. The {@link #ticks}
 * method provides a convenient way to get a series of evenly-spaced rounded
 * values in the input domain. Frequently these are used in conjunction with
 * {@link pv.Rule} to display tick marks or grid lines.
 *
 * <p>5. A scale can be "niced" to extend the domain to suitable rounded
 * numbers. If the minimum and maximum of the domain are messy because they are
 * derived from data, you can use {@link #nice} to round these values down and
 * up to even numbers.
 *
 * @param {number...} domain... optional domain values.
 * @see pv.Scale.linear
 * @see pv.Scale.log
 * @see pv.Scale.root
 * @extends pv.Scale
 */
pv.Scale.quantitative = function() {
  var d = [0, 1], // default domain
      l = [0, 1], // default transformed domain
      r = [0, 1], // default range
      i = [pv.identity], // default interpolators
      type = Number, // default type
      n = false, // whether the domain is negative
      f = pv.identity, // default forward transform
      g = pv.identity, // default inverse transform
      tickFormat = String, // default tick formatting function
      tickFormatter = null, // custom tick formatting function
      dateTickFormat, //custom date tick format
      dateTickPrecision, //custom date tick precision
      usedDateTickPrecision,
      usedNumberExponent;

  /** @private */
  function newDate(x) {
    return new Date(x);
  }

  /** @private */
  function scale(x) {
    var j = pv.search(d, x);
    if (j < 0) j = -j - 2;
    j = Math.max(0, Math.min(i.length - 1, j));
    return i[j]((f(x) - l[j]) / (l[j + 1] - l[j]));
  }

  /** @private */
  scale.transform = function(forward, inverse) {
    /** @ignore */ f = function(x) { return n ? -forward(-x) : forward(x); };
    /** @ignore */ g = function(y) { return n ? -inverse(-y) : inverse(y); };
    l = d.map(f);
    return this;
  };

  /**
   * Sets or gets the input domain. This method can be invoked several ways:
   *
   * <p>1. <tt>domain(min, ..., max)</tt>
   *
   * <p>Specifying the domain as a series of numbers is the most explicit and
   * recommended approach. Most commonly, two numbers are specified: the minimum
   * and maximum value. However, for a diverging scale, or other subdivided
   * non-uniform scales, multiple values can be specified. Values can be derived
   * from data using {@link pv.min} and {@link pv.max}. For example:
   *
   * <pre>    .domain(0, pv.max(array))</pre>
   *
   * An alternative method for deriving minimum and maximum values from data
   * follows.
   *
   * <p>2. <tt>domain(array, minf, maxf)</tt>
   *
   * <p>When both the minimum and maximum value are derived from data, the
   * arguments to the <tt>domain</tt> method can be specified as the array of
   * data, followed by zero, one or two accessor functions. For example, if the
   * array of data is just an array of numbers:
   *
   * <pre>    .domain(array)</pre>
   *
   * On the other hand, if the array elements are objects representing stock
   * values per day, and the domain should consider the stock's daily low and
   * daily high:
   *
   * <pre>    .domain(array, function(d) d.low, function(d) d.high)</pre>
   *
   * The first method of setting the domain is preferred because it is more
   * explicit; setting the domain using this second method should be used only
   * if brevity is required.
   *
   * <p>3. <tt>domain()</tt>
   *
   * <p>Invoking the <tt>domain</tt> method with no arguments returns the
   * current domain as an array of numbers.
   *
   * @function
   * @name pv.Scale.quantitative.prototype.domain
   * @param {number...} domain... domain values.
   * @returns {pv.Scale.quantitative} <tt>this</tt>, or the current domain.
   */
  scale.domain = function(array, min, max) {
    if (arguments.length) {
      var o; // the object we use to infer the domain type
      if (array instanceof Array) {
        if (arguments.length < 2) min = pv.identity;
        if (arguments.length < 3) max = min;
        o = array.length && min(array[0]);
        d = array.length ? [pv.min(array, min), pv.max(array, max)] : [];
      } else {
        o = array;
        d = Array.prototype.slice.call(arguments).map(Number);
      }
      if (!d.length) d = [-Infinity, Infinity];
      else if (d.length == 1) d = [d[0], d[0]];
      n = (d[0] || d[d.length - 1]) < 0;
      l = d.map(f);
      type = (o instanceof Date) ? newDate : Number;
      return this;
    }
    return d.map(type);
  };

  /**
   * Sets or gets the output range. This method can be invoked several ways:
   *
   * <p>1. <tt>range(min, ..., max)</tt>
   *
   * <p>The range may be specified as a series of numbers or colors. Most
   * commonly, two numbers are specified: the minimum and maximum pixel values.
   * For a color scale, values may be specified as {@link pv.Color}s or
   * equivalent strings. For a diverging scale, or other subdivided non-uniform
   * scales, multiple values can be specified. For example:
   *
   * <pre>    .range("red", "white", "green")</pre>
   *
   * <p>Currently, only numbers and colors are supported as range values. The
   * number of range values must exactly match the number of domain values, or
   * the behavior of the scale is undefined.
   *
   * <p>2. <tt>range()</tt>
   *
   * <p>Invoking the <tt>range</tt> method with no arguments returns the current
   * range as an array of numbers or colors.
   *
   * @function
   * @name pv.Scale.quantitative.prototype.range
   * @param {...} range... range values.
   * @returns {pv.Scale.quantitative} <tt>this</tt>, or the current range.
   */
  scale.range = function() {
    if (arguments.length) {
      r = Array.prototype.slice.call(arguments);
      if (!r.length) r = [-Infinity, Infinity];
      else if (r.length == 1) r = [r[0], r[0]];
      i = [];
      for (var j = 0; j < r.length - 1; j++) {
        i.push(pv.Scale.interpolator(r[j], r[j + 1]));
      }
      return this;
    }
    return r;
  };

  /**
   * Inverts the specified value in the output range, returning the
   * corresponding value in the input domain. This is frequently used to convert
   * the mouse location (see {@link pv.Mark#mouse}) to a value in the input
   * domain. Inversion is only supported for numeric ranges, and not colors.
   *
   * <p>Note that this method does not do any rounding or bounds checking. If
   * the input domain is discrete (e.g., an array index), the returned value
   * should be rounded. If the specified <tt>y</tt> value is outside the range,
   * the returned value may be equivalently outside the input domain.
   *
   * @function
   * @name pv.Scale.quantitative.prototype.invert
   * @param {number} y a value in the output range (a pixel location).
   * @returns {number} a value in the input domain.
   */
  scale.invert = function(y) {
    var j = pv.search(r, y);
    if (j < 0) j = -j - 2;
    j = Math.max(0, Math.min(i.length - 1, j));
    return type(g(l[j] + (y - r[j]) / (r[j + 1] - r[j]) * (l[j + 1] - l[j])));
  };

  /**
   * Returns an array of evenly-spaced, suitably-rounded values in the input
   * domain. This method attempts to return between 5 and 10 tick values. These
   * values are frequently used in conjunction with {@link pv.Rule} to display
   * tick marks or grid lines.
   *
   * @function
   * @name pv.Scale.quantitative.prototype.ticks
   * @param {number} [m] optional number of desired numeric ticks.
   * @param {object} [options] optional keyword arguments object.
   * @param {boolean} [options.roundInside=true] should the ticks be ensured to be strictly inside the scale domain, or to strictly outside the scale domain.
   * @param {boolean} [options.numberExponentMin=-Inifinity] minimum value for the step exponent.
   * @param {boolean} [options.numberExponentMax=+Inifinity] maximum value for the step exponent.
   * @returns {number[]} an array input domain values to use as ticks.
   */
  scale.ticks = function(m, options) {
    var start = d[0],
        end = d[d.length - 1],
        reverse = end < start,
        min = reverse ? end : start,
        max = reverse ? start : end,
        span = max - min;

    /* Special case: empty, invalid or infinite span. */
    if (!span || !isFinite(span)) {
      if (type == newDate) tickFormat = pv.Format.date("%x");
      return [type(min)];
    }

    /* Special case: dates. */
    if (type == newDate) {
      /* Floor the date d given the precision p. */
      function floor(d, p) {
        switch (p) {
          case 31536e6: d.setMonth(0);
          case 2592e6: d.setDate(1);
          case 6048e5: if (p == 6048e5) d.setDate(d.getDate() - d.getDay());
          case 864e5: d.setHours(0);
          case 36e5: d.setMinutes(0);
          case 6e4: d.setSeconds(0);
          case 1e3: d.setMilliseconds(0);
        }
      }

      var nn = 5;

      var precision, format, increment, step = 1;
      if (span >= nn * 31536e6) {
        precision = 31536e6;
        format = "%Y";
        /** @ignore */ increment = function(d) { d.setFullYear(d.getFullYear() + step); };
      } else if (span >= nn * 2592e6) {
        precision = 2592e6;
        format = "%m/%Y";
        /** @ignore */ increment = function(d) { d.setMonth(d.getMonth() + step); };
      } else if (span >= nn * 6048e5) {
        precision = 6048e5;
        format = "%m/%d";
        /** @ignore */ increment = function(d) { d.setDate(d.getDate() + 7 * step); };
      } else if (span >= nn * 864e5) {
        precision = 864e5;
        format = "%m/%d";
        /** @ignore */ increment = function(d) { d.setDate(d.getDate() + step); };
      } else if (span >= nn * 36e5) {
        precision = 36e5;
        format = "%I:%M %p";
        /** @ignore */ increment = function(d) { d.setHours(d.getHours() + step); };
      } else if (span >= nn * 6e4) {
        precision = 6e4;
        format = "%I:%M %p";
        /** @ignore */ increment = function(d) { d.setMinutes(d.getMinutes() + step); };
      } else if (span >= nn * 1e3) {
        precision = 1e3;
        format = "%I:%M:%S";
        /** @ignore */ increment = function(d) { d.setSeconds(d.getSeconds() + step); };
      } else {
        precision = 1;
        format = "%S.%Qs";
        /** @ignore */ increment = function(d) { d.setTime(d.getTime() + step); };
      }

      precision = dateTickPrecision ? dateTickPrecision : precision;
      format = dateTickFormat ? dateTickFormat : format;
      
      usedDateTickPrecision = precision;
      
      tickFormat = pv.Format.date(format);

      var date = new Date(min), dates = [];
      floor(date, precision);

      /* If we'd generate too many ticks, skip some!. */
      var n = span / precision;
      if (n > 10) {
        switch (precision) {
          // 1 hour
          case 36e5: {
            step = (n > 20) ? 6 : 3;
            date.setHours(Math.floor(date.getHours() / step) * step);
            break;
          }

          // 30 days
          case 2592e6: {
            step = (n > 24) ? 3 : ((n > 12) ? 2 : 1);
            date.setMonth(Math.floor(date.getMonth() / step) * step);
            break;
          }

          // 7 day
          // (nn = 5:
          //     span >= 35 days (n >= 5)
          //     span < 150 days (n <  ~21.43)
          case 6048e5: {
            // span (days) | n (ticks/weeks) | step     | new n | description
            // -----------------------------------------------------------------
            // 106 - 149   | 15 - 22         | 3*7 = 21 | 5 - 7 | 15 weeks, ~3 months
            //  71 - 105   | 11 - 15         | 2*7 = 14 | 5 - 7 | 11 weeks, ~2.2 months
            //  35 -  70   |  5 - 10         | 1*7 =  7 |    -  |  5 weeks, ~1 month
            step = (n > 15) ? 3 : (n > 10 ? 2 : 1);
            date.setDate(Math.floor(date.getDate() / (7 * step)) * (7 * step));
            break;
          }

          // 1 day (nn = 5: span >= 5 hours and span < 35 days)
          // span > 10 days: more than 10 ticks
          case 864e5: {
            step = (n >= 30) ? 5 : ((n >= 15) ? 3 : 2);
            date.setDate(Math.floor(date.getDate() / step) * step);
            break;
          }

          // 1 minute
          case 6e4: {
            step = (n > 30) ? 15 : ((n > 15) ? 10 : 5);
            date.setMinutes(Math.floor(date.getMinutes() / step) * step);
            break;
          }

          // 1 second
          case 1e3: {
            step = (n > 90) ? 15 : ((n > 60) ? 10 : 5);
            date.setSeconds(Math.floor(date.getSeconds() / step) * step);
            break;
          }

          // 1 millisecond
          case 1: {
            step = (n > 1000) ? 250 : ((n > 200) ? 100 : ((n > 100) ? 50 : ((n > 50) ? 25 : 5)));
            date.setMilliseconds(Math.floor(date.getMilliseconds() / step) * step);
            break;
          }

          // 31536e6 - 1 year
          default: {
            step = pv.logCeil(n / 15, 10);
            if (n / step < 2) step /= 5;
            else if (n / step < 5) step /= 2;
            date.setFullYear(Math.floor(date.getFullYear() / step) * step);
            break;
          }
        }
      }


      if(dateTickPrecision){
        step = 1;
        increment = function(d) { d.setSeconds(d.getSeconds() + step*dateTickPrecision/1000);};
      }
      

      while (true) {
        increment(date);
        if (date > max) break;
        dates.push(new Date(date));
      }
      return reverse ? dates.reverse() : dates;
    }

    /* Normal case: numbers */
    if (m == null) {
        m = 10;
    }
    
    var roundInside = pv.get(options, 'roundInside', true);
    var exponentMin = pv.get(options, 'numberExponentMin', -Infinity);
    var exponentMax = pv.get(options, 'numberExponentMax', +Infinity);
    
    //var step = pv.logFloor(span / m, 10);
    var exponent = Math.floor(pv.log(span / m, 10));
    var overflow = false;
    if(exponent > exponentMax){
        exponent = exponentMax;
        overflow = true;
    } else if(exponent < exponentMin){
        exponent = exponentMin;
        overflow = true;
    }
    
    step = Math.pow(10, exponent);
    var mObtained = (span / step);
    
    var err = m / mObtained;
    if (err <= .15 && exponent < exponentMax - 1) { 
        step *= 10;
    } else if (err <= .35) {
        step *= 5;
    } else if (err <= .75) {
        step *= 2;
    }
    
    // Account for floating point precision errors
    exponent = Math.floor(pv.log(step, 10) + 1e-10);
        
    start = step * Math[roundInside ? 'ceil'  : 'floor'](min / step);
    end   = step * Math[roundInside ? 'floor' : 'ceil' ](max / step);
    
    usedNumberExponent = Math.max(0, -exponent);
    
    tickFormat = pv.Format.number().fractionDigits(usedNumberExponent);
    
    var ticks = pv.range(start, end + step, step);
    if(reverse){
        ticks.reverse();
    }
    
    ticks.roundInside = roundInside;
    ticks.step        = step;
    ticks.exponent    = exponent;
    ticks.exponentOverflow = overflow;
    ticks.exponentMin = exponentMin;
    ticks.exponentMax = exponentMax;
    
    return ticks;
  };


  /**
   * Formats the specified tick with a well defined string for the date
   * @function
   * @name pv.Scale.quantitative.prototype.dateTickFormat
   * @returns {string} a string with the desired tick format.
   */
  scale.dateTickFormat = function () {
    if (arguments.length) {
      dateTickFormat = arguments[0];
      return this;
    }
    return dateTickFormat;  };

  /**
   * Generates date ticks with a specified precision.
   * @function
   * @name pv.Scale.quantitative.prototype.dateTickPrecision
   * @param {number} [precision] The number of milliseconds that separate ticks.
   * @returns {number} the current date tick precision.
   */
  scale.dateTickPrecision = function () {
    if (arguments.length) {
      dateTickPrecision = arguments[0];
      return this;
    }
    return dateTickPrecision;  
  };


    /**
     * Gets or sets a custom tick formatter function.
     * 
     * @function
     * @name pv.Scale.quantitative.prototype.tickFormatter
     * @param {function} [f] The function that formats number or date ticks.
     * When ticks are dates, the second argument of the function is the 
     * desired tick precision.
     * 
     * @returns {pv.Scale|function} a custom formatter function or this instance.
     */
    scale.tickFormatter = function (f) {
      if (arguments.length) {
        tickFormatter = f;
        return this;
      }
      
      return tickFormatter;
   };
    
  /**
   * Formats the specified tick value using the appropriate precision, based on
   * the step interval between tick marks. If {@link #ticks} has not been called,
   * the argument is converted to a string, but no formatting is applied.
   *
   * @function
   * @name pv.Scale.quantitative.prototype.tickFormat
   * @param {number} t a tick value.
   * @returns {string} a formatted tick value.
   */
  scale.tickFormat = function (t) {
      var text;
      if(tickFormatter){
          text = tickFormatter(t, type !== Number ? usedDateTickPrecision : usedNumberExponent);
      } else {
          text = tickFormat(t); 
      }
      
      // Make sure it is a string
      return text == null ? '' : ('' + text);
  };

  /**
   * "Nices" this scale, extending the bounds of the input domain to
   * evenly-rounded values. Nicing is useful if the domain is computed
   * dynamically from data, and may be irregular. For example, given a domain of
   * [0.20147987687960267, 0.996679553296417], a call to <tt>nice()</tt> might
   * extend the domain to [0.2, 1].
   *
   * <p>This method must be invoked each time after setting the domain.
   *
   * @function
   * @name pv.Scale.quantitative.prototype.nice
   * @returns {pv.Scale.quantitative} <tt>this</tt>.
   */
  scale.nice = function() {
    if (d.length != 2) return this; // TODO support non-uniform domains
    var start = d[0],
        end = d[d.length - 1],
        reverse = end < start,
        min = reverse ? end : start,
        max = reverse ? start : end,
        span = max - min;

    /* Special case: empty, invalid or infinite span. */
    if (!span || !isFinite(span)) return this;

    var step = Math.pow(10, Math.round(Math.log(span) / Math.log(10)) - 1);
    d = [Math.floor(min / step) * step, Math.ceil(max / step) * step];
    if (reverse) d.reverse();
    l = d.map(f);
    return this;
  };

  /**
   * Returns a view of this scale by the specified accessor function <tt>f</tt>.
   * Given a scale <tt>y</tt>, <tt>y.by(function(d) d.foo)</tt> is equivalent to
   * <tt>function(d) y(d.foo)</tt>.
   *
   * <p>This method is provided for convenience, such that scales can be
   * succinctly defined inline. For example, given an array of data elements
   * that have a <tt>score</tt> attribute with the domain [0, 1], the height
   * property could be specified as:
   *
   * <pre>    .height(pv.Scale.linear().range(0, 480).by(function(d) d.score))</pre>
   *
   * This is equivalent to:
   *
   * <pre>    .height(function(d) d.score * 480)</pre>
   *
   * This method should be used judiciously; it is typically more clear to
   * invoke the scale directly, passing in the value to be scaled.
   *
   * @function
   * @name pv.Scale.quantitative.prototype.by
   * @param {function} f an accessor function.
   * @returns {pv.Scale.quantitative} a view of this scale by the specified
   * accessor function.
   */
  
  pv.copyOwn(scale, pv.Scale.common);

  scale.domain.apply(scale, arguments);
  return scale;
};
/**
 * Returns a linear scale for the specified domain. The arguments to this
 * constructor are optional, and equivalent to calling {@link #domain}.
 * The default domain and range are [0,1].
 *
 * @class Represents a linear scale; a function that performs a linear
 * transformation. <style type="text/css">sub{line-height:0}</style> Most
 * commonly, a linear scale represents a 1-dimensional linear transformation
 * from a numeric domain of input data [<i>d<sub>0</sub></i>,
 * <i>d<sub>1</sub></i>] to a numeric range of pixels [<i>r<sub>0</sub></i>,
 * <i>r<sub>1</sub></i>]. The equation for such a scale is:
 *
 * <blockquote><i>f(x) = (x - d<sub>0</sub>) / (d<sub>1</sub> - d<sub>0</sub>) *
 * (r<sub>1</sub> - r<sub>0</sub>) + r<sub>0</sub></i></blockquote>
 *
 * For example, a linear scale from the domain [0, 100] to range [0, 640]:
 *
 * <blockquote><i>f(x) = (x - 0) / (100 - 0) * (640 - 0) + 0</i><br>
 * <i>f(x) = x / 100 * 640</i><br>
 * <i>f(x) = x * 6.4</i><br>
 * </blockquote>
 *
 * Thus, saying
 *
 * <pre>    .height(function(d) d * 6.4)</pre>
 *
 * is identical to
 *
 * <pre>    .height(pv.Scale.linear(0, 100).range(0, 640))</pre>
 *
 * Note that the scale is itself a function, and thus can be used as a property
 * directly, assuming that the data associated with a mark is a number. While
 * this is convenient for single-use scales, frequently it is desirable to
 * define scales globally:
 *
 * <pre>var y = pv.Scale.linear(0, 100).range(0, 640);</pre>
 *
 * The <tt>y</tt> scale can now be equivalently referenced within a property:
 *
 * <pre>    .height(function(d) y(d))</pre>
 *
 * Alternatively, if the data are not simple numbers, the appropriate value can
 * be passed to the <tt>y</tt> scale (e.g., <tt>d.foo</tt>). The {@link #by}
 * method similarly allows the data to be mapped to a numeric value before
 * performing the linear transformation.
 *
 * @param {number...} domain... optional domain values.
 * @extends pv.Scale.quantitative
 */
pv.Scale.linear = function() {
  var scale = pv.Scale.quantitative();
  scale.domain.apply(scale, arguments);
  return scale;
};
/**
 * Returns a log scale for the specified domain. The arguments to this
 * constructor are optional, and equivalent to calling {@link #domain}.
 * The default domain is [1,10] and the default range is [0,1].
 *
 * @class Represents a log scale. <style
 * type="text/css">sub{line-height:0}</style> Most commonly, a log scale
 * represents a 1-dimensional log transformation from a numeric domain of input
 * data [<i>d<sub>0</sub></i>, <i>d<sub>1</sub></i>] to a numeric range of
 * pixels [<i>r<sub>0</sub></i>, <i>r<sub>1</sub></i>]. The equation for such a
 * scale is:
 *
 * <blockquote><i>f(x) = (log(x) - log(d<sub>0</sub>)) / (log(d<sub>1</sub>) -
 * log(d<sub>0</sub>)) * (r<sub>1</sub> - r<sub>0</sub>) +
 * r<sub>0</sub></i></blockquote>
 *
 * where <i>log(x)</i> represents the zero-symmetric logarthim of <i>x</i> using
 * the scale's associated base (default: 10, see {@link pv.logSymmetric}). For
 * example, a log scale from the domain [1, 100] to range [0, 640]:
 *
 * <blockquote><i>f(x) = (log(x) - log(1)) / (log(100) - log(1)) * (640 - 0) + 0</i><br>
 * <i>f(x) = log(x) / 2 * 640</i><br>
 * <i>f(x) = log(x) * 320</i><br>
 * </blockquote>
 *
 * Thus, saying
 *
 * <pre>    .height(function(d) Math.log(d) * 138.974)</pre>
 *
 * is equivalent to
 *
 * <pre>    .height(pv.Scale.log(1, 100).range(0, 640))</pre>
 *
 * Note that the scale is itself a function, and thus can be used as a property
 * directly, assuming that the data associated with a mark is a number. While
 * this is convenient for single-use scales, frequently it is desirable to
 * define scales globally:
 *
 * <pre>var y = pv.Scale.log(1, 100).range(0, 640);</pre>
 *
 * The <tt>y</tt> scale can now be equivalently referenced within a property:
 *
 * <pre>    .height(function(d) y(d))</pre>
 *
 * Alternatively, if the data are not simple numbers, the appropriate value can
 * be passed to the <tt>y</tt> scale (e.g., <tt>d.foo</tt>). The {@link #by}
 * method similarly allows the data to be mapped to a numeric value before
 * performing the log transformation.
 *
 * @param {number...} domain... optional domain values.
 * @extends pv.Scale.quantitative
 */
pv.Scale.log = function() {
  var scale = pv.Scale.quantitative(1, 10),
      b, // logarithm base
      p, // cached Math.log(b)
      /** @ignore */ log = function(x) { return Math.log(x) / p; },
      /** @ignore */ pow = function(y) { return Math.pow(b, y); };

  /**
   * Returns an array of evenly-spaced, suitably-rounded values in the input
   * domain. These values are frequently used in conjunction with
   * {@link pv.Rule} to display tick marks or grid lines.
   *
   * @function
   * @name pv.Scale.log.prototype.ticks
   * @returns {number[]} an array input domain values to use as ticks.
   */
  scale.ticks = function() {
    // TODO support non-uniform domains
    var d = scale.domain(),
        n = d[0] < 0,
        i = Math.floor(n ? -log(-d[0]) : log(d[0])),
        j = Math.ceil(n ? -log(-d[1]) : log(d[1])),
        ticks = [];
    if (n) {
      ticks.push(-pow(-i));
      for (; i++ < j;) for (var k = b - 1; k > 0; k--) ticks.push(-pow(-i) * k);
    } else {
      for (; i < j; i++) for (var k = 1; k < b; k++) ticks.push(pow(i) * k);
      ticks.push(pow(i));
    }
    for (i = 0; ticks[i] < d[0]; i++); // strip small values
    for (j = ticks.length; ticks[j - 1] > d[1]; j--); // strip big values
    return ticks.slice(i, j);
  };

  /**
   * Formats the specified tick value using the appropriate precision, assuming
   * base 10.
   *
   * @function
   * @name pv.Scale.log.prototype.tickFormat
   * @param {number} t a tick value.
   * @returns {string} a formatted tick value.
   */
  scale.tickFormat = function(t) {
    return t.toPrecision(1);
  };

  /**
   * "Nices" this scale, extending the bounds of the input domain to
   * evenly-rounded values. This method uses {@link pv.logFloor} and
   * {@link pv.logCeil}. Nicing is useful if the domain is computed dynamically
   * from data, and may be irregular. For example, given a domain of
   * [0.20147987687960267, 0.996679553296417], a call to <tt>nice()</tt> might
   * extend the domain to [0.1, 1].
   *
   * <p>This method must be invoked each time after setting the domain (and
   * base).
   *
   * @function
   * @name pv.Scale.log.prototype.nice
   * @returns {pv.Scale.log} <tt>this</tt>.
   */
  scale.nice = function() {
    // TODO support non-uniform domains
    var d = scale.domain();
    return scale.domain(pv.logFloor(d[0], b), pv.logCeil(d[1], b));
  };

  /**
   * Sets or gets the logarithm base. Defaults to 10.
   *
   * @function
   * @name pv.Scale.log.prototype.base
   * @param {number} [v] the new base.
   * @returns {pv.Scale.log} <tt>this</tt>, or the current base.
   */
  scale.base = function(v) {
    if (arguments.length) {
      b = Number(v);
      p = Math.log(b);
      scale.transform(log, pow); // update transformed domain
      return this;
    }
    return b;
  };

  scale.domain.apply(scale, arguments);
  return scale.base(10);
};
/**
 * Returns a root scale for the specified domain. The arguments to this
 * constructor are optional, and equivalent to calling {@link #domain}.
 * The default domain and range are [0,1].
 *
 * @class Represents a root scale; a function that performs a power
 * transformation. <style type="text/css">sub{line-height:0}</style> Most
 * commonly, a root scale represents a 1-dimensional root transformation from a
 * numeric domain of input data [<i>d<sub>0</sub></i>, <i>d<sub>1</sub></i>] to
 * a numeric range of pixels [<i>r<sub>0</sub></i>, <i>r<sub>1</sub></i>].
 *
 * <p>Note that the scale is itself a function, and thus can be used as a
 * property directly, assuming that the data associated with a mark is a
 * number. While this is convenient for single-use scales, frequently it is
 * desirable to define scales globally:
 *
 * <pre>var y = pv.Scale.root(0, 100).range(0, 640);</pre>
 *
 * The <tt>y</tt> scale can now be equivalently referenced within a property:
 *
 * <pre>    .height(function(d) y(d))</pre>
 *
 * Alternatively, if the data are not simple numbers, the appropriate value can
 * be passed to the <tt>y</tt> scale (e.g., <tt>d.foo</tt>). The {@link #by}
 * method similarly allows the data to be mapped to a numeric value before
 * performing the root transformation.
 *
 * @param {number...} domain... optional domain values.
 * @extends pv.Scale.quantitative
 */
pv.Scale.root = function() {
  var scale = pv.Scale.quantitative();

  /**
   * Sets or gets the exponent; defaults to 2.
   *
   * @function
   * @name pv.Scale.root.prototype.power
   * @param {number} [v] the new exponent.
   * @returns {pv.Scale.root} <tt>this</tt>, or the current base.
   */
  scale.power = function(v) {
    if (arguments.length) {
      var b = Number(v), p = 1 / b;
      scale.transform(
        function(x) { return Math.pow(x, p); },
        function(y) { return Math.pow(y, b); });
      return this;
    }
    return b;
  };

  scale.domain.apply(scale, arguments);
  return scale.power(2);
};
/**
 * Returns an ordinal scale for the specified domain. The arguments to this
 * constructor are optional, and equivalent to calling {@link #domain}.
 *
 * @class Represents an ordinal scale. <style
 * type="text/css">sub{line-height:0}</style> An ordinal scale represents a
 * pairwise mapping from <i>n</i> discrete values in the input domain to
 * <i>n</i> discrete values in the output range. For example, an ordinal scale
 * might map a domain of species ["setosa", "versicolor", "virginica"] to colors
 * ["red", "green", "blue"]. Thus, saying
 *
 * <pre>    .fillStyle(function(d) {
 *         switch (d.species) {
 *           case "setosa": return "red";
 *           case "versicolor": return "green";
 *           case "virginica": return "blue";
 *         }
 *       })</pre>
 *
 * is equivalent to
 *
 * <pre>    .fillStyle(pv.Scale.ordinal("setosa", "versicolor", "virginica")
 *         .range("red", "green", "blue")
 *         .by(function(d) d.species))</pre>
 *
 * If the mapping from species to color does not need to be specified
 * explicitly, the domain can be omitted. In this case it will be inferred
 * lazily from the data:
 *
 * <pre>    .fillStyle(pv.colors("red", "green", "blue")
 *         .by(function(d) d.species))</pre>
 *
 * When the domain is inferred, the first time the scale is invoked, the first
 * element from the range will be returned. Subsequent calls with unique values
 * will return subsequent elements from the range. If the inferred domain grows
 * larger than the range, range values will be reused. However, it is strongly
 * recommended that the domain and the range contain the same number of
 * elements.
 *
 * <p>A range can be discretized from a continuous interval (e.g., for pixel
 * positioning) by using {@link #split}, {@link #splitFlush} or
 * {@link #splitBanded} after the domain has been set. For example, if
 * <tt>states</tt> is an array of the fifty U.S. state names, the state name can
 * be encoded in the left position:
 *
 * <pre>    .left(pv.Scale.ordinal(states)
 *         .split(0, 640)
 *         .by(function(d) d.state))</pre>
 *
 * <p>N.B.: ordinal scales are not invertible (at least not yet), since the
 * domain and range and discontinuous. A workaround is to use a linear scale.
 *
 * @param {...} domain... optional domain values.
 * @extends pv.Scale
 * @see pv.colors
 */
pv.Scale.ordinal = function() {
  var d = [], i = {}, r = [], band = 0;

  /** @private */
  function scale(x) {
    if (!(x in i)) i[x] = d.push(x) - 1;
    return r[i[x] % r.length];
  }
  
  /**
   * Sets or gets the input domain. This method can be invoked several ways:
   *
   * <p>1. <tt>domain(values...)</tt>
   *
   * <p>Specifying the domain as a series of values is the most explicit and
   * recommended approach. However, if the domain values are derived from data,
   * you may find the second method more appropriate.
   *
   * <p>2. <tt>domain(array, f)</tt>
   *
   * <p>Rather than enumerating the domain values as explicit arguments to this
   * method, you can specify a single argument of an array. In addition, you can
   * specify an optional accessor function to extract the domain values from the
   * array.
   *
   * <p>3. <tt>domain()</tt>
   *
   * <p>Invoking the <tt>domain</tt> method with no arguments returns the
   * current domain as an array.
   *
   * @function
   * @name pv.Scale.ordinal.prototype.domain
   * @param {...} domain... domain values.
   * @returns {pv.Scale.ordinal} <tt>this</tt>, or the current domain.
   */
  scale.domain = function(array, f) {
    if (arguments.length) {
      array = (array instanceof Array)
          ? ((arguments.length > 1) ? pv.map(array, f) : array)
          : Array.prototype.slice.call(arguments);

      /* Filter the specified ordinals to their unique values. */
      d = [];
      var seen = {};
      for (var j = 0; j < array.length; j++) {
        var o = array[j];
        if (!(o in seen)) {
          seen[o] = true;
          d.push(o);
        }
      }

      i = pv.numerate(d);
      return this;
    }
    return d;
  };

  /**
   * Sets or gets the output range. This method can be invoked several ways:
   *
   * <p>1. <tt>range(values...)</tt>
   *
   * <p>Specifying the range as a series of values is the most explicit and
   * recommended approach. However, if the range values are derived from data,
   * you may find the second method more appropriate.
   *
   * <p>2. <tt>range(array, f)</tt>
   *
   * <p>Rather than enumerating the range values as explicit arguments to this
   * method, you can specify a single argument of an array. In addition, you can
   * specify an optional accessor function to extract the range values from the
   * array.
   *
   * <p>3. <tt>range()</tt>
   *
   * <p>Invoking the <tt>range</tt> method with no arguments returns the
   * current range as an array.
   *
   * @function
   * @name pv.Scale.ordinal.prototype.range
   * @param {...} range... range values.
   * @returns {pv.Scale.ordinal} <tt>this</tt>, or the current range.
   */
  scale.range = function(array, f) {
    if (arguments.length) {
      r = (array instanceof Array)
          ? ((arguments.length > 1) ? pv.map(array, f) : array)
          : Array.prototype.slice.call(arguments);
      if (typeof r[0] == "string") r = r.map(pv.fillStyle);
      r.min = r[0];
      r.max = r[r.length - 1];
      return this;
    }
    return r;
  };

  /**
   * Sets the range from the given continuous interval. The interval
   * [<i>min</i>, <i>max</i>] is subdivided into <i>n</i> equispaced points,
   * where <i>n</i> is the number of (unique) values in the domain. The first
   * and last point are offset from the edge of the range by half the distance
   * between points.
   *
   * <p>This method must be called <i>after</i> the domain is set.
   * <p>
   * The computed step width can be retrieved from the range as
   * <tt>scale.range().step</tt>.
   * </p>
   * 
   * @function
   * @name pv.Scale.ordinal.prototype.split
   * @param {number} min minimum value of the output range.
   * @param {number} max maximum value of the output range.
   * @returns {pv.Scale.ordinal} <tt>this</tt>.
   * @see #splitFlush
   * @see #splitBanded
   */
  scale.split = function(min, max) {
    var R = max - min;
    var N = this.domain().length;
    var step = 0;
    if(R === 0){
        r = pv.array(N, min);
    } else if(N){
        step = (max - min) / N;
        r = pv.range(min + step / 2, max, step);
    }
    r.min = min;
    r.max = max;
    r.step = step;
    return this;
  };

  /**
   * Sets the range from the given continuous interval.
   * The interval [<i>min</i>, <i>max</i>] is subdivided into <i>n</i> equispaced bands,
   * where <i>n</i> is the number of (unique) values in the domain.
   *
   * The first and last band are offset from the edge of the range by
   * half the distance between bands.
   *
   * The positions are centered in each band.
   * <pre>
   * m = M/2
   *
   *  |mBm|mBm| ... |mBm|
   * min               max
   *   r0 -> min + m + B/2
   * </pre>
   * <p>This method must be called <i>after</i> the domain is set.</p>
   * <p>
   * The computed absolute band width can be retrieved from the range as
   * <tt>scale.range().band</tt>.
   * The properties <tt>step</tt> and <tt>margin</tt> are also exposed.
   * </p>
   *
   * @function
   * @name pv.Scale.ordinal.prototype.splitBandedCenter
   * @param {number} min minimum value of the output range.
   * @param {number} max maximum value of the output range.
   * @param {number} [band] the fractional band width in [0, 1]; defaults to 1.
   * @returns {pv.Scale.ordinal} <tt>this</tt>.
   * @see #split
   */
  scale.splitBandedCenter = function(min, max, band) {
    scale.split(min, max);
    if (band == null) {
        band = 1;
    }
    r.band   = r.step * band;
    r.margin = r.step - r.band;
    r.min = min;
    r.max = max;
    return this;
  };

  /**
   * Sets the range from the given continuous interval.
   * The interval [<i>min</i>, <i>max</i>] is subdivided into <i>n</i> equispaced bands,
   * where <i>n</i> is the number of (unique) values in the domain.
   *
   * The first and last bands are aligned to the edges of the range.
   * <pre>
   *  |Bm|mBm| ...|mB|
   *  or
   *  |BM |BM |... |B|
   * min           max
   *   r0 -> min + B/2
   * </pre>
   * <p>
   * The positions are centered in each band
   * (the first position is at <tt>min + band / 2</tt>).
   * </p>
   * <p>This method must be called <i>after</i> the domain is set.</p>
   * <p>
   * The computed absolute band width can be retrieved from the range as
   * <tt>scale.range().band</tt>.
   * The properties <tt>step</tt> and <tt>margin</tt> are also exposed.
   * </p>
   *
   * @function
   * @name pv.Scale.ordinal.prototype.splitBandedFlushCenter
   * @param {number} min minimum value of the output range.
   * @param {number} max maximum value of the output range.
   * @param {number} [band] the fractional band width in [0, 1]; defaults to 1.
   * @returns {pv.Scale.ordinal} <tt>this</tt>.
   * @see #split
   */
  scale.splitBandedFlushCenter = function(min, max, band) {
    if (band == null) {
        band = 1;
    }

    var R = (max - min),
        N = this.domain().length,
        S = 0,
        B = 0,
        M = 0;
    if(R === 0){
        r = pv.array(N, min);
    } else if(N){
        B = (R * band) / N;
        M = N > 1 ? ((R - N * B) / (N - 1)) : 0;
        S = M + B;
        
        r = pv.range(min + B / 2, max, S);
    }
    
    r.step   = S;
    r.band   = B;
    r.margin = M;
    r.min = min;
    r.max = max;
    return this;
  };

  /**
   * Sets the range from the given continuous interval. The interval
   * [<i>min</i>, <i>max</i>] is subdivided into <i>n</i> equispaced points,
   * where <i>n</i> is the number of (unique) values in the domain. The first
   * and last point are exactly on the edge of the range.
   *
   * <p>This method must be called <i>after</i> the domain is set.
   *
   * @function
   * @name pv.Scale.ordinal.prototype.splitFlush
   * @param {number} min minimum value of the output range.
   * @param {number} max maximum value of the output range.
   * @returns {pv.Scale.ordinal} <tt>this</tt>.
   * @see #split
   */
  scale.splitFlush = function(min, max) {
    var n = this.domain().length, 
        step = (max - min) / (n - 1);
    
    r = (n == 1) ? [(min + max) / 2]
        : pv.range(min, max + step / 2, step);
    r.min = min;
    r.max = max;
    return this;
  };

  /**
   * Sets the range from the given continuous interval. The interval
   * [<i>min</i>, <i>max</i>] is subdivided into <i>n</i> equispaced bands,
   * where <i>n</i> is the number of (unique) values in the domain. The first
   * and last band are offset from the edge of the range by the distance between
   * bands.
   *
   * <p>The band width argument, <tt>band</tt>, is typically in the range [0, 1]
   * and defaults to 1. This fraction corresponds to the amount of space in the
   * range to allocate to the bands, as opposed to padding. A value of 0.5 means
   * that the band width will be equal to the padding width. The computed
   * absolute band width can be retrieved from the range as
   * <tt>scale.range().band</tt>.
   * The properties <tt>step</tt> and <tt>margin</tt> are also exposed.
   * </p>
   *
   * <pre>
   * m = M/2
   *
   *  |MBm|mBm| ... |mBM|
   * min               max
   *   r0 -> min + M
   * </pre>
   *
   * <p>If the band width argument is negative, this method will allocate bands
   * of a <i>fixed</i> width <tt>-band</tt>, rather than a relative fraction of
   * the available space.
   *
   * <p>Tip: to inset the bands by a fixed amount <tt>p</tt>, specify a minimum
   * value of <tt>min + p</tt> (or simply <tt>p</tt>, if <tt>min</tt> is
   * 0). Then set the mark width to <tt>scale.range().band - p</tt>.
   *
   * <p>This method must be called <i>after</i> the domain is set.
   *
   * @function
   * @name pv.Scale.ordinal.prototype.splitBanded
   * @param {number} min minimum value of the output range.
   * @param {number} max maximum value of the output range.
   * @param {number} [band] the fractional band width in [0, 1]; defaults to 1.
   * @returns {pv.Scale.ordinal} <tt>this</tt>.
   * @see #split
   */
  scale.splitBanded = function(min, max, band) {
    if (arguments.length < 3) band = 1;
    if (band < 0) {
      var n = this.domain().length,
          total = -band * n,
          remaining = max - min - total,
          padding = remaining / (n + 1);
      r = pv.range(min + padding, max, padding - band);
      r.band = -band;
    } else {
      var step = (max - min) / (this.domain().length + (1 - band));
      r = pv.range(min + step * (1 - band), max, step);
      r.band = step * band;
      r.step = step;
      r.margin = step - r.band;
    }
    r.min = min;
    r.max = max;
    return this;
  };
  
  /**
   * Inverts the specified value in the output range, 
   * returning the index of the closest corresponding value in the input domain.
   * This is frequently used to convert the mouse location (see {@link pv.Mark#mouse}) 
   * to a value in the input domain. 
   * 
   * The number of input domain values is returned
   * if the specified point is closest to the end margin of the last input domain value.
   * 
   * @function
   * @name pv.Scale.quantitative.prototype.invertIndex
   * @param {number} y a value in the output range (a pixel location).
   * @param {boolean} [noRound=false] returns an un-rounded result.
   * @returns {number} the index of the closest input domain value.
   */
  scale.invertIndex = function(y, noRound) {
    var N = this.domain().length;
    if(N === 0){
        return -1;
    }
    
    var r = this.range();
    var R = r.max - r.min;
    if(R === 0){
        return 0;
    }
    
    var S = R/N;
    if(y >= r.max){
        return N;
    }
    
    if(y < r.min){
        return 0;
    }
    
    var i = (y - r.min) / S;
    return noRound ? i : Math.round(i);
  };
  
  /**
   * Returns a view of this scale by the specified accessor function <tt>f</tt>.
   * Given a scale <tt>y</tt>, <tt>y.by(function(d) d.foo)</tt> is equivalent to
   * <tt>function(d) y(d.foo)</tt>. This method should be used judiciously; it
   * is typically more clear to invoke the scale directly, passing in the value
   * to be scaled.
   *
   * @function
   * @name pv.Scale.ordinal.prototype.by
   * @param {function} f an accessor function.
   * @returns {pv.Scale.ordinal} a view of this scale by the specified accessor
   * function.
   */
  
  pv.copyOwn(scale, pv.Scale.common);
    
  scale.domain.apply(scale, arguments);
  return scale;
};
/**
 * Constructs a default quantile scale. The arguments to this constructor are
 * optional, and equivalent to calling {@link #domain}. The default domain is
 * the empty set, and the default range is [0,1].
 *
 * @class Represents a quantile scale; a function that maps from a value within
 * a sortable domain to a quantized numeric range. Typically, the domain is a
 * set of numbers, but any sortable value (such as strings) can be used as the
 * domain of a quantile scale. The range defaults to [0,1], with 0 corresponding
 * to the smallest value in the domain, 1 the largest, .5 the median, etc.
 *
 * <p>By default, the number of quantiles in the range corresponds to the number
 * of values in the domain. The {@link #quantiles} method can be used to specify
 * an explicit number of quantiles; for example, <tt>quantiles(4)</tt> produces
 * a standard quartile scale. A quartile scale's range is a set of four discrete
 * values, such as [0, 1/3, 2/3, 1]. Calling the {@link #range} method will
 * scale these discrete values accordingly, similar to {@link
 * pv.Scale.ordinal#splitFlush}.
 *
 * <p>For example, given the strings ["c", "a", "b"], a default quantile scale:
 *
 * <pre>pv.Scale.quantile("c", "a", "b")</pre>
 *
 * will return 0 for "a", .5 for "b", and 1 for "c".
 *
 * @extends pv.Scale
 */
pv.Scale.quantile = function() {
  var n = -1, // number of quantiles
      j = -1, // max quantile index
      q = [], // quantile boundaries
      d = [], // domain
      y = pv.Scale.linear(); // range

  /** @private */
  function scale(x) {
    return y(Math.max(0, Math.min(j, pv.search.index(q, x) - 1)) / j);
  }

  /**
   * Sets or gets the quantile boundaries. By default, each element in the
   * domain is in its own quantile. If the argument to this method is a number,
   * it specifies the number of equal-sized quantiles by which to divide the
   * domain.
   *
   * <p>If no arguments are specified, this method returns the quantile
   * boundaries; the first element is always the minimum value of the domain,
   * and the last element is the maximum value of the domain. Thus, the length
   * of the returned array is always one greater than the number of quantiles.
   *
   * @function
   * @name pv.Scale.quantile.prototype.quantiles
   * @param {number} x the number of quantiles.
   */
  scale.quantiles = function(x) {
    if (arguments.length) {
      n = Number(x);
      if (n < 0) {
        q = [d[0]].concat(d);
        j = d.length - 1;
      } else {
        q = [];
        q[0] = d[0];
        for (var i = 1; i <= n; i++) {
          q[i] = d[~~(i * (d.length - 1) / n)];
        }
        j = n - 1;
      }
      return this;
    }
    return q;
  };

  /**
   * Sets or gets the input domain. This method can be invoked several ways:
   *
   * <p>1. <tt>domain(values...)</tt>
   *
   * <p>Specifying the domain as a series of values is the most explicit and
   * recommended approach. However, if the domain values are derived from data,
   * you may find the second method more appropriate.
   *
   * <p>2. <tt>domain(array, f)</tt>
   *
   * <p>Rather than enumerating the domain values as explicit arguments to this
   * method, you can specify a single argument of an array. In addition, you can
   * specify an optional accessor function to extract the domain values from the
   * array.
   *
   * <p>3. <tt>domain()</tt>
   *
   * <p>Invoking the <tt>domain</tt> method with no arguments returns the
   * current domain as an array.
   *
   * @function
   * @name pv.Scale.quantile.prototype.domain
   * @param {...} domain... domain values.
   * @returns {pv.Scale.quantile} <tt>this</tt>, or the current domain.
   */
  scale.domain = function(array, f) {
    if (arguments.length) {
      d = (array instanceof Array)
          ? pv.map(array, f)
          : Array.prototype.slice.call(arguments);
      d.sort(pv.naturalOrder);
      scale.quantiles(n); // recompute quantiles
      return this;
    }
    return d;
  };

  /**
   * Sets or gets the output range. This method can be invoked several ways:
   *
   * <p>1. <tt>range(min, ..., max)</tt>
   *
   * <p>The range may be specified as a series of numbers or colors. Most
   * commonly, two numbers are specified: the minimum and maximum pixel values.
   * For a color scale, values may be specified as {@link pv.Color}s or
   * equivalent strings. For a diverging scale, or other subdivided non-uniform
   * scales, multiple values can be specified. For example:
   *
   * <pre>    .range("red", "white", "green")</pre>
   *
   * <p>Currently, only numbers and colors are supported as range values. The
   * number of range values must exactly match the number of domain values, or
   * the behavior of the scale is undefined.
   *
   * <p>2. <tt>range()</tt>
   *
   * <p>Invoking the <tt>range</tt> method with no arguments returns the current
   * range as an array of numbers or colors.
   *
   * @function
   * @name pv.Scale.quantile.prototype.range
   * @param {...} range... range values.
   * @returns {pv.Scale.quantile} <tt>this</tt>, or the current range.
   */
  scale.range = function() {
    if (arguments.length) {
      y.range.apply(y, arguments);
      return this;
    }
    return y.range();
  };

  /**
   * Returns a view of this scale by the specified accessor function <tt>f</tt>.
   * Given a scale <tt>y</tt>, <tt>y.by(function(d) d.foo)</tt> is equivalent to
   * <tt>function(d) y(d.foo)</tt>.
   *
   * <p>This method is provided for convenience, such that scales can be
   * succinctly defined inline. For example, given an array of data elements
   * that have a <tt>score</tt> attribute with the domain [0, 1], the height
   * property could be specified as:
   *
   * <pre>.height(pv.Scale.linear().range(0, 480).by(function(d) d.score))</pre>
   *
   * This is equivalent to:
   *
   * <pre>.height(function(d) d.score * 480)</pre>
   *
   * This method should be used judiciously; it is typically more clear to
   * invoke the scale directly, passing in the value to be scaled.
   *
   * @function
   * @name pv.Scale.quantile.prototype.by
   * @param {function} f an accessor function.
   * @returns {pv.Scale.quantile} a view of this scale by the specified
   * accessor function.
   */
  
  pv.copyOwn(scale, pv.Scale.common);
  
  scale.domain.apply(scale, arguments);
  return scale;
};
/**
 * Returns a histogram operator for the specified data, with an optional
 * accessor function. If the data specified is not an array of numbers, an
 * accessor function must be specified to map the data to numeric values.
 *
 * @class Represents a histogram operator.
 *
 * @param {array} data an array of numbers or objects.
 * @param {function} [f] an optional accessor function.
 */
pv.histogram = function(data, f) {
  var frequency = true;
  return {

    /**
     * Returns the computed histogram bins. An optional array of numbers,
     * <tt>ticks</tt>, may be specified as the break points. If the ticks are
     * not specified, default ticks will be computed using a linear scale on the
     * data domain.
     *
     * <p>The returned array contains {@link pv.histogram.Bin}s. The <tt>x</tt>
     * attribute corresponds to the bin's start value (inclusive), while the
     * <tt>dx</tt> attribute stores the bin size (end - start). The <tt>y</tt>
     * attribute stores either the frequency count or probability, depending on
     * how the histogram operator has been configured.
     *
     * <p>The {@link pv.histogram.Bin} objects are themselves arrays, containing
     * the data elements present in each bin, i.e., the elements in the
     * <tt>data</tt> array (prior to invoking the accessor function, if any).
     * For example, if the data represented countries, and the accessor function
     * returned the GDP of each country, the returned bins would be arrays of
     * countries (not GDPs).
     *
     * @function
     * @name pv.histogram.prototype.bins
     * @param {array} [ticks]
     * @returns {array}
     */ /** @private */
    bins: function(ticks) {
      var x = pv.map(data, f), bins = [];

      /* Initialize default ticks. */
      if (!arguments.length) ticks = pv.Scale.linear(x).ticks();

      /* Initialize the bins. */
      for (var i = 0; i < ticks.length - 1; i++) {
        var bin = bins[i] = [];
        bin.x = ticks[i];
        bin.dx = ticks[i + 1] - ticks[i];
        bin.y = 0;
      }

      /* Count the number of samples per bin. */
      for (var i = 0; i < x.length; i++) {
        var j = pv.search.index(ticks, x[i]) - 1,
            bin = bins[Math.max(0, Math.min(bins.length - 1, j))];
        bin.y++;
        bin.push(data[i]);
      }

      /* Convert frequencies to probabilities. */
      if (!frequency) for (var i = 0; i < bins.length; i++) {
        bins[i].y /= x.length;
      }

      return bins;
    },

    /**
     * Sets or gets whether this histogram operator returns frequencies or
     * probabilities.
     *
     * @function
     * @name pv.histogram.prototype.frequency
     * @param {boolean} [x]
     * @returns {pv.histogram} this.
     */ /** @private */
    frequency: function(x) {
      if (arguments.length) {
        frequency = Boolean(x);
        return this;
      }
      return frequency;
    }
  };
};

/**
 * @class Represents a bin returned by the {@link pv.histogram} operator. Bins
 * are themselves arrays containing the data elements present in the given bin
 * (prior to the accessor function being invoked to convert the data object to a
 * numeric value). These bin arrays have additional attributes with meta
 * information about the bin.
 *
 * @name pv.histogram.Bin
 * @extends array
 * @see pv.histogram
 */

/**
 * The start value of the bin's range.
 *
 * @type number
 * @name pv.histogram.Bin.prototype.x
 */

/**
 * The magnitude value of the bin's range; end - start.
 *
 * @type number
 * @name pv.histogram.Bin.prototype.dx
 */

/**
 * The frequency or probability of the bin, depending on how the histogram
 * operator was configured.
 *
 * @type number
 * @name pv.histogram.Bin.prototype.y
 */

(function(){

    pv.Shape = function(){};
    
    // -----------------
    
    var _k0 = {x: 1, y: 1};
    
    pv.Shape.dist2 = function(v, w, k) {
        k = k || _k0;
        
        var dx = v.x - w.x;
        var dy = v.y - w.y;
        var dx2 = dx*dx;
        var dy2 = dy*dy;
        
        return {
            cost:  dx2 + dy2,
            dist2: k.x * dx2 + k.y * dy2
        };
    };
    
    // Returns an angle between 0 and and 2*pi
    var pi    = Math.PI;
    var pi2   = 2 * pi;
    var atan2 = Math.atan2;
    
    pv.Shape.normalizeAngle = function(a){
        a = a % pi2;
        if(a < 0){
            a += pi2;
        }
        
        return a;
    };
    
    // 0 - 2*pi
    pv.Shape.atan2Norm = function(dy, dx){
        // between -pi and pi
        var a = atan2(dy, dx);
        if(a < 0){
            a += pi2;
        }
        
        return a;
    };
    
    // -----------------
    
    pv.Shape.prototype.hasArea = function(){
        return true;
    };
    
    // hasArea
    // apply
    // clone
    // intersectsRect
    // intersectLine (some)
    // containsPoint
    // points
    // edges
    // center
    // distance2
    // bbox (some)
    
}());
(function(){
    
    var dist2 = pv.Shape.dist2;
    var cos   = Math.cos;
    var sin   = Math.sin;
    var sqrt  = Math.sqrt;
    
    
    /**
     * Returns a {@link pv.Vector} for the specified <i>x</i> and <i>y</i>
     * coordinate. This is a convenience factory method, equivalent to <tt>new
     * pv.Vector(x, y)</tt>.
     *
     * @see pv.Vector
     * @param {number} x the <i>x</i> coordinate.
     * @param {number} y the <i>y</i> coordinate.
     * @returns {pv.Vector} a vector for the specified coordinates.
     */
    pv.vector = function(x, y) {
      return new Point(x, y);
    };
    
    /**
     * Constructs a {@link pv.Vector} for the specified <i>x</i> and <i>y</i>
     * coordinate. This constructor should not be invoked directly; use
     * {@link pv.vector} instead.
     *
     * @class Represents a two-dimensional vector; a 2-tuple <i>&#x27e8;x,
     * y&#x27e9;</i>. The intent of this class is to simplify vector math. Note that
     * in performance-sensitive cases it may be more efficient to represent 2D
     * vectors as simple objects with <tt>x</tt> and <tt>y</tt> attributes, rather
     * than using instances of this class.
     *
     * @param {number} x the <i>x</i> coordinate.
     * @param {number} y the <i>y</i> coordinate.
     */
    pv.Vector = function(x, y) {
      this.x = x;
      this.y = y;
    };
    
    var Point = pv.Shape.Point = pv.Vector;
    
    pv.Vector.prototype = pv.extend(pv.Shape);
    
    /**
     * Returns a vector perpendicular to this vector: <i>&#x27e8;-y, x&#x27e9;</i>.
     *
     * @returns {pv.Vector} a perpendicular vector.
     */
    pv.Vector.prototype.perp = function() {
      return new Point(-this.y, this.x);
    };
    
    /**
     * Returns a vector which is the result of rotating this vector by the specified angle.
     * 
     * @returns {pv.Vector} a rotated vector.
     */
    pv.Vector.prototype.rotate = function(angle) {
        var c = cos(angle);
        var s = sin(angle);
        
        return new Point(c*this.x -s*this.y, s*this.x + c*this.y);
    };
    
    /**
     * Returns a normalized copy of this vector: a vector with the same direction,
     * but unit length. If this vector has zero length this method returns a copy of
     * this vector.
     *
     * @returns {pv.Vector} a unit vector.
     */
    pv.Vector.prototype.norm = function() {
      var l = this.length();
      return this.times(l ? (1 / l) : 1);
    };
    
    /**
     * Returns the magnitude of this vector, defined as <i>sqrt(x * x + y * y)</i>.
     *
     * @returns {number} a length.
     */
    pv.Vector.prototype.length = function() {
      return sqrt(this.x * this.x + this.y * this.y);
    };
    
    /**
     * Returns a scaled copy of this vector: <i>&#x27e8;x * k, y * k&#x27e9;</i>.
     * To perform the equivalent divide operation, use <i>1 / k</i>.
     *
     * @param {number} k the scale factor.
     * @returns {pv.Vector} a scaled vector.
     */
    pv.Vector.prototype.times = function(k) {
      return new Point(this.x * k, this.y * k);
    };
    
    /**
     * Returns this vector plus the vector <i>v</i>: <i>&#x27e8;x + v.x, y +
     * v.y&#x27e9;</i>. If only one argument is specified, it is interpreted as the
     * vector <i>v</i>.
     *
     * @param {number} x the <i>x</i> coordinate to add.
     * @param {number} y the <i>y</i> coordinate to add.
     * @returns {pv.Vector} a new vector.
     */
    pv.Vector.prototype.plus = function(x, y) {
      return (arguments.length == 1)
          ? new Point(this.x + x.x, this.y + x.y)
          : new Point(this.x + x, this.y + y);
    };
    
    /**
     * Returns this vector minus the vector <i>v</i>: <i>&#x27e8;x - v.x, y -
     * v.y&#x27e9;</i>. If only one argument is specified, it is interpreted as the
     * vector <i>v</i>.
     *
     * @param {number} x the <i>x</i> coordinate to subtract.
     * @param {number} y the <i>y</i> coordinate to subtract.
     * @returns {pv.Vector} a new vector.
     */
    pv.Vector.prototype.minus = function(x, y) {
      return (arguments.length == 1)
          ? new Point(this.x - x.x, this.y - x.y)
          : new Point(this.x - x, this.y - y);
    };
    
    /**
     * Returns the dot product of this vector and the vector <i>v</i>: <i>x * v.x +
     * y * v.y</i>. If only one argument is specified, it is interpreted as the
     * vector <i>v</i>.
     *
     * @param {number} x the <i>x</i> coordinate to dot.
     * @param {number} y the <i>y</i> coordinate to dot.
     * @returns {number} a dot product.
     */
    pv.Vector.prototype.dot = function(x, y) {
      return (arguments.length == 1)
          ? this.x * x.x + this.y * x.y
          : this.x * x + this.y * y;
    };
    
    pv.Vector.prototype.hasArea = function(){
        return false;
    };
    
    pv.Vector.prototype.clone = function(){
        return new Point(this.x, this.y);
    };
    
    pv.Vector.prototype.apply = function(t){
        return new Point(t.x + (t.k * this.x), t.y + (t.k * this.y));
    };
    
    pv.Vector.prototype.intersectsRect = function(rect){
        // Does rect contain the point
        return (this.x >= rect.x) && (this.x <= rect.x2) &&
               (this.y >= rect.y) && (this.y <= rect.y2);
    };
    
    pv.Vector.prototype.containsPoint = function(p){
        return (this.x === p.x) && (this.y === p.y);
    };
    
    pv.Vector.prototype.points = function(){
        return [this];
    };
    
    pv.Vector.prototype.edges = function(){
        return [];
    };
    
    pv.Vector.prototype.center = function(){
        return this;
    };
    
    pv.Vector.prototype.distance2 = function(p, k){
        return dist2(this, p, k);
    };
}());

(function(){
    var Point = pv.Shape.Point;
    var dist2 = pv.Shape.dist2;
    
    // -----------------
    
    pv.Shape.Line = function(x, y, x2, y2){
        this.x  = x  || 0;
        this.y  = y  || 0;
        this.x2 = x2 || 0;
        this.y2 = y2 || 0;
    };
    
    var Line = pv.Shape.Line;
    
    Line.prototype = pv.extend(pv.Shape);
    
    Line.prototype.hasArea = function(){
        return false;
    };
    
    Line.prototype.clone = function(){
        return new Line(this.x, this.y, this.x2, this.x2);
    };
    
    Line.prototype.apply = function(t){
        var x  = t.x + (t.k * this.x );
        var y  = t.y + (t.k * this.y );
        var x2 = t.x + (t.k * this.x2);
        var y2 = t.y + (t.k * this.y2);
        return new Line(x, y, x2, y2);
    };
    
    Line.prototype.points = function(){
        return [new Point(this.x, this.y), new Point(this.x2, this.y2)];
    };
    
    Line.prototype.edges = function(){
        return [this];
    };
    
    Line.prototype.center = function(){
        return new Point((this.x + this.x2)/2, (this.y + this.y2)/2);
    };
    
    Line.prototype.normal = function(at, shapeCenter){
        // Any point (at) laying on the line has the same normal 
        var points = this.points();
        var norm = points[1].minus(points[0]).perp().norm();
        
        // If shapeCenter point is specified, 
        // return the norm direction that 
        // points to the outside of the shape
        if(shapeCenter){
            var outside = points[0].minus(shapeCenter);
            if(outside.dot(norm) < 0){
                // opposite directions
                norm = norm.times(-1);
            }
        }
        
        return norm;
    };
    
    Line.prototype.intersectsRect = function(rect){
        var i, L;
        var points = this.points();
        L = points.length;
        for(i = 0 ; i < L ; i++){
            if(points[i].intersectsRect(rect)){
                return true;
            }
        }
        
        var edges = rect.edges();
        L = edges.length;
        for(i = 0 ; i < L ; i++){
            if(this.intersectsLine(edges[i])){
                return true;
            }
        }
    
        return false;
    };
    
    Line.prototype.containsPoint = function(p){
        var x  = this.x ;
        var x2 = this.x2;
        var y  = this.y ;
        var y2 = this.y2;
        return x <= p.x && p.x <= x2 &&
               ((x === x2) ? 
                (Math.min(y, y2) <= p.y && p.y <= Math.max(y, y2)) :
                (Math.abs((y2-y)/(x2-x) * (p.x-x) + y - p.y) <= 1e-10));
    };
    
    Line.prototype.intersectsLine = function(b){
        // See: http://local.wasp.uwa.edu.au/~pbourke/geometry/lineline2d/
        var a = this,
    
            x21 = a.x2 - a.x,
            y21 = a.y2 - a.y,
    
            x43 = b.x2 - b.x,
            y43 = b.y2 - b.y,
    
            denom = y43 * x21 - x43 * y21;
    
        if(denom === 0){
            // Parallel lines: no intersection
            return false;
        }
    
        var y13 = a.y - b.y,
            x13 = a.x - b.x,
            numa = (x43 * y13 - y43 * x13),
            numb = (x21 * y13 - y21 * x13);
    
        if(denom === 0){
            // Both 0  => coincident
            // Only denom 0 => parallel, but not coincident
            return (numa === 0) && (numb === 0);
        }
    
        var ua = numa / denom;
        if(ua < 0 || ua > 1){
            // Intersection not within segment a
            return false;
        }
    
        var ub = numb / denom;
        if(ub < 0 || ub > 1){
            // Intersection not within segment b
            return false;
        }
    
        return true;
    };
    
    // Adapted from http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment (commenter Grumdrig)
    // Return minimum distance (squared) between the point p and the line segment
    // k: cost vector
    Line.prototype.distance2 = function(p, k){
        var v = this;
        var w = {x: this.x2, y: this.y2};
        
        var l2 = dist2(v, w).dist2;
        if (l2 <= 1e-10) {
            // v == w case
            return dist2(p, v, k);
        }
      
        // Consider the line extending the segment, parameterized as v + t (w - v).
        // We find projection of point p onto the line. 
        // It falls where t = [(p-v) . (w-v)] / |w-v|^2
        var wvx = w.x - v.x;
        var wvy = w.y - v.y;
        
        var t = ((p.x - v.x) * wvx + (p.y - v.y) * wvy) / l2;
        
        if (t < 0) { return dist2(p, v, k); } // lies before v, so return the distance between v and p
        
        if (t > 1) { return dist2(p, w, k); } // lies after  w, so return the distance between w and p
        
        var proj = {x: v.x + t * wvx, y: v.y + t * wvy};
        
        return dist2(p, proj, k);
    };
    
}());

(function(){
    
    var Point = pv.Shape.Point;
    var Line = pv.Shape.Line;
    
    pv.Shape.Polygon = function(points){
        this._points = points || [];
    };
    
    var Polygon = pv.Shape.Polygon;
    
    Polygon.prototype = pv.extend(pv.Shape);
    
    Polygon.prototype.points = function(){
        return this._points;
    };
        
    Polygon.prototype.clone = function(){
        return new Polygon(this.points().slice());
    };
    
    Polygon.prototype.apply = function(t){
        var points = this.points();
        var L = points.length;
        var points2 = new Array(L);
        
        for(var i = 0 ; i < L ; i++){
            points2[i] = points[i].apply(t);
        }
        
        return new Polygon(points2);
    };

    Polygon.prototype.intersectsRect = function(rect){
        // I - Any point is inside the rect?
        var i, L;
        var points = this.points();
        
        L = points.length;
        for(i = 0 ; i < L ; i++){
            if(points[i].intersectsRect(rect)){
                return true;
            }
        }
        
        // II - Any side intersects the rect?
        var edges = this.edges();
        L = edges.length;
        for(i = 0 ; i < L ; i++){
            if(edges[i].intersectsRect(rect)){
                return true;
            }
        }
        
        return false;
    };
    
    Polygon.prototype.edges = function(){
        var edges = this._edges;
        if(!edges){
            edges = this._edges = [];
            
            var points = this.points();
            var L = points.length;
            if(L){
                var prevPoint  = points[0];
                var firstPoint = prevPoint;
                
                var point;
                for(var i = 1 ; i < L ; i++){
                    point = points[i];
                    
                    edges.push(new Line(prevPoint.x, prevPoint.y,  point.x, point.y));
                    
                    prevPoint = point;
                }
                
                if(L > 2){
                    // point will have the last point
                    edges.push(new Line(point.x, point.y,  firstPoint.x, firstPoint.y));
                }
            }
        }
    
        return edges;
    };
    
    Polygon.prototype.distance2 = function(p, k){
        var min = {cost: Infinity, dist2: Infinity}; //dist2(p, this.center(), k);
        
        this.edges().forEach(function(edge){
            var d = edge.distance2(p, k);
            if(d.cost < min.cost){
                min = d;
            }
        }, this);
        
        return min;
    };
    
    Polygon.prototype.center = function(){
        var points = this.points();
        var x = 0;
        var y = 0;
        for(var i = 0, L = points.length ; i < L ; i++){
            var p = points[i];
            x += p.x;
            y += p.y;
        }
        
        return new Point(x / L, y / L);
    };
    
    // Adapted from http://stackoverflow.com/questions/217578/point-in-polygon-aka-hit-test (author Mecki)
    Polygon.prototype.containsPoint = function(p){
        var bbox = this.bbox();
        if(!bbox.containsPoint(p)){
            return false;
        }
        
        // "e" ensures the ray starts outside the polygon
        var e = bbox.dx * 0.01;
        var ray = new Line(bbox.x - e, p.y, p.x, p.y);
        
        var intersectCount = 0;
        var edges = this.edges();
        edges.forEach(function(edge){
            if(edge.intersectsLine(ray)){
                intersectCount++;
            }
        });
        
        // Inside if odd number of intersections
        return (intersectCount & 1) === 1;
    };
    
    Polygon.prototype.bbox = function(){
        var bbox = this._bbox;
        if(!bbox){
            var min, max;
            
            this
            .points()
            .forEach(function(point, index){
                if(min == null){
                    min = {x: point.x, y: point.y};
                } else {
                    if(point.x < min.x){
                        min.x = point.x;
                    }
                    
                    if(point.y < min.y){
                        min.y = point.y;
                    }
                }
                
                if(max == null){
                    max = {x: point.x, y: point.y};
                } else {
                    if(point.x > max.x){
                        max.x = point.x;
                    }
                    
                    if(point.y > max.y){
                        max.y = point.y;
                    }
                }
            });
            
            if(min){
                bbox = this._bbox = new pv.Shape.Rect(min.x, min.y, max.x - min.x, max.y - min.y);
            }
        }
        
        return bbox;
    };    
    
}());

(function(){
    
    var Point = pv.Shape.Point;
    var Line  = pv.Shape.Line;
    
    pv.Shape.Rect = function(x, y, dx, dy){
        this.x  =  x || 0;
        this.y  =  y || 0;
        this.dx = dx || 0;
        this.dy = dy || 0;
        
        // Ensure normalized
        if(this.dx < 0){
            this.dx = -this.dx;
            this.x  = this.x - this.dx;
        }
        
        if(this.dy < 0){
            this.dy = -this.dy;
            this.y = this.y - this.dy;
        }
        
        this.x2  = this.x + this.dx;
        this.y2  = this.y + this.dy;
    };
    
    var Rect = pv.Shape.Rect;
    
    Rect.prototype = pv.extend(pv.Shape.Polygon);
    
    Rect.prototype.clone = function(){
        var r2 = Object.create(Rect.prototype);
        r2.x  = this.x;
        r2.y  = this.y;
        r2.dx = this.dx;
        r2.dy = this.dy;
        r2.x2 = this.x2;
        r2.y2 = this.y2;
        
        return r2;
    };
    
    Rect.prototype.apply = function(t){
        var x  = t.x + (t.k * this.x);
        var y  = t.y + (t.k * this.y);
        var dx = t.k * this.dx;
        var dy = t.k * this.dy;
        return new Rect(x, y, dx, dy);
    };
    
    Rect.prototype.containsPoint = function(p){
        return this.x <= p.x && p.x <= this.x2 && 
               this.y <= p.y && p.y <= this.y2;
    };
    
    Rect.prototype.intersectsRect = function(rect){
        return (this.x2 > rect.x ) &&  // Some intersection on X
               (this.x  < rect.x2) &&
               (this.y2 > rect.y ) &&  // Some intersection on Y
               (this.y  < rect.y2);
    };
    
    Rect.prototype.edges = function(){
        if(!this._edges){
            var x  = this.x,
                y  = this.y,
                x2 = this.x2,
                y2 = this.y2;
    
            this._edges = [
                new Line(x,  y,  x2, y),
                new Line(x2, y,  x2, y2),
                new Line(x2, y2, x,  y2),
                new Line(x,  y2, x,  y)
            ];
        }
    
        return this._edges;
    };
    
    Rect.prototype.center = function(){
        return new Point(this.x + this.dx/2, this.y + this.dy/2);
    };
    
    Rect.prototype.points = function(){
        var points = this._points;
        if(!points){
            var x  = this.x,
                y  = this.y,
                x2 = this.x2,
                y2 = this.y2;
            
            points = this._points = [
                new Point(x,  y ),
                new Point(x2, y ),
                new Point(x2, y2),
                new Point(x,  y2)
            ];
        }
        
        return points;
    };
    
    Rect.prototype.bbox = function(){
        return this.clone();
    };
    
}());(function(){
    var Point = pv.Shape.Point;
    var dist2 = pv.Shape.dist2;
    var sqrt = Math.sqrt;
    var abs  = Math.abs;
    var pow  = Math.pow;
    
    pv.Shape.Circle = function(x, y, radius){
        this.x = x || 0;
        this.y = y || 0;
        this.radius = radius || 0;
    };
    
    var Circle = pv.Shape.Circle;
    
    Circle.prototype = pv.extend(pv.Shape);
    
    Circle.prototype.clone = function(){
        return new Circle(this.x, this.y, this.radius);
    };
    
    Circle.prototype.apply = function(t){
        var x  = t.x + (t.k * this.x);
        var y  = t.y + (t.k * this.y);
        var r  = t.k * this.radius;
        return new Circle(x, y, r);
    };
    
    // Adapted from http://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection
    Circle.prototype.intersectsRect = function(rect){
        var dx2 = rect.dx / 2,
            dy2 = rect.dy / 2,
            r   = this.radius;
    
        var circleDistX = abs(this.x - rect.x - dx2),
            circleDistY = abs(this.y - rect.y - dy2);
    
        if ((circleDistX > dx2 + r) ||
            (circleDistY > dy2 + r)) {
            return false;
        }
    
        if (circleDistX <= dx2 || circleDistY <= dy2) {
            return true;
        }
        
        var sqCornerDistance = pow(circleDistX - dx2, 2) +
                               pow(circleDistY - dy2, 2);
    
        return sqCornerDistance <= r * r;
    };
    
    // Adapted from http://stackoverflow.com/questions/13053061/circle-line-intersection-points (author arne.b)
    Circle.prototype.intersectLine = function(line, isInfiniteLine) {
        // Line: A -> B 
        var baX = line.x2 - line.x;
        var baY = line.y2 - line.y;
        
        var caX = this.x - line.x;
        var caY = this.y - line.y;

        var ba2  = baX * baX + baY * baY; // square norm of ba
        var bBy2 = baX * caX + baY * caY; // dot product of ba and ca
        var r    = this.radius;
        var c    = caX * caX + caY * caY - r * r;

        var pBy2 = bBy2 / ba2;

        var disc = pBy2 * pBy2 - c / ba2;
        if (disc < 0) {
            return; // no intersection
        }
        
        // if disc == 0 ... dealt with later
        var discSqrt = sqrt(disc);
        var t1 = pBy2 - discSqrt;
        var t2 = pBy2 + discSqrt;
        
        // t1 < 0 || t1 > 1 => p1 off the segment 
        
        var ps = [];
        if(isInfiniteLine || (t1 >= 0 && t1 <= 1)){
            ps.push(new Point(line.x + baX * t1, line.y + baY * t1));
        }
        
        if (disc !== 0) { // t1 != t2
            if(isInfiniteLine || (t2 >= 0 && t2 <= 1)){
                ps.push(new Point(line.x + baX * t2, line.y + baY * t2));
            }
        }
        
        return ps;
    };
    
    Circle.prototype.points = function(){
        return [this.center()];
    };
    
    Circle.prototype.center = function(){
        return new Point(this.x, this.y);
    };
    
    Circle.prototype.normal = function(at){
        return at.minus(this.x, this.y).norm();
    };
    
    Circle.prototype.containsPoint = function(p){
        var dx = p.x - this.x,
            dy = p.y - this.y,
            r  = this.radius;
        
        return dx * dx + dy * dy <= r * r; 
    };
    
    // Distance (squared) to the border of the circle (inside or not)
    // //or to the center of the circle, whichever is smaller
    Circle.prototype.distance2 = function(p, k){
        var dx = p.x - this.x,
            dy = p.y - this.y,
            r  = this.radius;
        
        //var dCenter = dist2(p, this, k);
        
        // The point at the Border of the circle, in the direction from c to p
        var b = p.minus(this).norm().times(r).plus(this);
        
        var dBorder = dist2(p, b, k);
        
        return /*dCenter.cost < dBorder.cost ? dCenter : */dBorder; 
    };

}());
(function(){
    
    var Point = pv.Shape.Point;
    var dist2 = pv.Shape.dist2;
    var normalizeAngle = pv.Shape.normalizeAngle;
    var atan2Norm = pv.Shape.atan2Norm;
    
    var cos   = Math.cos;
    var sin   = Math.sin;
    var sqrt  = Math.sqrt;
    
    pv.Shape.Arc = function(x, y, radius, startAngle, angleSpan){
        this.x = x;
        this.y = y;
        this.radius = radius;
        
        this.startAngle = normalizeAngle(startAngle);
        this.angleSpan  = normalizeAngle(angleSpan); // always positive...
        this.endAngle   = this.startAngle + this.angleSpan; // may be > 2*pi
    };
    
    var Arc = pv.Shape.Arc;
    
    Arc.prototype = pv.extend(pv.Shape);
    
    Arc.prototype.hasArea = function(){
        return false;
    };
    
    Arc.prototype.clone = function(){
        var arc = Object.create(Arc.prototype);
        var me = this;
        arc.x = me.x;
        arc.y = me.y;
        arc.radius = me.radius;
        arc.startAngle = me.startAngle;
        arc.angleSpan = me.angleSpan;
        arc.endAngle = me.endAngle;
        return arc;
    };
    
    Arc.prototype.apply = function(t){
        var x   = t.x + (t.k * this.x);
        var y   = t.y + (t.k * this.y);
        var r   = t.k * this.radius;
        return new Arc(x, y, r, this.startAngle, this.angleSpan);
    };
    
    Arc.prototype.containsPoint = function(p){
        var dx = p.x - this.x;
        var dy = p.y - this.y;
        var r  = sqrt(dx*dx + dy*dy);
        
        if(Math.abs(r - this.radius) <= 1e-10){
            var a  = atan2Norm(dy, dx);
            return this.startAngle <= a && a <= this.endAngle;
        }
        
        return false;
    };
    
    Arc.prototype.intersectsRect = function(rect) {
        var i, L;
        
        // I - Any endpoint is inside the rect?
        var points = this.points();
        var L = points.length;
        for(i = 0 ; i < L ; i++){
            if(points[i].intersectsRect(rect)){
                return true;
            }
        }
        
        // II - Any rect edge intersects the arc?
        var edges = rect.edges();
        L = edges.length;
        for(i = 0 ; i < L ; i++){
            if(this.intersectLine(edges[i])){
                return true;
            }
        }
        
        return false;
    };
    
    var circleIntersectLine = pv.Shape.Circle.prototype.intersectLine;
    
    Arc.prototype.intersectLine = function(line, isInfiniteLine) {
        var ps = circleIntersectLine.call(this, line, isInfiniteLine);
        if(ps){
            // Filter ps belonging to the arc
            ps = ps.filter(function(p){ return this.containsPoint(p); }, this);
            if(ps.length){
                return ps;
            }
        }
    };
    
    Arc.prototype.points = function(){
        var x  = this.x;
        var y  = this.y;
        var r  = this.radius;
        var ai = this.startAngle;
        var af = this.endAngle;
        
        return [
            new Point(x + r * cos(ai), y + r * sin(ai)),
            new Point(x + r * cos(af), y + r * sin(af))
        ];
    };
    
    Arc.prototype.center = function(){
        var x  = this.x;
        var y  = this.y;
        var r  = this.radius;
        var am = (this.startAngle + this.endAngle) / 2;
        
        return new Point(x + r * cos(am), y + r * sin(am));
    };
    
    Arc.prototype.normal = function(at, shapeCenter){
        var norm = at.minus(this.x, this.y).norm();
        
        // If shapeCenter point is specified, 
        // return the norm direction that 
        // points to the outside of the shape
        if(shapeCenter){
            var outside = this.center().minus(shapeCenter);
            if(outside.dot(norm) < 0){
                // opposite directions
                norm = norm.times(-1);
            }
        }
        
        return norm;
    };
    
    // Distance (squared) to the border of the Arc (inside or not)
    Arc.prototype.distance2 = function(p, k){
        var dx = p.x - this.x;
        var dy = p.y - this.y;
        var a  = atan2Norm(dy, dx); // between 0 and 2*pi
        
        if(this.startAngle <= a && a <= this.endAngle){
            // Within angle span
            
            // The point at the Border of the circle, in the direction from c to p
            var b = new Point(
                    this.x + this.radius * cos(a),
                    this.y + this.radius * sin(a));
            
            return dist2(p, b, k);
        }
        
        // Smallest distance to one of the two end points
        var points = this.points();
        var d1 = dist2(p, points[0], k);
        var d2 = dist2(p, points[1], k);
        return d1.cost < d2.cost ? d1 : d2;
    };
   
}());
(function(){
    
    var Arc   = pv.Shape.Arc;
    var Line  = pv.Shape.Line;
    var Point = pv.Shape.Point;
    
    var cos   = Math.cos;
    var sin   = Math.sin;
    var sqrt  = Math.sqrt;
    var atan2Norm = pv.Shape.atan2Norm;
    var normalizeAngle = pv.Shape.normalizeAngle;
    
    pv.Shape.Wedge = function(x, y, innerRadius, outerRadius, startAngle, angleSpan){
        this.x = x;
        this.y = y;
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        
        this.startAngle = normalizeAngle(startAngle);
        this.angleSpan  = normalizeAngle(angleSpan); // always positive...
        this.endAngle   = this.startAngle + this.angleSpan; // may be > 2*pi
    };
    
    var Wedge = pv.Shape.Wedge;
    
    Wedge.prototype = pv.extend(pv.Shape);
    
    Wedge.prototype.clone = function(){
        return new Wedge(
                this.x, this.y, this.innerRadius, 
                this.outerRadius, this.startAngle, this.angleSpan);
    };
    
    Wedge.prototype.apply = function(t){
        var x   = t.x + (t.k * this.x);
        var y   = t.y + (t.k * this.y);
        var ir  = t.k * this.innerRadius;
        var or  = t.k * this.outerRadius;
        return new Wedge(x, y, ir, or, this.startAngle, this.angleSpan);
    };
    
    Wedge.prototype.containsPoint = function(p){
        var dx = p.x - this.x;
        var dy = p.y - this.y ;
        var r  = sqrt(dx*dx + dy*dy);
        if(r >= this.innerRadius &&  r <= this.outerRadius){
            var a  = atan2Norm(dy, dx); // between -pi and pi -> 0 - 2*pi
            return this.startAngle <= a && a <= this.endAngle;
        }
        
        return false;
    };
    
    Wedge.prototype.intersectsRect = function(rect){
        var i, L;
        
        // I - Any point of the wedge is inside the rect?
        var points = this.points();
        
        L = points.length;
        for(i = 0 ; i < L ; i++){
            if(points[i].intersectsRect(rect)){
                return true;
            }
        }
        
        // II - Any point of the rect inside the wedge?
        points = rect.points();
        L = points.length;
        for(i = 0 ; i < L ; i++){
            if(this.containsPoint(points[i])){
                return true;
            }
        }
        
        // III - Any edge intersects the rect?
        var edges = this.edges();
        L = edges.length;
        for(i = 0 ; i < L ; i++){
            if(edges[i].intersectsRect(rect)){
                return true;
            }
        }
        
        return false;
    };
    
    Wedge.prototype.points = function(){
        if(!this._points){
            this.edges();
        }
        
        return this._points;
    };
    
    Wedge.prototype.edges = function(){
        var edges = this._edges;
        if(!edges){
            var x  = this.x;
            var y  = this.y;
            var ir = this.innerRadius;
            var or = this.outerRadius;
            var ai = this.startAngle;
            var af = this.endAngle;
            var aa = this.angleSpan;
            var cai = cos(ai);
            var sai = sin(ai);
            var caf = cos(af);
            var saf = sin(af);
            
            var pii, pfi;
            if(ir > 0){
                pii = new Point(x + ir * cai, y + ir * sai);
                pfi = new Point(x + ir * caf, y + ir * saf);
            } else {
                pii = pfi = new Point(x, y);
            }
            
            var pio = new Point(x + or * cai, y + or * sai);
            var pfo = new Point(x + or * caf, y + or * saf);
            
            edges = this._edges = [];
            
            if(ir > 0){
               edges.push(new Arc(x, y, ir, ai, aa));
            }
            
            edges.push(
                new Line(pii.x, pii.y, pio.x, pio.y),
                new Arc(x, y, or, ai, aa),
                new Line(pfi.x, pfi.y, pfo.x, pfo.y));
            
            var points = this._points = [pii, pio, pfo];
            if(ir > 0){
                points.push(pfi);
            }
        }
        
        return edges;
    };
    
    // Distance (squared) to the border of the Wedge,
    // // or to its center, whichever is smaller.
    Wedge.prototype.distance2 = function(p, k){
        var min = {cost: Infinity, dist2: Infinity}; //dist2(p, this.center(), k);
        
        this.edges().forEach(function(edge){
            var d = edge.distance2(p, k);
            if(d.cost < min.cost){
                min = d;
            }
        });
        
        return min;
    };
    
    Wedge.prototype.center = function(){
        var midAngle  = (this.startAngle  + this.endAngle)/2;
        var midRadius = (this.innerRadius + this.outerRadius)/2;
        return new Point(
                this.x + midRadius * cos(midAngle), 
                this.y + midRadius * sin(midAngle));
    };
}());
/**
 * Returns the {@link pv.Color} for the specified color format string. Colors
 * may have an associated opacity, or alpha channel. Color formats are specified
 * by CSS Color Modular Level 3, using either in RGB or HSL color space. For
 * example:<ul>
 *
 * <li>#f00 // #rgb
 * <li>#ff0000 // #rrggbb
 * <li>rgb(255, 0, 0)
 * <li>rgb(100%, 0%, 0%)
 * <li>hsl(0, 100%, 50%)
 * <li>rgba(0, 0, 255, 0.5)
 * <li>hsla(120, 100%, 50%, 1)
 *
 * </ul>The SVG 1.0 color keywords names are also supported, such as "aliceblue"
 * and "yellowgreen". The "transparent" keyword is supported for fully-
 * transparent black.
 *
 * <p>If the <tt>format</tt> argument is already an instance of <tt>Color</tt>,
 * the argument is returned with no further processing.
 *
 * @param {string} format the color specification string, such as "#f00".
 * @returns {pv.Color} the corresponding <tt>Color</tt>.
 * @see <a href="http://www.w3.org/TR/SVG/types.html#ColorKeywords">SVG color
 * keywords</a>
 * @see <a href="http://www.w3.org/TR/css3-color/">CSS3 color module</a>
 */
(function() {

    var round = Math.round;
    
    var parseRgb = function(c) { // either integer or percentage
        var f = parseFloat(c);
        return (c[c.length - 1] == '%') ? round(f * 2.55) : f;
    };
    
    var reSysColor = /([a-z]+)\((.*)\)/i;
    
    var createColor = function(format) {
        /* Hexadecimal colors: #rgb and #rrggbb. */
        if (format.charAt(0) === "#") {
          var r, g, b;
          if (format.length === 4) {
            r = format.charAt(1); r += r;
            g = format.charAt(2); g += g;
            b = format.charAt(3); b += b;
          } else if (format.length === 7) {
            r = format.substring(1, 3);
            g = format.substring(3, 5);
            b = format.substring(5, 7);
          }
          
          return pv.rgb(parseInt(r, 16), parseInt(g, 16), parseInt(b, 16), 1);
        }
        
        /* Handle hsl, rgb. */
        var m1 = reSysColor.exec(format);
        if (m1) {
          var m2 = m1[2].split(","), 
              a = 1;
          
          switch (m1[1]) {
            case "hsla":
            case "rgba": {
              a = parseFloat(m2[3]);
              if (!a) return pv.Color.transparent;
              break;
            }
          }
          
          switch (m1[1]) {
            case "hsla":
            case "hsl": {
              var h = parseFloat(m2[0]), // degrees
                  s = parseFloat(m2[1]) / 100, // percentage
                  l = parseFloat(m2[2]) / 100; // percentage
              return (new pv.Color.Hsl(h, s, l, a)).rgb();
            }
            
            case "rgba":
            case "rgb": {
              var r = parseRgb(m2[0]), 
                  g = parseRgb(m2[1]), 
                  b = parseRgb(m2[2]);
              return pv.rgb(r, g, b, a);
            }
          }
        }
      
        /* Otherwise, pass-through unsupported colors. */
        return new pv.Color(format, 1);
    };
    
    var colorsByFormat = {}; // TODO: unbounded cache 
    
    pv.color = function(format) {
      if (format.rgb) { return format.rgb(); }
      
      /* Named colors. */
      var color = pv.Color.names[format];
      if (!color) {
          color = colorsByFormat[format] ||
                  (colorsByFormat[format] = createColor(format));
      }
      
      return color;
    };
}());

/**
 * Constructs a color with the specified color format string and opacity. This
 * constructor should not be invoked directly; use {@link pv.color} instead.
 *
 * @class Represents an abstract (possibly translucent) color. The color is
 * divided into two parts: the <tt>color</tt> attribute, an opaque color format
 * string, and the <tt>opacity</tt> attribute, a float in [0, 1]. The color
 * space is dependent on the implementing class; all colors support the
 * {@link #rgb} method to convert to RGB color space for interpolation.
 *
 * <p>See also the <a href="../../api/Color.html">Color guide</a>.
 *
 * @param {string} color an opaque color format string, such as "#f00".
 * @param {number} opacity the opacity, in [0,1].
 * @see pv.color
 */
pv.Color = function(color, opacity) {
  /**
   * An opaque color format string, such as "#f00".
   *
   * @type string
   * @see <a href="http://www.w3.org/TR/SVG/types.html#ColorKeywords">SVG color
   * keywords</a>
   * @see <a href="http://www.w3.org/TR/css3-color/">CSS3 color module</a>
   */
  this.color = color;

  /**
   * The opacity, a float in [0, 1].
   *
   * @type number
   */
  this.opacity = opacity;
  
  this.key = "solid " + color + " alpha(" + opacity + ")";
};

/**
 * Returns an equivalent color in the HSL color space.
 * 
 * @returns {pv.Color.Hsl} an HSL color.
 */
pv.Color.prototype.hsl = function() { 
    return this.rgb().hsl(); 
};

/**
 * Returns a new color that is a brighter version of this color. The behavior of
 * this method may vary slightly depending on the underlying color space.
 * Although brighter and darker are inverse operations, the results of a series
 * of invocations of these two methods might be inconsistent because of rounding
 * errors.
 *
 * @param [k] {number} an optional scale factor; defaults to 1.
 * @see #darker
 * @returns {pv.Color} a brighter color.
 */
pv.Color.prototype.brighter = function(k) {
  return this.rgb().brighter(k);
};

/**
 * Returns a new color that is a brighter version of this color. The behavior of
 * this method may vary slightly depending on the underlying color space.
 * Although brighter and darker are inverse operations, the results of a series
 * of invocations of these two methods might be inconsistent because of rounding
 * errors.
 *
 * @param [k] {number} an optional scale factor; defaults to 1.
 * @see #brighter
 * @returns {pv.Color} a darker color.
 */
pv.Color.prototype.darker = function(k) {
  return this.rgb().darker(k);
};

/**
 * Blends a color with transparency with a given mate color.
 * Returns an RGB color.
 * 
 * @param {pv.Color} [mate='white'] the mate color. Defaults to 'white'. 
 */
pv.Color.prototype.alphaBlend = function(mate) {
  var rgb = this.rgb();
  var a = rgb.a;
  if(a === 1){ return this; }
    
  if(!mate){ mate = pv.Color.names.white; } else { mate = pv.color(mate); }
  
  mate = mate.rgb();
  
  var z = (1 - a);
  return pv.rgb(
          z * rgb.r + a * mate.r, 
          z * rgb.g + a * mate.g,
          z * rgb.b + a * mate.b,
          1);
};
  
/**
 * Returns the decimal number corresponding to the rgb hexadecimal representation.
 * 
 * If a mate color is provided it is used for blending the alpha channel of this color, if any.
 * 
 * @param {pv.Color} [mate='white'] the mate color. Defaults to 'white'.
 */
pv.Color.prototype.rgbDecimal = function(mate) {
  var rgb = this.alphaBlend(mate);
  return rgb.r << 16 | rgb.g << 8 | rgb.b;
};

/**
 * Determines if a color is in the "dark" category.
 * If this is a background color, you may then choose a color for text
 * that is in the "bright" category.
 * 
 * Adapted from {@link http://us2.php.net/manual/en/function.hexdec.php#74092}.
 */
pv.Color.prototype.isDark = function() {
  return this.rgbDecimal() < 0xffffff/2;
};

/**
 * Constructs a new RGB color with the specified channel values.
 *
 * @param {number} r the red channel, an integer in [0,255].
 * @param {number} g the green channel, an integer in [0,255].
 * @param {number} b the blue channel, an integer in [0,255].
 * @param {number} [a] the alpha channel, a float in [0,1].
 * @returns pv.Color.Rgb
 */
pv.rgb = function(r, g, b, a) {
  return new pv.Color.Rgb(r, g, b, (arguments.length == 4) ? a : 1);
};

/**
 * Constructs a new RGB color with the specified channel values.
 *
 * @class Represents a color in RGB space.
 *
 * @param {number} r the red channel, an integer in [0,255].
 * @param {number} g the green channel, an integer in [0,255].
 * @param {number} b the blue channel, an integer in [0,255].
 * @param {number} a the alpha channel, a float in [0,1].
 * @extends pv.Color
 */
pv.Color.Rgb = function(r, g, b, a) {
  pv.Color.call(this, a ? ("rgb(" + r + "," + g + "," + b + ")") : "none", a);

  /**
   * The red channel, an integer in [0, 255].
   *
   * @type number
   */
  this.r = r;

  /**
   * The green channel, an integer in [0, 255].
   *
   * @type number
   */
  this.g = g;

  /**
   * The blue channel, an integer in [0, 255].
   *
   * @type number
   */
  this.b = b;

  /**
   * The alpha channel, a float in [0, 1].
   *
   * @type number
   */
  this.a = a;
};
pv.Color.Rgb.prototype = pv.extend(pv.Color);

/**
 * Constructs a new RGB color with the same green, blue and alpha channels as
 * this color, with the specified red channel.
 *
 * @param {number} r the red channel, an integer in [0,255].
 */
pv.Color.Rgb.prototype.red = function(r) {
  return pv.rgb(r, this.g, this.b, this.a);
};

/**
 * Constructs a new RGB color with the same red, blue and alpha channels as this
 * color, with the specified green channel.
 *
 * @param {number} g the green channel, an integer in [0,255].
 */
pv.Color.Rgb.prototype.green = function(g) {
  return pv.rgb(this.r, g, this.b, this.a);
};

/**
 * Constructs a new RGB color with the same red, green and alpha channels as
 * this color, with the specified blue channel.
 *
 * @param {number} b the blue channel, an integer in [0,255].
 */
pv.Color.Rgb.prototype.blue = function(b) {
  return pv.rgb(this.r, this.g, b, this.a);
};

/**
 * Constructs a new RGB color with the same red, green and blue channels as this
 * color, with the specified alpha channel.
 *
 * @param {number} a the alpha channel, a float in [0,1].
 */
pv.Color.Rgb.prototype.alpha = function(a) {
  return pv.rgb(this.r, this.g, this.b, a);
};

/**
 * Returns the RGB color equivalent to this color. This method is abstract and
 * must be implemented by subclasses.
 *
 * @returns {pv.Color.Rgb} an RGB color.
 * @function
 * @name pv.Color.prototype.rgb
 */

/**
 * Returns this.
 *
 * @returns {pv.Color.Rgb} this.
 */
pv.Color.Rgb.prototype.rgb = function() { return this; };

/**
 * Returns a new color that is a brighter version of this color. This method
 * applies an arbitrary scale factor to each of the three RGB components of this
 * color to create a brighter version of this color. Although brighter and
 * darker are inverse operations, the results of a series of invocations of
 * these two methods might be inconsistent because of rounding errors.
 *
 * @param [k] {number} an optional scale factor; defaults to 1.
 * @see #darker
 * @returns {pv.Color.Rgb} a brighter color.
 */
pv.Color.Rgb.prototype.brighter = function(k) {
  k = Math.pow(0.7, k != null ? k : 1);
  var r = this.r, g = this.g, b = this.b, i = 30;
  if (!r && !g && !b) return pv.rgb(i, i, i, this.a);
  if (r && (r < i)) r = i;
  if (g && (g < i)) g = i;
  if (b && (b < i)) b = i;
  return pv.rgb(
      Math.min(255, Math.floor(r / k)),
      Math.min(255, Math.floor(g / k)),
      Math.min(255, Math.floor(b / k)),
      this.a);
};

/**
 * Returns a new color that is a darker version of this color. This method
 * applies an arbitrary scale factor to each of the three RGB components of this
 * color to create a darker version of this color. Although brighter and darker
 * are inverse operations, the results of a series of invocations of these two
 * methods might be inconsistent because of rounding errors.
 *
 * @param [k] {number} an optional scale factor; defaults to 1.
 * @see #brighter
 * @returns {pv.Color.Rgb} a darker color.
 */
pv.Color.Rgb.prototype.darker = function(k) {
  k = Math.pow(0.7, k != null ? k : 1);
  return pv.rgb(
      Math.max(0, Math.floor(k * this.r)),
      Math.max(0, Math.floor(k * this.g)),
      Math.max(0, Math.floor(k * this.b)),
      this.a);
};

/**
 * Converts an RGB color value to HSL. 
 * Conversion formula adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * 
 * (Adapted from http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript)
 * 
 * @returns pv.Color.Hsl
 */
pv.Color.Rgb.prototype.hsl = function(){
    var r = this.r / 255;
    var g = this.g / 255;
    var b = this.b / 255;
    
    var max = Math.max(r, g, b); 
    var min = Math.min(r, g, b);
    
    var l = (max + min) / 2;
    var h, s;

    if(max === min){
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        
        h /= 6;
    }

    return pv.hsl(h * 360, s, l, this.a);
};

/**
 * Constructs a new RGB color which is the complementary color of this color.
 */
pv.Color.Rgb.prototype.complementary = function() {
  return this.hsl().complementary().rgb();
};


/**
 * Constructs a new HSL color with the specified values.
 *
 * @param {number} h the hue, an integer in [0, 360].
 * @param {number} s the saturation, a float in [0, 1].
 * @param {number} l the lightness, a float in [0, 1].
 * @param {number} [a] the opacity, a float in [0, 1].
 * @returns pv.Color.Hsl
 */
pv.hsl = function(h, s, l, a) {
  return new pv.Color.Hsl(h, s, l,  (arguments.length == 4) ? a : 1);
};

/**
 * Constructs a new HSL color with the specified values.
 *
 * @class Represents a color in HSL space.
 *
 * @param {number} h the hue, an integer in [0, 360].
 * @param {number} s the saturation, a float in [0, 1].
 * @param {number} l the lightness, a float in [0, 1].
 * @param {number} a the opacity, a float in [0, 1].
 * @extends pv.Color
 */
pv.Color.Hsl = function(h, s, l, a) {
  pv.Color.call(this, "hsl(" + h + "," + (s * 100) + "%," + (l * 100) + "%)", a);

  /**
   * The hue, an integer in [0, 360].
   *
   * @type number
   */
  this.h = h;

  /**
   * The saturation, a float in [0, 1].
   *
   * @type number
   */
  this.s = s;

  /**
   * The lightness, a float in [0, 1].
   *
   * @type number
   */
  this.l = l;

  /**
   * The opacity, a float in [0, 1].
   *
   * @type number
   */
  this.a = a;
};
pv.Color.Hsl.prototype = pv.extend(pv.Color);

/**
 * Returns this.
 *
 * @returns {pv.Color.Hsl} this.
 */
pv.Color.Hsl.prototype.hsl = function() { return this; };


/**
 * Constructs a new HSL color with the same saturation, lightness and alpha as
 * this color, and the specified hue.
 *
 * @param {number} h the hue, an integer in [0, 360].
 */
pv.Color.Hsl.prototype.hue = function(h) {
  return pv.hsl(h, this.s, this.l, this.a);
};

/**
 * Constructs a new HSL color with the same hue, lightness and alpha as this
 * color, and the specified saturation.
 *
 * @param {number} s the saturation, a float in [0, 1].
 */
pv.Color.Hsl.prototype.saturation = function(s) {
  return pv.hsl(this.h, s, this.l, this.a);
};

/**
 * Constructs a new HSL color with the same hue, saturation and alpha as this
 * color, and the specified lightness.
 *
 * @param {number} l the lightness, a float in [0, 1].
 */
pv.Color.Hsl.prototype.lightness = function(l) {
  return pv.hsl(this.h, this.s, l, this.a);
};

/**
 * Constructs a new HSL color with the same hue, saturation and lightness as
 * this color, and the specified alpha.
 *
 * @param {number} a the opacity, a float in [0, 1].
 */
pv.Color.Hsl.prototype.alpha = function(a) {
  return pv.hsl(this.h, this.s, this.l, a);
};

/**
 * Constructs a new HSL color which is the complementary color of this color.
 */
pv.Color.Hsl.prototype.complementary = function() {
  return pv.hsl((this.h + 180) % 360, 1 - this.s, 1 - this.l, this.a);
};
  
/**
 * Returns the RGB color equivalent to this HSL color.
 *
 * @returns {pv.Color.Rgb} an RGB color.
 */
pv.Color.Hsl.prototype.rgb = function() {
  var h = this.h, s = this.s, l = this.l;

  /* Some simple corrections for h, s and l. */
  h = h % 360; if (h < 0) h += 360;
  s = Math.max(0, Math.min(s, 1));
  l = Math.max(0, Math.min(l, 1));

  /* From FvD 13.37, CSS Color Module Level 3 */
  var m2 = (l <= .5) ? (l * (1 + s)) : (l + s - l * s);
  var m1 = 2 * l - m2;
  function v(h) {
    if (h > 360) h -= 360;
    else if (h < 0) h += 360;
    if (h < 60) return m1 + (m2 - m1) * h / 60;
    if (h < 180) return m2;
    if (h < 240) return m1 + (m2 - m1) * (240 - h) / 60;
    return m1;
  }
  function vv(h) {
    return Math.round(v(h) * 255);
  }

  return pv.rgb(vv(h + 120), vv(h), vv(h - 120), this.a);
};

/**
 * @private SVG color keywords, per CSS Color Module Level 3.
 *
 * @see <a href="http://www.w3.org/TR/SVG/types.html#ColorKeywords">SVG color
 * keywords</a>
 */
pv.Color.names = {
  aliceblue: "#f0f8ff",
  antiquewhite: "#faebd7",
  aqua: "#00ffff",
  aquamarine: "#7fffd4",
  azure: "#f0ffff",
  beige: "#f5f5dc",
  bisque: "#ffe4c4",
  black: "#000000",
  blanchedalmond: "#ffebcd",
  blue: "#0000ff",
  blueviolet: "#8a2be2",
  brown: "#a52a2a",
  burlywood: "#deb887",
  cadetblue: "#5f9ea0",
  chartreuse: "#7fff00",
  chocolate: "#d2691e",
  coral: "#ff7f50",
  cornflowerblue: "#6495ed",
  cornsilk: "#fff8dc",
  crimson: "#dc143c",
  cyan: "#00ffff",
  darkblue: "#00008b",
  darkcyan: "#008b8b",
  darkgoldenrod: "#b8860b",
  darkgray: "#a9a9a9",
  darkgreen: "#006400",
  darkgrey: "#a9a9a9",
  darkkhaki: "#bdb76b",
  darkmagenta: "#8b008b",
  darkolivegreen: "#556b2f",
  darkorange: "#ff8c00",
  darkorchid: "#9932cc",
  darkred: "#8b0000",
  darksalmon: "#e9967a",
  darkseagreen: "#8fbc8f",
  darkslateblue: "#483d8b",
  darkslategray: "#2f4f4f",
  darkslategrey: "#2f4f4f",
  darkturquoise: "#00ced1",
  darkviolet: "#9400d3",
  deeppink: "#ff1493",
  deepskyblue: "#00bfff",
  dimgray: "#696969",
  dimgrey: "#696969",
  dodgerblue: "#1e90ff",
  firebrick: "#b22222",
  floralwhite: "#fffaf0",
  forestgreen: "#228b22",
  fuchsia: "#ff00ff",
  gainsboro: "#dcdcdc",
  ghostwhite: "#f8f8ff",
  gold: "#ffd700",
  goldenrod: "#daa520",
  gray: "#808080",
  green: "#008000",
  greenyellow: "#adff2f",
  grey: "#808080",
  honeydew: "#f0fff0",
  hotpink: "#ff69b4",
  indianred: "#cd5c5c",
  indigo: "#4b0082",
  ivory: "#fffff0",
  khaki: "#f0e68c",
  lavender: "#e6e6fa",
  lavenderblush: "#fff0f5",
  lawngreen: "#7cfc00",
  lemonchiffon: "#fffacd",
  lightblue: "#add8e6",
  lightcoral: "#f08080",
  lightcyan: "#e0ffff",
  lightgoldenrodyellow: "#fafad2",
  lightgray: "#d3d3d3",
  lightgreen: "#90ee90",
  lightgrey: "#d3d3d3",
  lightpink: "#ffb6c1",
  lightsalmon: "#ffa07a",
  lightseagreen: "#20b2aa",
  lightskyblue: "#87cefa",
  lightslategray: "#778899",
  lightslategrey: "#778899",
  lightsteelblue: "#b0c4de",
  lightyellow: "#ffffe0",
  lime: "#00ff00",
  limegreen: "#32cd32",
  linen: "#faf0e6",
  magenta: "#ff00ff",
  maroon: "#800000",
  mediumaquamarine: "#66cdaa",
  mediumblue: "#0000cd",
  mediumorchid: "#ba55d3",
  mediumpurple: "#9370db",
  mediumseagreen: "#3cb371",
  mediumslateblue: "#7b68ee",
  mediumspringgreen: "#00fa9a",
  mediumturquoise: "#48d1cc",
  mediumvioletred: "#c71585",
  midnightblue: "#191970",
  mintcream: "#f5fffa",
  mistyrose: "#ffe4e1",
  moccasin: "#ffe4b5",
  navajowhite: "#ffdead",
  navy: "#000080",
  oldlace: "#fdf5e6",
  olive: "#808000",
  olivedrab: "#6b8e23",
  orange: "#ffa500",
  orangered: "#ff4500",
  orchid: "#da70d6",
  palegoldenrod: "#eee8aa",
  palegreen: "#98fb98",
  paleturquoise: "#afeeee",
  palevioletred: "#db7093",
  papayawhip: "#ffefd5",
  peachpuff: "#ffdab9",
  peru: "#cd853f",
  pink: "#ffc0cb",
  plum: "#dda0dd",
  powderblue: "#b0e0e6",
  purple: "#800080",
  red: "#ff0000",
  rosybrown: "#bc8f8f",
  royalblue: "#4169e1",
  saddlebrown: "#8b4513",
  salmon: "#fa8072",
  sandybrown: "#f4a460",
  seagreen: "#2e8b57",
  seashell: "#fff5ee",
  sienna: "#a0522d",
  silver: "#c0c0c0",
  skyblue: "#87ceeb",
  slateblue: "#6a5acd",
  slategray: "#708090",
  slategrey: "#708090",
  snow: "#fffafa",
  springgreen: "#00ff7f",
  steelblue: "#4682b4",
  tan: "#d2b48c",
  teal: "#008080",
  thistle: "#d8bfd8",
  tomato: "#ff6347",
  turquoise: "#40e0d0",
  violet: "#ee82ee",
  wheat: "#f5deb3",
  white: "#ffffff",
  whitesmoke: "#f5f5f5",
  yellow: "#ffff00",
  yellowgreen: "#9acd32",
  transparent: pv.Color.transparent = pv.rgb(0, 0, 0, 0)
};

/* Initialized named colors. */
(function() {
  var names = pv.Color.names;
  names.none = names.transparent;
  for (var name in names) names[name] = pv.color(names[name]);
})();
/**
 * Returns a new categorical color encoding using the specified colors.  The
 * arguments to this method are an array of colors; see {@link pv.color}. For
 * example, to create a categorical color encoding using the <tt>species</tt>
 * attribute:
 *
 * <pre>pv.colors("red", "green", "blue").by(function(d) d.species)</pre>
 *
 * The result of this expression can be used as a fill- or stroke-style
 * property. This assumes that the data's <tt>species</tt> attribute is a
 * string.
 *
 * @param {string} colors... categorical colors.
 * @see pv.Scale.ordinal
 * @returns {pv.Scale.ordinal} an ordinal color scale.
 */
pv.colors = function() {
  var scale = pv.Scale.ordinal();
  scale.range.apply(scale, arguments);
  return scale;
};

/**
 * A collection of standard color palettes for categorical encoding.
 *
 * @namespace A collection of standard color palettes for categorical encoding.
 */
pv.Colors = {};

/**
 * Returns a new 10-color scheme. The arguments to this constructor are
 * optional, and equivalent to calling {@link pv.Scale.OrdinalScale#domain}. The
 * following colors are used:
 *
 * <div style="background:#1f77b4;">#1f77b4</div>
 * <div style="background:#ff7f0e;">#ff7f0e</div>
 * <div style="background:#2ca02c;">#2ca02c</div>
 * <div style="background:#d62728;">#d62728</div>
 * <div style="background:#9467bd;">#9467bd</div>
 * <div style="background:#8c564b;">#8c564b</div>
 * <div style="background:#e377c2;">#e377c2</div>
 * <div style="background:#7f7f7f;">#7f7f7f</div>
 * <div style="background:#bcbd22;">#bcbd22</div>
 * <div style="background:#17becf;">#17becf</div>
 *
 * @param {number...} domain... domain values.
 * @returns {pv.Scale.ordinal} a new ordinal color scale.
 * @see pv.color
 */
pv.Colors.category10 = function() {
  var scale = pv.colors(
      "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
      "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf");
  scale.domain.apply(scale, arguments);
  return scale;
};

/**
 * Returns a new 20-color scheme. The arguments to this constructor are
 * optional, and equivalent to calling {@link pv.Scale.OrdinalScale#domain}. The
 * following colors are used:
 *
 * <div style="background:#1f77b4;">#1f77b4</div>
 * <div style="background:#aec7e8;">#aec7e8</div>
 * <div style="background:#ff7f0e;">#ff7f0e</div>
 * <div style="background:#ffbb78;">#ffbb78</div>
 * <div style="background:#2ca02c;">#2ca02c</div>
 * <div style="background:#98df8a;">#98df8a</div>
 * <div style="background:#d62728;">#d62728</div>
 * <div style="background:#ff9896;">#ff9896</div>
 * <div style="background:#9467bd;">#9467bd</div>
 * <div style="background:#c5b0d5;">#c5b0d5</div>
 * <div style="background:#8c564b;">#8c564b</div>
 * <div style="background:#c49c94;">#c49c94</div>
 * <div style="background:#e377c2;">#e377c2</div>
 * <div style="background:#f7b6d2;">#f7b6d2</div>
 * <div style="background:#7f7f7f;">#7f7f7f</div>
 * <div style="background:#c7c7c7;">#c7c7c7</div>
 * <div style="background:#bcbd22;">#bcbd22</div>
 * <div style="background:#dbdb8d;">#dbdb8d</div>
 * <div style="background:#17becf;">#17becf</div>
 * <div style="background:#9edae5;">#9edae5</div>
 *
 * @param {number...} domain... domain values.
 * @returns {pv.Scale.ordinal} a new ordinal color scale.
 * @see pv.color
*/
pv.Colors.category20 = function() {
  var scale = pv.colors(
      "#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c",
      "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5",
      "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f",
      "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5");
  scale.domain.apply(scale, arguments);
  return scale;
};

/**
 * Returns a new alternative 19-color scheme. The arguments to this constructor
 * are optional, and equivalent to calling
 * {@link pv.Scale.OrdinalScale#domain}. The following colors are used:
 *
 * <div style="background:#9c9ede;">#9c9ede</div>
 * <div style="background:#7375b5;">#7375b5</div>
 * <div style="background:#4a5584;">#4a5584</div>
 * <div style="background:#cedb9c;">#cedb9c</div>
 * <div style="background:#b5cf6b;">#b5cf6b</div>
 * <div style="background:#8ca252;">#8ca252</div>
 * <div style="background:#637939;">#637939</div>
 * <div style="background:#e7cb94;">#e7cb94</div>
 * <div style="background:#e7ba52;">#e7ba52</div>
 * <div style="background:#bd9e39;">#bd9e39</div>
 * <div style="background:#8c6d31;">#8c6d31</div>
 * <div style="background:#e7969c;">#e7969c</div>
 * <div style="background:#d6616b;">#d6616b</div>
 * <div style="background:#ad494a;">#ad494a</div>
 * <div style="background:#843c39;">#843c39</div>
 * <div style="background:#de9ed6;">#de9ed6</div>
 * <div style="background:#ce6dbd;">#ce6dbd</div>
 * <div style="background:#a55194;">#a55194</div>
 * <div style="background:#7b4173;">#7b4173</div>
 *
 * @param {number...} domain... domain values.
 * @returns {pv.Scale.ordinal} a new ordinal color scale.
 * @see pv.color
 */
pv.Colors.category19 = function() {
  var scale = pv.colors(
      "#9c9ede", "#7375b5", "#4a5584", "#cedb9c", "#b5cf6b",
      "#8ca252", "#637939", "#e7cb94", "#e7ba52", "#bd9e39",
      "#8c6d31", "#e7969c", "#d6616b", "#ad494a", "#843c39",
      "#de9ed6", "#ce6dbd", "#a55194", "#7b4173");
  scale.domain.apply(scale, arguments);
  return scale;
};
(function() {
    /* Adapted from https://gitorious.org/~brendansterne/protovis/brendansternes-protovis */
    
    /**
     * TBD Returns the {@link pv.FillStyle} for the specified format string.
     * For example:
     * <ul>
     * <li>linear-gradient(angle-spec, white, black)</li>
     * <li>red</li>
     * <li>linear-gradient(to top, white, red 40%, black 100%)</li>
     * <li>linear-gradient(90deg, white, red 40%, black 100%)</li>
     * </ul>
     * 
     * @param {string} format the gradient specification string.
     * @returns {pv.FillStyle} the corresponding <tt>FillStyle</tt>.
     * @see <a href="http://www.w3.org/TR/css3-images/#gradients">CSS3 Gradients</a>
     */
    pv.fillStyle = function(format) {
        /* A FillStyle object? */
        if (format.type) { return format; }

        var k = format.key || format;
        var fillStyle = fillStylesByKey[k];
        if(!fillStyle) { 
            fillStyle = fillStylesByKey[k] = createFillStyle(format);
        } else {
            fillStyle = fillStyle.clone();
        }
        
        return fillStyle;
    };
    
    var fillStylesByKey = {}; // TODO: unbounded cache
    
    var createFillStyle = function(format) {
        /* A Color object? */
        if (format.rgb) { return new pv.FillStyle.Solid(format.color, format.opacity); }

        /* A gradient spec. ? */
        var match = /^\s*([a-z\-]+)\(\s*(.*?)\s*\)\s*$/.exec(format);
        if (match) {
            switch (match[1]) {
                case "linear-gradient": return parseLinearGradient(match[2]);
                case "radial-gradient": return parseRadialGradient(match[2]);
            }
        }

        // Default to solid fill
        return new pv.FillStyle.Solid(pv.color(format));
    };
    
    var keyAnglesDeg = {
        top:    0,
        'top right': 45,
        right:  90,
        'bottom right': 135,
        bottom: 180,
        'bottom left': 225,
        left:   270,
        'top left': 315
    };

    /*
     * linear-gradient(<text>) <text> := [<angle-spec>, ]<color-stop>, ...
     * 
     * <angle-spec> := <to-side-or-corner> | <angle-number> 
     *   -> default <angle-spec> is "to bottom"
     *    
     * <to-side-or-corner> := to (top | bottom) || (left | right) 
     *   top    -> 0deg 
     *   right  -> 90deg 
     *   bottom -> 180deg 
     *   left   -> 270deg
     * 
     * <angle-number> := <number>[deg] 
     * 
     * examples: 
     * "bottom~white to top~black"
     *    linear-gradient(to top, white, black) 
     *   
     * "bottom-right~white to top-left~black" 
     *    linear-gradient(to top left, white, black)
     */
    function parseLinearGradient(text) {
        var terms = parseText(text);
        if (!terms.length) {
            return null;
        }

        var angle = Math.PI;
        var keyAngle;
        var m, f;
        var term = terms[0];
        if (term.indexOf('to ') === 0) {
            // to side / corner
            m = /^to\s+(?:((top|bottom)(?:\s+(left|right))?)|((left|right)(?:\\s+(top|bottom))?))$/
                    .exec(term);
            if (m) {
                if (m[1]) {
                    // (top|bottom)(?:\s+(left|right))?
                    keyAngle = m[2];
                    if(m[3]){
                        keyAngle += ' ' + m[3];
                    }
                } else { // m[4]
                    // (left|right)(?:\\s+(top|bottom))?
                    keyAngle = m[5];
                    if(m[6]){
                        keyAngle = m[6] + ' ' + keyAngle;
                    }
                }
                
                angle = pv.radians(keyAnglesDeg[keyAngle]);
                
                terms.shift();
            }
        } else {
            // Check number
            f = parseFloat(term); // tolerates text suffixes
            if (!isNaN(f)) {
                angle = f;

                // Check the unit
                if (/^.*?deg$/.test(term)) {
                    angle = pv.radians(angle);
                }
                terms.shift();
            }
        }
                
        var stops = parseStops(terms);
        switch (stops.length) {
            case 0: return null;
            case 1: return new pv.FillStyle.Solid(stops[0].color, 1);
        }

        return new pv.FillStyle.LinearGradient(angle, stops, text);
    }

    /*
     * radial-gradient(<text>) 
     * 
     * <text> := [<focal-point-spec>, ]<color-stop>, ... 
     * 
     * not implemented: 
     * <focal-point-spec> := at <point-or-side-or-corner> |
     *                       at <percentage-position> | 
     *                       at <percentage-position> <percentage-position>
     * 
     * <point-or-side-or-corner> := center | top left | top right | bottom left | bottom right | ... 
     *   -> default <point-or-side-or-corner> = "center"
     * 
     * <percentage-position> := <number>% 
     * 
     * examples: 
     *   radial-gradient(at center, white, black)
     */
    function parseRadialGradient(text) {
        var terms = parseText(text);
        if (!terms.length) {
            return null;
        }
        
        var stops = parseStops(terms);
        switch (stops.length) {
            case 0: return null;
            case 1: return new pv.FillStyle.Solid(stops[0].color, 1);
        }

        return new pv.FillStyle.RadialGradient(50, 50, stops, text);
    }

    function parseText(text){
        var colorFuns  = {};
        var colorFunId = 0;
        
        text = text.replace(/\b\w+?\(.*?\)/g, function($0){
            var id = '__color' + (colorFunId++); 
            colorFuns[id] = $0;
            return id;
        });
        
        var terms = text.split(/\s*,\s*/);
        if (!terms.length) {
            return null;
        }
        
        // Re-insert color functions
        if(colorFunId){
            terms.forEach(function(id, index){
                if(colorFuns.hasOwnProperty(id)){
                    terms[index] = colorFuns[id];
                }
            });
        }
        
        return terms;
    }
    
    /*
     * COLOR STOPS 
     * <color-stop> := <color-spec> [<percentage-position>] 
     * 
     * <percentage-position> := <number>% 
     * 
     * <color-spec> := rgb() | rgba() | hsl() | hsla() | white | ...
     */
    function parseStops(terms) {
        var stops = [];
        var minOffsetPercent = +Infinity;
        var maxOffsetPercent = -Infinity;
        var pendingOffsetStops = [];

        function processPendingStops(lastOffset) {
            var count = pendingOffsetStops.length;
            if (count) {
                var firstOffset = maxOffsetPercent;
                var step = (lastOffset - firstOffset) / (count + 1);
                for (var i = 0; i < count; i++) {
                    firstOffset += step;
                    pendingOffsetStops[i].offset = firstOffset;
                }

                pendingOffsetStops.length = 0;
            }
        }

        var i = 0;
        var T = terms.length;
        while (i < T) {
            var term = terms[i++];

            var m = /^(.+?)\s*([+\-]?[e\.\d]+%)?$/i.exec(term);
            if (m) {
                var stop = {
                    color: pv.color(m[1])
                };
                
                var offsetPercent = parseFloat(m[2]); // tolerates text suffixes
                if (isNaN(offsetPercent)) {
                    if (!stops.length) {
                        offsetPercent = 0;
                    } else if (i === T) { // last one defaults to "100"...
                        offsetPercent = Math.max(maxOffsetPercent, 100);
                    }
                }
                
                stops.push(stop);
                
                if (isNaN(offsetPercent)) {
                    pendingOffsetStops.push(stop);
                } else {
                    stop.offset = offsetPercent;

                    processPendingStops(offsetPercent);

                    if (offsetPercent > maxOffsetPercent) {
                        // Record maximum value so far
                        maxOffsetPercent = offsetPercent;
                    } else if (offsetPercent < maxOffsetPercent) {
                        // Cannot go backwards
                        offsetPercent = maxOffsetPercent;
                    }

                    if (offsetPercent < minOffsetPercent) {
                        minOffsetPercent = offsetPercent;
                    }
                }
            }
        }

        if (stops.length >= 2 && 
            (minOffsetPercent < 0 || maxOffsetPercent > 100)) {
            // Normalize < 0 and > 100 values, cause SVG does not support them
            // TODO: what about the interpretation of an end < 100 or begin > 0?
            var colorDomain = [];
            var colorRange = [];
            stops.forEach(function(stop) {
                colorDomain.push(stop.offset);
                colorRange.push(stop.color);
            });

            var colorScale = pv.scale.linear()
                .domain(colorDomain)
                .range(colorRange);

            if (minOffsetPercent < 0) {
                while (stops.length && stops[0].offset <= 0) {
                    stops.shift();
                }

                stops.unshift({
                    offset: 0,
                    color: colorScale(0)
                });
            }

            if (maxOffsetPercent > 100) {

                while (stops.length && stops[stops.length - 1].offset >= 100) {
                    stops.pop();
                }

                stops.push({
                    offset: 100,
                    color:  colorScale(100)
                });
            }
        }

        return stops;
    }
    
    // -----------
    
    var FillStyle = pv.FillStyle = function(type) {
        this.type = type;
        this.key  = type;
    };
    
    /* 
     * Provide {@link pv.Color} compatibility.
     */
    pv.extendType(FillStyle, new pv.Color('none', 1));
    
    FillStyle.prototype.rgb = function() {
        var color = pv.color(this.color);
        if(this.opacity !== color.opacity){
            color = color.alpha(this.opacity);
        }
        return color;
    };
    
    FillStyle.prototype.alphaBlend = function(mate) {
        return this.rgb().alphaBlend(mate);
    };
      
    FillStyle.prototype.rgbDecimal = function(mate) {
        return this.rgb().rgbDecimal(mate);
    };

    FillStyle.prototype.isDark = function() {
        return this.rgb().isDark();
    };
    
    // FillStyle.prototype.clone
    
    /**
     * Constructs a solid fill style. This constructor should not be invoked
     * directly; use {@link pv.fillStyle} instead.
     * 
     * @class represents a solid fill.
     * 
     * @extends pv.FillStyle
     */
    var Solid = pv.FillStyle.Solid = function(color, opacity) {
        FillStyle.call(this, 'solid');
        
        if(color.rgb){
            this.color   = color.color;
            this.opacity = color.opacity;
        } else {
            this.color   = color;
            this.opacity = opacity;
        }
          
        this.key += " " + this.color + " alpha(" + this.opacity + ")";
    };
    
    pv.extendType(Solid, FillStyle);
    
    Solid.prototype.alpha = function(opacity){
        return new Solid(this.color, opacity);
    };
    
    Solid.prototype.brighter = function(k){
        return new Solid(this.rgb().brighter(k));
    };

    Solid.prototype.darker = function(k){
        return new Solid(this.rgb().darker(k));
    };
    
    Solid.prototype.complementary = function() {
        return new Solid(this.rgb().complementary());
    };
    
    Solid.prototype.clone = function() {
        var o = pv.extend(Solid);
        o.type    = this.type;
        o.key     = this.key;
        o.color   = this.color;
        o.opacity = this.opacity;
        return o;
    };
    
    pv.FillStyle.transparent = new Solid(pv.Color.transparent);
    
    // ----------------
    
    var gradient_id = 0;

    var Gradient = pv.FillStyle.Gradient = function(type, stops) {
        FillStyle.call(this, type);
        
        this.id = ++gradient_id;
        this.stops = stops;
        
        if(stops.length){
            // Default color for renderers that do not support gradients
            this.color = stops[0].color.color;
        }
        
        this.key +=  
          " stops(" + 
          stops
          .map(function(stop){
            var color = stop.color;
            return color.color + " alpha(" + color.opacity + ") at(" + stop.offset + ")"; 
          })
          .join(", ") + 
          ")";
    };
    
    pv.extendType(Gradient, FillStyle);
    
    Gradient.prototype.rgb = function(){
        return this.stops.length ? this.stops[0].color : undefined;
    };
    
    Gradient.prototype.alpha = function(opacity){
        return this._cloneWithStops(this.stops.map(function(stop){
            return {offset: stop.offset, color: stop.color.alpha(opacity)};
        }));
    };
    
    Gradient.prototype.darker = function(k){
        return this._cloneWithStops(this.stops.map(function(stop){
            return {offset: stop.offset, color: stop.color.darker(k)};
        }));
    };
    
    Gradient.prototype.brighter = function(k){
        return this._cloneWithStops(this.stops.map(function(stop){
            return {offset: stop.offset, color: stop.color.brighter(k)};
        }));
    };
    
    Gradient.prototype.complementary = function(){
        return this._cloneWithStops(this.stops.map(function(stop){
            return {offset: stop.offset, color: stop.color.complementary()};
        }));
    };
    
    Gradient.prototype.alphaBlend = function(mate) {
        return this._cloneWithStops(this.stops.map(function(stop){
            return {offset: stop.offset, color: stop.color.alphaBlend(mate)};
        }));
    };
    
    Gradient.prototype.clone = function() {
        var Type = this.constructor;
        var o = pv.extend(Type);
        o.constructor = Type;
        o.id   = ++gradient_id;
        o.type = this.type;
        o.key = this.key;

        var stops = this.stops;
        o.stops = stops;
        if(stops.length) {
            // Default color for renderers that do not support gradients
            // Cannot use the this.color because it is assigned an per-mark-root id on render...
            o.color = stops[0].color.color;
        }
        
        this._initClone(o);
        
        return o;
    };
     
    // Gradient.prototype._initClone
    
    // ----------------
    
    var LinearGradient = pv.FillStyle.LinearGradient = function(angle, stops) {
        Gradient.call(this, 'lineargradient', stops);
        
        this.angle = angle;
        this.key +=  " angle(" + angle + ")";
    };

    pv.extendType(LinearGradient, Gradient);
    
    LinearGradient.prototype._cloneWithStops = function(stops){
        return new LinearGradient(this.angle, stops);
    };
    
    LinearGradient.prototype._initClone = function(o) {
        o.angle = this.angle;
    };
    
    // ----------------
    
    var RadialGradient = pv.FillStyle.RadialGradient = function(cx, cy, stops) {
        Gradient.call(this, 'radialgradient', stops);
        
        this.cx = cx;
        this.cy = cy;
        this.key +=  " center(" + cx + "," + cy + ")";
    };
    
    pv.extendType(RadialGradient, Gradient);
    
    RadialGradient.prototype._cloneWithStops = function(stops) {
        return new RadialGradient(this.cx, this.cy);
    };
    
    RadialGradient.prototype._initClone = function(o) {
        o.cx = this.cx;
        o.cy = this.cy;
    };
})();
/**
 * Returns a linear color ramp from the specified <tt>start</tt> color to the
 * specified <tt>end</tt> color. The color arguments may be specified either as
 * <tt>string</tt>s or as {@link pv.Color}s. This is equivalent to:
 *
 * <pre>    pv.Scale.linear().domain(0, 1).range(...)</pre>
 *
 * @param {string} start the start color; may be a <tt>pv.Color</tt>.
 * @param {string} end the end color; may be a <tt>pv.Color</tt>.
 * @returns {Function} a color ramp from <tt>start</tt> to <tt>end</tt>.
 * @see pv.Scale.linear
 */
pv.ramp = function(start, end) {
  var scale = pv.Scale.linear();
  scale.range.apply(scale, arguments);
  return scale;
};
/**
 * @private
 * @namespace
 */
pv.Scene = pv.SvgScene = {
  /* Various namespaces. */
  svg: "http://www.w3.org/2000/svg",
  xmlns: "http://www.w3.org/2000/xmlns",
  xlink: "http://www.w3.org/1999/xlink",
  xhtml: "http://www.w3.org/1999/xhtml",

  /** The pre-multipled scale, based on any enclosing transforms. */
  scale: 1,

  /** The set of supported events. */
  events: [
    "DOMMouseScroll", // for Firefox
    "mousewheel",
    "mousedown",
    "mouseup",
    "mouseover",
    "mouseout",
    "mousemove",
    "click",
    "dblclick"
  ],

  /** Implicit values for SVG and CSS properties. */
  implicit: {
    svg: {
      "shape-rendering": "auto",
      "pointer-events": "painted",
      "x": 0,
      "y": 0,
      "dy": 0,
      "text-anchor": "start",
      "transform": "translate(0,0)",
      "fill": "none",
      "fill-opacity": 1,
      "stroke": "none",
      "stroke-opacity": 1,
      "stroke-width": 1.5,
      "stroke-linejoin":   "miter",
      "stroke-linecap":    "butt",
      "stroke-miterlimit": 8,
      "stroke-dasharray":  "none"
    },
    css: {
      "font": "10px sans-serif"
    }
  }
};

/**
 * Updates the display for the specified array of scene nodes.
 *
 * @param scenes {array} an array of scene nodes.
 */
pv.SvgScene.updateAll = function(scenes) {
  if (scenes.length
      && scenes[0].reverse
      && (scenes.type !== "line")
      && (scenes.type !== "area")) {
    var reversed = pv.extend(scenes);
    for (var i = 0, j = scenes.length - 1; j >= 0; i++, j--) {
      reversed[i] = scenes[j];
    }
    scenes = reversed;
  }
  this.removeSiblings(this[scenes.type](scenes));
};

/**
 * Creates a new SVG element of the specified type.
 *
 * @param type {string} an SVG element type, such as "rect".
 * @returns a new SVG element.
 */
pv.SvgScene.create = function(type) {
  return document.createElementNS(this.svg, type);
};

/**
 * Expects the element <i>e</i> to be the specified type. If the element does
 * not exist, a new one is created. If the element does exist but is the wrong
 * type, it is replaced with the specified element.
 *
 * @param e the current SVG element.
 * @param type {string} an SVG element type, such as "rect".
 * @param attributes an optional attribute map.
 * @param style an optional style map.
 * @returns a new SVG element.
 */
pv.SvgScene.expect = function(e, type, scenes, i, attributes, style) {
    var tagName;
    if(e) {
        tagName = e.tagName;
        if(tagName === 'defs') {
            e = e.nextSibling; // may be null
            if(e) { tagName = e.tagName; }
        } else if(tagName === 'a') {
            e = e.firstChild;
            // ends up replacing the "a" tag with its child
        }
    }
    
    if(e) {
        if (tagName !== type) {
          var n = this.create(type);
          e.parentNode.replaceChild(n, e);
          e = n;
        }
    } else {
        e = this.create(type);
    }

    if(attributes) this.setAttributes(e, attributes);
    if(style)      this.setStyle(e, style);

    return e;
};

pv.SvgScene.setAttributes = function(e, attributes) {
    var implicitSvg = this.implicit.svg;
    var prevAttrs = e.__attributes__;
    if(prevAttrs === attributes) { prevAttrs = null; }
    
    for (var name in attributes) {
        var value = attributes[name];
        if(!prevAttrs || (value !== prevAttrs[name])) {
            if (value == null || value == implicitSvg[name]) {
                e.removeAttribute(name);
            }  else {
                e.setAttribute(name, value);
            }
        }
    }
    
    e.__attributes__ = attributes;
};

pv.SvgScene.setStyle = function(e, style) {
  var implicitCss = this.implicit.css;
  var prevStyle = e.__style__;
  if(prevStyle === style) { prevStyle = null; }
  
  switch(pv.renderer()) {
      case 'batik':
          for (var name in style) {
              var value = style[name];
              if(!prevStyle || (value !== prevStyle[name])) {
                  if (value == null || value == implicitCss[name]) {
                    e.removeAttribute(name);
                  } else {
                    e.style.setProperty(name,value);
                  }
              }
          }
          break;
          
      case 'svgweb':
          for (var name in style) {
              // svgweb doesn't support removeproperty TODO SVGWEB
              var value = style[name];
              if (value == null || value == implicitCss[name]) {
                  continue;
              }
              e.style[name] = value;
          }
          break;
          
     default:
         for (var name in style) {
             var value = style[name];
             if(!prevStyle || (value !== prevStyle[name])) {
                 if (value == null || value == implicitCss[name]){
                     e.style.removeProperty(name);
                 } else {
                     e.style[name] = value;
                 }
             }
         }
  }
  
  e.__style__ = style;
};

/** TODO */
pv.SvgScene.append = function(e, scenes, index) {
  e.$scene = {scenes: scenes, index: index};
  e = this.title(e, scenes[index]);
  if (!e.parentNode) scenes.$g.appendChild(e);
  return e.nextSibling;
};

/**
 * Applies a title tooltip to the specified element <tt>e</tt>, using the
 * <tt>title</tt> property of the specified scene node <tt>s</tt>. Note that
 * this implementation creates both the SVG <tt>title</tt> element (which
 * is the recommended approach, but only works in more modern browsers) and
 * the <tt>xlink:title</tt> attribute which works on more down-level browsers.
 *
 * @param e an SVG element.
 * @param s a scene node.
 */
pv.SvgScene.title = function(e, s) {
  var a = e.parentNode;
  if (a && (a.tagName != "a")) a = null;
  if (s.title) {
    if (!a) {
      a = this.create("a");
      // for FF>=4 when showing non-title element tooltips
      a.setAttributeNS(this.xlink, "xlink:href", "");
      if (e.parentNode) e.parentNode.replaceChild(a, e);
      a.appendChild(e);
    }

    // Set the title. Using xlink:title ensures the call works in IE
    // but only FireFox seems to show the title.
    // without xlink: in there, it breaks IE.
    a.setAttributeNS(this.xlink, "xlink:title", s.title); // for FF<4

    // for SVG renderers that follow the recommended approach
    var t = null;
    for (var c = e.firstChild; c != null; c = c.nextSibling) {
      if (c.nodeName == "title") {
        t = c;
        break;
      }
    }
    
    if (!t) {
      t = this.create("title");
      e.appendChild(t);
    } else {
      t.removeChild(t.firstChild); // empty out the text
    }

    if (pv.renderer() == "svgweb") { // SVGWeb needs an extra 'true' to create SVG text nodes properly in IE.
      t.appendChild(document.createTextNode(s.title, true));
    } else {
      t.appendChild(document.createTextNode(s.title));
    }

    return a;
  }
  if (a) a.parentNode.replaceChild(e, a);
  return e;
};

/** TODO */
pv.SvgScene.dispatch = pv.listener(function(e) {
  var t = e.target.$scene;
  if (t) {
    var type = e.type;

    /* Fixes for mousewheel support on Firefox & Opera. */
    switch (type) {
      case "DOMMouseScroll":
        type = "mousewheel";
        e.wheel = -480 * e.detail;
        break;

      case "mousewheel":
        e.wheel = (window.opera ? 12 : 1) * e.wheelDelta;
        break;
    }

    if (pv.Mark.dispatch(type, t.scenes, t.index, e)) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
});

/** @private Remove siblings following element <i>e</i>. */
pv.SvgScene.removeSiblings = function(e) {
  while (e) {
    var n = e.nextSibling;
    // don't remove a sibling <defs> node
    if (e.nodeName !== 'defs') {
      e.parentNode.removeChild(e);
    }
    e = n;
  }
};

/** @private Do nothing when rendering undefined mark types. */
pv.SvgScene.undefined = function() {};

(function() {
    var dashAliasMap = {
        '-':    'shortdash',
        '.':    'shortdot',
        '-.':   'shortdashdot',
        '-..':  'shortdashdotdot',
        '. ':   'dot',
        '- ':   'dash',
        '--':   'longdash',
        '- .':  'dashdot',
        '--.':  'longdashdot',
        '--..': 'longdashdotdot'
    };
    
    var dashMap = { // SVG specific - values for cap=butt
        'shortdash':       [3, 1],
        'shortdot':        [1, 1],
        'shortdashdot':    [3, 1, 1, 1],
        'shortdashdotdot': [3, 1, 1, 1, 1, 1],
        'dot':             [1, 3],
        'dash':            [4, 3],
        'longdash':        [8, 3],
        'dashdot':         [4, 3, 1, 3],
        'longdashdot':     [8, 3, 1, 3],
        'longdashdotdot':  [8, 3, 1, 3, 1, 3]
    };
    
    pv.SvgScene.isStandardDashStyle = function(dashArray){
        return dashMap.hasOwnProperty(dashArray);
    };
    
    pv.SvgScene.translateDashStyleAlias = function(dashArray){
        return dashAliasMap.hasOwnProperty(dashArray) ?
                    dashAliasMap[dashArray] :
                    dashArray;
    };
    
    pv.SvgScene.parseDasharray = function(s){
        // This implementation tries to mimic the VML dashStyle,
        // cause the later is more limited...
        //
        // cap = square and butt result in the same dash pattern
        var dashArray = s.strokeDasharray; 
        if(dashArray && dashArray !== 'none'){
            dashArray = this.translateDashStyleAlias(dashArray);
            
            var standardDashArray = dashMap[dashArray];
            if(standardDashArray){
                dashArray = standardDashArray;
            } else {
                // Make measures relative to line width
                dashArray = dashArray.split(/[\s,]+/);
            }
            
            var lineWidth = s.lineWidth;
            var lineCap   = s.lineCap || 'butt';
            var isButtCap = lineCap === 'butt';
            
            dashArray = 
                dashArray
                    .map(function(num, index){
                        num = +num;
                        if(!isButtCap){
                            // Steal one unit to dash and give it to the gap,
                            // to compensate for the round/square cap
                            if(index % 2){
                                // gap
                                num++;
                            } else {
                                // dash/dot
                                num -= 1;
                            }
                        }
                        
                        if(num <= 0){
                            num = .001; // SVG does not support 0-width; with cap=square/round is useful.
                        }
                        
                        return num * lineWidth / this.scale; 
                     }, this)
                    .join(' ');
        } else {
            dashArray = null;
        }
        
        return dashArray;
    };
})();

(function() {
  
  var reTestUrlColor = /^url\(#/;
  var next_gradient_id = 1;
  var pi2 = Math.PI/2;
  var pi4 = pi2/2;
  var sqrt22 = Math.SQRT2/2;
  var abs = Math.abs;
  var sin = Math.sin;
  var cos = Math.cos;
  
  var zr  = function(x) { return abs(x) <= 1e-12 ? 0 : x; };
  
  pv.SvgScene.addFillStyleDefinition = function(scenes, fill) {
    if(!fill.type || fill.type === 'solid' || reTestUrlColor.test(fill.color)) { return; }
    
    var rootMark = scenes.mark.root;
    var fillStyleMap = rootMark.__fillStyleMap__ || (rootMark.__fillStyleMap__ = {});
    var k = fill.key;
    var instId = fillStyleMap[k];
    if(!instId) {
        instId = fillStyleMap[k] = '__pvGradient' + (next_gradient_id++);
        var elem = createGradientDef.call(this, scenes, fill, instId);
        rootMark.scene.$g.$defs.appendChild(elem);
    }
    
    fill.color = 'url(#' + instId + ')';
  };
 
  var createGradientDef = function (scenes, fill, instId) {
      var isLinear = (fill.type === 'lineargradient');
      var elem     = this.create(isLinear ? "linearGradient" : "radialGradient");
      elem.setAttribute("id", instId);
      
      // Use the default: objectBoundingBox units
      // Coordinates are %s of the width and height of the BBox
      // 0,0 = top, left
      // 1,1 = bottom, right
//    elem.setAttribute("gradientUnits","userSpaceOnUse");
      if(isLinear) {
        // x1,y1 -> x2,y2 form the gradient vector
        // See http://www.w3.org/TR/css3-images/#gradients example 11 on calculating the gradient line
        // Gradient-Top angle -> SVG angle -> From diagonal angle
        // angle = (gradAngle - 90) - 45 = angle - 135
        var svgAngle  = fill.angle - pi2;
        var diagAngle = abs(svgAngle % pi2) - pi4;
            
        // Radius from the center of the normalized bounding box
        var r = abs(sqrt22 * cos(diagAngle));
        var dirx = r * cos(svgAngle);
        var diry = r * sin(svgAngle);

        elem.setAttribute("x1", zr(0.5 - dirx));
        elem.setAttribute("y1", zr(0.5 - diry));
        elem.setAttribute("x2", zr(0.5 + dirx));
        elem.setAttribute("y2", zr(0.5 + diry));
      }
      //else {
      // TODO radial focus
        // Currently using defaults cx = cy = r = 0.5
//      elem.setAttribute("cx", fill.cx);
//      elem.setAttribute("cy", fill.cy);
//      elem.setAttribute("r",  fill.r );
      //}

      var stops = fill.stops;
      var S = stops.length;
      for (var i = 0 ; i < S ; i++) {
        var stop = stops[i];
        
        var stopElem = elem.appendChild(this.create("stop"));
        var color = stop.color;
        stopElem.setAttribute("offset",       stop.offset   + '%');
        stopElem.setAttribute("stop-color",   color.color        );
        stopElem.setAttribute("stop-opacity", color.opacity + '' );
      }
      
      return elem;
  };
  
})();
/**
 * @private Converts the specified b-spline curve segment to a bezier curve
 * compatible with SVG "C".
 *
 * @param p0 the first control point.
 * @param p1 the second control point.
 * @param p2 the third control point.
 * @param p3 the fourth control point.
 */
pv.SvgScene.pathBasis = (function() {

  /**
   * Matrix to transform basis (b-spline) control points to bezier control
   * points. Derived from FvD 11.2.8.
   */
  var basis = [
    [ 1/6, 2/3, 1/6,   0 ],
    [   0, 2/3, 1/3,   0 ],
    [   0, 1/3, 2/3,   0 ],
    [   0, 1/6, 2/3, 1/6 ]
  ];

  /**
   * Returns the point that is the weighted sum of the specified control points,
   * using the specified weights. This method requires that there are four
   * weights and four control points.
   */
  function weight(w, p0, p1, p2, p3) {
    return {
      x: w[0] * p0.left + w[1] * p1.left + w[2] * p2.left + w[3] * p3.left,
      y: w[0] * p0.top  + w[1] * p1.top  + w[2] * p2.top  + w[3] * p3.top
    };
  }

  var convert = function(p0, p1, p2, p3) {
    var b1 = weight(basis[1], p0, p1, p2, p3),
        b2 = weight(basis[2], p0, p1, p2, p3),
        b3 = weight(basis[3], p0, p1, p2, p3);
    return "C" + b1.x + "," + b1.y
         + "," + b2.x + "," + b2.y
         + "," + b3.x + "," + b3.y;
  };

  convert.segment = function(p0, p1, p2, p3) {
    var b0 = weight(basis[0], p0, p1, p2, p3),
        b1 = weight(basis[1], p0, p1, p2, p3),
        b2 = weight(basis[2], p0, p1, p2, p3),
        b3 = weight(basis[3], p0, p1, p2, p3);
    return ["M" + b0.x + "," + b0.y, 
            "C" + b1.x + "," + b1.y + "," + 
                  b2.x + "," + b2.y + "," + 
                  b3.x + "," + b3.y];
  };

  return convert;
})();

/**
 * @private Interpolates the given points using the basis spline interpolation.
 * Returns an SVG path without the leading M instruction to allow path
 * appending.
 *
 * @param points the array of points.
 */
pv.SvgScene.curveBasis = function(points, from, to) {
  var L;
  if(from == null){
    L = points.length;
    from = 0;
    to   = L -1; 
  } else {
    L = to - from + 1;
  }
  
  if (L <= 2) return "";
  
  var path = "",
      p0 = points[from],
      p1 = p0,
      p2 = p0,
      p3 = points[from + 1];
  path += this.pathBasis(p0, p1, p2, p3);
  for (var i = from + 2 ; i <= to ; i++) {
    p0 = p1;
    p1 = p2;
    p2 = p3;
    p3 = points[i];
    path += this.pathBasis(p0, p1, p2, p3);
  }
  /* Cycle through to get the last point. */
  path += this.pathBasis(p1, p2, p3, p3);
  path += this.pathBasis(p2, p3, p3, p3);
  return path;
};

/**
 * @private Interpolates the given points using the basis spline interpolation.
 * If points.length == tangents.length then a regular Hermite interpolation is
 * performed, if points.length == tangents.length + 2 then the first and last
 * segments are filled in with cubic bazier segments.  Returns an array of path
 * strings.
 *
 * @param points the array of points.
 */
pv.SvgScene.curveBasisSegments = function(points, from, to) {
  var L;
  if(from == null){
    L = points.length;
    from = 0;
    to   = L -1; 
  } else {
    L = to - from + 1;
  }
  
  if (L <= 2) return ""; // BUG?
  
  var paths = [],
      p0 = points[from],
      p1 = p0,
      p2 = p0,
      p3 = points[from + 1],
      firstPath = this.pathBasis.segment(p0, p1, p2, p3);

  p0 = p1;
  p1 = p2;
  p2 = p3;
  p3 = points[from + 2];
  firstPath[1] += this.pathBasis(p0, p1, p2, p3); // merge first & second path
  paths.push(firstPath);
  
  for (var i = from + 3; i <= to ; i++) {
    p0 = p1;
    p1 = p2;
    p2 = p3;
    p3 = points[i];
    paths.push(this.pathBasis.segment(p0, p1, p2, p3));
  }

  // merge last & second-to-last path
  var lastPath = this.pathBasis.segment(p1, p2, p3, p3);
  lastPath[1] += this.pathBasis(p2, p3, p3, p3);
  paths.push(lastPath);
  
  return paths;
};

/**
 * @private Interpolates the given points with respective tangents using the cubic
 * Hermite spline interpolation. If points.length == tangents.length then a regular
 * Hermite interpolation is performed, if points.length == tangents.length + 2 then
 * the first and last segments are filled in with cubic bezier segments.
 * Returns an SVG path without the leading M instruction to allow path appending.
 *
 * @param points the array of points.
 * @param tangents the array of tangent vectors.
 */
pv.SvgScene.curveHermite = function(points, tangents, from, to) {
  var L;
  if(from == null){
    L = points.length;
    from = 0;
    to   = L -1;
  } else {
    L = to - from + 1;
  }
  
  var T = tangents.length;
  if (T < 1 || (L !== T && L !== T + 2)) {
    return "";
  }
  
  var quad = L !== T,
      path = "",
      p0 = points[from],
      p  = points[from + 1],
      t0 = tangents[0],
      t  = t0,
      pi = from + 1;

  if (quad) {
    path += "Q" + 
            (p.left - t0.x * 2 / 3) + "," + (p.top  - t0.y * 2 / 3) + "," + 
            p.left + "," + p.top;
    p0 = points[from + 1];
    pi = from + 2;
  }

  if (T > 1) {
    t = tangents[1];
    p = points[pi];
    pi++;
    path += "C" + 
            (p0.left + t0.x) + "," + (p0.top  + t0.y) + "," + 
            (p.left  -  t.x) + "," + (p.top   -  t.y) + "," + 
             p.left + "," + p.top;
    
    for (var i = 2 ; i < T ; i++, pi++) {
      p = points[pi];
      t = tangents[i];
      path += "S" + 
              (p.left - t.x) + "," + (p.top - t.y) + "," + 
              p.left + "," + p.top;
    }
  }

  if (quad) {
    var lp = points[pi];
    path += "Q" + 
            (p.left + t.x * 2 / 3) + ","  + (p.top + t.y * 2 / 3) + "," + 
            lp.left + "," + lp.top;
  }
  
  return path;
};

/**
 * @private Interpolates the given points with respective tangents using the
 * cubic Hermite spline interpolation. Returns an array of path strings.
 *
 * @param points the array of points.
 * @param tangents the array of tangent vectors.
 */
pv.SvgScene.curveHermiteSegments = function(points, tangents, from, to) {
  var L;
  if(from == null){
    L = points.length;
    from = 0;
    to   = L -1;
  } else {
    L = to - from + 1;
  }
  
  var T = tangents.length;
  if (T < 1 || (L !== T && L !== T + 2)) {
    return [];
  }
  
  var quad = L !== T,
      paths = [],
      p0 = points[from],
      p = p0,
      t0 = tangents[0],
      t  = t0,
      pi = from + 1;

  if (quad) {
    p = points[from + 1];
    paths.push(["M" + p0.left + "," + p0.top, 
                "Q" +  (p.left - t.x * 2 / 3) + "," + 
                       (p.top  - t.y * 2 / 3) + "," + 
                        p.left + "," + p.top]);
    pi = from + 2;
  }

  for (var i = 1; i < T; i++, pi++) {
    p0 = p;
    t0 = t;
    p = points[pi];
    t = tangents[i];
    paths.push(["M" + p0.left + "," + p0.top, 
                "C" + (p0.left + t0.x) + "," + (p0.top + t0.y) + "," + 
                      (p.left  - t.x ) + "," + (p.top  -  t.y) + "," + 
                       p.left + "," + p.top]);
  }

  if (quad) {
    var lp = points[pi];
    paths.push(["M" + p.left + "," + p.top,  
                "Q" + (p.left  + t.x * 2 / 3) + ","  + (p.top + t.y * 2 / 3) + "," + 
                       lp.left + "," + lp.top]);
  }

  return paths;
};

/**
 * @private Computes the tangents for the given points needed for cardinal
 * spline interpolation. Returns an array of tangent vectors. Note: that for n
 * points only the n-2 well defined tangents are returned.
 *
 * @param points the array of points.
 * @param tension the tension of hte cardinal spline.
 */
pv.SvgScene.cardinalTangents = function(points, tension, from, to) {
  var L;
  if(from == null){
    L = points.length;
    from = 0;
    to   = L -1;
  } else {
    L = to - from + 1;
  }
  
  var tangents = [],
      a = (1 - tension) / 2,
      p0 = points[from],
      p1 = points[from + 1],
      p2 = points[from + 2];

  for (var i = from + 3 ; i <= to ; i++) {
    tangents.push({x: a * (p2.left - p0.left), y: a * (p2.top - p0.top)});
    p0 = p1;
    p1 = p2;
    p2 = points[i];
  }

  tangents.push({x: a * (p2.left - p0.left), y: a * (p2.top - p0.top)});
  
  return tangents;
};

/**
 * @private Interpolates the given points using cardinal spline interpolation.
 * Returns an SVG path without the leading M instruction to allow path
 * appending.
 *
 * @param points the array of points.
 * @param tension the tension of the cardinal spline.
 */
pv.SvgScene.curveCardinal = function(points, tension, from, to) {
  var L;
  if(from == null){
    L = points.length;
    from = 0;
    to   = L -1;
  } else {
    L = to - from + 1;
  }
  
  if (L <= 2) return "";
  return this.curveHermite(points, this.cardinalTangents(points, tension, from, to), from, to);
};

/**
 * @private Interpolates the given points using cardinal spline interpolation.
 * Returns an array of path strings.
 *
 * @param points the array of points.
 * @param tension the tension of the cardinal spline.
 */
pv.SvgScene.curveCardinalSegments = function(points, tension, from, to) {
  var L;
  if(from == null){
    L = points.length;
    from = 0;
    to   = L -1;
  } else {
    L = to - from + 1;
  }
  
  if (L <= 2) return ""; // BUG?
  return this.curveHermiteSegments(points, this.cardinalTangents(points, tension, from, to), from, to);
};

/**
 * @private Interpolates the given points using Fritsch-Carlson Monotone cubic
 * Hermite interpolation. Returns an array of tangent vectors.
 *
 * @param points the array of points.
 */
pv.SvgScene.monotoneTangents = function(points, from, to) {
  var L;
  if(from == null){
    L = points.length;
    from = 0;
    to   = L -1;
  } else {
    L = to - from + 1;
  }
  
  var tangents = [],
      d = [],
      m = [],
      dx = [],
      k = 0,
      j;

  /* Compute the slopes of the secant lines between successive points. */
  for (k = 0 ; k < L - 1 ; k++) {
    j = from + k;
    var den = points[j+1].left - points[j].left;
    d[k] = Math.abs(den) <= 1e-12 ? 0 : (points[j+1].top - points[j].top)/den;
  }

  /* Initialize the tangents at every point as the average of the secants. */
  m[0] = d[0];
  dx[0] = points[from + 1].left - points[from].left;
  for (k = 1, j = from + k ; k < L - 1 ; k++, j++) {
    m[k]  = (d[k-1]+d[k])/2;
    dx[k] = (points[j+1].left - points[j-1].left)/2;
  }
  m[k]  = d[k-1];
  dx[k] = (points[j].left - points[j-1].left);

  /* Step 3. Very important, step 3. Yep. Wouldn't miss it. */
  for (k = 0; k < L - 1; k++) {
    if (d[k] == 0) {
      m[ k ] = 0;
      m[k+1] = 0;
    }
  }

  /* Step 4 + 5. Out of 5 or more steps. */
  for (k = 0; k < L - 1; k++) {
    if ((Math.abs(m[k]) < 1e-5) || (Math.abs(m[k+1]) < 1e-5)) continue;
    var ak = m[k] / d[k],
        bk = m[k + 1] / d[k],
        s = ak * ak + bk * bk; // monotone constant (?)
    if (s > 9) {
      var tk = 3 / Math.sqrt(s);
      m[k] = tk * ak * d[k];
      m[k + 1] = tk * bk * d[k];
    }
  }

  var len;
  for (var i = 0 ; i < L ; i++) {
    len = 1 + m[i] * m[i]; // pv.vector(1, m[i]).norm().times(dx[i]/3)
    tangents.push({x: dx[i] / 3 / len, y: m[i] * dx[i] / 3 / len});
  }

  return tangents;
};

/**
 * @private Interpolates the given points using Fritsch-Carlson Monotone cubic
 * Hermite interpolation. Returns an SVG path without the leading M instruction
 * to allow path appending.
 *
 * @param points the array of points.
 */
pv.SvgScene.curveMonotone = function(points, from, to) {
  var L;
  if(from == null){
    L = points.length;
    from = 0;
    to   = L -1;
  } else {
    L = to - from + 1;
  }
  
  if (L <= 2) return "";
  return this.curveHermite(points, this.monotoneTangents(points, from, to), from, to);
};

/**
 * @private Interpolates the given points using Fritsch-Carlson Monotone cubic
 * Hermite interpolation.
 * Returns an array of path strings.
 *
 * @param points the array of points.
 */
pv.SvgScene.curveMonotoneSegments = function(points, from, to) {
  var L;
  if(from == null){
    L = points.length;
    from = 0;
    to   = L -1;
  } else {
    L = to - from + 1;
  }
  
  if (L <= 2) return ""; // BUG?
  return this.curveHermiteSegments(points, this.monotoneTangents(points, from, to), from, to);
};
pv.SvgScene.area = function(scenes) {
  var e = scenes.$g.firstChild;

  var count = scenes.length;
  if (!count){
    return e;
  }
  
  var s = scenes[0];
  
  /* smart segmentation */
  if (s.segmented === 'smart') {
    return this.areaSegmentedSmart(e, scenes);
  }
  
  /* full segmented */
  if (s.segmented) {
    return this.areaSegmentedFull(e, scenes);
  }
  
  return this.areaFixed(e, scenes, 0, count - 1, /*addEvents*/ true);
};

pv.SvgScene.areaFixed = function(elm, scenes, from, to, addEvents) {
  var count = to - from + 1;
  
  // count > 0
  
  if(count === 1){
    return this.lineAreaDot(elm, scenes, from);
  }
  
  var s = scenes[from];
  if (!s.visible) {
    return elm;
  }
  
  /* fill & stroke */
  
  var fill   = s.fillStyle;
  var stroke = s.strokeStyle;
  
  if (!fill.opacity && !stroke.opacity) {
    return elm;
  }
  
  this.addFillStyleDefinition(scenes, fill);
  this.addFillStyleDefinition(scenes, stroke);
  
  var isInterpBasis      = false;
  var isInterpCardinal   = false;
  var isInterpMonotone   = false;
  var isInterpStepAfter  = false;
  var isInterpStepBefore = false;
  switch(s.interpolate){
    case 'basis':       isInterpBasis      = true; break;
    case 'cardinal':    isInterpCardinal   = true; break;
    case 'monotone':    isInterpMonotone   = true; break;
    case 'step-after':  isInterpStepAfter  = true; break;
    case 'step-before': isInterpStepBefore = true; break;
  }
  
  var isInterpBasisCardinalOrMonotone = isInterpBasis || isInterpCardinal || isInterpMonotone;
  
  /* points */
  var d = [], si, sj;
  for (var i = from ; i <= to ; i++) {
    si = scenes[i];
    if (!si.width && !si.height) {
      continue;
    }
    
    for (var j = i + 1; j <= to ; j++) {
      sj = scenes[j];
      if (!sj.width && !sj.height) {
        break;
      }
    }
    
    if ((i > from) && !isInterpStepAfter){ 
      i--;
    }
    
    if ((j <= to) && !isInterpStepBefore) {
      j++;
    }
    
    var fun = isInterpBasisCardinalOrMonotone && (j - i > 2) ? 
              this.areaPathCurve : 
              this.areaPathStraight;
    
    d.push( fun.call(this, scenes, i, j - 1, s) );
    i = j - 1;
  }
  
  if (!d.length) {
    return elm;
  }

  var sop = stroke.opacity;
  elm = this.expect(elm, "path", scenes, from, {
      "shape-rendering":   s.antialias ? null : "crispEdges",
      "pointer-events":    addEvents ? s.events : 'none',
      "cursor":            s.cursor,
      "d":                 "M" + d.join("ZM") + "Z",
      "fill":              fill.color,
      "fill-opacity":      fill.opacity || null,
      "stroke":            stroke.color,
      "stroke-opacity":    sop || null,
      "stroke-width":      sop ? (s.lineWidth / this.scale) : null,
      "stroke-linecap":    s.lineCap,
      "stroke-linejoin":   s.lineJoin,
      "stroke-miterlimit": s.strokeMiterLimit,
      "stroke-dasharray":  sop ? this.parseDasharray(s) : null
    });

  if(s.svg) this.setAttributes(elm, s.svg);
  if(s.css) this.setStyle(elm, s.css);

  return this.append(elm, scenes, from);
};

pv.SvgScene.areaSegmentedSmart = function(elm, scenes) {
  if(!elm){
    elm = scenes.$g.appendChild(this.create("g"));
  }
  var gg = elm;
  
  // Create colored/no-events group
  elm = gg.firstChild;
  
  var g1 = this.expect(elm, "g", scenes, 0, {'pointer-events': 'none'});
  if (!g1.parentNode) {
      gg.appendChild(g1);
  }
  
  // Set current default parent
  scenes.$g = g1;
  elm = g1.firstChild;

  var eventsSegments = scenes.mark.$hasHandlers ? [] : null;
  
  /* Visual only */
  // Iterate *visible* scene segments
  elm = this.eachLineAreaSegment(elm, scenes, function(elm, scenes, from, to){
    
    // Paths depend only on visibility
    var segment = this.areaSegmentPaths(scenes, from, to);
    var pathsT = segment.top;
    var pathsB = segment.bottom;
    var fromp = from;
    
    // Events segments also, depend only on visibility
    if(eventsSegments){
      eventsSegments.push(segment);
    }
    
    // Split this visual scenes segment, 
    // on key properties changes
    var options = {
        breakOnKeyChange: true,
        from:  from,
        to:    to
      };
    
    return this.eachLineAreaSegment(elm, scenes, options, function(elm, scenes, from, to){
      
      var s1 = scenes[from];
      
      var fill   = s1.fillStyle;
      var stroke = s1.strokeStyle;
      
      this.addFillStyleDefinition(scenes, fill);
      this.addFillStyleDefinition(scenes, stroke);
      
      if(from === to){
        // Visual and events
        return this.lineAreaDotAlone(elm, scenes, from);
      }
      
      var d = this.areaJoinPaths(pathsT, pathsB, from - fromp, to - fromp - 1); // N - 1 paths connect N points

      var sop = stroke.opacity;
      var attrs = {
        'shape-rendering':   s1.antialias ? null : 'crispEdges',
        'pointer-events':    'none',
        'cursor':            s1.cursor,
        'd':                 d,
        'fill':              fill.color,
        'fill-opacity':      fill.opacity || null,
        'stroke':            stroke.color,
        'stroke-opacity':    sop || null,
        'stroke-width':      sop ? (s1.lineWidth / this.scale) : null,
        'stroke-linecap':    s1.lineCap,
        'stroke-linejoin':   s1.lineJoin,
        'stroke-miterlimit': s1.strokeMiterLimit,
        'stroke-dasharray':  sop ? this.parseDasharray(s1) : null
      };
      
      elm = this.expect(elm, 'path', scenes, from, attrs, s1.css);

      return this.append(elm, scenes, from);
    });
  });

  // Remove any excess segments from previous render
  this.removeSiblings(elm);

  /* Events */
  var g2;
  if(eventsSegments){
    // Create colored/no-events group
    elm = g1.nextSibling;
    g2 = this.expect(elm, "g", scenes, 0);
    if (!g2.parentNode) {
        gg.appendChild(g2);
    }

    // Set current default parent
    scenes.$g = g2;
    elm = g2.firstChild;

    eventsSegments.forEach(function(segment){
      var from  = segment.from;
      var pathsT = segment.top;
      var pathsB = segment.bottom;
      var P = pathsT.length;
      
      var attrsBase = {
          'shape-rendering': 'crispEdges',
          'fill':            'rgb(127,127,127)',
          'fill-opacity':    0.005, // VML requires this much to fire events
          'stroke':          null
        };
      
      pathsT.forEach(function(pathT, j){
        var i = from + j;
        var s = scenes[i];
        
        var events = s.events;
        if(events && events !== "none"){
          var pathB = pathsB[P - j - 1];
          
          var attrs = Object.create(attrsBase);
          attrs['pointer-events'] = events;
          attrs.cursor = s.cursor;
          attrs.d = pathT.join("") + "L" + pathB[0].substr(1) + pathB[1] + "Z";
          
          elm = this.expect(elm, 'path', scenes, i, attrs);
          
          elm = this.append(elm, scenes, i);
        }
      }, this); 
    }, this);

    // Remove any excess paths from previous render
    this.removeSiblings(elm);
  }
  
  // Restore initial current parent
  scenes.$g = gg;

  return (g2 || g1).nextSibling;
};

pv.SvgScene.areaSegmentPaths = function(scenes, from, to) {
  return this.areaSegmentCurvePaths   (scenes, from, to) ||
         this.areaSegmentStraightPaths(scenes, from, to);
};

pv.SvgScene.areaSegmentCurvePaths = function(scenes, from, to){
  var count = to - from + 1;
  
  // count > 0
  
  var s = scenes[from];
  
  // Interpolated paths for scenes 0 to count-1
  var isBasis    = s.interpolate === "basis";
  var isCardinal = !isBasis && s.interpolate === "cardinal";
  if (isBasis || isCardinal || s.interpolate == "monotone") {
    var pointsT = [];
    var pointsB = [];
    for (var i = 0 ; i < count ; i++) {
      var si = scenes[from + i]; // from -> to
      var sj = scenes[to   - i]; // to -> from
      
      pointsT.push(si);
      pointsB.push({left: sj.left + sj.width, top: sj.top + sj.height});
    }
    
    var pathsT, pathsB;
    if (isBasis) {
      pathsT = this.curveBasisSegments(pointsT);
      pathsB = this.curveBasisSegments(pointsB);
    } else if (isCardinal) {
      pathsT = this.curveCardinalSegments(pointsT, s.tension);
      pathsB = this.curveCardinalSegments(pointsB, s.tension);
    } else { // monotone
      pathsT = this.curveMonotoneSegments(pointsT);
      pathsB = this.curveMonotoneSegments(pointsB);
    }
    
    if(pathsT || pathsT.length){
      return {
        from:   from,
        top:    pathsT, 
        bottom: pathsB
      };
    }
  }
};

/** @private Computes the straight path for the range [i, j]. */
pv.SvgScene.areaSegmentStraightPaths = function(scenes, i, j){
  var pathsT = [];
  var pathsB = [];
  
  for (var k = j, m = i ; i < k ; i++, j--) {
    // i - top    line index, from i to j
    // j - bottom line index, from j to i
    var si = scenes[i],
        sj = scenes[j],
        pi = ['M' + si.left + "," + si.top],
        pj = ['M' + (sj.left + sj.width) + "," + (sj.top + sj.height)];

    /* interpolate */
    var sk = scenes[i + 1], // top    line
        sl = scenes[j - 1]; // bottom line
    switch(si.interpolate){
      case 'step-before':
        pi.push("V" + sk.top + "H" + sk.left);
        //pj.push("H" + (sl.left + sl.width));
        break;
      
      case 'step-after':
        pi.push("H" + sk.left + "V" + sk.top);
        //pj.push("V" + (sl.top + sl.height));
        break;
        
     default: // linear
       pi.push("L" +  sk.left + "," + sk.top);
    }
    
    pj.push("L" + (sl.left + sl.width) + "," + (sl.top + sl.height));
    
    pathsT.push(pi);
    pathsB.push(pj);
  }
  
  return {
    from:   m,
    top:    pathsT, 
    bottom: pathsB
  };
};

pv.SvgScene.areaJoinPaths = function(pathsT, pathsB, i, j){
  /*             
   *  Scenes ->  0 ...             N-1
   *  pathsT ->  0 1 2 3 4 5 6 7 8 9
   *             9 8 7 6 5 4 3 2 1 0 <- pathsB
   *                   |   |
   *                   i<->j
   *                   
   */
  var fullPathT = "";
  var fullPathB = "";
  
  var N = pathsT.length;
  
  for (var k = i, l = N - 1 - j ; k <= j ; k++, l++) {
    var pathT = pathsT[k];
    var pathB = pathsB[l];
    
    var dT;
    var dB;
    if(k === i){
      // Add moveTo and lineTo of first (top) part
      dT = pathT.join("");
      
      // Join top and bottom parts with a line to the bottom right point
      dB = "L" + pathB[0].substr(1) + pathB[1]; 
    } else {
      // Add lineTo only, on following parts
      dT = pathT[1];
      dB = pathB[1];
    }
    
    fullPathT += dT;
    fullPathB += dB;
  }
  
  // Close the path with Z
  return fullPathT + fullPathB + "Z";
};

pv.SvgScene.areaSegmentedFull = function(e, scenes) {
  // Curve interpolations paths for each scene
  var count = scenes.length;
  
  var pathsT, pathsB;
  var result = this.areaSegmentCurvePaths(scenes, 0, count - 1);
  if(result){
    pathsT = result.top;
    pathsB = result.bottom;
  }
  
  // -------------
  
  var s = scenes[0];
  for (var i = 0 ; i < count - 1 ; i++) {
    var s1 = scenes[i];
    var s2 = scenes[i + 1];
    
    /* visible */
    if (!s1.visible || !s2.visible) {
      continue;
    }
    
    var fill   = s1.fillStyle;
    var stroke = s1.strokeStyle;
    if (!fill.opacity && !stroke.opacity) {
      continue;
    }
    
    var d;
    if (pathsT) {
      var pathT = pathsT[i].join(""),
          pathB = "L" + pathsB[count - i - 2].join("").substr(1);

      d = pathT + pathB + "Z";
    } else {
      /* interpolate */
      var si = s1;
      var sj = s2;
      switch (s1.interpolate) {
        case "step-before": si = s2; break;
        case "step-after":  sj = s1; break;
      }

      /* path */
      d = "M" + s1.left + "," + si.top
        + "L" + s2.left + "," + sj.top
        + "L" + (s2.left + s2.width) + "," + (sj.top + sj.height)
        + "L" + (s1.left + s1.width) + "," + (si.top + si.height)
        + "Z";
    }

    var attrs = {
        "shape-rendering": s1.antialias ? null : "crispEdges",
        "pointer-events":  s1.events,
        "cursor":          s1.cursor,
        "d":               d,
        "fill":            fill.color,
        "fill-opacity":    fill.opacity || null,
        "stroke":          stroke.color,
        "stroke-opacity":  stroke.opacity || null,
        "stroke-width":    stroke.opacity ? s1.lineWidth / this.scale : null
      };
    
    e = this.expect(e, "path", scenes, i, attrs);

    if(s1.svg) this.setAttributes(e, s1.svg);
    if(s1.css) this.setStyle(e, s1.css);

    e = this.append(e, scenes, i);
  }
  return e;
};


/** @private Computes the straight path for the range [i, j]. */
pv.SvgScene.areaPathStraight = function(scenes, i, j, s){
  var pointsT = [];
  var pointsB = [];
  
  for (var k = j ; i <= k ; i++, j--) {
    // i - top    line index, from i to j
    // j - bottom line index, from j to i
    var si = scenes[i],
        sj = scenes[j],
        pi = si.left + "," + si.top,
        pj = (sj.left + sj.width) + "," + (sj.top + sj.height);

    /* interpolate */
    if (i < k) {
      var sk = scenes[i + 1], // top    line 
          sl = scenes[j - 1]; // bottom line
      switch(s.interpolate){
        case 'step-before':
          pi += "V" + sk.top;
          pj += "H" + (sl.left + sl.width);
          break;
        case 'step-after':
          pi += "H" + sk.left;
          pj += "V" + (sl.top + sl.height);
          break;
      }
    }

    pointsT.push(pi);
    pointsB.push(pj);
  }
  
  return pointsT.concat(pointsB).join("L");
};

/** @private Computes the curved path for the range [i, j]. */
pv.SvgScene.areaPathCurve = function(scenes, i, j, s){
  var pointsT = [];
  var pointsB = []; 
  var pathT, pathB;

  for (var k = j; i <= k; i++, j--) {
    var sj = scenes[j];
    pointsT.push(scenes[i]);
    pointsB.push({left: sj.left + sj.width, top: sj.top + sj.height});
  }
  
  switch(s.interpolate){
    case 'basis':
      pathT = this.curveBasis(pointsT);
      pathB = this.curveBasis(pointsB);
      break;
      
    case 'cardinal':
      pathT = this.curveCardinal(pointsT, s.tension);
      pathB = this.curveCardinal(pointsB, s.tension);
      break;
      
    default: // monotone
      pathT  = this.curveMonotone(pointsT);
      pathB = this.curveMonotone(pointsB);
  }

  return pointsT[0].left + "," + pointsT[0].top + 
         pathT + 
         "L" + 
         pointsB[0].left + "," + pointsB[0].top + 
         pathB;
};
pv.SvgScene.minBarWidth = 1;
pv.SvgScene.minBarHeight = 1;
pv.SvgScene.minBarLineWidth = 0.2;

pv.SvgScene.bar = function(scenes) {
  var e = scenes.$g.firstChild;

  for (var i = 0; i < scenes.length; i++) {
    var s = scenes[i];

    /* visible */
    if (!s.visible || Math.abs(s.width) <= 1E-10 || Math.abs(s.height) <= 1E-10) continue;
    if(s.width < this.minBarWidth){
        s.width = this.minBarWidth;
    }
    
    if(s.height < this.minBarHeight){
        s.height = this.minBarHeight;
    }
    
    var fill = s.fillStyle, stroke = s.strokeStyle;
    if (!fill.opacity && !stroke.opacity) continue;

    this.addFillStyleDefinition(scenes, fill);
    this.addFillStyleDefinition(scenes, stroke);
    
    var lineWidth;
    if(stroke.opacity){
        lineWidth = s.lineWidth;
        if(lineWidth < 1e-10){
            lineWidth = 0;
        } else {
            lineWidth = Math.max(this.minBarLineWidth, lineWidth / this.scale);
        }
    } else {
        lineWidth = null;
    }
    
    e = this.expect(e, "rect", scenes, i, {
        "shape-rendering": s.antialias ? null : "crispEdges",
        "pointer-events": s.events,
        "cursor": s.cursor,
        "x": s.left,
        "y": s.top,
        "width": Math.max(1E-10, s.width),
        "height": Math.max(1E-10, s.height),
        "fill": fill.color,
        "fill-opacity": fill.opacity || null,
        "stroke": stroke.color,
        "stroke-opacity": stroke.opacity || null,
        "stroke-width": lineWidth,
        "stroke-linecap":    s.lineCap,
        "stroke-dasharray":  stroke.opacity ? this.parseDasharray(s) : null
      });

    if(s.svg) this.setAttributes(e, s.svg);
    if(s.css) this.setStyle(e, s.css);

    e = this.append(e, scenes, i);
  }
  return e;
};
pv.SvgScene.dot = function(scenes) {
  var e = scenes.$g.firstChild;
  
  for (var i = 0; i < scenes.length; i++) {
    var s = scenes[i];

    /* visible */
    if (!s.visible) continue;
    var fill = s.fillStyle, stroke = s.strokeStyle;
    if (!fill.opacity && !stroke.opacity) continue;

    this.addFillStyleDefinition(scenes, fill);
    this.addFillStyleDefinition(scenes, stroke);
    
    /* points */
    var radius = s.shapeRadius, path = null;
    switch (s.shape) {
      case "cross": {
        path = "M" + -radius + "," + -radius
            + "L" + radius + "," + radius
            + "M" + radius + "," + -radius
            + "L" + -radius + "," + radius;
        break;
      }
      case "triangle": {
        var h = radius, w = radius * 1.1547; // 2 / Math.sqrt(3)
        path = "M0," + h
            + "L" + w +"," + -h
            + " " + -w + "," + -h
            + "Z";
        break;
      }
      case "diamond": {
        radius *= Math.SQRT2;
        path = "M0," + -radius
            + "L" + radius + ",0"
            + " 0," + radius
            + " " + -radius + ",0"
            + "Z";
        break;
      }
      case "square": {
        path = "M" + -radius + "," + -radius
            + "L" + radius + "," + -radius
            + " " + radius + "," + radius
            + " " + -radius + "," + radius
            + "Z";
        break;
      }
      case "tick": {
        path = "M0,0L0," + -s.shapeSize;
        break;
      }
      case "bar": {
        path = "M0," + (s.shapeSize / 2) + "L0," + -(s.shapeSize / 2);
        break;
      }
    }

    /* Use <circle> for circles, <path> for everything else. */
    var svg = {
      "shape-rendering": s.antialias ? null : "crispEdges",
      "pointer-events": s.events,
      "cursor": s.cursor,
      "fill": fill.color,
      "fill-opacity": fill.opacity || null,
      "stroke": stroke.color,
      "stroke-opacity": stroke.opacity || null,
      "stroke-width": stroke.opacity ? s.lineWidth / this.scale : null,
      "stroke-linecap": s.lineCap,
      "stroke-dasharray":  stroke.opacity ? this.parseDasharray(s) : null
    };
    if (path) {
      svg.transform = "translate(" + s.left + "," + s.top + ")";
      if (s.shapeAngle) svg.transform += " rotate(" + 180 * s.shapeAngle / Math.PI + ")";
      svg.d = path;
      e = this.expect(e, "path", scenes, i, svg);
    } else {
      svg.cx = s.left;
      svg.cy = s.top;
      svg.r = radius;
      e = this.expect(e, "circle", scenes, i, svg);
    }

    if(s.svg) this.setAttributes(e, s.svg);
    if(s.css) this.setStyle(e, s.css);

    e = this.append(e, scenes, i);
  }
  return e;
};
pv.SvgScene.image = function(scenes) {
  var e = scenes.$g.firstChild;
  for (var i = 0; i < scenes.length; i++) {
    var s = scenes[i];

    /* visible */
    if (!s.visible) continue;

    /* fill */
    e = this.fill(e, scenes, i);

    /* image */
    if (s.image) {
      e = this.expect(e, "foreignObject", scenes, i, {
          "cursor": s.cursor,
          "x": s.left,
          "y": s.top,
          "width": s.width,
          "height": s.height
        });
      if(s.svg) this.setAttributes(e, s.svg);
      if(s.css) this.setStyle(e, s.css);
      var c = e.firstChild || e.appendChild(document.createElementNS(this.xhtml, "canvas"));
      c.$scene = {scenes:scenes, index:i};
      c.style.width = s.width;
      c.style.height = s.height;
      c.width = s.imageWidth;
      c.height = s.imageHeight;
      c.getContext("2d").putImageData(s.image, 0, 0);
    } else {
      e = this.expect(e, "image", scenes, i, {
          "preserveAspectRatio": "none",
          "cursor": s.cursor,
          "x": s.left,
          "y": s.top,
          "width": s.width,
          "height": s.height
        });

      if(s.svg) this.setAttributes(e, s.svg);
      if(s.css) this.setStyle(e, s.css);

      e.setAttributeNS(this.xlink, "xlink:href", s.url);
    }
    e = this.append(e, scenes, i);

    /* stroke */
    e = this.stroke(e, scenes, i);
  }
  return e;
};
pv.SvgScene.label = function(scenes) {
  var e = scenes.$g.firstChild;
  for (var i = 0; i < scenes.length; i++) {
    var s = scenes[i];

    /* visible */
    if (!s.visible) continue;
    var fill = s.textStyle;
    if (!fill.opacity || !s.text) continue;

    /* text-baseline, text-align */
    var x = 0, y = 0, dy = 0, anchor = "start";
    switch (s.textBaseline) {
      case "middle":
          if (pv.renderer() == 'svgweb')
              y = 3; // flex doesn't seem to use dy, so this moves it to be 'about right'
          else
              dy = ".35em";
          break;
      case "top":
          if (pv.renderer() == 'svgweb') {
              y = 9 + s.textMargin; // flex doesn't seem to use dy, so this moves it to be 'about right'
          } else {
              dy = ".71em"; y = s.textMargin;
          }
        break;
      case "bottom": y = "-" + s.textMargin; break;
    }
    switch (s.textAlign) {
      case "right": anchor = "end"; x = "-" + s.textMargin; break;
      case "center": anchor = "middle"; break;
      case "left": x = s.textMargin; break;
    }

    e = this.expect(e, "text", scenes, i, {
        "pointer-events": s.events,
        "cursor": s.cursor,
        "x": x,
        "y": y,
        "dy": dy,
        "transform": "translate(" + s.left + "," + s.top + ")"
            + (s.textAngle ? " rotate(" + 180 * s.textAngle / Math.PI + ")" : "")
            + (this.scale != 1 ? " scale(" + 1 / this.scale + ")" : ""),
        "fill": fill.color,
        "fill-opacity": fill.opacity || null,
        "text-anchor": anchor
      }, {
        "font": s.font,
        "text-shadow": s.textShadow,
        "text-decoration": s.textDecoration
      });

    if(s.svg) this.setAttributes(e, s.svg);
    if(s.css) this.setStyle(e, s.css);

    if (e.firstChild) e.firstChild.nodeValue = s.text;
    else {
        if (pv.renderer() == "svgweb") { // SVGWeb needs an extra 'true' to create SVG text nodes properly in IE.
            e.appendChild(document.createTextNode(s.text, true));
        } else {
            e.appendChild(document.createTextNode(s.text));
        }
    }

    e = this.append(e, scenes, i);
  }
  return e;
};
/* not segmented
 * <g> <-> scenes.$g
 *    <path ... /> only segment
 * </g>
 *
 * segmented full
 * <g> <-> scenes.$g
 *    <path ... /> instance 0
 *    <path ... /> instance 1
 *    ...
 * </g>
 *
 * segmented smart
 * <g> <-> scenes.$g
 *    <g> colored, no events
 *        <path /> segment 0
 *        <path /> segment 1
 *        ...
 *    </g>
 *    <g> transparent, fully segmented, events
 *        <path /> instance 0
 *        <path /> instance 1
 *        ...
 *    </g>
 * </g>
 */
pv.SvgScene.line = function(scenes) {
  var e = scenes.$g.firstChild;
  
  var count = scenes.length;
  if (!count){
    return e;
  }
  
  var s = scenes[0];
  
  /* smart segmentation */
  if (s.segmented === 'smart') {
    return this.lineSegmentedSmart(e, scenes);
  }
  
  if (count < 2) {
    return e;
  }
  
  /* full segmentation */
  if (s.segmented) {
    return this.lineSegmentedFull(e, scenes);
  }

  return this.lineFixed(e, scenes);
};

pv.SvgScene.lineFixed = function(elm, scenes) {
  
  var count = scenes.length; 
  
  // count > 0
  
  if(count === 1){
    return this.lineAreaDotAlone(elm, scenes, 0);
  }
  
  var s = scenes[0];
  if (!s.visible) {
    return elm;
  }
  
  /* fill & stroke */
  
  var fill   = s.fillStyle;
  var stroke = s.strokeStyle;
  
  if (!fill.opacity && !stroke.opacity) {
    return elm;
  }
  
  this.addFillStyleDefinition(scenes, fill);
  this.addFillStyleDefinition(scenes, stroke);
  
  /* points */
  var d = "M" + s.left + "," + s.top;
  
  var curveInterpolated = (count > 2);
  if(curveInterpolated) {
    switch(s.interpolate) {
      case "basis":    d += this.curveBasis   (scenes); break;
      case "cardinal": d += this.curveCardinal(scenes, s.tension); break;
      case "monotone": d += this.curveMonotone(scenes); break;
      default: curveInterpolated = false;
    }
  }
  
  if(!curveInterpolated){
    for (var i = 1 ; i < count ; i++) {
      d += this.lineSegmentPath(scenes[i - 1], scenes[i]);
    }
  }
  
  var sop = stroke.opacity;
  var attrs = {
    'shape-rendering':   s.antialias ? null : 'crispEdges',
    'pointer-events':    s.events,
    'cursor':            s.cursor,
    'd':                 d,
    'fill':              fill.color,
    'fill-opacity':      fill.opacity || null,
    'stroke':            stroke.color,
    'stroke-opacity':    sop || null,
    'stroke-width':      sop ? (s.lineWidth / this.scale) : null,
    'stroke-linecap':    s.lineCap,
    'stroke-linejoin':   s.lineJoin,
    'stroke-miterlimit': s.strokeMiterLimit,
    'stroke-dasharray':  sop ? this.parseDasharray(s) : null
  };
  
  elm = this.expect(elm, 'path', scenes, 0, attrs, s.css);

  if(s.svg) this.setAttributes(elm, s.svg);
  
  return this.append(elm, scenes, 0);
};

pv.SvgScene.lineSegmentedSmart = function(elm, scenes) {
  /*
   * <g> <-> scenes.$g <-> elm --> gg
   *    <g> colored, no events
   *        <path /> segment 0
   *        <path /> segment 1
   *        ...
   *    </g>
   *    <g> transparent, fully segmented, events (wen existent)
   *        <path /> instance 0
   *        <path /> instance 1
   *        ...
   *    </g>
   * </g>
   */

  if(!elm){
    elm = scenes.$g.appendChild(this.create("g"));
  }
  
  var gg = elm;

  // Create colored/no-events group
  elm = gg.firstChild;
  
  var g1 = this.expect(elm, "g", scenes, 0, {'pointer-events': 'none'});
  if (!g1.parentNode) {
      gg.appendChild(g1);
  }

  // Set current default parent
  scenes.$g = g1;
  elm = g1.firstChild;
  
  var eventsSegments = scenes.mark.$hasHandlers ? [] : null;
  
  /* Visual only */
  // Iterate *visible* scene segments
  elm = this.eachLineAreaSegment(elm, scenes, function(elm, scenes, from, to){
    
    // Paths depend only on visibility
    var paths = this.lineSegmentPaths(scenes, from, to);
    var fromp = from;
    
    // Events segments also, depend only on visibility
    if(eventsSegments){
      eventsSegments.push({
        from:  from,
        paths: paths
      });
    }
    
    // Split this visual scenes segment, 
    // on key properties changes
    var options = {
        breakOnKeyChange: true,
        from:  from,
        to:    to
      };
    
    return this.eachLineAreaSegment(elm, scenes, options, function(elm, scenes, from, to){
      
      var s1 = scenes[from];
      
      var fill = s1.fillStyle;
      this.addFillStyleDefinition(scenes, fill);
      
      var stroke = s1.strokeStyle;
      this.addFillStyleDefinition(scenes, stroke);
      
      if(from === to){
        // Visual and events
        return this.lineAreaDotAlone(elm, scenes, from);
      }
      
      var d = this.lineJoinPaths(paths, from - fromp, to - fromp - 1); // N - 1 paths connect N points
      
      var sop = stroke.opacity;
      var attrs = {
        'shape-rendering':   s1.antialias ? null : 'crispEdges',
        'pointer-events':    'none',
        'cursor':            s1.cursor,
        'd':                 d,
        'fill':              fill.color,
        'fill-opacity':      fill.opacity || null,
        'stroke':            stroke.color,
        'stroke-opacity':    sop || null,
        'stroke-width':      sop ? (s1.lineWidth / this.scale) : null,
        'stroke-linecap':    s1.lineCap,
        'stroke-linejoin':   s1.lineJoin,
        'stroke-miterlimit': s1.strokeMiterLimit,
        'stroke-dasharray':  sop ? this.parseDasharray(s1) : null
      };
      
      elm = this.expect(elm, 'path', scenes, from, attrs, s1.css);

      return this.append(elm, scenes, from);
    });
  });

  // Remove any excess segments from previous render
  this.removeSiblings(elm);
  
  /* Events */
  var g2;
  if(eventsSegments){
    // Create colored/no-events group
    elm = g1.nextSibling;
    g2 = this.expect(elm, "g", scenes, 0);
    if (!g2.parentNode) {
        gg.appendChild(g2);
    }
   
    // Set current default parent
    scenes.$g = g2;
    elm = g2.firstChild;
    
    eventsSegments.forEach(function(segment){
      var from  = segment.from;
      var paths = segment.paths;
      
      var attrsBase = {
          'shape-rendering':   'crispEdges',
          'fill':              'rgb(127,127,127)',
          'fill-opacity':      0.005, // VML requires this much to fire events
          'stroke':            'rgb(127,127,127)',
          'stroke-opacity':    0.005, // VML idem
          'stroke-width':      10,
          'stroke-dasharray':  null
        };
      
      paths.forEach(function(path, j){
        var i = from + j;
        var s = scenes[i];
        
        var events = s.events;
        if(events && events !== 'none'){
          var attrs = Object.create(attrsBase);
          attrs['pointer-events'] = events;
          attrs.cursor = s.cursor;
          attrs.d = path.join('');
          
          elm = this.expect(elm, 'path', scenes, i, attrs);
          
          elm = this.append(elm, scenes, i);
        }
      }, this); 
    }, this);

    // Remove any excess paths from previous render
    this.removeSiblings(elm);
  }

  // Restore initial current parent
  scenes.$g = gg;
  
  return (g2 || g1).nextSibling;
};

pv.SvgScene.lineSegmentedFull = function(e, scenes) {
  var s = scenes[0];
  var paths;
  switch (s.interpolate) {
    case "basis":    paths = this.curveBasisSegments(scenes); break;
    case "cardinal": paths = this.curveCardinalSegments(scenes, s.tension); break;
    case "monotone": paths = this.curveMonotoneSegments(scenes); break;
  }

  for (var i = 0, n = scenes.length - 1; i < n; i++) {
    var s1 = scenes[i], s2 = scenes[i + 1];

    /* visible */
    if (!s1.visible || !s2.visible) continue;
    var stroke = s1.strokeStyle, fill = pv.FillStyle.transparent;
    if (!stroke.opacity) continue;

    /* interpolate */
    var d;
    if ((s1.interpolate == "linear") && (s1.lineJoin == "miter")) {
      fill = stroke;
      stroke = pv.FillStyle.transparent;
      d = this.pathJoin(scenes[i - 1], s1, s2, scenes[i + 2]);
    } else if(paths) {
      d = paths[i].join("");
    } else {
      d = "M" + s1.left + "," + s1.top + this.lineSegmentPath(s1, s2);
    }

    e = this.expect(e, "path", scenes, i, {
        "shape-rendering": s1.antialias ? null : "crispEdges",
        "pointer-events": s1.events,
        "cursor": s1.cursor,
        "d": d,
        "fill": fill.color,
        "fill-opacity": fill.opacity || null,
        "stroke": stroke.color,
        "stroke-opacity": stroke.opacity || null,
        "stroke-width": stroke.opacity ? s1.lineWidth / this.scale : null,
        "stroke-linejoin": s1.lineJoin
      });
    
    if(s1.svg) this.setAttributes(e, s1.svg);
    if(s1.css) this.setStyle(e, s1.css);

    e = this.append(e, scenes, i);
  }
  return e;
};

/** @private Returns the path segment for the specified points. */
pv.SvgScene.lineSegmentPath = function(s1, s2) {
  var l = 1; // sweep-flag
  switch (s1.interpolate) {
    case "polar-reverse":
      l = 0;
    case "polar": {
      var dx = s2.left - s1.left,
          dy = s2.top - s1.top,
          e = 1 - s1.eccentricity,
          r = Math.sqrt(dx * dx + dy * dy) / (2 * e);
      if ((e <= 0) || (e > 1)) break; // draw a straight line
      return "A" + r + "," + r + " 0 0," + l + " " + s2.left + "," + s2.top;
    }
    case "step-before": return "V" + s2.top + "H" + s2.left;
    case "step-after":  return "H" + s2.left + "V" + s2.top;
  }
  return "L" + s2.left + "," + s2.top;
};

pv.SvgScene.lineSegmentPaths = function(scenes, from, to) {
  var s = scenes[from];
  
  var paths;
  switch (s.interpolate) {
    case "basis":    paths = this.curveBasisSegments   (scenes, from, to); break;
    case "cardinal": paths = this.curveCardinalSegments(scenes, s.tension, from, to); break;
    case "monotone": paths = this.curveMonotoneSegments(scenes, from, to); break;
  }
  
  //"polar-reverse", "polar", "step-before", "step-after", and linear
  if(!paths || !paths.length){ // not curve interpolation or not enough points for it 
    paths = [];
    for (var i = from + 1 ; i <= to ; i++) {
      var s1 = scenes[i - 1];
      var s2 = scenes[i    ];
      paths.push(["M" + s1.left + "," + s1.top, this.lineSegmentPath(s1, s2)]);
    }
  }
  
  return paths;
};

/* 
  MITER / BEVEL JOIN calculation

  Normal line p1->p2 bounding box points  (a-b-c-d)

                    ^ w12 
  a-----------------|--------------b       ^
  |                 |              |       |
  p1           <----+p12           p2      | w1
  |                                |       |
  d--------------------------------c       v
  
  Points are added in the following order:
  d -> a -> b -> c
  
  Depending on the position of p0 in relation to the segment p1-p2,
  'a' may be the outer corner and 'd' the inner corner, 
  or the opposite:
  
  Ex1:
       outer side
       
         p1 ---- p2
       /   
     p0    inner side
     
     a is outer, d is inner
     
  Ex2:
      
     p0    inner side
       \
         p1 ---- p2
         
       outer side
       
     a is inner, d is outer
     
  =====================
  
    ^ v1
     \
      am
       *--a------ ... ----b
        \ |               |
          p1              p2
          |\              |
          d-*---- ... ----c
            dm\
               \
                v
                v1


  NOTE: 
  As yy points down, and because of the way Vector.perp() is written,
  perp() corresponds to rotating 90� clockwise.
  
  -----
  
  The miter (ratio) limit is
  the limit on the ratio of the miter length to the line width.
  
  The miter length is the distance between the 
  outer corner and the inner corner of the miter.
*/
pv.strokeMiterLimit = 4;

/** @private Returns the miter join path for the specified points. */
pv.SvgScene.pathJoin = function(s0, s1, s2, s3) {
  /*
   * P1-P2 is the current line segment. 
   * V is a vector that is perpendicular to the line segment, and has length lineWidth / 2. 
   * ABCD forms the initial bounding box of the line segment 
   * (i.e., the line segment if we were to do no joins).
   */
    var pts = [];
    var miterLimit, miterRatio, miterLength;
    
    var w1 = s1.lineWidth / this.scale;
    var p1 = pv.vector(s1.left, s1.top);
    var p2 = pv.vector(s2.left, s2.top);
    
    var p21 = p2.minus(p1);
    var v21 = p21.perp().norm();
    var w21 = v21.times(w1 / 2);
    
    var a = p1.plus (w21);
    var d = p1.minus(w21);
    
    var b = p2.plus (w21);
    var c = p2.minus(w21);
    
    // --------------------
    
    if(!s0 || !s0.visible){
        // Starting point
        pts.push(d, a);
    } else {
        var p0  = pv.vector(s0.left, s0.top);
        var p10 = p1.minus(p0);
        var v10 = p10.perp().norm(); // may point inwards or outwards
        
        // v1 points from p1 to the inner or outer corner.
        var v1 = v10.plus(v21).norm();
        
        // Miter Join
        // One is the outer corner, the other is the inner corner
        var am = this.lineIntersect(p1, v1, a, p21);
        var dm = this.lineIntersect(p1, v1, d, p21);
        
        // Check Miter Limit
        // The line width is taken as the average of the widths
        // of the p0-p1 segment and that of the p1-p2 segment.
        miterLength = am.minus(dm).length();
        var w0 = s0.lineWidth / this.scale;
        var w10avg = (w1 + w0) / 2;
        miterRatio = miterLength / w10avg;
        miterLimit = s1.strokeMiterLimit || pv.strokeMiterLimit;
        if(miterRatio <= miterLimit){
            // Accept the miter join
            pts.push(dm, am);
        } else {
            // Choose the bevel join
            // v1Outer is parallel to v1, but always points outwards
            var p12 = p21.times(-1);
            var v1Outer = p10.norm().plus(p12.norm()).norm();
            
            // The bevel intermediate point
            // Place it along v1Outer, at a distance w10avg/2 from p1.
            // If it were a circumference, it would have that radius.
            // The inner corner is am or dm.
            // The other corner is the original d or a.
            var bevel10 = p1.plus(v1Outer.times(w10avg / 2));
            if(v1Outer.dot(v21) >= 0){
                // a is outer, d is inner
                pts.push(dm, bevel10, a);
            } else {
                // d is outer, a is inner
                pts.push(d, bevel10, am);
            }
        }
    }
    
    // -------------------
    
    if(!s3 || !s3.visible){
        // Starting point
        pts.push(b, c);
    } else {
        var p3  = pv.vector(s3.left, s3.top);
        var p32 = p3.minus(p2);
        var v32 = p32.perp().norm();
        var v2  = v32.plus(v21).norm();
        
        // Miter Join
        var bm = this.lineIntersect(p2, v2, b, p21);
        var cm = this.lineIntersect(p2, v2, c, p21);
        
        miterLength = bm.minus(cm).length();
        var w3 = s3.lineWidth / this.scale;
        var w31avg = (w3 + w1) / 2;
        miterRatio = miterLength / w31avg;
        miterLimit = s2.strokeMiterLimit || pv.strokeMiterLimit;
        if(miterRatio <= miterLimit){
            // Accept the miter join
            pts.push(bm, cm);
        } else {
            // Choose a bevel join
            var p23 = p32.times(-1);
            var v2Outer = p21.norm().plus(p23.norm()).norm();
            var bevel31 = p2.plus(v2Outer.times(w31avg / 2));
            if(v2Outer.dot(v21) >= 0){
                // b is outer, c is inner
                pts.push(b, bevel31, cm);
            } else {
                // c is outer, b is inner
                pts.push(bm, bevel31, c);
            }
        }
    }
    
    // Render pts to svg path
    var pt = pts.shift();
    return "M" + pt.x + "," + pt.y + 
           "L" + pts.map(function(pt2){ return pt2.x + "," + pt2.y; })
                  .join(" ");
};

/** @private Line-line intersection, per Akenine-Moller 16.16.1. */
pv.SvgScene.lineIntersect = function(o1, d1, o2, d2) {
  return o1.plus(d1.times(o2.minus(o1).dot(d2.perp()) / d1.dot(d2.perp())));
};

/* Line & Area Commons */

pv.SvgScene.lineJoinPaths = function(paths, from, to) {
  // Curve-interpolated paths of each segment
  var d = paths[from].join(""); // Move And LineTo from the first step
  for (var i = from + 1 ; i <= to ; i++) {
    d += paths[i][1];  // LineTo of the following steps
  }
  
  return d;
};

/* Draws a single circle with a diameter equal to the line width, 
 * when neighbour scenes are invisible. 
 */
pv.SvgScene.lineAreaDotAlone = function(elm, scenes, i) {
  return elm;
  /*
  var s = scenes[i];
  var s2;
  if(i > 0){
    s2 = scenes[i-1];
    if(this.isSceneVisible(s2)){
      // Not alone
      return elm;
    }
  }
  
  var last = scenes.length - 1;
  if(i < last){
    s2 = scenes[i+1];
    if(this.isSceneVisible(s2)){
      // Not alone
      return elm;
    }
  }
  
  var style = s.strokeStyle;
  if(!style || !style.opacity){
    style = s.fillStyle;
  }
  var radius = Math.max(s.lineWidth  / 2, 1.5) / this.scale;
  
  var attrs = {
    'shape-rendering': s.antialias ? null : 'crispEdges',
    'pointer-events':  s.events,
    'cursor':          s.cursor,
    'fill':            style.color,
    'fill-opacity':    style.opacity || null,
    'stroke':          'none',
    'cx':              s.left,
    'cy':              s.top,
    'r':               radius
  };
  
  elm = this.expect(elm, "circle", scenes, i, attrs, s.css);
  
  if(s.svg) this.setAttributes(elm, s.svg);
  
  return this.append(elm, scenes, i);
  */
};

pv.SvgScene.eachLineAreaSegment = function(elm, scenes, keyArgs, lineAreaSegment) {
  
  if(typeof keyArgs === 'function'){
    lineAreaSegment = keyArgs;
    keyArgs = null;
  }
  
  // Besides breaking paths on visible, 
  // should they break on properties as well?
  var breakOnKeyChange = pv.get(keyArgs, 'breakOnKeyChange', false);
  var from = pv.get(keyArgs, 'from') || 0;
  var to   = pv.get(keyArgs, 'to', scenes.length - 1);
  
  var ki, kf;
  if(breakOnKeyChange){
      ki = [];
      kf = [];
  }
  
  var i = from;
  while(i <= to){
    
    // Find the INITIAL scene
    var si = scenes[i];
    if(!this.isSceneVisible(si)){
      i++;
      continue;
    }
    
    // Compute its line-area-key
    if(breakOnKeyChange){
      this.lineAreaSceneKey(si, ki);
    }
    
    // Find the FINAL scene
    // the "i" in which to start the next part
    var i2;
    var f = i;
    while(true){
      var f2 = f + 1;
      if(f2 > to){
        // No next scene
        // Connect i to f (possibly, i === f)
        // Continue with f + 1, to make it stop...
        i2 = f2;
        break;
      }
      
      var sf = scenes[f2];
      if(!this.isSceneVisible(sf)){  
        // f + 1 exists but is NOT strictly visible
        // Connect i to f (possibly, i === f)
        // Continue with f + 2
        i2 = f2 + 1;
        break;
      }
      
      // Accept f + 1 as final point
      // f > i
      f = f2;
      
      if(breakOnKeyChange){
        this.lineAreaSceneKey(sf, kf);
        if(!this.equalSceneKeys(ki, kf)){
          // Break path due to != path properties
          // Connect i to f
          // Continue with f
          i2 = f;
          break;
        }
      }
    }
  
    elm = lineAreaSegment.call(this, elm, scenes, i, f, keyArgs);
    
    // next part
    i = i2;
  }
  
  return elm;
};

pv.SvgScene.lineAreaSceneKey = function(s, k){
  k[0] = s.fillStyle.key;
  k[1] = s.strokeStyle.key;
  k[2] = s.lineWidth;
  k[3] = (s.strokeDasharray || 'none');
  k[4] = s.interpolate;
  return k;
};

pv.SvgScene.isSceneVisible = function(s){
  return s.visible && 
        (s.fillStyle.opacity > 0 || s.strokeStyle.opacity > 0);
};

pv.SvgScene.equalSceneKeys = function(ka, kb){
  for(var i = 0, K = ka.length ; i < K ; i++){
    if(ka[i] !== kb[i]){
      return false;
    }
  }
  return true;
};
pv.SvgScene.panel = function(scenes) {
  /* With clipping:
   * <g> scenes.$g -> g
   *     group for panel content
   *
   *     instance 0
   *     <g clip-path="url(#123)"> -> c -> g -> scenes.$g
   *        <clipPath id="123"> -> e
   *            <rect x="s.left" y="s.top" width="s.width" height="s.height" />
   *        </clipPath>
   *        <rect fill="" /> -> e
   *        <g>child 0 - childScenes $g</g>
   *        <g>child 1 - childScenes.$g</g>
   *        ...
   *        <rect stroke="" /> -> e
   *
   *        restore initial group
   *        scenes.$g <- g <- c.parentNode,
   *     </g>
   *
   *     instance 1
   *     
   * </g>
   *
   * Without clipping:
   * <g> -> g
   *     group for panel content
   *
   *     instance 0
   *     <rect fill="" /> -> e
   *     <g>child 0</g>
   *     <g>child 1</g>
   *     ...
   *     <rect stroke="" /> -> e
   *     
   *     instance 1
   *     <rect fill="" />
   *     ...
   * </g>
   */
  var g = scenes.$g,
      e = g && g.firstChild;
  
  var complete = false;
  for (var i = 0; i < scenes.length; i++) {
    var s = scenes[i];
    
    /* visible */
    if (!s.visible) continue;
    
    /* svg */
    if (!scenes.parent) {
      if(pv.renderer() !== "batik") { s.canvas.style.display = "inline-block"; }
      
      if (g && (g.parentNode != s.canvas)) {
        g = s.canvas.firstChild;
        e = g && g.firstChild;
      }
      
      if (!g) {
        g = this.create(pv.renderer() !== "batik" ? "svg":"g");
        g.setAttribute("font-size", "10px");
        g.setAttribute("font-family", "sans-serif");
        g.setAttribute("fill", "none");
        g.setAttribute("stroke", "none");
        g.setAttribute("stroke-width", 1.5);
        
        // Prevent selecting VML elements when dragging
        
        // Supported by IE10 SVG
        g.setAttribute("style", "-webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;");
        
        if (typeof g.onselectstart !== 'undefined') {
            // IE9 SVG
            g.setAttribute('unselectable', 'on');
            g.onselectstart = function() { return false; };
        }
        
        if (pv.renderer() === "svgweb") { // SVGWeb requires a separate mechanism for setting event listeners.
            // width/height can't be set on the fragment
            g.setAttribute("width", s.width + s.left + s.right);
            g.setAttribute("height", s.height + s.top + s.bottom);

            var frag = document.createDocumentFragment(true);

            g.addEventListener('SVGLoad', function() {
                /**
                 * This hack was based off a suggestion by Idearat <scott.shattuck@gmail.com>
                 * on the protovis mailing list to work around the SVGWeb
                 * SVGLoad event being called prior to the scene graph being
                 * completed, and causing errors when listeners executed. As
                 * described by him:
                 *
                        So I've been running into a consistent issue with protovis + svgweb
                        integration where I get an empty (white screen) as many folks have
                        previously reported.

                        The section of that code with the if (pv.renderer() == "svgweb") block
                        follows the advice for SVGWeb integration which says to a)
                        addEventListener('SVGLoad', ...) and to use svgweb.appendChild(). The
                        problem is that the svgweb.appendChild call immediately turns around
                        and invokes any event listeners on the newly appended nodes...and the
                        "frag" can still be empty at that point. This can be confirmed in a
                        debugger's stack trace.

                        This new version effectively says run the (now embedded in func)
                        handler logic immediately if complete, otherwise try again shortly
                        via setTimeout every 100ms until we've completed the scene graph.

                        I've run this through a number of graphs within a complex application
                        with PHP, JQuery, YUI and other libs in the mix and it consistently
                        draws the graphs with no more white/blank display.

                * Until a better solution comes along, lets use this.
                */
                var me = this;
                (function () {
                    if (complete) {
                        complete = false;
                        me.appendChild(frag);
                        for (var j = 0; j < pv.Scene.events.length; j++) {
                          me.addEventListener(pv.Scene.events[j], pv.SvgScene.dispatch, false);
                        }
                        scenes.$g = me;
                        scenes.$g.__ready = true;
                    } else {
                        setTimeout(arguments.callee, 10);
                    }
                })();

            }, false);

            svgweb.appendChild(g, s.canvas);
            g = frag;
        } else {
            for (var j = 0; j < this.events.length; j++) {
              g.addEventListener(this.events[j], this.dispatch, false);
            }
            g = s.canvas.appendChild(g);
            g.__ready = true;
        }
        
        // Create the global defs element
        g.$defs = g.appendChild(this.create("defs"));
        
        e = null;
      }
      
      if(e && e.tagName === 'defs') { e = e.nextSibling; }
      
      scenes.$g = g;
      if (g.__ready) {
        g.setAttribute("width",  s.width + s.left + s.right );
        g.setAttribute("height", s.height + s.top + s.bottom);
      }
    }

    /* clip (nest children) */
    if (s.overflow === "hidden") {
      var id = pv.id().toString(36),
          c = this.expect(e, "g", scenes, i, {"clip-path": "url(#" + id + ")"});
      if (!c.parentNode) g.appendChild(c);
      scenes.$g = g = c;
      e = c.firstChild;

      e = this.expect(e, "clipPath", scenes, i, {"id": id});
      var r = e.firstChild || e.appendChild(this.create("rect"));
      r.setAttribute("x", s.left);
      r.setAttribute("y", s.top);
      r.setAttribute("width", s.width);
      r.setAttribute("height", s.height);
      if (!e.parentNode) g.appendChild(e);
      e = e.nextSibling;
    }
    
    /* fill */
    e = this.fill(e, scenes, i);

    /* transform (push) */
    var k = this.scale,
        t = s.transform,
        x = s.left + t.x,
        y = s.top  + t.y;
    this.scale *= t.k;

    /* children */
    if(s.children.length){
        var attrs = {
            "transform": "translate(" + x + "," + y + ")" +
                         (t.k != 1 ? " scale(" + t.k + ")" : "")
        };
        
        this.eachChild(scenes, i, function(childScenes){
            childScenes.$g = e = this.expect(e, "g", scenes, i, attrs);

            this.updateAll(childScenes);
            if (!e.parentNode) g.appendChild(e);
            e = e.nextSibling;
        });
    }

    /* transform (pop) */
    this.scale = k;

    /* stroke */
    e = this.stroke(e, scenes, i);
    
    /* clip (restore group) */
    if (s.overflow === "hidden") {
      scenes.$g = g = c.parentNode;
      e = c.nextSibling;
    }
  } // end for panel instance
  
  complete = true;
  return e;
};

pv.SvgScene.eachChild = function(scenes, i, fun, ctx){
    if(scenes.mark.zOrderChildCount){
        var sorted = scenes[i].children.slice(0);
        sorted.sort(function(scenes1, scenes2){ // sort ascending
            var compare = scenes1.mark._zOrder - scenes2.mark._zOrder;
            if(compare === 0){
                // Preserve original order for same zOrder childs
                compare = scenes1.childIndex - scenes2.childIndex;
            }
            return compare;
        });
        
        sorted.forEach(fun, ctx || this);
    } else {
        scenes[i].children.forEach(fun, ctx || this);
    }
};

pv.SvgScene.fill = function(e, scenes, i) {
  var s = scenes[i], fill = s.fillStyle;
  if (fill.opacity || s.events == "all") {
    this.addFillStyleDefinition(scenes, fill);

    e = this.expect(e, "rect", scenes, i, {
        "shape-rendering": s.antialias ? null : "crispEdges",
        "pointer-events": s.events,
        "cursor": s.cursor,
        "x": s.left,
        "y": s.top,
        "width":  s.width,
        "height": s.height,
        "fill": fill.color,
        "fill-opacity": fill.opacity,
        "stroke": null
      });
    e = this.append(e, scenes, i);
  }
  return e;
};

pv.SvgScene.stroke = function(e, scenes, i) {
  var s = scenes[i], stroke = s.strokeStyle;
  if (stroke.opacity || s.events == "all") {
    e = this.expect(e, "rect", scenes, i, {
        "shape-rendering": s.antialias ? null : "crispEdges",
        "pointer-events": s.events == "all" ? "stroke" : s.events,
        "cursor": s.cursor,
        "x": s.left,
        "y": s.top,
        "width": Math.max(1E-10, s.width),
        "height": Math.max(1E-10, s.height),
        "fill": null,
        "stroke": stroke.color,
        "stroke-opacity": stroke.opacity,
        "stroke-width": s.lineWidth / this.scale,
        "stroke-linecap":    s.lineCap,
        "stroke-dasharray":  stroke.opacity ? this.parseDasharray(s) : null
      });
    e = this.append(e, scenes, i);
  }
  return e;
};
pv.SvgScene.minRuleLineWidth = 1;

pv.SvgScene.rule = function(scenes) {
  var e = scenes.$g.firstChild;
  for (var i = 0; i < scenes.length; i++) {
    var s = scenes[i];

    /* visible */
    if (!s.visible) continue;
    var stroke = s.strokeStyle;
    if (!stroke.opacity) continue;

    var lineWidth = s.lineWidth;
    if(lineWidth < 1e-10){
        lineWidth = 0;
    } else {
        lineWidth = Math.max(this.minRuleLineWidth, lineWidth / this.scale);
    }
    
    e = this.expect(e, "line", scenes, i, {
        "shape-rendering": s.antialias ? null : "crispEdges",
        "pointer-events": s.events,
        "cursor": s.cursor,
        "x1": s.left,
        "y1": s.top,
        "x2": s.left + s.width,
        "y2": s.top + s.height,
        "stroke": stroke.color,
        "stroke-opacity": stroke.opacity,
        "stroke-width": lineWidth,
        "stroke-linecap":    s.lineCap,
        "stroke-dasharray":  stroke.opacity ? this.parseDasharray(s) : null
      });
    
    if(s.svg) this.setAttributes(e, s.svg);
    if(s.css) this.setStyle(e, s.css);

    e = this.append(e, scenes, i);
  }
  return e;
};
pv.SvgScene.wedge = function(scenes) {
  var e = scenes.$g.firstChild;

  for (var i = 0; i < scenes.length; i++) {
    var s = scenes[i];

    /* visible */
    if (!s.visible) continue;
    var fill = s.fillStyle, stroke = s.strokeStyle;
    if (!fill.opacity && !stroke.opacity) continue;

    /* points */
    var r1 = s.innerRadius, r2 = s.outerRadius, a = Math.abs(s.angle), p;
    if (a >= 2 * Math.PI) {
      if (r1) {
        p = "M0," + r2
            + "A" + r2 + "," + r2 + " 0 1,1 0," + (-r2)
            + "A" + r2 + "," + r2 + " 0 1,1 0," + r2
            + "M0," + r1
            + "A" + r1 + "," + r1 + " 0 1,1 0," + (-r1)
            + "A" + r1 + "," + r1 + " 0 1,1 0," + r1
            + "Z";
      } else {
        p = "M0," + r2
            + "A" + r2 + "," + r2 + " 0 1,1 0," + (-r2)
            + "A" + r2 + "," + r2 + " 0 1,1 0," + r2
            + "Z";
      }
    } else {
      var sa = Math.min(s.startAngle, s.endAngle),
          ea = Math.max(s.startAngle, s.endAngle),
          c1 = Math.cos(sa), c2 = Math.cos(ea),
          s1 = Math.sin(sa), s2 = Math.sin(ea);
      if (r1) {
        p = "M" + r2 * c1 + "," + r2 * s1
            + "A" + r2 + "," + r2 + " 0 "
            + ((a < Math.PI) ? "0" : "1") + ",1 "
            + r2 * c2 + "," + r2 * s2
            + "L" + r1 * c2 + "," + r1 * s2
            + "A" + r1 + "," + r1 + " 0 "
            + ((a < Math.PI) ? "0" : "1") + ",0 "
            + r1 * c1 + "," + r1 * s1 + "Z";
      } else {
        p = "M" + r2 * c1 + "," + r2 * s1
            + "A" + r2 + "," + r2 + " 0 "
            + ((a < Math.PI) ? "0" : "1") + ",1 "
            + r2 * c2 + "," + r2 * s2 + "L0,0Z";
      }
    }
    
    this.addFillStyleDefinition(scenes, fill);
    this.addFillStyleDefinition(scenes, stroke);
    
    e = this.expect(e, "path", scenes, i, {
        "shape-rendering": s.antialias ? null : "crispEdges",
        "pointer-events": s.events,
        "cursor": s.cursor,
        "transform": "translate(" + s.left + "," + s.top + ")",
        "d": p,
        "fill": fill.color,
        "fill-rule": "evenodd",
        "fill-opacity": fill.opacity || null,
        "stroke": stroke.color,
        "stroke-opacity": stroke.opacity || null,
        "stroke-width": stroke.opacity ? s.lineWidth / this.scale : null,
        "stroke-linejoin":   s.lineJoin,
        "stroke-miterlimit": s.strokeMiterLimit,
        "stroke-linecap":    s.lineCap,
        "stroke-dasharray":  stroke.opacity ? this.parseDasharray(s) : null
      });

    if(s.svg) this.setAttributes(e, s.svg);
    if(s.css) this.setStyle(e, s.css);

    e = this.append(e, scenes, i);
  }
  
  /*
  // DEBUG BEG
  var mark  = scenes.mark;
  for (var i = 0; i < scenes.length; i+=2) {
      var shape = mark.getShape(scenes, i);
      
      // POINTS
      var points = shape.points();
      points.forEach(function(p){
          e = this.expect(e, 'circle', scenes, i, {
              cx: p.x,
              cy: p.y,
              r:  2,
              fill: 'black'
          });
          e = this.append(e, scenes, i);
      }, this);
      
      // EDGES
      var edges = shape.edges();
      edges.forEach(function(edge){
          if(edge instanceof pv.Shape.Line){
              e = this.expect(e, 'path', scenes, 0, {
                  d: "M" + edge.x + "," + edge.y + "L" + edge.x2 + "," + edge.y2,
                  stroke: 'green',
                  'stroke-width': 1
              });
              
          } else if (edge instanceof pv.Shape.Arc){
              var sa = Math.min(edge.startAngle, edge.endAngle),
                  ea = Math.max(edge.startAngle, edge.endAngle),
                  c1 = Math.cos(sa), c2 = Math.cos(ea),
                  s1 = Math.sin(sa), s2 = Math.sin(ea),
                  r  = edge.radius;
          
              var p = "M" + r * c1 + "," + r * s1 + 
                      "A" + r + "," + r + " 0 "
                      + ((edge.angleSpan < Math.PI) ? "0" : "1") + ",1 "
                      + r * c2 + "," + r * s2;
              
              e = this.expect(e, 'path', scenes, 0, {
                  d: p,
                  transform: "translate(" + edge.x + "," + edge.y + ")",
                  stroke: 'red',
                  'stroke-width': 1
              });
          }
          
          e = this.append(e, scenes, i);
      }, this);
  }
  // DEBUG END
  */
  return e;
};
/**
 * Constructs a new mark with default properties. Marks, with the exception of
 * the root panel, are not typically constructed directly; instead, they are
 * added to a panel or an existing mark via {@link pv.Mark#add}.
 *
 * @class Represents a data-driven graphical mark. The <tt>Mark</tt> class is
 * the base class for all graphical marks in Protovis; it does not provide any
 * specific rendering functionality, but together with {@link Panel} establishes
 * the core framework.
 *
 * <p>Concrete mark types include familiar visual elements such as bars, lines
 * and labels. Although a bar mark may be used to construct a bar chart, marks
 * know nothing about charts; it is only through their specification and
 * composition that charts are produced. These building blocks permit many
 * combinatorial possibilities.
 *
 * <p>Marks are associated with <b>data</b>: a mark is generated once per
 * associated datum, mapping the datum to visual <b>properties</b> such as
 * position and color. Thus, a single mark specification represents a set of
 * visual elements that share the same data and visual encoding. The type of
 * mark defines the names of properties and their meaning. A property may be
 * static, ignoring the associated datum and returning a constant; or, it may be
 * dynamic, derived from the associated datum or index. Such dynamic encodings
 * can be specified succinctly using anonymous functions. Special properties
 * called event handlers can be registered to add interactivity.
 *
 * <p>Protovis uses <b>inheritance</b> to simplify the specification of related
 * marks: a new mark can be derived from an existing mark, inheriting its
 * properties. The new mark can then override properties to specify new
 * behavior, potentially in terms of the old behavior. In this way, the old mark
 * serves as the <b>prototype</b> for the new mark. Most mark types share the
 * same basic properties for consistency and to facilitate inheritance.
 *
 * <p>The prioritization of redundant properties is as follows:<ol>
 *
 * <li>If the <tt>width</tt> property is not specified (i.e., null), its value
 * is the width of the parent panel, minus this mark's left and right margins;
 * the left and right margins are zero if not specified.
 *
 * <li>Otherwise, if the <tt>right</tt> margin is not specified, its value is
 * the width of the parent panel, minus this mark's width and left margin; the
 * left margin is zero if not specified.
 *
 * <li>Otherwise, if the <tt>left</tt> property is not specified, its value is
 * the width of the parent panel, minus this mark's width and the right margin.
 *
 * </ol>This prioritization is then duplicated for the <tt>height</tt>,
 * <tt>bottom</tt> and <tt>top</tt> properties, respectively.
 *
 * <p>While most properties are <i>variable</i>, some mark types, such as lines
 * and areas, generate a single visual element rather than a distinct visual
 * element per datum. With these marks, some properties may be <b>fixed</b>.
 * Fixed properties can vary per mark, but not <i>per datum</i>! These
 * properties are evaluated solely for the first (0-index) datum, and typically
 * are specified as a constant. However, it is valid to use a function if the
 * property varies between panels or is dynamically generated.
 *
 * <p>See also the <a href="../../api/">Protovis guide</a>.
 */
pv.Mark = function() {
  /*
   * TYPE 0 constant defs
   * TYPE 1 function defs
   * TYPE 2 constant properties
   * TYPE 3 function properties
   * in order of evaluation!
   */
  this.$properties = [];
  this.$propertiesMap = {};
  this.$handlers = {};
};

/** @private Records which properties are defined on this mark type. */
pv.Mark.prototype.properties = {};

/** @private Records the cast function for each property. */
pv.Mark.cast = {};

/**
 * @private Defines and registers a property method for the property with the
 * given name.  This method should be called on a mark class prototype to define
 * each exposed property. (Note this refers to the JavaScript
 * <tt>prototype</tt>, not the Protovis mark prototype, which is the {@link
 * #proto} field.)
 *
 * <p>The created property method supports several modes of invocation: <ol>
 *
 * <li>If invoked with a <tt>Function</tt> argument, this function is evaluated
 * for each associated datum. The return value of the function is used as the
 * computed property value. The context of the function (<tt>this</tt>) is this
 * mark. The arguments to the function are the associated data of this mark and
 * any enclosing panels. For example, a linear encoding of numerical data to
 * height is specified as
 *
 * <pre>m.height(function(d) d * 100);</pre>
 *
 * The expression <tt>d * 100</tt> will be evaluated for the height property of
 * each mark instance. The return value of the property method (e.g.,
 * <tt>m.height</tt>) is this mark (<tt>m</tt>)).<p>
 *
 * <li>If invoked with a non-function argument, the property is treated as a
 * constant. The return value of the property method (e.g., <tt>m.height</tt>)
 * is this mark.<p>
 *
 * <li>If invoked with no arguments, the computed property value for the current
 * mark instance in the scene graph is returned. This facilitates <i>property
 * chaining</i>, where one mark's properties are defined in terms of another's.
 * For example, to offset a mark's location from its prototype, you might say
 *
 * <pre>m.top(function() this.proto.top() + 10);</pre>
 *
 * Note that the index of the mark being evaluated (in the above example,
 * <tt>this.proto</tt>) is inherited from the <tt>Mark</tt> class and set by
 * this mark. So, if the fifth element's top property is being evaluated, the
 * fifth instance of <tt>this.proto</tt> will similarly be queried for the value
 * of its top property. If the mark being evaluated has a different number of
 * instances, or its data is unrelated, the behavior of this method is
 * undefined. In these cases it may be better to index the <tt>scene</tt>
 * explicitly to specify the exact instance.
 *
 * </ol><p>Property names should follow standard JavaScript method naming
 * conventions, using lowerCamel-style capitalization.
 *
 * <p>In addition to creating the property method, every property is registered
 * in the {@link #properties} map on the <tt>prototype</tt>. Although this is an
 * instance field, it is considered immutable and shared by all instances of a
 * given mark type. The <tt>properties</tt> map can be queried to see if a mark
 * type defines a particular property, such as width or height.
 *
 * @param {string} name the property name.
 * @param {function} [cast] the cast function for this property.
 */
pv.Mark.prototype.property = function(name, cast) {
  if (!this.hasOwnProperty("properties")) {
    this.properties = pv.extend(this.properties);
  }
  this.properties[name] = true;

  /*
   * Define the setter-getter globally, since the default behavior should be the
   * same for all properties, and since the Protovis inheritance chain is
   * independent of the JavaScript inheritance chain. For example, anchors
   * define a "name" property that is evaluated on derived marks, even though
   * those marks don't normally have a name.
   */
  pv.Mark.prototype.propertyMethod(name, false, pv.Mark.cast[name] = cast);
  return this;
};

// Adapted from pv.Layout#property
/**
 * Defines a local property with the specified name and cast.
 * Note that although the property method is only defined locally,
 * the cast function is global,
 * which is necessary since properties are inherited!
 *
 * @param {string} name the property name.
 * @param {function} [cast] the cast function for this property.
 */
pv.Mark.prototype.localProperty = function(name, cast) {
  if (!this.hasOwnProperty("properties")) {
    this.properties = pv.extend(this.properties);
  }
  this.properties[name] = true;
  
  var currCast = pv.Mark.cast[name];
  if(cast){
      pv.Mark.cast[name] = currCast = cast;
  }
  
  // NOTE: propertyMethod is called on the Mark instance and not on the prototype
  this.propertyMethod(name, /*def*/false, /*cast*/currCast);
  return this;
};


/**
 * Defines a custom property on this mark. Custom properties are currently
 * fixed, in that they are initialized once per mark set (i.e., per parent panel
 * instance). Custom properties can be used to store local state for the mark,
 * such as data needed by other properties (e.g., a custom scale) or interaction
 * state.
 *
 * <p>WARNING We plan on changing this feature in a future release to define
 * standard properties, as opposed to <i>fixed</i> properties that behave
 * idiosyncratically within event handlers. Furthermore, we recommend storing
 * state in an external data structure, rather than tying it to the
 * visualization specification as with defs.
 *
 * @param {string} name the name of the local variable.
 * @param {function} [v] an optional initializer; may be a constant or a
 * function.
 */
pv.Mark.prototype.def = function(name, v) {
  // NOTE: propertyMethod is called on the Mark instance and not on the prototype
  this.propertyMethod(name, /*def*/true);
  return this[name](arguments.length > 1 ? v : null);
};

/**
 * @private Defines a setter-getter for the specified property.
 *
 * <p>If a cast function has been assigned to the specified property name, the
 * property function is wrapped by the cast function, or, if a constant is
 * specified, the constant is immediately cast. Note, however, that if the
 * property value is null, the cast function is not invoked.
 *
 * @param {string} name the property name.
 * @param {boolean} [isDef] whether is a property or a def.
 * @param {function} [cast] the cast function for this property.
 */
pv.Mark.prototype.propertyMethod = function(name, isDef, cast) {
  if (!cast) cast = pv.Mark.cast[name];
  
  this[name] = function(v, tag) {
      
      if(isDef && this.scene) {
          // def being changed during render
          var defs = this.scene.defs;
          
          if (arguments.length) {
            defs[name] = {
              id:    (v == null) ? 0 : pv.id(),
              value: ((v != null) && cast) ? cast(v) : v
            };
            
            return this;
          }
          
          var def = defs[name];
          return def ? def.value : null;
      }
      
      if (arguments.length) {
        this.setPropertyValue(name, v, isDef, cast, /* chain */false, tag);
        return this;
      }
      
      // Listening to function property dependencies?
      var propEval = pv.propertyEval;
      if(propEval) {
          var binds = this.binds;
          var propRead = binds.properties[name];
          if(propRead) {
              var net = binds.net;
              var readNetIndex = net[name];
              if(readNetIndex == null) { readNetIndex = net[name] = 0; }
              
              (propRead.dependents || (propRead.dependents = {}))[propEval.name] = true;
              
              (pv.propertyEvalDependencies || (pv.propertyEvalDependencies = {}))[name] = true;
              
              // evalNetIndex must be at least one higher than readNetIndex
              if(readNetIndex >= pv.propertyEvalNetIndex) { pv.propertyEvalNetIndex = readNetIndex + 1; }
          }
      }
      
      return this.instance()[name];
  };
};

/** @private Creates and returns a wrapper function to call a property function and a property cast. */
pv.Mark.funPropertyCaller = function(fun, cast){
    // Avoiding the use of arguments object to try to speed things up
    var stack = pv.Mark.stack;

    return function(){
            var value = fun.apply(this, stack);
            return value != null ? cast(value) : value; // some things depend on the null/undefined distinction
        };
};

/** @private Sets the value of the property <i>name</i> to <i>v</i>. */
pv.Mark.prototype.setPropertyValue = function(name, v, isDef, cast, chain, tag){
    /* bit 0: 0 = value, 1 = function
     * bit 1: 0 = isDef,   1 = prop
     * ------------------------------
     * 00 - 0 - def  - value
     * 01 - 1 - def  - function
     * 10 - 2 - prop - value
     * 11 - 3 - prop - function
     * 
     * x << 1 <=> floor(x) * 2
     * 
     * true  << 1 -> 2 - 10
     * false << 1 -> 0 - 00
     */
    var type = !isDef << 1 | (typeof v === "function");
    // A function and cast?
    if(type & 1  && cast) { 
        v = pv.Mark.funPropertyCaller(v, cast); 
    } else if(v != null && cast) { 
        v = cast(v); 
    }
    
    // ------
    
    var propertiesMap = this.$propertiesMap;
    var properties = this.$properties;
    
    var p = {
        name:  name,
        id:    pv.id(), 
        value: v,
        type:  type,
        tag:   tag
    };
  
    var specified = propertiesMap[name];
  
    propertiesMap[name] = p;
  
    if(specified) {
        // Find it and remove it
        for (var i = 0; i < properties.length; i++) {
            if (properties[i] === specified) {
                properties.splice(i, 1);
                break;
            }
        }
    }
    
    properties.push(p);
    
    if(chain && specified && type === 3) { // is a prop fun
        p.proto = specified;
        p.root  = specified.root || specified;
    }
    
    return p;
};

pv.Mark.prototype.intercept = function(name, v, keyArgs) {
    this.setPropertyValue(
            name, 
            v, 
            /* isDef */ false,
            pv.get(keyArgs, 'noCast') ? null : pv.Mark.cast[name],
            /* chain*/ true,
            pv.get(keyArgs, 'tag'));
    
    return this;
};

/**
 * Gets the static value of a property, without evaluation.
 * @param {string} name the property name.
 * @type any
 */
pv.Mark.prototype.propertyValue = function(name, inherit) {
    var p = this.$propertiesMap[name];
    if(p){
        return p.value;
    }
    
    // This mimics the way #bind works
    if(inherit){
        if(this.proto){
            var value = this.proto.propertyValueRecursive(name);
            if(value !== undefined){
                return value;
            }
        }
        
        return this.defaults.propertyValueRecursive(name);
    }
    
    //return undefined;
};

/** @private */
pv.Mark.prototype.propertyValueRecursive = function(name) {
    var p = this.$propertiesMap[name];
    if(p         ) { return p.value; }
    if(this.proto) { return this.proto.propertyValueRecursive(name); }
    //return undefined;
};

/** @private Stores the current data stack. */
//must be declared before defaults, below
pv.Mark.stack = [];

/* Define all global properties. */
pv.Mark.prototype
    .property("data")
    .property("visible", Boolean)
    // CSS attributes pass-through
    .property("css", Object)
    // SVG attributes pass-through
    .property("svg", Object)
    .property("left", Number)
    .property("right", Number)
    .property("top", Number)
    .property("bottom", Number)
    .property("cursor", String)
    .property("title", String)
    .property("reverse", Boolean)
    .property("antialias", Boolean)
    .property("events", String)
    .property("id", String);

/**
 * The mark type; a lower camelCase name. The type name controls rendering
 * behavior, and unless the rendering engine is extended, must be one of the
 * built-in concrete mark types: area, bar, dot, image, label, line, panel,
 * rule, or wedge.
 *
 * @type string
 * @name pv.Mark.prototype.type
 */

/**
 * The mark prototype, possibly undefined, from which to inherit property
 * functions. The mark prototype is not necessarily of the same type as this
 * mark. Any properties defined on this mark will override properties inherited
 * either from the prototype or from the type-specific defaults.
 *
 * @type pv.Mark
 * @name pv.Mark.prototype.proto
 */

/**
 * The mark anchor target, possibly undefined.
 *
 * @type pv.Mark
 * @name pv.Mark.prototype.target
 */

/**
 * The enclosing parent panel. The parent panel is generally undefined only for
 * the root panel; however, it is possible to create "offscreen" marks that are
 * used only for inheritance purposes.
 *
 * @type pv.Panel
 * @name pv.Mark.prototype.parent
 */

/**
 * The child index. -1 if the enclosing parent panel is null; otherwise, the
 * zero-based index of this mark into the parent panel's <tt>children</tt> array.
 *
 * @type number
 */
pv.Mark.prototype.childIndex = -1;

/**
 * The mark index. The value of this field depends on which instance (i.e.,
 * which element of the data array) is currently being evaluated. During the
 * build phase, the index is incremented over each datum; when handling events,
 * the index is set to the instance that triggered the event.
 *
 * @type number
 */
pv.Mark.prototype.index = -1;

/**
 * The current scale factor, based on any enclosing transforms. The current
 * scale can be used to create scale-independent graphics. For example, to
 * define a dot that has a radius of 10 irrespective of any zooming, say:
 *
 * <pre>dot.shapeRadius(function() 10 / this.scale)</pre>
 *
 * Note that the stroke width and font size are defined irrespective of scale
 * (i.e., in screen space) already. Also note that when a transform is applied
 * to a panel, the scale affects only the child marks, not the panel itself.
 *
 * @type number
 * @see pv.Panel#transform
 */
pv.Mark.prototype.scale = 1;

/**
 * Affects the drawing order amongst sibling marks.
 * Evaluation order is not affected.
 * A higher Z order value is drawn on top of a lower Z order value.
 * 
 * @type number
 * @private
 */
pv.Mark.prototype._zOrder = 0;

/**
 * @private The scene graph. The scene graph is an array of objects; each object
 * (or "node") corresponds to an instance of this mark and an element in the
 * data array. The scene graph can be traversed to lookup previously-evaluated
 * properties.
 *
 * @name pv.Mark.prototype.scene
 */

/**
 * The root parent panel. This may be undefined for "offscreen" marks that are
 * created for inheritance purposes only.
 *
 * @type pv.Panel
 * @name pv.Mark.prototype.root
 */

/**
 * The data property; an array of objects. The size of the array determines the
 * number of marks that will be instantiated; each element in the array will be
 * passed to property functions to compute the property values. Typically, the
 * data property is specified as a constant array, such as
 *
 * <pre>m.data([1, 2, 3, 4, 5]);</pre>
 *
 * However, it is perfectly acceptable to define the data property as a
 * function. This function might compute the data dynamically, allowing
 * different data to be used per enclosing panel. For instance, in the stacked
 * area graph example (see {@link #scene}), the data function on the area mark
 * dereferences each series.
 *
 * @type array
 * @name pv.Mark.prototype.data
 */

/**
 * The visible property; a boolean determining whether or not the mark instance
 * is visible. If a mark instance is not visible, its other properties will not
 * be evaluated. Similarly, for panels no child marks will be rendered.
 *
 * @type boolean
 * @name pv.Mark.prototype.visible
 */

/**
 * The left margin; the distance, in pixels, between the left edge of the
 * enclosing panel and the left edge of this mark. Note that in some cases this
 * property may be redundant with the right property, or with the conjunction of
 * right and width.
 *
 * @type number
 * @name pv.Mark.prototype.left
 */

/**
 * The right margin; the distance, in pixels, between the right edge of the
 * enclosing panel and the right edge of this mark. Note that in some cases this
 * property may be redundant with the left property, or with the conjunction of
 * left and width.
 *
 * @type number
 * @name pv.Mark.prototype.right
 */

/**
 * The top margin; the distance, in pixels, between the top edge of the
 * enclosing panel and the top edge of this mark. Note that in some cases this
 * property may be redundant with the bottom property, or with the conjunction
 * of bottom and height.
 *
 * @type number
 * @name pv.Mark.prototype.top
 */

/**
 * The bottom margin; the distance, in pixels, between the bottom edge of the
 * enclosing panel and the bottom edge of this mark. Note that in some cases
 * this property may be redundant with the top property, or with the conjunction
 * of top and height.
 *
 * @type number
 * @name pv.Mark.prototype.bottom
 */

/**
 * The cursor property; corresponds to the CSS cursor property. This is
 * typically used in conjunction with event handlers to indicate interactivity.
 *
 * @type string
 * @name pv.Mark.prototype.cursor
 * @see <a href="http://www.w3.org/TR/CSS2/ui.html#propdef-cursor">CSS2 cursor</a>
 */

/**
 * The title property; corresponds to the HTML/SVG title property, allowing the
 * general of simple plain text tooltips.
 *
 * @type string
 * @name pv.Mark.prototype.title
 */

/**
 * The events property; corresponds to the SVG pointer-events property,
 * specifying how the mark should participate in mouse events. The default value
 * is "painted". Supported values are:
 *
 * <p>"painted": The given mark may receive events when the mouse is over a
 * "painted" area. The painted areas are the interior (i.e., fill) of the mark
 * if a 'fillStyle' is specified, and the perimeter (i.e., stroke) of the mark
 * if a 'strokeStyle' is specified.
 *
 * <p>"all": The given mark may receive events when the mouse is over either the
 * interior (i.e., fill) or the perimeter (i.e., stroke) of the mark, regardless
 * of the specified fillStyle and strokeStyle.
 *
 * <p>"none": The given mark may not receive events.
 *
 * @type string
 * @name pv.Mark.prototype.events
 */

/**
 * The reverse property; a boolean determining whether marks are ordered from
 * front-to-back or back-to-front. SVG does not support explicit z-ordering;
 * shapes are rendered in the order they appear. Thus, by default, marks are
 * rendered in data order. Setting the reverse property to false reverses the
 * order in which they are rendered; however, the properties are still evaluated
 * (i.e., built) in forward order.
 *
 * @type boolean
 * @name pv.Mark.prototype.reverse
 */

/**
 * The instance identifier, for correspondence across animated transitions. If
 * no identifier is specified, correspondence is determined using the mark
 * index. Identifiers are not global, but local to a given mark.
 *
 * @type String
 * @name pv.Mark.prototype.id
 */

/**
 * Default properties for all mark types. By default, the data array is the
 * parent data as a single-element array; if the data property is not specified,
 * this causes each mark to be instantiated as a singleton with the parents
 * datum. The visible property is true by default, and the reverse property is
 * false.
 *
 * @type pv.Mark
 */
pv.Mark.prototype.defaults = new pv.Mark()
    // If the root panel has no data, this default function receives d === undefined -> [undefined]
    .data(function(d) { return [d]; })
    .visible(true)
    .antialias(true)
    .events("painted");

/**
 * Sets the prototype of this mark to the specified mark. Any properties not
 * defined on this mark may be inherited from the specified prototype mark, or
 * its prototype, and so on. The prototype mark need not be the same type of
 * mark as this mark. (Note that for inheritance to be useful, properties with
 * the same name on different mark types should have equivalent meaning.)
 *
 * @param {pv.Mark} proto the new prototype.
 * @returns {pv.Mark} this mark.
 * @see #add
 */
pv.Mark.prototype.extend = function(proto) {
  this.proto = proto;
  this.target = proto.target;
  return this;
};

/**
 * Adds a new mark of the specified type to the enclosing parent panel, whilst
 * simultaneously setting the prototype of the new mark to be this mark.
 *
 * @param {function} type the type of mark to add; a constructor, such as
 * <tt>pv.Bar</tt>.
 * @returns {pv.Mark} the new mark.
 * @see #extend
 */
pv.Mark.prototype.add = function(type) {
  return this.parent.add(type).extend(this);
};

/**
 * Affects the drawing order amongst sibling marks.
 * Evaluation order is not affected.
 * A higher Z order value is drawn on top of a lower Z order value. 
 * 
 * @param {number} zOrder the Z order of the mark. 
 * @type number
 */
pv.Mark.prototype.zOrder = function(zOrder){
    if(!arguments.length) { return this._zOrder; }
    
    zOrder = (+zOrder) || 0; // NaN -> 0
    
    if(this._zOrder !== zOrder) {
        var p = this.parent;
        
        if(p && this._zOrder !== 0) { p.zOrderChildCount--; }
        
        this._zOrder = zOrder;
        
        if(p && this._zOrder !== 0) { p.zOrderChildCount++; }
    }
    
    return this;
};

/**
 * Returns an anchor with the specified name. All marks support the five
 * standard anchor names:<ul>
 *
 * <li>top
 * <li>left
 * <li>center
 * <li>bottom
 * <li>right
 *
 * </ul>In addition to positioning properties (left, right, top bottom), the
 * anchors support text rendering properties (text-align, text-baseline). Text is
 * rendered to appear inside the mark by default.
 *
 * <p>To facilitate stacking, anchors are defined in terms of their opposite
 * edge. For example, the top anchor defines the bottom property, such that the
 * mark extends upwards; the bottom anchor instead defines the top property,
 * such that the mark extends downwards. See also {@link pv.Layout.Stack}.
 *
 * <p>While anchor names are typically constants, the anchor name is a true
 * property, which means you can specify a function to compute the anchor name
 * dynamically. See the {@link pv.Anchor#name} property for details.
 *
 * @param {string} name the anchor name; either a string or a property function.
 * @returns {pv.Anchor} the new anchor.
 */
pv.Mark.prototype.anchor = function(name) {
  if (!name) name = "center"; // default anchor name
  return new pv.Anchor(this)
    .name(name)
    .data(function() {
        return this.scene.target.map(function(s) { return s.data; });
      })
    .visible(function() {
        return this.scene.target[this.index].visible;
      })
    .id(function() {
        return this.scene.target[this.index].id;
      })
    .left(function() {
        var s = this.scene.target[this.index], w = s.width || 0;
        switch (this.name()) {
          case "bottom":
          case "top":
          case "center": return s.left + w / 2;
          case "left": return null;
        }
        return s.left + w;
      })
    .top(function() {
        var s = this.scene.target[this.index], h = s.height || 0;
        switch (this.name()) {
          case "left":
          case "right":
          case "center": return s.top + h / 2;
          case "top": return null;
        }
        return s.top + h;
      })
    .right(function() {
        var s = this.scene.target[this.index];
        return this.name() == "left" ? s.right + (s.width || 0) : null;
      })
    .bottom(function() {
        var s = this.scene.target[this.index];
        return this.name() == "top" ? s.bottom + (s.height || 0) : null;
      })
    .textAlign(function() {
        switch (this.name()) {
          case "bottom":
          case "top":
          case "center": return "center";
          case "right": return "right";
        }
        return "left";
      })
    .textBaseline(function() {
        switch (this.name()) {
          case "right":
          case "left":
          case "center": return "middle";
          case "top": return "top";
        }
        return "bottom";
      });
};

/** @deprecated Replaced by {@link #target}. */
pv.Mark.prototype.anchorTarget = function() {
  return this.target;
};

/**
 * Alias for setting the left, right, top and bottom properties simultaneously.
 *
 * @see #left
 * @see #right
 * @see #top
 * @see #bottom
 * @returns {pv.Mark} this.
 */
pv.Mark.prototype.margin = function(n) {
  return this.left(n).right(n).top(n).bottom(n);
};

/**
 * @private Returns the current instance of this mark in the scene graph. This
 * is typically equivalent to <tt>this.scene[this.index]</tt>, however if the
 * scene or index is unset, the default instance of the mark is returned. If no
 * default is set, the default is the last instance. Similarly, if the scene or
 * index of the parent panel is unset, the default instance of this mark in the
 * last instance of the enclosing panel is returned, and so on.
 *
 * @returns a node in the scene graph.
 */
pv.Mark.prototype.instance = function(defaultIndex) {
  var scene = this.scene || this.parent.instance(-1).children[this.childIndex],
      index = (defaultIndex == null) || this.hasOwnProperty("index") ? 
              this.index : 
              defaultIndex;
  return scene[index < 0 ? scene.length - 1 : index];
};

/**
 * @private Find the instances of this mark that match source.
 *
 * @see pv.Anchor
 */
pv.Mark.prototype.instances = function(source) {
  var mark = this, index = [], scene;

  /* Mirrored descent. */
  while (!(scene = mark.scene)) {
    source = source.parent;
    index.push({index: source.index, childIndex: mark.childIndex});
    mark = mark.parent;
  }
  while (index.length) {
    var i = index.pop();
    scene = scene[i.index].children[i.childIndex];
  }

  /*
   * When the anchor target is also an ancestor, as in the case of adding
   * to a panel anchor, only generate one instance per panel. Also, set
   * the margins to zero, since they are offset by the enclosing panel.
   */
  if (this.hasOwnProperty("index")) {
    var s = pv.extend(scene[this.index]);
    s.right = s.top = s.left = s.bottom = 0;
    return [s];
  }
  return scene;
};

/**
 * @private Returns the first instance of this mark in the scene graph. This
 * method can only be called when the mark is bound to the scene graph (for
 * example, from an event handler, or within a property function).
 *
 * @returns a node in the scene graph.
 */
pv.Mark.prototype.first = function() {
  return this.scene[0];
};

/**
 * @private Returns the last instance of this mark in the scene graph. This
 * method can only be called when the mark is bound to the scene graph (for
 * example, from an event handler, or within a property function). In addition,
 * note that mark instances are built sequentially, so the last instance of this
 * mark may not yet be constructed.
 *
 * @returns a node in the scene graph.
 */
pv.Mark.prototype.last = function() {
  return this.scene[this.scene.length - 1];
};

/**
 * @private Returns the previous instance of this mark in the scene graph, or
 * null if this is the first instance.
 *
 * @returns a node in the scene graph, or null.
 */
pv.Mark.prototype.sibling = function() {
  return (this.index == 0) ? null : this.scene[this.index - 1];
};

/**
 * @private Returns the current instance in the scene graph of this mark, in the
 * previous instance of the enclosing parent panel. May return null if this
 * instance could not be found.
 *
 * @returns a node in the scene graph, or null.
 */
pv.Mark.prototype.cousin = function() {
  var p = this.parent, s = p && p.sibling();
  return (s && s.children) ? s.children[this.childIndex][this.index] : null;
};

/**
 * Renders this mark, including recursively rendering all child marks if this is
 * a panel. This method finds all instances of this mark and renders them. This
 * method descends recursively to the level of the mark to be rendered, finding
 * all visible instances of the mark. After the marks are rendered, the scene
 * and index attributes are removed from the mark to restore them to a clean
 * state.
 *
 * <p>If an enclosing panel has an index property set (as is the case inside in
 * an event handler), then only instances of this mark inside the given instance
 * of the panel will be rendered; otherwise, all visible instances of the mark
 * will be rendered.
 */
pv.Mark.prototype.render = function() {
    /* For the first render, take it from the top. */
    if (this.parent && !this.root.scene) {
      this.root.render();
      return;
    }
    
    this.renderCore();
};

pv.Mark.prototype.renderCore = function() {
    var parent = this.parent,
        stack = pv.Mark.stack,
        S = stack.length;

    /* Record the path to this mark. */
    var indexes = []; // [root excluded], ..., this.parent.childIndex, this.childIndex
    for (var mark = this; mark.parent; mark = mark.parent) { indexes.unshift(mark.childIndex); }

    var L = indexes.length;

    /** @private
     * Starts with mark = root with the call:
     *   render(this.root, 0, 1);
     *
     * when in the context of the first ascendant of 'this' that has an index set.
     * The stack will already be filled up to the context scene/index.
     */
    function render(mark, depth, scale) {
        mark.scale = scale;
        if (depth < L) {
            // At least one more child index to traverse, for getting to the initial mark
            
            // If addStack, then we've reached a level not covered by #context.
            // TODO: Can't think of a situation in which addStack and index is an own property.  
            var addStack = (depth >= stack.length);
            if(addStack) { stack.unshift(null); }
                if (mark.hasOwnProperty("index")) {
                    // Render only instances of the outer "this" mark
                    // that are found along along this branch.
                    renderCurrentInstance(mark, depth, scale, addStack);
                } else {
                    // Traverse every branch that leads to
                    // instances of the outer "this" mark.
                    for (var i = 0, n = mark.scene.length; i < n; i++) {
                        mark.index = i;
                        renderCurrentInstance(mark, depth, scale, addStack);
                    }
                    delete mark.index;
                }
            if(addStack) { stack.shift(); }
        } else {
            // Got to a "scenes" node of mark = outer "this".
            // Build and UpdateAll
            mark.build();

            /*
             * In the update phase, the scene is rendered by creating and updating
             * elements and attributes in the SVG image. No properties are evaluated
             * during the update phase; instead the values computed previously in the
             * build phase are simply translated into SVG. The update phase is
             * decoupled (see pv.Scene) to allow different rendering engines.
             */
            pv.Scene.scale = scale;
            pv.Scene.updateAll(mark.scene);
        }
      
        delete mark.scale;
    }

    /**
     * @private Recursively renders the current instance of the specified mark.
     * This is slightly tricky because `index` and `scene` properties may or may
     * not already be set; if they are set, it means we are rendering only a
     * specific instance; if they are unset, we are rendering all instances.
     * Furthermore, we must preserve the original context of these properties when
     * rendering completes.
     *
     * <p>Another tricky aspect is that the `scene` attribute should be set for
     * any preceding children, so as to allow property chaining. This is
     * consistent with first-pass rendering.
     */
    function renderCurrentInstance(mark, depth, scale, fillStack) {
        var s = mark.scene[mark.index], i;
        if (s.visible) {
            var childMarks  = mark.children;
            var childScenez = s.children;
            var childIndex  = indexes[depth];
            var childMark   = childMarks[childIndex];
    
            /* If current child's scene is not set, include it in the loops below. */
            if(!childMark.scene) { childIndex++; }
    
            /* Set preceding (and possibly self) child marks' scenes. */
            for (i = 0; i < childIndex; i++) { childMarks[i].scene = childScenez[i]; }
    
            if(fillStack) { stack[0] = s.data; }
    
            render(childMark, depth + 1, scale * s.transform.k);
    
            /* Clear preceding (and possibly self) child mark's scenes. 
             * It's cheaper to set to null than to delete. */
            for (i = 0; i < childIndex; i++) { childMarks[i].scene = undefined; }
        }
    }

    /* Bind this mark's property definitions. */
    this.bind();

    /* The render context is the first ancestor with an explicit index. */
    while (parent && !parent.hasOwnProperty("index")) { parent = parent.parent; }
    
    /* Recursively render all instances of this mark. */
    try {
        this.context(
            parent ? parent.scene : undefined,
            parent ? parent.index : -1,
        function() {
                // pv.Mark.stack contains the data until parent.scene, parent.index
                // parent and all its ascendants have scene, index and scale set.
                // Direct children of parent have scene and scale set.
                render(this.root, 0, 1);
        });
    } catch(e) {
        if(stack.length > S) { stack.length = S; }
    }
};

/**
 * @private In the bind phase, inherited property definitions are cached so they
 * do not need to be queried during build.
 * 
 * NOTE: pv.Panel#bind binds locally and then calls #bind on all of its children.
 *
 * EVALUATION order (not precedence order for choosing props/defs)
 * 0) DEF and PROP _values_ are always already "evaluated".
 *    * Defined PROPs for which a value/fun was not specified
 *      get the value null.
 * 
 * 1) DEF _functions_
 *    * once per parent instance
 *    * with parent instance's stack
 *    
 *    1.1) Defaulted
 *        * from farthest proto mark to closest
 *            * on each level the first defined is the first evaluated
 *    
 *    1.2) Explicit
 *        * idem
 *    
 * 2) Data PROP _value_ or _function_
 *    * once per all child instances
 *    * with parent instance's stack
 * 
 * ONCE PER INSTANCE
 * 
 * 3) Required kind PROP _functions_ (id, datum, visible)
 *    2.1) Defaulted
 *        * idem
 *    2.2) Explicit
 *        * idem
 *
 * 3) Optional kind PROP _functions_ (when instance.visible=true)
 *    3.1) Defaulted
 *        * idem
 *    3.2) Explicit
 *        * idem
 *
 * 4) Implied PROPs (when instance.visible=true)
 */
pv.Mark.prototype.bind = function() {
  var seen = {},
      data,
      
      /* Required props (no defs) */
      required = [],    
      
      /* 
       * Optional props/defs by type
       * 0 - def/value, 
       * 1 - def/fun, 
       * 2 - prop/value, 
       * 3 - prop/fun 
       */
      types = [[], [], [], []],
      
      bindPropStrategy = {
          'data':    function(p) { data = p;         },
          'visible': function(p) { required.push(p); }
      },
      
      defBindPropStrategy = function(p) {
          types[p.type].push(p);
      };
  
  bindPropStrategy.id = bindPropStrategy.visible;
  
  var types0 = types[0], 
      types1 = types[1], 
      types2 = types[2],
      types3 = types[3];
  /** 
   * Scans the proto chain for the specified mark.
   *
   * On each mark properties are traversed in reverse
   * so that, below, when reverse() is called
   * function props/defs recover their original defining order.
   * 
   * M1 -> P1_0, P1_1, P1_2, P1_3
   * ^
   * |
   * M2 -> P2_0, P2_1
   * ^
   * |
   * M3 -> P3_0, P3_1
   * 
   * List     -> P3_1, P3_0, P2_1, P2_0, P1_3, P1_2, P1_1, P1_0
   * 
   * Reversed -> P1_0, P1_1, P1_2, P1_3, P2_0, P2_1, P3_0, P3_1
   */
  function bind(mark) {
    do {
      var properties = mark.$properties;
      var i = properties.length;
      while(i--) {
        var p = properties[i];
        var name = p.name;
        var pLeaf = seen[name];
        if (!pLeaf) {
          
          seen[name] = p;
          (bindPropStrategy[name] || defBindPropStrategy)(p); // hope no props like 'toString'...
          
        } else if(pLeaf.type === 3) { // prop/fun
            // Chain properties
            //
            // seen[name]-> (leaf).proto-> (B).proto-> (C).proto-> (root)
            //                    .root-------------------------------^
            var pRoot  = pLeaf.root;
            pLeaf.root = p;
            if(!pRoot)            { pLeaf.proto = p; }
            else if(!pRoot.proto) { pRoot.proto = p; }
        }
      }
    } while ((mark = mark.proto));
  }

  /* Scan the proto chain for all defined properties. */
  bind(this);
  bind(this.defaults);
  types1.reverse();
  types3.reverse();

  /* Any undefined properties are null. */
  var mark  = this;
  var props = mark.properties;
  do {
    for (var name in props) {
        if (!(name in seen)) {
            types2.push(seen[name] = {name: name, type: 2, value: null});
        }
    }
  } while ((mark = mark.proto));

  /* Define setter-getter for inherited defs. */
  var defs;
  if(types0.length || types1.length) {
      defs =  types0.concat(types1);
      for (var i = 0, D = defs.length ; i < D ; i++) {
        this.propertyMethod(defs[i].name, true);
      }
  } else {
      defs = [];
  }
  
  /* Setup binds to evaluate constants before functions. */
  this.binds = {
    properties: seen,
    net:        {}, // name -> net index // null = 0 is default position
    data:       data,
    defs:       defs,
    required:   required,
    
    // NOTE: although defs are included in the optional properties
    // they are evaluated once per parent instance, before other non-def properties.
    // Yet, for each instance, the already evaluated's def values
    // are copied to the instance scene - all instances share the same value...
    // Only to satisfy this copy operation they go in the instance-props array.
    optional:   pv.blend(types)
  };
};

pv.Mark.prototype.updateNet = function(pDependent, netIndex){
    var binds = this.binds;
    var props = binds.properties;
    var net   = binds.net;
    
    propagateRecursive(pDependent, netIndex);
    
    function propagateRecursive(p, minNetIndex){
        if(minNetIndex > (net[p.name] || 0)){
            net[p.name] = minNetIndex;
            var deps = p.dependents;
            if(deps){
                minNetIndex++;
                for(var depName in deps){
                    if(deps.hasOwnProperty(depName)){
                        var pDep = props[depName];
                        if(pDep){
                            propagateRecursive(pDep, minNetIndex);
                        }
                    }
                }
            }
        }
    }
};

/**
 * @private Evaluates properties and computes implied properties. Properties are
 * stored in the {@link #scene} array for each instance of this mark.
 *
 * <p>As marks are built recursively, the {@link #index} property is updated to
 * match the current index into the data array for each mark. Note that the
 * index property is only set for the mark currently being built and its
 * enclosing parent panels. The index property for other marks is unset, but is
 * inherited from the global <tt>Mark</tt> class prototype. This allows mark
 * properties to refer to properties on other marks <i>in the same panel</i>
 * conveniently; however, in general it is better to reference mark instances
 * specifically through the scene graph rather than depending on the magical
 * behavior of {@link #index}.
 *
 * <p>The root scene array has a special property, <tt>data</tt>, which stores
 * the current data stack. The first element in this stack is the current datum,
 * followed by the datum of the enclosing parent panel, and so on. The data
 * stack should not be accessed directly; instead, property functions are passed
 * the current data stack as arguments.
 *
 * <p>The evaluation of the <tt>data</tt> and <tt>visible</tt> properties is
 * special. The <tt>data</tt> property is evaluated first; unlike the other
 * properties, the data stack is from the parent panel, rather than the current
 * mark, since the data is not defined until the data property is evaluated.
 * The <tt>visible</tt> property is subsequently evaluated for each instance;
 * only if true will the {@link #buildInstance} method be called, evaluating
 * other properties and recursively building the scene graph.
 *
 * <p>If this mark is being re-built, any old instances of this mark that no
 * longer exist (because the new data array contains fewer elements) will be
 * cleared using {@link #clearInstance}.
 *
 * @param parent the instance of the parent panel from the scene graph.
 */
pv.Mark.prototype.build = function() {
  var scene = this.scene, stack = pv.Mark.stack;
  if (!scene) {
    // Create _scenes_
    scene = this.scene = [];
    scene.mark = this;
    scene.type = this.type;
    scene.childIndex = this.childIndex;
    if (this.parent) {
      scene.parent = this.parent.scene;
      scene.parentIndex = this.parent.index;
    }
  }

  /* Resolve anchor target. */
  if (this.target) scene.target = this.target.instances(scene);

  /* Evaluate defs. */
  var bdefs = this.binds.defs;
  if (bdefs.length) {
    var defs = scene.defs || (scene.defs = {});
    for (var i = 0, B = bdefs.length ; i < B ; i++) {
      var p = bdefs[i], 
          d = defs[p.name];
      if (!d || (p.id > d.id)) {
        var fval = p.value;
        defs[p.name] = {
          id: 0, // this def will be re-evaluated on next build
          value: (p.type & 1) ? p.value.apply(this, stack) : p.value
        };
      }
    }
  }

  /* Evaluate special data property.
   * With the stack of the parent!!
   * this.index is -1
   */
  var data = this.evalProperty(this.binds.data);

  /* Create, update and delete scene nodes. */
  var markProto = pv.Mark.prototype;
  stack.unshift(null);
  try {
      /* Adjust scene length to data length. */
      var L = scene.length = data.length;
      for (var i = 0 ; i < L ; i++) {
        markProto.index = this.index = i;
        
        // Create scene instance
        var instance = scene[i] || (scene[i] = {});
        
        /* Fill special data property and update the stack. */
        instance.data = stack[0] = data[i];
        
        this.buildInstance(instance);
      }
  } finally {
      markProto.index = -1;
      delete this.index;
      stack.shift();
  }
  
  return this;
};

/**
 * @private Evaluates the specified array of properties for the specified
 * instance <tt>s</tt> in the scene graph.
 *
 * @param s a node in the scene graph; the instance of the mark to build.
 * @param properties an array of properties.
 */

pv.Mark.prototype.buildProperties = function(s, properties) {
    var stack = pv.Mark.stack;
    var oldProtoProp = pv.propertyProto;
    try {
      for (var i = 0, n = properties.length; i < n; i++) {
        var p = properties[i];
        s[p.name] = _buildByPropType[p.type].call(this, p, stack);
      }
    } finally {
      pv.propertyProto = oldProtoProp;
    }
};

/** @private */
var _buildByPropType = [
    function(p) { return this.scene.defs[p.name].value; },
    null,
    function(p) { return p.value; }, // 2
    function(p, stack) { // 3
        pv.propertyProto = p.proto;
        return p.value.apply(this, stack);
    }
];

_buildByPropType[1] = _buildByPropType[0];

pv.Mark.prototype.delegate = function(dv, tag){
    var protoProp = pv.propertyProto;
    if(protoProp && (!tag || protoProp.tag === tag)){ 
        var value = this.evalProperty(protoProp);
        if(value !== undefined){
            return value;
        }
    }
    
    return dv;
};

pv.Mark.prototype.hasDelegate = function(tag) {
    var protoProp = pv.propertyProto;
    return !!protoProp && (!tag || protoProp.tag === tag);
};


var _buildByPropTypeSingle = _buildByPropType.slice();

_buildByPropTypeSingle[3] = function(p) {
    var oldProtoProp = pv.propertyProto;
    try {
        pv.propertyProto = p.proto;
                return p.value.apply(this, pv.Mark.stack);
    } finally {
        pv.propertyProto = oldProtoProp;
    }
}; 
    

pv.Mark.prototype.evalProperty = function(p) {
    return _buildByPropTypeSingle[p.type].call(this, p);
};

pv.Mark.prototype.buildPropertiesWithDepTracking = function(s, properties) {
    // Current bindings
    var net = this.binds.net;
    var netIndex, newNetIndex, netDirtyProps, prevNetDirtyProps, 
        propertyIndexes, evaluatedProps;
    var stack = pv.Mark.stack;
    
    var n = properties.length;
    try {
        while(true) {
            netDirtyProps = null;
            evaluatedProps = {};
            var oldProtoProp = pv.propertyProto;
            try {
                for (var i = 0 ; i < n; i++) {
                    var p = properties[i];
                    var name = p.name;
                    evaluatedProps[name] = true;
                    
                    // Only re-evaluate properties marked dirty on the previous iteration
                    if(!prevNetDirtyProps || prevNetDirtyProps[name]) {
                        var v;
                        switch (p.type) {
                            case 3:
                                pv.propertyEval = p;
                                pv.propertyEvalNetIndex = netIndex = (net[name] || 0);
                                pv.propertyEvalDependencies = null;
                                
                                pv.propertyProto = p.proto;
                                v = p.value.apply(this,  stack);
                                
                                newNetIndex = pv.propertyEvalNetIndex;
                                if(newNetIndex > netIndex) {
                                    var evalDeps = pv.propertyEvalDependencies;
                                    for(var depName in evalDeps) {
                                        // If dependent property has not yet been evaluated
                                        // set it as dirty
                                        if(evalDeps.hasOwnProperty(depName) &&
                                           !evaluatedProps.hasOwnProperty(name)){
                                            if(!netDirtyProps) { netDirtyProps = {}; }
                                            netDirtyProps[depName] = true;
                                        }
                                    }
                                    
                                    this.updateNet(p, newNetIndex);
                                }
                                break;
                            
                            case 2:
                                v = p.value;
                                break;
                                
                            // copy already evaluated def value to each instance's scene
                            case 0:
                            case 1:
                                v = this.scene.defs[name].value;
                                break;
                        }
                         
                        s[name] = v;
                    } // if
                } // for
            } finally {
                pv.propertyProto = oldProtoProp;
            }
            
            if(!netDirtyProps) { break; }
            
            prevNetDirtyProps = netDirtyProps;
            
            // Sort properties on net index and repeat...
            
            propertyIndexes = pv.numerate(properties, function(p) { return p.name; });
            
            properties.sort(function(pa, pb) {
                var comp = pv.naturalOrder(net[pa.name] || 0, net[pb.name] || 0);
                if(!comp) {
                    // Force mantaining original order
                    comp = pv.naturalOrder(propertyIndexes[pa.name], propertyIndexes[pb.name]);
                }
                return comp;
            });
            
            propertyIndexes = null;
        }
    } finally {
        pv.propertyEval = null;
        pv.propertyEvalNetIndex = null;
        pv.propertyEvalDependencies = null;
    }
};
  
/**
 * @private Evaluates all of the properties for this mark for the specified
 * instance <tt>s</tt> in the scene graph. The set of properties to evaluate is
 * retrieved from the {@link #properties} array for this mark type (see {@link
 * #type}).  After these properties are evaluated, any <b>implied</b> properties
 * may be computed by the mark and set on the scene graph; see
 * {@link #buildImplied}.
 *
 * <p>For panels, this method recursively builds the scene graph for all child
 * marks as well. In general, this method should not need to be overridden by
 * concrete mark types.
 *
 * @param s a node in the scene graph; the instance of the mark to build.
 */
pv.Mark.prototype.buildInstance = function(s) {
  this.buildProperties(s, this.binds.required);
  if (s.visible) {
    if(this.index === 0){
        this.buildPropertiesWithDepTracking(s, this.binds.optional);
    } else {
        this.buildProperties(s, this.binds.optional);
    }
    
    this.buildImplied(s);
  }
};

/**
 * @private Computes the implied properties for this mark for the specified
 * instance <tt>s</tt> in the scene graph. Implied properties are those with
 * dependencies on multiple other properties; for example, the width property
 * may be implied if the left and right properties are set. This method can be
 * overridden by concrete mark types to define new implied properties, if
 * necessary.
 *
 * @param s a node in the scene graph; the instance of the mark to build.
 */
pv.Mark.prototype.buildImplied = function(s) {
  var l = s.left;
  var r = s.right;
  var t = s.top;
  var b = s.bottom;

  /* Assume width and height are zero if not supported by this mark type. */
  var p = this.properties;
  var w = p.width ? s.width : 0;
  var h = p.height ? s.height : 0;

  /* Compute implied width, right and left. */
  var instance;
  var checked;
  
  if(w == null || r == null || l == null){
      instance = this.parent ? this.parent.instance() : null;
      checked = true;
      var width = instance ? instance.width : (w + l + r);
      if (w == null) {
        w = width - (r = r || 0) - (l = l || 0);
      } else if (r == null) {
        if (l == null) {
          l = r = (width - w) / 2;
        } else {
          r = width - w - l;
        }
      } else {
        l = width - w - r;
      }
  }
  
  /* Compute implied height, bottom and top. */
  if (h == null || b == null || t == null) {
      if(!checked){
          instance = this.parent ? this.parent.instance() : null;
      }
      
      var height = instance ? instance.height : (h + t + b);
      if (h == null) {
        h = height - (t = t || 0) - (b = b || 0);
      } else if (b == null) {
        if (t == null) {
          b = t = (height - h) / 2;
        } else {
          b = height - h - t;
        }
      } else {
        t = height - h - b;
      }
  }
  
  s.left = l;
  s.right = r;
  s.top = t;
  s.bottom = b;

  /* Only set width and height if they are supported by this mark type. */
  if (p.width ) s.width  = w;
  if (p.height) s.height = h;

  /* Set any null colors to pv.FillStyle.transparent. */
  if (p.textStyle   && !s.textStyle  ) s.textStyle   = pv.FillStyle.transparent;
  if (p.fillStyle   && !s.fillStyle  ) s.fillStyle   = pv.FillStyle.transparent;
  if (p.strokeStyle && !s.strokeStyle) s.strokeStyle = pv.FillStyle.transparent;
};

/**
 * Returns the current location of the mouse (cursor) relative to this mark's
 * parent. The <i>x</i> coordinate corresponds to the left margin, while the
 * <i>y</i> coordinate corresponds to the top margin.
 *
 * @returns {pv.Vector} the mouse location.
 */
pv.Mark.prototype.mouse = function() {
    var n = this.root.canvas(),
        ev = pv.event,
        x = ev.pageX,
        y = ev.pageY;
    
      // Compute xy-coordinates relative to the panel.
      var offset = pv.elementOffset(n);
      if(offset){
          var getStyle = pv.cssStyle(n);
          x -= offset.left + parseFloat(getStyle('paddingLeft') || 0);
          y -= offset.top  + parseFloat(getStyle('paddingTop')  || 0);
      }
      
      /* Compute the inverse transform of all enclosing panels. */
      var t = pv.Transform.identity,
          p = this.properties.transform ? this : this.parent,
          pz = [];
      
      do { 
          pz.push(p); 
      } while ((p = p.parent));
      
      while ((p = pz.pop())) {
          var pinst = p.instance();
          t = t.translate(pinst.left, pinst.top)
               .times(pinst.transform);
      }
      
      t = t.invert();
      return pv.vector(x * t.k + t.x, y * t.k + t.y);
};

/**
 * Registers an event handler for the specified event type with this mark. When
 * an event of the specified type is triggered, the specified handler will be
 * invoked. The handler is invoked in a similar method to property functions:
 * the context is <tt>this</tt> mark instance, and the arguments are the full
 * data stack. Event handlers can use property methods to manipulate the display
 * properties of the mark:
 *
 * <pre>m.event("click", function() this.fillStyle("red"));</pre>
 *
 * Alternatively, the external data can be manipulated and the visualization
 * redrawn:
 *
 * <pre>m.event("click", function(d) {
 *     data = all.filter(function(k) k.name == d);
 *     vis.render();
 *   });</pre>
 *
 * The return value of the event handler determines which mark gets re-rendered.
 * Use defs ({@link #def}) to set temporary state from event handlers.
 *
 * <p>The complete set of event types is defined by SVG; see the reference
 * below. The set of supported event types is:<ul>
 *
 * <li>click
 * <li>mousedown
 * <li>mouseup
 * <li>mouseover
 * <li>mousemove
 * <li>mouseout
 *
 * </ul>Since Protovis does not specify any concept of focus, it does not
 * support key events; these should be handled outside the visualization using
 * standard JavaScript. In the future, support for interaction may be extended
 * to support additional event types, particularly those most relevant to
 * interactive visualization, such as selection.
 *
 * <p>TODO In the current implementation, event handlers are not inherited from
 * prototype marks. They must be defined explicitly on each interactive mark. 
 * More than one event handler for a given event type <i>can</i> be defined.
 * The return values of each handler, if any and are marks, 
 * are rendered at the end of every handler having been called.
 *
 * @see <a href="http://www.w3.org/TR/SVGTiny12/interact.html#SVGEvents">SVG events</a>
 * @param {string} type the event type.
 * @param {function} handler the event handler.
 * @returns {pv.Mark} this.
 */
pv.Mark.prototype.event = function(type, handler) {
  handler = pv.functor(handler);
  
  var handlers = this.$handlers[type];
  if(!handlers) {
      handlers = handler; 
  } else if(handlers instanceof Array) {
      handlers.push(handler);
  } else {
      handlers = [handlers, handler];
  }
  
  this.$hasHandlers = true;
  this.$handlers[type] = handlers;
  return this;
};

/** @private Evaluates the function <i>f</i> with the specified context.
 * The <tt>this</tt> mark is the JavaScript context on which
 * the function <i>f</i> is called, but plays no other role.
 * It may be the case that <tt>scenes.mark</tt> is not equal to <tt>this</tt>.
 */
pv.Mark.prototype.context = function(scene, index, f) {
  var proto  = pv.Mark.prototype,
      stack  = pv.Mark.stack,
      oscene = pv.Mark.scene,
      oindex = proto.index;

  /** @private Sets the context. */
  function apply(scene, index) {
    pv.Mark.scene = scene;
    proto.index = index;
    if (!scene) {
        return;
    }
    
    var that = scene.mark,
        mark = that,
        ancestors = []; // that, that.parent, ..., root

    /* Set scene and index in ancestors and self; populate data stack. */
    do {
      ancestors.push(mark);
      stack.push(scene[index].data);
      
      mark.index = index;
      mark.scene = scene;

      if((mark = mark.parent)){
        index = scene.parentIndex;
        scene = scene.parent;
      }
    } while(mark);

    /* Set ancestors' scale, excluding "that"; requires top-down. */
    var k = 1; // root's scale is 1
    for (var i = ancestors.length - 1; i > 0; i--) {
      mark = ancestors[i];
      mark.scale = k; // accumulated scale on mark

      // children's scale
      k *= mark.scene[mark.index].transform.k;
    }
    
    that.scale = k;

    /* Set direct children of "that"'s scene and scale. */
    var children = that.children, n;
    if (children && (n = children.length) > 0){
      // "that" is a panel, has a transform.
      var thatInst = that.scene[that.index];
      k *= thatInst.transform.k;
      
      var childScenez = thatInst.children;
      for (var i = 0 ; i < n; i++) {
        mark = children[i];
        mark.scene = childScenez[i];
        mark.scale = k;
      }
    }
  }

  /** @private Clears the context. */
  function clear(scene/*, index*/) {
    if (!scene) return;
    var that = scene.mark,
        mark;

    /* Reset children. */
    var children = that.children;
    if (children){
      for (var i = 0, n = children.length ; i < n; i++) {
        mark = children[i];
        // It's generally faster to set to something, than to delete
        mark.scene = undefined;
        mark.scale = 1;
      }
    }
    
    /* Reset ancestors. */
    mark = that;
    var parent;
    do{
      stack.pop();
      delete mark.index; // must be deleted!
      
      if ((parent = mark.parent)) {
        // It's generally faster to set to something, than to delete
        mark.scene = undefined;
        mark.scale = 1;
      }
    } while((mark = parent));
  }

  /* Context switch, invoke the function, then switch back. */
  if(scene && scene === oscene && index === oindex){
      // already there
      try{
          f.apply(this, stack);
      } catch (ex) {
          pv.error(ex);
          throw ex;
      } finally {
          // Some guys like setting index to -1...
          pv.Mark.scene = oscene;
          proto.index = oindex;
      }
  } else {
      clear(oscene, oindex);
      apply(scene,   index);
      try {
        f.apply(this, stack);
      } catch (ex) {
          pv.error(ex);
          throw ex;
      } finally {
        clear(scene,   index);
        apply(oscene, oindex);
      }
    }
};

pv.Mark.getEventHandler = function(type, scenes, index, event){
  var handler = scenes.mark.$handlers[type];
  if(handler){
    return [handler, type, scenes, index, event];
  }
   
  var parentScenes = scenes.parent;
  if(parentScenes){
    return this.getEventHandler(type, parentScenes, scenes.parentIndex, event);
  }
};

/** @private Execute the event listener, then re-render the returned mark. */
pv.Mark.dispatch = function(type, scenes, index, event) {
  
  var root = scenes.mark.root;
  if(root.animatingCount) { return true; }
  var handlerInfo;
  var interceptors = root.$interceptors && root.$interceptors[type];
  if(interceptors) {
    for(var i = 0, L = interceptors.length ; i < L ; i++) {
      handlerInfo = interceptors[i](type, event);
      if(handlerInfo) { break; }

      if(handlerInfo === false) { return true; } // Consider handled
    }
  }

  if(!handlerInfo) {
    handlerInfo = this.getEventHandler(type, scenes, index, event);
    if(!handlerInfo) { return false; }
  }

  return this.handle.apply(this, handlerInfo);
};

pv.Mark.handle = function(handler, type, scenes, index, event){
    var m = scenes.mark;
    
    m.context(scenes, index, function(){
      var stack = pv.Mark.stack.concat(event);
      if(handler instanceof Array) {
          var ms;
        handler.forEach(function(hi) {
            var mi = hi.apply(m, stack);
            if(mi && mi.render) {
                (ms || (ms = [])).push(mi);
          }
          });
          
          if(ms) {
              ms.forEach(function(mi){
                mi.render();
        });
          }
        } else {
        m = handler.apply(m, stack);
        if (m && m.render) {
            m.render();
        }
      }
  });
  
  return true;
};

/**
 * Registers an event interceptor function.
 * 
 * @param {string} type the event type
 * @param {function} handler the interceptor function
 * @param {boolean} [before=false] indicates that the interceptor should be applied <i>before</i> "after" interceptors
 */
pv.Mark.prototype.addEventInterceptor = function(type, handler, before){
    var root = this.root;
    if(root){
        var interceptors = root.$interceptors || (root.$interceptors = {});
        var list = interceptors[type] || (interceptors[type] = []);
        if(before){
            list.unshift(handler);
        } else {
            list.push(handler);
        }
    }
};

/**
 * Iterates through all visible instances that
 * this mark has rendered.
 */
pv.Mark.prototype.eachInstance = function(fun, ctx){
    var mark = this,
        indexes = [];

    /* Go up to the root and register our way back.
     * The root mark never "looses" its scene.
     */
    while(mark.parent){
        indexes.unshift(mark.childIndex);
        mark = mark.parent;
    }

    // mark != null

    // root scene exists if rendered at least once
    var rootScene = mark.scene;
    if(!rootScene){
        return;
    }
    
    var L = indexes.length;

    function mapRecursive(scene, level, toScreen){
        var D = scene.length;
        if(D > 0){
            var isLastLevel = level === L,
                childIndex;

            if(!isLastLevel) {
                childIndex = indexes[level];
            }

            for(var index = 0 ; index < D ; index++){
                var instance = scene[index];
                if(instance.visible){
                    if(level === L){
                        fun.call(ctx, scene, index, toScreen);
                    } else {
                        var childScene = instance.children[childIndex];
                        if(childScene){ // Some nodes might have not been rendered???
                        var childToScreen = toScreen
                                            .times(instance.transform)
                                            .translate(instance.left, instance.top);

                            mapRecursive(childScene, level + 1, childToScreen);
                        }
                    }
                }
            }
        }
    }

    mapRecursive(rootScene, 0, pv.Transform.identity);
};

pv.Mark.prototype.toScreenTransform = function(){
    var t = pv.Transform.identity;
    
    if(this instanceof pv.Panel) {
        t = t.translate(this.left(), this.top())
             .times(this.transform());
    }

    var parent = this.parent; // TODO : this.properties.transform ? this : this.parent
    if(parent){
        do {
            t = t.translate(parent.left(), parent.top())
                 .times(parent.transform());
        } while((parent = parent.parent));
    }
    
    return t;
};

pv.Mark.prototype.transition = function() {
  return new pv.Transition(this);
};

pv.Mark.prototype.on = function(state) {
  return this["$" + state] = new pv.Transient(this);
};

// --------------

// inset - percentage of width/height to discount on the shape, on each side
pv.Mark.prototype.getShape = function(scenes, index, inset){
    var s = scenes[index];
    if(!s.visible){
        return null;
    }
    if(inset == null){
        inset = 0;
    }
    
    var key = '_shape_inset_' + inset;
    return s[key] || (s[key] = this.getShapeCore(scenes, index, inset));
};

pv.Mark.prototype.getShapeCore = function(scenes, index, inset){
    var s  = scenes[index];
    var l = s.left;
    var t = s.top;
    var w = s.width;
    var h = s.height;
    if(inset > 0 && inset <= 1){
        var dw = inset * w;
        var dh = inset * h;
        l += dw;
        t += dh;
        w -= dw*2;
        h -= dh*2;
    }
    
    return new pv.Shape.Rect(l, t, w, h);
};
/**
 * Constructs a new mark anchor with default properties.
 *
 * @class Represents an anchor on a given mark. An anchor is itself a mark, but
 * without a visual representation. It serves only to provide useful default
 * properties that can be inherited by other marks. Each type of mark can define
 * any number of named anchors for convenience. If the concrete mark type does
 * not define an anchor implementation specifically, one will be inherited from
 * the mark's parent class.
 *
 * <p>For example, the bar mark provides anchors for its four sides: left,
 * right, top and bottom. Adding a label to the top anchor of a bar,
 *
 * <pre>bar.anchor("top").add(pv.Label);</pre>
 *
 * will render a text label on the top edge of the bar; the top anchor defines
 * the appropriate position properties (top and left), as well as text-rendering
 * properties for convenience (textAlign and textBaseline).
 *
 * <p>Note that anchors do not <i>inherit</i> from their targets; the positional
 * properties are copied from the scene graph, which guarantees that the anchors
 * are positioned correctly, even if the positional properties are not defined
 * deterministically. (In addition, it also improves performance by avoiding
 * re-evaluating expensive properties.) If you want the anchor to inherit from
 * the target, use {@link pv.Mark#extend} before adding. For example:
 *
 * <pre>bar.anchor("top").extend(bar).add(pv.Label);</pre>
 *
 * The anchor defines it's own positional properties, but other properties (such
 * as the title property, say) can be inherited using the above idiom. Also note
 * that you can override positional properties in the anchor for custom
 * behavior.
 *
 * @extends pv.Mark
 * @param {pv.Mark} target the anchor target.
 */
pv.Anchor = function(target) {
  pv.Mark.call(this);
  this.target = target;
  this.parent = target.parent;
};

pv.Anchor.prototype = pv.extend(pv.Mark)
    .property("name", String);

/**
 * The anchor name. The set of supported anchor names is dependent on the
 * concrete mark type; see the mark type for details. For example, bars support
 * left, right, top and bottom anchors.
 *
 * <p>While anchor names are typically constants, the anchor name is a true
 * property, which means you can specify a function to compute the anchor name
 * dynamically. For instance, if you wanted to alternate top and bottom anchors,
 * saying
 *
 * <pre>m.anchor(function() (this.index % 2) ? "top" : "bottom").add(pv.Dot);</pre>
 *
 * would have the desired effect.
 *
 * @type string
 * @name pv.Anchor.prototype.name
 */

/**
 * Sets the prototype of this anchor to the specified mark. Any properties not
 * defined on this mark may be inherited from the specified prototype mark, or
 * its prototype, and so on. The prototype mark need not be the same type of
 * mark as this mark. (Note that for inheritance to be useful, properties with
 * the same name on different mark types should have equivalent meaning.)
 *
 * <p>This method differs slightly from the normal mark behavior in that the
 * anchor's target is preserved.
 *
 * @param {pv.Mark} proto the new prototype.
 * @returns {pv.Anchor} this anchor.
 * @see pv.Mark#add
 */
pv.Anchor.prototype.extend = function(proto) {
  this.proto = proto;
  return this;
};
/**
 * Constructs a new area mark with default properties. Areas are not typically
 * constructed directly, but by adding to a panel or an existing mark via
 * {@link pv.Mark#add}.
 *
 * @class Represents an area mark: the solid area between two series of
 * connected line segments. Unsurprisingly, areas are used most frequently for
 * area charts.
 *
 * <p>Just as a line represents a polyline, the <tt>Area</tt> mark type
 * represents a <i>polygon</i>. However, an area is not an arbitrary polygon;
 * vertices are paired either horizontally or vertically into parallel
 * <i>spans</i>, and each span corresponds to an associated datum. Either the
 * width or the height must be specified, but not both; this determines whether
 * the area is horizontally-oriented or vertically-oriented.  Like lines, areas
 * can be stroked and filled with arbitrary colors.
 *
 * <p>See also the <a href="../../api/Area.html">Area guide</a>.
 *
 * @extends pv.Mark
 */
pv.Area = function() {
  pv.Mark.call(this);
};

pv.Area.castSegmented = function(v){
  if(!v){
    return '';
  }
  
  switch(v){
    case 'smart':
    case 'full':
      break;
    
    default:
      v = 'full';
  }
  
  return v;
};

pv.Area.prototype = pv.extend(pv.Mark)
    .property("width", Number)
    .property("height", Number)
    .property("lineWidth", Number)
    .property("lineJoin",   String)
    .property("strokeMiterLimit", Number)
    .property("lineCap",   String)
    .property("strokeDasharray", String)
    .property("strokeStyle", pv.fillStyle)
    .property("fillStyle", pv.fillStyle)
    .property("segmented", pv.Area.castSegmented)
    .property("interpolate", String)
    .property("tension", Number);

pv.Area.prototype.type = "area";

/**
 * The width of a given span, in pixels; used for horizontal spans. If the width
 * is specified, the height property should be 0 (the default). Either the top
 * or bottom property should be used to space the spans vertically, typically as
 * a multiple of the index.
 *
 * @type number
 * @name pv.Area.prototype.width
 */

/**
 * The height of a given span, in pixels; used for vertical spans. If the height
 * is specified, the width property should be 0 (the default). Either the left
 * or right property should be used to space the spans horizontally, typically
 * as a multiple of the index.
 *
 * @type number
 * @name pv.Area.prototype.height
 */

/**
 * The width of stroked lines, in pixels; used in conjunction with
 * <tt>strokeStyle</tt> to stroke the perimeter of the area. Unlike the
 * {@link Line} mark type, the entire perimeter is stroked, rather than just one
 * edge. The default value of this property is 1.5, but since the default stroke
 * style is null, area marks are not stroked by default.
 *
 * <p>This property is <i>fixed</i> for non-segmented areas. See
 * {@link pv.Mark}.
 *
 * @type number
 * @name pv.Area.prototype.lineWidth
 */

/**
 * The style of stroked lines; used in conjunction with <tt>lineWidth</tt> to
 * stroke the perimeter of the area. Unlike the {@link Line} mark type, the
 * entire perimeter is stroked, rather than just one edge. The default value of
 * this property is null, meaning areas are not stroked by default.
 *
 * <p>This property is <i>fixed</i> for non-segmented areas. See
 * {@link pv.Mark}.
 *
 * @type string
 * @name pv.Area.prototype.strokeStyle
 * @see pv.color
 */

/**
 * The area fill style; if non-null, the interior of the polygon forming the
 * area is filled with the specified color. The default value of this property
 * is a categorical color.
 *
 * <p>This property is <i>fixed</i> for non-segmented areas. See
 * {@link pv.Mark}.
 *
 * @type string
 * @name pv.Area.prototype.fillStyle
 * @see pv.color
 */

/**
 * Whether the area is segmented; whether variations in fill style, stroke
 * style, and the other properties are treated as fixed. Rendering segmented
 * areas is noticeably slower than non-segmented areas.
 *
 * <p>This property is <i>fixed</i>. See {@link pv.Mark}.
 *
 * @type boolean
 * @name pv.Area.prototype.segmented
 */

/**
 * How to interpolate between values. Linear interpolation ("linear") is the
 * default, producing a straight line between points. For piecewise constant
 * functions (i.e., step functions), either "step-before" or "step-after" can be
 * specified. To draw open uniform b-splines, specify "basis". To draw cardinal
 * splines, specify "cardinal"; see also {@link #tension}.
 *
 * <p>This property is <i>fixed</i>. See {@link pv.Mark}.
 *
 * @type string
 * @name pv.Area.prototype.interpolate
 */

/**
 * The tension of cardinal splines; used in conjunction with
 * interpolate("cardinal"). A value between 0 and 1 draws cardinal splines with
 * the given tension. In some sense, the tension can be interpreted as the
 * "length" of the tangent; a tension of 1 will yield all zero tangents (i.e.,
 * linear interpolation), and a tension of 0 yields a Catmull-Rom spline. The
 * default value is 0.7.
 *
 * <p>This property is <i>fixed</i>. See {@link pv.Mark}.
 *
 * @type number
 * @name pv.Area.prototype.tension
 */

/**
 * Default properties for areas. By default, there is no stroke and the fill
 * style is a categorical color.
 *
 * @type pv.Area
 */
pv.Area.prototype.defaults = new pv.Area()
    .extend(pv.Mark.prototype.defaults)
    .lineWidth(1.5)
    .fillStyle(pv.Colors.category20().by(pv.parent))
    .interpolate("linear")
    .tension(.7)
    .lineJoin("miter")
    .strokeMiterLimit(8)
    .lineCap("butt")
    .strokeDasharray("none");

/** @private Sets width and height to zero if null. */
pv.Area.prototype.buildImplied = function(s) {
  if (s.height == null) s.height = 0;
  if (s.width == null) s.width = 0;
  pv.Mark.prototype.buildImplied.call(this, s);
};

/** @private Records which properties may be fixed. */
pv.Area.fixed = {
  lineWidth: 1,
  lineJoin: 1,
  strokeMiterLimit: 1,
  lineCap: 1,
  strokeStyle: 1,
  strokeDasharray: 1,
  fillStyle: 1,
  segmented: 1,
  interpolate: 1,
  tension: 1
};

/**
 * @private Make segmented required, such that this fixed property is always
 * evaluated, even if the first segment is not visible. Also cache which
 * properties are normally fixed.
 */
pv.Area.prototype.bind = function() {
  pv.Mark.prototype.bind.call(this);
  var binds = this.binds,
      required = binds.required,
      optional = binds.optional;
  for (var i = 0, n = optional.length; i < n; i++) {
    var p = optional[i];
    p.fixed = p.name in pv.Area.fixed;
    if (p.name == "segmented") {
      required.push(p);
      optional.splice(i, 1);
      i--;
      n--;
    }
  }

  /* Cache the original arrays so they can be restored on build. */
  this.binds.$required = required;
  this.binds.$optional = optional;
};

/**
 * @private Override the default build behavior such that fixed properties are
 * determined dynamically, based on the value of the (always) fixed segmented
 * property. Any fixed properties are only evaluated on the first instance,
 * although their values are propagated to subsequent instances, so that they
 * are available for property chaining and the like.
 */
pv.Area.prototype.buildInstance = function(s) {
  var binds = this.binds;

  /* Handle fixed properties on secondary instances. */
  if (this.index) {
    var fixed = binds.fixed;

    /* Determine which properties are fixed. */
    if (!fixed) {
      fixed = binds.fixed = [];
      
      function f(p) { return !p.fixed || (fixed.push(p), false); }
      
      binds.required = binds.required.filter(f);
      if (!this.scene[0].segmented) binds.optional = binds.optional.filter(f);
    }

    /* Copy fixed property values from the first instance. */
    var n = fixed.length;
    if(n){
      var firstScene = this.scene[0];
      for (var i = 0 ; i < n ; i++) {
        var p = fixed[i].name;
        s[p] = firstScene[p];
      }
    }
  }

  /* Evaluate all properties on the first instance. */
  else {
    binds.required = binds.$required;
    binds.optional = binds.$optional;
    binds.fixed = null;
  }

  pv.Mark.prototype.buildInstance.call(this, s);
};

/**
 * Constructs a new area anchor with default properties. Areas support five
 * different anchors:<ul>
 *
 * <li>top
 * <li>left
 * <li>center
 * <li>bottom
 * <li>right
 *
 * </ul>In addition to positioning properties (left, right, top bottom), the
 * anchors support text rendering properties (text-align, text-baseline). Text
 * is rendered to appear inside the area. The area anchor also propagates the
 * interpolate, eccentricity, and tension properties such that an anchored area
 * or line will match positions between control points.
 *
 * <p>For consistency with the other mark types, the anchor positions are
 * defined in terms of their opposite edge. For example, the top anchor defines
 * the bottom property, such that an area added to the top anchor grows upward.
 *
 * @param {string} name the anchor name; either a string or a property function.
 * @returns {pv.Anchor}
 */
pv.Area.prototype.anchor = function(name) {
  var scene;
  return pv.Mark.prototype.anchor.call(this, name)
    .interpolate(function() {
       return this.scene.target[this.index].interpolate;
      })
    .eccentricity(function() {
       return this.scene.target[this.index].eccentricity;
      })
    .tension(function() {
        return this.scene.target[this.index].tension;
      });
};


pv.Area.prototype.getShapeCore = function(scenes, index){
    var s = scenes[index];
    var w = (s.width  || 0),
        h = (s.height || 0),
        x = s.left,
        y = s.top;
    
    var s2 = index + 1 < scenes.length ? scenes[index + 1] : null;
    if(!s2 || !s2.visible){
        return new pv.Shape.Line(x, y, x + w, y + h);
    }
    
    var x2 = s2.left,
        y2 = s2.top,
        h2 = s2.height || 0,
        w2 = s2.width  || 0;
    
    return new pv.Shape.Polygon([
        new pv.Vector(x,       y      ),
        new pv.Vector(x2,      y2     ),
        new pv.Vector(x2 + w2, y2 + h2),
        new pv.Vector(x  + w,  y  + h )
    ]);
};
/**
 * Constructs a new bar mark with default properties. Bars are not typically
 * constructed directly, but by adding to a panel or an existing mark via
 * {@link pv.Mark#add}.
 *
 * @class Represents a bar: an axis-aligned rectangle that can be stroked and
 * filled. Bars are used for many chart types, including bar charts, histograms
 * and Gantt charts. Bars can also be used as decorations, for example to draw a
 * frame border around a panel; in fact, a panel is a special type (a subclass)
 * of bar.
 *
 * <p>Bars can be positioned in several ways. Most commonly, one of the four
 * corners is fixed using two margins, and then the width and height properties
 * determine the extent of the bar relative to this fixed location. For example,
 * using the bottom and left properties fixes the bottom-left corner; the width
 * then extends to the right, while the height extends to the top. As an
 * alternative to the four corners, a bar can be positioned exclusively using
 * margins; this is convenient as an inset from the containing panel, for
 * example. See {@link pv.Mark} for details on the prioritization of redundant
 * positioning properties.
 *
 * <p>See also the <a href="../../api/Bar.html">Bar guide</a>.
 *
 * @extends pv.Mark
 */
pv.Bar = function() {
  pv.Mark.call(this);
};

pv.Bar.prototype = pv.extend(pv.Mark)
    .property("width", Number)
    .property("height", Number)
    .property("lineWidth", Number)
    .property("strokeStyle", pv.fillStyle)
    .property("fillStyle", pv.fillStyle)
    .property("lineCap",   String)
    .property("strokeDasharray", String);

pv.Bar.prototype.type = "bar";

/**
 * The width of the bar, in pixels. If the left position is specified, the bar
 * extends rightward from the left edge; if the right position is specified, the
 * bar extends leftward from the right edge.
 *
 * @type number
 * @name pv.Bar.prototype.width
 */

/**
 * The height of the bar, in pixels. If the bottom position is specified, the
 * bar extends upward from the bottom edge; if the top position is specified,
 * the bar extends downward from the top edge.
 *
 * @type number
 * @name pv.Bar.prototype.height
 */

/**
 * The width of stroked lines, in pixels; used in conjunction with
 * <tt>strokeStyle</tt> to stroke the bar's border.
 *
 * @type number
 * @name pv.Bar.prototype.lineWidth
 */

/**
 * The style of stroked lines; used in conjunction with <tt>lineWidth</tt> to
 * stroke the bar's border. The default value of this property is null, meaning
 * bars are not stroked by default.
 *
 * @type string
 * @name pv.Bar.prototype.strokeStyle
 * @see pv.color
 */

/**
 * The bar fill style; if non-null, the interior of the bar is filled with the
 * specified color. The default value of this property is a categorical color.
 *
 * @type string
 * @name pv.Bar.prototype.fillStyle
 * @see pv.color
 */

/**
 * Default properties for bars. By default, there is no stroke and the fill
 * style is a categorical color.
 *
 * @type pv.Bar
 */
pv.Bar.prototype.defaults = new pv.Bar()
    .extend(pv.Mark.prototype.defaults)
    .lineWidth(1.5)
    .fillStyle(pv.Colors.category20().by(pv.parent))
    .lineCap("butt")
    .strokeDasharray("none");
/**
 * Constructs a new dot mark with default properties. Dots are not typically
 * constructed directly, but by adding to a panel or an existing mark via
 * {@link pv.Mark#add}.
 *
 * @class Represents a dot; a dot is simply a sized glyph centered at a given
 * point that can also be stroked and filled. The <tt>size</tt> property is
 * proportional to the area of the rendered glyph to encourage meaningful visual
 * encodings. Dots can visually encode up to eight dimensions of data, though
 * this may be unwise due to integrality. See {@link pv.Mark} for details on the
 * prioritization of redundant positioning properties.
 *
 * <p>See also the <a href="../../api/Dot.html">Dot guide</a>.
 *
 * @extends pv.Mark
 */
pv.Dot = function() {
  pv.Mark.call(this);
};

pv.Dot.prototype = pv.extend(pv.Mark)
    .property("shape", String)
    .property("shapeAngle", Number)
    .property("shapeRadius", Number)
    .property("shapeSize", Number)
    .property("lineWidth", Number)
    .property("strokeStyle", pv.fillStyle)
    .property("lineCap",   String)
    .property("strokeDasharray", String)
    .property("fillStyle", pv.fillStyle);

pv.Dot.prototype.type = "dot";

/**
 * The size of the shape, in square pixels. Square pixels are used such that the
 * area of the shape is linearly proportional to the value of the
 * <tt>shapeSize</tt> property, facilitating representative encodings. This is
 * an alternative to using {@link #shapeRadius}.
 *
 * @see #shapeRadius
 * @type number
 * @name pv.Dot.prototype.shapeSize
 */

/**
 * The radius of the shape, in pixels. This is an alternative to using
 * {@link #shapeSize}.
 *
 * @see #shapeSize
 * @type number
 * @name pv.Dot.prototype.shapeRadius
 */

/**
 * The shape name. Several shapes are supported:<ul>
 *
 * <li>cross
 * <li>triangle
 * <li>diamond
 * <li>square
 * <li>circle
 * <li>tick
 * <li>bar
 *
 * </ul>These shapes can be further changed using the {@link #angle} property;
 * for instance, a cross can be turned into a plus by rotating. Similarly, the
 * tick, which is vertical by default, can be rotated horizontally. Note that
 * some shapes (cross and tick) do not have interior areas, and thus do not
 * support fill style meaningfully.
 *
 * <p>Note: it may be more natural to use the {@link pv.Rule} mark for
 * horizontal and vertical ticks. The tick shape is only necessary if angled
 * ticks are needed.
 *
 * @type string
 * @name pv.Dot.prototype.shape
 */

/**
 * The shape rotation angle, in radians. Used to rotate shapes, such as to turn
 * a cross into a plus.
 *
 * @type number
 * @name pv.Dot.prototype.shapeAngle
 */

/**
 * The width of stroked lines, in pixels; used in conjunction with
 * <tt>strokeStyle</tt> to stroke the dot's shape.
 *
 * @type number
 * @name pv.Dot.prototype.lineWidth
 */

/**
 * The style of stroked lines; used in conjunction with <tt>lineWidth</tt> to
 * stroke the dot's shape. The default value of this property is a categorical
 * color.
 *
 * @type string
 * @name pv.Dot.prototype.strokeStyle
 * @see pv.color
 */

/**
 * The fill style; if non-null, the interior of the dot is filled with the
 * specified color. The default value of this property is null, meaning dots are
 * not filled by default.
 *
 * @type string
 * @name pv.Dot.prototype.fillStyle
 * @see pv.color
 */

/**
 * Default properties for dots. By default, there is no fill and the stroke
 * style is a categorical color. The default shape is "circle" with radius 4.5.
 *
 * @type pv.Dot
 */
pv.Dot.prototype.defaults = new pv.Dot()
    .extend(pv.Mark.prototype.defaults)
    .shape("circle")
    .lineWidth(1.5)
    .strokeStyle(pv.Colors.category10().by(pv.parent))
    .lineCap("butt")
    .strokeDasharray("none");

/**
 * Constructs a new dot anchor with default properties. Dots support five
 * different anchors:<ul>
 *
 * <li>top
 * <li>left
 * <li>center
 * <li>bottom
 * <li>right
 *
 * </ul>In addition to positioning properties (left, right, top bottom), the
 * anchors support text rendering properties (text-align, text-baseline). Text is
 * rendered to appear outside the dot. Note that this behavior is different from
 * other mark anchors, which default to rendering text <i>inside</i> the mark.
 *
 * <p>For consistency with the other mark types, the anchor positions are
 * defined in terms of their opposite edge. For example, the top anchor defines
 * the bottom property, such that a bar added to the top anchor grows upward.
 *
 * @param {string} name the anchor name; either a string or a property function.
 * @returns {pv.Anchor}
 */
pv.Dot.prototype.anchor = function(name) {
  var scene;
  return pv.Mark.prototype.anchor.call(this, name)
    .left(function() {
        var s = this.scene.target[this.index];
        switch (this.name()) {
          case "bottom":
          case "top":
          case "center": return s.left;
          case "left": return null;
        }
        return s.left + s.shapeRadius;
      })
    .right(function() {
        var s = this.scene.target[this.index];
        return this.name() == "left" ? s.right + s.shapeRadius : null;
      })
    .top(function() {
        var s = this.scene.target[this.index];
        switch (this.name()) {
          case "left":
          case "right":
          case "center": return s.top;
          case "top": return null;
        }
        return s.top + s.shapeRadius;
      })
    .bottom(function() {
        var s = this.scene.target[this.index];
        return this.name() == "top" ? s.bottom + s.shapeRadius : null;
      })
    .textAlign(function() {
        switch (this.name()) {
          case "left": return "right";
          case "bottom":
          case "top":
          case "center": return "center";
        }
        return "left";
      })
    .textBaseline(function() {
        switch (this.name()) {
          case "right":
          case "left":
          case "center": return "middle";
          case "bottom": return "top";
        }
        return "bottom";
      });
};

/** @private Sets radius based on size or vice versa. */
pv.Dot.prototype.buildImplied = function(s) {
  var r = s.shapeRadius, z = s.shapeSize;
  if (r == null) {
    if (z == null) {
      s.shapeSize = 20.25;
      s.shapeRadius = 4.5;
    } else {
      s.shapeRadius = Math.sqrt(z);
    }
  } else if (z == null) {
    s.shapeSize = r * r;
  }
  pv.Mark.prototype.buildImplied.call(this, s);
};

pv.Dot.prototype.getShapeCore = function(scenes, index){
    var s = scenes[index];
    
    var radius = s.shapeRadius,
        cx = s.left,
        cy = s.top;

    // TODO: square and diamond break when angle is used
    
    switch(s.shape){
        case 'diamond':
            radius *= Math.SQRT2;
            // the following comment is for jshint
            /* falls through */
        case 'square':
        case 'cross':
            return new pv.Shape.Rect(cx - radius, cy - radius, 2*radius, 2*radius);
    }
    
    // 'circle' included
    
    return new pv.Shape.Circle(cx, cy, radius);
};
/**
 * Constructs a new label mark with default properties. Labels are not typically
 * constructed directly, but by adding to a panel or an existing mark via
 * {@link pv.Mark#add}.
 *
 * @class Represents a text label, allowing textual annotation of other marks or
 * arbitrary text within the visualization. The character data must be plain
 * text (unicode), though the text can be styled using the {@link #font}
 * property. If rich text is needed, external HTML elements can be overlaid on
 * the canvas by hand.
 *
 * <p>Labels are positioned using the box model, similarly to {@link Dot}. Thus,
 * a label has no width or height, but merely a text anchor location. The text
 * is positioned relative to this anchor location based on the
 * {@link #textAlign}, {@link #textBaseline} and {@link #textMargin} properties.
 * Furthermore, the text may be rotated using {@link #textAngle}.
 *
 * <p>Labels ignore events, so as to not interfere with event handlers on
 * underlying marks, such as bars. In the future, we may support event handlers
 * on labels.
 *
 * <p>See also the <a href="../../api/Label.html">Label guide</a>.
 *
 * @extends pv.Mark
 */
pv.Label = function() {
  pv.Mark.call(this);
};

pv.Label.prototype = pv.extend(pv.Mark)
    .property("text", String)
    .property("font", String)
    .property("textAngle", Number)
    .property("textStyle", pv.color)
    .property("textAlign", String)
    .property("textBaseline", String)
    .property("textMargin", Number)
    .property("textDecoration", String)
    .property("textShadow", String);

pv.Label.prototype.type = "label";

/**
 * The character data to render; a string. The default value of the text
 * property is the identity function, meaning the label's associated datum will
 * be rendered using its <tt>toString</tt>.
 *
 * @type string
 * @name pv.Label.prototype.text
 */

/**
 * The font format, per the CSS Level 2 specification. The default font is "10px
 * sans-serif", for consistency with the HTML 5 canvas element specification.
 * Note that since text is not wrapped, any line-height property will be
 * ignored. The other font-style, font-variant, font-weight, font-size and
 * font-family properties are supported.
 *
 * @see <a href="http://www.w3.org/TR/CSS2/fonts.html#font-shorthand">CSS2 fonts</a>
 * @type string
 * @name pv.Label.prototype.font
 */

/**
 * The rotation angle, in radians. Text is rotated clockwise relative to the
 * anchor location. For example, with the default left alignment, an angle of
 * Math.PI / 2 causes text to proceed downwards. The default angle is zero.
 *
 * @type number
 * @name pv.Label.prototype.textAngle
 */

/**
 * The text color. The name "textStyle" is used for consistency with "fillStyle"
 * and "strokeStyle", although it might be better to rename this property (and
 * perhaps use the same name as "strokeStyle"). The default color is black.
 *
 * @type string
 * @name pv.Label.prototype.textStyle
 * @see pv.color
 */

/**
 * The horizontal text alignment. One of:<ul>
 *
 * <li>left
 * <li>center
 * <li>right
 *
 * </ul>The default horizontal alignment is left.
 *
 * @type string
 * @name pv.Label.prototype.textAlign
 */

/**
 * The vertical text alignment. One of:<ul>
 *
 * <li>top
 * <li>middle
 * <li>bottom
 *
 * </ul>The default vertical alignment is bottom.
 *
 * @type string
 * @name pv.Label.prototype.textBaseline
 */

/**
 * The text margin; may be specified in pixels, or in font-dependent units (such
 * as ".1ex"). The margin can be used to pad text away from its anchor location,
 * in a direction dependent on the horizontal and vertical alignment
 * properties. For example, if the text is left- and middle-aligned, the margin
 * shifts the text to the right. The default margin is 3 pixels.
 *
 * @type number
 * @name pv.Label.prototype.textMargin
 */

/**
 * A list of shadow effects to be applied to text, per the CSS Text Level 3
 * text-shadow property. An example specification is "0.1em 0.1em 0.1em
 * rgba(0,0,0,.5)"; the first length is the horizontal offset, the second the
 * vertical offset, and the third the blur radius.
 *
 * @see <a href="http://www.w3.org/TR/css3-text/#text-shadow">CSS3 text</a>
 * @type string
 * @name pv.Label.prototype.textShadow
 */

/**
 * A list of decoration to be applied to text, per the CSS Text Level 3
 * text-decoration property. An example specification is "underline".
 *
 * @see <a href="http://www.w3.org/TR/css3-text/#text-decoration">CSS3 text</a>
 * @type string
 * @name pv.Label.prototype.textDecoration
 */

/**
 * Default properties for labels. See the individual properties for the default
 * values.
 *
 * @type pv.Label
 */
pv.Label.prototype.defaults = new pv.Label()
    .extend(pv.Mark.prototype.defaults)
    .events("none")
    .text(pv.identity)
    .font("10px sans-serif")
    .textAngle(0)
    .textStyle("black")
    .textAlign("left")
    .textBaseline("bottom")
    .textMargin(3);


pv.Label.prototype.getShapeCore = function(scenes, index, inset){
    var s = scenes[index];

    var size = pv.Text.measure(s.text, s.font);
    var l = s.left;
    var t = s.top;
    var w = size.width;
    var h = size.height;
    if(inset > 0 && inset <= 1){
        var dw = inset * w;
        var dh = inset * h;
        l += dw;
        t += dh;
        w -= dw*2;
        h -= dh*2;
    }
    
    return pv.Label.getPolygon(
            w,
            h,
            s.textAlign,
            s.textBaseline,
            s.textAngle,
            s.textMargin)
            .apply(pv.Transform.identity.translate(l, t));
};

pv.Label.getPolygon = function(textWidth, textHeight, align, baseline, angle, margin){
    // x, y are the position of the left-bottom corner
    // of the text relative to its anchor point (at x=0,y=0)
    // x points right, y points down
    var x, y;
    
    switch (baseline) {
        case "middle":
            y = textHeight / 2; // estimate middle (textHeight is not em, the height of capital M)
            break;
          
        case "top":
            y = margin + textHeight;
            break;
      
        case "bottom":
            y = -margin; 
            break;
    }
    
    switch (align) {
        case "right": 
            x = -margin -textWidth; 
            break;
      
        case "center": 
            x = -textWidth / 2;
            break;
      
        case "left": 
            x = margin;
            break;
    }
    
    var bl = new pv.Vector(x, y);
    var br = bl.plus(textWidth, 0);
    var tr = br.plus(0, -textHeight);
    var tl = bl.plus(0, -textHeight);
    
    // Rotate
    
    if(angle !== 0){
        bl = bl.rotate(angle);
        br = br.rotate(angle);
        tl = tl.rotate(angle);
        tr = tr.rotate(angle);
    }
    
    return new pv.Shape.Polygon([bl, br, tr, tl]);
};
/**
 * Constructs a new line mark with default properties. Lines are not typically
 * constructed directly, but by adding to a panel or an existing mark via
 * {@link pv.Mark#add}.
 *
 * @class Represents a series of connected line segments, or <i>polyline</i>,
 * that can be stroked with a configurable color and thickness. Each
 * articulation point in the line corresponds to a datum; for <i>n</i> points,
 * <i>n</i>-1 connected line segments are drawn. The point is positioned using
 * the box model. Arbitrary paths are also possible, allowing radar plots and
 * other custom visualizations.
 *
 * <p>Like areas, lines can be stroked and filled with arbitrary colors. In most
 * cases, lines are only stroked, but the fill style can be used to construct
 * arbitrary polygons.
 *
 * <p>See also the <a href="../../api/Line.html">Line guide</a>.
 *
 * @extends pv.Mark
 */
pv.Line = function() {
  pv.Mark.call(this);
};

pv.Line.prototype = pv.extend(pv.Mark)
    .property("lineWidth", Number)
    .property("lineJoin",  String)
    .property("strokeMiterLimit", Number)
    .property("lineCap",   String)
    .property("strokeStyle", pv.fillStyle)
    .property("strokeDasharray", String)
    .property("fillStyle", pv.fillStyle)
    .property("segmented", pv.Area.castSegmented)
    .property("interpolate", String)
    .property("eccentricity", Number)
    .property("tension", Number);

pv.Line.prototype.type = "line";

/**
 * The width of stroked lines, in pixels; used in conjunction with
 * <tt>strokeStyle</tt> to stroke the line.
 *
 * @type number
 * @name pv.Line.prototype.lineWidth
 */

/**
 * The style of stroked lines; used in conjunction with <tt>lineWidth</tt> to
 * stroke the line. The default value of this property is a categorical color.
 *
 * @type string
 * @name pv.Line.prototype.strokeStyle
 * @see pv.color
 */

/**
 * The type of corners where two lines meet. Accepted values are "bevel",
 * "round" and "miter". The default value is "miter".
 *
 * <p>For segmented lines, only "miter" joins and "linear" interpolation are
 * currently supported. Any other value, including null, will disable joins,
 * producing disjoint line segments. Note that the miter joins must be computed
 * manually (at least in the current SVG renderer); since this calculation may
 * be expensive and unnecessary for small lines, specifying null can improve
 * performance significantly.
 *
 * <p>This property is <i>fixed</i>. See {@link pv.Mark}.
 *
 * @type string
 * @name pv.Line.prototype.lineJoin
 */

/**
 * The line fill style; if non-null, the interior of the line is closed and
 * filled with the specified color. The default value of this property is a
 * null, meaning that lines are not filled by default.
 *
 * <p>This property is <i>fixed</i>. See {@link pv.Mark}.
 *
 * @type string
 * @name pv.Line.prototype.fillStyle
 * @see pv.color
 */

/**
 * Whether the line is segmented; whether variations in stroke style, line width
 * and the other properties are treated as fixed. Rendering segmented lines is
 * noticeably slower than non-segmented lines.
 *
 * <p>This property is <i>fixed</i>. See {@link pv.Mark}.
 *
 * @type boolean
 * @name pv.Line.prototype.segmented
 */

/**
 * How to interpolate between values. Linear interpolation ("linear") is the
 * default, producing a straight line between points. For piecewise constant
 * functions (i.e., step functions), either "step-before" or "step-after" can be
 * specified. To draw a clockwise circular arc between points, specify "polar";
 * to draw a counterclockwise circular arc between points, specify
 * "polar-reverse". To draw open uniform b-splines, specify "basis". To draw
 * cardinal splines, specify "cardinal"; see also {@link #tension}.
 *
 * <p>This property is <i>fixed</i>. See {@link pv.Mark}.
 *
 * @type string
 * @name pv.Line.prototype.interpolate
 */

/**
 * The eccentricity of polar line segments; used in conjunction with
 * interpolate("polar"). The default value of 0 means that line segments are
 * drawn as circular arcs. A value of 1 draws a straight line. A value between 0
 * and 1 draws an elliptical arc with the given eccentricity.
 *
 * @type number
 * @name pv.Line.prototype.eccentricity
 */

/**
 * The tension of cardinal splines; used in conjunction with
 * interpolate("cardinal"). A value between 0 and 1 draws cardinal splines with
 * the given tension. In some sense, the tension can be interpreted as the
 * "length" of the tangent; a tension of 1 will yield all zero tangents (i.e.,
 * linear interpolation), and a tension of 0 yields a Catmull-Rom spline. The
 * default value is 0.7.
 *
 * <p>This property is <i>fixed</i>. See {@link pv.Mark}.
 *
 * @type number
 * @name pv.Line.prototype.tension
 */

/**
 * Default properties for lines. By default, there is no fill and the stroke
 * style is a categorical color. The default interpolation is linear.
 *
 * @type pv.Line
 */
pv.Line.prototype.defaults = new pv.Line()
    .extend(pv.Mark.prototype.defaults)
    .lineWidth(1.5)
    .strokeStyle(pv.Colors.category10().by(pv.parent))
    .interpolate("linear")
    .eccentricity(0)
    .tension(.7)
    .lineJoin("miter")
    .strokeMiterLimit(8)
    .lineCap("butt")
    .strokeDasharray("none");

/** @private Reuse Area's implementation for segmented bind & build. */
pv.Line.prototype.bind = pv.Area.prototype.bind;
pv.Line.prototype.buildInstance = pv.Area.prototype.buildInstance;

/**
 * Constructs a new line anchor with default properties. Lines support five
 * different anchors:<ul>
 *
 * <li>top
 * <li>left
 * <li>center
 * <li>bottom
 * <li>right
 *
 * </ul>In addition to positioning properties (left, right, top bottom), the
 * anchors support text rendering properties (text-align, text-baseline). Text is
 * rendered to appear outside the line. Note that this behavior is different
 * from other mark anchors, which default to rendering text <i>inside</i> the
 * mark.
 *
 * <p>For consistency with the other mark types, the anchor positions are
 * defined in terms of their opposite edge. For example, the top anchor defines
 * the bottom property, such that a bar added to the top anchor grows upward.
 *
 * @param {string} name the anchor name; either a string or a property function.
 * @returns {pv.Anchor}
 */
pv.Line.prototype.anchor = function(name) {
  return pv.Area.prototype.anchor.call(this, name)
    .textAlign(function(d) {
        switch (this.name()) {
          case "left": return "right";
          case "bottom":
          case "top":
          case "center": return "center";
          case "right": return "left";
        }
      })
    .textBaseline(function(d) {
        switch (this.name()) {
          case "right":
          case "left":
          case "center": return "middle";
          case "top": return "bottom";
          case "bottom": return "top";
        }
      });
};

pv.Line.prototype.getShapeCore = function(scenes, index){
    var s  = scenes[index];
    var s2 = index + 1 < scenes.length ? scenes[index + 1] : null;
    if(s2 == null || !s2.visible){
        return new pv.Shape.Point(s.left, s.top);
    }
    
    return new pv.Shape.Line(s.left, s.top, s2.left, s2.top);
};
/**
 * Constructs a new rule with default properties. Rules are not typically
 * constructed directly, but by adding to a panel or an existing mark via
 * {@link pv.Mark#add}.
 *
 * @class Represents a horizontal or vertical rule. Rules are frequently used
 * for axes and grid lines. For example, specifying only the bottom property
 * draws horizontal rules, while specifying only the left draws vertical
 * rules. Rules can also be used as thin bars. The visual style is controlled in
 * the same manner as lines.
 *
 * <p>Rules are positioned exclusively the standard box model properties. The
 * following combinations of properties are supported:
 *
 * <table>
 * <thead><th style="width:12em;">Properties</th><th>Orientation</th></thead>
 * <tbody>
 * <tr><td>left</td><td>vertical</td></tr>
 * <tr><td>right</td><td>vertical</td></tr>
 * <tr><td>left, bottom, top</td><td>vertical</td></tr>
 * <tr><td>right, bottom, top</td><td>vertical</td></tr>
 * <tr><td>top</td><td>horizontal</td></tr>
 * <tr><td>bottom</td><td>horizontal</td></tr>
 * <tr><td>top, left, right</td><td>horizontal</td></tr>
 * <tr><td>bottom, left, right</td><td>horizontal</td></tr>
 * <tr><td>left, top, height</td><td>vertical</td></tr>
 * <tr><td>left, bottom, height</td><td>vertical</td></tr>
 * <tr><td>right, top, height</td><td>vertical</td></tr>
 * <tr><td>right, bottom, height</td><td>vertical</td></tr>
 * <tr><td>left, top, width</td><td>horizontal</td></tr>
 * <tr><td>left, bottom, width</td><td>horizontal</td></tr>
 * <tr><td>right, top, width</td><td>horizontal</td></tr>
 * <tr><td>right, bottom, width</td><td>horizontal</td></tr>
 * </tbody>
 * </table>
 *
 * <p>Small rules can be used as tick marks; alternatively, a {@link Dot} with
 * the "tick" shape can be used.
 *
 * <p>See also the <a href="../../api/Rule.html">Rule guide</a>.
 *
 * @see pv.Line
 * @extends pv.Mark
 */
pv.Rule = function() {
  pv.Mark.call(this);
};

pv.Rule.prototype = pv.extend(pv.Mark)
    .property("width", Number)
    .property("height", Number)
    .property("lineWidth", Number)
    .property("strokeStyle", pv.fillStyle)
    .property("lineCap",   String)
    .property("strokeDasharray", String);

pv.Rule.prototype.type = "rule";

/**
 * The width of the rule, in pixels. If the left position is specified, the rule
 * extends rightward from the left edge; if the right position is specified, the
 * rule extends leftward from the right edge.
 *
 * @type number
 * @name pv.Rule.prototype.width
 */

/**
 * The height of the rule, in pixels. If the bottom position is specified, the
 * rule extends upward from the bottom edge; if the top position is specified,
 * the rule extends downward from the top edge.
 *
 * @type number
 * @name pv.Rule.prototype.height
 */

/**
 * The width of stroked lines, in pixels; used in conjunction with
 * <tt>strokeStyle</tt> to stroke the rule. The default value is 1 pixel.
 *
 * @type number
 * @name pv.Rule.prototype.lineWidth
 */

/**
 * The style of stroked lines; used in conjunction with <tt>lineWidth</tt> to
 * stroke the rule. The default value of this property is black.
 *
 * @type string
 * @name pv.Rule.prototype.strokeStyle
 * @see pv.color
 */

/**
 * Default properties for rules. By default, a single-pixel black line is
 * stroked.
 *
 * @type pv.Rule
 */
pv.Rule.prototype.defaults = new pv.Rule()
    .extend(pv.Mark.prototype.defaults)
    .lineWidth(1)
    .strokeStyle("black")
    .antialias(false)
    .lineCap("butt")
    .strokeDasharray("none");

/**
 * Constructs a new rule anchor with default properties. Rules support five
 * different anchors:<ul>
 *
 * <li>top
 * <li>left
 * <li>center
 * <li>bottom
 * <li>right
 *
 * </ul>In addition to positioning properties (left, right, top bottom), the
 * anchors support text rendering properties (text-align, text-baseline). Text is
 * rendered to appear outside the rule. Note that this behavior is different
 * from other mark anchors, which default to rendering text <i>inside</i> the
 * mark.
 *
 * <p>For consistency with the other mark types, the anchor positions are
 * defined in terms of their opposite edge. For example, the top anchor defines
 * the bottom property, such that a bar added to the top anchor grows upward.
 *
 * @param {string} name the anchor name; either a string or a property function.
 * @returns {pv.Anchor}
 */
pv.Rule.prototype.anchor = pv.Line.prototype.anchor;

/** @private Sets width or height based on orientation. */
pv.Rule.prototype.buildImplied = function(s) {
  var l = s.left, r = s.right, t = s.top, b = s.bottom;

  /* Determine horizontal or vertical orientation. */
  if ((s.width != null)
      || ((l == null) && (r == null))
      || ((r != null) && (l != null))) {
    s.height = 0;
  } else {
    s.width = 0;
  }

  pv.Mark.prototype.buildImplied.call(this, s);
};

pv.Rule.prototype.getShapeCore = function(scenes, index){
    var s = scenes[index];
    return new pv.Shape.Line(
        s.left,           s.top, 
        s.left + s.width, s.top + s.height);
};

/**
 * Constructs a new, empty panel with default properties. Panels, with the
 * exception of the root panel, are not typically constructed directly; instead,
 * they are added to an existing panel or mark via {@link pv.Mark#add}.
 *
 * @class Represents a container mark. Panels allow repeated or nested
 * structures, commonly used in small multiple displays where a small
 * visualization is tiled to facilitate comparison across one or more
 * dimensions. Other types of visualizations may benefit from repeated and
 * possibly overlapping structure as well, such as stacked area charts. Panels
 * can also offset the position of marks to provide padding from surrounding
 * content.
 *
 * <p>All Protovis displays have at least one panel; this is the root panel to
 * which marks are rendered. The box model properties (four margins, width and
 * height) are used to offset the positions of contained marks. The data
 * property determines the panel count: a panel is generated once per associated
 * datum. When nested panels are used, property functions can declare additional
 * arguments to access the data associated with enclosing panels.
 *
 * <p>Panels can be rendered inline, facilitating the creation of sparklines.
 * This allows designers to reuse browser layout features, such as text flow and
 * tables; designers can also overlay HTML elements such as rich text and
 * images.
 *
 * <p>All panels have a <tt>children</tt> array (possibly empty) containing the
 * child marks in the order they were added. Panels also have a <tt>root</tt>
 * field which points to the root (outermost) panel; the root panel's root field
 * points to itself.
 *
 * <p>See also the <a href="../../api/">Protovis guide</a>.
 *
 * @extends pv.Bar
 */
pv.Panel = function() {
  pv.Bar.call(this);

  /**
   * The child marks; zero or more {@link pv.Mark}s in the order they were
   * added.
   *
   * @see #add
   * @type pv.Mark[]
   */
  this.children = [];
  this.root = this;

  /**
   * The internal $dom field is set by the Protovis loader; see lang/init.js. It
   * refers to the script element that contains the Protovis specification, so
   * that the panel knows where in the DOM to insert the generated SVG element.
   *
   * @private
   */
  this.$dom = pv.$ && pv.$.s;
};

pv.Panel.prototype = pv.extend(pv.Bar)
    .property("transform")
    .property("overflow", String)
    .property("canvas", function(c) {
        return (typeof c == "string")
            ? document.getElementById(c)
            : c; // assume that c is the passed-in element
      });

pv.Panel.prototype.type = "panel";

/**
 * The canvas element; either the string ID of the canvas element in the current
 * document, or a reference to the canvas element itself. If null, a canvas
 * element will be created and inserted into the document at the location of the
 * script element containing the current Protovis specification. This property
 * only applies to root panels and is ignored on nested panels.
 *
 * <p>Note: the "canvas" element here refers to a <tt>div</tt> (or other suitable
 * HTML container element), <i>not</i> a <tt>canvas</tt> element. The name of
 * this property is a historical anachronism from the first implementation that
 * used HTML 5 canvas, rather than SVG.
 *
 * @type string
 * @name pv.Panel.prototype.canvas
 */

/**
 * Specifies whether child marks are clipped when they overflow this panel.
 * This affects the clipping of all this panel's descendant marks.
 *
 * @type string
 * @name pv.Panel.prototype.overflow
 * @see <a href="http://www.w3.org/TR/CSS2/visufx.html#overflow">CSS2</a>
 */

/**
 * The transform to be applied to child marks. The default transform is
 * identity, which has no effect. Note that the panel's own fill and stroke are
 * not affected by the transform, and panel's transform only affects the
 * <tt>scale</tt> of child marks, not the panel itself.
 *
 * @type pv.Transform
 * @name pv.Panel.prototype.transform
 * @see pv.Mark#scale
 */

/**
 * The number of descendant marks that are animating.
 * Only the root panel has this property set.
 * 
 * @type number
 */
pv.Panel.prototype.animatingCount = 0;


/**
 * The number of children that have a non-zero {@link pv.Mark#_zOrder}.
 * 
 *  @type number
 */
pv.Panel.prototype.zOrderChildCount = 0;

/**
 * Default properties for panels. By default, the margins are zero, the fill
 * style is transparent.
 *
 * @type pv.Panel
 */
pv.Panel.prototype.defaults = new pv.Panel()
    .extend(pv.Bar.prototype.defaults)
    .fillStyle(null) // override Bar default
    .overflow("visible");

/**
 * Returns an anchor with the specified name. This method is overridden such
 * that adding to a panel's anchor adds to the panel, rather than to the panel's
 * parent.
 *
 * @param {string} name the anchor name; either a string or a property function.
 * @returns {pv.Anchor} the new anchor.
 */
pv.Panel.prototype.anchor = function(name) {
  var anchor = pv.Bar.prototype.anchor.call(this, name);
  anchor.parent = this;
  return anchor;
};

/**
 * Adds a new mark of the specified type to this panel. Unlike the normal
 * {@link Mark#add} behavior, adding a mark to a panel does not cause the mark
 * to inherit from the panel. Since the contained marks are offset by the panel
 * margins already, inheriting properties is generally undesirable; of course,
 * it is always possible to change this behavior by calling {@link Mark#extend}
 * explicitly.
 *
 * @param {function} Type the type of the new mark to add.
 * @returns {pv.Mark} the new mark.
 */
pv.Panel.prototype.add = function(Type) {
  var child = new Type();
  child.parent = this;
  child.root = this.root;
  child.childIndex = this.children.length;
  this.children.push(child);
  return child;
};

/** @private Bind this panel, then any child marks recursively. */
pv.Panel.prototype.bind = function() {
  pv.Mark.prototype.bind.call(this);
  
  var children = this.children;
  for (var i = 0, n = children.length ; i < n ; i++) {
    children[i].bind();
  }
};

/**
 * @private Evaluates all of the properties for this panel for the specified
 * instance <tt>s</tt> in the scene graph, including recursively building the
 * scene graph for child marks.
 *
 * @param s a node in the scene graph; the instance of the panel to build.
 * @see Mark#scene
 */
pv.Panel.prototype.buildInstance = function(s) {
  pv.Bar.prototype.buildInstance.call(this, s);
  
  if (!s.visible) return;
  
  /*
   * Multiply the current scale factor by this panel's transform. Also clear the
   * default index as we recurse into child marks; it will be reset to the
   * current index when the next panel instance is built.
   */
  var scale = this.scale * s.transform.k;
  pv.Mark.prototype.index = -1;

  /*
   * Build each child, passing in the parent (this panel) scene graph node. The
   * child mark's scene is initialized from the corresponding entry in the
   * existing scene graph, such that properties from the previous build can be
   * reused; this is largely to facilitate the recycling of SVG elements.
   */
  var child;
  var children = this.children;
  var childScenes = s.children || (s.children = []);
  for (var i = 0, n = children.length; i < n; i++) {
    child = children[i];
    child.scene = childScenes[i]; // possibly undefined
    child.scale = scale;
    child.build();
  }

  /*
   * Once the child marks have been built, the new scene graph nodes are removed
   * from the child marks and placed into the scene graph. The nodes cannot
   * remain on the child nodes because this panel (or a parent panel) may be
   * instantiated multiple times!
   */
  i = n;
  while(i--) {
    child = children[i];
    childScenes[i] = child.scene;
    delete child.scene;
    delete child.scale;
  }

  /* Delete any expired child scenes. */
  childScenes.length = n;
};

/**
 * @private Computes the implied properties for this panel for the specified
 * instance <tt>s</tt> in the scene graph. Panels have two implied
 * properties:<ul>
 *
 * <li>The <tt>canvas</tt> property references the DOM element, typically a DIV,
 * that contains the SVG element that is used to display the visualization. This
 * property may be specified as a string, referring to the unique ID of the
 * element in the DOM. The string is converted to a reference to the DOM
 * element. The width and height of the SVG element is inferred from this DOM
 * element. If no canvas property is specified, a new SVG element is created and
 * inserted into the document, using the panel dimensions; see
 * {@link #createCanvas}.
 *
 * <li>The <tt>children</tt> array, while not a property per se, contains the
 * scene graph for each child mark. This array is initialized to be empty, and
 * is populated above in {@link #buildInstance}.
 *
 * </ul>The current implementation creates the SVG element, if necessary, during
 * the build phase; in the future, it may be preferrable to move this to the
 * update phase, although then the canvas property would be undefined. In
 * addition, DOM inspection is necessary to define the implied width and height
 * properties that may be inferred from the DOM.
 *
 * @param s a node in the scene graph; the instance of the panel to build.
 */
pv.Panel.prototype.buildImplied = function(s) {
  if (!this.parent) {
    var c = s.canvas;
    if (pv.renderer() === "batik") {
      if (c) {
        if (c.$panel != this) {
          pv.Panel.updateCreateId(c);
          c.$panel = this;
          while (c.lastChild) c.removeChild(c.lastChild);
        }
      } else {
        c = document.lastChild;
      }
    } else if (c) {
      /* Clear the container if it's not associated with this panel. */
      if (c.$panel != this) {
        pv.Panel.updateCreateId(c);
        c.$panel = this;
        while (c.lastChild) c.removeChild(c.lastChild);
      }

      /* If width and height weren't specified, inspect the container. */
      var w, h, cssStyle;
      if (s.width == null) {
        cssStyle = pv.cssStyle(c);
        w = parseFloat(cssStyle("width") || 0);
        s.width = w - s.left - s.right;
      }
      if (s.height == null) {
        cssStyle || (cssStyle = pv.cssStyle(c));
        h = parseFloat(pv.cssStyle("height") || 0);
        s.height = h - s.top - s.bottom;
      }
      cssStyle = null;
    } else {
      var cache = this.$canvas || (this.$canvas = []);
      if (!(c = cache[this.index])) {
        c = cache[this.index] =  document.createElement(pv.renderer() == "svgweb" ? "div" : "span"); // SVGWeb requires a div, not a span
        if (this.$dom) { // script element for text/javascript+protovis
          this.$dom.parentNode.insertBefore(c, this.$dom);
        } else { // find the last element in the body
          var n = document.body;
          while (n.lastChild && n.lastChild.tagName) n = n.lastChild;
          if (n != document.body) n = n.parentNode;
          n.appendChild(c);
        }
      }
    }
    s.canvas = c;
  }
  if (!s.transform) s.transform = pv.Transform.identity;
  pv.Mark.prototype.buildImplied.call(this, s);
};

pv.Panel.updateCreateId = function(c){
    c.$pvCreateId = (c.$pvCreateId || 0) + 1;
};
/**
 * Constructs a new image with default properties. Images are not typically
 * constructed directly, but by adding to a panel or an existing mark via
 * {@link pv.Mark#add}.
 *
 * @class Represents an image, either a static resource or a dynamically-
 * generated pixel buffer. Images share the same layout and style properties as
 * bars. The external image resource is specified via the {@link #url}
 * property. The optional fill, if specified, appears beneath the image, while
 * the optional stroke appears above the image.
 *
 * <p>Dynamic images such as heatmaps are supported using the {@link #image}
 * psuedo-property. This function is passed the <i>x</i> and <i>y</i> index, in
 * addition to the current data stack. The return value is a {@link pv.Color},
 * or null for transparent. A string can also be returned, which will be parsed
 * into a color; however, it is typically much faster to return an object with
 * <tt>r</tt>, <tt>g</tt>, <tt>b</tt> and <tt>a</tt> attributes, to avoid the
 * cost of parsing and object instantiation.
 *
 * <p>See {@link pv.Bar} for details on positioning properties.
 *
 * @extends pv.Bar
 */
pv.Image = function() {
  pv.Bar.call(this);
};

pv.Image.prototype = pv.extend(pv.Bar)
    .property("url", String)
    .property("imageWidth", Number)
    .property("imageHeight", Number);

pv.Image.prototype.type = "image";

/**
 * The URL of the image to display. The set of supported image types is
 * browser-dependent; PNG and JPEG are recommended.
 *
 * @type string
 * @name pv.Image.prototype.url
 */

/**
 * The width of the image in pixels. For static images, this property is
 * computed implicitly from the loaded image resources. For dynamic images, this
 * property can be used to specify the width of the pixel buffer; otherwise, the
 * value is derived from the <tt>width</tt> property.
 *
 * @type number
 * @name pv.Image.prototype.imageWidth
 */

/**
 * The height of the image in pixels. For static images, this property is
 * computed implicitly from the loaded image resources. For dynamic images, this
 * property can be used to specify the height of the pixel buffer; otherwise, the
 * value is derived from the <tt>height</tt> property.
 *
 * @type number
 * @name pv.Image.prototype.imageHeight
 */

/**
 * Default properties for images. By default, there is no stroke or fill style.
 *
 * @type pv.Image
 */
pv.Image.prototype.defaults = new pv.Image()
    .extend(pv.Bar.prototype.defaults)
    .fillStyle(null);

/**
 * Specifies the dynamic image function. By default, no image function is
 * specified and the <tt>url</tt> property is used to load a static image
 * resource. If an image function is specified, it will be invoked for each
 * pixel in the image, based on the related <tt>imageWidth</tt> and
 * <tt>imageHeight</tt> properties.
 *
 * <p>For example, given a two-dimensional array <tt>heatmap</tt>, containing
 * numbers in the range [0, 1] in row-major order, a simple monochrome heatmap
 * image can be specified as:
 *
 * <pre>vis.add(pv.Image)
 *     .imageWidth(heatmap[0].length)
 *     .imageHeight(heatmap.length)
 *     .image(pv.ramp("white", "black").by(function(x, y) heatmap[y][x]));</pre>
 *
 * For fastest performance, use an ordinal scale which caches the fixed color
 * palette, or return an object literal with <tt>r</tt>, <tt>g</tt>, <tt>b</tt>
 * and <tt>a</tt> attributes. A {@link pv.Color} or string can also be returned,
 * though this typically results in slower performance.
 *
 * @param {function} f the new sizing function.
 * @returns {pv.Layout.Pack} this.
 */
pv.Image.prototype.image = function(f) {
  /** @private */
  this.$image = function() {
      var c = f.apply(this, arguments);
      return c == null ? pv.Color.transparent
          : typeof c == "string" ? pv.color(c)
          : c;
    };
  return this;
};

/** @private Scan the proto chain for an image function. */
pv.Image.prototype.bind = function() {
  pv.Bar.prototype.bind.call(this);
  var binds = this.binds, mark = this;
  do {
    binds.image = mark.$image;
  } while (!binds.image && (mark = mark.proto));
};

/** @private */
pv.Image.prototype.buildImplied = function(s) {
  pv.Bar.prototype.buildImplied.call(this, s);
  if (!s.visible) return;

  /* Compute the implied image dimensions. */
  if (s.imageWidth == null) s.imageWidth = s.width;
  if (s.imageHeight == null) s.imageHeight = s.height;

  /* Compute the pixel values. */
  if ((s.url == null) && this.binds.image) {

    /* Cache the canvas element to reuse across renders. */
    var canvas = this.$canvas || (this.$canvas = document.createElement("canvas")),
        context = canvas.getContext("2d"),
        w = s.imageWidth,
        h = s.imageHeight,
        stack = pv.Mark.stack,
        data;

    /* Evaluate the image function, storing into a CanvasPixelArray. */
    canvas.width = w;
    canvas.height = h;
    data = (s.image = context.createImageData(w, h)).data;
    stack.unshift(null, null);
    for (var y = 0, p = 0; y < h; y++) {
      stack[1] = y;
      for (var x = 0; x < w; x++) {
        stack[0] = x;
        var color = this.binds.image.apply(this, stack);
        data[p++] = color.r;
        data[p++] = color.g;
        data[p++] = color.b;
        data[p++] = 255 * color.a;
      }
    }
    stack.splice(0, 2);
  }
};
/**
 * Constructs a new wedge with default properties. Wedges are not typically
 * constructed directly, but by adding to a panel or an existing mark via
 * {@link pv.Mark#add}.
 *
 * @class Represents a wedge, or pie slice. Specified in terms of start and end
 * angle, inner and outer radius, wedges can be used to construct donut charts
 * and polar bar charts as well. If the {@link #angle} property is used, the end
 * angle is implied by adding this value to start angle. By default, the start
 * angle is the previously-generated wedge's end angle. This design allows
 * explicit control over the wedge placement if desired, while offering
 * convenient defaults for the construction of radial graphs.
 *
 * <p>The center point of the circle is positioned using the standard box model.
 * The wedge can be stroked and filled, similar to {@link pv.Bar}.
 *
 * <p>See also the <a href="../../api/Wedge.html">Wedge guide</a>.
 *
 * @extends pv.Mark
 */
pv.Wedge = function() {
  pv.Mark.call(this);
};

pv.Wedge.prototype = pv.extend(pv.Mark)
    .property("startAngle", Number)
    .property("endAngle", Number)
    .property("angle", Number)
    .property("innerRadius", Number)
    .property("outerRadius", Number)
    .property("lineWidth", Number)
    .property("strokeStyle", pv.fillStyle)
    .property("lineJoin",  String)
    .property("strokeMiterLimit", Number)
    .property("lineCap",   String)
    .property("strokeDasharray", String)
    .property("fillStyle", pv.fillStyle);

pv.Wedge.prototype.type = "wedge";

/**
 * The start angle of the wedge, in radians. The start angle is measured
 * clockwise from the 3 o'clock position. The default value of this property is
 * the end angle of the previous instance (the {@link Mark#sibling}), or -PI / 2
 * for the first wedge; for pie and donut charts, typically only the
 * {@link #angle} property needs to be specified.
 *
 * @type number
 * @name pv.Wedge.prototype.startAngle
 */

/**
 * The end angle of the wedge, in radians. If not specified, the end angle is
 * implied as the start angle plus the {@link #angle}.
 *
 * @type number
 * @name pv.Wedge.prototype.endAngle
 */

/**
 * The angular span of the wedge, in radians. This property is used if end angle
 * is not specified.
 *
 * @type number
 * @name pv.Wedge.prototype.angle
 */

/**
 * The inner radius of the wedge, in pixels. The default value of this property
 * is zero; a positive value will produce a donut slice rather than a pie slice.
 * The inner radius can vary per-wedge.
 *
 * @type number
 * @name pv.Wedge.prototype.innerRadius
 */

/**
 * The outer radius of the wedge, in pixels. This property is required. For
 * pies, only this radius is required; for donuts, the inner radius must be
 * specified as well. The outer radius can vary per-wedge.
 *
 * @type number
 * @name pv.Wedge.prototype.outerRadius
 */

/**
 * The width of stroked lines, in pixels; used in conjunction with
 * <tt>strokeStyle</tt> to stroke the wedge's border.
 *
 * @type number
 * @name pv.Wedge.prototype.lineWidth
 */

/**
 * The style of stroked lines; used in conjunction with <tt>lineWidth</tt> to
 * stroke the wedge's border. The default value of this property is null,
 * meaning wedges are not stroked by default.
 *
 * @type string
 * @name pv.Wedge.prototype.strokeStyle
 * @see pv.color
 */

/**
 * The wedge fill style; if non-null, the interior of the wedge is filled with
 * the specified color. The default value of this property is a categorical
 * color.
 *
 * @type string
 * @name pv.Wedge.prototype.fillStyle
 * @see pv.color
 */

/**
 * Default properties for wedges. By default, there is no stroke and the fill
 * style is a categorical color.
 *
 * @type pv.Wedge
 */
pv.Wedge.prototype.defaults = new pv.Wedge()
    .extend(pv.Mark.prototype.defaults)
    .startAngle(function() {
        var s = this.sibling();
        return s ? s.endAngle : -Math.PI / 2;
      })
    .innerRadius(0)
    .lineWidth(1.5)
    .strokeStyle(null)
    .fillStyle(pv.Colors.category20().by(pv.index))
    .lineJoin("miter")
    .strokeMiterLimit(8)
    .lineCap("butt")
    .strokeDasharray("none");

/**
 * Returns the mid-radius of the wedge, which is defined as half-way between the
 * inner and outer radii.
 *
 * @see #innerRadius
 * @see #outerRadius
 * @returns {number} the mid-radius, in pixels.
 */
pv.Wedge.prototype.midRadius = function() {
  return (this.innerRadius() + this.outerRadius()) / 2;
};

/**
 * Returns the mid-angle of the wedge, which is defined as half-way between the
 * start and end angles.
 *
 * @see #startAngle
 * @see #endAngle
 * @returns {number} the mid-angle, in radians.
 */
pv.Wedge.prototype.midAngle = function() {
  return (this.startAngle() + this.endAngle()) / 2;
};

/**
 * Constructs a new wedge anchor with default properties. Wedges support five
 * different anchors:<ul>
 *
 * <li>outer
 * <li>inner
 * <li>center
 * <li>start
 * <li>end
 *
 * </ul>In addition to positioning properties (left, right, top bottom), the
 * anchors support text rendering properties (text-align, text-baseline,
 * textAngle). Text is rendered to appear inside the wedge.
 *
 * @param {string} name the anchor name; either a string or a property function.
 * @returns {pv.Anchor}
 */
pv.Wedge.prototype.anchor = function(name) {
  function partial(s) { return s.innerRadius || s.angle < 2 * Math.PI; }
  function midRadius(s) { return (s.innerRadius + s.outerRadius) / 2; }
  function midAngle(s) { return (s.startAngle + s.endAngle) / 2; }
  return pv.Mark.prototype.anchor.call(this, name)
    .left(function() {
        var s = this.scene.target[this.index];
        if (partial(s)) switch (this.name()) {
          case "outer": return s.left + s.outerRadius * Math.cos(midAngle(s));
          case "inner": return s.left + s.innerRadius * Math.cos(midAngle(s));
          case "start": return s.left + midRadius(s) * Math.cos(s.startAngle);
          case "center": return s.left + midRadius(s) * Math.cos(midAngle(s));
          case "end": return s.left + midRadius(s) * Math.cos(s.endAngle);
        }
        return s.left;
      })
    .top(function() {
        var s = this.scene.target[this.index];
        if (partial(s)) switch (this.name()) {
          case "outer": return s.top + s.outerRadius * Math.sin(midAngle(s));
          case "inner": return s.top + s.innerRadius * Math.sin(midAngle(s));
          case "start": return s.top + midRadius(s) * Math.sin(s.startAngle);
          case "center": return s.top + midRadius(s) * Math.sin(midAngle(s));
          case "end": return s.top + midRadius(s) * Math.sin(s.endAngle);
        }
        return s.top;
      })
    .textAlign(function() {
        var s = this.scene.target[this.index];
        if (partial(s)) switch (this.name()) {
          case "outer": return pv.Wedge.upright(midAngle(s)) ? "right" : "left";
          case "inner": return pv.Wedge.upright(midAngle(s)) ? "left" : "right";
        }
        return "center";
      })
    .textBaseline(function() {
        var s = this.scene.target[this.index];
        if (partial(s)) switch (this.name()) {
          case "start": return pv.Wedge.upright(s.startAngle) ? "top" : "bottom";
          case "end": return pv.Wedge.upright(s.endAngle) ? "bottom" : "top";
        }
        return "middle";
      })
    .textAngle(function() {
        var s = this.scene.target[this.index], a = 0;
        if (partial(s)) switch (this.name()) {
          case "center":
          case "inner":
          case "outer": a = midAngle(s); break;
          case "start": a = s.startAngle; break;
          case "end": a = s.endAngle; break;
        }
        return pv.Wedge.upright(a) ? a : (a + Math.PI);
      });
};

/**
 * Returns true if the specified angle is considered "upright", as in, text
 * rendered at that angle would appear upright. If the angle is not upright,
 * text is rotated 180 degrees to be upright, and the text alignment properties
 * are correspondingly changed.
 *
 * @param {number} angle an angle, in radius.
 * @returns {boolean} true if the specified angle is upright.
 */
pv.Wedge.upright = function(angle) {
  angle = angle % (2 * Math.PI);
  angle = (angle < 0) ? (2 * Math.PI + angle) : angle;
  return (angle < Math.PI / 2) || (angle >= 3 * Math.PI / 2);
};

/** @private Sets angle based on endAngle or vice versa. */
pv.Wedge.prototype.buildImplied = function(s) {
  if (s.angle == null) s.angle = s.endAngle - s.startAngle;
  else if (s.endAngle == null) s.endAngle = s.startAngle + s.angle;
  pv.Mark.prototype.buildImplied.call(this, s);
};

pv.Wedge.prototype.getShapeCore = function(scenes, index){
    var s = scenes[index];
    return new pv.Shape.Wedge(s.left, s.top, s.innerRadius, s.outerRadius, s.startAngle, s.angle);
};
/*
 * TERMS OF USE - EASING EQUATIONS
 *
 * Open source under the BSD License.
 *
 * Copyright 2001 Robert Penner
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 * - Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * - Neither the name of the author nor the names of contributors may be used to
 *   endorse or promote products derived from this software without specific
 *   prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

pv.Ease = (function() {

  function reverse(f) {
    return function(t) {
      return 1 - f(1 - t);
    };
  }

  function reflect(f) {
    return function(t) {
      return .5 * (t < .5 ? f(2 * t) : (2 - f(2 - 2 * t)));
    };
  }

  function poly(e) {
    return function(t) {
      return t < 0 ? 0 : t > 1 ? 1 : Math.pow(t, e);
    }
  }

  function sin(t) {
    return 1 - Math.cos(t * Math.PI / 2);
  }

  function exp(t) {
    return t ? Math.pow(2, 10 * (t - 1)) - 0.001 : 0;
  }

  function circle(t) {
    return -(Math.sqrt(1 - t * t) - 1);
  }

  function elastic(a, p) {
    var s;
    if (!p) p = 0.45;
    if (!a || a < 1) { a = 1; s = p / 4; }
    else s = p / (2 * Math.PI) * Math.asin(1 / a);
    return function(t) {
      return t <= 0 || t >= 1 ? t
          : -(a * Math.pow(2, 10 * (--t)) * Math.sin((t - s) * (2 * Math.PI) / p));
    };
  }

  function back(s) {
    if (!s) s = 1.70158;
    return function(t) {
      return t * t * ((s + 1) * t - s);
    };
  }

  function bounce(t) {
    return t < 1 / 2.75 ? 7.5625 * t * t
        : t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + .75
        : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375
        : 7.5625 * (t -= 2.625 / 2.75) * t + .984375;
  }

  var quad = poly(2),
      cubic = poly(3),
      elasticDefault = elastic(),
      backDefault = back();

  var eases = {
    "linear": pv.identity,
    "quad-in": quad,
    "quad-out": reverse(quad),
    "quad-in-out": reflect(quad),
    "quad-out-in": reflect(reverse(quad)),
    "cubic-in": cubic,
    "cubic-out": reverse(cubic),
    "cubic-in-out": reflect(cubic),
    "cubic-out-in": reflect(reverse(cubic)),
    "sin-in": sin,
    "sin-out": reverse(sin),
    "sin-in-out": reflect(sin),
    "sin-out-in": reflect(reverse(sin)),
    "exp-in": exp,
    "exp-out": reverse(exp),
    "exp-in-out": reflect(exp),
    "exp-out-in": reflect(reverse(exp)),
    "circle-in": circle,
    "circle-out": reverse(circle),
    "circle-in-out": reflect(circle),
    "circle-out-in": reflect(reverse(circle)),
    "elastic-in": elasticDefault,
    "elastic-out": reverse(elasticDefault),
    "elastic-in-out": reflect(elasticDefault),
    "elastic-out-in": reflect(reverse(elasticDefault)),
    "back-in": backDefault,
    "back-out": reverse(backDefault),
    "back-in-out": reflect(backDefault),
    "back-out-in": reflect(reverse(backDefault)),
    "bounce-in": bounce,
    "bounce-out": reverse(bounce),
    "bounce-in-out": reflect(bounce),
    "bounce-out-in": reflect(reverse(bounce))
  };

  pv.ease = function(f) {
    return eases[f];
  };

  return {
    reverse: reverse,
    reflect: reflect,
    linear: function() { return pv.identity; },
    sin: function() { return sin; },
    exp: function() { return exp; },
    circle: function() { return circle; },
    elastic: elastic,
    back: back,
    bounce: bounce,
    poly: poly
  };
})();
pv.Transition = function(mark) {
  var that = this,
      ease = pv.ease("cubic-in-out"),
      duration = 250,
      timer,
      onEndCallback;

  var interpolated = {
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    width: 1,
    height: 1,
    innerRadius: 1,
    outerRadius: 1,
    radius: 1,
    startAngle: 1,
    endAngle: 1,
    angle: 1,
    fillStyle: 1,
    strokeStyle: 1,
    lineWidth: 1,
    eccentricity: 1,
    tension: 1,
    textAngle: 1,
    textStyle: 1,
    textMargin: 1
  };

  var defaults = new pv.Transient();

  /** @private */
  function ids(marks) {
    var map = {};
    for (var i = 0; i < marks.length; i++) {
      var mark = marks[i];
      if (mark.id) {
          map[mark.id] = mark;
      }
    }
    
    return map;
  }

  /** @private */
  function interpolateProperty(list, name, before, after) {
    var f;
    if (name in interpolated) {
      var i = pv.Scale.interpolator(before[name], after[name]);
      f = function(t) {
          before[name] = i(t); 
      };
    } else {
      f = function(t) {
          if (t > .5) {
              before[name] = after[name];
          }
      };
    }
    f.next = list.head;
    list.head = f;
  }

  /** @private */
  function interpolateInstance(list, before, after) {
    for (var name in before) {
      if (name == "children") continue; // not a property
      if (before[name] == after[name]) continue; // unchanged
      interpolateProperty(list, name, before, after);
    }
    if (before.children) {
      for (var j = 0; j < before.children.length; j++) {
        interpolate(list, before.children[j], after.children[j]);
      }
    }
  }

  /** @private */
  function interpolate(list, before, after) {
    var mark = before.mark, 
        bi = ids(before), 
        ai = ids(after);
    
    for (var i = 0; i < before.length; i++) {
      var b = before[i], 
          a = b.id ? ai[b.id] : after[i];
      
      b.index = i;
      
      if (!b.visible) { 
          continue;
      }
      
      // No after or not after.visible
      if (!(a && a.visible)) {
        var o = override(before, i, mark.$exit, after);

        /*
         * After the transition finishes, we need to do a little cleanup to
         * insure that the final state of the scenegraph is consistent with the
         * "after" render. For instances that were removed, we need to remove
         * them from the scenegraph; for instances that became invisible, we
         * need to mark them invisible. See the cleanup method for details.
         */
        b.transition = a ? 
                2 : 
                (after.push(o), 1);
        a = o;
      }
      interpolateInstance(list, b, a);
    }
    
    for (var i = 0; i < after.length; i++) {
      var a = after[i], 
          b = a.id ? bi[a.id] : before[i];
      
      if (!(b && b.visible) && a.visible) {
        var o = override(after, i, mark.$enter, before);
        if (!b) 
            before.push(o);
        else 
            before[b.index] = o;
        
        interpolateInstance(list, o, a);
      }
    }
  }

  /** @private */
  function override(scene, index, proto, other) {
    var s = pv.extend(scene[index]),
        m = scene.mark,
        r = m.root.scene,
        p = (proto || defaults).$properties,
        t;

    /* Correct the target reference, if this is an anchor. */
    if (other.target && (t = other.target[other.length])) {
      scene = pv.extend(scene);
      scene.target = pv.extend(other.target);
      scene.target[index] = t;
    }

    /* Determine the set of properties to evaluate. */
    var seen = {};
    for (var i = 0; i < p.length; i++) {
        seen[p[i].name] = 1;
    }
    
    /* Add to p all optional properties in binds not in proto properties (p) */
    p = m.binds.optional
         .filter(function(p) { return !(p.name in seen); })
         .concat(p);

    /* Evaluate the properties and update any implied ones. */
    m.context(scene, index, function() {
      this.buildProperties(s, p);
      this.buildImplied(s);
    });

    /* Restore the root scene. This should probably be done by context(). */
    m.root.scene = r;
    return s;
  }

  /** @private */
  function cleanup(scene) {
    for (var i = 0, j = 0; i < scene.length; i++) {
      var s = scene[i];
      if (s.transition != 1) {
        scene[j++] = s;
        if (s.transition == 2) s.visible = false;
        if (s.children) s.children.forEach(cleanup);
      }
    }
    scene.length = j;
  }

  that.ease = function(x) {
    return arguments.length
        ? (ease = typeof x == "function" ? x : pv.ease(x), that)
        : ease;
  };

  that.duration = function(x) {
    return arguments.length
        ? (duration = Number(x), that)
        : duration;
  };

  function doEnd(){
      mark.root.animatingCount--;
      
      if(onEndCallback){
          var cb = onEndCallback;
          onEndCallback = null;
          cb();
      }
  }

  that.start = function(onEnd) {
    onEndCallback = onEnd;
    
    mark.root.animatingCount++;
    
    // TODO allow partial rendering
    if (mark.parent) {
        doEnd();
        throw new Error("Animated partial rendering is not supported.");
    }
    
    try {
        // TODO allow parallel and sequenced transitions
        if (mark.$transition) { mark.$transition.stop(); }
        
        mark.$transition = that;
    
        // TODO clearing the scene like this forces total re-build
        var i = pv.Mark.prototype.index,
            before = mark.scene,
            after;
        
        mark.scene = null;
        mark.bind();
        mark.build();
        
        after = mark.scene;
        mark.scene = before;
        
        pv.Mark.prototype.index = i;
    
        var start = Date.now(),
            list = {};
        
        interpolate(list, before, after);
    } catch(ex) {
        doEnd();
        throw ex;
    }
    
    if(!list.head) {
        doEnd();
        return;
    }
    
    timer = setInterval(function() {
      var t = Math.max(0, Math.min(1, (Date.now() - start) / duration)),
          e = ease(t);
      
      /* Advance every property of every mark */
      var i = list.head;
      do { i(e); } while((i = i.next));
      
      if (t === 1) {
        cleanup(mark.scene);
        pv.Scene.updateAll(before);
        that.stop();
      } else {
          pv.Scene.updateAll(before);
      }
    }, 24);
  };

  that.stop = function() {
    clearInterval(timer);
    doEnd();
  };
};
pv.Transient = function(mark) {
  pv.Mark.call(this);
  this.fillStyle(null).strokeStyle(null).textStyle(null);
  this.on = function(state) { return mark.on(state); };
};

pv.Transient.prototype = pv.extend(pv.Mark);
/**
 * Abstract; not implemented. There is no explicit constructor; this class
 * merely serves to document the attributes that are used on particles in
 * physics simulations.
 *
 * @class A weighted particle that can participate in a force simulation.
 *
 * @name pv.Particle
 */

/**
 * The next particle in the simulation. Particles form a singly-linked list.
 *
 * @field
 * @type pv.Particle
 * @name pv.Particle.prototype.next
 */

/**
 * The <i>x</i>-position of the particle.
 *
 * @field
 * @type number
 * @name pv.Particle.prototype.x
 */

/**
 * The <i>y</i>-position of the particle.
 *
 * @field
 * @type number
 * @name pv.Particle.prototype.y
 */

/**
 * The <i>x</i>-velocity of the particle.
 *
 * @field
 * @type number
 * @name pv.Particle.prototype.vx
 */

/**
 * The <i>y</i>-velocity of the particle.
 *
 * @field
 * @type number
 * @name pv.Particle.prototype.vy
 */

/**
 * The <i>x</i>-position of the particle at -dt.
 *
 * @field
 * @type number
 * @name pv.Particle.prototype.px
 */

/**
 * The <i>y</i>-position of the particle at -dt.
 *
 * @field
 * @type number
 * @name pv.Particle.prototype.py
 */

/**
 * The <i>x</i>-force on the particle.
 *
 * @field
 * @type number
 * @name pv.Particle.prototype.fx
 */

/**
 * The <i>y</i>-force on the particle.
 *
 * @field
 * @type number
 * @name pv.Particle.prototype.fy
 */
/**
 * Constructs a new empty simulation.
 *
 * @param {array} particles
 * @returns {pv.Simulation} a new simulation for the specified particles.
 * @see pv.Simulation
 */
pv.simulation = function(particles) {
  return new pv.Simulation(particles);
};

/**
 * Constructs a new simulation for the specified particles.
 *
 * @class Represents a particle simulation. Particles are massive points in
 * two-dimensional space. Forces can be applied to these particles, causing them
 * to move. Constraints can also be applied to restrict particle movement, for
 * example, constraining particles to a fixed position, or simulating collision
 * between circular particles with area.
 *
 * <p>The simulation uses <a
 * href="http://en.wikipedia.org/wiki/Verlet_integration">Position Verlet</a>
 * integration, due to the ease with which <a
 * href="http://www.teknikus.dk/tj/gdc2001.htm">geometric constraints</a> can be
 * implemented. For each time step, Verlet integration is performed, new forces
 * are accumulated, and then constraints are applied.
 *
 * <p>The simulation makes two simplifying assumptions: all particles are
 * equal-mass, and the time step of the simulation is fixed. It would be easy to
 * incorporate variable-mass particles as a future enhancement. Variable time
 * steps are also possible, but are likely to introduce instability in the
 * simulation.
 *
 * <p>This class can be used directly to simulate particle interaction.
 * Alternatively, for network diagrams, see {@link pv.Layout.Force}.
 *
 * @param {array} particles an array of {@link pv.Particle}s to simulate.
 * @see pv.Layout.Force
 * @see pv.Force
 * @see pv.Constraint
 */
pv.Simulation = function(particles) {
  for (var i = 0; i < particles.length; i++) this.particle(particles[i]);
};

/**
 * The particles in the simulation. Particles are stored as a linked list; this
 * field represents the first particle in the simulation.
 *
 * @field
 * @type pv.Particle
 * @name pv.Simulation.prototype.particles
 */

/**
 * The forces in the simulation. Forces are stored as a linked list; this field
 * represents the first force in the simulation.
 *
 * @field
 * @type pv.Force
 * @name pv.Simulation.prototype.forces
 */

/**
 * The constraints in the simulation. Constraints are stored as a linked list;
 * this field represents the first constraint in the simulation.
 *
 * @field
 * @type pv.Constraint
 * @name pv.Simulation.prototype.constraints
 */

/**
 * Adds the specified particle to the simulation.
 *
 * @param {pv.Particle} p the new particle.
 * @returns {pv.Simulation} this.
 */
pv.Simulation.prototype.particle = function(p) {
  p.next = this.particles;
  /* Default velocities and forces to zero if unset. */
  if (isNaN(p.px)) p.px = p.x;
  if (isNaN(p.py)) p.py = p.y;
  if (isNaN(p.fx)) p.fx = 0;
  if (isNaN(p.fy)) p.fy = 0;
  this.particles = p;
  return this;
};

/**
 * Adds the specified force to the simulation.
 *
 * @param {pv.Force} f the new force.
 * @returns {pv.Simulation} this.
 */
pv.Simulation.prototype.force = function(f) {
  f.next = this.forces;
  this.forces = f;
  return this;
};

/**
 * Adds the specified constraint to the simulation.
 *
 * @param {pv.Constraint} c the new constraint.
 * @returns {pv.Simulation} this.
 */
pv.Simulation.prototype.constraint = function(c) {
  c.next = this.constraints;
  this.constraints = c;
  return this;
};

/**
 * Apply constraints, and then set the velocities to zero.
 *
 * @returns {pv.Simulation} this.
 */
pv.Simulation.prototype.stabilize = function(n) {
  var c;
  if (!arguments.length) n = 3; // TODO use cooling schedule
  for (var i = 0; i < n; i++) {
    var q = new pv.Quadtree(this.particles);
    for (c = this.constraints; c; c = c.next) c.apply(this.particles, q);
  }
  for (var p = this.particles; p; p = p.next) {
    p.px = p.x;
    p.py = p.y;
  }
  return this;
};

/**
 * Advances the simulation one time-step.
 */
pv.Simulation.prototype.step = function() {
  var p, f, c;

  /*
   * Assumptions:
   * - The mass (m) of every particles is 1.
   * - The time step (dt) is 1.
   */

  /* Position Verlet integration. */
  for (p = this.particles; p; p = p.next) {
    var px = p.px, py = p.py;
    p.px = p.x;
    p.py = p.y;
    p.x += p.vx = ((p.x - px) + p.fx);
    p.y += p.vy = ((p.y - py) + p.fy);
  }

  /* Apply constraints, then accumulate new forces. */
  var q = new pv.Quadtree(this.particles);
  for (c = this.constraints; c; c = c.next) c.apply(this.particles, q);
  for (p = this.particles; p; p = p.next) p.fx = p.fy = 0;
  for (f = this.forces; f; f = f.next) f.apply(this.particles, q);
};
/**
 * Constructs a new quadtree for the specified array of particles.
 *
 * @class Represents a quadtree: a two-dimensional recursive spatial
 * subdivision. This particular implementation uses square partitions, dividing
 * each square into four equally-sized squares. Each particle exists in a unique
 * node; if multiple particles are in the same position, some particles may be
 * stored on internal nodes rather than leaf nodes.
 *
 * <p>This quadtree can be used to accelerate various spatial operations, such
 * as the Barnes-Hut approximation for computing n-body forces, or collision
 * detection.
 *
 * @see pv.Force.charge
 * @see pv.Constraint.collision
 * @param {pv.Particle} particles the linked list of particles.
 */
pv.Quadtree = function(particles) {
  var p;

  /* Compute bounds. */
  var x1 = Number.POSITIVE_INFINITY, y1 = x1,
      x2 = Number.NEGATIVE_INFINITY, y2 = x2;
  for (p = particles; p; p = p.next) {
    if (p.x < x1) x1 = p.x;
    if (p.y < y1) y1 = p.y;
    if (p.x > x2) x2 = p.x;
    if (p.y > y2) y2 = p.y;
  }

  /* Squarify the bounds. */
  var dx = x2 - x1, dy = y2 - y1;
  if (dx > dy) y2 = y1 + dx;
  else x2 = x1 + dy;
  this.xMin = x1;
  this.yMin = y1;
  this.xMax = x2;
  this.yMax = y2;

  /**
   * @ignore Recursively inserts the specified particle <i>p</i> at the node
   * <i>n</i> or one of its descendants. The bounds are defined by [<i>x1</i>,
   * <i>x2</i>] and [<i>y1</i>, <i>y2</i>].
   */
  function insert(n, p, x1, y1, x2, y2) {
    if (isNaN(p.x) || isNaN(p.y)) return; // ignore invalid particles
    if (n.leaf) {
      if (n.p) {
        /*
         * If the particle at this leaf node is at the same position as the new
         * particle we are adding, we leave the particle associated with the
         * internal node while adding the new particle to a child node. This
         * avoids infinite recursion.
         */
        if ((Math.abs(n.p.x - p.x) + Math.abs(n.p.y - p.y)) < .01) {
          insertChild(n, p, x1, y1, x2, y2);
        } else {
          var v = n.p;
          n.p = null;
          insertChild(n, v, x1, y1, x2, y2);
          insertChild(n, p, x1, y1, x2, y2);
        }
      } else {
        n.p = p;
      }
    } else {
      insertChild(n, p, x1, y1, x2, y2);
    }
  }

  /**
   * @ignore Recursively inserts the specified particle <i>p</i> into a
   * descendant of node <i>n</i>. The bounds are defined by [<i>x1</i>,
   * <i>x2</i>] and [<i>y1</i>, <i>y2</i>].
   */
  function insertChild(n, p, x1, y1, x2, y2) {
    /* Compute the split point, and the quadrant in which to insert p. */
    var sx = (x1 + x2) * .5,
        sy = (y1 + y2) * .5,
        right = p.x >= sx,
        bottom = p.y >= sy;

    /* Recursively insert into the child node. */
    n.leaf = false;
    switch ((bottom << 1) + right) {
      case 0: n = n.c1 || (n.c1 = new pv.Quadtree.Node()); break;
      case 1: n = n.c2 || (n.c2 = new pv.Quadtree.Node()); break;
      case 2: n = n.c3 || (n.c3 = new pv.Quadtree.Node()); break;
      case 3: n = n.c4 || (n.c4 = new pv.Quadtree.Node()); break;
    }

    /* Update the bounds as we recurse. */
    if (right) x1 = sx; else x2 = sx;
    if (bottom) y1 = sy; else y2 = sy;
    insert(n, p, x1, y1, x2, y2);
  }

  /* Insert all particles. */
  this.root = new pv.Quadtree.Node();
  for (p = particles; p; p = p.next) insert(this.root, p, x1, y1, x2, y2);
};

/**
 * The root node of the quadtree.
 *
 * @type pv.Quadtree.Node
 * @name pv.Quadtree.prototype.root
 */

/**
 * The minimum x-coordinate value of all contained particles.
 *
 * @type number
 * @name pv.Quadtree.prototype.xMin
 */

/**
 * The maximum x-coordinate value of all contained particles.
 *
 * @type number
 * @name pv.Quadtree.prototype.xMax
 */

/**
 * The minimum y-coordinate value of all contained particles.
 *
 * @type number
 * @name pv.Quadtree.prototype.yMin
 */

/**
 * The maximum y-coordinate value of all contained particles.
 *
 * @type number
 * @name pv.Quadtree.prototype.yMax
 */

/**
 * Constructs a new node.
 *
 * @class A node in a quadtree.
 *
 * @see pv.Quadtree
 */
pv.Quadtree.Node = function() {
  /*
   * Prepopulating all attributes significantly increases performance! Also,
   * letting the language interpreter manage garbage collection was moderately
   * faster than creating a cache pool.
   */
  this.leaf = true;
  this.c1 = null;
  this.c2 = null;
  this.c3 = null;
  this.c4 = null;
  this.p = null;
};

/**
 * True if this node is a leaf node; i.e., it has no children. Note that both
 * leaf nodes and non-leaf (internal) nodes may have associated particles. If
 * this is a non-leaf node, then at least one of {@link #c1}, {@link #c2},
 * {@link #c3} or {@link #c4} is guaranteed to be non-null.
 *
 * @type boolean
 * @name pv.Quadtree.Node.prototype.leaf
 */

/**
 * The particle associated with this node, if any.
 *
 * @type pv.Particle
 * @name pv.Quadtree.Node.prototype.p
 */

/**
 * The child node for the second quadrant, if any.
 *
 * @type pv.Quadtree.Node
 * @name pv.Quadtree.Node.prototype.c2
 */

/**
 * The child node for the third quadrant, if any.
 *
 * @type pv.Quadtree.Node
 * @name pv.Quadtree.Node.prototype.c3
 */

/**
 * The child node for the fourth quadrant, if any.
 *
 * @type pv.Quadtree.Node
 * @name pv.Quadtree.Node.prototype.c4
 */
/**
 * Abstract; see an implementing class.
 *
 * @class Represents a force that acts on particles. Note that this interface
 * does not specify how to bind a force to specific particles; in general,
 * forces are applied globally to all particles. However, some forces may be
 * applied to specific particles or between particles, such as spring forces,
 * through additional specialization.
 *
 * @see pv.Simulation
 * @see pv.Particle
 * @see pv.Force.charge
 * @see pv.Force.drag
 * @see pv.Force.spring
 */
pv.Force = {};

/**
 * Applies this force to the specified particles.
 *
 * @function
 * @name pv.Force.prototype.apply
 * @param {pv.Particle} particles particles to which to apply this force.
 * @param {pv.Quadtree} q a quadtree for spatial acceleration.
 */
/**
 * Constructs a new charge force, with an optional charge constant. The charge
 * constant can be negative for repulsion (e.g., particles with electrical
 * charge of equal sign), or positive for attraction (e.g., massive particles
 * with mutual gravity). The default charge constant is -40.
 *
 * @class An n-body force, as defined by Coulomb's law or Newton's law of
 * gravitation, inversely proportional to the square of the distance between
 * particles. Note that the force is independent of the <i>mass</i> of the
 * associated particles, and that the particles do not have charges of varying
 * magnitude; instead, the attraction or repulsion of all particles is globally
 * specified as the charge {@link #constant}.
 *
 * <p>This particular implementation uses the Barnes-Hut algorithm. For details,
 * see <a
 * href="http://www.nature.com/nature/journal/v324/n6096/abs/324446a0.html">"A
 * hierarchical O(N log N) force-calculation algorithm"</a>, J. Barnes &amp;
 * P. Hut, <i>Nature</i> 1986.
 *
 * @name pv.Force.charge
 * @param {number} [k] the charge constant.
 */
pv.Force.charge = function(k) {
  var min = 2, // minimum distance at which to observe forces
      min1 = 1 / min,
      max = 500, // maximum distance at which to observe forces
      max1 = 1 / max,
      theta = .9, // Barnes-Hut theta approximation constant
      force = {};

  if (!arguments.length) k = -40; // default charge constant (repulsion)

  /**
   * Sets or gets the charge constant. If an argument is specified, it is the
   * new charge constant. The charge constant can be negative for repulsion
   * (e.g., particles with electrical charge of equal sign), or positive for
   * attraction (e.g., massive particles with mutual gravity). The default
   * charge constant is -40.
   *
   * @function
   * @name pv.Force.charge.prototype.constant
   * @param {number} x the charge constant.
   * @returns {pv.Force.charge} this.
   */
  force.constant = function(x) {
    if (arguments.length) {
      k = Number(x);
      return force;
    }
    return k;
  };

  /**
   * Sets or gets the domain; specifies the minimum and maximum domain within
   * which charge forces are applied. A minimum distance threshold avoids
   * applying forces that are two strong (due to granularity of the simulation's
   * numeric integration). A maximum distance threshold improves performance by
   * skipping force calculations for particles that are far apart.
   *
   * <p>The default domain is [2, 500].
   *
   * @function
   * @name pv.Force.charge.prototype.domain
   * @param {number} a
   * @param {number} b
   * @returns {pv.Force.charge} this.
   */
  force.domain = function(a, b) {
    if (arguments.length) {
      min = Number(a);
      min1 = 1 / min;
      max = Number(b);
      max1 = 1 / max;
      return force;
    }
    return [min, max];
  };

  /**
   * Sets or gets the Barnes-Hut approximation factor. The Barnes-Hut
   * approximation criterion is the ratio of the size of the quadtree node to
   * the distance from the point to the node's center of mass is beneath some
   * threshold.
   *
   * @function
   * @name pv.Force.charge.prototype.theta
   * @param {number} x the new Barnes-Hut approximation factor.
   * @returns {pv.Force.charge} this.
   */
  force.theta = function(x) {
    if (arguments.length) {
      theta = Number(x);
      return force;
    }
    return theta;
  };

  /**
   * @ignore Recursively computes the center of charge for each node in the
   * quadtree. This is equivalent to the center of mass, assuming that all
   * particles have unit weight.
   */
  function accumulate(n) {
    var cx = 0, cy = 0;
    n.cn = 0;
    function accumulateChild(c) {
      accumulate(c);
      n.cn += c.cn;
      cx += c.cn * c.cx;
      cy += c.cn * c.cy;
    }
    if (!n.leaf) {
      if (n.c1) accumulateChild(n.c1);
      if (n.c2) accumulateChild(n.c2);
      if (n.c3) accumulateChild(n.c3);
      if (n.c4) accumulateChild(n.c4);
    }
    if (n.p) {
      n.cn += k;
      cx += k * n.p.x;
      cy += k * n.p.y;
    }
    n.cx = cx / n.cn;
    n.cy = cy / n.cn;
  }

  /**
   * @ignore Recursively computes forces on the given particle using the given
   * quadtree node. The Barnes-Hut approximation criterion is the ratio of the
   * size of the quadtree node to the distance from the point to the node's
   * center of mass is beneath some threshold.
   */
  function forces(n, p, x1, y1, x2, y2) {
    var dx = n.cx - p.x,
        dy = n.cy - p.y,
        dn = 1 / Math.sqrt(dx * dx + dy * dy);

    /* Barnes-Hut criterion. */
    if ((n.leaf && (n.p != p)) || ((x2 - x1) * dn < theta)) {
      if (dn < max1) return;
      if (dn > min1) dn = min1;
      var kc = n.cn * dn * dn * dn,
          fx = dx * kc,
          fy = dy * kc;
      p.fx += fx;
      p.fy += fy;
    } else if (!n.leaf) {
      var sx = (x1 + x2) * .5, sy = (y1 + y2) * .5;
      if (n.c1) forces(n.c1, p, x1, y1, sx, sy);
      if (n.c2) forces(n.c2, p, sx, y1, x2, sy);
      if (n.c3) forces(n.c3, p, x1, sy, sx, y2);
      if (n.c4) forces(n.c4, p, sx, sy, x2, y2);
      if (dn < max1) return;
      if (dn > min1) dn = min1;
      if (n.p && (n.p != p)) {
        var kc = k * dn * dn * dn,
            fx = dx * kc,
            fy = dy * kc;
        p.fx += fx;
        p.fy += fy;
      }
    }
  }

  /**
   * Applies this force to the specified particles. The force is applied between
   * all pairs of particles within the domain, using the specified quadtree to
   * accelerate n-body force calculation using the Barnes-Hut approximation
   * criterion.
   *
   * @function
   * @name pv.Force.charge.prototype.apply
   * @param {pv.Particle} particles particles to which to apply this force.
   * @param {pv.Quadtree} q a quadtree for spatial acceleration.
   */
  force.apply = function(particles, q) {
    accumulate(q.root);
    for (var p = particles; p; p = p.next) {
      forces(q.root, p, q.xMin, q.yMin, q.xMax, q.yMax);
    }
  };

  return force;
};
/**
 * Constructs a new drag force with the specified constant.
 *
 * @class Implements a drag force, simulating friction. The drag force is
 * applied in the opposite direction of the particle's velocity. Since Position
 * Verlet integration does not track velocities explicitly, the error term with
 * this estimate of velocity is fairly high, so the drag force may be
 * inaccurate.
 *
 * @extends pv.Force
 * @param {number} k the drag constant.
 * @see #constant
 */
pv.Force.drag = function(k) {
  var force = {};

  if (!arguments.length) k = .1; // default drag constant

  /**
   * Sets or gets the drag constant, in the range [0,1]. The default drag
   * constant is 0.1. The drag forces scales linearly with the particle's
   * velocity based on the given drag constant.
   *
   * @function
   * @name pv.Force.drag.prototype.constant
   * @param {number} x the new drag constant.
   * @returns {pv.Force.drag} this, or the current drag constant.
   */
  force.constant = function(x) {
    if (arguments.length) { k = x; return force; }
    return k;
  };

  /**
   * Applies this force to the specified particles.
   *
   * @function
   * @name pv.Force.drag.prototype.apply
   * @param {pv.Particle} particles particles to which to apply this force.
   */
  force.apply = function(particles) {
    if (k) for (var p = particles; p; p = p.next) {
      p.fx -= k * p.vx;
      p.fy -= k * p.vy;
    }
  };

  return force;
};
/**
 * Constructs a new spring force with the specified constant. The links
 * associated with this spring force must be specified before the spring force
 * can be applied.
 *
 * @class Implements a spring force, per Hooke's law. The spring force can be
 * configured with a tension constant, rest length, and damping factor. The
 * tension and damping will automatically be normalized using the inverse square
 * root of the maximum link degree of attached nodes; this makes springs weaker
 * between nodes of high link degree.
 *
 * <p>Unlike other forces (such as charge and drag forces) which may be applied
 * globally, spring forces are only applied between linked particles. Therefore,
 * an array of links must be specified before this force can be applied; the
 * links should be an array of {@link pv.Layout.Network.Link}s. See also
 * {@link pv.Layout.Force} for an example of using spring and charge forces for
 * network layout.
 *
 * @extends pv.Force
 * @param {number} k the spring constant.
 * @see #constant
 * @see #links
 */
pv.Force.spring = function(k) {
  var d = .1, // default damping factor
      l = 20, // default rest length
      links, // links on which to apply spring forces
      kl, // per-spring normalization
      force = {};

  if (!arguments.length) k = .1; // default spring constant (tension)

  /**
   * Sets or gets the links associated with this spring force. Unlike other
   * forces (such as charge and drag forces) which may be applied globally,
   * spring forces are only applied between linked particles. Therefore, an
   * array of links must be specified before this force can be applied; the
   * links should be an array of {@link pv.Layout.Network.Link}s.
   *
   * @function
   * @name pv.Force.spring.prototype.links
   * @param {array} x the new array of links.
   * @returns {pv.Force.spring} this, or the current array of links.
   */
  force.links = function(x) {
    if (arguments.length) {
      links = x;
      kl = x.map(function(l) {
          return 1 / Math.sqrt(Math.max(
              l.sourceNode.linkDegree,
              l.targetNode.linkDegree));
        });
      return force;
    }
    return links;
  };

  /**
   * Sets or gets the spring constant. The default value is 0.1; greater values
   * will result in stronger tension. The spring tension is automatically
   * normalized using the inverse square root of the maximum link degree of
   * attached nodes.
   *
   * @function
   * @name pv.Force.spring.prototype.constant
   * @param {number} x the new spring constant.
   * @returns {pv.Force.spring} this, or the current spring constant.
   */
  force.constant = function(x) {
    if (arguments.length) {
      k = Number(x);
      return force;
    }
    return k;
  };

  /**
   * The spring damping factor, in the range [0,1]. Damping functions
   * identically to drag forces, damping spring bounciness by applying a force
   * in the opposite direction of attached nodes' velocities. The default value
   * is 0.1. The spring damping is automatically normalized using the inverse
   * square root of the maximum link degree of attached nodes.
   *
   * @function
   * @name pv.Force.spring.prototype.damping
   * @param {number} x the new spring damping factor.
   * @returns {pv.Force.spring} this, or the current spring damping factor.
   */
  force.damping = function(x) {
    if (arguments.length) {
      d = Number(x);
      return force;
    }
    return d;
  };

  /**
   * The spring rest length. The default value is 20 pixels.
   *
   * @function
   * @name pv.Force.spring.prototype.length
   * @param {number} x the new spring rest length.
   * @returns {pv.Force.spring} this, or the current spring rest length.
   */
  force.length = function(x) {
    if (arguments.length) {
      l = Number(x);
      return force;
    }
    return l;
  };

  /**
   * Applies this force to the specified particles.
   *
   * @function
   * @name pv.Force.spring.prototype.apply
   * @param {pv.Particle} particles particles to which to apply this force.
   */
  force.apply = function(particles) {
    for (var i = 0; i < links.length; i++) {
      var a = links[i].sourceNode,
          b = links[i].targetNode,
          dx = a.x - b.x,
          dy = a.y - b.y,
          dn = Math.sqrt(dx * dx + dy * dy),
          dd = dn ? (1 / dn) : 1,
          ks = k * kl[i], // normalized tension
          kd = d * kl[i], // normalized damping
          kk = (ks * (dn - l) + kd * (dx * (a.vx - b.vx) + dy * (a.vy - b.vy)) * dd) * dd,
          fx = -kk * (dn ? dx : (.01 * (.5 - Math.random()))),
          fy = -kk * (dn ? dy : (.01 * (.5 - Math.random())));
      a.fx += fx;
      a.fy += fy;
      b.fx -= fx;
      b.fy -= fy;
    }
  };

  return force;
};
/**
 * Abstract; see an implementing class.
 *
 * @class Represents a constraint that acts on particles. Note that this
 * interface does not specify how to bind a constraint to specific particles; in
 * general, constraints are applied globally to all particles. However, some
 * constraints may be applied to specific particles or between particles, such
 * as position constraints, through additional specialization.
 *
 * @see pv.Simulation
 * @see pv.Particle
 * @see pv.Constraint.bound
 * @see pv.Constraint.collision
 * @see pv.Constraint.position
 */
pv.Constraint = {};

/**
 * Applies this constraint to the specified particles.
 *
 * @function
 * @name pv.Constraint.prototype.apply
 * @param {pv.Particle} particles particles to which to apply this constraint.
 * @param {pv.Quadtree} q a quadtree for spatial acceleration.
 * @returns {pv.Constraint} this.
 */
/**
 * Constructs a new collision constraint. The default search radius is 10, and
 * the default repeat count is 1. A radius function must be specified to compute
 * the radius of particles.
 *
 * @class Constraints circles to avoid overlap. Each particle is treated as a
 * circle, with the radius of the particle computed using a specified function.
 * For example, if the particle has an <tt>r</tt> attribute storing the radius,
 * the radius <tt>function(d) d.r</tt> specifies a collision constraint using
 * this radius. The radius function is passed each {@link pv.Particle} as the
 * first argument.
 *
 * <p>To accelerate collision detection, this implementation uses a quadtree and
 * a search radius. The search radius is computed as the maximum radius of all
 * particles in the simulation.
 *
 * @see pv.Constraint
 * @param {function} radius the radius function.
 */
pv.Constraint.collision = function(radius) {
  var n = 1, // number of times to repeat the constraint
      r1,
      px1,
      py1,
      px2,
      py2,
      constraint = {};

  if (!arguments.length) r1 = 10; // default search radius

  /**
   * Sets or gets the repeat count. If the repeat count is greater than 1, the
   * constraint will be applied repeatedly; this is a form of the Gauss-Seidel
   * method for constraints relaxation. Repeating the collision constraint makes
   * the constraint have more of an effect when there is a potential for many
   * co-occurring collisions.
   *
   * @function
   * @name pv.Constraint.collision.prototype.repeat
   * @param {number} x the number of times to repeat this constraint.
   * @returns {pv.Constraint.collision} this.
   */
  constraint.repeat = function(x) {
    if (arguments.length) {
      n = Number(x);
      return constraint;
    }
    return n;
  };

  /** @private */
  function constrain(n, p, x1, y1, x2, y2) {
    if (!n.leaf) {
      var sx = (x1 + x2) * .5,
          sy = (y1 + y2) * .5,
          top = sy > py1,
          bottom = sy < py2,
          left = sx > px1,
          right = sx < px2;
      if (top) {
        if (n.c1 && left) constrain(n.c1, p, x1, y1, sx, sy);
        if (n.c2 && right) constrain(n.c2, p, sx, y1, x2, sy);
      }
      if (bottom) {
        if (n.c3 && left) constrain(n.c3, p, x1, sy, sx, y2);
        if (n.c4 && right) constrain(n.c4, p, sx, sy, x2, y2);
      }
    }
    if (n.p && (n.p != p)) {
      var dx = p.x - n.p.x,
          dy = p.y - n.p.y,
          l = Math.sqrt(dx * dx + dy * dy),
          d = r1 + radius(n.p);
      if (l < d) {
        var k = (l - d) / l * .5;
        dx *= k;
        dy *= k;
        p.x -= dx;
        p.y -= dy;
        n.p.x += dx;
        n.p.y += dy;
      }
    }
  }

  /**
   * Applies this constraint to the specified particles.
   *
   * @function
   * @name pv.Constraint.collision.prototype.apply
   * @param {pv.Particle} particles particles to which to apply this constraint.
   * @param {pv.Quadtree} q a quadtree for spatial acceleration.
   */
  constraint.apply = function(particles, q) {
    var p, r, max = -Infinity;
    for (p = particles; p; p = p.next) {
      r = radius(p);
      if (r > max) max = r;
    }
    for (var i = 0; i < n; i++) {
      for (p = particles; p; p = p.next) {
        r = (r1 = radius(p)) + max;
        px1 = p.x - r;
        px2 = p.x + r;
        py1 = p.y - r;
        py2 = p.y + r;
        constrain(q.root, p, q.xMin, q.yMin, q.xMax, q.yMax);
      }
    }
  };

  return constraint;
};
/**
 * Constructs a default position constraint using the <tt>fix</tt> attribute.
 * An optional position function can be specified to determine how the fixed
 * position per-particle is determined.
 *
 * @class Constraints particles to a fixed position. The fixed position per
 * particle is determined using a given position function, which defaults to
 * <tt>function(d) d.fix</tt>.
 *
 * <p>If the position function returns null, then no position constraint is
 * applied to the given particle. Otherwise, the particle's position is set to
 * the returned position, as expressed by a {@link pv.Vector}. (Note: the
 * position does not need to be an instance of <tt>pv.Vector</tt>, but simply an
 * object with <tt>x</tt> and <tt>y</tt> attributes.)
 *
 * <p>This constraint also supports a configurable alpha parameter, which
 * defaults to 1. If the alpha parameter is in the range [0,1], then rather than
 * setting the particle's new position directly to the position returned by the
 * supplied position function, the particle's position is interpolated towards
 * the fixed position. This results is a smooth (exponential) drift towards the
 * fixed position, which can increase the stability of the physics simulation.
 * In addition, the alpha parameter can be decayed over time, relaxing the
 * position constraint, which helps to stabilize on an optimal solution.
 *
 * @param {function} [f] the position function.
 */
pv.Constraint.position = function(f) {
  var a = 1, // default alpha
      constraint = {};

  if (!arguments.length) /** @ignore */ f = function(p) { return p.fix; };

  /**
   * Sets or gets the alpha parameter for position interpolation. If the alpha
   * parameter is in the range [0,1], then rather than setting the particle's
   * new position directly to the position returned by the supplied position
   * function, the particle's position is interpolated towards the fixed
   * position.
   *
   * @function
   * @name pv.Constraint.position.prototype.alpha
   * @param {number} x the new alpha parameter, in the range [0,1].
   * @returns {pv.Constraint.position} this.
   */
  constraint.alpha = function(x) {
    if (arguments.length) {
      a = Number(x);
      return constraint;
    }
    return a;
  };

  /**
   * Applies this constraint to the specified particles.
   *
   * @function
   * @name pv.Constraint.position.prototype.apply
   * @param {pv.Particle} particles particles to which to apply this constraint.
   */
  constraint.apply = function(particles) {
    for (var p = particles; p; p = p.next) {
      var v = f(p);
      if (v) {
        p.x += (v.x - p.x) * a;
        p.y += (v.y - p.y) * a;
        p.fx = p.fy = p.vx = p.vy = 0;
      }
    }
  };

  return constraint;
};
/**
 * Constructs a new bound constraint. Before the constraint can be used, the
 * {@link #x} and {@link #y} methods must be call to specify the bounds.
 *
 * @class Constrains particles to within fixed rectangular bounds. For example,
 * this constraint can be used to constrain particles in a physics simulation
 * within the bounds of an enclosing panel.
 *
 * <p>Note that the current implementation treats particles as points, with no
 * area. If the particles are rendered as dots, be sure to include some
 * additional padding to inset the bounds such that the edges of the dots do not
 * get clipped by the panel bounds. If the particles have different radii, this
 * constraint would need to be extended using a radius function, similar to
 * {@link pv.Constraint.collision}.
 *
 * @see pv.Layout.Force
 * @extends pv.Constraint
 */
pv.Constraint.bound = function() {
  var constraint = {},
      x,
      y;

  /**
   * Sets or gets the bounds on the x-coordinate.
   *
   * @function
   * @name pv.Constraint.bound.prototype.x
   * @param {number} min the minimum allowed x-coordinate.
   * @param {number} max the maximum allowed x-coordinate.
   * @returns {pv.Constraint.bound} this.
   */
  constraint.x = function(min, max) {
    if (arguments.length) {
      x = {min: Math.min(min, max), max: Math.max(min, max)};
      return this;
    }
    return x;
  };

  /**
   * Sets or gets the bounds on the y-coordinate.
   *
   * @function
   * @name pv.Constraint.bound.prototype.y
   * @param {number} min the minimum allowed y-coordinate.
   * @param {number} max the maximum allowed y-coordinate.
   * @returns {pv.Constraint.bound} this.
   */
  constraint.y = function(min, max) {
    if (arguments.length) {
      y = {min: Math.min(min, max), max: Math.max(min, max)};
      return this;
    }
    return y;
  };

  /**
   * Applies this constraint to the specified particles.
   *
   * @function
   * @name pv.Constraint.bound.prototype.apply
   * @param {pv.Particle} particles particles to which to apply this constraint.
   */
  constraint.apply = function(particles) {
    if (x) for (var p = particles; p; p = p.next) {
      p.x = p.x < x.min ? x.min : (p.x > x.max ? x.max : p.x);
    }
    if (y) for (var p = particles; p; p = p.next) {
      p.y = p.y < y.min ? y.min : (p.y > y.max ? y.max : p.y);
    }
  };

  return constraint;
};
/**
 * Constructs a new, empty layout with default properties. Layouts are not
 * typically constructed directly; instead, a concrete subclass is added to an
 * existing panel via {@link pv.Mark#add}.
 *
 * @class Represents an abstract layout, encapsulating a visualization technique
 * such as a streamgraph or treemap. Layouts are themselves containers,
 * extending from {@link pv.Panel}, and defining a set of mark prototypes as
 * children. These mark prototypes provide default properties that together
 * implement the given visualization technique.
 *
 * <p>Layouts do not initially contain any marks; any exported marks (such as a
 * network layout's <tt>link</tt> and <tt>node</tt>) are intended to be used as
 * prototypes. By adding a concrete mark, such as a {@link pv.Bar}, to the
 * appropriate mark prototype, the mark is added to the layout and inherits the
 * given properties. This approach allows further customization of the layout,
 * either by choosing a different mark type to add, or more simply by overriding
 * some of the layout's defined properties.
 *
 * <p>Each concrete layout, such as treemap or circle-packing, has different
 * behavior and may export different mark prototypes, depending on what marks
 * are typically needed to render the desired visualization. Therefore it is
 * important to understand how each layout is structured, such that the provided
 * mark prototypes are used appropriately.
 *
 * <p>In addition to the mark prototypes, layouts may define custom properties
 * that affect the overall behavior of the layout. For example, a treemap layout
 * might use a property to specify which layout algorithm to use. These
 * properties are just like other mark properties, and can be defined as
 * constants or as functions. As with panels, the data property can be used to
 * replicate layouts, and properties can be defined to in terms of layout data.
 *
 * @extends pv.Panel
 */
pv.Layout = function() {
  pv.Panel.call(this);
};

pv.Layout.prototype = pv.extend(pv.Panel);

/**
 * @private Defines a local property with the specified name and cast. Note that
 * although the property method is only defined locally, the cast function is
 * global, which is necessary since properties are inherited!
 *
 * @param {string} name the property name.
 * @param {function} [cast] the cast function for this property.
 */
pv.Layout.prototype.property = pv.Mark.prototype.localProperty;
/**
 * Constructs a new, empty network layout. Layouts are not typically constructed
 * directly; instead, they are added to an existing panel via
 * {@link pv.Mark#add}.
 *
 * @class Represents an abstract layout for network diagrams. This class
 * provides the basic structure for both node-link diagrams (such as
 * force-directed graph layout) and space-filling network diagrams (such as
 * sunbursts and treemaps). Note that "network" here is a general term that
 * includes hierarchical structures; a tree is represented using links from
 * child to parent.
 *
 * <p>Network layouts require the graph data structure to be defined using two
 * properties:<ul>
 *
 * <li><tt>nodes</tt> - an array of objects representing nodes. Objects in this
 * array must conform to the {@link pv.Layout.Network.Node} interface; which is
 * to say, be careful to avoid naming collisions with automatic attributes such
 * as <tt>index</tt> and <tt>linkDegree</tt>. If the nodes property is defined
 * as an array of primitives, such as numbers or strings, these primitives are
 * automatically wrapped in an object; the resulting object's <tt>nodeValue</tt>
 * attribute points to the original primitive value.
 *
 * <p><li><tt>links</tt> - an array of objects representing links. Objects in
 * this array must conform to the {@link pv.Layout.Network.Link} interface; at a
 * minimum, either <tt>source</tt> and <tt>target</tt> indexes or
 * <tt>sourceNode</tt> and <tt>targetNode</tt> references must be set. Note that
 * if the links property is defined after the nodes property, the links can be
 * defined in terms of <tt>this.nodes()</tt>.
 *
 * </ul>
 *
 * <p>Three standard mark prototypes are provided:<ul>
 *
 * <li><tt>node</tt> - for rendering nodes; typically a {@link pv.Dot}. The node
 * mark is added directly to the layout, with the data property defined via the
 * layout's <tt>nodes</tt> property. Properties such as <tt>strokeStyle</tt> and
 * <tt>fillStyle</tt> can be overridden to compute properties from node data
 * dynamically.
 *
 * <p><li><tt>link</tt> - for rendering links; typically a {@link pv.Line}. The
 * link mark is added to a child panel, whose data property is defined as
 * layout's <tt>links</tt> property. The link's data property is then a
 * two-element array of the source node and target node. Thus, poperties such as
 * <tt>strokeStyle</tt> and <tt>fillStyle</tt> can be overridden to compute
 * properties from either the node data (the first argument) or the link data
 * (the second argument; the parent panel data) dynamically.
 *
 * <p><li><tt>label</tt> - for rendering node labels; typically a
 * {@link pv.Label}. The label mark is added directly to the layout, with the
 * data property defined via the layout's <tt>nodes</tt> property. Properties
 * such as <tt>strokeStyle</tt> and <tt>fillStyle</tt> can be overridden to
 * compute properties from node data dynamically.
 *
 * </ul>Note that some network implementations may not support all three
 * standard mark prototypes; for example, space-filling hierarchical layouts
 * typically do not use a <tt>link</tt> prototype, as the parent-child links are
 * implied by the structure of the space-filling <tt>node</tt> marks.  Check the
 * specific network layout for implementation details.
 *
 * <p>Network layout properties, including <tt>nodes</tt> and <tt>links</tt>,
 * are typically cached rather than re-evaluated with every call to render. This
 * is a performance optimization, as network layout algorithms can be
 * expensive. If the network structure changes, call {@link #reset} to clear the
 * cache before rendering. Note that although the network layout properties are
 * cached, child mark properties, such as the marks used to render the nodes and
 * links, <i>are not</i>. Therefore, non-structural changes to the network
 * layout, such as changing the color of a mark on mouseover, do not need to
 * reset the layout.
 *
 * @see pv.Layout.Hierarchy
 * @see pv.Layout.Force
 * @see pv.Layout.Matrix
 * @see pv.Layout.Arc
 * @see pv.Layout.Rollup
 * @extends pv.Layout
 */
pv.Layout.Network = function() {
  pv.Layout.call(this);
  var that = this;

  /* @private Version tracking to cache layout state, improving performance. */
  this.$id = pv.id();

  /**
   * The node prototype. This prototype is intended to be used with a Dot mark
   * in conjunction with the link prototype.
   *
   * @type pv.Mark
   * @name pv.Layout.Network.prototype.node
   */
  (this.node = new pv.Mark()
      .data(function() { return that.nodes(); })
      .strokeStyle("#1f77b4")
      .fillStyle("#fff")
      .left(function(n) { return n.x; })
      .top(function(n) { return n.y; })).parent = this;

  /**
   * The link prototype, which renders edges between source nodes and target
   * nodes. This prototype is intended to be used with a Line mark in
   * conjunction with the node prototype.
   *
   * @type pv.Mark
   * @name pv.Layout.Network.prototype.link
   */
  this.link = new pv.Mark()
      .extend(this.node)
      .data(function(p) { return [p.sourceNode, p.targetNode]; })
      .fillStyle(null)
      .lineWidth(function(d, p) { return p.linkValue * 1.5; })
      .strokeStyle("rgba(0,0,0,.2)");

  this.link.add = function(type) {
    return that.add(pv.Panel)
        .data(function() { return that.links(); })
      .add(type)
        .extend(this);
  };

  /**
   * The node label prototype, which renders the node name adjacent to the node.
   * This prototype is provided as an alternative to using the anchor on the
   * node mark; it is primarily intended to be used with radial node-link
   * layouts, since it provides a convenient mechanism to set the text angle.
   *
   * @type pv.Mark
   * @name pv.Layout.Network.prototype.label
   */
  (this.label = new pv.Mark()
      .extend(this.node)
      .textMargin(7)
      .textBaseline("middle")
      .text(function(n) { return n.nodeName || n.nodeValue; })
      .textAngle(function(n) {
          var a = n.midAngle;
          return pv.Wedge.upright(a) ? a : (a + Math.PI);
        })
      .textAlign(function(n) {
          return pv.Wedge.upright(n.midAngle) ? "left" : "right";
        })).parent = this;
};

/**
 * @class Represents a node in a network layout. There is no explicit
 * constructor; this class merely serves to document the attributes that are
 * used on nodes in network layouts. (Note that hierarchical nodes place
 * additional requirements on node representation, vis {@link pv.Dom.Node}.)
 *
 * @see pv.Layout.Network
 * @name pv.Layout.Network.Node
 */

/**
 * The node index, zero-based. This attribute is populated automatically based
 * on the index in the array returned by the <tt>nodes</tt> property.
 *
 * @type number
 * @name pv.Layout.Network.Node.prototype.index
 */

/**
 * The link degree; the sum of link values for all incoming and outgoing links.
 * This attribute is populated automatically.
 *
 * @type number
 * @name pv.Layout.Network.Node.prototype.linkDegree
 */

/**
 * The node name; optional. If present, this attribute will be used to provide
 * the text for node labels. If not present, the label text will fallback to the
 * <tt>nodeValue</tt> attribute.
 *
 * @type string
 * @name pv.Layout.Network.Node.prototype.nodeName
 */

/**
 * The node value; optional. If present, and no <tt>nodeName</tt> attribute is
 * present, the node value will be used as the label text. This attribute is
 * also automatically populated if the nodes are specified as an array of
 * primitives, such as strings or numbers.
 *
 * @type object
 * @name pv.Layout.Network.Node.prototype.nodeValue
 */

/**
 * @class Represents a link in a network layout. There is no explicit
 * constructor; this class merely serves to document the attributes that are
 * used on links in network layouts. For hierarchical layouts, this class is
 * used to represent the parent-child links.
 *
 * @see pv.Layout.Network
 * @name pv.Layout.Network.Link
 */

/**
 * The link value, or weight; optional. If not specified (or not a number), the
 * default value of 1 is used.
 *
 * @type number
 * @name pv.Layout.Network.Link.prototype.linkValue
 */

/**
 * The link's source node. If not set, this value will be derived from the
 * <tt>source</tt> attribute index.
 *
 * @type pv.Layout.Network.Node
 * @name pv.Layout.Network.Link.prototype.sourceNode
 */

/**
 * The link's target node. If not set, this value will be derived from the
 * <tt>target</tt> attribute index.
 *
 * @type pv.Layout.Network.Node
 * @name pv.Layout.Network.Link.prototype.targetNode
 */

/**
 * Alias for <tt>sourceNode</tt>, as expressed by the index of the source node.
 * This attribute is not populated automatically, but may be used as a more
 * convenient identification of the link's source, for example in a static JSON
 * representation.
 *
 * @type number
 * @name pv.Layout.Network.Link.prototype.source
 */

/**
 * Alias for <tt>targetNode</tt>, as expressed by the index of the target node.
 * This attribute is not populated automatically, but may be used as a more
 * convenient identification of the link's target, for example in a static JSON
 * representation.
 *
 * @type number
 * @name pv.Layout.Network.Link.prototype.target
 */

/**
 * Alias for <tt>linkValue</tt>. This attribute is not populated automatically,
 * but may be used instead of the <tt>linkValue</tt> attribute when specifying
 * links.
 *
 * @type number
 * @name pv.Layout.Network.Link.prototype.value
 */

/** @private Transform nodes and links on cast. */
pv.Layout.Network.prototype = pv.extend(pv.Layout)
    .property("nodes", function(v) {
        return v.map(function(d, i) {
            if (typeof d != "object") d = {nodeValue: d};
            d.index = i;
            return d;
          });
      })
    .property("links", function(v) {
        return v.map(function(d) {
            if (isNaN(d.linkValue)) d.linkValue = isNaN(d.value) ? 1 : d.value;
            return d;
          });
      });

/**
 * Resets the cache, such that changes to layout property definitions will be
 * visible on subsequent render. Unlike normal marks (and normal layouts),
 * properties associated with network layouts are not automatically re-evaluated
 * on render; the properties are cached, and any expensive layout algorithms are
 * only run after the layout is explicitly reset.
 *
 * @returns {pv.Layout.Network} this.
 */
pv.Layout.Network.prototype.reset = function() {
  this.$id = pv.id();
  return this;
};

/** @private Skip evaluating properties if cached. */
pv.Layout.Network.prototype.buildProperties = function(s, properties) {
  if ((s.$id || 0) < this.$id) {
    pv.Layout.prototype.buildProperties.call(this, s, properties);
  }
};

/** @private Compute link degrees; map source and target indexes to nodes. */
pv.Layout.Network.prototype.buildImplied = function(s) {
  pv.Layout.prototype.buildImplied.call(this, s);
  if (s.$id >= this.$id) return true;
  s.$id = this.$id;
  s.nodes.forEach(function(d) {
      d.linkDegree = 0;
    });
  s.links.forEach(function(d) {
      var v = d.linkValue;
      (d.sourceNode || (d.sourceNode = s.nodes[d.source])).linkDegree += v;
      (d.targetNode || (d.targetNode = s.nodes[d.target])).linkDegree += v;
    });
};
/**
 * Constructs a new, empty hierarchy layout. Layouts are not typically
 * constructed directly; instead, they are added to an existing panel via
 * {@link pv.Mark#add}.
 *
 * @class Represents an abstract layout for hierarchy diagrams. This class is a
 * specialization of {@link pv.Layout.Network}, providing the basic structure
 * for both hierarchical node-link diagrams (such as Reingold-Tilford trees) and
 * space-filling hierarchy diagrams (such as sunbursts and treemaps).
 *
 * <p>Unlike general network layouts, the <tt>links</tt> property need not be
 * defined explicitly. Instead, the links are computed implicitly from the
 * <tt>parentNode</tt> attribute of the node objects, as defined by the
 * <tt>nodes</tt> property. This implementation is also available as
 * {@link #links}, for reuse with non-hierarchical layouts; for example, to
 * render a tree using force-directed layout.
 *
 * <p>Correspondingly, the <tt>nodes</tt> property is represented as a union of
 * {@link pv.Layout.Network.Node} and {@link pv.Dom.Node}. To construct a node
 * hierarchy from a simple JSON map, use the {@link pv.Dom} operator; this
 * operator also provides an easy way to sort nodes before passing them to the
 * layout.
 *
 * <p>For more details on how to use this layout, see
 * {@link pv.Layout.Network}.
 *
 * @see pv.Layout.Cluster
 * @see pv.Layout.Partition
 * @see pv.Layout.Tree
 * @see pv.Layout.Treemap
 * @see pv.Layout.Indent
 * @see pv.Layout.Pack
 * @extends pv.Layout.Network
 */
pv.Layout.Hierarchy = function() {
  pv.Layout.Network.call(this);
  this.link.strokeStyle("#ccc");
};

pv.Layout.Hierarchy.prototype = pv.extend(pv.Layout.Network);

/** @private Compute the implied links. (Links are null by default.) */
pv.Layout.Hierarchy.prototype.buildImplied = function(s) {
  if (!s.links) s.links = pv.Layout.Hierarchy.links.call(this);
  pv.Layout.Network.prototype.buildImplied.call(this, s);
};

/** The implied links; computes links using the <tt>parentNode</tt> attribute. */
pv.Layout.Hierarchy.links = function() {
  return this.nodes()
      .filter(function(n) { return n.parentNode; })
      .map(function(n) {
          return {
              sourceNode: n,
              targetNode: n.parentNode,
              linkValue: 1
            };
      });
};

/** @private Provides standard node-link layout based on breadth & depth. */
pv.Layout.Hierarchy.NodeLink = {

  /** @private */
  buildImplied: function(s) {
    var nodes = s.nodes,
        orient = s.orient,
        horizontal = /^(top|bottom)$/.test(orient),
        w = s.width,
        h = s.height;

    /* Compute default inner and outer radius. */
    if (orient == "radial") {
      var ir = s.innerRadius, or = s.outerRadius;
      if (ir == null) ir = 0;
      if (or == null) or = Math.min(w, h) / 2;
    }

    /** @private Returns the radius of the given node. */
    function radius(n) {
      return n.parentNode ? (n.depth * (or - ir) + ir) : 0;
    }

    /** @private Returns the angle of the given node. */
    function midAngle(n) {
      return (n.parentNode ? (n.breadth - .25) * 2 * Math.PI : 0);
    }

    /** @private */
    function x(n) {
      switch (orient) {
        case "left": return n.depth * w;
        case "right": return w - n.depth * w;
        case "top": return n.breadth * w;
        case "bottom": return w - n.breadth * w;
        case "radial": return w / 2 + radius(n) * Math.cos(n.midAngle);
      }
    }

    /** @private */
    function y(n) {
      switch (orient) {
        case "left": return n.breadth * h;
        case "right": return h - n.breadth * h;
        case "top": return n.depth * h;
        case "bottom": return h - n.depth * h;
        case "radial": return h / 2 + radius(n) * Math.sin(n.midAngle);
      }
    }

    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.midAngle = orient == "radial" ? midAngle(n)
          : horizontal ? Math.PI / 2 : 0;
      n.x = x(n);
      n.y = y(n);
      if (n.firstChild) n.midAngle += Math.PI;
    }
  }
};

/** @private Provides standard space-filling layout based on breadth & depth. */
pv.Layout.Hierarchy.Fill = {

  /** @private */
  constructor: function() {
    this.node
        .strokeStyle("#fff")
        .fillStyle("#ccc")
        .width(function(n) { return n.dx; })
        .height(function(n) { return n.dy; })
        .innerRadius(function(n) { return n.innerRadius; })
        .outerRadius(function(n) { return n.outerRadius; })
        .startAngle(function(n) { return n.startAngle; })
        .angle(function(n) { return n.angle; });

    this.label
        .textAlign("center")
        .left(function(n) { return n.x + (n.dx / 2); })
        .top(function(n) { return n.y + (n.dy / 2); });

    /* Hide unsupported link. */
    delete this.link;
  },

  /** @private */
  buildImplied: function(s) {
    var nodes = s.nodes,
        orient = s.orient,
        horizontal = /^(top|bottom)$/.test(orient),
        w = s.width,
        h = s.height,
        depth = -nodes[0].minDepth;

    /* Compute default inner and outer radius. */
    if (orient == "radial") {
      var ir = s.innerRadius, or = s.outerRadius;
      if (ir == null) ir = 0;
      if (ir) depth *= 2; // use full depth step for root
      if (or == null) or = Math.min(w, h) / 2;
    }

    /** @private Scales the specified depth for a space-filling layout. */
    function scale(d, depth) {
      return (d + depth) / (1 + depth);
    }

    /** @private */
    function x(n) {
      switch (orient) {
        case "left": return scale(n.minDepth, depth) * w;
        case "right": return (1 - scale(n.maxDepth, depth)) * w;
        case "top": return n.minBreadth * w;
        case "bottom": return (1 - n.maxBreadth) * w;
        case "radial": return w / 2;
      }
    }

    /** @private */
    function y(n) {
      switch (orient) {
        case "left": return n.minBreadth * h;
        case "right": return (1 - n.maxBreadth) * h;
        case "top": return scale(n.minDepth, depth) * h;
        case "bottom": return (1 - scale(n.maxDepth, depth)) * h;
        case "radial": return h / 2;
      }
    }

    /** @private */
    function dx(n) {
      switch (orient) {
        case "left":
        case "right": return (n.maxDepth - n.minDepth) / (1 + depth) * w;
        case "top":
        case "bottom": return (n.maxBreadth - n.minBreadth) * w;
        case "radial": return n.parentNode ? (n.innerRadius + n.outerRadius) * Math.cos(n.midAngle) : 0;
      }
    }

    /** @private */
    function dy(n) {
      switch (orient) {
        case "left":
        case "right": return (n.maxBreadth - n.minBreadth) * h;
        case "top":
        case "bottom": return (n.maxDepth - n.minDepth) / (1 + depth) * h;
        case "radial": return n.parentNode ? (n.innerRadius + n.outerRadius) * Math.sin(n.midAngle) : 0;
      }
    }

    /** @private */
    function innerRadius(n) {
      return Math.max(0, scale(n.minDepth, depth / 2)) * (or - ir) + ir;
    }

    /** @private */
    function outerRadius(n) {
      return scale(n.maxDepth, depth / 2) * (or - ir) + ir;
    }

    /** @private */
    function startAngle(n) {
      return (n.parentNode ? n.minBreadth - .25 : 0) * 2 * Math.PI;
    }

    /** @private */
    function angle(n) {
      return (n.parentNode ? n.maxBreadth - n.minBreadth : 1) * 2 * Math.PI;
    }

    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x = x(n);
      n.y = y(n);
      if (orient == "radial") {
        n.innerRadius = innerRadius(n);
        n.outerRadius = outerRadius(n);
        n.startAngle = startAngle(n);
        n.angle = angle(n);
        n.midAngle = n.startAngle + n.angle / 2;
      } else {
        n.midAngle = horizontal ? -Math.PI / 2 : 0;
      }
      n.dx = dx(n);
      n.dy = dy(n);
    }
  }
};
/**
 * Constructs a new, empty grid layout. Layouts are not typically constructed
 * directly; instead, they are added to an existing panel via
 * {@link pv.Mark#add}.
 *
 * @class Implements a grid layout with regularly-sized rows and columns. The
 * number of rows and columns are determined from their respective
 * properties. For example, the 2&times;3 array:
 *
 * <pre>1 2 3
 * 4 5 6</pre>
 *
 * can be represented using the <tt>rows</tt> property as:
 *
 * <pre>[[1, 2, 3], [4, 5, 6]]</pre>
 *
 * If your data is in column-major order, you can equivalently use the
 * <tt>columns</tt> property. If the <tt>rows</tt> property is an array, it
 * takes priority over the <tt>columns</tt> property. The data is implicitly
 * transposed, as if the {@link pv.transpose} operator were applied.
 *
 * <p>This layout exports a single <tt>cell</tt> mark prototype, which is
 * intended to be used with a bar, panel, layout, or subclass thereof. The data
 * property of the cell prototype is defined as the elements in the array. For
 * example, if the array is a two-dimensional array of values in the range
 * [0,1], a simple heatmap can be generated as:
 *
 * <pre>vis.add(pv.Layout.Grid)
 *     .rows(arrays)
 *   .cell.add(pv.Bar)
 *     .fillStyle(pv.ramp("white", "black"))</pre>
 *
 * The grid subdivides the full width and height of the parent panel into equal
 * rectangles. Note, however, that for large, interactive, or animated heatmaps,
 * you may see significantly better performance through dynamic {@link pv.Image}
 * generation.
 *
 * <p>For irregular grids using value-based spatial partitioning, see {@link
 * pv.Layout.Treemap}.
 *
 * @extends pv.Layout
 */
pv.Layout.Grid = function() {
  pv.Layout.call(this);
  var that = this;

  /**
   * The cell prototype. This prototype is intended to be used with a bar,
   * panel, or layout (or subclass thereof) to render the grid cells.
   *
   * @type pv.Mark
   * @name pv.Layout.Grid.prototype.cell
   */
  (this.cell = new pv.Mark()
      .data(function() {
          return that.scene[that.index].$grid;
        })
      .width(function() {
          return that.width() / that.cols();
        })
      .height(function() {
          return that.height() / that.rows();
        })
      .left(function() {
          return this.width() * (this.index % that.cols());
        })
      .top(function() {
          return this.height() * Math.floor(this.index / that.cols());
        })).parent = this;
};

pv.Layout.Grid.prototype = pv.extend(pv.Layout)
    .property("rows")
    .property("cols");

/**
 * Default properties for grid layouts. By default, there is one row and one
 * column, and the data is the propagated to the child cell.
 *
 * @type pv.Layout.Grid
 */
pv.Layout.Grid.prototype.defaults = new pv.Layout.Grid()
    .extend(pv.Layout.prototype.defaults)
    .rows(1)
    .cols(1);

/** @private */
pv.Layout.Grid.prototype.buildImplied = function(s) {
  pv.Layout.prototype.buildImplied.call(this, s);
  var r = s.rows, c = s.cols;
  if (typeof c == "object") r = pv.transpose(c);
  if (typeof r == "object") {
    s.$grid = pv.blend(r);
    s.rows = r.length;
    s.cols = r[0] ? r[0].length : 0;
  } else {
    s.$grid = pv.repeat([s.data], r * c);
  }
};

/**
 * The number of rows. This property can also be specified as the data in
 * row-major order; in this case, the rows property is implicitly set to the
 * length of the array, and the cols property is set to the length of the first
 * element in the array.
 *
 * @type number
 * @name pv.Layout.Grid.prototype.rows
 */

/**
 * The number of columns. This property can also be specified as the data in
 * column-major order; in this case, the cols property is implicitly set to the
 * length of the array, and the rows property is set to the length of the first
 * element in the array.
 *
 * @type number
 * @name pv.Layout.Grid.prototype.cols
 */
/**
 * Constructs a new, empty stack layout. Layouts are not typically constructed
 * directly; instead, they are added to an existing panel via
 * {@link pv.Mark#add}.
 *
 * @class Implements a layout for stacked visualizations, ranging from simple
 * stacked bar charts to more elaborate "streamgraphs" composed of stacked
 * areas. Stack layouts uses length as a visual encoding, as opposed to
 * position, as the layers do not share an aligned axis.
 *
 * <p>Marks can be stacked vertically or horizontally. For example,
 *
 * <pre>vis.add(pv.Layout.Stack)
 *     .layers([[1, 1.2, 1.7, 1.5, 1.7],
 *              [.5, 1, .8, 1.1, 1.3],
 *              [.2, .5, .8, .9, 1]])
 *     .x(function() this.index * 35)
 *     .y(function(d) d * 40)
 *   .layer.add(pv.Area);</pre>
 *
 * specifies a vertically-stacked area chart, using the default "bottom-left"
 * orientation with "zero" offset. This visualization can be easily changed into
 * a streamgraph using the "wiggle" offset, which attempts to minimize change in
 * slope weighted by layer thickness. See the {@link #offset} property for more
 * supported streamgraph algorithms.
 *
 * <p>In the simplest case, the layer data can be specified as a two-dimensional
 * array of numbers. The <tt>x</tt> and <tt>y</tt> psuedo-properties are used to
 * define the thickness of each layer at the given position, respectively; in
 * the above example of the "bottom-left" orientation, the <tt>x</tt> and
 * <tt>y</tt> psuedo-properties are equivalent to the <tt>left</tt> and
 * <tt>height</tt> properties that you might use if you implemented a stacked
 * area by hand.
 *
 * <p>The advantage of using the stack layout is that the baseline, i.e., the
 * <tt>bottom</tt> property is computed automatically using the specified offset
 * algorithm. In addition, the order of layers can be computed using a built-in
 * algorithm via the <tt>order</tt> property.
 *
 * <p>With the exception of the "expand" <tt>offset</tt>, the stack layout does
 * not perform any automatic scaling of data; the values returned from
 * <tt>x</tt> and <tt>y</tt> specify pixel sizes. To simplify scaling math, use
 * this layout in conjunction with {@link pv.Scale.linear} or similar.
 *
 * <p>In other cases, the <tt>values</tt> psuedo-property can be used to define
 * the data more flexibly. As with a typical panel &amp; area, the
 * <tt>layers</tt> property corresponds to the data in the enclosing panel,
 * while the <tt>values</tt> psuedo-property corresponds to the data for the
 * area within the panel. For example, given an array of data values:
 *
 * <pre>var crimea = [
 *  { date: "4/1854", wounds: 0, other: 110, disease: 110 },
 *  { date: "5/1854", wounds: 0, other: 95, disease: 105 },
 *  { date: "6/1854", wounds: 0, other: 40, disease: 95 },
 *  ...</pre>
 *
 * and a corresponding array of series names:
 *
 * <pre>var causes = ["wounds", "other", "disease"];</pre>
 *
 * Separate layers can be defined for each cause like so:
 *
 * <pre>vis.add(pv.Layout.Stack)
 *     .layers(causes)
 *     .values(crimea)
 *     .x(function(d) x(d.date))
 *     .y(function(d, p) y(d[p]))
 *   .layer.add(pv.Area)
 *     ...</pre>
 *
 * As with the panel &amp; area case, the datum that is passed to the
 * psuedo-properties <tt>x</tt> and <tt>y</tt> are the values (an element in
 * <tt>crimea</tt>); the second argument is the layer data (a string in
 * <tt>causes</tt>). Additional arguments specify the data of enclosing panels,
 * if any.
 *
 * @extends pv.Layout
 */
pv.Layout.Stack = function() {
  pv.Layout.call(this);
  var that = this,
      /** @ignore */ none = function() { return null; },
      prop = {t: none, l: none, r: none, b: none, w: none, h: none},
      values,
      buildImplied = that.buildImplied;

  /** @private Proxy the given property on the layer. */
  function proxy(name) {
    return function() {
        return prop[name](this.parent.index, this.index);
      };
  }

  /** @private Compute the layout! */
  this.buildImplied = function(s) {
    buildImplied.call(this, s);

    var data = s.layers,
        n = data.length,
        m,
        orient = s.orient,
        horizontal = /^(top|bottom)\b/.test(orient),
        h = this.parent[horizontal ? "height" : "width"](),
        x = [],
        y = [],
        dy = [];

    /*
     * Iterate over the data, evaluating the values, x and y functions. The
     * context in which the x and y psuedo-properties are evaluated is a
     * pseudo-mark that is a grandchild of this layout.
     */
    var stack = pv.Mark.stack, o = {parent: {parent: this}};
    stack.unshift(null);
    values = [];
    for (var i = 0; i < n; i++) {
      dy[i] = [];
      y[i] = [];
      o.parent.index = i;
      stack[0] = data[i];
      values[i] = this.$values.apply(o.parent, stack);
      if (!i) m = values[i].length;
      stack.unshift(null);
      for (var j = 0; j < m; j++) {
        stack[0] = values[i][j];
        o.index = j;
        if (!i) x[j] = this.$x.apply(o, stack);
        dy[i][j] = this.$y.apply(o, stack);
      }
      stack.shift();
    }
    stack.shift();

    /* order */
    var index;
    switch (s.order) {
      case "inside-out": {
        var max = dy.map(function(v) { return pv.max.index(v); }),
            map = pv.range(n).sort(function(a, b) { return max[a] - max[b]; }),
            sums = dy.map(function(v) { return pv.sum(v); }),
            top = 0,
            bottom = 0,
            tops = [],
            bottoms = [];
        for (var i = 0; i < n; i++) {
          var j = map[i];
          if (top < bottom) {
            top += sums[j];
            tops.push(j);
          } else {
            bottom += sums[j];
            bottoms.push(j);
          }
        }
        index = bottoms.reverse().concat(tops);
        break;
      }
      case "reverse": index = pv.range(n - 1, -1, -1); break;
      default: index = pv.range(n); break;
    }

    /* offset */
    switch (s.offset) {
      case "silohouette": {
        for (var j = 0; j < m; j++) {
          var o = 0;
          for (var i = 0; i < n; i++) o += dy[i][j];
          y[index[0]][j] = (h - o) / 2;
        }
        break;
      }
      case "wiggle": {
        var o = 0;
        for (var i = 0; i < n; i++) o += dy[i][0];
        y[index[0]][0] = o = (h - o) / 2;
        for (var j = 1; j < m; j++) {
          var s1 = 0, s2 = 0, dx = x[j] - x[j - 1];
          for (var i = 0; i < n; i++) s1 += dy[i][j];
          for (var i = 0; i < n; i++) {
            var s3 = (dy[index[i]][j] - dy[index[i]][j - 1]) / (2 * dx);
            for (var k = 0; k < i; k++) {
              s3 += (dy[index[k]][j] - dy[index[k]][j - 1]) / dx;
            }
            s2 += s3 * dy[index[i]][j];
          }
          y[index[0]][j] = o -= s1 ? s2 / s1 * dx : 0;
        }
        break;
      }
      case "expand": {
        for (var j = 0; j < m; j++) {
          y[index[0]][j] = 0;
          var k = 0;
          for (var i = 0; i < n; i++) k += dy[i][j];
          if (k) {
            k = h / k;
            for (var i = 0; i < n; i++) dy[i][j] *= k;
          } else {
            k = h / n;
            for (var i = 0; i < n; i++) dy[i][j] = k;
          }
        }
        break;
      }
      default: {
        for (var j = 0; j < m; j++) y[index[0]][j] = 0;
        break;
      }
    }

    /* Propagate the offset to the other series. */
    for (var j = 0; j < m; j++) {
      var o = y[index[0]][j];
      for (var i = 1; i < n; i++) {
        o += dy[index[i - 1]][j];
        y[index[i]][j] = o;
      }
    }

    /* Find the property definitions for dynamic substitution. */
    var i = orient.indexOf("-"),
        pdy = horizontal ? "h" : "w",
        px = i < 0 ? (horizontal ? "l" : "b") : orient.charAt(i + 1),
        py = orient.charAt(0);
    for (var p in prop) prop[p] = none;
    prop[px] = function(i, j) { return x[j]; };
    prop[py] = function(i, j) { return y[i][j]; };
    prop[pdy] = function(i, j) { return dy[i][j]; };
  };

  /**
   * The layer prototype. This prototype is intended to be used with an area,
   * bar or panel mark (or subclass thereof). Other mark types may be possible,
   * though note that the stack layout is not currently designed to support
   * radial stacked visualizations using wedges.
   *
   * <p>The layer is not a direct child of the stack layout; a hidden panel is
   * used to replicate layers.
   *
   * @type pv.Mark
   * @name pv.Layout.Stack.prototype.layer
   */
  this.layer = new pv.Mark()
      .data(function() { return values[this.parent.index]; })
      .top(proxy("t"))
      .left(proxy("l"))
      .right(proxy("r"))
      .bottom(proxy("b"))
      .width(proxy("w"))
      .height(proxy("h"));

  this.layer.add = function(type) {
    return that.add(pv.Panel)
        .data(function() { return that.layers(); })
      .add(type)
        .extend(this);
  };
};

pv.Layout.Stack.prototype = pv.extend(pv.Layout)
    .property("orient", String)
    .property("offset", String)
    .property("order", String)
    .property("layers");

/**
 * Default properties for stack layouts. The default orientation is
 * "bottom-left", the default offset is "zero", and the default layers is
 * <tt>[[]]</tt>.
 *
 * @type pv.Layout.Stack
 */
pv.Layout.Stack.prototype.defaults = new pv.Layout.Stack()
    .extend(pv.Layout.prototype.defaults)
    .orient("bottom-left")
    .offset("zero")
    .layers([[]]);

/** @private */
pv.Layout.Stack.prototype.$x
    = /** @private */ pv.Layout.Stack.prototype.$y
    = function() { return 0; };

/**
 * The x psuedo-property; determines the position of the value within the layer.
 * This typically corresponds to the independent variable. For example, with the
 * default "bottom-left" orientation, this function defines the "left" property.
 *
 * @param {function} f the x function.
 * @returns {pv.Layout.Stack} this.
 */
pv.Layout.Stack.prototype.x = function(f) {
  /** @private */ this.$x = pv.functor(f);
  return this;
};

/**
 * The y psuedo-property; determines the thickness of the layer at the given
 * value.  This typically corresponds to the dependent variable. For example,
 * with the default "bottom-left" orientation, this function defines the
 * "height" property.
 *
 * @param {function} f the y function.
 * @returns {pv.Layout.Stack} this.
 */
pv.Layout.Stack.prototype.y = function(f) {
  /** @private */ this.$y = pv.functor(f);
  return this;
};

/** @private The default value function; identity. */
pv.Layout.Stack.prototype.$values = pv.identity;

/**
 * The values function; determines the values for a given layer. The default
 * value is the identity function, which assumes that the layers property is
 * specified as a two-dimensional (i.e., nested) array.
 *
 * @param {function} f the values function.
 * @returns {pv.Layout.Stack} this.
 */
pv.Layout.Stack.prototype.values = function(f) {
  this.$values = pv.functor(f);
  return this;
};

/**
 * The layer data in row-major order. The value of this property is typically a
 * two-dimensional (i.e., nested) array, but any array can be used, provided the
 * values psuedo-property is defined accordingly.
 *
 * @type array[]
 * @name pv.Layout.Stack.prototype.layers
 */

/**
 * The layer orientation. The following values are supported:<ul>
 *
 * <li>bottom-left == bottom
 * <li>bottom-right
 * <li>top-left == top
 * <li>top-right
 * <li>left-top
 * <li>left-bottom == left
 * <li>right-top
 * <li>right-bottom == right
 *
 * </ul>. The default value is "bottom-left", which means that the layers will
 * be built from the bottom-up, and the values within layers will be laid out
 * from left-to-right.
 *
 * <p>Note that with non-zero baselines, some orientations may give similar
 * results. For example, offset("silohouette") centers the layers, resulting in
 * a streamgraph. Thus, the orientations "bottom-left" and "top-left" will
 * produce similar results, differing only in the layer order.
 *
 * @type string
 * @name pv.Layout.Stack.prototype.orient
 */

/**
 * The layer order. The following values are supported:<ul>
 *
 * <li><i>null</i> - use given layer order.
 * <li>inside-out - sort by maximum value, with balanced order.
 * <li>reverse - use reverse of given layer order.
 *
 * </ul>For details on the inside-out order algorithm, refer to "Stacked Graphs
 * -- Geometry &amp; Aesthetics" by L. Byron and M. Wattenberg, IEEE TVCG
 * November/December 2008.
 *
 * @type string
 * @name pv.Layout.Stack.prototype.order
 */

/**
 * The layer offset; the y-position of the bottom of the lowest layer. The
 * following values are supported:<ul>
 *
 * <li>zero - use a zero baseline, i.e., the y-axis.
 * <li>silohouette - center the stream, i.e., ThemeRiver.
 * <li>wiggle - minimize weighted change in slope.
 * <li>expand - expand layers to fill the enclosing layout dimensions.
 *
 * </ul>For details on these offset algorithms, refer to "Stacked Graphs --
 * Geometry &amp; Aesthetics" by L. Byron and M. Wattenberg, IEEE TVCG
 * November/December 2008.
 *
 * @type string
 * @name pv.Layout.Stack.prototype.offset
 */
/**
 * Constructs a new, empty band layout. Layouts are not typically constructed
 * directly; instead, they are added to an existing panel via
 * {@link pv.Mark#add}.
 *
 * @class Implements a layout for banded visualizations; it is
 * mainly used for grouped bar charts.
 * 
 * @extends pv.Layout
 */
pv.Layout.Band = function() {
    
    pv.Layout.call(this);

    var that = this,
        buildImplied = that.buildImplied,
        itemProps,
        values;

    /**
     * The prototype mark of the items mark.
     */
    var itemProto = new pv.Mark()
        .data  (function() { return values[this.parent.index]; })
        .top   (proxy("t"))
        .left  (proxy("l"))
        .right (proxy("r"))
        .bottom(proxy("b"))
        .width (proxy("w"))
        .height(proxy("h"));

    /**
     * Proxy the given property for an item of a band.
     * @private
     */
    function proxy(name) {
        return function() {
            /* bandIndex, layerIndex */
            return itemProps[name](this.index, this.parent.index);
        };
    }
    
    /**
     * Compute the layout.
     * @private
     */
    this.buildImplied = function(s) {
        buildImplied.call(this, s);

        /* Update shared fields */
        itemProps = Object.create(pv.Layout.Band.$baseItemProps);
        values = [];

        var data = s.layers,
            L = data.length;
        if(L > 0){
            var orient = s.orient,
                horizontal = /^(top|bottom)\b/.test(orient),
                bh = this.parent[horizontal ? "height" : "width"](),
                bands = this._readData(data, values, s),
                B = bands.length;
            
            /* Band order */
            if(s.bandOrder === "reverse") {
                bands.reverse();
            }
            
            /* Layer order */
            if(s.order === "reverse") {
                values.reverse();
                
                for (var b = 0; b < B; b++) {
                    bands[b].items.reverse();
                }
            }

            /* Layout kind */
            switch(s.layout){
                case "grouped": this._calcGrouped(bands, L, s);     break;
                case "stacked": this._calcStacked(bands, L, bh, s); break;
            }

            this._bindItemProps(bands, itemProps, orient, horizontal);
       }
    };

    var itemAccessor = this.item = {
        end: this,

        add: function(type) {
            return that.add(pv.Panel)
                    .data(function(){return that.layers();})
                    .add(type)
                    .extend(itemProto);
        },

        order: function(value){
            that.order(value);
            return this;
        },

        /**
         * The item width pseudo-property;
         * determines the width of an item.
         */
        w: function(f){
            that.$iw = pv.functor(f);
            return this;
        },

        /**
         * The item height pseudo-property;
         * determines the height of an item.
         */
        h: function(f){
            that.$ih = pv.functor(f);
            return this;
        },

        /**
         * The percentage of total item width to band width
         * in a grouped layout.
         * <p>
         * The empty space is equally distributed in
         * separating items within a band.
         * </p>
         * <p>
         * Evaluated once per band
         * (on the corresponding band's item of the first series).
         * </p>
         * <pre>
         * f: (item, series) -> percentage
         * </pre>
         */
        horizontalRatio: function(f){
            that.$ihorizRatio = pv.functor(f);
            return this;
        },

        /**
         * The vertical margin that separates stacked items,
         * in a stacked layout.
         * <p>
         * Half the specified margin is discounted
         * from each of the items own height.
         * </p>
         * 
         * <p>
         * Evaluated once per band
         * (on the corresponding band's item of the first series).
         * </p>
         * <pre>
         * f: (item, series) -> height
         * </pre>
         */
        verticalMargin: function(f){
            that.$ivertiMargin = pv.functor(f);
            return this;
        }
    };

    var bandAccessor = this.band = {
        end: this,
        
        /**
         * The band width pseudo-property;
         * determines the width of a band
         * when the item layout grouped.
         * <p>
         * Evaluated once per band
         * (on the corresponding band's item of the first series).
         * </p>
         * <pre>
         * f: (item, series) -> width
         * </pre>
         */
        w: function(f){
            that.$bw = pv.functor(f);
            return this;
        },

        /**
         * The band x pseudo-property;
         * determines the x center position of a band
         * in a layer panel.
         * 
         * <p>
         * Evaluated once per band
         * (on the corresponding band's item of the first series).
         * </p>
         * <pre>
         * f: (item, series) -> x
         * </pre>
         */
        x: function(f){
            that.$bx = pv.functor(f);
            return this;
        },

        order: function(value){
            that.bandOrder(value);
            return this;
        },

        /**
         * Band differential control pseudo-property.
         *  2 - Drawn starting at previous band offset. Multiply values by  1. Don't update offset.
         *  1 - Drawn starting at previous band offset. Multiply values by  1. Update offset.
         *  0 - Reset offset to 0. Drawn starting at 0. Default. Leave offset at 0.
         * -1 - Drawn starting at previous band offset. Multiply values by -1. Update offset.
         * -2 - Drawn starting at previous band offset. Multiply values by -1. Don't update offset.
         * @private
         */
        differentialControl: function(f){
            that.$bDiffControl = pv.functor(f);
            return this;
        }
    };

    this.band.item = itemAccessor;
    this.item.band = bandAccessor;
};

pv.Layout.Band.$baseItemProps = (function(){
    var none = function() {return null;};
    return {t: none, l: none, r: none, b: none, w: none, h: none};
}());

pv.Layout.Band.prototype = pv.extend(pv.Layout)
    .property("orient", String)     // x-y orientation
    .property("layout", String)     // items layout within band: "grouped", "stacked"
    .property("layers") // data
    .property("yZero",     Number)  // The y zero base line
    .property("verticalMode",   String) // The vertical mode: 'expand', null
    .property("horizontalMode", String) // The horizontal mode: 'expand', null
    .property("order",     String)  // layer order; "reverse" or null
    .property("bandOrder", String)  // band order;  "reverse" or null
    ;

/**
 * Default properties for stack layouts.
 * The default orientation is "bottom-left",
 * the default layout is "grouped",
 * the default y zero base line is 0, and
 * the default layers is <tt>[[]]</tt>.
 *
 * @type pv.Layout.Band
 */
pv.Layout.Band.prototype.defaults = new pv.Layout.Band()
    .extend(pv.Layout.prototype.defaults)
    .orient("bottom-left")
    .layout("grouped")
    .yZero(0)
    .layers([[]])
    ;

/** @private */ pv.Layout.Band.prototype.$bx =
/** @private */ pv.Layout.Band.prototype.$bw =
/** @private */ pv.Layout.Band.prototype.$bDiffControl = 
/** @private */ pv.Layout.Band.prototype.$iw =
/** @private */ pv.Layout.Band.prototype.$ih =
/** @private */ pv.Layout.Band.prototype.$ivertiMargin = pv.functor(0);

/** @private */ pv.Layout.Band.prototype.$ihorizRatio = pv.functor(0.9);

/** @private The default values function; identity. */
pv.Layout.Band.prototype.$values = pv.identity;

/**
 * The values function; determines the values for a given band.
 * The default value is the identity function,
 * which assumes that the bands property is specified as
 * a two-dimensional (i.e., nested) array.
 *
 * @param {function} f the values function.
 * @returns {pv.Layout.Band} this.
 */
pv.Layout.Band.prototype.values = function(f) {
  this.$values = pv.functor(f);
  return this;
};

pv.Layout.prototype._readData = function(data, layersValues, scene){
    var L = data.length,
        bands = [
            /*
            {
                x:   0, // x left position of each band
                w:   0, // width of each band
                iwr: 0, // item width ratio of each band
                items: [ // indexed by series index
                    {
                        h: 0, // height of each item
                        w: 0, // width of each item
                        x: 0  // position of each item (within its band) (calculated)
                    }
                ]
            }
            */
        ],
        B;

    /*
     * Iterate over the data, evaluating the values, x and y functions.
     * The context in which the x and y pseudo-properties are evaluated is a
     * pseudo-mark that is a *grandchild* of this layout.
     */
    var stack = pv.Mark.stack,
        o = {parent: {parent: this}};

    stack.unshift(null);

    for (var l = 0; l < L; l++) {
        o.parent.index = l;
        stack[0] = data[l];

        /* Eval per-layer properties */
        
        var layerValues = layersValues[l] = this.$values.apply(o.parent, stack);
        if(!l){
            B = layerValues.length;
        }

        /* Eval per-item properties */
        stack.unshift(null);
        for (var b = 0; b < B ; b++) {
            stack[0] = layerValues[b];
            o.index  = b;

            /* First series evaluates band stuff, for each band */
            var band = bands[b];
            if(!band) {
                band = bands[b] = {
                    horizRatio:  this.$ihorizRatio.apply(o, stack),
                    vertiMargin: this.$ivertiMargin.apply(o, stack),
                    w: this.$bw.apply(o, stack),
                    x: this.$bx.apply(o, stack),
                    diffControl: this.$bDiffControl ? this.$bDiffControl.apply(o, stack) : 0,
                    items: []
                };
            }

            var ih = this.$ih.apply(o, stack); // may be null
            band.items[l] = {
                y: (scene.yZero || 0),
                x: 0,
                w: this.$iw.apply(o, stack),
                h: ih != null ? Math.abs(ih) : ih,
                dir: ih < 0 ? -1 : 1 // null -> 1
            };
        }
        stack.shift();
    }
    stack.shift();

    return bands;
};

pv.Layout.Band.prototype._calcGrouped = function(bands, L, scene){
    /* Compute item x positions relative to parent panel */
    for (var b = 0, B = bands.length; b < B ; b++) {
        var band = bands[b],
            items = band.items,
            w = band.w,
            horizRatio = band.horizRatio,
            wItems = 0;

        /* Total items width */
        for (var l = 0 ; l < L ; l++) { wItems += items[l].w; }
        
        if(L === 1) {
            /*
             * Horizontal ratio does not apply
             * There's no space between...
             */
            horizRatio = 1;
        } else if(!(horizRatio > 0 && horizRatio <= 1)) {
            horizRatio = 1;
        }
        
        if(w == null){
            /* Expand band width to contain all items plus ratio */
            w = band.w = wItems / horizRatio;
            
        } else if(scene.horizontalMode === 'expand'){
            /* Scale items width to fit in band's width */

            var wItems2 = horizRatio * w;
            if (wItems) {
                var wScale = wItems2 / wItems;
                for (var l = 0 ; l < L ; l++) {
                    items[l].w *= wScale;
                }
            } else {
                var wiavg = wItems2 / L;
                for (var l = 0 ; l < L; l++) {
                    items[l].w = wiavg;
                }
            }

            wItems = wItems2;
        }

        var wItemsWithMargin = wItems / horizRatio,
            /* items start x position */
            ix = band.x - (wItemsWithMargin / 2),
            margin = L > 1 ? ((wItemsWithMargin - wItems) / (L - 1)) : 0;

        for (var l = 0 ; l < L ; l++) {
            var item = items[l];
            item.x = ix;
            ix += item.w + margin;

            /* Negative direction turns into a lower iy */
            if(item.dir < 0){
                item.y -= item.h;
            }
        }
    }
};

pv.Layout.Band.prototype._calcStacked = function(bands, L, bh, scene){
    var B = bands.length,
        items;

    if(scene.verticalMode === "expand") {
        for (var b = 0; b < B; b++) {
            items = bands[b].items;

            /* Sum across layers for this band */
            var hSum = null, nonNullCount = 0;
            for (var l = 0; l < L; l++) {
                /* We get rid of negative heights
                 * because it is preferable to respect the layer's order
                 * in this case, than to group negative and positive layers,
                 * taking them out of order.
                 */
                var item = items[l];
                item.dir = 1;
                var h = item.h;
                if(h != null){
                    nonNullCount++;
                    hSum += h; // null + 1 = 0 + 1
                }
            }

            /* Scale hs */
            if(nonNullCount){
                if (hSum) {
                    var hScale = bh / hSum;
                    for (var l = 0; l < L; l++) {
                        var h = items[l].h;
                        if(h != null){
                            items[l].h = h * hScale;
                        }
                    }
                } else {
                    var hAvg = bh / nonNullCount;
                    for (var l = 0; l < L; l++) {
                        var h = items[l].h;
                        if(h != null){
                            items[l].h = hAvg;
                        }
                    }
                }
            }
        }
    }

    /*
     * Propagate y offset to other layers.
     * Assign width.
     * Calc x position.
     * Discount vertiMargin
     */
    var yZero = scene.yZero,
        yOffset = yZero;

    for (var b = 0; b < B; b++) {
        var band = bands[b],
            bx = band.x, // centered on band
            bDiffControl = band.diffControl,
            positiveGoesDown = (bDiffControl < 0), // -1 or -2
            vertiMargin = Math.max(0, band.vertiMargin);

        items = band.items;
        
        // diffControl
        var resultPos = this._layoutItemsOfDir(+1, positiveGoesDown, items, vertiMargin, bx, yOffset),
            resultNeg = null; // reset on each iteration
        if(resultPos.existsOtherDir) {
            resultNeg = this._layoutItemsOfDir(-1, positiveGoesDown, items, vertiMargin, bx, yOffset);
        }

        if(bDiffControl) {
            // Update offset?
            if(Math.abs(bDiffControl) === 1) {
                var yOffset0 = yOffset;
                yOffset = resultPos.yOffset;
                if(resultNeg) {
                    yOffset -= (yOffset0 - resultNeg.yOffset);
                }
            }
        } else {
            // reset offset afterwards
            yOffset = yZero;
        }
    }
};

pv.Layout.Band.prototype._layoutItemsOfDir = function(stackDir, positiveGoesDown, items, vertiMargin, bx, yOffset){
    var existsOtherDir = false,
        vertiMargin2 = vertiMargin / 2,
        efDir = (positiveGoesDown ? -stackDir : stackDir),
        reverseLayers = positiveGoesDown;
    
    for (var l = 0, L = items.length ; l < L ; l+=1) {
        var item = items[reverseLayers ? (L -l -1) : l];
        if(item.dir === stackDir){
            var h = item.h || 0; // null -> 0
            
            if(efDir > 0) {
                item.y = yOffset + vertiMargin2;
                yOffset += h;
            } else {
                item.y = yOffset - (h - vertiMargin2);
                yOffset -= h;
            }
            
            var h2 = h - vertiMargin;
            item.h = h2 > 0 ? h2 : 0;
            item.x = bx - item.w / 2;
        } else {
            existsOtherDir = true;
        }
    }

    return {
        existsOtherDir: existsOtherDir,
        yOffset: yOffset
    };
};

pv.Layout.Band.prototype._bindItemProps = function(bands, itemProps, orient, horizontal){
    /*
     * Find the property definitions for dynamic substitution.
     *
     * orient = xOrientation-yOrientation
     */
    var index = orient.indexOf("-"),
        ph = horizontal ? "h" : "w",
        pw = horizontal ? "w" : "h",
        px = index < 0 ?
            /* Default yOrientation
            * horizontal -> left
            * vertical   -> bottom
            */
            (horizontal ? "l" : "b") :
            /*
            * -l,r,t,b ...
            */
            orient.charAt(index + 1),

        /*
        * b,t,l,r
        */
        py  = orient.charAt(0);

    itemProps[px] = function(b, l) {return bands[b].items[l].x;};
    itemProps[py] = function(b, l) {return bands[b].items[l].y;};
    itemProps[pw] = function(b, l) {return bands[b].items[l].w;};
    itemProps[ph] = function(b, l) {return bands[b].items[l].h || 0;}; // null -> 0
};
/**
 * Constructs a new, empty treemap layout. Layouts are not typically
 * constructed directly; instead, they are added to an existing panel via
 * {@link pv.Mark#add}.
 *
 * @class Implements a space-filling rectangular layout, with the hierarchy
 * represented via containment. Treemaps represent nodes as boxes, with child
 * nodes placed within parent boxes. The size of each box is proportional to the
 * size of the node in the tree. This particular algorithm is taken from Bruls,
 * D.M., C. Huizing, and J.J. van Wijk, <a
 * href="http://www.win.tue.nl/~vanwijk/stm.pdf">"Squarified Treemaps"</a> in
 * <i>Data Visualization 2000, Proceedings of the Joint Eurographics and IEEE
 * TCVG Sumposium on Visualization</i>, 2000, pp. 33-42.
 *
 * <p>The meaning of the exported mark prototypes changes slightly in the
 * space-filling implementation:<ul>
 *
 * <li><tt>node</tt> - for rendering nodes; typically a {@link pv.Bar}. The node
 * data is populated with <tt>dx</tt> and <tt>dy</tt> attributes, in addition to
 * the standard <tt>x</tt> and <tt>y</tt> position attributes.
 *
 * <p><li><tt>leaf</tt> - for rendering leaf nodes only, with no fill or stroke
 * style by default; typically a {@link pv.Panel} or another layout!
 *
 * <p><li><tt>link</tt> - unsupported; undefined. Links are encoded implicitly
 * in the arrangement of the space-filling nodes.
 *
 * <p><li><tt>label</tt> - for rendering node labels; typically a
 * {@link pv.Label}.
 *
 * </ul>For more details on how to use this layout, see
 * {@link pv.Layout.Hierarchy}.
 *
 * @extends pv.Layout.Hierarchy
 */
pv.Layout.Treemap = function() {
  pv.Layout.Hierarchy.call(this);

  this.node
      .strokeStyle("#fff")
      .fillStyle("rgba(31, 119, 180, .25)")
      .width(function(n) { return n.dx; })
      .height(function(n) { return n.dy; });

  this.label
      .visible(function(n) { return !n.firstChild; })
      .left(function(n) { return n.x + (n.dx / 2); })
      .top(function(n) { return n.y + (n.dy / 2); })
      .textAlign("center")
      .textAngle(function(n) { return n.dx > n.dy ? 0 : -Math.PI / 2; });

  (this.leaf = new pv.Mark()
      .extend(this.node)
      .fillStyle(null)
      .strokeStyle(null)
      .visible(function(n) { return !n.firstChild; })).parent = this;

  /* Hide unsupported link. */
  delete this.link;
};

pv.Layout.Treemap.prototype = pv.extend(pv.Layout.Hierarchy)
    .property("round",         Boolean)
    .property("mode",          String)
    .property("order",         String);

/**
 * Default properties for treemap layouts. The default mode is "squarify" and
 * the default order is "ascending".
 *
 * @type pv.Layout.Treemap
 */
pv.Layout.Treemap.prototype.defaults = new pv.Layout.Treemap()
    .extend(pv.Layout.Hierarchy.prototype.defaults)
    .mode("squarify") // squarify, slice-and-dice, slice, dice
    .order("ascending"); // ascending, descending, reverse, null

/**
 * Whether node sizes should be rounded to integer values. This has a similar
 * effect to setting <tt>antialias(false)</tt> for node values, but allows the
 * treemap algorithm to accumulate error related to pixel rounding.
 *
 * @type boolean
 * @name pv.Layout.Treemap.prototype.round
 */

/**
 * The left inset between parent and child in pixels. Defaults to 0.
 *
 * @type number
 * @name pv.Layout.Treemap.prototype.paddingLeft
 * @see #padding
 */

/**
 * The right inset between parent and child in pixels. Defaults to 0.
 *
 * @type number
 * @name pv.Layout.Treemap.prototype.paddingRight
 * @see #padding
 */

/**
 * The top inset between parent and child in pixels. Defaults to 0.
 *
 * @type number
 * @name pv.Layout.Treemap.prototype.paddingTop
 * @see #padding
 */

/**
 * The bottom inset between parent and child in pixels. Defaults to 0.
 *
 * @type number
 * @name pv.Layout.Treemap.prototype.paddingBottom
 * @see #padding
 */

/**
 * The treemap algorithm. The default value is "squarify". The "slice-and-dice"
 * algorithm may also be used, which alternates between horizontal and vertical
 * slices for different depths. In addition, the "slice" and "dice" algorithms
 * may be specified explicitly to control whether horizontal or vertical slices
 * are used, which may be useful for nested treemap layouts.
 *
 * @type string
 * @name pv.Layout.Treemap.prototype.mode
 * @see <a
 * href="ftp://ftp.cs.umd.edu/pub/hcil/Reports-Abstracts-Bibliography/2001-06html/2001-06.pdf"
 * >"Ordered Treemap Layouts"</a> by B. Shneiderman &amp; M. Wattenberg, IEEE
 * InfoVis 2001.
 */

/**
 * The sibling node order. A <tt>null</tt> value means to use the sibling order
 * specified by the nodes property as-is; "reverse" will reverse the given
 * order. The default value "ascending" will sort siblings in ascending order of
 * size, while "descending" will do the reverse. For sorting based on data
 * attributes other than size, use the default <tt>null</tt> for the order
 * property, and sort the nodes beforehand using the {@link pv.Dom} operator.
 *
 * @type string
 * @name pv.Layout.Treemap.prototype.order
 */

/** @private The default size function. */
pv.Layout.Treemap.prototype.$size = function(d) { return Number(d.nodeValue); };

pv.Layout.Treemap.prototype.$padLeft   = 
pv.Layout.Treemap.prototype.$padRight  = 
pv.Layout.Treemap.prototype.$padBottom = 
pv.Layout.Treemap.prototype.$padTop    = 
    /** @private The default padding function. */
    function() { return 0; };


/**
 * Specifies the sizing function. By default, the size function uses the
 * <tt>nodeValue</tt> attribute of nodes as a numeric value: <tt>function(d)
 * Number(d.nodeValue)</tt>.
 *
 * <p>The sizing function is invoked for each leaf node in the tree, per the
 * <tt>nodes</tt> property. For example, if the tree data structure represents a
 * file system, with files as leaf nodes, and each file has a <tt>bytes</tt>
 * attribute, you can specify a size function as:
 *
 * <pre>    .size(function(d) d.bytes)</pre>
 *
 * @param {function} f the new sizing function.
 * @returns {pv.Layout.Treemap} this.
 */
pv.Layout.Treemap.prototype.size = function(f) {
  this.$size = pv.functor(f);
  return this;
};

/**
 * Alias for setting the left, right, top and bottom padding pseudo-properties
 * simultaneously.
 *
 * @see #paddingLeft
 * @see #paddingRight
 * @see #paddingTop
 * @see #paddingBottom
 * @returns {pv.Layout.Treemap} this.
 */
pv.Layout.Treemap.prototype.padding = function(n) {
    return this.paddingLeft(n).paddingRight(n).paddingTop(n).paddingBottom(n);
};

/**
 * Specifies the paddingLeft function. By default, it is 0.
 *
 * <p>The paddingLeft function is invoked for each parent node in the tree. 
 * 
 * @param {function} f the new paddingLeft function.
 * @returns {pv.Layout.Treemap} this.
 */
pv.Layout.Treemap.prototype.paddingLeft = function(f) {
    if(arguments.length) { this.$padLeft = f; }
    return this.$padLeft;
};

/**
 * Specifies the paddingRight function. By default, it is 0.
 *
 * <p>The paddingRight function is invoked for each parent node in the tree. 
 * 
 * @param {function} f the new paddingRight function.
 * @returns {pv.Layout.Treemap} this.
 */
pv.Layout.Treemap.prototype.paddingRight = function(f) {
    if(arguments.length) { this.$padRight = f; }
    return this.$padRight;
};

/**
 * Specifies the paddingBottom function. By default, it is 0.
 *
 * <p>The paddingBottom function is invoked for each parent node in the tree. 
 * 
 * @param {function} f the new paddingBottom function.
 * @returns {pv.Layout.Treemap} this.
 */
pv.Layout.Treemap.prototype.paddingBottom = function(f) {
    if(arguments.length) { this.$padBottom = f; }
    return this.$padBottom;
};

/**
 * Specifies the paddingTop function. By default, it is 0.
 *
 * <p>The paddingTop function is invoked for each parent node in the tree. 
 * 
 * @param {function} f the new paddingTop function.
 * @returns {pv.Layout.Treemap} this.
 */
pv.Layout.Treemap.prototype.paddingTop = function(f) {
    if(arguments.length) { this.$padTop = f; }
    return this.$padTop;
};

/** @private */
pv.Layout.Treemap.prototype.buildImplied = function(s) {
  pv.Layout.Hierarchy.prototype.buildImplied.call(this, s);

  var that = this,
      nodes = s.nodes,
      root = nodes[0],
      stack = pv.Mark.stack,
      left = s.paddingLeft,
      right = s.paddingRight,
      top = s.paddingTop,
      bottom = s.paddingBottom,
      /** @ignore */ size = function(n) { return n.size; },
      round = s.round ? Math.round : Number,
      mode = s.mode;

  /** @private */
  function slice(row, sum, horizontal, x, y, w, h) {
    for (var i = 0, d = 0; i < row.length; i++) {
      var n = row[i];
      if (horizontal) {
        n.x = x + d;
        n.y = y;
        d += n.dx = round(w * n.size / sum);
        n.dy = h;
      } else {
        n.x = x;
        n.y = y + d;
        n.dx = w;
        d += n.dy = round(h * n.size / sum);
      }
    }
    if (n) { // correct on-axis rounding error
      if (horizontal) {
        n.dx += w - d;
      } else {
        n.dy += h - d;
      }
    }
  }

  /** @private */
  function ratio(row, l) {
    var rmax = -Infinity, rmin = Infinity, s = 0;
    for (var i = 0; i < row.length; i++) {
      var r = row[i].size;
      if (r < rmin) rmin = r;
      if (r > rmax) rmax = r;
      s += r;
    }
    s = s * s;
    l = l * l;
    return Math.max(l * rmax / s, s / (l * rmin));
  }

  /** @private */
  function layout(n, i) {
    var p = n.parentNode,
        x = n.x,
        y = n.y,
        w = n.dx,
        h = n.dy;
    
    if(p) {
        x += p.paddingLeft;
        y += p.paddingTop;
        w += -p.paddingLeft -p.paddingRight,
        h += -p.paddingTop  -p.paddingBottom;
    }
    
    /* Assume squarify by default. */
    if (mode != "squarify") {
      slice(
        n.childNodes, 
        n.size,
        mode == "slice" ? true  :
        mode == "dice"  ? false : i & 1, 
        x, 
        y, 
        w, 
        h);
      return;
    }

    var row = [],
        mink = Infinity,
        l = Math.min(w, h),
        k = w * h / n.size;

    /* Abort if the size is non-positive. */
    if (n.size <= 0) return;

    /* Scale the sizes to fill the current sub-region. */
    n.visitBefore(function(n) { n.size *= k; });

    /** @private Position the specified nodes along one dimension. */
    function position(row) {
      var horizontal = w == l,
          sum = pv.sum(row, size),
          r = l ? round(sum / l) : 0;
      slice(row, sum, horizontal, x, y, horizontal ? w : r, horizontal ? r : h);
      if (horizontal) {
        y += r;
        h -= r;
      } else {
        x += r;
        w -= r;
      }
      l = Math.min(w, h);
      return horizontal;
    }

    var children = n.childNodes.slice(); // copy
    while (children.length) {
      var child = children[children.length - 1];
      if (!child.size) {
        children.pop();
        continue;
      }
      row.push(child);

      var k = ratio(row, l);
      if (k <= mink) {
        children.pop();
        mink = k;
      } else {
        row.pop();
        position(row);
        row.length = 0;
        mink = Infinity;
      }
    }

    /* correct off-axis rounding error */
    if (position(row)) for (var i = 0; i < row.length; i++) {
      row[i].dy += h;
    } else for (var i = 0; i < row.length; i++) {
      row[i].dx += w;
    }
  }

  /* Recursively compute the node depth and size. */
  stack.unshift(null);
  try{
      root.visitAfter(function(n, i) {
          n.depth = i;
          n.x = n.y = n.dx = n.dy = 0;
          
          stack[0] = n;
          
          var f;
          if(n.firstChild) {
              n.size = pv.sum(n.childNodes, size);
              n.paddingRight  = +that.$padRight .apply(that, stack) || 0;
              n.paddingLeft   = +that.$padLeft  .apply(that, stack) || 0;
              n.paddingBottom = +that.$padBottom.apply(that, stack) || 0;
              n.paddingTop    = +that.$padTop   .apply(that, stack) || 0;
          } else {
              n.size = that.$size.apply(that, stack);
          }
      });
  } finally { 
      stack.shift();
  }
  
  /* Sort. */
  switch (s.order) {
    case "ascending":  root.sort(function(a, b) { return a.size - b.size; }); break;
    case "descending": root.sort(function(a, b) { return b.size - a.size; }); break;
    case "reverse":    root.reverse(); break;
  }

  /* Recursively compute the layout. */
  root.x = 0;
  root.y = 0;
  root.dx = s.width;
  root.dy = s.height;
  root.visitBefore(layout);
};
/**
 * Constructs a new, empty tree layout. Layouts are not typically constructed
 * directly; instead, they are added to an existing panel via
 * {@link pv.Mark#add}.
 *
 * @class Implements a node-link tree diagram using the Reingold-Tilford "tidy"
 * tree layout algorithm. The specific algorithm used by this layout is based on
 * <a href="http://citeseer.ist.psu.edu/buchheim02improving.html">"Improving
 * Walker's Algorithm to Run in Linear Time"</A> by C. Buchheim, M. J&uuml;nger
 * &amp; S. Leipert, Graph Drawing 2002. This layout supports both cartesian and
 * radial orientations orientations for node-link diagrams.
 *
 * <p>The tree layout supports a "group" property, which if true causes siblings
 * to be positioned closer together than unrelated nodes at the same depth. The
 * layout can be configured using the <tt>depth</tt> and <tt>breadth</tt>
 * properties, which control the increments in pixel space between nodes in both
 * dimensions, similar to the indent layout.
 *
 * <p>For more details on how to use this layout, see
 * {@link pv.Layout.Hierarchy}.
 *
 * @extends pv.Layout.Hierarchy
 */
pv.Layout.Tree = function() {
  pv.Layout.Hierarchy.call(this);
};

pv.Layout.Tree.prototype = pv.extend(pv.Layout.Hierarchy)
    .property("group", Number)
    .property("breadth", Number)
    .property("depth", Number)
    .property("orient", String);

/**
 * Default properties for tree layouts. The default orientation is "top", the
 * default group parameter is 1, and the default breadth and depth offsets are
 * 15 and 60 respectively.
 *
 * @type pv.Layout.Tree
 */
pv.Layout.Tree.prototype.defaults = new pv.Layout.Tree()
    .extend(pv.Layout.Hierarchy.prototype.defaults)
    .group(1)
    .breadth(15)
    .depth(60)
    .orient("top");

/** @private */
pv.Layout.Tree.prototype.buildImplied = function(s) {
  if (pv.Layout.Hierarchy.prototype.buildImplied.call(this, s)) return;

  var nodes = s.nodes,
      orient = s.orient,
      depth = s.depth,
      breadth = s.breadth,
      group = s.group,
      w = s.width,
      h = s.height;

  /** @private */
  function firstWalk(v) {
    var l, r, a;
    if (!v.firstChild) {
      if (l = v.previousSibling) {
        v.prelim = l.prelim + distance(v.depth, true);
      }
    } else {
      l = v.firstChild;
      r = v.lastChild;
      a = l; // default ancestor
      for (var c = l; c; c = c.nextSibling) {
        firstWalk(c);
        a = apportion(c, a);
      }
      executeShifts(v);
      var midpoint = .5 * (l.prelim + r.prelim);
      if (l = v.previousSibling) {
        v.prelim = l.prelim + distance(v.depth, true);
        v.mod = v.prelim - midpoint;
      } else {
        v.prelim = midpoint;
      }
    }
  }

  /** @private */
  function secondWalk(v, m, depth) {
    v.breadth = v.prelim + m;
    m += v.mod;
    for (var c = v.firstChild; c; c = c.nextSibling) {
      secondWalk(c, m, depth);
    }
  }

  /** @private */
  function apportion(v, a) {
    var w = v.previousSibling;
    if (w) {
      var vip = v,
          vop = v,
          vim = w,
          vom = v.parentNode.firstChild,
          sip = vip.mod,
          sop = vop.mod,
          sim = vim.mod,
          som = vom.mod,
          nr = nextRight(vim),
          nl = nextLeft(vip);
      while (nr && nl) {
        vim = nr;
        vip = nl;
        vom = nextLeft(vom);
        vop = nextRight(vop);
        vop.ancestor = v;
        var shift = (vim.prelim + sim) - (vip.prelim + sip) + distance(vim.depth, false);
        if (shift > 0) {
          moveSubtree(ancestor(vim, v, a), v, shift);
          sip += shift;
          sop += shift;
        }
        sim += vim.mod;
        sip += vip.mod;
        som += vom.mod;
        sop += vop.mod;
        nr = nextRight(vim);
        nl = nextLeft(vip);
      }
      if (nr && !nextRight(vop)) {
        vop.thread = nr;
        vop.mod += sim - sop;
      }
      if (nl && !nextLeft(vom)) {
        vom.thread = nl;
        vom.mod += sip - som;
        a = v;
      }
    }
    return a;
  }

  /** @private */
  function nextLeft(v) {
    return v.firstChild || v.thread;
  }

  /** @private */
  function nextRight(v) {
    return v.lastChild || v.thread;
  }

  /** @private */
  function moveSubtree(wm, wp, shift) {
    var subtrees = wp.number - wm.number;
    wp.change -= shift / subtrees;
    wp.shift += shift;
    wm.change += shift / subtrees;
    wp.prelim += shift;
    wp.mod += shift;
  }

  /** @private */
  function executeShifts(v) {
    var shift = 0, change = 0;
    for (var c = v.lastChild; c; c = c.previousSibling) {
      c.prelim += shift;
      c.mod += shift;
      change += c.change;
      shift += c.shift + change;
    }
  }

  /** @private */
  function ancestor(vim, v, a) {
    return (vim.ancestor.parentNode == v.parentNode) ? vim.ancestor : a;
  }

  /** @private */
  function distance(depth, siblings) {
    return (siblings ? 1 : (group + 1)) / ((orient == "radial") ? depth : 1);
  }

  /* Initialize temporary layout variables. TODO: store separately. */
  var root = nodes[0];
  root.visitAfter(function(v, i) {
      v.ancestor = v;
      v.prelim = 0;
      v.mod = 0;
      v.change = 0;
      v.shift = 0;
      v.number = v.previousSibling ? (v.previousSibling.number + 1) : 0;
      v.depth = i;
    });

  /* Compute the layout using Buchheim et al.'s algorithm. */
  firstWalk(root);
  secondWalk(root, -root.prelim, 0);

  /** @private Returns the angle of the given node. */
  function midAngle(n) {
    return (orient == "radial") ? n.breadth / depth : 0;
  }

  /** @private */
  function x(n) {
    switch (orient) {
      case "left": return n.depth;
      case "right": return w - n.depth;
      case "top":
      case "bottom": return n.breadth + w / 2;
      case "radial": return w / 2 + n.depth * Math.cos(midAngle(n));
    }
  }

  /** @private */
  function y(n) {
    switch (orient) {
      case "left":
      case "right": return n.breadth + h / 2;
      case "top": return n.depth;
      case "bottom": return h - n.depth;
      case "radial": return h / 2 + n.depth * Math.sin(midAngle(n));
    }
  }

  /* Clear temporary layout variables; transform depth and breadth. */
  root.visitAfter(function(v) {
      v.breadth *= breadth;
      v.depth *= depth;
      v.midAngle = midAngle(v);
      v.x = x(v);
      v.y = y(v);
      if (v.firstChild) v.midAngle += Math.PI;
      delete v.breadth;
      delete v.depth;
      delete v.ancestor;
      delete v.prelim;
      delete v.mod;
      delete v.change;
      delete v.shift;
      delete v.number;
      delete v.thread;
    });
};

/**
 * The offset between siblings nodes; defaults to 15.
 *
 * @type number
 * @name pv.Layout.Tree.prototype.breadth
 */

/**
 * The offset between parent and child nodes; defaults to 60.
 *
 * @type number
 * @name pv.Layout.Tree.prototype.depth
 */

/**
 * The orientation. The default orientation is "top", which means that the root
 * node is placed on the top edge, leaf nodes appear at the bottom, and internal
 * nodes are in-between. The following orientations are supported:<ul>
 *
 * <li>left - left-to-right.
 * <li>right - right-to-left.
 * <li>top - top-to-bottom.
 * <li>bottom - bottom-to-top.
 * <li>radial - radially, with the root at the center.</ul>
 *
 * @type string
 * @name pv.Layout.Tree.prototype.orient
 */

/**
 * The sibling grouping, i.e., whether differentiating space is placed between
 * sibling groups. The default is 1 (or true), causing sibling leaves to be
 * separated by one breadth offset. Setting this to false (or 0) causes
 * non-siblings to be adjacent.
 *
 * @type number
 * @name pv.Layout.Tree.prototype.group
 */
/**
 * Constructs a new, empty indent layout. Layouts are not typically constructed
 * directly; instead, they are added to an existing panel via
 * {@link pv.Mark#add}.
 *
 * @class Implements a hierarchical layout using the indent algorithm. This
 * layout implements a node-link diagram where the nodes are presented in
 * preorder traversal, and nodes are indented based on their depth from the
 * root. This technique is used ubiquitously by operating systems to represent
 * file directories; although it requires much vertical space, indented trees
 * allow efficient <i>interactive</i> exploration of trees to find a specific
 * node. In addition they allow rapid scanning of node labels, and multivariate
 * data such as file sizes can be displayed adjacent to the hierarchy.
 *
 * <p>The indent layout can be configured using the <tt>depth</tt> and
 * <tt>breadth</tt> properties, which control the increments in pixel space for
 * each indent and row in the layout. This layout does not support multiple
 * orientations; the root node is rendered in the top-left, while
 * <tt>breadth</tt> is a vertical offset from the top, and <tt>depth</tt> is a
 * horizontal offset from the left.
 *
 * <p>For more details on how to use this layout, see
 * {@link pv.Layout.Hierarchy}.
 *
 * @extends pv.Layout.Hierarchy
 */
pv.Layout.Indent = function() {
  pv.Layout.Hierarchy.call(this);
  this.link.interpolate("step-after");
};

pv.Layout.Indent.prototype = pv.extend(pv.Layout.Hierarchy)
    .property("depth", Number)
    .property("breadth", Number);

/**
 * The horizontal offset between different levels of the tree; defaults to 15.
 *
 * @type number
 * @name pv.Layout.Indent.prototype.depth
 */

/**
 * The vertical offset between nodes; defaults to 15.
 *
 * @type number
 * @name pv.Layout.Indent.prototype.breadth
 */

/**
 * Default properties for indent layouts. By default the depth and breadth
 * offsets are 15 pixels.
 *
 * @type pv.Layout.Indent
 */
pv.Layout.Indent.prototype.defaults = new pv.Layout.Indent()
    .extend(pv.Layout.Hierarchy.prototype.defaults)
    .depth(15)
    .breadth(15);

/** @private */
pv.Layout.Indent.prototype.buildImplied = function(s) {
  if (pv.Layout.Hierarchy.prototype.buildImplied.call(this, s)) return;

  var nodes = s.nodes,
      bspace = s.breadth,
      dspace = s.depth,
      ax = 0,
      ay = 0;

  /** @private */
  function position(n, breadth, depth) {
    n.x = ax + depth++ * dspace;
    n.y = ay + breadth++ * bspace;
    n.midAngle = 0;
    for (var c = n.firstChild; c; c = c.nextSibling) {
      breadth = position(c, breadth, depth);
    }
    return breadth;
  }

  position(nodes[0], 1, 1);
};
/**
 * Constructs a new, empty circle-packing layout. Layouts are not typically
 * constructed directly; instead, they are added to an existing panel via
 * {@link pv.Mark#add}.
 *
 * @class Implements a hierarchical layout using circle-packing. The meaning of
 * the exported mark prototypes changes slightly in the space-filling
 * implementation:<ul>
 *
 * <li><tt>node</tt> - for rendering nodes; typically a {@link pv.Dot}.
 *
 * <p><li><tt>link</tt> - unsupported; undefined. Links are encoded implicitly
 * in the arrangement of the space-filling nodes.
 *
 * <p><li><tt>label</tt> - for rendering node labels; typically a
 * {@link pv.Label}.
 *
 * </ul>The pack layout support dynamic sizing for leaf nodes, if a
 * {@link #size} psuedo-property is specified. The default size function returns
 * 1, causing all leaf nodes to be sized equally, and all internal nodes to be
 * sized by the number of leaf nodes they have as descendants.
 *
 * <p>The size function can be used in conjunction with the order property,
 * which allows the nodes to the sorted by the computed size. Note: for sorting
 * based on other data attributes, simply use the default <tt>null</tt> for the
 * order property, and sort the nodes beforehand using the {@link pv.Dom}
 * operator.
 *
 * <p>For more details on how to use this layout, see
 * {@link pv.Layout.Hierarchy}.
 *
 * @extends pv.Layout.Hierarchy
 * @see <a href="http://portal.acm.org/citation.cfm?id=1124772.1124851"
 * >"Visualization of large hierarchical data by circle packing"</a> by W. Wang,
 * H. Wang, G. Dai, and H. Wang, ACM CHI 2006.
 */
pv.Layout.Pack = function() {
  pv.Layout.Hierarchy.call(this);

  this.node
      .shapeRadius(function(n) { return n.radius; })
      .strokeStyle("rgb(31, 119, 180)")
      .fillStyle("rgba(31, 119, 180, .25)");

  this.label
      .textAlign("center");

  /* Hide unsupported link. */
  delete this.link;
};

pv.Layout.Pack.prototype = pv.extend(pv.Layout.Hierarchy)
    .property("spacing", Number)
    .property("order", String); // ascending, descending, reverse, null

/**
 * Default properties for circle-packing layouts. The default spacing parameter
 * is 1 and the default order is "ascending".
 *
 * @type pv.Layout.Pack
 */
pv.Layout.Pack.prototype.defaults = new pv.Layout.Pack()
    .extend(pv.Layout.Hierarchy.prototype.defaults)
    .spacing(1)
    .order("ascending");

/**
 * The spacing parameter; defaults to 1, which provides a little bit of padding
 * between sibling nodes and the enclosing circle. Larger values increase the
 * spacing, by making the sibling nodes smaller; a value of zero makes the leaf
 * nodes as large as possible, with no padding on enclosing circles.
 *
 * @type number
 * @name pv.Layout.Pack.prototype.spacing
 */

/**
 * The sibling node order. The default order is <tt>null</tt>, which means to
 * use the sibling order specified by the nodes property as-is. A value of
 * "ascending" will sort siblings in ascending order of size, while "descending"
 * will do the reverse. For sorting based on data attributes other than size,
 * use the default <tt>null</tt> for the order property, and sort the nodes
 * beforehand using the {@link pv.Dom} operator.
 *
 * @see pv.Dom.Node#sort
 * @type string
 * @name pv.Layout.Pack.prototype.order
 */

/** @private The default size function. */
pv.Layout.Pack.prototype.$radius = function() { return 1; };

// TODO is it possible for spacing to operate in pixel space?
// Right now it appears to be multiples of the smallest radius.

/**
 * Specifies the sizing function. By default, a sizing function is disabled and
 * all nodes are given constant size. The sizing function is invoked for each
 * leaf node in the tree (passed to the constructor).
 *
 * <p>For example, if the tree data structure represents a file system, with
 * files as leaf nodes, and each file has a <tt>bytes</tt> attribute, you can
 * specify a size function as:
 *
 * <pre>    .size(function(d) d.bytes)</pre>
 *
 * As with other properties, a size function may specify additional arguments to
 * access the data associated with the layout and any enclosing panels.
 *
 * @param {function} f the new sizing function.
 * @returns {pv.Layout.Pack} this.
 */
pv.Layout.Pack.prototype.size = function(f) {
  this.$radius = typeof f == "function"
      ? function() { return Math.sqrt(f.apply(this, arguments)); }
      : (f = Math.sqrt(f), function() { return f; });
  return this;
};

/** @private */
pv.Layout.Pack.prototype.buildImplied = function(s) {
  if (pv.Layout.Hierarchy.prototype.buildImplied.call(this, s)) return;

  var that = this,
      nodes = s.nodes,
      root = nodes[0];

  /** @private Compute the radii of the leaf nodes. */
  function radii(nodes) {
    var stack = pv.Mark.stack;
    stack.unshift(null);
    for (var i = 0, n = nodes.length; i < n; i++) {
      var c = nodes[i];
      if (!c.firstChild) {
        c.radius = that.$radius.apply(that, (stack[0] = c, stack));
      }
    }
    stack.shift();
  }

  /** @private */
  function packTree(n) {
    var nodes = [];
    for (var c = n.firstChild; c; c = c.nextSibling) {
      if (c.firstChild) c.radius = packTree(c);
      c.n = c.p = c;
      nodes.push(c);
    }

    /* Sort. */
    switch (s.order) {
      case "ascending": {
        nodes.sort(function(a, b) { return a.radius - b.radius; });
        break;
      }
      case "descending": {
        nodes.sort(function(a, b) { return b.radius - a.radius; });
        break;
      }
      case "reverse": nodes.reverse(); break;
    }

    return packCircle(nodes);
  }

  /** @private */
  function packCircle(nodes) {
    var xMin = Infinity,
        xMax = -Infinity,
        yMin = Infinity,
        yMax = -Infinity,
        a, b, c, j, k;

    /** @private */
    function bound(n) {
      xMin = Math.min(n.x - n.radius, xMin);
      xMax = Math.max(n.x + n.radius, xMax);
      yMin = Math.min(n.y - n.radius, yMin);
      yMax = Math.max(n.y + n.radius, yMax);
    }

    /** @private */
    function insert(a, b) {
      var c = a.n;
      a.n = b;
      b.p = a;
      b.n = c;
      c.p = b;
    }

    /** @private */
    function splice(a, b) {
      a.n = b;
      b.p = a;
    }

    /** @private */
    function intersects(a, b) {
      var dx = b.x - a.x,
          dy = b.y - a.y,
          dr = a.radius + b.radius;
      return (dr * dr - dx * dx - dy * dy) > .001; // within epsilon
    }

    /* Create first node. */
    a = nodes[0];
    a.x = -a.radius;
    a.y = 0;
    bound(a);

    /* Create second node. */
    if (nodes.length > 1) {
      b = nodes[1];
      b.x = b.radius;
      b.y = 0;
      bound(b);

      /* Create third node and build chain. */
      if (nodes.length > 2) {
        c = nodes[2];
        place(a, b, c);
        bound(c);
        insert(a, c);
        a.p = c;
        insert(c, b);
        b = a.n;

        /* Now iterate through the rest. */
        for (var i = 3; i < nodes.length; i++) {
          place(a, b, c = nodes[i]);

          /* Search for the closest intersection. */
          var isect = 0, s1 = 1, s2 = 1;
          for (j = b.n; j != b; j = j.n, s1++) {
            if (intersects(j, c)) {
              isect = 1;
              break;
            }
          }
          if (isect == 1) {
            for (k = a.p; k != j.p; k = k.p, s2++) {
              if (intersects(k, c)) {
                if (s2 < s1) {
                  isect = -1;
                  j = k;
                }
                break;
              }
            }
          }

          /* Update node chain. */
          if (isect == 0) {
            insert(a, c);
            b = c;
            bound(c);
          } else if (isect > 0) {
            splice(a, j);
            b = j;
            i--;
          } else if (isect < 0) {
            splice(j, b);
            a = j;
            i--;
          }
        }
      }
    }

    /* Re-center the circles and return the encompassing radius. */
    var cx = (xMin + xMax) / 2,
        cy = (yMin + yMax) / 2,
        cr = 0;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x -= cx;
      n.y -= cy;
      cr = Math.max(cr, n.radius + Math.sqrt(n.x * n.x + n.y * n.y));
    }
    return cr + s.spacing;
  }

  /** @private */
  function place(a, b, c) {
    var da = b.radius + c.radius,
        db = a.radius + c.radius,
        dx = b.x - a.x,
        dy = b.y - a.y,
        dc = Math.sqrt(dx * dx + dy * dy),
        cos = (db * db + dc * dc - da * da) / (2 * db * dc),
        theta = Math.acos(cos),
        x = cos * db,
        h = Math.sin(theta) * db;
    dx /= dc;
    dy /= dc;
    c.x = a.x + x * dx + h * dy;
    c.y = a.y + x * dy - h * dx;
  }

  /** @private */
  function transform(n, x, y, k) {
    for (var c = n.firstChild; c; c = c.nextSibling) {
      c.x += n.x;
      c.y += n.y;
      transform(c, x, y, k);
    }
    n.x = x + k * n.x;
    n.y = y + k * n.y;
    n.radius *= k;
  }

  radii(nodes);

  /* Recursively compute the layout. */
  root.x = 0;
  root.y = 0;
  root.radius = packTree(root);

  var w = this.width(),
      h = this.height(),
      k = 1 / Math.max(2 * root.radius / w, 2 * root.radius / h);
  transform(root, w / 2, h / 2, k);
};
/**
 * Constructs a new, empty force-directed layout. Layouts are not typically
 * constructed directly; instead, they are added to an existing panel via
 * {@link pv.Mark#add}.
 *
 * @class Implements force-directed network layout as a node-link diagram. This
 * layout uses the Fruchterman-Reingold algorithm, which applies an attractive
 * spring force between neighboring nodes, and a repulsive electrical charge
 * force between all nodes. An additional drag force improves stability of the
 * simulation. See {@link pv.Force.spring}, {@link pv.Force.drag} and {@link
 * pv.Force.charge} for more details; note that the n-body charge force is
 * approximated using the Barnes-Hut algorithm.
 *
 * <p>This layout is implemented on top of {@link pv.Simulation}, which can be
 * used directly for more control over simulation parameters. The simulation
 * uses Position Verlet integration, which does not compute velocities
 * explicitly, but allows for easy geometric constraints, such as bounding the
 * nodes within the layout panel. Many of the configuration properties supported
 * by this layout are simply passed through to the underlying forces and
 * constraints of the simulation.
 *
 * <p>Force layouts are typically interactive. The gradual movement of the nodes
 * as they stabilize to a local stress minimum can help reveal the structure of
 * the network, as can {@link pv.Behavior.drag}, which allows the user to pick
 * up nodes and reposition them while the physics simulation continues. This
 * layout can also be used with pan &amp; zoom behaviors for interaction.
 *
 * <p>To facilitate interaction, this layout by default automatically re-renders
 * using a <tt>setInterval</tt> every 42 milliseconds. This can be disabled via
 * the <tt>iterations</tt> property, which if non-null specifies the number of
 * simulation iterations to run before the force-directed layout is finalized.
 * Be careful not to use too high an iteration count, as this can lead to an
 * annoying delay on page load.
 *
 * <p>As with other network layouts, the network data can be updated
 * dynamically, provided the property cache is reset. See
 * {@link pv.Layout.Network} for details. New nodes are initialized with random
 * positions near the center. Alternatively, positions can be specified manually
 * by setting the <tt>x</tt> and <tt>y</tt> attributes on nodes.
 *
 * @extends pv.Layout.Network
 * @see <a href="http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.13.8444&rep=rep1&type=pdf"
 * >"Graph Drawing by Force-directed Placement"</a> by T. Fruchterman &amp;
 * E. Reingold, Software--Practice &amp; Experience, November 1991.
 */
pv.Layout.Force = function() {
  pv.Layout.Network.call(this);

  /* Force-directed graphs can be messy, so reduce the link width. */
  this.link.lineWidth(function(d, p) { return Math.sqrt(p.linkValue) * 1.5; });
  this.label.textAlign("center");
};

pv.Layout.Force.prototype = pv.extend(pv.Layout.Network)
    .property("bound", Boolean)
    .property("iterations", Number)
    .property("dragConstant", Number)
    .property("chargeConstant", Number)
    .property("chargeMinDistance", Number)
    .property("chargeMaxDistance", Number)
    .property("chargeTheta", Number)
    .property("springConstant", Number)
    .property("springDamping", Number)
    .property("springLength", Number);

/**
 * The bound parameter; true if nodes should be constrained within the layout
 * panel. Bounding is disabled by default. Currently the layout does not observe
 * the radius of the nodes; strictly speaking, only the center of the node is
 * constrained to be within the panel, with an additional 6-pixel offset for
 * padding. A future enhancement could extend the bound constraint to observe
 * the node's radius, which would also support bounding for variable-size nodes.
 *
 * <p>Note that if this layout is used in conjunction with pan &amp; zoom
 * behaviors, those behaviors should have their bound parameter set to the same
 * value.
 *
 * @type boolean
 * @name pv.Layout.Force.prototype.bound
 */

/**
 * The number of simulation iterations to run, or null if this layout is
 * interactive. Force-directed layouts are interactive by default, using a
 * <tt>setInterval</tt> to advance the physics simulation and re-render
 * automatically.
 *
 * @type number
 * @name pv.Layout.Force.prototype.iterations
 */

/**
 * The drag constant, in the range [0,1]. A value of 0 means no drag (a
 * perfectly frictionless environment), while a value of 1 means friction
 * immediately cancels all momentum. The default value is 0.1, which provides a
 * minimum amount of drag that helps stabilize bouncy springs; lower values may
 * result in excessive bounciness, while higher values cause the simulation to
 * take longer to converge.
 *
 * @type number
 * @name pv.Layout.Force.prototype.dragConstant
 * @see pv.Force.drag#constant
 */

/**
 * The charge constant, which should be a negative number. The default value is
 * -40; more negative values will result in a stronger repulsive force, which
 * may lead to faster convergence at the risk of instability. Too strong
 * repulsive charge forces can cause comparatively weak springs to be stretched
 * well beyond their rest length, emphasizing global structure over local
 * structure. A nonnegative value will break the Fruchterman-Reingold algorithm,
 * and is for entertainment purposes only.
 *
 * @type number
 * @name pv.Layout.Force.prototype.chargeConstant
 * @see pv.Force.charge#constant
 */

/**
 * The minimum distance at which charge forces are applied. The default minimum
 * distance of 2 avoids applying forces that are two strong; because the physics
 * simulation is run at discrete time intervals, it is possible for two same-
 * charged particles to become very close or even a singularity! Since the
 * charge force is inversely proportional to the square of the distance, very
 * small distances can break the simulation.
 *
 * <p>In rare cases, two particles can become stuck on top of each other, as a
 * minimum distance threshold will prevent the charge force from repelling them.
 * However, this occurs very rarely because other forces and momentum typically
 * cause the particles to become separated again, at which point the repulsive
 * charge force kicks in.
 *
 * @type number
 * @name pv.Layout.Force.prototype.chargeMinDistance
 * @see pv.Force.charge#domain
 */

/**
 * The maximum distance at which charge forces are applied. This improves
 * performance by ignoring weak charge forces at great distances. Note that this
 * parameter is partly redundant, as the Barnes-Hut algorithm for n-body forces
 * already improves performance for far-away particles through approximation.
 *
 * @type number
 * @name pv.Layout.Force.prototype.chargeMaxDistance
 * @see pv.Force.charge#domain
 */

/**
 * The Barnes-Hut approximation factor. The Barnes-Hut approximation criterion
 * is the ratio of the size of the quadtree node to the distance from the point
 * to the node's center of mass is beneath some threshold. The default value is
 * 0.9.
 *
 * @type number
 * @name pv.Layout.Force.prototype.chargeTheta
 * @see pv.Force.charge#theta
 */

/**
 * The spring constant, which should be a positive number. The default value is
 * 0.1; greater values will result in a stronger attractive force, which may
 * lead to faster convergence at the risk of instability. Too strong spring
 * forces can cause comparatively weak charge forces to be ignored, emphasizing
 * local structure over global structure. A nonpositive value will break the
 * Fruchterman-Reingold algorithm, and is for entertainment purposes only.
 *
 * <p>The spring tension is automatically normalized using the inverse square
 * root of the maximum link degree of attached nodes.
 *
 * @type number
 * @name pv.Layout.Force.prototype.springConstant
 * @see pv.Force.spring#constant
 */

/**
 * The spring damping factor, in the range [0,1]. Damping functions identically
 * to drag forces, damping spring bounciness by applying a force in the opposite
 * direction of attached nodes' velocities. The default value is 0.3.
 *
 * <p>The spring damping is automatically normalized using the inverse square
 * root of the maximum link degree of attached nodes.
 *
 * @type number
 * @name pv.Layout.Force.prototype.springDamping
 * @see pv.Force.spring#damping
 */

/**
 * The spring rest length. The default value is 20 pixels. Larger values may be
 * appropriate if the layout panel is larger, or if the nodes are rendered
 * larger than the default dot size of 20.
 *
 * @type number
 * @name pv.Layout.Force.prototype.springLength
 * @see pv.Force.spring#length
 */

/**
 * Default properties for force-directed layouts. The default drag constant is
 * 0.1, the default charge constant is -40 (with a domain of [2, 500] and theta
 * of 0.9), and the default spring constant is 0.1 (with a damping of 0.3 and a
 * rest length of 20).
 *
 * @type pv.Layout.Force
 */
pv.Layout.Force.prototype.defaults = new pv.Layout.Force()
    .extend(pv.Layout.Network.prototype.defaults)
    .dragConstant(.1)
    .chargeConstant(-40)
    .chargeMinDistance(2)
    .chargeMaxDistance(500)
    .chargeTheta(.9)
    .springConstant(.1)
    .springDamping(.3)
    .springLength(20);

/** @private Initialize the physics simulation. */
pv.Layout.Force.prototype.buildImplied = function(s) {

  /* Any cached interactive layouts need to be rebound for the timer. */
  if (pv.Layout.Network.prototype.buildImplied.call(this, s)) {
    var f = s.$force;
    if (f) {
      f.next = this.binds.$force;
      this.binds.$force = f;
    }
    return;
  }

  var that = this,
      nodes = s.nodes,
      links = s.links,
      k = s.iterations,
      w = s.width,
      h = s.height;

  /* Initialize positions randomly near the center. */
  for (var i = 0, n; i < nodes.length; i++) {
    n = nodes[i];
    if (isNaN(n.x)) n.x = w / 2 + 40 * Math.random() - 20;
    if (isNaN(n.y)) n.y = h / 2 + 40 * Math.random() - 20;
  }

  /* Initialize the simulation. */
  var sim = pv.simulation(nodes);

  /* Drag force. */
  sim.force(pv.Force.drag(s.dragConstant));

  /* Charge (repelling) force. */
  sim.force(pv.Force.charge(s.chargeConstant)
      .domain(s.chargeMinDistance, s.chargeMaxDistance)
      .theta(s.chargeTheta));

  /* Spring (attracting) force. */
  sim.force(pv.Force.spring(s.springConstant)
      .damping(s.springDamping)
      .length(s.springLength)
      .links(links));

  /* Position constraint (for interactive dragging). */
  sim.constraint(pv.Constraint.position());

  /* Optionally add bound constraint. TODO: better padding. */
  if (s.bound) {
    sim.constraint(pv.Constraint.bound().x(6, w - 6).y(6, h - 6));
  }

  /** @private Returns the speed of the given node, to determine cooling. */
  function speed(n) {
    return n.fix ? 1 : n.vx * n.vx + n.vy * n.vy;
  }

  /*
   * If the iterations property is null (the default), the layout is
   * interactive. The simulation is run until the fastest particle drops below
   * an arbitrary minimum speed. Although the timer keeps firing, this speed
   * calculation is fast so there is minimal CPU overhead. Note: if a particle
   * is fixed for interactivity, treat this as a high speed and resume
   * simulation.
   */
  if (k == null) {
    sim.step(); // compute initial previous velocities
    sim.step(); // compute initial velocities

    /* Add the simulation state to the bound list. */
    var force = s.$force = this.binds.$force = {
      next: this.binds.$force,
      nodes: nodes,
      min: 1e-4 * (links.length + 1),
      sim: sim
    };

    /* Start the timer, if not already started. */
    if (!this.$timer) this.$timer = setInterval(function() {
      var render = false;
      for (var f = that.binds.$force; f; f = f.next) {
        if (pv.max(f.nodes, speed) > f.min) {
          f.sim.step();
          render = true;
        }
      }
      if (render) that.render();
    }, 42);
  } else for (var i = 0; i < k; i++) {
    sim.step();
  }
};
/**
 * Constructs a new, empty cluster layout. Layouts are not typically
 * constructed directly; instead, they are added to an existing panel via
 * {@link pv.Mark#add}.
 *
 * @class Implements a hierarchical layout using the cluster (or dendrogram)
 * algorithm. This layout provides both node-link and space-filling
 * implementations of cluster diagrams. In many ways it is similar to
 * {@link pv.Layout.Partition}, except that leaf nodes are positioned at maximum
 * depth, and the depth of internal nodes is based on their distance from their
 * deepest descendant, rather than their distance from the root.
 *
 * <p>The cluster layout supports a "group" property, which if true causes
 * siblings to be positioned closer together than unrelated nodes at the same
 * depth. Unlike the partition layout, this layout does not support dynamic
 * sizing for leaf nodes; all leaf nodes are the same size.
 *
 * <p>For more details on how to use this layout, see
 * {@link pv.Layout.Hierarchy}.
 *
 * @see pv.Layout.Cluster.Fill
 * @extends pv.Layout.Hierarchy
 */
pv.Layout.Cluster = function() {
  pv.Layout.Hierarchy.call(this);
  var interpolate, // cached interpolate
      buildImplied = this.buildImplied;

  /** @private Cache layout state to optimize properties. */
  this.buildImplied = function(s) {
    buildImplied.call(this, s);
    interpolate
        = /^(top|bottom)$/.test(s.orient) ? "step-before"
        : /^(left|right)$/.test(s.orient) ? "step-after"
        : "linear";
  };

  this.link.interpolate(function() { return interpolate; });
};

pv.Layout.Cluster.prototype = pv.extend(pv.Layout.Hierarchy)
    .property("group", Number)
    .property("orient", String)
    .property("innerRadius", Number)
    .property("outerRadius", Number);

/**
 * The group parameter; defaults to 0, disabling grouping of siblings. If this
 * parameter is set to a positive number (or true, which is equivalent to 1),
 * then additional space will be allotted between sibling groups. In other
 * words, siblings (nodes that share the same parent) will be positioned more
 * closely than nodes at the same depth that do not share a parent.
 *
 * @type number
 * @name pv.Layout.Cluster.prototype.group
 */

/**
 * The orientation. The default orientation is "top", which means that the root
 * node is placed on the top edge, leaf nodes appear on the bottom edge, and
 * internal nodes are in-between. The following orientations are supported:<ul>
 *
 * <li>left - left-to-right.
 * <li>right - right-to-left.
 * <li>top - top-to-bottom.
 * <li>bottom - bottom-to-top.
 * <li>radial - radially, with the root at the center.</ul>
 *
 * @type string
 * @name pv.Layout.Cluster.prototype.orient
 */

/**
 * The inner radius; defaults to 0. This property applies only to radial
 * orientations, and can be used to compress the layout radially. Note that for
 * the node-link implementation, the root node is always at the center,
 * regardless of the value of this property; this property only affects internal
 * and leaf nodes. For the space-filling implementation, a non-zero value of
 * this property will result in the root node represented as a ring rather than
 * a circle.
 *
 * @type number
 * @name pv.Layout.Cluster.prototype.innerRadius
 */

/**
 * The outer radius; defaults to fill the containing panel, based on the height
 * and width of the layout. If the layout has no height and width specified, it
 * will extend to fill the enclosing panel.
 *
 * @type number
 * @name pv.Layout.Cluster.prototype.outerRadius
 */

/**
 * Defaults for cluster layouts. The default group parameter is 0 and the
 * default orientation is "top".
 *
 * @type pv.Layout.Cluster
 */
pv.Layout.Cluster.prototype.defaults = new pv.Layout.Cluster()
    .extend(pv.Layout.Hierarchy.prototype.defaults)
    .group(0)
    .orient("top");

/** @private */
pv.Layout.Cluster.prototype.buildImplied = function(s) {
  if (pv.Layout.Hierarchy.prototype.buildImplied.call(this, s)) return;

  var root = s.nodes[0],
      group = s.group,
      breadth,
      depth,
      leafCount = 0,
      leafIndex = .5 - group / 2;

  /* Count the leaf nodes and compute the depth of descendants. */
  var p = undefined;
  root.visitAfter(function(n) {
      if (n.firstChild) {
        n.depth = 1 + pv.max(n.childNodes, function(n) { return n.depth; });
      } else {
        if (group && (p != n.parentNode)) {
          p = n.parentNode;
          leafCount += group;
        }
        leafCount++;
        n.depth = 0;
      }
    });
  breadth = 1 / leafCount;
  depth = 1 / root.depth;

  /* Compute the unit breadth and depth of each node. */
  var p = undefined;
  root.visitAfter(function(n) {
      if (n.firstChild) {
        n.breadth = pv.mean(n.childNodes, function(n) { return n.breadth; });
      } else {
        if (group && (p != n.parentNode)) {
          p = n.parentNode;
          leafIndex += group;
        }
        n.breadth = breadth * leafIndex++;
      }
      n.depth = 1 - n.depth * depth;
    });

  /* Compute breadth and depth ranges for space-filling layouts. */
  root.visitAfter(function(n) {
      n.minBreadth = n.firstChild
          ? n.firstChild.minBreadth
          : (n.breadth - breadth / 2);
      n.maxBreadth = n.firstChild
          ? n.lastChild.maxBreadth
          : (n.breadth + breadth / 2);
    });
  root.visitBefore(function(n) {
      n.minDepth = n.parentNode
          ? n.parentNode.maxDepth
          : 0;
      n.maxDepth = n.parentNode
          ? (n.depth + root.depth)
          : (n.minDepth + 2 * root.depth);
    });
  root.minDepth = -depth;

  pv.Layout.Hierarchy.NodeLink.buildImplied.call(this, s);
};

/**
 * Constructs a new, empty space-filling cluster layout. Layouts are not
 * typically constructed directly; instead, they are added to an existing panel
 * via {@link pv.Mark#add}.
 *
 * @class A variant of cluster layout that is space-filling. The meaning of the
 * exported mark prototypes changes slightly in the space-filling
 * implementation:<ul>
 *
 * <li><tt>node</tt> - for rendering nodes; typically a {@link pv.Bar} for
 * non-radial orientations, and a {@link pv.Wedge} for radial orientations.
 *
 * <p><li><tt>link</tt> - unsupported; undefined. Links are encoded implicitly
 * in the arrangement of the space-filling nodes.
 *
 * <p><li><tt>label</tt> - for rendering node labels; typically a
 * {@link pv.Label}.
 *
 * </ul>For more details on how to use this layout, see
 * {@link pv.Layout.Cluster}.
 *
 * @extends pv.Layout.Cluster
 */
pv.Layout.Cluster.Fill = function() {
  pv.Layout.Cluster.call(this);
  pv.Layout.Hierarchy.Fill.constructor.call(this);
};

pv.Layout.Cluster.Fill.prototype = pv.extend(pv.Layout.Cluster);

/** @private */
pv.Layout.Cluster.Fill.prototype.buildImplied = function(s) {
  if (pv.Layout.Cluster.prototype.buildImplied.call(this, s)) return;
  pv.Layout.Hierarchy.Fill.buildImplied.call(this, s);
};
/**
 * Constructs a new, empty partition layout. Layouts are not typically
 * constructed directly; instead, they are added to an existing panel via
 * {@link pv.Mark#add}.
 *
 * @class Implements a hierarchical layout using the partition (or sunburst,
 * icicle) algorithm. This layout provides both node-link and space-filling
 * implementations of partition diagrams. In many ways it is similar to
 * {@link pv.Layout.Cluster}, except that leaf nodes are positioned based on
 * their distance from the root.
 *
 * <p>The partition layout support dynamic sizing for leaf nodes, if a
 * {@link #size} psuedo-property is specified. The default size function returns
 * 1, causing all leaf nodes to be sized equally, and all internal nodes to be
 * sized by the number of leaf nodes they have as descendants.
 *
 * <p>The size function can be used in conjunction with the order property,
 * which allows the nodes to the sorted by the computed size. Note: for sorting
 * based on other data attributes, simply use the default <tt>null</tt> for the
 * order property, and sort the nodes beforehand using the {@link pv.Dom}
 * operator.
 *
 * <p>For more details on how to use this layout, see
 * {@link pv.Layout.Hierarchy}.
 *
 * @see pv.Layout.Partition.Fill
 * @extends pv.Layout.Hierarchy
 */
pv.Layout.Partition = function() {
  pv.Layout.Hierarchy.call(this);
};

pv.Layout.Partition.prototype = pv.extend(pv.Layout.Hierarchy)
    .property("order", String) // null, ascending, descending?
    .property("orient", String) // top, left, right, bottom, radial
    .property("innerRadius", Number)
    .property("outerRadius", Number);

/**
 * The sibling node order. The default order is <tt>null</tt>, which means to
 * use the sibling order specified by the nodes property as-is. A value of
 * "ascending" will sort siblings in ascending order of size, while "descending"
 * will do the reverse. For sorting based on data attributes other than size,
 * use the default <tt>null</tt> for the order property, and sort the nodes
 * beforehand using the {@link pv.Dom} operator.
 *
 * @see pv.Dom.Node#sort
 * @type string
 * @name pv.Layout.Partition.prototype.order
 */

/**
 * The orientation. The default orientation is "top", which means that the root
 * node is placed on the top edge, leaf nodes appear at the bottom, and internal
 * nodes are in-between. The following orientations are supported:<ul>
 *
 * <li>left - left-to-right.
 * <li>right - right-to-left.
 * <li>top - top-to-bottom.
 * <li>bottom - bottom-to-top.
 * <li>radial - radially, with the root at the center.</ul>
 *
 * @type string
 * @name pv.Layout.Partition.prototype.orient
 */

/**
 * The inner radius; defaults to 0. This property applies only to radial
 * orientations, and can be used to compress the layout radially. Note that for
 * the node-link implementation, the root node is always at the center,
 * regardless of the value of this property; this property only affects internal
 * and leaf nodes. For the space-filling implementation, a non-zero value of
 * this property will result in the root node represented as a ring rather than
 * a circle.
 *
 * @type number
 * @name pv.Layout.Partition.prototype.innerRadius
 */

/**
 * The outer radius; defaults to fill the containing panel, based on the height
 * and width of the layout. If the layout has no height and width specified, it
 * will extend to fill the enclosing panel.
 *
 * @type number
 * @name pv.Layout.Partition.prototype.outerRadius
 */

/**
 * Default properties for partition layouts. The default orientation is "top".
 *
 * @type pv.Layout.Partition
 */
pv.Layout.Partition.prototype.defaults = new pv.Layout.Partition()
    .extend(pv.Layout.Hierarchy.prototype.defaults)
    .orient("top");

/** @private */
pv.Layout.Partition.prototype.$size = function() { return 1; };

/**
 * Specifies the sizing function. By default, a sizing function is disabled and
 * all nodes are given constant size. The sizing function is invoked for each
 * leaf node in the tree (passed to the constructor).
 *
 * <p>For example, if the tree data structure represents a file system, with
 * files as leaf nodes, and each file has a <tt>bytes</tt> attribute, you can
 * specify a size function as:
 *
 * <pre>    .size(function(d) d.bytes)</pre>
 *
 * As with other properties, a size function may specify additional arguments to
 * access the data associated with the layout and any enclosing panels.
 *
 * @param {function} f the new sizing function.
 * @returns {pv.Layout.Partition} this.
 */
pv.Layout.Partition.prototype.size = function(f) {
  this.$size = f;
  return this;
};

/** @private */
pv.Layout.Partition.prototype.buildImplied = function(s) {
  if (pv.Layout.Hierarchy.prototype.buildImplied.call(this, s)) return;

  var that = this,
      root = s.nodes[0],
      stack = pv.Mark.stack,
      maxDepth = 0;

  /* Recursively compute the tree depth and node size. */
  stack.unshift(null);
  root.visitAfter(function(n, depth) {
      if (depth > maxDepth) maxDepth = depth;
      n.size = n.firstChild
          ? pv.sum(n.childNodes, function(n) { return n.size; })
          : that.$size.apply(that, (stack[0] = n, stack));
    });
  stack.shift();

  /* Order */
  switch (s.order) {
    case "ascending":  root.sort(function(a, b) { return a.size - b.size; }); break;
    case "descending": root.sort(function(b, a) { return a.size - b.size; }); break;
  }

  /* Compute the unit breadth and depth of each node. */
  root.minBreadth = 0;
  root.breadth    = .5;
  root.maxBreadth = 1;
  
  root.visitBefore(function(n) {
    var b = n.minBreadth, 
        s = n.maxBreadth - b; // span
      
      for (var c = n.firstChild; c; c = c.nextSibling) {
        c.minBreadth = b;
        b += (c.size / n.size) * s;
        c.maxBreadth = b;
        
        c.breadth = (b + c.minBreadth) / 2;
      }
    });
  
  root.visitAfter(function(n, depth) {
      n.minDepth = (depth - 1) / maxDepth;
      n.maxDepth = (n.depth = depth / maxDepth);
    });

  pv.Layout.Hierarchy.NodeLink.buildImplied.call(this, s);
};

/**
 * Constructs a new, empty space-filling partition layout. Layouts are not
 * typically constructed directly; instead, they are added to an existing panel
 * via {@link pv.Mark#add}.
 *
 * @class A variant of partition layout that is space-filling. The meaning of
 * the exported mark prototypes changes slightly in the space-filling
 * implementation:<ul>
 *
 * <li><tt>node</tt> - for rendering nodes; typically a {@link pv.Bar} for
 * non-radial orientations, and a {@link pv.Wedge} for radial orientations.
 *
 * <p><li><tt>link</tt> - unsupported; undefined. Links are encoded implicitly
 * in the arrangement of the space-filling nodes.
 *
 * <p><li><tt>label</tt> - for rendering node labels; typically a
 * {@link pv.Label}.
 *
 * </ul>For more details on how to use this layout, see
 * {@link pv.Layout.Partition}.
 *
 * @extends pv.Layout.Partition
 */
pv.Layout.Partition.Fill = function() {
  pv.Layout.Partition.call(this);
  pv.Layout.Hierarchy.Fill.constructor.call(this);
};

pv.Layout.Partition.Fill.prototype = pv.extend(pv.Layout.Partition);

/** @private */
pv.Layout.Partition.Fill.prototype.buildImplied = function(s) {
  if (pv.Layout.Partition.prototype.buildImplied.call(this, s)) return;
  pv.Layout.Hierarchy.Fill.buildImplied.call(this, s);
};
/**
 * Constructs a new, empty arc layout. Layouts are not typically constructed
 * directly; instead, they are added to an existing panel via
 * {@link pv.Mark#add}.
 *
 * @class Implements a layout for arc diagrams. An arc diagram is a network
 * visualization with a one-dimensional layout of nodes, using circular arcs to
 * render links between nodes. For undirected networks, arcs are rendering on a
 * single side; this makes arc diagrams useful as annotations to other
 * two-dimensional network layouts, such as rollup, matrix or table layouts. For
 * directed networks, links in opposite directions can be rendered on opposite
 * sides using <tt>directed(true)</tt>.
 *
 * <p>Arc layouts are particularly sensitive to node ordering; for best results,
 * order the nodes such that related nodes are close to each other. A poor
 * (e.g., random) order may result in large arcs with crossovers that impede
 * visual processing. A future improvement to this layout may include automatic
 * reordering using, e.g., spectral graph layout or simulated annealing.
 *
 * <p>This visualization technique is related to that developed by
 * M. Wattenberg, <a
 * href="http://www.research.ibm.com/visual/papers/arc-diagrams.pdf">"Arc
 * Diagrams: Visualizing Structure in Strings"</a> in <i>IEEE InfoVis</i>, 2002.
 * However, this implementation is limited to simple node-link networks, as
 * opposed to structures with hierarchical self-similarity (such as strings).
 *
 * <p>As with other network layouts, three mark prototypes are provided:<ul>
 *
 * <li><tt>node</tt> - for rendering nodes; typically a {@link pv.Dot}.
 * <li><tt>link</tt> - for rendering links; typically a {@link pv.Line}.
 * <li><tt>label</tt> - for rendering node labels; typically a {@link pv.Label}.
 *
 * </ul>For more details on how this layout is structured and can be customized,
 * see {@link pv.Layout.Network}.
 *
 * @extends pv.Layout.Network
 **/
pv.Layout.Arc = function() {
  pv.Layout.Network.call(this);
  var interpolate, // cached interpolate
      directed, // cached directed
      reverse, // cached reverse
      buildImplied = this.buildImplied;

  /** @private Cache layout state to optimize properties. */
  this.buildImplied = function(s) {
    buildImplied.call(this, s);
    directed = s.directed;
    interpolate = s.orient == "radial" ? "linear" : "polar";
    reverse = s.orient == "right" || s.orient == "top";
  };

  /* Override link properties to handle directedness and orientation. */
  this.link
      .data(function(p) {
          var s = p.sourceNode, t = p.targetNode;
          return reverse != (directed || (s.breadth < t.breadth)) ? [s, t] : [t, s];
        })
      .interpolate(function() { return interpolate; });
};

pv.Layout.Arc.prototype = pv.extend(pv.Layout.Network)
    .property("orient", String)
    .property("directed", Boolean);

/**
 * Default properties for arc layouts. By default, the orientation is "bottom".
 *
 * @type pv.Layout.Arc
 */
pv.Layout.Arc.prototype.defaults = new pv.Layout.Arc()
    .extend(pv.Layout.Network.prototype.defaults)
    .orient("bottom");

/**
 * Specifies an optional sort function. The sort function follows the same
 * comparator contract required by {@link pv.Dom.Node#sort}. Specifying a sort
 * function provides an alternative to sort the nodes as they are specified by
 * the <tt>nodes</tt> property; the main advantage of doing this is that the
 * comparator function can access implicit fields populated by the network
 * layout, such as the <tt>linkDegree</tt>.
 *
 * <p>Note that arc diagrams are particularly sensitive to order. This is
 * referred to as the seriation problem, and many different techniques exist to
 * find good node orders that emphasize clusters, such as spectral layout and
 * simulated annealing.
 *
 * @param {function} f comparator function for nodes.
 * @returns {pv.Layout.Arc} this.
 */
pv.Layout.Arc.prototype.sort = function(f) {
  this.$sort = f;
  return this;
};

/** @private Populates the x, y and angle attributes on the nodes. */
pv.Layout.Arc.prototype.buildImplied = function(s) {
  if (pv.Layout.Network.prototype.buildImplied.call(this, s)) return;

  var nodes = s.nodes,
      orient = s.orient,
      sort = this.$sort,
      index = pv.range(nodes.length),
      w = s.width,
      h = s.height,
      r = Math.min(w, h) / 2;

  /* Sort the nodes. */
  if (sort) index.sort(function(a, b) { return sort(nodes[a], nodes[b]); });

  /** @private Returns the mid-angle, given the breadth. */
  function midAngle(b) {
    switch (orient) {
      case "top": return -Math.PI / 2;
      case "bottom": return Math.PI / 2;
      case "left": return Math.PI;
      case "right": return 0;
      case "radial": return (b - .25) * 2 * Math.PI;
    }
  }

  /** @private Returns the x-position, given the breadth. */
  function x(b) {
    switch (orient) {
      case "top":
      case "bottom": return b * w;
      case "left": return 0;
      case "right": return w;
      case "radial": return w / 2 + r * Math.cos(midAngle(b));
    }
  }

  /** @private Returns the y-position, given the breadth. */
  function y(b) {
    switch (orient) {
      case "top": return 0;
      case "bottom": return h;
      case "left":
      case "right": return b * h;
      case "radial": return h / 2 + r * Math.sin(midAngle(b));
    }
  }

  /* Populate the x, y and mid-angle attributes. */
  for (var i = 0; i < nodes.length; i++) {
    var n = nodes[index[i]], b = n.breadth = (i + .5) / nodes.length;
    n.x = x(b);
    n.y = y(b);
    n.midAngle = midAngle(b);
  }
};

/**
 * The orientation. The default orientation is "left", which means that nodes
 * will be positioned from left-to-right in the order they are specified in the
 * <tt>nodes</tt> property. The following orientations are supported:<ul>
 *
 * <li>left - left-to-right.
 * <li>right - right-to-left.
 * <li>top - top-to-bottom.
 * <li>bottom - bottom-to-top.
 * <li>radial - radially, starting at 12 o'clock and proceeding clockwise.</ul>
 *
 * @type string
 * @name pv.Layout.Arc.prototype.orient
 */

/**
 * Whether this arc digram is directed (bidirectional); only applies to
 * non-radial orientations. By default, arc digrams are undirected, such that
 * all arcs appear on one side. If the arc digram is directed, then forward
 * links are drawn on the conventional side (the same as as undirected
 * links--right, left, bottom and top for left, right, top and bottom,
 * respectively), while reverse links are drawn on the opposite side.
 *
 * @type boolean
 * @name pv.Layout.Arc.prototype.directed
 */
/**
 * Constructs a new, empty horizon layout. Layouts are not typically constructed
 * directly; instead, they are added to an existing panel via
 * {@link pv.Mark#add}.
 *
 * @class Implements a horizon layout, which is a variation of a single-series
 * area chart where the area is folded into multiple bands. Color is used to
 * encode band, allowing the size of the chart to be reduced significantly
 * without impeding readability. This layout algorithm is based on the work of
 * J. Heer, N. Kong and M. Agrawala in <a
 * href="http://hci.stanford.edu/publications/2009/heer-horizon-chi09.pdf">"Sizing
 * the Horizon: The Effects of Chart Size and Layering on the Graphical
 * Perception of Time Series Visualizations"</a>, CHI 2009.
 *
 * <p>This layout exports a single <tt>band</tt> mark prototype, which is
 * intended to be used with an area mark. The band mark is contained in a panel
 * which is replicated per band (and for negative/positive bands). For example,
 * to create a simple horizon graph given an array of numbers:
 *
 * <pre>vis.add(pv.Layout.Horizon)
 *     .bands(n)
 *   .band.add(pv.Area)
 *     .data(data)
 *     .left(function() this.index * 35)
 *     .height(function(d) d * 40);</pre>
 *
 * The layout can be further customized by changing the number of bands, and
 * toggling whether the negative bands are mirrored or offset. (See the
 * above-referenced paper for guidance.)
 *
 * <p>The <tt>fillStyle</tt> of the area can be overridden, though typically it
 * is easier to customize the layout's behavior through the custom
 * <tt>backgroundStyle</tt>, <tt>positiveStyle</tt> and <tt>negativeStyle</tt>
 * properties. By default, the background is white, positive bands are blue, and
 * negative bands are red. For the most accurate presentation, use fully-opaque
 * colors of equal intensity for the negative and positive bands.
 *
 * @extends pv.Layout
 */
pv.Layout.Horizon = function() {
  pv.Layout.call(this);
  var that = this,
      bands, // cached bands
      mode, // cached mode
      size, // cached height
      fill, // cached background style
      red, // cached negative color (ramp)
      blue, // cached positive color (ramp)
      buildImplied = this.buildImplied;

  /** @private Cache the layout state to optimize properties. */
  this.buildImplied = function(s) {
    buildImplied.call(this, s);
    bands = s.bands;
    mode = s.mode;
    size = Math.round((mode == "color" ? .5 : 1) * s.height);
    fill = s.backgroundStyle;
    red = pv.ramp(fill, s.negativeStyle).domain(0, bands);
    blue = pv.ramp(fill, s.positiveStyle).domain(0, bands);
  };

  var bands = new pv.Panel()
      .data(function() { return pv.range(bands * 2); })
      .overflow("hidden")
      .height(function() { return size; })
      .top(function(i) { return mode == "color" ? (i & 1) * size : 0; })
      .fillStyle(function(i) { return i ? null : fill; });

  /**
   * The band prototype. This prototype is intended to be used with an Area
   * mark to render the horizon bands.
   *
   * @type pv.Mark
   * @name pv.Layout.Horizon.prototype.band
   */
  this.band = new pv.Mark()
      .top(function(d, i) {
          return mode == "mirror" && i & 1
              ? (i + 1 >> 1) * size
              : null;
        })
      .bottom(function(d, i) {
          return mode == "mirror"
              ? (i & 1 ? null : (i + 1 >> 1) * -size)
              : ((i & 1 || -1) * (i + 1 >> 1) * size);
        })
      .fillStyle(function(d, i) {
          return (i & 1 ? red : blue)((i >> 1) + 1);
        });

  this.band.add = function(type) {
    return that.add(pv.Panel).extend(bands).add(type).extend(this);
  };
};

pv.Layout.Horizon.prototype = pv.extend(pv.Layout)
    .property("bands", Number)
    .property("mode", String)
    .property("backgroundStyle", pv.fillStyle)
    .property("positiveStyle", pv.fillStyle)
    .property("negativeStyle", pv.fillStyle);

/**
 * Default properties for horizon layouts. By default, there are two bands, the
 * mode is "offset", the background style is "white", the positive style is
 * blue, negative style is red.
 *
 * @type pv.Layout.Horizon
 */
pv.Layout.Horizon.prototype.defaults = new pv.Layout.Horizon()
    .extend(pv.Layout.prototype.defaults)
    .bands(2)
    .mode("offset")
    .backgroundStyle("white")
    .positiveStyle("#1f77b4")
    .negativeStyle("#d62728");

/**
 * The horizon mode: offset, mirror, or color. The default is "offset".
 *
 * @type string
 * @name pv.Layout.Horizon.prototype.mode
 */

/**
 * The number of bands. Must be at least one. The default value is two.
 *
 * @type number
 * @name pv.Layout.Horizon.prototype.bands
 */

/**
 * The positive band color; if non-null, the interior of positive bands are
 * filled with the specified color. The default value of this property is blue.
 * For accurate blending, this color should be fully opaque.
 *
 * @type pv.Color
 * @name pv.Layout.Horizon.prototype.positiveStyle
 */

/**
 * The negative band color; if non-null, the interior of negative bands are
 * filled with the specified color. The default value of this property is red.
 * For accurate blending, this color should be fully opaque.
 *
 * @type pv.Color
 * @name pv.Layout.Horizon.prototype.negativeStyle
 */

/**
 * The background color. The panel background is filled with the specified
 * color, and the negative and positive bands are filled with an interpolated
 * color between this color and the respective band color. The default value of
 * this property is white. For accurate blending, this color should be fully
 * opaque.
 *
 * @type pv.Color
 * @name pv.Layout.Horizon.prototype.backgroundStyle
 */
/**
 * Constructs a new, empty rollup network layout. Layouts are not typically
 * constructed directly; instead, they are added to an existing panel via
 * {@link pv.Mark#add}.
 *
 * @class Implements a network visualization using a node-link diagram where
 * nodes are rolled up along two dimensions. This implementation is based on the
 * "PivotGraph" designed by Martin Wattenberg:
 *
 * <blockquote>The method is designed for graphs that are "multivariate", i.e.,
 * where each node is associated with several attributes. Unlike visualizations
 * which emphasize global graph topology, PivotGraph uses a simple grid-based
 * approach to focus on the relationship between node attributes &amp;
 * connections.</blockquote>
 *
 * This layout requires two psuedo-properties to be specified, which assign node
 * positions along the two dimensions {@link #x} and {@link #y}, corresponding
 * to the left and top properties, respectively. Typically, these functions are
 * specified using an {@link pv.Scale.ordinal}. Nodes that share the same
 * position in <i>x</i> and <i>y</i> are "rolled up" into a meta-node, and
 * similarly links are aggregated between meta-nodes. For example, to construct
 * a rollup to analyze links by gender and affiliation, first define two ordinal
 * scales:
 *
 * <pre>var x = pv.Scale.ordinal(nodes, function(d) d.gender).split(0, w),
 *     y = pv.Scale.ordinal(nodes, function(d) d.aff).split(0, h);</pre>
 *
 * Next, define the position psuedo-properties:
 *
 * <pre>    .x(function(d) x(d.gender))
 *     .y(function(d) y(d.aff))</pre>
 *
 * Linear and other quantitative scales can alternatively be used to position
 * the nodes along either dimension. Note, however, that the rollup requires
 * that the positions match exactly, and thus ordinal scales are recommended to
 * avoid precision errors.
 *
 * <p>Note that because this layout provides a visualization of the rolled up
 * graph, the data properties for the mark prototypes (<tt>node</tt>,
 * <tt>link</tt> and <tt>label</tt>) are different from most other network
 * layouts: they reference the rolled-up nodes and links, rather than the nodes
 * and links of the full network. The underlying nodes and links for each
 * rolled-up node and link can be accessed via the <tt>nodes</tt> and
 * <tt>links</tt> attributes, respectively. The aggregated link values for
 * rolled-up links can similarly be accessed via the <tt>linkValue</tt>
 * attribute.
 *
 * <p>For undirected networks, links are duplicated in both directions. For
 * directed networks, use <tt>directed(true)</tt>. The graph is assumed to be
 * undirected by default.
 *
 * @extends pv.Layout.Network
 * @see <a href="http://www.research.ibm.com/visual/papers/pivotgraph.pdf"
 * >"Visual Exploration of Multivariate Graphs"</a> by M. Wattenberg, CHI 2006.
 */
pv.Layout.Rollup = function() {
  pv.Layout.Network.call(this);
  var that = this,
      nodes, // cached rollup nodes
      links, // cached rollup links
      buildImplied = that.buildImplied;

  /** @private Cache layout state to optimize properties. */
  this.buildImplied = function(s) {
    buildImplied.call(this, s);
    nodes = s.$rollup.nodes;
    links = s.$rollup.links;
  };

  /* Render rollup nodes. */
  this.node
      .data(function() { return nodes; })
      .shapeSize(function(d) { return d.nodes.length * 20; });

  /* Render rollup links. */
  this.link
      .interpolate("polar")
      .eccentricity(.8);

  this.link.add = function(type) {
    return that.add(pv.Panel)
        .data(function() { return links; })
      .add(type)
        .extend(this);
  };
};

pv.Layout.Rollup.prototype = pv.extend(pv.Layout.Network)
    .property("directed", Boolean);

/**
 * Whether the underlying network is directed. By default, the graph is assumed
 * to be undirected, and links are rendered in both directions. If the network
 * is directed, then forward links are drawn above the diagonal, while reverse
 * links are drawn below.
 *
 * @type boolean
 * @name pv.Layout.Rollup.prototype.directed
 */

/**
 * Specifies the <i>x</i>-position function used to rollup nodes. The rolled up
 * nodes are positioned horizontally using the return values from the given
 * function. Typically the function is specified as an ordinal scale. For
 * single-dimension rollups, a constant value can be specified.
 *
 * @param {function} f the <i>x</i>-position function.
 * @returns {pv.Layout.Rollup} this.
 * @see pv.Scale.ordinal
 */
pv.Layout.Rollup.prototype.x = function(f) {
  this.$x = pv.functor(f);
  return this;
};

/**
 * Specifies the <i>y</i>-position function used to rollup nodes. The rolled up
 * nodes are positioned vertically using the return values from the given
 * function. Typically the function is specified as an ordinal scale. For
 * single-dimension rollups, a constant value can be specified.
 *
 * @param {function} f the <i>y</i>-position function.
 * @returns {pv.Layout.Rollup} this.
 * @see pv.Scale.ordinal
 */
pv.Layout.Rollup.prototype.y = function(f) {
  this.$y = pv.functor(f);
  return this;
};

/** @private */
pv.Layout.Rollup.prototype.buildImplied = function(s) {
  if (pv.Layout.Network.prototype.buildImplied.call(this, s)) return;

  var nodes = s.nodes,
      links = s.links,
      directed = s.directed,
      n = nodes.length,
      x = [],
      y = [],
      rnindex = 0,
      rnodes = {},
      rlinks = {};

  /** @private */
  function id(i) {
    return x[i] + "," + y[i];
  }

  /* Iterate over the data, evaluating the x and y functions. */
  var stack = pv.Mark.stack, o = {parent: this};
  stack.unshift(null);
  for (var i = 0; i < n; i++) {
    o.index = i;
    stack[0] = nodes[i];
    x[i] = this.$x.apply(o, stack);
    y[i] = this.$y.apply(o, stack);
  }
  stack.shift();

  /* Compute rollup nodes. */
  for (var i = 0; i < nodes.length; i++) {
    var nodeId = id(i),
        rn = rnodes[nodeId];
    if (!rn) {
      rn = rnodes[nodeId] = pv.extend(nodes[i]);
      rn.index = rnindex++;
      rn.x = x[i];
      rn.y = y[i];
      rn.nodes = [];
    }
    rn.nodes.push(nodes[i]);
  }

  /* Compute rollup links. */
  for (var i = 0; i < links.length; i++) {
    var source = links[i].sourceNode,
        target = links[i].targetNode,
        rsource = rnodes[id(source.index)],
        rtarget = rnodes[id(target.index)],
        reverse = !directed && rsource.index > rtarget.index,
        linkId = reverse
            ? rtarget.index + "," + rsource.index
            : rsource.index + "," + rtarget.index,
        rl = rlinks[linkId];
    if (!rl) {
      rl = rlinks[linkId] = {
        sourceNode: rsource,
        targetNode: rtarget,
        linkValue: 0,
        links: []
      };
    }
    rl.links.push(links[i]);
    rl.linkValue += links[i].linkValue;
  }

  /* Export the rolled up nodes and links to the scene. */
  s.$rollup = {
    nodes: pv.values(rnodes),
    links: pv.values(rlinks)
  };
};
/**
 * Constructs a new, empty matrix network layout. Layouts are not typically
 * constructed directly; instead, they are added to an existing panel via
 * {@link pv.Mark#add}.
 *
 * @class Implements a network visualization using a matrix view. This is, in
 * effect, a visualization of the graph's <i>adjacency matrix</i>: the cell at
 * row <i>i</i>, column <i>j</i>, corresponds to the link from node <i>i</i> to
 * node <i>j</i>. The fill color of each cell is binary by default, and
 * corresponds to whether a link exists between the two nodes. If the underlying
 * graph has links with variable values, the <tt>fillStyle</tt> property can be
 * substited to use an appropriate color function, such as {@link pv.ramp}.
 *
 * <p>For undirected networks, the matrix is symmetric around the diagonal. For
 * directed networks, links in opposite directions can be rendered on opposite
 * sides of the diagonal using <tt>directed(true)</tt>. The graph is assumed to
 * be undirected by default.
 *
 * <p>The mark prototypes for this network layout are slightly different than
 * other implementations:<ul>
 *
 * <li><tt>node</tt> - unsupported; undefined. No mark is needed to visualize
 * nodes directly, as the nodes are implicit in the location (rows and columns)
 * of the links.
 *
 * <p><li><tt>link</tt> - for rendering links; typically a {@link pv.Bar}. The
 * link mark is added directly to the layout, with the data property defined as
 * all possible pairs of nodes. Each pair is represented as a
 * {@link pv.Network.Layout.Link}, though the <tt>linkValue</tt> attribute may
 * be 0 if no link exists in the graph.
 *
 * <p><li><tt>label</tt> - for rendering node labels; typically a
 * {@link pv.Label}. The label mark is added directly to the layout, with the
 * data property defined via the layout's <tt>nodes</tt> property; note,
 * however, that the nodes are duplicated so as to provide a label across the
 * top and down the side. Properties such as <tt>strokeStyle</tt> and
 * <tt>fillStyle</tt> can be overridden to compute properties from node data
 * dynamically.
 *
 * </ul>For more details on how to use this layout, see
 * {@link pv.Layout.Network}.
 *
 * @extends pv.Layout.Network
 */
pv.Layout.Matrix = function() {
  pv.Layout.Network.call(this);
  var that = this,
      n, // cached matrix size
      dx, // cached cell width
      dy, // cached cell height
      labels, // cached labels (array of strings)
      pairs, // cached pairs (array of links)
      buildImplied = that.buildImplied;

  /** @private Cache layout state to optimize properties. */
  this.buildImplied = function(s) {
    buildImplied.call(this, s);
    n = s.nodes.length;
    dx = s.width / n;
    dy = s.height / n;
    labels = s.$matrix.labels;
    pairs = s.$matrix.pairs;
  };

  /* Links are all pairs of nodes. */
  this.link
      .data(function() { return pairs; })
      .left(function() { return dx * (this.index % n); })
      .top(function() { return dy * Math.floor(this.index / n); })
      .width(function() { return dx; })
      .height(function() { return dy; })
      .lineWidth(1.5)
      .strokeStyle("#fff")
      .fillStyle(function(l) { return l.linkValue ? "#555" : "#eee"; })
      .parent = this;

  /* No special add for links! */
  delete this.link.add;

  /* Labels are duplicated for top & left. */
  this.label
      .data(function() { return labels; })
      .left(function() { return this.index & 1 ? dx * ((this.index >> 1) + .5) : 0; })
      .top(function() { return this.index & 1 ? 0 : dy * ((this.index >> 1) + .5); })
      .textMargin(4)
      .textAlign(function() { return this.index & 1 ? "left" : "right"; })
      .textAngle(function() { return this.index & 1 ? -Math.PI / 2 : 0; });

  /* The node mark is unused. */
  delete this.node;
};

pv.Layout.Matrix.prototype = pv.extend(pv.Layout.Network)
    .property("directed", Boolean);

/**
 * Whether this matrix visualization is directed (bidirectional). By default,
 * the graph is assumed to be undirected, such that the visualization is
 * symmetric across the matrix diagonal. If the network is directed, then
 * forward links are drawn above the diagonal, while reverse links are drawn
 * below.
 *
 * @type boolean
 * @name pv.Layout.Matrix.prototype.directed
 */

/**
 * Specifies an optional sort function. The sort function follows the same
 * comparator contract required by {@link pv.Dom.Node#sort}. Specifying a sort
 * function provides an alternative to sort the nodes as they are specified by
 * the <tt>nodes</tt> property; the main advantage of doing this is that the
 * comparator function can access implicit fields populated by the network
 * layout, such as the <tt>linkDegree</tt>.
 *
 * <p>Note that matrix visualizations are particularly sensitive to order. This
 * is referred to as the seriation problem, and many different techniques exist
 * to find good node orders that emphasize clusters, such as spectral layout and
 * simulated annealing.
 *
 * @param {function} f comparator function for nodes.
 * @returns {pv.Layout.Matrix} this.
 */
pv.Layout.Matrix.prototype.sort = function(f) {
  this.$sort = f;
  return this;
};

/** @private */
pv.Layout.Matrix.prototype.buildImplied = function(s) {
  if (pv.Layout.Network.prototype.buildImplied.call(this, s)) return;

  var nodes = s.nodes,
      links = s.links,
      sort = this.$sort,
      n = nodes.length,
      index = pv.range(n),
      labels = [],
      pairs = [],
      map = {};

  s.$matrix = {labels: labels, pairs: pairs};

  /* Sort the nodes. */
  if (sort) index.sort(function(a, b) { return sort(nodes[a], nodes[b]); });

  /* Create pairs. */
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < n; j++) {
      var a = index[i],
          b = index[j],
          p = {
            row: i,
            col: j,
            sourceNode: nodes[a],
            targetNode: nodes[b],
            linkValue: 0
          };
      pairs.push(map[a + "." + b] = p);
    }
  }

  /* Create labels. */
  for (var i = 0; i < n; i++) {
    var a = index[i];
    labels.push(nodes[a], nodes[a]);
  }

  /* Accumulate link values. */
  for (var i = 0; i < links.length; i++) {
    var l = links[i],
        source = l.sourceNode.index,
        target = l.targetNode.index,
        value = l.linkValue;
    map[source + "." + target].linkValue += value;
    if (!s.directed) map[target + "." + source].linkValue += value;
  }
};
// ranges (bad, satisfactory, good)
// measures (actual, forecast)
// markers (previous, goal)

/*
 * Chart design based on the recommendations of Stephen Few. Implementation
 * based on the work of Clint Ivy, Jamie Love, and Jason Davies.
 * http://projects.instantcognition.com/protovis/bulletchart/
 */

/**
 * Constructs a new, empty bullet layout. Layouts are not typically constructed
 * directly; instead, they are added to an existing panel via
 * {@link pv.Mark#add}.
 *
 * @class
 * @extends pv.Layout
 */
pv.Layout.Bullet = function() {
  pv.Layout.call(this);
  var that = this,
      buildImplied = that.buildImplied,
      scale = that.x = pv.Scale.linear(),
      orient,
      horizontal,
      rangeColor,
      measureColor,
      x;

  /** @private Cache layout state to optimize properties. */
  this.buildImplied = function(s) {
    buildImplied.call(this, x = s);
    orient = s.orient;
    horizontal = /^left|right$/.test(orient);
    rangeColor = pv.ramp("#bbb", "#eee")
        .domain(0, Math.max(1, x.ranges.length - 1));
    measureColor = pv.ramp("steelblue", "lightsteelblue")
        .domain(0, Math.max(1, x.measures.length - 1));
  };

  /**
   * The range prototype.
   *
   * @type pv.Mark
   * @name pv.Layout.Bullet.prototype.range
   */
  (this.range = new pv.Mark())
      .data(function() { return x.ranges; })
      .reverse(true)
      .left(function() { return orient == "left" ? 0 : null; })
      .top(function() { return orient == "top" ? 0 : null; })
      .right(function() { return orient == "right" ? 0 : null; })
      .bottom(function() { return orient == "bottom" ? 0 : null; })
      .width(function(d) { return horizontal ? scale(d) : null; })
      .height(function(d) { return horizontal ? null : scale(d); })
      .fillStyle(function() { return rangeColor(this.index); })
      .antialias(false)
      .parent = that;

  /**
   * The measure prototype.
   *
   * @type pv.Mark
   * @name pv.Layout.Bullet.prototype.measure
   */
  (this.measure = new pv.Mark())
      .extend(this.range)
      .data(function() { return x.measures; })
      .left(function() { return orient == "left" ? 0 : horizontal ? null : this.parent.width() / 3.25; })
      .top(function() { return orient == "top" ? 0 : horizontal ? this.parent.height() / 3.25 : null; })
      .right(function() { return orient == "right" ? 0 : horizontal ? null : this.parent.width() / 3.25; })
      .bottom(function() { return orient == "bottom" ? 0 : horizontal ? this.parent.height() / 3.25 : null; })
      .fillStyle(function() { return measureColor(this.index); })
      .parent = that;

  /**
   * The marker prototype.
   *
   * @type pv.Mark
   * @name pv.Layout.Bullet.prototype.marker
   */
  (this.marker = new pv.Mark())
      .data(function() { return x.markers; })
      .left(function(d) { return orient == "left" ? scale(d) : horizontal ? null : this.parent.width() / 2; })
      .top(function(d) { return orient == "top" ? scale(d) : horizontal ? this.parent.height() / 2 : null; })
      .right(function(d) { return orient == "right" ? scale(d) : null; })
      .bottom(function(d) { return orient == "bottom" ? scale(d) : null; })
      .strokeStyle("black")
      .shape("bar")
      .shapeAngle(function() { return horizontal ? 0 : Math.PI / 2; })
      .parent = that;

  (this.tick = new pv.Mark())
      .data(function() { return scale.ticks(7); })
      .left(function(d) { return orient == "left" ? scale(d) : null; })
      .top(function(d) { return orient == "top" ? scale(d) : null; })
      .right(function(d) { return orient == "right" ? scale(d) : horizontal ? null : -6; })
      .bottom(function(d) { return orient == "bottom" ? scale(d) : horizontal ? -8 : null; })
      .height(function() { return horizontal ? 6 : null; })
      .width(function() { return horizontal ? null : 6; })
      .parent = that;
};

pv.Layout.Bullet.prototype = pv.extend(pv.Layout)
    .property("orient", String) // left, right, top, bottom
    .property("ranges")
    .property("markers")
    .property("measures")
    .property("maximum", Number);

/**
 * Default properties for bullet layouts.
 *
 * @type pv.Layout.Bullet
 */
pv.Layout.Bullet.prototype.defaults = new pv.Layout.Bullet()
    .extend(pv.Layout.prototype.defaults)
    .orient("left")
    .ranges([])
    .markers([])
    .measures([]);

/**
 * The orientation.
 *
 * @type string
 * @name pv.Layout.Bullet.prototype.orient
 */

/**
 * The array of range values.
 *
 * @type array
 * @name pv.Layout.Bullet.prototype.ranges
 */

/**
 * The array of marker values.
 *
 * @type array
 * @name pv.Layout.Bullet.prototype.markers
 */

/**
 * The array of measure values.
 *
 * @type array
 * @name pv.Layout.Bullet.prototype.measures
 */

/**
 * Optional; the maximum range value.
 *
 * @type number
 * @name pv.Layout.Bullet.prototype.maximum
 */

/** @private */
pv.Layout.Bullet.prototype.buildImplied = function(s) {
  pv.Layout.prototype.buildImplied.call(this, s);
  var size = this.parent[/^left|right$/.test(s.orient) ? "width" : "height"]();
  s.maximum = s.maximum || pv.max([].concat(s.ranges, s.markers, s.measures));
  this.x.domain(0, s.maximum).range(0, size);
};
/**
 * Abstract; see an implementing class for details.
 *
 * @class Represents a reusable interaction; applies an interactive behavior to
 * a given mark. Behaviors are themselves functions designed to be used as event
 * handlers. For example, to add pan and zoom support to any panel, say:
 *
 * <pre>    .event("mousedown", pv.Behavior.pan())
 *     .event("mousewheel", pv.Behavior.zoom())</pre>
 *
 * The behavior should be registered on the event that triggers the start of the
 * behavior. Typically, the behavior will take care of registering for any
 * additional events that are necessary. For example, dragging starts on
 * mousedown, while the drag behavior automatically listens for mousemove and
 * mouseup events on the window. By listening to the window, the behavior can
 * continue to receive mouse events even if the mouse briefly leaves the mark
 * being dragged, or even the root panel.
 *
 * <p>Each behavior implementation has specific requirements as to which events
 * it supports, and how it should be used. For example, the drag behavior
 * requires that the data associated with the mark be an object with <tt>x</tt>
 * and <tt>y</tt> attributes, such as a {@link pv.Vector}, storing the mark's
 * position. See an implementing class for details.
 *
 * @see pv.Behavior.drag
 * @see pv.Behavior.pan
 * @see pv.Behavior.point
 * @see pv.Behavior.select
 * @see pv.Behavior.zoom
 * @extends function
 */
pv.Behavior = {};
 pv.Behavior.dragBase = function(shared){
    var events, // event registrations held during each selection
        downElem,
        cancelClick,
        inited,
        drag;
    
    shared.autoRender = true;
    shared.positionConstraint = null;
    shared.bound = function(v, a_p) {
        return Math.max(drag.min[a_p], Math.min(drag.max[a_p], v));
    };
    
    /** @private protovis mark event handler */
    function mousedown(d) {
        // Initialize
        if(!inited){
            inited = true;
            this.addEventInterceptor('click', eventInterceptor, /*before*/true);
        }
        
        // Add event handlers to follow the drag.
        // These are unregistered on mouse up.
        if(!events){
            var root = this.root.scene.$g;
            events = [
                // Attaching events to the canvas (instead of only to the document)
                // allows canceling the bubbling of the events before they 
                // reach the handlers of ascendant elements (of canvas).
                [root,     'mousemove', pv.listen(root, 'mousemove', mousemove)],
                [root,     'mouseup',   pv.listen(root, 'mouseup',   mouseup  )],
              
                // It is still necessary to receive events
                // that are sourced outside the canvas
                [document, 'mousemove', pv.listen(document, 'mousemove', mousemove)],
                [document, 'mouseup',   pv.listen(document, 'mouseup',   mouseup  )]
            ];
        }
        
        var ev = arguments[arguments.length - 1]; // last argument
        downElem = ev.target;
        cancelClick = false;
        
        // Prevent the event from bubbling off the canvas 
        // (if being handled by the root)
        ev.stopPropagation();
        
        // --------------
        
        var m1    = this.mouse();
        var scene = this.scene;
        var index = this.index;
        
        drag = 
        scene[index].drag = {
            phase: 'start',
            m:     m1,    // current relevant mouse position
            m1:    m1,    // the mouse position of the mousedown
            m2:    null,  // the mouse position of the current/last mousemove
            d:     d,     // the datum in mousedown
            scene: scene, // scene context
            index: index  // scene index
        };

        ev = wrapEvent(ev, drag);

        shared.dragstart.call(this, ev);
        
        var m = drag.m;
        if(m !== m1){
            m1.x = m.x;
            m1.y = m.y;
        }
    }
    
    /** @private DOM event handler */
    function mousemove(ev) {
        if (!drag) { return; }
        
        drag.phase = 'move';
        
        // Prevent the event from bubbling off the canvas 
        // (if being handled by the root)
        ev.stopPropagation();
        
        ev = wrapEvent(ev, drag);
        
        // In the context of the mousedown scene
        var scene = drag.scene;
        scene.mark.context(scene, drag.index, function() {
            // this === scene.mark
            var mprev = drag.m2 || drag.m1;
            
            var m2 = this.mouse();
            if(mprev && m2.distance2(mprev).dist2 <= 2){
                return;
            }
            
            drag.m = drag.m2 = m2;
            
            shared.drag.call(this, ev);
            
            // m2 may have changed
            var m = drag.m;
            if(m !== m2){
                m2.x = m.x;
                m2.y = m.y;
            }
        });
    }

    /** @private DOM event handler */
    function mouseup(ev) {
        if (!drag) { return; }
        
        drag.phase = 'end';
        
        var m2 = drag.m2;
        
        // A click event is generated whenever
        // the element where the mouse goes down
        // is the same element of where the mouse goes up.
        // We will try to intercept the generated click event and swallow it,
        // when some selection has occurred.
        var isDrag = m2 && drag.m1.distance2(m2).dist2 > 0.1;
        drag.canceled = !isDrag;
        
        cancelClick = isDrag && (downElem === ev.target);
        if(!cancelClick){
            downElem = null;
        }
        
        // Prevent the event from bubbling off the canvas 
        // (if being handled by the root)
        ev.stopPropagation();
        
        ev = wrapEvent(ev, drag);
        
        // Unregister events
        if(events){
            events.forEach(function(registration){
                pv.unlisten.apply(pv, registration);
            });
            events = null;
        }
        
        var scene = drag.scene;
        var index = drag.index;
        try{
            scene.mark.context(scene, index, function() {
                shared.dragend.call(this, ev);
            });
        } finally {
            drag = null;
            delete scene[index].drag;
        }
    }

    function wrapEvent(ev, drag) {
        try {
            ev.drag = drag;
            return ev;
        } catch(ex) {
            // SWALLOW
        }

        // wrap
        var ev2 = {};
        for(var p in ev) {
            var v = ev[p];
            ev2[p] = typeof v !== 'function' ? v : bindEventFun(v, ev);
        }
        
        ev2._sourceEvent = ev;

        return ev2;
    }

    function bindEventFun(f, ctx) {
        return function() { return f.apply(ctx, arguments); };
    }

    /**
     * Intercepts click events and, 
     * if they were consequence
     * of a mouse down and up of a selection,
     * cancels them.
     * 
     * @returns {boolean|array} 
     * <tt>false</tt> to indicate that the event is handled,
     * otherwise, an event handler info array: [handler, type, scenes, index, ev].
     * 
     * @private
     */
    function eventInterceptor(type, ev){
        if(cancelClick && downElem === ev.target){
            // Event is handled
            cancelClick = false;
            downElem = null;
            return false;
        }
        
        // Let event be handled normally
    }
    

    /**
     * Whether to automatically render the mark when appropriate.
     * 
     * @function
     * @returns {pv.Behavior.dragBase | boolean} this, or the current autoRender parameter.
     * @name pv.Behavior.dragBase.prototype.autoRender
     * @param {string} [_] the new autoRender parameter
     */
    mousedown.autoRender = function(_) {
        if (arguments.length) {
            shared.autoRender = !!_;
            return mousedown;
        }
        
        return shared.autoRender;
    };
    
    /**
     * Gets or sets the positionConstraint parameter.
     * 
     * A function that given a drag object
     * can change its property <tt>m</tt>, 
     * containing a vector with the desired mouse position.
     *  
     * @function
     * @returns {pv.Behavior.dragBase | function} this, or the current positionConstraint parameter.
     * @name pv.Behavior.dragBase.prototype.positionConstraint
     * @param {function} [_] the new positionConstraint parameter
     */
    mousedown.positionConstraint = function(_) {
        if (arguments.length) {
            shared.positionConstraint = _;
            return mousedown;
        }
        
        return shared.positionConstraint;
    };
    
    return mousedown;
};
  
/**
 * Returns a new drag behavior to be registered on mousedown events.
 *
 * @class Implements interactive dragging starting with mousedown events.
 * Register this behavior on marks that should be draggable by the user, such as
 * the selected region for brushing and linking. This behavior can be used in
 * tandom with {@link pv.Behavior.select} to allow the selected region to be
 * dragged interactively.
 *
 * <p>After the initial mousedown event is triggered, this behavior listens for
 * mousemove and mouseup events on the window. This allows dragging to continue
 * even if the mouse temporarily leaves the mark that is being dragged, or even
 * the root panel.
 *
 * <p>This behavior requires that the data associated with the mark being
 * dragged have <tt>x</tt> and <tt>y</tt> attributes that correspond to the
 * mark's location in pixels. The mark's positional properties are not set
 * directly by this behavior; instead, the positional properties should be
 * defined as:
 *
 * <pre>    .left(function(d) d.x)
 *     .top(function(d) d.y)</pre>
 *
 * Thus, the behavior does not move the mark directly, but instead updates the
 * mark position by updating the underlying data. Note that if the positional
 * properties are defined with bottom and right (rather than top and left), the
 * drag behavior will be inverted, which will confuse users!
 *
 * <p>The drag behavior is bounded by the parent panel; the <tt>x</tt> and
 * <tt>y</tt> attributes are clamped such that the mark being dragged does not
 * extend outside the enclosing panel's bounds. To facilitate this, the drag
 * behavior also queries for <tt>dx</tt> and <tt>dy</tt> attributes on the
 * underlying data, to determine the dimensions of the bar being dragged. For
 * non-rectangular marks, the drag behavior simply treats the mark as a point,
 * which means that only the mark's center is bounded.
 *
 * <p>The mark being dragged is automatically re-rendered for each mouse event
 * as part of the drag operation. In addition, a <tt>fix</tt> attribute is
 * populated on the mark, which allows visual feedback for dragging. For
 * example, to change the mark fill color while dragging:
 *
 * <pre>    .fillStyle(function(d) d.fix ? "#ff7f0e" : "#aec7e8")</pre>
 *
 * In some cases, such as with network layouts, dragging the mark may cause
 * related marks to change, in which case additional marks may also need to be
 * rendered. This can be accomplished by listening for the drag
 * psuedo-events:<ul>
 *
 * <li>dragstart (on mousedown)
 * <li>drag (on mousemove)
 * <li>dragend (on mouseup)
 *
 * </ul>For example, to render the parent panel while dragging, thus
 * re-rendering all sibling marks:
 *
 * <pre>    .event("mousedown", pv.Behavior.drag())
 *     .event("drag", function() this.parent)</pre>
 *
 * This behavior may be enhanced in the future to allow more flexible
 * configuration of drag behavior.
 *
 * @extends pv.Behavior
 * @see pv.Behavior
 * @see pv.Behavior.select
 * @see pv.Layout.force
 */
pv.Behavior.drag = function() {
    var collapse = null; // dimensions to collapse
    var kx = 1; // x-dimension 1/0
    var ky = 1; // y-dimension 1/0
    
    var v1;  // initial mouse-particle offset
    
    // Executed in context of initial mark scene
    var shared = {
        dragstart: function(ev){
            var drag = ev.drag;
            drag.type = 'drag';
            
            var p   = drag.d; // particle being dragged
            var fix = pv.vector(p.x, p.y);
            
            p.fix  = fix;
            p.drag = drag;
            
            v1 = fix.minus(drag.m1);
            
            var parent = this.parent;
            drag.max = {
               x: parent.width()  - (p.dx || 0),
               y: parent.height() - (p.dy || 0)
            };
            
            drag.min = {
                x: 0,
                y: 0
            };
            
            if(shared.autoRender){
                this.render();
            }
            
            pv.Mark.dispatch("dragstart", drag.scene, drag.index, ev);
        },
        
        drag: function(ev){
            var drag = ev.drag;
            var m2   = drag.m2;
            var p    = drag.d;
            
            drag.m = v1.plus(m2);
            
            var constraint = shared.positionConstraint;
            if(constraint){
                constraint(drag);
            }
            
            var m = drag.m;
            if(kx){
                p.x = p.fix.x = shared.bound(m.x, 'x');
            }
            
            if(ky){
                p.y = p.fix.y = shared.bound(m.y, 'y');
            }
            
            if(shared.autoRender){
                this.render();
            }
            
            pv.Mark.dispatch("drag", drag.scene, drag.index, ev);
        },
        
        dragend: function(ev){
            var drag = ev.drag;
            var p    = drag.d;
            
            p.fix = null; // pv compatibility
            v1 = null;
             
            if(shared.autoRender){
                this.render();
            }
            
            try {
                pv.Mark.dispatch('dragend', drag.scene, drag.index, ev);
            } finally {
                delete p.drag;
            }
        }
    };
    
    var mousedown = pv.Behavior.dragBase(shared);
    
    /**
     * Sets or gets the collapse parameter.
     * By default, dragging is sensitive to both dimensions.
     * However, with some visualizations it is desirable to
     * consider only a single dimension, such as the <i>x</i>-dimension for an
     * independent variable. In this case, the collapse parameter can be set to
     * collapse the <i>y</i> dimension:
     *
     * <pre>    .event("mousedown", pv.Behavior.drag().collapse("y"))</pre>
     *
     * @function
     * @returns {pv.Behavior.drag} this, or the current collapse parameter.
     * @name pv.Behavior.drag.prototype.collapse
     * @param {string} [x] the new collapse parameter
     */
    mousedown.collapse = function(x) {
      if (arguments.length) {
        collapse = String(x);
        switch (collapse) {
          case "y": kx = 1; ky = 0; break;
          case "x": kx = 0; ky = 1; break;
          default:  kx = 1; ky = 1; break;
        }
        return mousedown;
      }
      return collapse;
    };
    
    return mousedown;
};
/**
 * Returns a new point behavior to be registered on mousemove events.
 *
 * @class Implements interactive fuzzy pointing, identifying marks that are in
 * close proximity to the mouse cursor. This behavior is an alternative to the
 * native mouseover and mouseout events, improving usability. Rather than
 * requiring the user to mouseover a mark exactly, the mouse simply needs to
 * move near the given mark and a "point" event is triggered. In addition, if
 * multiple marks overlap, the point behavior can be used to identify the mark
 * instance closest to the cursor, as opposed to the one that is rendered on
 * top.
 *
 * <p>The point behavior can also identify the closest mark instance for marks
 * that produce a continuous graphic primitive. The point behavior can thus be
 * used to provide details-on-demand for both discrete marks (such as dots and
 * bars), as well as continuous marks (such as lines and areas).
 *
 * <p>This behavior is implemented by finding the closest mark instance to the
 * mouse cursor on every mousemove event. If this closest mark is within the
 * given radius threshold, which defaults to 30 pixels, a "point" psuedo-event
 * is dispatched to the given mark instance. If any mark were previously
 * pointed, it would receive a corresponding "unpoint" event. These two
 * psuedo-event types correspond to the native "mouseover" and "mouseout"
 * events, respectively. To increase the radius at which the point behavior can
 * be applied, specify an appropriate threshold to the constructor, up to
 * <tt>Infinity</tt>.
 *
 * <p>By default, the standard Cartesian distance is computed. However, with
 * some visualizations it is desirable to consider only a single dimension, such
 * as the <i>x</i>-dimension for an independent variable. In this case, the
 * collapse parameter can be set to collapse the <i>y</i> dimension:
 *
 * <pre>    .event("mousemove", pv.Behavior.point(Infinity).collapse("y"))</pre>
 *
 * <p>This behavior only listens to mousemove events on the assigned panel,
 * which is typically the root panel. The behavior will search recursively for
 * descendant marks to point. If the mouse leaves the assigned panel, the
 * behavior no longer receives mousemove events; an unpoint psuedo-event is
 * automatically dispatched to unpoint any pointed mark. Marks may be re-pointed
 * when the mouse reenters the panel.
 *
 * <p>Panels have transparent fill styles by default; this means that panels may
 * not receive the initial mousemove event to start pointing. To fix this
 * problem, either given the panel a visible fill style (such as "white"), or
 * set the <tt>events</tt> property to "all" such that the panel receives events
 * despite its transparent fill.
 *
 * <p>Note: this behavior does not currently wedge marks.
 *
 * @extends pv.Behavior
 *
 * @param {number} [r] the fuzzy radius threshold in pixels
 * @see <a href="http://www.tovigrossman.com/papers/chi2005bubblecursor.pdf"
 * >"The Bubble Cursor: Enhancing Target Acquisition by Dynamic Resizing of the
 * Cursor's Activation Area"</a> by T. Grossman &amp; R. Balakrishnan, CHI 2005.
 */
pv.Behavior.point = function(r) {
  var unpoint, // the current pointer target
      collapse = null, // dimensions to collapse
      kx = 1, // x-dimension cost scale
      ky = 1, // y-dimension cost scale
      pointingPanel = null, 
      r2 = arguments.length ? r * r : 900; // fuzzy radius

  /** @private Search for the mark closest to the mouse. */
  function search(scene, index) {
    var s = scene[index],
        point = {cost: Infinity};
    for (var i = (s.visible ? s.children.length : 0) - 1 ; i >= 0; i--) {
      var child = s.children[i], mark = child.mark, p;
      if (mark.type == "panel") {
        mark.scene = child;
        for (var j = child.length - 1 ; j >= 0; j--) {
          mark.index = j;
          p = search(child, j);
          if (p.cost < point.cost) point = p;
        }
        delete mark.scene;
        delete mark.index;
      } else if (mark.$handlers.point) {
        var v = mark.mouse();
        for (var j = child.length - 1 ; j >= 0; j--) {
          var c = child[j],
              dx = v.x - c.left - (c.width || 0) / 2,
              dy = v.y - c.top - (c.height || 0) / 2,
              dd = kx * dx * dx + ky * dy * dy;
          if (dd < point.cost) {
            point.distance = dx * dx + dy * dy;
            point.cost = dd;
            point.scene = child;
            point.index = j;
          }
        }
      }
    }
    return point;
  }

  /** @private */
  function mousemove(e) {
    /* If the closest mark is far away, clear the current target. */
    var point = search(this.scene, this.index);
    if ((point.cost == Infinity) || (point.distance > r2)) point = null;

    /* Unpoint the old target, if it's not the new target. */
    if (unpoint) {
      if (point
          && (unpoint.scene == point.scene)
          && (unpoint.index == point.index)) return;
      pv.Mark.dispatch("unpoint", unpoint.scene, unpoint.index, e);
    }

    /* Point the new target, if there is one. */
    if (unpoint = point) {
      pv.Mark.dispatch("point", point.scene, point.index, e);

      /* Unpoint when the mouse leaves the pointing panel. */
      if(!pointingPanel && this.type === 'panel') {
          pointingPanel = this;
          pointingPanel.event('mouseout', function(){
              var ev = arguments[arguments.length - 1];
              mouseout.call(pointingPanel.scene.$g, ev);
          });
      } else {
          pv.listen(this.root.canvas(), "mouseout", mouseout);
      }
    }
  }

  /** @private */
  function mouseout(e) {
    if (unpoint && !pv.ancestor(this, e.relatedTarget)) {
      pv.Mark.dispatch("unpoint", unpoint.scene, unpoint.index, e);
      unpoint = null;
    }
  }

  /**
   * Sets or gets the collapse parameter. By default, the standard Cartesian
   * distance is computed. However, with some visualizations it is desirable to
   * consider only a single dimension, such as the <i>x</i>-dimension for an
   * independent variable. In this case, the collapse parameter can be set to
   * collapse the <i>y</i> dimension:
   *
   * <pre>    .event("mousemove", pv.Behavior.point(Infinity).collapse("y"))</pre>
   *
   * @function
   * @returns {pv.Behavior.point} this, or the current collapse parameter.
   * @name pv.Behavior.point.prototype.collapse
   * @param {string} [x] the new collapse parameter
   */
  mousemove.collapse = function(x) {
    if (arguments.length) {
      collapse = String(x);
      switch (collapse) {
        case "y": kx = 1; ky = 0; break;
        case "x": kx = 0; ky = 1; break;
        default: kx = 1; ky = 1; break;
      }
      return mousemove;
    }
    return collapse;
  };

  return mousemove;
};/**
 * Returns a new select behavior to be registered on mousedown events.
 *
 * @class Implements interactive selecting starting with mousedown events.
 * Register this behavior on panels that should be selectable by the user, such
 * for brushing and linking. This behavior can be used in tandom with
 * {@link pv.Behavior.drag} to allow the selected region to be dragged
 * interactively.
 *
 * <p>After the initial mousedown event is triggered, this behavior listens for
 * mousemove and mouseup events on the window. This allows selecting to continue
 * even if the mouse temporarily leaves the assigned panel, or even the root
 * panel.
 *
 * <p>This behavior requires that the data associated with the mark being
 * dragged have <tt>x</tt>, <tt>y</tt>, <tt>dx</tt> and <tt>dy</tt> attributes
 * that correspond to the mark's location and dimensions in pixels. The mark's
 * positional properties are not set directly by this behavior; instead, the
 * positional properties should be defined as:
 *
 * <pre>    .left(function(d) d.x)
 *     .top(function(d) d.y)
 *     .width(function(d) d.dx)
 *     .height(function(d) d.dy)</pre>
 *
 * Thus, the behavior does not resize the mark directly, but instead updates the
 * selection by updating the assigned panel's underlying data. Note that if the
 * positional properties are defined with bottom and right (rather than top and
 * left), the drag behavior will be inverted, which will confuse users!
 *
 * <p>The select behavior is bounded by the assigned panel; the positional
 * attributes are clamped such that the selection does not extend outside the
 * panel's bounds.
 *
 * <p>The panel being selected is automatically re-rendered for each mouse event
 * as part of the drag operation. This behavior may be enhanced in the future to
 * allow more flexible configuration of select behavior. In some cases, such as
 * with parallel coordinates, making a selection may cause related marks to
 * change, in which case additional marks may also need to be rendered. This can
 * be accomplished by listening for the select pseudo-events:<ul>
 *
 * <li>selectstart (on mousedown)
 * <li>select (on mousemove)
 * <li>selectend (on mouseup)
 *
 * </ul>For example, to render the parent panel while selecting, thus
 * re-rendering all sibling marks:
 *
 * <pre>    .event("mousedown", pv.Behavior.drag())
 *     .event("select", function() this.parent)</pre>
 *
 * This behavior may be enhanced in the future to allow more flexible
 * configuration of the selection behavior.
 *
 * @extends pv.Behavior
 * @see pv.Behavior.drag
 */
 pv.Behavior.select = function(){
    var collapse = null; // dimensions to collapse
    var kx = 1; // x-dimension 1/0
    var ky = 1; // y-dimension 1/0
    var preserveLength = false;
    
    // Executed in context of initial mark scene
    var shared = {
        dragstart: function(ev){
            var drag = ev.drag;
            drag.type = 'select';
            
            var r  = drag.d;
            r.drag = drag;
            
            drag.max = {
                x: this.width(),
                y: this.height()
            };
            
            drag.min = {
                x: 0,
                y: 0
            };
                
            var constraint = shared.positionConstraint;
            if(constraint){
                drag.m = drag.m.clone();
                constraint(drag);
            }
            
            var m = drag.m;
            if(kx){
                r.x = shared.bound(m.x, 'x');
                if(!preserveLength){
                    r.dx = 0;
                }
            }
            
            if(ky){
                r.y = shared.bound(m.y, 'y');
                if(!preserveLength){
                    r.dy = 0;
                }
            }
            
            pv.Mark.dispatch('selectstart', drag.scene, drag.index, ev);
        },
        
        drag: function(ev){
            var drag = ev.drag;
            var m1 = drag.m1;
            var r  = drag.d;
            
            drag.max.x = this.width();
            drag.max.y = this.height();
            
            var constraint = shared.positionConstraint;
            if(constraint){
                drag.m = drag.m.clone();
                constraint(drag);
            }
            
            var m = drag.m;
            
            if(kx){
                var bx = Math.min(m1.x, m.x);
                bx  = shared.bound(bx, 'x');
                r.x = bx;
                
                if(!preserveLength){
                    var ex = Math.max(m.x,  m1.x);
                    ex = shared.bound(ex, 'x');
                    r.dx = ex - bx;
                }
            }
            
            if(ky){
                var by = Math.min(m1.y, m.y);
                by  = shared.bound(by, 'y');
                r.y = by;
                
                if(!preserveLength){
                    var ey = Math.max(m.y,  m1.y);
                    ey = shared.bound(ey, 'y');
                    r.dy = ey - by;
                }
            }
            
            if(shared.autoRender){
                this.render();
            }
      
            pv.Mark.dispatch('select', drag.scene, drag.index, ev);
        },
        
        dragend: function(ev){
            var drag = ev.drag;
            try {
                pv.Mark.dispatch('selectend', drag.scene, drag.index, ev);
            } finally {
                var r = drag.d;
                delete r.drag;
            }
        }
    };
    
    var mousedown = pv.Behavior.dragBase(shared);
    
    /**
     * Sets or gets the collapse parameter.
     * By default, the selection rectangle is sensitive to both dimensions.
     * However, with some visualizations it is desirable to
     * consider only a single dimension, such as the <i>x</i>-dimension for an
     * independent variable. In this case, the collapse parameter can be set to
     * collapse the <i>y</i> dimension:
     *
     * <pre>    .event("mousedown", pv.Behavior.select().collapse("y"))</pre>
     *
     * @function
     * @returns {pv.Behavior.select} this, or the current collapse parameter.
     * @name pv.Behavior.select.prototype.collapse
     * @param {string} [x] the new collapse parameter
     */
    mousedown.collapse = function(x) {
      if (arguments.length) {
        collapse = String(x);
        switch (collapse) {
          case "y": kx = 1; ky = 0; break;
          case "x": kx = 0; ky = 1; break;
          default:  kx = 1; ky = 1; break;
        }
        return mousedown;
      }
      return collapse;
    };
    
    mousedown.preserveLength = function(_) {
      if (arguments.length) {
        preserveLength = !!_;
        return mousedown;
      }
       return preserveLength;
    };
    
    return mousedown;
};
/**
 * Returns a new resize behavior to be registered on mousedown events.
 *
 * @class Implements interactive resizing of a selection starting with mousedown
 * events. Register this behavior on selection handles that should be resizeable
 * by the user, such for brushing and linking. This behavior can be used in
 * tandom with {@link pv.Behavior.select} and {@link pv.Behavior.drag} to allow
 * the selected region to be selected and dragged interactively.
 *
 * <p>After the initial mousedown event is triggered, this behavior listens for
 * mousemove and mouseup events on the window. This allows resizing to continue
 * even if the mouse temporarily leaves the assigned panel, or even the root
 * panel.
 *
 * <p>This behavior requires that the data associated with the mark being
 * resized have <tt>x</tt>, <tt>y</tt>, <tt>dx</tt> and <tt>dy</tt> attributes
 * that correspond to the mark's location and dimensions in pixels. The mark's
 * positional properties are not set directly by this behavior; instead, the
 * positional properties should be defined as:
 *
 * <pre>    .left(function(d) d.x)
 *     .top(function(d) d.y)
 *     .width(function(d) d.dx)
 *     .height(function(d) d.dy)</pre>
 *
 * Thus, the behavior does not resize the mark directly, but instead updates the
 * size by updating the assigned panel's underlying data. Note that if the
 * positional properties are defined with bottom and right (rather than top and
 * left), the resize behavior will be inverted, which will confuse users!
 *
 * <p>The resize behavior is bounded by the assigned mark's enclosing panel; the
 * positional attributes are clamped such that the selection does not extend
 * outside the panel's bounds.
 *
 * <p>The mark being resized is automatically re-rendered for each mouse event
 * as part of the resize operation. This behavior may be enhanced in the future
 * to allow more flexible configuration. In some cases, such as with parallel
 * coordinates, resizing the selection may cause related marks to change, in
 * which case additional marks may also need to be rendered. This can be
 * accomplished by listening for the select psuedo-events:<ul>
 *
 * <li>resizestart (on mousedown)
 * <li>resize (on mousemove)
 * <li>resizeend (on mouseup)
 *
 * </ul>For example, to render the parent panel while resizing, thus
 * re-rendering all sibling marks:
 *
 * <pre>    .event("mousedown", pv.Behavior.resize("left"))
 *     .event("resize", function() this.parent)</pre>
 *
 * This behavior may be enhanced in the future to allow more flexible
 * configuration of the selection behavior.
 *
 * @extends pv.Behavior
 * @see pv.Behavior.select
 * @see pv.Behavior.drag
 */
pv.Behavior.resize = function(side) {
    var preserveOrtho = false;
    
    var isLeftRight = (side === 'left' || side === 'right');
    
    // Executed in context of initial mark scene
    var shared = {
        dragstart: function(ev){
            var drag = ev.drag;
            drag.type = 'resize';
            
            var m1 = drag.m1;
            var r  = drag.d;
            r.drag = drag;
            
            // Fix the position of m1 to be the opposite side,
            // the one whose position is fixed during resizing
            switch(side) {
                case "left":   m1.x = r.x + r.dx; break;
                case "right":  m1.x = r.x;        break;
                case "top":    m1.y = r.y + r.dy; break;
                case "bottom": m1.y = r.y;        break;
            }
            
            // Capture parent's dimensions once
            // These can be overridden to change the bounds checking behavior
            var parent = this.parent;
            drag.max = {
                x: parent.width(),
                y: parent.height()
            };
            
            drag.min = {
                x: 0,
                y: 0
            };
            
            pv.Mark.dispatch("resizestart", drag.scene, drag.index, ev);
        },
        
        drag: function(ev){
            var drag = ev.drag;
            
            var m1 = drag.m1;
            var constraint = shared.positionConstraint;
            if(constraint){
                drag.m = drag.m.clone();
                constraint(drag);
            }
            
            var m = drag.m;
            var r = drag.d;
            
            if(!preserveOrtho || isLeftRight){
                var bx = Math.min(m1.x, m.x );
                var ex = Math.max(m.x,  m1.x);
                
                bx = shared.bound(bx, 'x');
                ex = shared.bound(ex, 'x');
                
                r.x  = bx;
                r.dx = ex - bx;
            }
            
            if(!preserveOrtho || !isLeftRight){
                var by = Math.min(m1.y, m.y );
                var ey = Math.max(m.y,  m1.y);
                
                bx = shared.bound(by, 'y');
                ex = shared.bound(ey, 'y');
                
                r.y  = by;
                r.dy = ey - by;
            }
            
            if(shared.autoRender){
                this.render();
            }
            
            pv.Mark.dispatch("resize", drag.scene, drag.index, ev);
        },
        
        dragend: function(ev){
            var drag = ev.drag;
            
            max = null;
            try {
                pv.Mark.dispatch('resizeend', drag.scene, drag.index, ev);
            } finally {
                var r = drag.d;
                delete r.drag;
            }
        }
    };

    var mousedown = pv.Behavior.dragBase(shared);
    
    /**
     * Sets or gets the preserveOrtho.
     * 
     * When <tt>true</tt>
     * doesn't update coordinates orthogonal to the behaviou's side.
     * The default value is <tt>false</tt>.
     *
     * @function
     * @returns {pv.Behavior.resize | boolean} this, or the current preserveOrtho parameter.
     * @name pv.Behavior.resize.prototype.preserveOrtho
     * @param {boolean} [_] the new preserveOrtho parameter
     */
    mousedown.preserveOrtho = function(_) {
        if (arguments.length){
            preserveOrtho = !!_;
            return mousedown;
        }
        return preserveOrtho;
    };
    
    return mousedown;
};
/**
 * Returns a new pan behavior to be registered on mousedown events.
 *
 * @class Implements interactive panning starting with mousedown events.
 * Register this behavior on panels to allow panning. This behavior can be used
 * in tandem with {@link pv.Behavior.zoom} to allow both panning and zooming:
 *
 * <pre>    .event("mousedown", pv.Behavior.pan())
 *     .event("mousewheel", pv.Behavior.zoom())</pre>
 *
 * The pan behavior currently supports only mouse events; support for keyboard
 * shortcuts to improve accessibility may be added in the future.
 *
 * <p>After the initial mousedown event is triggered, this behavior listens for
 * mousemove and mouseup events on the window. This allows panning to continue
 * even if the mouse temporarily leaves the panel that is being panned, or even
 * the root panel.
 *
 * <p>The implementation of this behavior relies on the panel's
 * <tt>transform</tt> property, which specifies a matrix transformation that is
 * applied to child marks. Note that the transform property only affects the
 * panel's children, but not the panel itself; therefore the panel's fill and
 * stroke will not change when the contents are panned.
 *
 * <p>Panels have transparent fill styles by default; this means that panels may
 * not receive the initial mousedown event to start panning. To fix this
 * problem, either given the panel a visible fill style (such as "white"), or
 * set the <tt>events</tt> property to "all" such that the panel receives events
 * despite its transparent fill.
 *
 * <p>The pan behavior has optional support for bounding. If enabled, the user
 * will not be able to pan the panel outside of the initial bounds. This feature
 * is designed to work in conjunction with the zoom behavior; otherwise,
 * bounding the panel effectively disables all panning.
 *
 * @extends pv.Behavior
 * @see pv.Behavior.zoom
 * @see pv.Panel#transform
 */
pv.Behavior.pan = function() {
  var scene, // scene context
      index, // scene context
      m1, // transformation matrix at the start of panning
      v1, // mouse location at the start of panning
      k, // inverse scale
      bound; // whether to bound to the panel

  /** @private */
  function mousedown() {
    index = this.index;
    scene = this.scene;
    v1 = pv.vector(pv.event.pageX, pv.event.pageY);
    m1 = this.transform();
    k = 1 / (m1.k * this.scale);
    if (bound) {
      bound = {
        x: (1 - m1.k) * this.width(),
        y: (1 - m1.k) * this.height()
      };
    }
  }

  /** @private */
  function mousemove(e) {
    if (!scene) return;
    scene.mark.context(scene, index, function() {
        var x = (pv.event.pageX - v1.x) * k,
            y = (pv.event.pageY - v1.y) * k,
            m = m1.translate(x, y);
        if (bound) {
          m.x = Math.max(bound.x, Math.min(0, m.x));
          m.y = Math.max(bound.y, Math.min(0, m.y));
        }
        this.transform(m).render();
      });
    pv.Mark.dispatch("pan", scene, index, e);
  }

  /** @private */
  function mouseup() {
    scene = null;
  }

  /**
   * Sets or gets the bound parameter. If bounding is enabled, the user will not
   * be able to pan outside the initial panel bounds; this typically applies
   * only when the pan behavior is used in tandem with the zoom behavior.
   * Bounding is not enabled by default.
   *
   * <p>Note: enabling bounding after panning has already occurred will not
   * immediately reset the transform. Bounding should be enabled before the
   * panning behavior is applied.
   *
   * @function
   * @returns {pv.Behavior.pan} this, or the current bound parameter.
   * @name pv.Behavior.pan.prototype.bound
   * @param {boolean} [x] the new bound parameter.
   */
  mousedown.bound = function(x) {
    if (arguments.length) {
      bound = Boolean(x);
      return this;
    }
    return Boolean(bound);
  };

  pv.listen(window, "mousemove", mousemove);
  pv.listen(window, "mouseup", mouseup);
  return mousedown;
};
/**
 * Returns a new zoom behavior to be registered on mousewheel events.
 *
 * @class Implements interactive zooming using mousewheel events. Register this
 * behavior on panels to allow zooming. This behavior can be used in tandem with
 * {@link pv.Behavior.pan} to allow both panning and zooming:
 *
 * <pre>    .event("mousedown", pv.Behavior.pan())
 *     .event("mousewheel", pv.Behavior.zoom())</pre>
 *
 * The zoom behavior currently supports only mousewheel events; support for
 * keyboard shortcuts and gesture events to improve accessibility may be added
 * in the future.
 *
 * <p>The implementation of this behavior relies on the panel's
 * <tt>transform</tt> property, which specifies a matrix transformation that is
 * applied to child marks. Note that the transform property only affects the
 * panel's children, but not the panel itself; therefore the panel's fill and
 * stroke will not change when the contents are zoomed. The built-in support for
 * transforms only supports uniform scaling and translates, which is sufficient
 * for panning and zooming.  Note that this is not a strict geometric
 * transformation, as the <tt>lineWidth</tt> property is scale-aware: strokes
 * are drawn at constant size independent of scale.
 *
 * <p>Panels have transparent fill styles by default; this means that panels may
 * not receive mousewheel events to zoom. To fix this problem, either given the
 * panel a visible fill style (such as "white"), or set the <tt>events</tt>
 * property to "all" such that the panel receives events despite its transparent
 * fill.
 *
 * <p>The zoom behavior has optional support for bounding. If enabled, the user
 * will not be able to zoom out farther than the initial bounds. This feature is
 * designed to work in conjunction with the pan behavior.
 *
 * @extends pv.Behavior
 * @see pv.Panel#transform
 * @see pv.Mark#scale
 * @param {number} speed
 */
pv.Behavior.zoom = function(speed) {
  var bound; // whether to bound to the panel

  if (!arguments.length) speed = 1 / 48;

  /** @private */
  function mousewheel(e) {
    var v = this.mouse(),
        k = pv.event.wheel * speed,
        m = this.transform().translate(v.x, v.y)
            .scale((k < 0) ? (1e3 / (1e3 - k)) : ((1e3 + k) / 1e3))
            .translate(-v.x, -v.y);
    if (bound) {
      m.k = Math.max(1, m.k);
      m.x = Math.max((1 - m.k) * this.width(), Math.min(0, m.x));
      m.y = Math.max((1 - m.k) * this.height(), Math.min(0, m.y));
    }
    this.transform(m).render();
    pv.Mark.dispatch("zoom", this.scene, this.index, e);
  }

  /**
   * Sets or gets the bound parameter. If bounding is enabled, the user will not
   * be able to zoom out farther than the initial panel bounds. Bounding is not
   * enabled by default. If this behavior is used in tandem with the pan
   * behavior, both should use the same bound parameter.
   *
   * <p>Note: enabling bounding after zooming has already occurred will not
   * immediately reset the transform. Bounding should be enabled before the zoom
   * behavior is applied.
   *
   * @function
   * @returns {pv.Behavior.zoom} this, or the current bound parameter.
   * @name pv.Behavior.zoom.prototype.bound
   * @param {boolean} [x] the new bound parameter.
   */
  mousewheel.bound = function(x) {
    if (arguments.length) {
      bound = Boolean(x);
      return this;
    }
    return Boolean(bound);
  };

  return mousewheel;
};
/**
 * @ignore
 * @namespace
 */
pv.Geo = function() {};
/**
 * Abstract; not implemented. There is no explicit constructor; this class
 * merely serves to document the representation used by {@link pv.Geo.scale}.
 *
 * @class Represents a pair of geographic coordinates.
 *
 * @name pv.Geo.LatLng
 * @see pv.Geo.scale
 */

/**
 * The <i>latitude</i> coordinate in degrees; positive is North.
 *
 * @type number
 * @name pv.Geo.LatLng.prototype.lat
 */

/**
 * The <i>longitude</i> coordinate in degrees; positive is East.
 *
 * @type number
 * @name pv.Geo.LatLng.prototype.lng
 */
/**
 * Abstract; not implemented. There is no explicit constructor; this class
 * merely serves to document the representation used by {@link pv.Geo.scale}.
 *
 * @class Represents a geographic projection. This class provides the core
 * implementation for {@link pv.Geo.scale}s, mapping between geographic
 * coordinates (latitude and longitude) and normalized screen space in the range
 * [-1,1]. The remaining mapping between normalized screen space and actual
 * pixels is performed by <tt>pv.Geo.scale</tt>.
 *
 * <p>Many geographic projections have a point around which the projection is
 * centered. Rather than have each implementation add support for a
 * user-specified center point, the <tt>pv.Geo.scale</tt> translates the
 * geographic coordinates relative to the center point for both the forward and
 * inverse projection.
 *
 * <p>In general, this class should not be used directly, unless the desire is
 * to implement a new geographic projection. Instead, use <tt>pv.Geo.scale</tt>.
 * Implementations are not required to implement inverse projections, but are
 * needed for some forms of interactivity. Also note that some inverse
 * projections are ambiguous, such as the connecting points in Dymaxian maps.
 *
 * @name pv.Geo.Projection
 * @see pv.Geo.scale
 */

/**
 * The <i>forward</i> projection.
 *
 * @function
 * @name pv.Geo.Projection.prototype.project
 * @param {pv.Geo.LatLng} latlng the latitude and longitude to project.
 * @returns {pv.Vector} the xy-coordinates of the given point.
 */

/**
 * The <i>inverse</i> projection; optional.
 *
 * @function
 * @name pv.Geo.Projection.prototype.invert
 * @param {pv.Vector} xy the x- and y-coordinates to invert.
 * @returns {pv.Geo.LatLng} the latitude and longitude of the given point.
 */
/**
 * The built-in projections.
 *
 * @see pv.Geo.Projection
 * @namespace
 */
pv.Geo.projections = {

  /** @see http://en.wikipedia.org/wiki/Mercator_projection */
  mercator: {
    project: function(latlng) {
      return {
          x: latlng.lng / 180,
          y: latlng.lat > 85 ? 1 : latlng.lat < -85 ? -1
              : Math.log(Math.tan(Math.PI / 4
              + pv.radians(latlng.lat) / 2)) / Math.PI
        };
    },
    invert: function(xy) {
      return {
          lng: xy.x * 180,
          lat: pv.degrees(2 * Math.atan(Math.exp(xy.y * Math.PI)) - Math.PI / 2)
        };
    }
  },

  /** @see http://en.wikipedia.org/wiki/Gall-Peters_projection */
  "gall-peters": {
    project: function(latlng) {
      return {
          x: latlng.lng / 180,
          y: Math.sin(pv.radians(latlng.lat))
        };
    },
    invert: function(xy) {
      return {
          lng: xy.x * 180,
          lat: pv.degrees(Math.asin(xy.y))
        };
    }
  },

  /** @see http://en.wikipedia.org/wiki/Sinusoidal_projection */
  sinusoidal: {
    project: function(latlng) {
      return {
          x: pv.radians(latlng.lng) * Math.cos(pv.radians(latlng.lat)) / Math.PI,
          y: latlng.lat / 90
        };
    },
    invert: function(xy) {
      return {
          lng: pv.degrees((xy.x * Math.PI) / Math.cos(xy.y * Math.PI / 2)),
          lat: xy.y * 90
        };
    }
  },

  /** @see http://en.wikipedia.org/wiki/Aitoff_projection */
  aitoff: {
    project: function(latlng) {
      var l = pv.radians(latlng.lng),
          f = pv.radians(latlng.lat),
          a = Math.acos(Math.cos(f) * Math.cos(l / 2));
      return {
          x: 2 * (a ? (Math.cos(f) * Math.sin(l / 2) * a / Math.sin(a)) : 0) / Math.PI,
          y: 2 * (a ? (Math.sin(f) * a / Math.sin(a)) : 0) / Math.PI
        };
    },
    invert: function(xy) {
      var x = xy.x * Math.PI / 2,
          y = xy.y * Math.PI / 2;
      return {
          lng: pv.degrees(x / Math.cos(y)),
          lat: pv.degrees(y)
        };
    }
  },

  /** @see http://en.wikipedia.org/wiki/Hammer_projection */
  hammer: {
    project: function(latlng) {
      var l = pv.radians(latlng.lng),
          f = pv.radians(latlng.lat),
          c = Math.sqrt(1 + Math.cos(f) * Math.cos(l / 2));
      return {
          x: 2 * Math.SQRT2 * Math.cos(f) * Math.sin(l / 2) / c / 3,
          y: Math.SQRT2 * Math.sin(f) / c / 1.5
        };
    },
    invert: function(xy) {
      var x = xy.x * 3,
          y = xy.y * 1.5,
          z = Math.sqrt(1 - x * x / 16 - y * y / 4);
      return {
          lng: pv.degrees(2 * Math.atan2(z * x, 2 * (2 * z * z - 1))),
          lat: pv.degrees(Math.asin(z * y))
        };
    }
  },

  /** The identity or "none" projection. */
  identity: {
    project: function(latlng) {
      return {
          x: latlng.lng / 180,
          y: latlng.lat / 90
        };
    },
    invert: function(xy) {
      return {
          lng: xy.x * 180,
          lat: xy.y * 90
        };
    }
  }
};
/**
 * Returns a geographic scale. The arguments to this constructor are optional,
 * and equivalent to calling {@link #projection}.
 *
 * @class Represents a geographic scale; a mapping between latitude-longitude
 * coordinates and screen pixel coordinates. By default, the domain is inferred
 * from the geographic coordinates, so that the domain fills the output range.
 *
 * <p>Note that geographic scales are two-dimensional transformations, rather
 * than the one-dimensional bidrectional mapping typical of other scales.
 * Rather than mapping (for example) between a numeric domain and a numeric
 * range, geographic scales map between two coordinate objects: {@link
 * pv.Geo.LatLng} and {@link pv.Vector}.
 *
 * @param {pv.Geo.Projection} [p] optional projection.
 * @see pv.Geo.scale#ticks
 */
pv.Geo.scale = function(p) {
  var rmin = {x: 0, y: 0}, // default range minimum
      rmax = {x: 1, y: 1}, // default range maximum
      d = [], // default domain
      j = pv.Geo.projections.identity, // domain <-> normalized range
      x = pv.Scale.linear(-1, 1).range(0, 1), // normalized <-> range
      y = pv.Scale.linear(-1, 1).range(1, 0), // normalized <-> range
      c = {lng: 0, lat: 0}, // Center Point
      lastLatLng, // cached latlng
      lastPoint; // cached point

  /** @private */
  function scale(latlng) {
    if (!lastLatLng
        || (latlng.lng != lastLatLng.lng)
        || (latlng.lat != lastLatLng.lat)) {
      lastLatLng = latlng;
      var p = project(latlng);
      lastPoint = {x: x(p.x), y: y(p.y)};
    }
    return lastPoint;
  }

  /** @private */
  function project(latlng) {
    var offset = {lng: latlng.lng - c.lng, lat: latlng.lat};
    return j.project(offset);
  }

  /** @private */
  function invert(xy) {
    var latlng = j.invert(xy);
    latlng.lng += c.lng;
    return latlng;
  }

  /** Returns the projected x-coordinate. */
  scale.x = function(latlng) {
    return scale(latlng).x;
  };

  /** Returns the projected y-coordinate. */
  scale.y = function(latlng) {
    return scale(latlng).y;
  };

  /**
   * Abstract; this is a local namespace on a given geographic scale.
   *
   * @namespace Tick functions for geographic scales. Because geographic scales
   * represent two-dimensional transformations (as opposed to one-dimensional
   * transformations typical of other scales), the tick values are similarly
   * represented as two-dimensional coordinates in the input domain, i.e.,
   * {@link pv.Geo.LatLng} objects.
   *
   * <p>Also, note that non-rectilinear projections, such as sinsuoidal and
   * aitoff, may not produce straight lines for constant longitude or constant
   * latitude. Therefore the returned array of ticks is a two-dimensional array,
   * sampling various latitudes as constant longitude, and vice versa.
   *
   * <p>The tick lines can therefore be approximated as polylines, either with
   * "linear" or "cardinal" interpolation. This is not as accurate as drawing
   * the true curve through the projection space, but is usually sufficient.
   *
   * @name pv.Geo.scale.prototype.ticks
   * @see pv.Geo.scale
   * @see pv.Geo.LatLng
   * @see pv.Line#interpolate
   */
  scale.ticks = {

    /**
     * Returns longitude ticks.
     *
     * @function
     * @param {number} [m] the desired number of ticks.
     * @returns {array} a nested array of <tt>pv.Geo.LatLng</tt> ticks.
     * @name pv.Geo.scale.prototype.ticks.prototype.lng
     */
    lng: function(m) {
      var lat, lng;
      if (d.length > 1) {
        var s = pv.Scale.linear();
        if (m == undefined) m = 10;
        lat = s.domain(d, function(d) { return d.lat; }).ticks(m);
        lng = s.domain(d, function(d) { return d.lng; }).ticks(m);
      } else {
        lat = pv.range(-80, 81, 10);
        lng = pv.range(-180, 181, 10);
      }
      return lng.map(function(lng) {
        return lat.map(function(lat) {
          return {lat: lat, lng: lng};
        });
      });
    },

    /**
     * Returns latitude ticks.
     *
     * @function
     * @param {number} [m] the desired number of ticks.
     * @returns {array} a nested array of <tt>pv.Geo.LatLng</tt> ticks.
     * @name pv.Geo.scale.prototype.ticks.prototype.lat
     */
    lat: function(m) {
      return pv.transpose(scale.ticks.lng(m));
    }
  };

  /**
   * Inverts the specified value in the output range, returning the
   * corresponding value in the input domain. This is frequently used to convert
   * the mouse location (see {@link pv.Mark#mouse}) to a value in the input
   * domain. Inversion is only supported for numeric ranges, and not colors.
   *
   * <p>Note that this method does not do any rounding or bounds checking. If
   * the input domain is discrete (e.g., an array index), the returned value
   * should be rounded. If the specified <tt>y</tt> value is outside the range,
   * the returned value may be equivalently outside the input domain.
   *
   * @function
   * @name pv.Geo.scale.prototype.invert
   * @param {number} y a value in the output range (a pixel location).
   * @returns {number} a value in the input domain.
   */
  scale.invert = function(p) {
    return invert({x: x.invert(p.x), y: y.invert(p.y)});
  };

  /**
   * Sets or gets the input domain. Note that unlike quantitative scales, the
   * domain cannot be reduced to a simple rectangle (i.e., minimum and maximum
   * values for latitude and longitude). Instead, the domain values must be
   * projected to normalized space, effectively finding the domain in normalized
   * space rather than in terms of latitude and longitude. Thus, changing the
   * projection requires recomputing the normalized domain.
   *
   * <p>This method can be invoked several ways:
   *
   * <p>1. <tt>domain(values...)</tt>
   *
   * <p>Specifying the domain as a series of {@link pv.Geo.LatLng}s is the most
   * explicit and recommended approach. However, if the domain values are
   * derived from data, you may find the second method more appropriate.
   *
   * <p>2. <tt>domain(array, f)</tt>
   *
   * <p>Rather than enumerating the domain explicitly, you can specify a single
   * argument of an array. In addition, you can specify an optional accessor
   * function to extract the domain values (as {@link pv.Geo.LatLng}s) from the
   * array. If the specified array has fewer than two elements, this scale will
   * default to the full normalized domain.
   *
   * <p>2. <tt>domain()</tt>
   *
   * <p>Invoking the <tt>domain</tt> method with no arguments returns the
   * current domain as an array.
   *
   * @function
   * @name pv.Geo.scale.prototype.domain
   * @param {...} domain... domain values.
   * @returns {pv.Geo.scale} <tt>this</tt>, or the current domain.
   */
  scale.domain = function(array, f) {
    if (arguments.length) {
      d = (array instanceof Array)
          ? ((arguments.length > 1) ? pv.map(array, f) : array)
          : Array.prototype.slice.call(arguments);
      if (d.length > 1) {
        var lngs = d.map(function(c) { return c.lng; });
        var lats = d.map(function(c) { return c.lat; });
        c = {
          lng: (pv.max(lngs) + pv.min(lngs)) / 2,
          lat: (pv.max(lats) + pv.min(lats)) / 2
        };
        var n = d.map(project); // normalized domain
        x.domain(n, function(p) { return p.x; });
        y.domain(n, function(p) { return p.y; });
      } else {
        c = {lng: 0, lat: 0};
        x.domain(-1, 1);
        y.domain(-1, 1);
      }
      lastLatLng = null; // invalidate the cache
      return this;
    }
    return d;
  };

  /**
   * Sets or gets the output range. This method can be invoked several ways:
   *
   * <p>1. <tt>range(min, max)</tt>
   *
   * <p>If two objects are specified, the arguments should be {@link pv.Vector}s
   * which specify the minimum and maximum values of the x- and y-coordinates
   * explicitly.
   *
   * <p>2. <tt>range(width, height)</tt>
   *
   * <p>If two numbers are specified, the arguments specify the maximum values
   * of the x- and y-coordinates explicitly; the minimum values are implicitly
   * zero.
   *
   * <p>3. <tt>range()</tt>
   *
   * <p>Invoking the <tt>range</tt> method with no arguments returns the current
   * range as an array of two {@link pv.Vector}s: the minimum (top-left) and
   * maximum (bottom-right) values.
   *
   * @function
   * @name pv.Geo.scale.prototype.range
   * @param {...} range... range values.
   * @returns {pv.Geo.scale} <tt>this</tt>, or the current range.
   */
  scale.range = function(min, max) {
    if (arguments.length) {
      if (typeof min == "object") {
        rmin = {x: Number(min.x), y: Number(min.y)};
        rmax = {x: Number(max.x), y: Number(max.y)};
      } else {
        rmin = {x: 0, y: 0};
        rmax = {x: Number(min), y: Number(max)};
      }
      x.range(rmin.x, rmax.x);
      y.range(rmax.y, rmin.y); // XXX flipped?
      lastLatLng = null; // invalidate the cache
      return this;
    }
    return [rmin, rmax];
  };

  /**
   * Sets or gets the projection. This method can be invoked several ways:
   *
   * <p>1. <tt>projection(string)</tt>
   *
   * <p>Specifying a string sets the projection to the given named projection in
   * {@link pv.Geo.projections}. If no such projection is found, the identity
   * projection is used.
   *
   * <p>2. <tt>projection(object)</tt>
   *
   * <p>Specifying an object sets the projection to the given custom projection,
   * which must implement the <i>forward</i> and <i>inverse</i> methods per the
   * {@link pv.Geo.Projection} interface.
   *
   * <p>3. <tt>projection()</tt>
   *
   * <p>Invoking the <tt>projection</tt> method with no arguments returns the
   * current object that defined the projection.
   *
   * @function
   * @name pv.Scale.geo.prototype.projection
   * @param {...} range... range values.
   * @returns {pv.Scale.geo} <tt>this</tt>, or the current range.
   */
  scale.projection = function(p) {
    if (arguments.length) {
      j = typeof p == "string"
          ? pv.Geo.projections[p] || pv.Geo.projections.identity
          : p;
      return this.domain(d); // recompute normalized domain
    }
    return p;
  };

  /**
   * Returns a view of this scale by the specified accessor function <tt>f</tt>.
   * Given a scale <tt>g</tt>, <tt>g.by(function(d) d.foo)</tt> is equivalent to
   * <tt>function(d) g(d.foo)</tt>. This method should be used judiciously; it
   * is typically more clear to invoke the scale directly, passing in the value
   * to be scaled.
   *
   * @function
   * @name pv.Geo.scale.prototype.by
   * @param {function} f an accessor function.
   * @returns {pv.Geo.scale} a view of this scale by the specified accessor
   * function.
   */
  
  pv.copyOwn(scale, pv.Scale.common);
  

  if (arguments.length) scale.projection(p);
  return scale;
};
