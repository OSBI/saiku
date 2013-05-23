/*!
 * Protovis MSIE/VML addon
 * Copyright (C) 2011 by DataMarket <http://datamarket.com>
 * Dual licensed under the terms of the MIT or GPL Version 2 software licenses.
 * 
 * This software includes code from jQuery, http://jquery.com/
 * jQuery is licensed under the MIT or GPL Version 2 license.
 * 
 * This software includes code from the Protovis, http://mbostock.github.com/protovis/
 * Protovis is licensed under the BSD license.
 * 
 */

// detect SVG support
pv.have_SVG = !!(
  document.createElementNS && 
  document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect 
);

// detect VML support
pv.have_VML = (function (d,a,b) {
  a = d.createElement('div');
  a.innerHTML = '<pvml:shape adj="1" />';
  b = a.firstChild;
  b.style.behavior = 'url(#default#VML)';
  return b ? typeof b.adj === 'object' : true;
})(document);

// only run if we need to
if (!pv.have_SVG && pv.have_VML){ (function(){

if (typeof Date.now !== 'function') {
  Date.now = function () { return new Date() * 1; };
}

var vml = {
  is64Bit: window.navigator.cpuClass === 'x64',
  
  round: function(n){ return Math.round((n || 0) * 21.6); },
  styles: null,

  pre: '<pvml:',
  post: ' class="msvml">',

  block: {'group':1, 'shape':1, 'shapetype':1, 'line':1,
           'polyline':1, 'curve':1, 'rect':1, 'roundrect':1,
           'oval':1, 'arc':1, 'image':1},
  caps:  {'butt':  'flat',  'round': 'round', 'square': 'square'},
  joins: {'bevel': 'bevel', 'round': 'round', 'miter':  'miter' },
  
  cursorstyles: {
    'hand': 'pointer',
    'crosshair': 1, 'pointer': 1, 'move': 1, 'text': 1,
    'wait': 1, 'help': 1, 'progress': 1,
    'n-resize': 1, 'ne-resize': 1, 'nw-resize': 1, 's-resize': 1,
    'se-resize': 1, 'sw-resize': 1, 'e-resize': 1, 'w-resize': 1
  },

  text_shim: null,
    
  // to be set in pv.Text.measure
    
  text_dims: function (text, font) {
    var shim = vml.text_shim || 
               (vml.init(), vml.text_shim);
   
    shim.style.font = vml.processFont(font);
    shim.innerText = text;
    return {
        height: shim.offsetHeight,
        width:  shim.offsetWidth
    };
  },
  
  _fontCache: {},
  
  // Substitution fonts
  _fontSubst: {
      'default':     'Arial',
      // Java Logical Fonts
      'sans-serif':  'Arial', //'Microsoft Sans Serif',
      'sansserif':   'Arial', // alias
      'sans':        'Arial', // alias
      'serif':       'Times New Roman',
      'dialog':      'Arial',
      'monospaced':  'Courier New',
      'dialoginput': 'Courier New'
  },
  
  // IE 64 bit does not do proper fall-back of unknown fonts,
  // so we decided to allow only a known subset of them.
  _fontWhiteListIE64Bit: {// Safe IE 64 bit font families
      'agency fb': 1, 'aharoni': 1, 'algerian': 1, 'andalus': 1, 'angsana new': 1, 'angsanaupc': 1, 'aparajita': 1, 'arabic typesetting': 1, 'arial': 1, 'arial black': 1, 'arial narrow': 1, 'arial rounded mt bold': 1, 'arial unicode ms': 1, 'baskerville old face': 1, 'batang': 1, 'batangche': 1, 'bauhaus 93': 1, 'bell mt': 1, 'berlin sans fb': 1, 'berlin sans fb demi': 1, 'bernard mt condensed': 1, 'blackadder itc': 1, 'bodoni mt': 1, 'bodoni mt black': 1, 'bodoni mt condensed': 1, 'bodoni mt poster compressed': 1, 'book antiqua': 1, 'bookman old style': 1, 'bookshelf symbol 7': 1, 'bradley hand itc': 1, 'britannic bold': 1, 'broadway': 1, 'browallia new': 1, 'browalliaupc': 1, 'brush script mt': 1, 'calibri': 1, 'californian fb': 1, 'calisto mt': 1, 'cambria': 1, 'cambria math': 1, 'candara': 1, 'castellar': 1, 'centaur': 1, 'century': 1, 'century gothic': 1, 'century schoolbook': 1, 'chiller': 1, 'colonna mt': 1, 'comic sans ms': 1, 'consolas': 1, 'constantia': 1, 'cooper black': 1, 'copperplate gothic bold': 1, 'copperplate gothic light': 1, 'corbel': 1, 'cordia new': 1, 'cordiaupc': 1, 'courier new': 1, 'curlz mt': 1, 'daunpenh': 1, 'david': 1, 'dfkai-sb': 1, 'dilleniaupc': 1, 'dokchampa': 1, 'dotum': 1, 'dotumche': 1, 'ebrima': 1, 'edwardian script itc': 1, 'elephant': 1, 'engravers mt': 1, 'eras bold itc': 1, 'eras demi itc': 1, 'eras light itc': 1, 'eras medium itc': 1, 'estrangelo edessa': 1, 'eucrosiaupc': 1, 'euphemia': 1, 'fangsong': 1, 'felix titling': 1, 'footlight mt light': 1, 'forte': 1, 'franklin gothic book': 1, 'franklin gothic demi': 1, 'franklin gothic demi cond': 1, 'franklin gothic heavy': 1, 'franklin gothic medium': 1, 'franklin gothic medium cond': 1, 'frankruehl': 1, 'freesiaupc': 1, 'freestyle script': 1, 'french script mt': 1, 'gabriola': 1, 'garamond': 1, 'gautami': 1, 'georgia': 1, 'gigi': 1, 'gill sans mt': 1, 'gill sans mt condensed': 1, 'gill sans mt ext condensed bold': 1, 'gill sans ultra bold': 1, 'gill sans ultra bold condensed': 1, 'gisha': 1, 'gloucester mt extra condensed': 1, 'goudy old style': 1, 'goudy stout': 1, 'gulim': 1, 'gulimche': 1, 'gungsuh': 1, 'gungsuhche': 1, 'guttman adii': 1, 'guttman adii-light': 1, 'guttman aharoni': 1, 'guttman calligraphic': 1, 'guttman david': 1, 'guttman drogolin': 1, 'guttman frank': 1, 'guttman frnew': 1, 'guttman haim': 1, 'guttman haim-condensed': 1, 'guttman hatzvi': 1, 'guttman hodes': 1, 'guttman kav': 1, 'guttman kav-light': 1, 'guttman keren': 1, 'guttman logo1': 1, 'guttman mantova': 1, 'guttman mantova-decor': 1, 'guttman miryam': 1, 'guttman myamfix': 1, 'guttman rashi': 1, 'guttman stam': 1, 'guttman stam1': 1, 'guttman vilna': 1, 'guttman yad': 1, 'guttman yad-brush': 1, 'guttman yad-light': 1, 'guttman-aharoni': 1, 'guttman-aram': 1, 'guttman-courmir': 1, 'guttman-soncino': 1, 'guttman-toledo': 1, 'haettenschweiler': 1, 'harlow solid italic': 1, 'harrington': 1, 'high tower text': 1, 'impact': 1, 'imprint mt shadow': 1, 'informal roman': 1, 'irisupc': 1, 'iskoola pota': 1, 'jasmineupc': 1, 'jokerman': 1, 'juice itc': 1, 'kaiti': 1, 'kalinga': 1, 'kartika': 1, 'khmer ui': 1, 'kodchiangupc': 1, 'kokila': 1, 'kristen itc': 1, 'kunstler script': 1, 'lao ui': 1, 'latha': 1, 'leelawadee': 1, 'levenim mt': 1, 'lilyupc': 1, 'lucida bright': 1, 'lucida calligraphy': 1, 'lucida console': 1, 'lucida fax': 1, 'lucida handwriting': 1, 'lucida sans': 1, 'lucida sans typewriter': 1, 'lucida sans unicode': 1, 'magneto': 1, 'maiandra gd': 1, 'malgun gothic': 1, 'mangal': 1, 'marlett': 1, 'matura mt script capitals': 1, 'meiryo': 1, 'meiryo ui': 1, 'microsoft himalaya': 1, 'microsoft jhenghei': 1, 'microsoft new tai lue': 1, 'microsoft phagspa': 1, 'microsoft sans serif': 1, 'microsoft tai le': 1, 'microsoft uighur': 1, 'microsoft yahei': 1, 'microsoft yi baiti': 1, 'mingliu': 1, 'mingliu-extb': 1, 'mingliu_hkscs': 1, 'mingliu_hkscs-extb': 1, 'miriam': 1, 'miriam fixed': 1, 'mistral': 1, 'modern no. 20': 1, 'mongolian baiti': 1, 'monotype corsiva': 1, 'monotype hadassah': 1, 'moolboran': 1, 'ms gothic': 1, 'ms mincho': 1, 'ms outlook': 1, 'ms pgothic': 1, 'ms pmincho': 1, 'ms reference sans serif': 1, 'ms reference specialty': 1, 'ms ui gothic': 1, 'mt extra': 1, 'mv boli': 1, 'narkisim': 1, 'niagara engraved': 1, 'niagara solid': 1, 'nsimsun': 1, 'nyala': 1, 'ocr a extended': 1, 'old english text mt': 1, 'onyx': 1, 'palace script mt': 1, 'palatino linotype': 1, 'papyrus': 1, 'parchment': 1, 'perpetua': 1, 'perpetua titling mt': 1, 'plantagenet cherokee': 1, 'playbill': 1, 'pmingliu': 1, 'pmingliu-extb': 1, 'poor richard': 1, 'pristina': 1, 'raavi': 1, 'rage italic': 1, 'ravie': 1, 'rockwell': 1, 'rockwell condensed': 1, 'rockwell extra bold': 1, 'rod': 1, 'sakkal majalla': 1, 'script mt bold': 1, 'segoe print': 1, 'segoe script': 1, 'segoe ui': 1, 'segoe ui light': 1, 'segoe ui semibold': 1, 'segoe ui symbol': 1, 'shonar bangla': 1, 'showcard gothic': 1, 'shruti': 1, 'simhei': 1, 'simplified arabic': 1, 'simplified arabic fixed': 1, 'simsun': 1, 'simsun-extb': 1, 'snap itc': 1, 'stencil': 1, 'sylfaen': 1, 'symbol': 1, 'tahoma': 1, 'tempus sans itc': 1, 'times new roman': 1, 'toptype soncino': 1, 'traditional arabic': 1, 'trebuchet ms': 1, 'tunga': 1, 'tw cen mt': 1, 'tw cen mt condensed': 1, 'tw cen mt condensed extra bold': 1, 'utsaah': 1, 'vani': 1, 'verdana': 1, 'vijaya': 1, 'viner hand itc': 1, 'vivaldi': 1, 'vladimir script': 1, 'vrinda': 1, 'webdings': 1, 'wide latin': 1, 'wingdings': 1, 'wingdings 2': 1, 'wingdings 3': 1
  },
  
  _defaultFontIE64Bit: 'Arial',
  
  processFont: function(font){
      var processedFont = vml._fontCache[font];
      if (!processedFont) {
          var shim  = vml.text_shim || (vml.init(), vml.text_shim);
          var style = shim.style;
          style.font = font;
          
          var fontFamily = style.fontFamily;
          if(fontFamily.charAt(0) === '"'){
              fontFamily = fontFamily.substr(1, fontFamily.length - 1);
          }
          
          var ffKey = fontFamily.toLowerCase();
          var substFF = vml._fontSubst[ffKey];
          if(substFF){
              fontFamily = substFF;
          } else if(vml.is64Bit && !vml._fontWhiteListIE64Bit[ffKey]) {
              fontFamily = vml._defaultFontIE64Bit;
          }
          
          style.fontFamily = '"' + fontFamily + '"';
          
          vml._fontCache[font] = processedFont = style.font;
      }
      
      return processedFont;
  },

  d2r: Math.PI * 2 / 360,  // is this used more than once?

  get_dim: function (attr, target) {
    var o = target || {};
    // reformat the most common attributes
    o.translate_x = 0;
    o.translate_y = 0;
    if (attr.transform) {
      var t = /translate\((-?\d+(?:\.\d+)?(?:e-?\d+)?)(?:,(-?\d+(?:\.\d+)?(?:e-?\d+)?))?\)/.exec(attr.transform); //support exp
      ///translate\((-?\d+(?:\.\d+)?)(?:,(-?\d+(?:\.\d+)?))?\)/.exec(attr.transform);//support negative translations
      //var t = /translate\((\d+(?:\.\d+)?)(?:,(\d+(?:\.\d+)?))?\)/.exec(attr.transform);
      if (t && t[1]) { o.translate_x = parseFloat(t[1]); }
      if (t && t[2]) { o.translate_y = parseFloat(t[2]); }
      
      var r = /rotate\((-?\d+\.\d+|-?\d+)\)/.exec(attr.transform);
      if (r) { 
          var r = parseFloat(r[1]) % 360;
          if(r < 0){
              r += 360;
          }
          
          r *= vml.d2r;
      }
      
      o.rotation = r || 0;
      
      // var scale_x = 1, scale_y = 1,
      // var s = /scale\((\d+)(?:,(\d+))?\)/i.exec(value);
      // if (s && s[1]) { scale[0] = parseInt(s[1], 10); }
      // if (s && s[2]) { scale[1] = parseInt(s[2], 10); }
    }
    o.x = parseFloat(attr.x||0);
    o.y = parseFloat(attr.y||0);
    if ('width' in attr) {
      o.width = parseFloat(attr.width);
    }
    if ('height' in attr) { 
      o.height = parseFloat(attr.height);
    }
    return o;
  },
  
  // constant
  solidFillStyle: {type: 'solid'},
  
  // helper objects that assist in the conversion of specific SVG elements into VML
  elm_defaults: {

    "g": {
      rewrite: 'span',
      attr: function (attr, style, elm, scenes, i) {
        var d = vml.get_dim(attr);
        elm.style.cssText = "position:absolute;zoom:1;" + 
                    "left:" + (d.translate_x + d.x) + "px;" + 
                    "top:"  + (d.translate_y + d.y) + "px;";
      }
    },

    "line": {
      rewrite: 'shape',
      attr: function (attr, style, elm, scenes, i) {
        var x1 = parseFloat(attr.x1 || 0),
            y1 = parseFloat(attr.y1 || 0),
            x2 = parseFloat(attr.x2 || 0),
            y2 = parseFloat(attr.y2 || 0),
            r = vml.round;
        elm.coordorigin = "0,0";
        elm.coordsize = "21600,21600";
        vml.path(elm).v = 'M '+ r(x1) + ' ' + r(y1) + ' L ' + r(x2) + ' ' + r(y2) + ' E';
        vml.stroke(elm, attr, scenes, i);
      },
      css: "top:0px;left:0px;width:1000px;height:1000px"
    },

    "rect": {
      rewrite: 'shape',
      attr: function (attr, style, elm, scenes, i) {
        var d = vml.get_dim(attr),
            p = vml.path(elm),
            r = vml.round;
        elm.coordorigin = "0,0";
        elm.coordsize = "21600,21600";
        var x = r(d.translate_x + d.x),
            y = r(d.translate_y + d.y),
            w = r(d.width),
            h = r(d.height);
        p.v = 'M ' + x       + ' ' + y       + 
             ' L ' + (x + w) + ' ' + y       + 
             ' L ' + (x + w) + ' ' + (y + h) + 
             ' L ' + x       + ' ' + (y + h) + 
             ' x';
        vml.stroke(elm, attr, scenes, i);
        vml.fill  (elm, attr, scenes, i);
      },
      css: "top:0px;left:0px;width:1000px;height:1000px"
    },

    "path": {
      rewrite: 'shape',
      attr: function (attr, style, elm, scenes, i) {
        var d  = vml.get_dim(attr),
            es = elm.style;
        
        es.visibility = "hidden";
        
        es.left = (d.translate_x + d.x) + "px";
        es.top  = (d.translate_y + d.y) + "px";
        
        elm.coordorigin = "0,0";
        elm.coordsize   = "21600,21600";
        
        elm._events = attr["pointer-events"] || 'none';
        vml.path  (elm, attr.d);
        
        var skew = vml.rotate(elm, d.rotation);
        if(skew){
            // No science. Just tried and it worked...
            skew.origin = "-0.5,-0.5";
        }
        
        vml.fill  (elm, attr, scenes, i);
        vml.stroke(elm, attr, scenes, i);
        
        es.visibility = "visible";
      },
      css: "top:0px;left:0px;width:1000px;height:1000px;"
    },

    "circle": {
      /* This version of circles is crisper but seems slower
      rewrite: 'shape',
      attr: function (attr, style, elm) {
        var d  = vml.get_dim(attr),
            r  = vml.round(parseFloat(attr.r || 0)),
            cx = parseFloat(attr.cx || 0),
            cy = parseFloat(attr.cy || 0),
            es = elm.style;
        es.left = (d.translate_x + d.x + cx + 0.3) + "px";
        es.top  = (d.translate_y + d.y + cy + 0.3) + "px";
        elm.coordorigin = "0,0";
        elm.coordsize = "21600,21600";
        vml.path(elm).v = "ar-" + r + ",-" + r + "," + r + "," + r + ",0,0,0,0x";
        vml.fill(elm, attr);
        vml.stroke(elm, attr);
      },
      css: "top:0px;left:0px;width:1000px;height:1000px"
      */
      rewrite: 'oval',
      attr: function (attr, style, elm, scenes, i) {
        var d  = vml.get_dim(attr),
            r  = parseFloat(attr.r  || 0) + 0.5,    
            cx = parseFloat(attr.cx || 0) + 0.7,
            cy = parseFloat(attr.cy || 0) + 0.7,
            es = elm.style;
        es.left   = (d.translate_x + cx - r) + "px";
        es.top    = (d.translate_y + cy - r) + "px";
        es.width  = (r * 2) + "px";
        es.height = (r * 2) + "px";
        vml.fill  (elm, attr, scenes, i);
        vml.stroke(elm, attr, scenes, i);
      }
    },

    "text": {
      rewrite: 'shape',
      attr: function (attr, style, elm, scenes, i) {
        var es = elm.style;
        
//        es.left = (d.translate_x + d.x) + "px";
//        es.top = (d.translate_y + d.y) + "px";
        
//        elm.coordorigin = "0,0";
//        elm.coordsize   = "21600,21600";
        
        // Set stroke off,
        elm.stroked = "False";
        //vml.stroke(elm, attr, scenes, i);
        
        elm.path = "m0,0 l1,0 e";
        
        var tp = vml.textpath(elm);
        tp.string = attr.string;
        //tp.trim = "True";
        var tpStyle = tp.style;
        tpStyle['v-text-align'] = attr.textAlign;
        //tpStyle['v-text-kern'] = 'True';
        tpStyle.font = attr.font;
        
        if(attr.textDecoration){
            tpStyle.textDecoration = attr.textDecoration;
        }
        
        //tpStyle.fontWeight = "normal";
        //tpStyle.fontStyle  = "normal";
        //tpStyle.xscale = "true";
        
        vml.path(elm)
           .textpathok = 'True';
        
        vml.rotate(elm, attr.rotation && -attr.rotation);
        
        var s = scenes[i];
        s.fillStyle = vml.solidFillStyle;
        vml.fill(elm, attr, scenes, i);
        s.fillStyle = null;
      },
      css: "position:absolute;top:0px;left:0px;width:1px;height:1px;"
    },

    "svg": {
      rewrite: 'span',
      css: 'position:relative;overflow:hidden;display:inline-block;' // ~display:block;
    },

    // this allows reuse of the createElement function for actual VML
    "vml:path":     {rewrite: 'path'    },
    "vml:stroke":   {rewrite: 'stroke'  },
    "vml:fill":     {rewrite: 'fill'    },
    "vml:textpath": {rewrite: 'textpath'},
    "vml:skew":     {rewrite: 'skew'    }
  },

  // cloning elements is a lot faster than creating them
  _elmcache: {
    'span': document.createElement('span'), 
    'div' : document.createElement('div' )
  },

  createElement: function (type){
    var elm,
        cache   = vml._elmcache,
        helper  = vml.elm_defaults[type] || {};
        
    var tagName = helper.rewrite || type;
    if (tagName in cache) {
      elm = cache[tagName].cloneNode(false);
    } else {
      cache[tagName] = document.createElement(vml.pre + tagName + vml.post);
      if (tagName in vml.block) {
        cache[tagName].className += ' msvml_block';
      }
      elm = cache[tagName].cloneNode(false);
    }
    
    helper.css && (elm.style.cssText = helper.css);
    return elm;
  },

  // hex values lookup table
  _hex: pv.range(0,256).map(function(i){ return pv.Format.pad("0", 2, i.toString(16)); }),
  _colorcache: {},
  color: function (value) {
    // TODO: deal with opacity here ?
    var result = vml._colorcache[value]; 
    var rgb;
    if(!result && (rgb = /^rgb\((\d+),(\d+),(\d+)\)$/i.exec(value))) {
      vml._colorcache[value] = 
          result = 
          '#' + vml._hex[rgb[1]] + vml._hex[rgb[2]] + vml._hex[rgb[3]];
    }
    
    return result || value;
  },

  fill: function (elm, attr, scenes, i) {
    var fill = elm.getElementsByTagName('fill')[0] ||
               (fill = elm.appendChild(vml.createElement('vml:fill')));
    
    var fillStyle = scenes[i].fillStyle;
    
    if (!attr.fill || !fillStyle || (fillStyle.type === 'solid' && attr.fill === 'none')) {
      fill.on = 'false';
    } else {
      fill.on = 'true';
      if(fillStyle.type === 'solid'){
          fill.type  = 'solid';
          fill.color = vml.color(attr.fill);
      } else {    
          var isLinear = fillStyle.type === 'lineargradient';
          fill.method = 'none';
          
          var stops = fillStyle.stops;
          var S = stops.length;
          if(S > 0){
              var stopsText = [];
              for (var i = 0 ; i < S ; i++) {
                  var stop = stops[i];
                  stopsText.push(stop.offset + '% ' + vml.color(stop.color.color)); // TODO: color.opacity being ignored
              }
              
              //fill.color  = vml.color(stops[0].color.color);
              //fill.color2 = vml.color(stops[S - 1].color.color);
              if(fill.colors && typeof fill.colors === 'object'){
                fill.colors.value = stopsText.join(',');
              } else {
                fill.colors = stopsText.join(',');
              }
          }
          
          if(isLinear){
              // Clockwise, Top = 0, Degrees
              fill.type = 'gradient';
              var angle = (-pv.degrees(fillStyle.angle)) % 360;
              fill.angle = angle < 0 ? (angle + 360) : angle;
          } else {
              fill.type  = 'gradientTitle';
              fill.focus = '100%';
              fill.focussize = '0 0';
              fill.focusposition = '0 0'; // not implemented yet
              fill.angle = 0;
          }
      }
      
      fill.opacity = Math.min(parseFloat(attr['fill-opacity'] || '1'), 1) || '1';
    }
  },
  
  stroke: function (elm, attr, scenes, i) {
    var stroke = elm.getElementsByTagName('stroke')[0] ||
                 (stroke = elm.appendChild(vml.createElement('vml:stroke')));
    
    if (!attr.stroke || attr.stroke === 'none') {
      stroke.on = 'false';
      stroke.weight = 0;
    } else {
        var strokeWidth = attr['stroke-width'];
        if(strokeWidth == null || strokeWidth === ''){
            strokeWidth = 1;
        } else {
            strokeWidth = +strokeWidth;
        }
        
        if(strokeWidth < 1e-10){
            strokeWidth = 0;
        } else if (strokeWidth < 1){
            strokeWidth = 1;
        }
        
        if(!strokeWidth){
            stroke.on = 'false';
            stroke.weight = 0;
        } else {
            stroke.on         = 'true';
            stroke.weight     = strokeWidth;
            stroke.color      = vml.color(attr.stroke) || 'black';
            stroke.opacity    = Math.min(parseFloat(attr['stroke-opacity'] || '1'),1) || '1';
            stroke.joinstyle  = vml.joins[attr['stroke-linejoin']] || 'miter';
            stroke.miterlimit = attr['stroke-miterlimit'] || 8;
            stroke.endcap     = vml.caps [attr['stroke-linecap']] || 'flat';
            
            var dashArray = attr["stroke-dasharray"];
            if(!dashArray || dashArray === 'none'){
                dashArray = 'Solid';
            }
            stroke.dashstyle  = dashArray;
        }
    }
  },

  path: function (elm, svgpath) {
    var p = elm.getElementsByTagName('path')[0] ||
            (p = elm.appendChild(vml.createElement('vml:path')));
    
    if (arguments.length > 1) {
      p.v = vml.rewritePath(svgpath);
    }
    
    return p;
  },

  
  skew: function (elm) {
    var sk = elm.getElementsByTagName('skew')[0] ||
             (sk = elm.appendChild(vml.createElement('vml:skew')));
    sk.on = "false";
    return sk; 
  },
  
  rotate: function(elm, r /*radians*/){
      if (r){
          r = 180 * r / Math.PI;
          r = (~~r % 360) * vml.d2r;
          if (r) {
              var ct = Math.cos(r).toFixed(8),
                  st = Math.sin(r).toFixed(8);
              
              var skew = vml.skew(elm);
              skew.on = 'true';
              skew.matrix = ct + "," + st + "," + -st + "," + ct + ",0,0";
              //elm.rotation = ~~(r / vml.d2r); // does not work
              return skew;
          }
      }
  },
  
  textpath: function (elm) {
    var tp = elm.getElementsByTagName('textpath')[0] ||
             (tp = elm.appendChild(vml.createElement('vml:textpath')));
    
    tp.style['v-text-align'] = 'center';
    tp.style['v-text-kern' ] = 'true';
    tp.on = "true";
    return tp;
  },

  init: function () {
    if (!vml.text_shim) {
      vml.text_shim = document.getElementById('pv_vml_text_shim') || document.createElement('span');
      vml.text_shim.id = 'protovisvml_text_shim';
      vml.text_shim.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline-block;white-space:nowrap;";
      document.body.appendChild(vml.text_shim);
    }
    
    if (!vml.styles) {
      vml.styles = document.getElementById('protovisvml_styles') || document.createElement("style");
      vml.styles.id = 'protovisvml_styles';
      document.documentElement.firstChild.appendChild(vml.styles);
      vml.styles.styleSheet.addRule('.msvml', 'behavior:url(#default#VML);');
      vml.styles.styleSheet.addRule('.msvml_block', 'position:absolute;top:0;left:0;');
      try {
        if (!document.namespaces.pvml) { document.namespaces.add('pvml', 'urn:schemas-microsoft-com:vml'); }
      } catch (e) {
        vml.pre  = '<';
        vml.post = ' class="msvml" xmlns="urn:schemas-microsoft.com:vml">';
      }
    }
  },

  // SVG->VML path conversion - This converts a SVG path to a VML path
  //
  // Things that are missing:
  //  - Multiple sets of coords. 
  //    Some commands (lineto,curveto,..) can take multiple sets of coords.
  //    Because Protovis always supplies the command between arguments, this isn't
  //    implemented, but it would be trivial to complete this.
  // - ARCs need solving
   _pathcache: {},
   
  rewritePath: function (p/*, deb */){
    var x = 0, y = 0, round = vml.round;

    if (!p) { return p; }
    if (p in vml._pathcache) { return vml._pathcache[p]; }

    // clean up overly detailed fractions (8.526512829121202e-148) 
    p = p.replace(/(\d*)((\.*\d*)(e ?-?\d*))/g, "$1");

    var bits = p.match(/([MLHVCSQTAZ ][^MLHVCSQTAZ ]*)/gi);
    var np = [], lastcurve = [];
    var oldOp = '';
    for (var i=0,bl=bits.length; i<bl; i++) {
      var itm  = bits[i],
          op   = itm.charAt(0),
          args = itm.substring(1).split(/[,]/);
      if(op == ' '){
        op = oldOp;
      }
      oldOp = op;
      switch (op) {

        case 'M':  // moveto (absolute)
          op = 'm';
          x = round(args[0]);
          y = round(args[1]);
          args = [x, y];
          break;
        
        case 'm':  // moveto (relative)
          op = 'm';
          x += round(args[0]);
          y += round(args[1]);
          args = [x, y];
          break;

        case "A": // TODO: arc (absolute):
          // SVG: rx ry x-axis-rotation large-arc-flag sweep-flag x y
          // VML: http://www.w3.org/TR/NOTE-VML
          /*var rx = round(args[0]), 
              ry = round(args[1]), 
              xrot = round(args[2]), 
              lrg = round(args[3]), 
              sweep = round(args[4]);*/
          op = 'l';
          args = [(x = round(args[5])),
                  (y = round(args[6]))];
          break;

        case "L": // lineTo (absolute)
          op = 'l';
          args = [(x = round(args[0])),
                  (y = round(args[1]))];
          break;
       
        case "l": // lineTo (relative)
          op = 'l';
          args = [(x = x + round(args[0])),
                  (y = y + round(args[1]))];
          break;

        case "H": // horizontal lineto (absolute)
          op = 'l';
          args = [(x = round(args[0])), y];
          break;
       
        case "h": // horizontal lineto (relative)
          op = 'l';
          args = [(x = x + round(args[0])), y];
          break;

        case "V": // vertical lineto (absolute)
          op = 'l';
          args = [x, (y = round(args[0]))];
          break;
        
        case "v": // vertical lineto (relative)
          op = 'l';
          args = [x, (y = y + round(args[0]))];
          break;

        case "C": // curveto (absolute)
          op = 'c';
          lastcurve = args = [
            round(args[0]), round(args[1]),
            round(args[2]), round(args[3]),
            (x = round(args[4])),
            (y = round(args[5]))
          ];
          break;
        
        case "c": // curveto (relative)
          op = 'c';
          lastcurve = args = [
            x + round(args[0]),
            y + round(args[1]),
            x + round(args[2]),
            y + round(args[3]),
            (x = x + round(args[4])),
            (y = y + round(args[5]))
          ];
          break;

        case "S": // shorthand/smooth curveto (absolute)
          op = 'c';
          lastcurve = args = [
            lastcurve[4] + (lastcurve[4] - lastcurve[2]),
            lastcurve[5] + (lastcurve[5] - lastcurve[3]),
            round(args[0]),
            round(args[1]),
            (x = round(args[2])),
            (y = round(args[3]))
          ];
          break;
        
        case "s":  // shorthand/smooth curveto (relative)
          op = 'c';
          lastcurve = args = [
            lastcurve[4] + (lastcurve[4] - lastcurve[2]),
            lastcurve[5] + (lastcurve[5] - lastcurve[3]),
            x + round(args[0]),
            y + round(args[1]),
            (x = x + round(args[2])),
            (y = y + round(args[3]))
          ];
          break;

        case "Q": // quadratic Bezier curveto (absolute)
          op = 'c';
          var x1 = round(args[0]),
              y1 = round(args[1]),
              x2 = round(args[2]),
              y2 = round(args[3]);
          args = [
            ~~(x + (x1 - x) * 2 / 3),
            ~~(y + (y1 - y) * 2 / 3),
            ~~(x1 + (x2 - x1) / 3),
            ~~(y1 + (y2 - y1) / 3),
            (x = x2),
            (y = y2)
          ];
          break;
        
        case "q": // TODO: quadratic Bezier (relative)
          op = 'l';
          x += round(args[2]);
          y += round(args[3]);
          args = [x, y];
          break;

        // TODO: T/t (Shorthand/smooth quadratic Bezier curveto)

        case "Z":
        case "z":
          op = 'xe';
          args = [];
          break;
        
        default:
          // unsupported path command
          op = '';
          args = [];
      }
      np.push(op, args.join(','));
    }
    return (vml._pathcache[p] = (np.join('') + 'e'));
  }
}; // end vml object

pv.Text.measure = vml.text_dims;

// external access to vml functions
pv.Vml = vml;

pv.VmlScene = {
  // The pre-multipled scale, based on any enclosing transforms.
  scale: 1,

  // The set of supported events.
  events: [
    "mousewheel",
    "mousedown",
    "mouseup",
    "mouseover",
    "mouseout",
    "mousemove",
    "click",
    "dblclick"
  ],

  // implicit values are not used for VML, assigned render faster and we have
  // no desire to keep the DOM clean here - only to make it work!
  implicit: {css: {}},

  copy_functions: function (obj) {
    for (var name in obj) {
      if (typeof obj[name] === 'function' && !(name in pv.VmlScene)) {
        pv.VmlScene[name] = obj[name];
      }
    }
  }
};

// copy helper methods from SvgScene onto our new Scene
pv.VmlScene.copy_functions(pv.SvgScene);
pv.Scene = pv.VmlScene;
pv.renderer = function() { return 'vml'; };

(function(is64bit){
    // experimental minimum visible, with perceptible color, values
    
    pv.VmlScene.minRuleLineWidth = is64bit ? 1.2 : 1.1;
    pv.VmlScene.minBarWidth      = is64bit ? 2.2 : 1.8;
    pv.VmlScene.minBarHeight     = is64bit ? 2.2 : 1.8;
    pv.VmlScene.minBarLineWidth  = is64bit ? 1.2 : 1.0;
}(vml.is64Bit));

pv.VmlScene.expect = function (e, type, scenes, i, attr, style) {
  style = style || {};
  
  var helper = vml.elm_defaults[type] || {}, 
      _type = helper.rewrite || type;

  if (e) {
    if (e.tagName.toUpperCase() !== _type.toUpperCase()) {
      var n = vml.createElement(type);
      e.parentNode.replaceChild(n, e);
      e = n;
    }
  } else {
    e = vml.createElement(type);
  }
  
  if(attr){
      if ('attr' in helper) {
        helper.attr(attr, style, e, scenes, i);
      }
      
      if (attr.cursor in vml.cursorstyles) {
        var curs = vml.cursorstyles[attr.cursor];
        style.cursor = (curs === 1) ? attr.cursor : curs;
      }
  }
  
  if(style) {
    this.setStyle(e, style);
  }
  
  return e;
};

pv.VmlScene.removeSiblings = function(e) {
  while (e) {
    var n = e.nextSibling;
    e.parentNode.removeChild(e);
    e = n;
  }
};

pv.VmlScene.addFillStyleDefinition = function(/*scenes, fill*/){};

// Done differently
pv.VmlScene.setAttributes = function(/*e, attributes*/) {};

pv.VmlScene.setStyle = function(e, style) {
    var prevStyle = e.__style__;
    if(prevStyle === style) { prevStyle = null; }
    
    var eStyle = e.style;
    for (var name in style) {
        var value = style[name];
        if(!prevStyle || (value !== prevStyle[name])) {
            if (value == null) {
                eStyle.removeAttribute(name);   // cssText 
            } else { 
                eStyle[name] = value;
            }
        }
    }
    
    e.__style__ = style;
};

pv.VmlScene.append = function(e, scenes, index) {
  // FIXME: hooks the scene onto the element --- this is probably hemorrhaging memory in MSIE
  // it is only ever used by the envent dispatcher so it should probably be stored in a cache
  e.$scene = {scenes: scenes, index: index};
  
  // attach a title to element
  e = this.title(e, scenes[index]);
  if (!e.parentNode || e.parentNode.nodeType === 11) {  // 11 == documentFragment
    scenes.$g.appendChild(e);
  }
  
  return e.nextSibling;
};

pv.VmlScene.title = function(e, s) {
  e.title = s.title || "";
  return e;
};

// mostly the same code as pv.SvgScene.panel, but with less MSIE crashing...
pv.VmlScene.panel = function(scenes){
  var g = scenes.$g, 
      e = g && g.firstChild;
  
  var inited = false;
  for (var i = 0, L = scenes.length; i < L; i++) {
    var s = scenes[i];

    /* visible */
    if (!s.visible) continue;

    /* top level element */
    if (!scenes.parent) {
      var canvas = s.canvas;
      with(canvas.style){
          display = "inline-block";
          zoom    = 1;
      }
      
      if (g && (g.parentNode !== canvas)) {
        g = canvas.firstChild;
        e = g && g.firstChild;
      }
      
      if(!g) {
        inited = true;
        vml.init(); // turn VML on if it isn't already
        
        g = canvas.appendChild(vml.createElement("svg"));
        
        // Prevent selecting VML elements when dragging
        g.unselectable  = 'on';
        g.onselectstart = function(){ return false; };
        
        var events   = this.events;
        var dispatch = this.dispatch;
        for (var j = 0, E = events.length; j < E; j++) {
          g.addEventListener
              ? g.addEventListener(events[j], dispatch, false)
              : g.attachEvent("on" + events[j], dispatch);
        }
        
        e = g.firstChild;
      }
      
      scenes.$g = g;
      
      var w = (s.width  + s.left + s.right ),
          h = (s.height + s.top  + s.bottom);
      
      with(g.style){
          width  = w + 'px';
          height = h + 'px';
          clip   = "rect(0px " + w + "px " + h + "px 0px)";
      }
    } // end if top level element
    
    /* clip (nest children) */
    var c;
    if (s.overflow === "hidden") {
      c = this.expect(e, "g", scenes, i);
      c.style.position = "absolute";
      c.style.clip = "rect(" + 
                  s.top.toFixed(2) + "px " + 
                  (s.left + s.width).toFixed(2) + "px " + 
                  (s.top + s.height).toFixed(2) + "px " + 
                  s.left.toFixed(2) + "px)";
      
      if (!c.parentNode) { 
          g.appendChild(c); 
      }
      
      scenes.$g = g = c;
      e = c.firstChild;
    }
    
    /* fill */
    e = this.fill(e, scenes, i);
    
    /* transform (push) */
    var k = this.scale,
        t = s.transform,
        x = s.left + t.x,
        y = s.top + t.y;
      
    this.scale *= t.k;
    
    /* children */
    if(s.children.length){
        var attrs = {
            "transform": "translate(" + x + "," + y + ")" +
                         (t.k != 1 ? " scale(" + t.k + ")" : "")
        };
        
        this.eachChild(scenes, i, function(child){
          child.$g = e = this.expect(e, "g", scenes, i, attrs);
          
          this.updateAll(child);
        
          var parentNode = e.parentNode;
          if (!parentNode || parentNode.nodeType === 11) {
            g.appendChild(e);
            var helper = vml.elm_defaults[e.svgtype];
            if (helper && typeof helper.onappend === 'function') {
              helper.onappend(e, scenes[i]);
            }
          }
            
          e = e.nextSibling;
        }); // end eachChild
    }
    
    /* transform (pop) */
    this.scale = k;
    
    /* stroke */
    e = this.stroke(e, scenes, i);
    
    /* clip (restore group) */
    if (c) {
      scenes.$g = g = c.parentNode;
      e = c.nextSibling;
    }
  } // end for panel instance
  
  if(inited){
    this.removeSiblings(e);
    
    // IE doesn't immediately render the last VML element???
    // Only a re-render forces it to show (like when dragging with the rubber band) 
    // Adding a dummy last element in the VML DOM solves the issue.
    e = g.appendChild(vml.createElement("oval"));
  }
  
  return e;
};

pv.VmlScene.parseDasharray = function(s){
    var dashArray = s.strokeDasharray;
    
    if(dashArray && dashArray !== 'none'){
        var standardDashArray = this.translateDashStyleAlias(dashArray);
        if(this.isStandardDashStyle(standardDashArray)){
            dashArray = standardDashArray;
        } else {
            // Dashes with numbers work very badly on IE,
            //  many times disrespecting the user request.
            // My guess is that it is trying to approximate
            //  the requested pattern to one of the standard patterns...
            
            // IE already receives line width relative measures
            dashArray = 
                dashArray
                    .split(/[\s,]+/)
                    .map(function(num){ return (+num) / this.scale; }, this);
            
            if(dashArray.length % 2){
                dashArray = dashArray.concat(dashArray);
            }
            dashArray = dashArray.join(' ');
        }
    } else {
        dashArray = null;
    }
    
    return dashArray;
};

pv.VmlScene.create = function(type){
    return vml.createElement(type);
};

// Much of the event rewriting code is copyed and watered down
// from the jQuery library's event hander. We have the luxury
// of knowing that we're on MSIE<9 so we can despense with some
// fixes for other browsers.
(function(){
    
  var returnTrue  = function () { return true;  };
  var returnFalse = function () { return false; };
  var _event_props = ["altKey","attrChange","attrName","bubbles","button",
                      "cancelable","charCode","clientX","clientY","ctrlKey",
                      "currentTarget","data","detail","eventPhase","fromElement",
                      "handler","keyCode","layerX","layerY","metaKey",
                      "newValue","offsetX","offsetY","pageX","pageY","prevValue",
                      "relatedNode","relatedTarget","screenX","screenY",
                      "shiftKey","srcElement","target","toElement","view","wheelDelta","which"];
  var _evPropCount = _event_props.length;
  
  function IEvent (src) {
    if (src && src.type) {
      this.originalEvent = src;
      this.type = src.type;
      this.isDefaultPrevented = returnFalse;
      if (src.defaultPrevented || src.returnValue === false || src.getPreventDefault && src.getPreventDefault()) {
        this.isDefaultPrevented = returnTrue;
      }
      this.timeStamp = src.timeStamp || Date.now();
    } else {
      this.type = src;
      this.timeStamp = Date.now();
    }
  }
  
  IEvent.prototype = {
    preventDefault: function() {
      this.isDefaultPrevented = returnTrue;
      var e = this.originalEvent;
      if (!e) { 
          return; 
      }
      
      // if preventDefault exists run it on the original event
      if (e.preventDefault){
        e.preventDefault();
        // otherwise set the returnValue property of the original event to false (IE)
      } else {
        e.returnValue = false;
      }
    },
    
    stopPropagation: function() {
      this.isPropagationStopped = returnTrue;

      var e = this.originalEvent;
      if (!e) {
        return;
      }
      
      // if stopPropagation exists run it on the original event
      if(e.stopPropagation) {
        e.stopPropagation();
      }
      
      // otherwise set the cancelBubble property of the original event to true (IE)
      e.cancelBubble = true;
    },
    
    stopImmediatePropagation: function() {
      this.isImmediatePropagationStopped = returnTrue;
      this.stopPropagation();
    },
    isDefaultPrevented: returnFalse,
    isPropagationStopped: returnFalse,
    isImmediatePropagationStopped: returnFalse
  };
  
  var SCROLL_NODE = (document.compatMode && document.compatMode != "BackCompat") ? 'documentElement' : 'body';
  
  vml.fixEvent = function(ev){
    // store a copy of the original event object
    // and "clone" to set read-only properties
    var originalEvent = ev;
    
    ev = new IEvent(originalEvent);
    
    var type = ev.type;
    var isKey = type === 'keypress';
    
    for (var i = _evPropCount ; i ;) {
      var prop = _event_props[--i];
      ev[prop] = originalEvent[prop];
    }
    
    // Fix target property, if necessary
    var target = ev.target;
    if (!target) {
        target = ev.srcElement || document;
        
        // Target should not be a text node (#504, Safari)
        if (target.nodeType === 3) {
            target = target.parentNode;
        }
        
        ev.target = target; 
    }

    // Add relatedTarget, if necessary
    var fromElem;
    if (!ev.relatedTarget && (fromElem = ev.fromElement)) {
      ev.relatedTarget = (fromElem === target) ? ev.toElement : fromElem;
    }
    
    // Calculate pageX/Y if missing and clientX/Y available
    if(!isKey){
        var clientX;
        if (ev.pageX == null && (clientX = ev.clientX) != null) {
          var scrollNode = document[SCROLL_NODE];
          
          ev.pageX =    clientX + (scrollNode.scrollLeft || 0) - (scrollNode.clientLeft || 0);
          ev.pageY = ev.clientY + (scrollNode.scrollTop  || 0) - (scrollNode.clientTop  || 0);
        }
    }
    
    if (ev.which == null) {
        var charCode, keyCode, btn;
        if(!isKey){
            // Add which for mouse events
            if((btn = ev.button) !== null){
                // Add which for click: 1 === left; 2 === middle; 3 === right
                // Note: button is not normalized, so don't use it
                ev.which = (btn & 1 ? 1 : (btn & 2 ? 3 : (btn & 4 ? 2 : 0)));
            }
        } else {
            // Add which for key events
            if((charCode = ev.charCode) != null){
                ev.which = charCode;
            } else if((keyCode = ev.keyCode) != null){
                ev.which = keyCode;
            }  
        }
    }

    // For mouse/key events, metaKey==false if it's undefined
    ev.metaKey = !!ev.metaKey;

    // Mousewheel delta
    if (type === "mousewheel") {
      ev.wheel = ev.wheelDelta;
    }

    return ev;
  };

})();

pv.fixEvent = function(ev){
  return vml.fixEvent(ev || window.event);
};

pv.VmlScene.dispatch = pv.listener(function(e){
  var t = e.target.$scene;
  if (t){
    var events = e.target._events;
    if(events === 'none' ||
       pv.Mark.dispatch(e.type, t.scenes, t.index, e)){
      e.preventDefault();
      e.stopPropagation();
    }
  }
});

pv.VmlScene.image = function(scenes) {
  var e = scenes.$g.firstChild;
  for (var i = 0; i < scenes.length; i++) {
    var s = scenes[i];

    /* visible */
    if (!s.visible) continue;

    /* fill */
    e = this.fill(e, scenes, i);

    /* image */
    if (s.image) {
      // There is no canvas support in MSIE
    } else {
      e = new Image();
      e.src = s.url;
      var st = e.style;
      st.position = 'absolute';
      st.top = s.top;
      st.left = s.left;
      st.width = s.width;
      st.height = s.height;
      st.cursor = s.cursor;
      st.msInterpolationMode = 'bicubic';
    }
    
    e = this.append(e, scenes, i);

    /* stroke */
    e = this.stroke(e, scenes, i);
  }
  return e;
};

pv.VmlScene.label = function(scenes) {
  var e = scenes.$g.firstChild;
  for (var i = 0; i < scenes.length; i++) {
    var s = scenes[i];

    // visible
    if (!s.visible) continue;
    
    var fill = s.textStyle;
    if (!fill.opacity || !s.text) continue;

    // measure text
    var txt   = s.text.replace(/\s+/g, '\xA0');
    var font  = vml.processFont(s.font);
    var label = vml.text_dims(txt, font);

    // dx, dy are the coordinates of the middle-left point
    // of the label's bounding-box.
    //
    // +--> xx
    // |
    // v yy
    
    var dx = 0;
    var dy = 0;
    switch(s.textBaseline){
        case 'middle':
            dy  = (.1 * label.height); // slight middle baseline correction
            break;
            
        case 'top':
            dy  = s.textMargin + .5 * label.height;
            break;
            
        case 'bottom':
            dy  = -(s.textMargin + .5 * label.height);
            break;
    }

    // Text alignment is already handled by VML's textPath "v-text-align" style attribute
    // So, only the text margin must be explicitly handled.
    switch(s.textAlign){
        case 'left':
            dx  = s.textMargin;
            break;
            
        case 'right':
            dx  = -s.textMargin;
            break;
    }
 
    // VML already handles rotation relative to the elements position.
    // Only need to rotate the position.
    var a = s.textAngle;
    if(a){
        var ct = Math.cos(a);
        var st = Math.sin(a);

        var dx2 = dx*ct - dy*st;
        var dy2 = dx*st + dy*ct;
        dx = dx2;
        dy = dy2;
    }

    var left = s.left + dx;
    var top  = s.top  + dy;
    
    // ---------------
    
    var attr = {};
    if(s.cursor) { 
        attr.cursor = s.cursor; 
    }
    
    attr.fill = vml.color(fill.color) || "black";
    
    if(vml.is64Bit){
        // The text is overly black/bold
        attr['fill-opacity'] = 0.7;
    }
    
    attr.x = left;
    attr.y = top;
    attr.rotation = s.textAngle;
    attr.string = txt;
    attr.textAlign = s.textAlign;
    attr.font = font;
    attr.textDecoration = s.textDecoration;
    
    e = this.expect(e, "text", scenes, i, attr, {    
      'display':    'block',
      'lineHeight': 1,
      'whiteSpace': 'nowrap',
      'zoom':       1,
      'position':   'absolute',
      'cursor':     'default',
      'top':        top  + 'px',
      'left':       left + 'px'
    });

    e = this.append(e, scenes, i);
  }
  return e;
};

pv.VmlScene.wedge = function(scenes) {
  var e = scenes.$g.firstChild,
      round = vml.round;
  for (var i = 0; i < scenes.length; i++) {
    var s = scenes[i];

    // visible
    if (!s.visible) continue;
    var fill = s.fillStyle, stroke = s.strokeStyle;
    if (!fill.opacity && !stroke.opacity) continue;

    // create element sans path
    e = this.expect(e, "path", scenes, i, {
      "pointer-events": s.events,
      "cursor": s.cursor,
      "transform": "translate(" + s.left + "," + s.top + ")",
      "d": '', // we deal with the path afterwards
      "fill": fill.color,
      "fill-rule": "evenodd",
      "fill-opacity": fill.opacity || null,
      "stroke": stroke.color,
      "stroke-opacity": stroke.opacity || null,
      "stroke-width":   stroke.opacity ? s.lineWidth / this.scale : null,
      "stroke-linecap":    s.lineCap,
      "stroke-linejoin":   s.lineJoin,
      "stroke-miterlimit": s.strokeMiterLimit,
      "stroke-dasharray":  stroke.opacity ? this.parseDasharray(s) : null
    });
    
    // add path
    var p = e.getElementsByTagName('path')[0];
    if (!p) {
      p = vml.make('path');
      e.appendChild(p);
    }

    // Arc path from bigfix/protovis
    var r1 = round(s.innerRadius),
        r2 = round(s.outerRadius),
        d;
    if (s.angle >= 2 * Math.PI) {
      if (r1) {
        d = "AE0,0 " + r2 + "," + r2 + " 0 23592960"
          + "AL0,0 " + r1 + "," + r1 + " 0 23592960";
      } else {
        d = "AE0,0 " + r2 + "," + r2 + " 0 23592960";
      }
    } else {
      var sa = Math.round(s.startAngle / Math.PI * 11796480),
           a = Math.round(s.angle / Math.PI * 11796480);
      if (r1) {
        d = "AE 0,0 " + r2 + "," + r2 + " " + -sa + " " + -a
          + " 0,0 " + r1 + "," + r1 + " " + -(sa + a) + " " + a
          + "X";
      } else {
        d = "M0,0"
          + "AE0,0 " + r2 + "," + r2 + " " + -sa + " " + -a
          + "X";
      }
    }
    p.v = d;

    e = this.append(e, scenes, i);
  }
  
  return e;
};

// end VML override
})();}
