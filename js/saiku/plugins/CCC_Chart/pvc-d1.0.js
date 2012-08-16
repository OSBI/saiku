//VERSION TRUNK-20120804


// ECMAScript 5 shim
if(!Object.keys) {
    Object.keys = function(o){
        if (o !== Object(o)){
            throw new TypeError('Object.keys called on non-object');
        }

        var ret = [];
        for(var p in o){
            if(Object.prototype.hasOwnProperty.call(o,p)){
                ret.push(p);
            }
        }
        
        return ret;
    };
}

/**
 * Implements filter property if not implemented yet
 */
if (!Array.prototype.filter){
    Array.prototype.filter = function(fun, ctx){
        var len = this.length >>> 0;
        if (typeof fun != "function"){
            throw new TypeError();
        }
        
        var res = [];
        for (var i = 0; i < len; i++){
            if (i in this){
                var val = this[i]; // in case fun mutates this
                if (fun.call(ctx, val, i, this))
                    res.push(val);
            }
        }

        return res;
    };
}

if(!Object.create){
    Object.create = (function(){

        function dummyKlass(){}
        var dummyProto = dummyKlass.prototype;

        function create(baseProto){
            dummyKlass.prototype = baseProto || {};
            var instance = new dummyKlass();
            dummyKlass.prototype = dummyProto;
            return instance;
        }

        return create;
    }());
}

// Basic JSON shim
if(!this.JSON){
    this.JSON = {};
}
if(!this.JSON.stringify){
    this.JSON.stringify = function(t){
        return '' + t;
    };
}

// ----------------------------

var pvc = {
    debug: false
};

// Begin private scope
(function(){

// goldenRatio proportion
// ~61.8% ~ 38.2%
pvc.goldenRatio = (1 + Math.sqrt(5)) / 2;

var arraySlice = pvc.arraySlice = Array.prototype.slice;

/**
 *  Utility function for logging messages to the console
 */
pvc.log = function(m){

    if (pvc.debug && typeof console != "undefined"){
        console.log("[pvChart]: " + m);
    }
};

pvc.logError = function(m){
    if (typeof console != "undefined"){
        console.log("[pvChart ERROR]: " + m);
    } else {
        throw new Error("[pvChart ERROR]: " + m);
    }
};

pvc.fail = function(failedMessage){
    throw new Error(failedMessage);
};

/**
 * Evaluates x if it's a function or returns the value otherwise
 */
pvc.ev = function(x){
    return typeof x == "function" ? x(): x;
};

/**
 * Sums two numbers.
 * 
 * If v1 is null or undefined, v2 is returned.
 * If v2 is null or undefined, v1 is returned.
 * Else the sum of the two is returned.
 */
pvc.sum = function(v1, v2){
    return v1 == null ? 
            v2 :
            (v1 == null ? v1 : (v1 + v2));
};

pvc.nonEmpty = function(d){
    return d != null;
};

pvc.get = function(o, p, dv){
    var v;
    return o && (v = o[p]) != null ? v : dv; 
};

pvc.scope = function(scopeFun, ctx){
    return scopeFun.call(ctx);
};

function asNativeObject(v){
        return v && typeof(v) === 'object' && v.constructor === Object ?
                v :
                undefined;
}

function asObject(v){
    return v && typeof(v) === 'object' ? v : undefined;
}

pvc.mixin = pvc.scope(function(){

    function pvcMixinRecursive(instance, mixin){
        for(var p in mixin){
            var vMixin = mixin[p];
            if(vMixin !== undefined){
                var oMixin,
                    oTo = asNativeObject(instance[p]);
                
                if(oTo){
                    oMixin = asObject(vMixin);
                    if(oMixin){
                        pvcMixinRecursive(oTo, oMixin);
                    }
                } else {
                    oMixin = asNativeObject(vMixin);
                    if(oMixin){
                        vMixin = Object.create(oMixin);
                    }
                    
                    instance[p] = vMixin;
                }
            }
        }
    }

    function pvcMixin(instance/*mixin1, mixin2, ...*/){
        for(var i = 1, L = arguments.length ; i < L ; i++){
            var mixin = arguments[i];
            if(mixin){
                mixin = asObject(mixin.prototype || mixin);
                if(mixin){
                    pvcMixinRecursive(instance, mixin);
                }
            }
        }

        return instance;
    }

    return pvcMixin;
});

// Creates an object whose prototype is the specified object.
pvc.create = pvc.scope(function(){

    function pvcCreateRecursive(instance){
        for(var p in instance){
            var vObj = asNativeObject(instance[p]);
            if(vObj){
                pvcCreateRecursive( (instance[p] = Object.create(vObj)) );
            }
        }
    }
    
    function pvcCreate(/* [deep, ] baseProto, mixin1, mixin2, ...*/){
        var mixins = arraySlice.call(arguments),
            deep = true,
            baseProto = mixins.shift();
        
        if(typeof(baseProto) === 'boolean'){
            deep = baseProto;
            baseProto = mixins.shift();
        }
        
        var instance = Object.create(baseProto);
        if(deep){
            pvcCreateRecursive(instance);
        }

        // NOTE: 
        if(mixins.length > 0){
            mixins.unshift(instance);
            pvc.mixin.apply(pvc, mixins);
        }

        return instance;
    }

    return pvcCreate;
});

pvc.define = pvc.scope(function(){

    function setBase(base){
        var proto = this.prototype = Object.create(base.prototype);
        proto.constructor = this;
        return this;
    }

    function mixin(/*mixin1, mixin2, ...*/){
        pvc.mixin.apply(pvc, pvc.arrayAppend([this.prototype], arguments));
        return this;
    }

    function defineIn(name, what){
        var namespace,
            parts = name.split('.');
        
        if(parts.length > 1){
            name = parts.pop();
            namespace = parts.join('.');
        }

        getNamespace(namespace)[name] = what;
    }

    return function(name, klass, base){
        klass.extend = mixin;
        klass.mixin  = mixin;

        if(base){
            setBase.call(klass, base);
        }
        klass.base = base || null;

        if(name){
            defineIn(name, klass);
            klass.name = name;
        }

        return klass;
    };
});

var global = this,
    namespaceStack = [],
    currentNamespace = global;

function getNamespace(name, base){
    var current = base || currentNamespace;
    if(name){
        var parts = name.split('.');
        for(var i = 0; i < parts.length ; i++){
            var part = parts[i];
            current = current[part] || (current[part] = {});
        }
    }

    return current;
}

pvc.namespace = function(name, definition){
    var namespace = getNamespace(name);
    if(definition){
        namespaceStack.push(currentNamespace);
        try{
            definition(namespace);
        } finally {
            currentNamespace = namespaceStack.pop();
        }
    }
    
    return namespace;
};

pvc.number = function(d, dv){
    var v = parseFloat(d);
    return isNaN(v) ? (dv || 0) : v;
};

// null or undefined to 'dv''
pvc.nullTo = function(v, dv){
    return v != null ? v : dv;
};

pvc.padMatrixWithZeros = function(d){
    return d.map(function(v){
        return v.map(function(a){
            return typeof a == "undefined"?0:a;
        });
    });
};

pvc.padArrayWithZeros = function(a){
    return a.map(function(d){
        return d == null ? 0 : d;
    });
};

pvc.cloneMatrix = function(m){
    return m.map(function(d){
        return d.slice();
    });
};

/**
 * ex.: arrayStartsWith(['EMEA','UK','London'], ['EMEA']) -> true
 *      arrayStartsWith(a, a) -> true
 **/
pvc.arrayStartsWith = function(array, base){
    if(array.length < base.length) { 
        return false;
    }

    for(var i = 0; i < base.length ; i++){
        if(base[i] != array[i]) {
            return false;
        }
    }

    return true;
};

/**
 * Joins arguments other than null, undefined and ""
 * using the specified separator and their string representation.
 */
pvc.join = function(sep){
    var args = [],
        a = arguments;
    for(var i = 1, L = a.length ; i < L ; i++){
        var v = a[i];
        if(v != null && v !== ""){
            args.push("" + v);
        }
    }

    return args.join(sep);
};

/**
 * Calls function <i>fun</i> with context <i>ctx</i>
 * for every own property of <i>o</i>.
 * Function <i>fun</i> is called with arguments:
 * value, property, object.
 */
pvc.forEachOwn = function(o, fun, ctx){
    if(o){
        for(var p in o){
            if(o.hasOwnProperty(p)){
                fun.call(ctx, o[p], p, o);
            }
        }
    }
};

pvc.mergeOwn = function(to, from){
    pvc.forEachOwn(from, function(v, p){
        to[p] = v;
    });
    return to;
};
/*
function merge(to, from){
    if(!to) {
        to = {};
    }

    if(from){
        for(var p in from){
            var vFrom = from[p];
            if(vFrom !== undefined){
                var oFrom = asObject(vFrom),
                    vTo   = to[p];

                if(oFrom){
                    vTo = merge(asObject(vTo), oFrom);
                } else if(vFrom !== undefined) {
                    vTo = vFrom;
                }

                to[p] = vTo;
            }
        }
    }

    return to;
}

pvc.merge = merge;
*/
// For treating an object as dictionary
// without danger of hasOwnProperty having been overriden.
var objectHasOwn = Object.prototype.hasOwnProperty;
pvc.hasOwn = function(o, p){
    return !!o && objectHasOwn.call(o, p);
};

pvc.mergeDefaults = function(to, defaults, from){
    pvc.forEachOwn(defaults, function(dv, p){
        var v;
        to[p] = (from && (v = from[p]) !== undefined) ? v : dv;
    });
    
    return to;
};


/*
pvc.forEachRange = function(min, max, fun, ctx){
    for(var i = min ; i < max ; i++){
        fun.call(ctx, i);
    }
};

pvc.arrayInsertMany = function(target, index, source){
    // TODO: is there a better way: without copying source?
    target.splice.apply(target, [index, 0].concat(other));
    return target;
};
*/

pvc.arrayAppend = function(target, source, start){
    if(start == null){
        start = 0;
    }

    for(var i = 0, L = source.length, T = target.length ; i < L ; i++){
        target[T + i] = source[start + i];
    }
    return target;
};


// Adapted from pv.range
pvc.Range = function(start, stop, step){
    if (arguments.length == 1) {
        stop  = start;
        start = 0;
    }
  
    if (step == null) {
        step = 1;
    }
    
    if ((stop - start) / step == Infinity) {
        throw new Error("range must be finite");
    }
  
    this.stop  = stop;//-= (stop - start) * 1e-10; // floating point precision!
    this.start = start;
    this.step  = step;
};

pvc.Range.prototype.forEach = function(fun, ctx){
    var i = 0, j;
    if (this.step < 0) {
        while((j = this.start + this.step * i++) > this.stop) {
            fun.call(ctx, j);
        }
    } else {
        while((j = this.start + this.step * i++) < this.stop) {
            fun.call(ctx, j);
        }
    }
};

pvc.Range.prototype.map = function(fun, ctx){
    var result = [];
    
    this.forEach(function(j){
        result.push(fun.call(ctx, j));
    });
    
    return result;
};

/**
 * Equals for two arrays
 * func - needed if not flat array of comparables
 **/
pvc.arrayEquals = function(array1, array2, func){
  if(array1 == null){return array2 == null;}
  
  var useFunc = typeof(func) == 'function';
  
  for(var i=0;i<array1.length;i++)
  {
    if(useFunc){
        if(!func(array1[i],array2[i])){
            return false;
        }
    }
    else if(array1[i]!=array2[i]){
        return false;   
    }
  }
  return true;
};

/**
 * Converts something to an array if it is not one already
 *  an if it is not equal (==) to null.
*/
pvc.toArray = function(thing){
    return (thing instanceof Array) ? thing : ((thing != null) ? [thing] : null);
};


/**
 * Creates an array of the specified length,
 * and, optionally, initializes it with the specified default value.
*/
pvc.newArray = function(len, dv){
    var a = new Array(len);
    if(dv !== undefined){
        for(var i = 0 ; i < len ; i++){
            a[i] = dv;
        }
    }
    return a;
};

/**
 * Creates a color scheme based on the specified colors.
 * The default color scheme is "pv.Colors.category10", 
 * and is returned when null or an empty array is specified.
*/

// variable to represent a default color scheme
//   (Added by CvK  febr. 2012)
pvc.defaultColorScheme = null;

pvc.createColorScheme = function(colors){
    if (colors == null || colors.length == 0){
        var cs = (pvc.defaultColorScheme === null) ?
            pv.Colors.category10 :pvc.defaultColorScheme;
        return cs;
    }

    colors = pvc.toArray(colors);

    return function() {
        var scale = pv.colors(colors); // creates a color scale with a defined range
        scale.domain.apply(scale, arguments); // defines the domain of the color scale
        return scale;
    };
};

/****
 * Install a default colorscheme. The parameter should be an array containing
 * approximately 10 colors.
 * If you pass colors==null  it will remove the default-color scheme and
 * use orginial default-colors.
 *    (Added by CvK  febr. 2012)
 ****/
pvc.setDefaultColorScheme = function(colors) {
   pvc.defaultColorScheme = (colors == null) ?
         null : pvc.createColorScheme(colors);
   return;
};



//convert to greyscale using YCbCr luminance conv
pvc.toGrayScale = function(color, alpha){
    var avg = Math.round( 0.299 * color.r + 0.587 * color.g + 0.114 * color.b);
    //var avg = Math.round( (color.r + color.g + color.b)/3);
    return pv.rgb(avg, avg, avg, alpha != null ? alpha : 0.6).brighter();
};

pvc.removeTipsyLegends = function(){
    try {
        $('.tipsy').remove();
    } catch(e) {
        // Do nothing
    }
};

pvc.compareNatural = function(a, b){
    return (a < b) ? -1 : ((a > b) ? 1 : 0);
};

pvc.createDateComparer = function(parser, key){
    if(!key){
        key = pv.identity;
    }
    
    return function(a, b){
        return parser.parse(key(a)) - parser.parse(key(b));
    };
};

/* Protovis Z-Order support */

// Default values
pv.Mark.prototype._zOrder = 0;

pv.Panel.prototype._hasZOrderChild = false;
pv.Panel.prototype._needChildSort  = false;

pv.Mark.prototype.zOrder = function(zOrder) {
    if(!arguments.length){
        return this._zOrder;
    }
    
    if(this._zOrder !== zOrder){
        this._zOrder = zOrder;
        
        if(this.parent){
            this.parent._hasZOrderChild = 
            this.parent._needChildSort  = true;
        }
    }
    
    return this;
};

// Copy original methods
var markRender = pv.Mark.prototype.render,
    panelAdd   = pv.Panel.prototype.add;

// @replace
pv.Panel.prototype.add = function(){
    var mark = panelAdd.apply(this, arraySlice.call(arguments));

    // Detect new child with non-zero ZOrder
    if(!this._hasZOrderChild && mark._zOrder !== 0){
        this._hasZOrderChild = this._needChildSort  = true;
    }

    return mark;
};

// @replace
pv.Mark.prototype.render = function(){
    // ensure zOrder is up to date
    sortChildren.call(this);
    markRender.apply(this, arraySlice.call(arguments));
};

function sortChildren(){
    // Sort children by their Z-Order
    var children = this.children, L;
    if(children && (L = children.length)){
        var needChildSort = this._needChildSort;
        if(needChildSort){
            children.sort(function(m1, m2){
                return pvc.compareNatural(m1._zOrder, m2._zOrder);
            });
            
            this._needChildSort = false;
        }
        
        // Fix childIndex and apply recursively
        for(var i = 0 ; i < L ; i++){
            var child = children[i]; 
            if(needChildSort) { 
                child.childIndex = i; 
            }
            
            if(child instanceof pv.Panel){
                sortChildren.call(child);
            }
        }
    }
}

/* Local Properties */
/**
 * Adapted from pv.Layout#property.
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
  this.propertyMethod(name, false, pv.Mark.cast[name] = cast);
  return this;
};

/* TICKS */
/**
 * An alternative implementation of QuantitativeScale#ticks
 * that ensures that:
 * (i) the returned ticks include the min. and max. domain values, 
 * (ii) the scale's domain is extended, 
 *      when the calculated ticks so demand and
 * (iii) the resulting ticks are cached.
 * <br/>
 * Only scales with numeric domains are treated specially.
 * The 'syncScale', when not null and falsy, 
 * makes every case be treated solely by the protovis implementation.
 * <br /> 
 * In any case, the default of desiredTickCount is 5
 * (which is different from that of the protovis implementation).
 */
pvc.scaleTicks = function(scale, syncScale, desiredTickCount, forceCalc){
    /* This implementation uses PROTOVIS's 
     * implementation of QuantitativeScale#ticks
     * as a way to not to deal with date scales
     * and to ensure that its internal field 'tickFormat'
     * is updated.
     * 
     * For the cases when the ticks do not fully enclose the domain,
     * this implementation copies & adapts PROTOVIS's
     * implementation, and, unfortunately, 
     * ends up doing the same work twice.
     * 
     * In either case, if the ticks domain is !=
     * from the scale's domain the later is updated to the former.
     */
    if(!desiredTickCount){
        desiredTickCount = 5;
    }
    
    var ticks,
        ticksCacheKey = syncScale + "|" + desiredTickCount;
    if(!forceCalc && 
       scale._ticksCache && 
       (ticks = scale._ticksCache[ticksCacheKey])){
        return ticks;
    }
    
    // Call PROTOVIS implementation
    ticks = scale.ticks(desiredTickCount);
    
    if(syncScale != null && !syncScale){
        return ticks;
    }
    
    var T = ticks.length;
    
    // Treat only well-formed, finite, numeric domains
    if(T >= 2 && !(ticks[0] instanceof Date)){
        // Assume numeric domain
        
        // Check if scale's domain is "included" in the ticks domain
        var doma = scale.domain(),  // "doma/in"
            domaBeg = doma[0],
            domaEnd = doma[doma.length - 1],
            
            // Is is an ascending or descending scale?
            // Assuming the scale is monotonic...
            domaAsc = domaBeg < domaEnd,
            
            domaMin = domaAsc ? domaBeg : domaEnd,
            domaMax = domaAsc ? domaEnd : domaBeg,
            
            tickMin = domaAsc ? ticks[0]     : ticks[T - 1],
            tickMax = domaAsc ? ticks[T - 1] : ticks[0];
        
        if((tickMin > domaMin) || (domaMax > tickMax)){
            // Copied & Adapted PROTOVIS algorithm
            // To recalculate ticks that include the scale's domain
            // at both ends.
            
            var domaSize  = domaMax - domaMin,
                // 1, 10, 100, 1000, ...
                tickStep  = pv.logFloor(domaSize / desiredTickCount, 10),
                tickCount = (domaSize / tickStep),
                err = desiredTickCount / tickCount;
            
            if      (err <= .15) tickStep *= 10;
            else if (err <= .35) tickStep *= 5;
            else if (err <= .75) tickStep *= 2;
            
            // NOTE: this is the "BIG" change to
            //  PROTOVIS's implementation:
            // ceil  -> floor
            // floor -> ceil
            tickMin = Math.floor(domaMin / tickStep) * tickStep;
            tickMax = Math.ceil (domaMax / tickStep) * tickStep;
            
            // Overwrite PROTOVIS ticks
            ticks = pv.range(tickMin, tickMax + tickStep, tickStep);
            if(!domaAsc){
                ticks = ticks.reverse();
            }
        }
        
        if(tickMin < domaMin || domaMax < tickMax){
            /* Update the scale to reflect the new domain */
            if(doma.length !== 2){
                pvc.log("Ticks forced extending a linear scale's domain, " +
                        "but it is not possible to update the domain because " + 
                        "it has '" +  doma.length + "' element(s).");
            } else {
                pvc.log("Ticks forced extending a linear scale's domain from [" +
                        [domaMin, domaMax] + "] to [" +
                        [tickMin, tickMax] + "]");
                
                scale.domain(tickMin, tickMax);
            }
        } // else === && ===
    }
    
    // Cache ticks
    (scale._ticksCache || (scale._ticksCache = {}))[ticksCacheKey] = ticks;
    
    return ticks;
};

pvc.roundScaleDomain = function(scale, roundMode, desiredTickCount){
    // Domain rounding
    if(roundMode){
        switch(roundMode){
            case 'none':
                break;
                
            case 'nice':
                scale.nice();
                break;
            
            case 'tick':
                scale.nice();
                pvc.scaleTicks(scale, true, desiredTickCount);
                break;
                
            default:
                pvc.log("Invalid 'roundMode' argument: '" + roundMode + "'.");
        }
    }
};

/* PROPERTIES */
/**
 * Returns the value of a property as specified upon definition,
 * and, thus, without evaluation.
 */
pv.Mark.prototype.getStaticPropertyValue = function(name) {
    var properties = this.$properties;
    for (var i = 0, L = properties.length; i < L; i++) {
        var property = properties[i];
        if (property.name == name) {
            return property.value;
        }
    }
    //return undefined;
};

pv.Mark.prototype.intercept = function(prop, interceptor, extValue){
    if(extValue !== undefined){
        this[prop](extValue);
    }

    extValue = this.getStaticPropertyValue(prop);
        
    // Let undefined pass through as a sign of not-intercepted
    // A 'null' value is considered as an existing property value.
    if(extValue !== undefined){
        extValue = pv.functor(extValue);
    }
    
    function interceptProp(){
        var args  = pvc.arraySlice.call(arguments);
        return interceptor.call(this, extValue, args);
    }

    this[prop](interceptProp);

    (this._intercepted || (this._intercepted = {}))[prop] = true;

    return this;
};

pv.Mark.prototype.lock = function(prop, value){
    if(value !== undefined){
        this[prop](value);
    }

    (this._locked || (this._locked = {}))[prop] = true;
    
    return this;
};


pv.Mark.prototype.isIntercepted = function(prop){
    return this._intercepted && this._intercepted[prop];
};

pv.Mark.prototype.isLocked = function(prop){
    return this._locked && this._locked[prop];
};

/**
 * Function used to propagate a datum received, as a singleton list.
 * Use this to prevent re-evaluation of inherited data property functions!
 */
pv.dataIdentity = function(datum){
    return [datum];
};

/* ANCHORS */
/**
 * name = left | right | top | bottom
 * */
pv.Mark.prototype.addMargin = function(name, margin) {
    if(margin != 0){
        var staticValue = pvc.nullTo(this.getStaticPropertyValue(name), 0),
            fMeasure    = pv.functor(staticValue);
        
        this[name](function(){
            return margin + fMeasure.apply(this, arraySlice.call(arguments));
        });
    }
    
    return this;
};

/**
 * margins = {
 *      all:
 *      left:
 *      right:
 *      top:
 *      bottom:
 * }
 */
pv.Mark.prototype.addMargins = function(margins) {
    var all = pvc.get(margins, 'all', 0);
    
    this.addMargin('left',   pvc.get(margins, 'left',   all));
    this.addMargin('right',  pvc.get(margins, 'right',  all));
    this.addMargin('top',    pvc.get(margins, 'top',    all));
    this.addMargin('bottom', pvc.get(margins, 'bottom', all));
    
    return this;
};

/* SCENE */
/**
 * Iterates through all instances that
 * this mark has rendered.
 */
pv.Mark.prototype.forEachInstance = function(fun, ctx){
    var mark = this,
        indexes = [],
        instances = [];

    /* Go up to the root and register our way back.
     * The root mark never "looses" its scene.
     */
    while(mark.parent){
        indexes.unshift(mark.childIndex);
        mark = mark.parent;
    }

    // mark != null

    // root scene exists if rendered at least once
    var scene = mark.scene;
    if(scene){
        var L = indexes.length;

        function collectRecursive(scene, level, t){
            if(level === L){
                for(var i = 0, I = scene.length ; i < I ; i++){
                    fun.call(ctx, scene[i], t);
                }
            } else {
                var childIndex = indexes[level];
                for(var index = 0, D = scene.length ; index < D ; index++){
                    var instance = scene[index],
                        childScene = instance.children[childIndex];

                    // Some nodes might have not been rendered?
                    if(childScene){
                        var toChild = t.times(instance.transform)
                                       .translate(instance.left, instance.top);

                        collectRecursive(childScene, level + 1, toChild);
                    }
                }
            }
        }

        collectRecursive(scene, 0, pv.Transform.identity);
    }

    return instances;
};

/* BOUNDS */
pv.Mark.prototype.toScreenTransform = function(){
    var t = pv.Transform.identity;
    
    var parent = this.parent; // TODO : this.properties.transform ? this : this.parent
    if(parent){
        do {
            t = t.translate(parent.left(), parent.top())
                 .times(parent.transform());
        } while ((parent = parent.parent));
    }
    
    return t;
};

pv.Transform.prototype.transformHPosition = function(left){
    return this.x + (this.k * left);
};

pv.Transform.prototype.transformVPosition = function(top){
    return this.y + (this.k * top);
};

// width / height
pv.Transform.prototype.transformLength = function(length){
    return this.k * length;
};

// -----------

pv.Mark.prototype.getInstanceShape = function(instance){
    return new Rect(
            instance.left,
            instance.top,
            instance.width,
            instance.height);
};

pv.Dot.prototype.getInstanceShape = function(instance){
    var radius = instance.shapeRadius,
        cx = instance.left,
        cy = instance.top;

    // TODO: square and diamond break when angle is used
    switch(instance.shape){
        case 'diamond':
            radius *= Math.SQRT2;
            // NOTE fall through
        case 'square':
        case 'cross':
            return new Rect(
                cx - radius,
                cy - radius,
                2*radius,
                2*radius);
    }

    // 'circle' included
    return new Circle(cx, cy, radius);
};

pv.Area.prototype.getInstanceShape =
pv.Line.prototype.getInstanceShape = function(instance, nextInstance){
    return new Line(instance.left, instance.top, nextInstance.left, nextInstance.top);
};


// --------------------
function Shape(){}

pvc.define('pvc.Shape', Shape).mixin({
    transform: function(t){
        return this.clone().apply(t);
    }

    // clone
    // intersectsRect
});

// --------------------

function Rect(x, y, dx, dy){
    this.set(x, y, dx, dy);
}

pvc.define('pvc.Rect', Rect, Shape).mixin({
    set: function(x, y, dx, dy){
        this.x  = x  || 0;
        this.y  = y  || 0;
        this.dx = dx || 0;
        this.dy = dy || 0;
        this.calc();
    },

    calc: function(){
        this.x2  = this.x + this.dx;
        this.y2  = this.y + this.dy;
    },

    clone: function(){
        return new Rect(this.x, this.y, this.dx, this.dy);
    },

    apply: function(t){
        this.x  = t.transformHPosition(this.x);
        this.y  = t.transformVPosition(this.y);
        this.dx = t.transformLength(this.dx);
        this.dy = t.transformLength(this.dy);
        this.calc();
        return this;
    },

    intersectsRect: function(rect){
//        pvc.log("[" + [this.x, this.x2, this.y, this.y2] + "]~" +
//                "[" + [rect.x, rect.x2, rect.y, rect.y2] + "]");

        // rect is not trusted to be normalized...(line...)
        var minX = Math.min(rect.x, rect.x2),
            maxX = Math.max(rect.x, rect.x2),
            minY = Math.min(rect.y, rect.y2),
            maxY = Math.max(rect.y, rect.y2);

        return rect &&
                // Some intersection on X
                (this.x2 > minX) &&
                (this.x  < maxX) &&
                // Some intersection on Y
                (this.y2 > minY ) &&
                (this.y  < maxY);
    },

    getSides: function(){
        var x  = Math.min(this.x, this.x2),
            y  = Math.min(this.y, this.y2),
            x2 = Math.max(this.x, this.x2),
            y2 = Math.max(this.y, this.y2);

        /*
         *    x,y    A
         *     * ------- *
         *  D  |         |  B
         *     |         |
         *     * --------*
         *              x2,y2
         *          C
         */
        if(!this._sides){
            this._sides = [
                //x, y, x2, y2
                new Line(x,  y,  x2, y),
                new Line(x2, y,  x2, y2),
                new Line(x,  y2, x2, y2),
                new Line(x,  y,  x,  y2)
            ];
        }

        return this._sides;
    }
});

// ------

function Circle(x, y, radius){
    this.x = x || 0;
    this.y = y || 0;
    this.radius = radius || 0;
}

pvc.define('pvc.Circle', Circle, Shape).mixin({
    clone: function(){
        return new Circle(this.x, this.y, this.radius);
    },

    apply: function(t){
        this.x = t.transformHPosition(this.x);
        this.y = t.transformVPosition(this.y);
        this.radius = t.transformLength(this.radius);
        return this;
    },

    intersectsRect: function(rect){
        // Taken from http://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection
        var dx2 = rect.dx / 2,
            dy2 = rect.dy / 2;

        var circleDistX = Math.abs(this.x - rect.x - dx2),
            circleDistY = Math.abs(this.y - rect.y - dy2);

        if ((circleDistX > dx2 + this.radius) ||
            (circleDistY > dy2 + this.radius)) {
            return false;
        }

        if (circleDistX <= dx2 || circleDistY <= dy2) {
            return true;
        }

        var sqCornerDistance = Math.pow(circleDistX - dx2, 2) +
                            Math.pow(circleDistY - dy2, 2);

        return sqCornerDistance <= (this.radius * this.radius);
    }
});

// -----

function Line(x, y, x2, y2){
    this.x  = x  || 0;
    this.y  = y  || 0;
    this.x2 = x2 || 0;
    this.y2 = y2 || 0;
}

pvc.define('pvc.Line', Line, Shape).mixin({
    clone: function(){
        return new pvc.Line(this.x, this.y, this.x2, this,x2);
    },

    apply: function(t){
        this.x  = t.transformHPosition(this.x );
        this.y  = t.transformVPosition(this.y );
        this.x2 = t.transformHPosition(this.x2);
        this.y2 = t.transformVPosition(this.y2);
        return this;
    },

    intersectsRect: function(rect){
        if(!rect) {
            return false;
        }
        var sides = rect.getSides();
        for(var i = 0 ; i < 4 ; i++){
            if(this.intersectsLine(sides[i])){
                return true;
            }
        }

        return false;
    },

    intersectsLine: function(b){
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
    }
});

})(); // End private scope


/**
 * Equal to pv.Behavior.select but doesn't necessarily
 * force redraw of component it's in on mousemove, and sends event info
 * (default behavior matches pv.Behavior.select())
 * @param {boolean} autoRefresh refresh parent mark automatically
 * @param {pv.Mark} mark
 * @return {function mousedown
 **/
pv.Behavior.selector = function(autoRefresh, mark) {
  var scene, // scene context
      index, // scene context
      r, // region being selected
      m1, // initial mouse position
      redrawThis = (arguments.length > 0)?
                    autoRefresh : true; //redraw mark - default: same as pv.Behavior.select
    
  /** @private */
  function mousedown(d, e) {
    if(mark == null){
        index = this.index;
        scene = this.scene;
    } else {
        index = mark.index;
        scene = mark.scene;
    }
    
    m1 = this.mouse();

    scene.mark.selectionRect = new pvc.Rect(m1.x, m1.y);
    
    pv.Mark.dispatch("selectstart", scene, index, e);
  }

  /** @private */
  function mousemove(e) {
    if (!scene) return;
    scene.mark.context(scene, index, function() {
        // this === scene.mark
        var m2 = this.mouse(),
            x = Math.max(0, Math.min(m1.x, m2.x)),
            y = Math.max(0, Math.min(m1.y, m2.y));
            
        scene.mark.selectionRect.set(
            x,
            y,
            Math.min(this.width(),  Math.max(m2.x, m1.x)) - x,
            Math.min(this.height(), Math.max(m2.y, m1.y)) - y);

        if(redrawThis){
            this.render();
        }
      });

    pv.Mark.dispatch("select", scene, index, e);
  }

  /** @private */
  function mouseup(e) {
    if (!scene) return;
    pv.Mark.dispatch("selectend", scene, index, e);
    scene.mark.selectionRect = null;
    scene = null;
  }

  pv.listen(window, "mousemove", mousemove);
  pv.listen(window, "mouseup", mouseup);

  return mousedown;
};


/**
 *
 * Implements support for svg detection
 *
 **/
(function($){
    $.support.svg = $.support.svg || 
        document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");
})(jQuery);

// Text measurement utility
pvc.scope(function(){
    
    // --------------------------
    // exported
    function getTextLength(text, font){
        switch(pv.renderer()){
            case 'vml':
                return getTextLenVML(text, font);

            case 'batik':
                font = splitFontCGG(font);

                // NOTE: the global function 'getTextLenCGG' must be
                // defined by the CGG loading environment
                return getTextLenCGG(text, font.fontFamily, font.fontSize);

            //case 'svg':
        }

        return getTextLenSVG(text, font);
    }

    function getTextHeight(text, font){
        switch(pv.renderer()){
            case 'vml':
                return getTextHeightVML(text, font);

            case 'batik':
                font = splitFontCGG(font);

                // NOTE: the global function 'getTextHeightCGG' must be
                // defined by the CGG loading environment
                return getTextHeightCGG(text, font.fontFamily, font.fontSize);

            //case 'svg':
        }

        return getTextHeightSVG(text, font);
    }

    //TODO: if not in px?..
    function getFontSize(font){
        if(pv.renderer() == 'batik'){
            var sty = document.createElementNS('http://www.w3.org/2000/svg','text').style;
            sty.setProperty('font',font);
            return parseInt(sty.getProperty('font-size'));
        }

        var holder = getTextSizePlaceholder();
        holder.css('font', font);
        return parseInt(holder.css('font-size'));
    }

    function getFitInfo(w, h, text, font, diagMargin){
        if(text == '') {
            return {h: true, v: true, d: true};
        }
        
        var len = getTextLength(text, font);
        return {
            h: len <= w,
            v: len <= h,
            d: len <= Math.sqrt(w*w + h*h) - diagMargin
        };
    }

    function trimToWidth(len, text, font, trimTerminator){
      if(text == '') {
          return text;
      }
      
      var textLen = getTextLength(text, font);
      if(textLen <= len){
        return text;
      }

      if(textLen > len * 1.5){ //cutoff for using other algorithm
        return trimToWidthBin(len,text,font,trimTerminator);
      }

      while(textLen > len){
        text = text.slice(0,text.length -1);
        textLen = getTextLength(text, font);
      }

      return text + trimTerminator;
    }
    
    // --------------------------
    // private
    var $textSizePlaceholder = null,
        $textSizePvLabel = null,
        textSizePvLabelFont = null,
        textSizePlaceholderId = 'cccTextSizeTest_' + new Date().getTime();

    function getTextSizePlaceholder(){
        if(!$textSizePlaceholder || $textSizePlaceholder.parent().length == 0){
            
            $textSizePlaceholder = $(textSizePlaceholderId);

            if(!$textSizePlaceholder.length){
                $textSizePlaceholder = $('<div>')
                    .attr('id', textSizePlaceholderId)
                    .css('position', 'absolute')
                    .css('visibility', 'hidden')
                    .css('width', 'auto')
                    .css('height', 'auto');

                $('body').append($textSizePlaceholder);
            }
        }

        return $textSizePlaceholder;
    }

    function getTextSizePvLabel(text, font){
        if(!$textSizePvLabel || textSizePvLabelFont != font){
            var holder   = getTextSizePlaceholder();
            var holderId = holder.attr('id');

            var panel = new pv.Panel();
            panel.canvas(holderId);
            var lbl = panel.add(pv.Label).text(text);
            if(font){
                lbl.font(font);
            }
            panel.render();

            $textSizePvLabel   = $('#' + holderId + ' text');
            textSizePvLabelFont = font;
        } else {
            $textSizePvLabel.text(text);
        }

        return $textSizePvLabel[0];
    }

    function splitFontCGG(font){
        var el = document.createElementNS('http://www.w3.org/2000/svg','text');
        var sty = el.style;
        sty.setProperty('font',font);

        var result = {};
        result.fontFamily = sty.getProperty('font-family');
        if(!result.fontFamily){
            result.fontFamily = 'sans-serif';
        }
        result.fontSize = sty.getProperty('font-size');
        result.fontStyle = sty.getProperty('font-style');

        return result;
    }

    function getTextLenSVG(text, font){
        var lbl = getTextSizePvLabel(text, font);
        var box = lbl.getBBox();
        return box.width;
    }

    function getTextHeightSVG(text, font){
        var lbl = getTextSizePvLabel(text, font);
        var box = lbl.getBBox();
        return box.height;
    }

    function getTextLenVML(text, font){
        return pv.Vml.text_dims(text, font).width;
    }

    function getTextHeightVML(text, font){
        return pv.Vml.text_dims(text, font).height;
    }

    function trimToWidthBin(len, text, font, trimTerminator){

        var high = text.length-2,
            low = 0,
            mid,
            textLen;

        while(low <= high && high > 0){

            mid = Math.ceil((low + high)/2);
            textLen = getTextLength(text.slice(0, mid), font);
            if(textLen > len){
                high = mid - 1;
            } else if( getTextLength(text.slice(0, mid + 1), font) < len ){
                low = mid + 1;
            } else {
                return text.slice(0, mid) + trimTerminator;
            }
        }

        return text.slice(0,high) + trimTerminator;
    }

    /*
    //TODO: use for IE if non-svg option kept
    doesTextSizeFit: function(length, text, font){
        var MARGIN = 4;//TODO: hcoded
        var holder = this.getTextSizePlaceholder();
        holder.text(text);
        return holder.width() - MARGIN <= length;
    }
    */

    pvc.text = {
        getTextLength: getTextLength,
        getFontSize:   getFontSize,
        getTextHeight: getTextHeight,
        getFitInfo:    getFitInfo,
        trimToWidth:   trimToWidth
    };
});
/**
 * A datum is the atomic data entity of the data model.
 * A datum contains key properties, of specific data dimensions.
 * A datum contains a value property.
 * A datum belongs to a given data engine.
 *
 *  datum.elem["series"].value;
 *  datum.elem.category.value;
 *
 * @constructs
 */
pvc.Datum = function(dataEngine, datumIndex, elemsByDim, value){
    // TODO: hardcoded for 2 dimensions

    this.engine = dataEngine;
    this.index = datumIndex; // -1 => null datum
    this.elem = elemsByDim;
    this.value = value;
    this._selected = false;
};

$.extend(pvc.Datum.prototype,
/**
 * @lends Datum#
 */
{
    // Called by engine on clear
    _deselect: function(){
        this._selected = false;
    },
    
    /**
     * Changes the selected state of the datum,
     * to the specified value, 'select'.
     * Returns true if the selected state changed.
     */
    setSelected: function(select){
        // Normalize 'select'
        select = (select == null) || !!select;
        
        if(this._selected !== select){
            this._selected = select;
            if(this.index >= 0){ // not a null datum
                this.engine._onDatumSelectedChanged(this, select);
            }
            return true;
        }
        
        return false;
    },
    
    /**
     * Returns true if the datum is selected.
     */
    isSelected: function(){
        return this._selected;
    },
    
    /**
     * Toggles the selected state of the datum.
     */
    toggleSelected: function(){
        this.setSelected(!this._selected);
    },

    describe: function(){
        var s = ["DATUM #" + this.index];

        this.engine._dimensionList.forEach(function(dimension){
            var name = dimension.name,
                elem = this.elem[name];
            s.push(
                "\t" + name + ": " +
                     JSON.stringify(elem.value) + "|" + elem.leafIndex);
        }, this);
        
        s.push("\tvalue: " +  this.value);

        return s.join(" ");
    },

    toString: function(){
        return '' + this.value;
    }
});
pvc.DataDimension = Base.extend(
/** 
 * @lends DataDimension# 
 */
{
    // lazy loading of dimension values
    // function() -> [unique dimension values]
    _getValues: null,

    // function(value, index) -> label
    _calcLabel: null,

    _values: null,
    _labels: null, // cache, immutable
    _elements: null, // cache, immutable
    _rootElement: null, // cache, immutable
    _maxDepth: 0, // cache, immutable
    
    _invisibleIndexes: null,
    _selectedIndexes:  null,
    
    _valueKeyToIndex: null, // cache, immutable
    _parsedValuesMap: null, // cache, immutable
    _visibleIndexes: null,  // cache
    _visibleValues:  null,  // cache
    _visibleElements: null, // cache
    _selectedValues:  null, // cache

    _timeSeries: false,
    _parser: null,
    _sorter: null,
    
    /**
     * A dimension of data.
     * @constructs
     */
    constructor: function(name, index, definition){
        this.name = name;
        this.index = index;

        this._invisibleIndexes = {};

        // translator -> [values]
        this._fetchValues = pvc.get(definition, 'fetchValues');
        this._calcLabel   = pvc.get(definition, 'calcLabel');
        this._timeSeries  = pvc.get(definition, 'timeSeries', false);
        if(this._timeSeries){
            var timeSeriesFormat = pvc.get(definition, 'timeSeriesFormat');
            if(timeSeriesFormat){
                this._parser = pv.Format.date(timeSeriesFormat);
                
                var me = this;
                this._sorter = function(a, b){ 
                    return me._parseRawValue(a) - me._parseRawValue(b);
                }; // works for numbers and dates
            }
        }
    },
    
    /**
     * Returns the unique values.
     */
    getValues: function(){
        if(!this._values){
            this._values = this._fetchValues.call(null);

            var parser = this._parser;
            if(parser){
                // each raw value's #toString is used as the map key
                this._parsedValuesMap = pv.dict(this._values, function(rawValue){
                    return parser.parse(rawValue);
                });
            }

            // TODO - does not support depth > 1
            var sorter = this._sorter;
            if(sorter){
                this._values.sort(sorter);
            }
        }
        
        return this._values;
    },

    /**
     * Parses a raw value with the
     * dimension's associated parser, if any.
     */
    _parseRawValue: function(value){
        return this._parsedValuesMap ? this._parsedValuesMap[value] : value;
    },
    
    /**
     * Returns the leaf elements.
     */
    getElements: function(){
        if(!this._elements){
            this.getElementTree();
        }

        return this._elements;
    },

    /**
     * Returns the root node of the elements tree.
     */
    getElementTree: function(){
        if(!this._rootElement){
            var treeInfo = this.createElementsTree();
            
            this._elements = treeInfo.elements;
            this._rootElement = treeInfo.root;
            this._maxDepth = treeInfo.maxDepth;
        }

        return this._rootElement;
    },

    /**
     * Returns the maximum depth.
     */
    getMaxDepth: function(){
        if(!this._elements){
            this.getElementTree();
        }

        return this._maxDepth;
    },

    /**
     * Creates a custom element tree.
     */
    createElementsTree: function(onlyVisible, reversed){
        var elements = [];
        var maxDepth = 0;

        // NOTE: The hierarchy need not be uniform.
        // Some leaf nodes may have depth 1, while others, depth 2.
        
        var root   = new pvc.DataElement(this),
            values = onlyVisible ? this.getVisibleValues() : this.getValues();

        if(reversed){
            // Do not to modify values
            // TODO: could avoid this - do the 'for' backwards
            values = values.slice();
            values.reverse();
        }

        for (var i = 0, L = values.length ; i < L ; i++) {
            var keys = pvc.toArray(values[i]),
                node = root;
            
            for (var k = 0, K = keys.length ; k < K ; k++){
                if(K > maxDepth){
                    maxDepth = K;
                }

                var key = keys[k];

                var child = node.childNodesByKey[key];
                if(!child){
                    // Only leaf nodes receive indexes
                    var index = k === K - 1 ? elements.length : -1;
                    child = new pvc.DataElement(this, key, node, index);
                }
                // Duplicate values are ignored
                // This happend because not all translators return distinct
                // per dimension values.
                // The crosstab translator does not check whether the provided
                // categories are unique when getCategories is called.
                // Duplicates happen, for example in Metric charts
                // (for example, see dataset 'testLDot2' in the pvMetricDots.html sample)

                node = child;
            }

            // Add the leaf node
            if(elements){
                elements.push(node);
            }
        }

        return {
            root:     root,
            maxDepth: maxDepth,
            elements: elements
        };
    },

    /**
     * Returns the nth unique value.
     */
    getValue: function(index){
        return this.getValues()[index];
    },

    /**
     * Returns the nth unique element.
     */
    getElement: function(index){
        return this.getElements()[index];
    },
    
    /**
     * Returns the number of unique values.
     */
    getSize: function(){
        return this.getValues().length;
    },
    
    /**
     * Returns an array with the indexes of the visible values.
     */
    getVisibleIndexes: function(){
        if(!this._visibleIndexes){
            this._visibleIndexes = [];
            
            new pvc.Range(this.getSize())
                .forEach(function(index){
                    if(!(index in this._invisibleIndexes)){
                        this._visibleIndexes.push(index);
                    }
                }, this);
        }
        
        return this._visibleIndexes;
    },
    
    /**
     * Returns an array with the visible values.
     */
    getVisibleValues: function(){
        if(!this._visibleValues){
            this._visibleValues = pv.permute(
                            this.getValues(),
                            this.getVisibleIndexes());
        }
        
        return this._visibleValues;
    },

    /**
     * Returns the unique elements.
     */
    getVisibleElements: function(){
        if(!this._visibleElements){
            this._visibleElements = pv.permute(
                            this.getElements(),
                            this.getVisibleIndexes());
        }

        return this._visibleElements;
    },

     /**
     * Returns true if the value of the 
     * specified index is visible.
     */
    isVisibleByIndex: function(index){
        return !(index in this._invisibleIndexes);
    },
    
    /** 
     * Changes the visibility of a value, given its index.
     * Returns true if visibility changed.
     */
    setVisibleByIndex: function(index, visible){
        if(index < 0 || index > this.getValues().length - 1){
            throw new Error("Invalid index");
        }
        
        // Default and Normalize
        visible = (visible == null) || !!visible;
        
        if(this.isVisibleByIndex(index) === visible){
            return false;
        }
        
        if(visible){
            delete this._invisibleIndexes[index];
        } else {
            this._invisibleIndexes[index] = true;
        }
        
        // Clear visible cache
        this._visibleValues   = null;
        this._visibleIndexes  = null;
        this._visibleElements = null;
        
        return true;
    },
    
    /** 
     * Toggles the visibility of a value, given its index.
     */
    toggleVisibleByIndex: function(index){
        this.setVisibleByIndex(index, !this.isVisibleByIndex(index));
    },
    
    /** 
     * Returns the index of a value, given its visible index.
     */
    translateVisibleIndex: function(visibleIndex){
        return this.getVisibleIndexes()[visibleIndex];
    },
    
    /** 
     * Returns the index of a given value.
     * When the specified value does not exist,
     * returns -1.
     */
    getIndex: function(value){
        
        if(!this._valueKeyToIndex){
            // Build the index
            this._valueKeyToIndex = {};
            
            this.getValues().forEach(function(value, index){
                // Not checking for duplicate keys...
                this._valueKeyToIndex[this.getKey(value)] = index;
            }, this);
        }
        
        var index = this._valueKeyToIndex[this.getKey(value)];
        return index != null ? index : -1;
    },
    
    /** 
     * Returns the string key of a given value.
     */
    getKey: function(value){
        // Works for arrays...
        return value + '';
    },
    
    /** 
     * Returns the minimum value of the dimension.
     * Most suitable for "linear" dimensions -
     * works with number, string and date value types.
     */
    getMinValue: function(key) {
        var min;
        this.getValues().forEach(function(value, index){
            var k = key ? key(value, index) : value;
            if(index === 0 || k < min){
                min = k;
            }
        });
        
        return min;
    },

    /** 
     * Returns the maximum value of the dimension.
     * Most suitable for "linear" dimensions -
     * works with number, string and date value types.
     */
    getMaxValue: function(key) {
        var max;
        this.getValues().forEach(function(value, index){
            var k = key ? key(value, index) : value;
            if(index === 0 || k > max){
                max = k;
            }
        });
        
        return max;
    },
    
    /** 
     * Given a value, if it is an array value, 
     * calls the given function once 
     * for each descendant value, 
     * and once for the given value, 
     * if it explicitly exists.
     * 
     * If the given value is not an array,
     * and the value exists, 
     * calls the given function with it.
     */
    forEachDescendantOrSelf: function(valueBase, fun, ctx){
        if(valueBase instanceof Array){
            // TODO: inneficient, perhaps a value tree?
            this.getValues().forEach(function(value, index){
                if(pvc.arrayStartsWith(value, valueBase)){
                    fun.call(ctx, value, index);
                }
            });
        } else {
            var index = this.getIndex(valueBase);
            if(index >= 0){
                fun.call(ctx, valueBase, index);
            }
        }
    }
});pvc.scope(function(){

function DataElement(dimension, value, parent, leafIndex){
    var localKey,
        rawValue = value;
    
    if(!parent){
        // Parent is a dummy root
        localKey = '';
        value = undefined;
    } else {
        if(value == null){
            throw new Error("Element cannot have a null value.");
        }

        // Pre parsing yields somewhat nicer keys for dates
        localKey = value + '';
        value = dimension._parseRawValue(value);
    }

    pv.Dom.Node.call(this, value);
    //this.nodeValue = value; // base constructor does this
    this.nodeName = localKey;

    this.dimension = dimension;
    this.value = value;
    this.rawValue = rawValue; // exists mainly to ease backward compatibility

    this.childNodesByKey = {};
    // NOTE: Unfortunately 'index' is already taken by the base class
    // and, when filled, its value is the PRE-ORDER DFS order!
    this.leafIndex = leafIndex;
    
    if(!parent){
        this.path     = [];
        this.absValue = null;
        this.label    = "";
        this.absLabel = "";
    } else {
        this.path     = parent.path.concat(value);
        this.absValue = pvc.join("~",   parent.absValue, localKey);
        this.label    = "" + pvc.nullTo(dimension._calcLabel ? dimension._calcLabel(value) : value, "");
        this.absLabel = pvc.join(" ~ ", parent.absLabel, this.label);

        parent.appendChild(this);
        parent.childNodesByKey[value] = this;
    }
}

pvc.define('pvc.DataElement', DataElement, pv.Dom.Node).mixin({
    toString: function(){
        return this.nodeName; // holds the localKey
    }
});

});
pvc.DataTranslator = Base.extend({

    dataEngine: null,
    metadata: null,
    resultset: null,
    values: null,
    _data: null,
    secondAxisValues: null,

    //constructor: function(){
    //},

    setData: function(metadata, resultset){
        this.metadata = metadata;
        this.resultset = resultset;
    },

    getValues: function(){
        // Skips first row, skips first col.
        return this.values.slice(1).map(function(a){
            return a.slice(1);
        });      
    },

    getSecondAxisValues: function(){
        // Skips first row
        return this.secondAxisValues.map(function(a){
            return a.slice(1);
        });
    },

    getSecondAxisSeries: function(){
        // Skips first row
        return this.secondAxisValues.map(function(a){
            return a[0];
        });
    },

    getColumns: function(){
        // First row, skipping 1st (dummy) element
        return this.values[0].slice(1);
    },

    getRows: function(){
        // First element of every row, skipping 1st row
        return this.values.slice(1).map(function(row){ return row[0]; });
    },

    getData: function(){
        if(!this._data){
            this._data = this._createData();
        }
        return this._data;
    },
    
    transpose: function(){

        pv.transpose(this.values);
    },


    prepare: function(dataEngine){
        this.dataEngine = dataEngine;
        this.prepareImpl();
        this.postPrepare();
    },

    postPrepare: function(){

        if(this.dataEngine.seriesInRows){
            this.transpose();
        }

        var options = this.dataEngine.chart.options;
        if(options.secondAxis){
            var columnIndexes = pvc.toArray(options.secondAxisIdx)
                                    .sort();

            // Transpose, splice, transpose back
            this.transpose();
            
            this.secondAxisValues = [];
            for (var i = columnIndexes.length - 1 ; i >= 0 ; i--) {
                var columnIndex = Number(columnIndexes[i]);
                
                // TODO: Can a column index not be >= 0? NaN? In what cases?
                if(columnIndex >= 0){
                    columnIndex += 1;
                }
                
                this.secondAxisValues.unshift(this.values.splice(columnIndex, 1)[0]);
                
                // TODO: DCL - secondAxisValues remain untransposed??
            }
            
            this.transpose();
        }
    },

    prepareImpl: function(){
    // Specific code goes here - override me
    },

    sort: function(sortFunc){
    // Specify the sorting data - override me
    },

    _createData: function(){
        // Create data
        var data = [],
            //serRow,
            dimSeries = this.dataEngine.getDimension('series'),
            dimCategs = this.dataEngine.getDimension('category');
        
        // Crosstab to object/relational
        this.values.forEach(function(row, rowIndex){
            if(rowIndex === 0){
                // 1st row contains series
                //serRow = row;
            } else {
                // Remaining rows are 1 per category
                var catIndex = rowIndex - 1,
                    catElem  = dimCategs.getElement(catIndex);

                row.forEach(function(value, colIndex){
                    if(colIndex === 0){
                        // 1st column contains the category
                        // catValue = value;
                    } else if(value != null){
                        // Remaining columns the series values
                        var serIndex = colIndex - 1,
                            serElem  = dimSeries.getElement(serIndex),
                            datum = new pvc.Datum(
                                        this.dataEngine, 
                                        data.length,
                                        {series: serElem, category: catElem},
                                        value);
                       data.push(datum);
                    }
                }, this);
            }
        }, this);
        
        return data;
    }
});

pvc.CrosstabTranslator = pvc.DataTranslator.extend({

    prepareImpl: function(){
    
        // All we need to do is to prepend 
        // a row with the series to the result matrix 

        // Collect series values from meta data column names
        var seriesRow = this.metadata.slice(1).map(function(d){
            return d.colName;
        });
        
        // First column is dummy
        seriesRow.splice(0, 0, "x");

        this.values = pvc.cloneMatrix(this.resultset);
        
        this.values.splice(0, 0, seriesRow);
    }
});


/* Relational format:
 *    0         1        2
 * Series | Category | Value
 * ---------------------------
 *    T   |     A    |   12
 *    T   |     B    |   45
 *    Q   |     A    |   11
 *    Q   |     B    |   99
 *    Z   |     B    |   3
 * 
 * (if only 2 columns are present, 
 *  a 1st column with a fixed series is implied)
 * 
 * Is transformed to:
 *    
 *     0   1    2    3
 * 0   x | T  | Q  | Z    (<--- Series)
 *    -------------------
 * 1   A | 12 | 11 | null
 * 2   B | 45 | 99 | 3
 *    
 *     ^
 *     |
 *  (Categories)
 *  
 */
pvc.RelationalTranslator = pvc.DataTranslator.extend({

    prepareImpl: function(){

        // Special case
        if(this.metadata.length == 2){
            // Adding a static series
            
            // Add a 1st column with value 'Series' to every row
            // All rows will belong to the same series: 'Series'
            this.resultset.forEach(function(row){
                row.splice(0, 0, "Series");
            });
            
            // TODO: this metadata seems to be wrong...
            this.metadata.splice(0, 0, {
                "colIndex": 2,
                "colType":  "String",
                "colName":  "Series"
            });
        }
        
        // Unique series values in order of appearance in the resultset
        var series = pv.uniq(this.resultset.map(function(rowIn){
            return (rowIn != null) ? rowIn[0] : null;
        }));
        
        // Unique category values in order of appearance in the resultset
        var categories = pv.uniq(this.resultset.map(function(rowIn){
            return (rowIn != null) ? rowIn[1] : null;
        }));
        
        // -----------
        
        var categoriesLength = categories.length,
            seriesLength = series.length,
            values = this.values = new Array(categoriesLength + 1);
        
        // First row is the series row
        // 'x' is a dummy placeholder
        values[0] = ['x'].concat(series);
        
        // First column is the category
        new pvc.Range(0, categoriesLength).forEach(function(catIndex){
            var row = values[catIndex + 1] = new Array(seriesLength + 1);
            
            row[0] = categories[catIndex];
        });
        
        // Finally, iterate through the resultset and build the new values
        var seriesIndexByValue = pv.numerate(series),
            categoriesIndexByValue = pv.numerate(categories);
        
        this.resultset.forEach(function(rowIn){
            var j = seriesIndexByValue[rowIn[0]] + 1,
                i = categoriesIndexByValue[rowIn[1]] + 1,
                v = rowIn[2],
                row = values[i];
            
            row[j] = pvc.sum(row[j], v); // may end as null or undefined
        });
    }
});

pvc.MultiValueTranslator = pvc.DataTranslator.extend({
    
    constructor: function(valuesIndexes, crosstabMode, dataOptions){
        //measuresIdx , categoriesIndexes) //seriesIndexes, numMeasures(1), 

        this.crosstabMode  = crosstabMode;
        this.valuesIndexes = valuesIndexes;
        
        /*this.measuresIdx = measuresIdx; *///measuresIdx : when measures are normalized
        
        this.dataOptions = dataOptions || {}; // TODO:
    },
    
    prepareImpl: function(){
        var separator = this.dataOptions.separator || '~';
        
        if(this.crosstabMode){
            
            // TODO: DCL - somes drawings ilustrating the various formats would really help here!
            
            //2 modes here:
            // 1) all measures in one column right after categories
            // 2) measures with separator mixed with series
            
            if(this.dataOptions.categoriesCount == null){//default
                this.dataOptions.categoriesCount = 1;
            }
            
            if(this.dataOptions.measuresInColumns || this.dataOptions.measuresIdx == null){ 
                //series1/measure1, series1/measure2...
                // line
                var seriesNames,
                    measureCount;

                var measuresStart = this.dataOptions.categoriesCount,
                    colNames = this.metadata.slice(measuresStart).map(function(d){
                        return d.colName;
                    });

                if(this.dataOptions.measuresInColumns){
                    // series1~measure1 | .. | series1~measureN |
                    // series2~measure1 | .. | series2~measureN |
                    // ...
                    // seriesM~measure1 | .. | seriesM~measureN
                    //
                    // Each series name itself may be composed of
                    // multiple levels, separated by ~
                    seriesNames = [];
                    var lastSeriesName = null;
                    for(var i = 0; i < colNames.length; i++){
                        var colName  = colNames[i],
                            sepIndex = colName.lastIndexOf(separator),
                            seriesName = (sepIndex < 0) ? '' : colName.slice(0, sepIndex);
                        
                        if(seriesName !== lastSeriesName) {
                            seriesNames.push(seriesName);
                            lastSeriesName = seriesName;
                        }
                    }

                    measureCount = colNames.length / seriesNames.length;
                    //TODO: merge series
                    
                    //TODO: more measures here,
                    //single val as is;
                    //multi: will need to iterate and merge values
                } else {
                    measureCount = 1;
                    seriesNames = colNames;
                }

                // Split series names
                for(var j = 0, S = seriesNames.length ; j < S ; j++){
                    seriesNames[j] = seriesNames[j].split('~');
                }

                this.values = this.mergeCategoriesAndMeasuresColumns(
                                        this.resultset,
                                        measuresStart,
                                        measureCount);

                // Prepend the series names row
                seriesNames.splice(0, 0, "x"); // dummy top-left corner cell
                this.values.splice(0, 0, seriesNames);
                
            } else {//TODO:refactor? PLEASE!!!
                
                var measuresIdx = this.dataOptions.measuresIdx;
                if(measuresIdx == null) { measuresIdx = 1;}
                var measureCount = this.dataOptions.numMeasures;
                if (measureCount == null) { measureCount = 1; }
                
                var a1 = this.metadata.slice(measuresIdx + 1).map(function(d){
                    return d.colName;
                });
                a1.splice(0,0,"x");
        
                //var values = pvc.cloneMatrix(this.resultset);
                this.values = [];
                var newRow = [];
                var row;
                for(var i=0; i<this.resultset.length; i++){
                    var rem = i % measureCount;
                    row = this.resultset[i];
                    if(rem == 0)
                    {//first in measures batch
                        newRow = row.slice();//clone
                        //values = [];
                        newRow.splice(measuresIdx,1);//remove measures' titles column
                        for(var j=measuresIdx; j<newRow.length;j++){
                            newRow[j] = [];    //init measures
                        }
                    }
                    
                    //add values    
                    for(var j=measuresIdx; j<newRow.length;j++){
                       newRow[j].push(row[j+1]);//push measures
                    }
                    
                    if(rem == measureCount -1){//measures batch complete
                        this.values.push(newRow);
                    }   
                }
                
                this.values.splice(0, 0, a1);
            }
        } else {
            // Relational mode
            var sers = pv.uniq(this.resultset.map(function(d){ return d[0]; })),
                cats = pv.uniq(this.resultset.map(function(d){ return d[1]; })),
                vals = this.getMultiValuesFromResultSet(cats, sers);
            
            // Create an initial line with the categories
            // Add table corner
            vals.splice(0, 0, ['x'].concat(sers));
            
            this.values = vals;
        }
    },

    mergeCategoriesAndMeasuresColumns: function(values, measuresStart, measureCount){
        return values.map(function(row){
            // Merge all categories into a single multi-level category.
            var newRow = [row.slice(0, measuresStart)];

            // Merge all measures of each series into one array value
            for(var c = measuresStart ; c < row.length ; c += measureCount){
                
                var value = [];
                for(var m = 0 ; m < measureCount ; m++){
                    value.push(row[c + m]);
                }
                newRow.push(value);
            }

            return newRow;
        });
    },
    
    // @override
    getValues: function(valueIndex){
        // TODO: improve so much copying!

        if(valueIndex == null){
            // Default to base implementation
            return this.values.slice(1).map(function(row){
                return row.slice(1);
            });
            
        } else if(valueIndex < 0 || valueIndex >= this.values.length - 1) { 
            throw new NoDataException(); 
        }
        
        return this.values.slice(1).map(function(row){
            return row.slice(1)[valueIndex];
        });
    },
    
    getMultiValuesFromResultSet: function(cats, sers){
        var sersLength = sers.length,
            numeratedSers = pv.numerate(sers),
            numeratedCats = pv.numerate(cats);
        
        // Initialize array
        var values = [];

        // Create one row per category
        // The 1st column of each row is the category name
        new pvc.Range(cats.length).forEach(function(catIndex){
            var row = new Array(sersLength + 1),
                c = cats[catIndex];
                
            row[0] = c;

            values[catIndex] = row;
        });
        
        // Place resultset values on i,j coordinates of values
        this.resultset.forEach(function(rowIn){
            var s = rowIn[0],
                c = rowIn[1],
                j = numeratedSers[s] + 1, // 1st column is category name
                i = numeratedCats[c],
                // collect values
                val = pv.permute(rowIn, this.valuesIndexes),
                row = values[i];

            row[j] = this.sumOrSetVect(row[j], val);
        }, this);
        
        return values;
    },

    // Sums element by element
    // Assumes v1 and v2, when both present, have the same length.
    sumOrSetVect: function(v1, v2){
        if (v1 == null) {
            return v2;
        }

        var res = [];
        for(var i = 0 ; i < v1.length ; i++){
            if(v1[i] == null) {
                res[i] = v2[i];
            } else if(v2[i] == null){
                res[i] = v1[i];
            } else {
                res[i] = v1[i] + v2[i];
            }
        }

        return res;
    }
    
    /* TODO: DCL - not used?
    //series with x
    getValuesFromResultSet: function(valueIndex, categories, series, categoriesIdx, seriesIdx){
        var categoriesLength = categories.length;
        var seriesLength = series.length;
        var numeratedSeries = pv.numerate(series);
        var numeratedCategories = pv.numerate(categories);

        // Initialize array
        var values = [];
        pv.range(0,categoriesLength).forEach(function(d){
            values[d] = new Array(seriesLength);
            values[d][0] = categories[d];
        });

        // Set array values
        this.resultset.forEach(function(row){
            var i = numeratedCategories[row[categoriesIdx]];
            var j = numeratedSeries[row[seriesIdx]];
            values[i][j] = pvc.sum(values[i][j], row[valueIndex]);
        });

        return values;
    },
    */

});
/**
 * Class of exception thrown when a chart has no data.
 * @class
 */
var NoDataException = function(){};

/**
 * The DataEngine controls access to data.
 * Adapts data from its original format to the internal format.
 * Maintains view-state relating visibility and selection.
 */
pvc.DataEngine = Base.extend({

    chart: null,
    metadata: null,
    resultset: null,
    seriesInRows: false,
    crosstabMode: true,
    translator: null,
    values: null,
    secondAxisValues: null,
    
    // neu
    isMultiValued: false,
    valuesIndexes: null,
    
    _dimensions: null,
    _dimensionList: null,
    
    // Selection control
    _selections: null,
    _selectedCount: 0,
    
    // Data list
    _data: null,
    
    // Data indexed by each dimension in turn
    _dataTree: null,
    
    constructor: function(chart){
        
        this.chart = chart;
        
        this._initDimensions();
        
        // HashTable of selected datums
        // datum.index -> datum
        this._selections = {};
        this._selectedCount = 0;
    },
    
    setCrosstabMode: function(crosstabMode){
        this.crosstabMode = crosstabMode;
    },

    isCrosstabMode: function(){
        return this.crosstabMode;
    },

    setSeriesInRows: function(seriesInRows){
        this.seriesInRows = seriesInRows;
    },

    isSeriesInRows: function(){
        return this.seriesInRows;
    },
    
    setValuesIndexes: function(valuesIndexes){
        this.valuesIndexes = valuesIndexes;
    },
    
    setMultiValued: function(multiValue){
        this.isMultiValued = !!multiValue;
    },
    
    setData: function(metadata, resultset){
        this.metadata  = metadata;
        this.resultset = resultset;

        if(pvc.debug){
            pvc.log("ROWS");
            if(this.resultset){
                this.resultset.forEach(function(row, index){
                    pvc.log("row " + index + ": " + JSON.stringify(row));
                });
            }

            pvc.log("COLS");
            if(this.metadata){
                this.metadata.forEach(function(col){
                    pvc.log("column {" +
                        "index: " + col.colIndex +
                        ", name: "  + col.colName +
                        ", label: "  + col.colLabel +
                        ", type: "  + col.colType + "}"
                    );
                });
            }
        }
    },
    
    // TODO: in multiValued mode, have all options only related to data mapping in one object?
    setDataOptions: function(dataOptions){
        this.dataOptions = dataOptions;
    },
    
    /** 
     * Initializes the currently supported dimensions:
     * 'series' and 'category'.
     */
    _initDimensions: function(){
        // dimensionName -> state
        this._dimensions = {};
        this._dimensionList = [];
        
        var me = this,
            options = this.chart.options;
        
        // Must be first, to match the order in the values matrix (lines)
        this._defDimension('category', {
            fetchValues: function(){ return me._fetchCategories(); },
            calcLabel: options.getCategoryLabel,
            
            // When timeSeries=true, it is the category dimension that is the timeseries...
            timeSeries: options.timeSeries,
            timeSeriesFormat: options.timeSeriesFormat
        });
        
        this._defDimension('series', {
            fetchValues: function(){ return me._fetchSeries(); },
            calcLabel: options.getSeriesLabel
        });
    },
    
    _defDimension: function(name, definition){
        var index = this._dimensionList.length,
            dimension = new pvc.DataDimension(name, index, definition);
        
        this._dimensionList[index] = dimension;
        
        // TODO: can the name of a dimension be a number?
        // name or index lookup
        this._dimensions[name]  = dimension;
        this._dimensions[index] = dimension;
    },
    
    _fetchSeries: function(){
        return this.translator.getColumns();
    },
    
    _fetchCategories: function(){
        return this.translator.getRows();
    },
    
    /**
     * Obtains a data dimension given its name.
     * @returns {DataDimension} The desired data dimension.
     * @throws {Error} If the specified name is not defined.
     */
    getDimension: function(name){
        var dimension = this._dimensions[name];
        if(!dimension){
             throw new Error("Undefined dimension with name '" + name + "'");
        }
        
        return dimension;
    },
    
    /**
     * Obtains a data dimension given its index.
     * @returns {DataDimension} The desired data dimension.
     * @throws {Error} If the specified index is not defined.
     */
    getDimensionByIndex: function(index){
        var dimension = this._dimensionList[index];
        if(!dimension){
             throw new Error("Undefined dimension with index '" + index + "'");
        }
        
        return dimension;
    },
    
    /**
     * Creates and prepares the appropriate translator
     */
    createTranslator: function(){
        
        if(this.isMultiValued){
            pvc.log("Creating MultiValueTranslator");
            
            this.translator = new pvc.MultiValueTranslator(
                            this.valuesIndexes, 
                            this.crosstabMode, 
                            this.dataOptions);  //TODO:
        } else if(this.crosstabMode){
            pvc.log("Creating CrosstabTranslator");
            
            this.translator = new pvc.CrosstabTranslator();
        } else {
            pvc.log("Creating RelationalTranslator");
            
            this.translator = new pvc.RelationalTranslator();
        }

        this.prepareTranslator();
    },
    
    /**
     * Prepares a just created translator
     */
    prepareTranslator: function(){
        this.translator.setData(this.metadata, this.resultset);
        this.translator.prepare(this);
    },
    
    /**
     * Returns some information on the data points
     */
    getInfo: function(){

        var out = "------------------------------------------\n";
        out+= "Dataset Information\n";
        out+= "  Series ( "+ this.getSeriesSize() +" ): " + this.getSeries().slice(0,10) +"\n";
        out+= "  Categories ( "+ this.getCategoriesSize() +" ): " + this.getCategories().slice(0,10) +"\n";
        out+= "  `- secondAxis: " + this.chart.options.secondAxis + "; secondAxisIndex: " + this.chart.options.secondAxisIdx + "\n";
        out+= "------------------------------------------\n";

        return out;
    },

    /**
     * Returns the unique values of a given dimension.
     */
    getDimensionValues: function(name){
        return this.getDimension(name).getValues();
    },
    
    /**
     * Returns the nth unique value of a given dimension.
     */
    getDimensionValue: function(name, index){
        return this.getDimension(name).getValue(index);
    },

    /**
     * Returns the index of the specified value in the specified dimension.
     * Returns -1 if the value is not found.
     */
    getDimensionValueIndex: function(name, value){
        return this.getDimension(name).getIndex(value);
    },
    
    /**
     * Returns the number of unique values of a given dimension.
     */
    getDimensionSize: function(name){
        return this.getDimension(name).getSize();
    },
    
    /**
     * Returns an array with the indexes of visible series values
     */
    getDimensionVisibleIndexes: function(name){
        return this.getDimension(name).getVisibleIndexes();
    },
    
    /**
     * Returns an array with the visible series values
     */
    getDimensionVisibleValues: function(name){
        return this.getDimension(name).getVisibleValues();
    },
        
    /**
     * Toggles the visibility of the nth value of the given dimension.
     * Returns 'undefined' only if 'index' does not exist, and true otherwise.
     */
    toggleDimensionVisible: function(name, index){
        return this.getDimension(name).toggleVisibleByIndex(index);
    },
    
    /**
     * Returns true if the nth value of the 
     * given dimension is visible and false otherwise.
     */
    isDimensionVisible: function(name, index){
        return this.getDimension(name).isVisibleByIndex(index);
    },
    
    /** 
     * Returns the index of a value of the gioven dimension, 
     * given its visible index.
     */
    translateDimensionVisibleIndex: function(name, visibleIndex){
        return this.getDimension(name).translateVisibleIndex(visibleIndex);
    },
    
    // -----------------
    
    /**
     * Returns the unique series values.
     */
    getSeries: function(){
        return this.getDimensionValues('series');
    },

    /**
     * Returns a series on the underlying data given its index.
     * @deprecated use dataEngine.getDimensionValue('series', idx)
     */
    getSerieByIndex: function(idx){
        return this.getSeries()[idx];
    },

    /**
     * Returns an array with the indexes for the series.
     * @deprecated use pv.Range(dataEngine.getDimensionSize('series'))
     */
    getSeriesIndexes: function(){
        // we'll just return everything
        return pv.range(this.getSeries().length);
    },

    /**
     * Returns an array with the indexes of the visible series values.
     */
    getVisibleSeriesIndexes: function(){
        return this.getDimensionVisibleIndexes('series');
    },

    /**
     * Returns an array with the visible categories.
     */
    getVisibleSeries: function(){
        return this.getDimensionVisibleValues('series');
    },

    /**
     * Togles the series visibility based on an index. 
     * Returns true if series is now visible, false otherwise.
     */
    toggleSerieVisibility: function(index){
        return this.toggleDimensionVisible("series", index);
    },
    
    /**
     * Returns the categories on the underlying data
     */
    getCategories: function(){
        return this.getDimensionValues('category');
    },

    getCategoryMin: function() {
        return this.getDimension('category').getMinValue();
    },

    getCategoryMax: function() {
        return this.getDimension('category').getMaxValue();
    },

    /**
     * Returns the categories on the underlying data
     * @deprecated use dataEngine.getDimensionValue('category', idx) instead
     */
    getCategoryByIndex: function(idx){
        return this.getCategories()[idx];
    },

    /**
     * Returns an array with the indexes for the categories
     * @deprecated use pv.Range(dataEngine.getDimensionSize('category'))
     */
    getCategoriesIndexes: function(){
        // we'll just return everything
        return pv.range(this.getCategories().length);
    },

    /**
     * Returns an array with the indexes for the visible categories
     */
    getVisibleCategoriesIndexes: function(){
        return this.getDimensionVisibleIndexes('category');
    },

    /**
     * Returns an array with the visible categories.
     */
    getVisibleCategories: function(){
        return this.getDimensionVisibleValues('category');
    },

    /**
     * Togles the category visibility based on an index. 
     * Returns true if category is now visible, false otherwise.
     */
    toggleCategoryVisibility: function(index){
        return this.toggleDimensionVisible('category', index);
    },
    
    // ---------------------
    
    /**
     * Returns the values for the dataset
     */
    getValues: function(){

        if (this.values == null){
            this.values = this.translator.getValues();
        }
        
        return this.values;
    },

    /**
     * Returns the values for the second axis of the dataset
     * NOTE: this.getSecondAxisValues() values are transposed
     */
    getSecondAxisValues: function(){

        if (this.secondAxisValues == null){
            this.secondAxisValues = this.translator.getSecondAxisValues();
        }
        return this.secondAxisValues;
    },
    
    // DO NOT confuse with setData,
    // which is quite different
    getData: function(){
        if(!this._data){
            this._data = this.translator.getData();
        }
    
        return this._data;
    },
    
    getSecondAxisSeries: function() {
       return this.translator.getSecondAxisSeries();
    },

    getSecondAxisIndices: function() {
        return Object.keys(this.getSecondAxisValues());
    },
    
    /**
     * Returns the object for the second axis 
     * in the form {category: catName, value: val}
     */
    getObjectsForSecondAxis: function(seriesIndex, sortF){
        seriesIndex = seriesIndex || 0;
        var result = [];
        
        // NOTE: this.getSecondAxisValues() values are transposed
        this.getSecondAxisValues()[seriesIndex].forEach(function(v, j){
            if(typeof v != "undefined" /* && v != null */ ){
                result.push({
                    serieIndex: seriesIndex,
                    category:   this.getCategories()[j],
                    value:      v
                });
            }
        }, this);

        if (typeof sortF == "function"){
            return result.sort(sortF);
        }
        
        return result;
    },
    
    /**
     * Returns the maximum value for the second axis of the dataset
     */
    getSecondAxisMax:function(){

        return pv.max(this.getSecondAxisValues()
          .reduce(function(a, b) {  
            return a.concat(b);
          })
          .filter(pvc.nonEmpty));
    },
    
    /**
     * Returns the minimum value for the second axis of the dataset.
     */
    getSecondAxisMin:function(){

        return pv.min(this.getSecondAxisValues()
          .reduce(function(a, b) {  
            return a.concat(b);
          })
          .filter(pvc.nonEmpty));
    },

    /**
     * Returns the transposed values for the dataset.
     */
    getTransposedValues: function(){
    	
        return pv.transpose(pvc.cloneMatrix(this.getValues()));
    },

    /**
     * Returns the transposed values for the visible dataset.
     */
    getVisibleTransposedValues: function(){
        return this.getVisibleSeriesIndexes().map(function(seriesIndex){
            return this.getVisibleValuesForSeriesIndex(seriesIndex);
        }, this);
    },

    /**
     * Returns the values for a given series idx
     */
    getValuesForSeriesIndex: function(idx){
        return this.getValues().map(function(a){
            return a[idx];
        });
    },

    /**
     * Returns the visible values for a given category idx
     */
    getVisibleValuesForSeriesIndex: function(idx){

        var series = this.getValuesForSeriesIndex(idx);
        return this.getVisibleCategoriesIndexes().map(function(idx){
            return series[idx];
        });
    },

    /**
     * Returns the object for a given series idx in the form:
     * <pre>
     * {serieIndex: index, category: categoryValue, value: value}
     * </pre>
     */
    getObjectsForSeriesIndex: function(seriesIndex, sortF){

        var result = [];
        var categories = this.getCategories();

        this.getValues().forEach(function(a, i){
            var value = a[seriesIndex];
            if(typeof value != "undefined" /* && a[seriesIndex] != null */){
                result.push({
                    serieIndex: seriesIndex,
                    category:   categories[i],
                    value:      value
                });
            }
        }, this);

        if (typeof sortF == "function"){
            return result.sort(sortF);
        }
        
        return result;
    },

    /**
     * Returns the values for a given category idx
     */
    getValuesForCategoryIndex: function(idx){
        return this.getValues()[idx];
    },

    /**
     * Returns the visible values for a given category idx
     */
    getVisibleValuesForCategoryIndex: function(idx){

        var cats = this.getValuesForCategoryIndex(idx);
        return this.getVisibleSeriesIndexes().map(function(idx){
            return cats[idx];
        });
    },

    /**
     * Returns the object for a given category idx in the form {serie: value}
     */
    getObjectsForCategoryIndex: function(idx){

        var ar = [];
        this.getValues()[idx].map(function(a,i){
            if(typeof a != "undefined" /* && a!= null */){
                ar.push({
                    categoryIndex: idx,
                    serie: this.getSeries()[i],
                    value: a
                });
            }
        }, this);
        
        return ar;
    },

    /**
     * Returns how many series we have
     */
    getSeriesSize: function(){
        return this.getDimensionSize('series');
    },

    /**
     * Returns how many categories, or data points, we have
     */
    getCategoriesSize: function(){
        return this.getDimensionSize('category');
    },

    /**
     * For every category in the data, 
     * get the maximum of the sum of the series values.
     */
    getCategoriesMaxSumOfVisibleSeries: function(){

        var max = pv.max(
            pv.range(0, this.getCategoriesSize())
            .map(function(idx){
                return pv.sum(
                        this.getVisibleValuesForCategoryIndex(idx)
                            .map(function(e){ return Math.max(0, pvc.number(e)); }));
            }, this));
        
        pvc.log("getCategoriesMaxSumOfVisibleSeries: " + max);
        
        return max;
    },

    /**
     * For every series in the data, 
     * get the maximum of the sum of the category values. 
     * If only one series, 
     * gets the sum of the value. 
     * Useful to build pieCharts.
     */
    getVisibleSeriesMaxSum: function(){

        var max = pv.max(this.getVisibleSeriesIndexes().map(function(idx){
            return pv.sum(this.getValuesForSeriesIndex(idx).filter(pvc.nonEmpty));
        }, this));
        
        pvc.log("getVisibleSeriesMaxSum: " + max);
        
        return max;
    },

    /**
     * Get the maximum value in all series
     */
    getVisibleSeriesAbsoluteMax: function(){

        var max = pv.max(this.getVisibleSeriesIndexes().map(function(idx){
            return pv.max(this.getValuesForSeriesIndex(idx).filter(pvc.nonEmpty));
        }, this));
        
        pvc.log("getVisibleSeriesAbsoluteMax: " + max);
        
        return max;
    },

    /**
     * Get the minimum value in all series
     */
    getVisibleSeriesAbsoluteMin: function(){

        var min = pv.min(this.getVisibleSeriesIndexes().map(function(idx){
            return pv.min(this.getValuesForSeriesIndex(idx).filter(pvc.nonEmpty));
        }, this));
        
        pvc.log("getVisibleSeriesAbsoluteMin: " + min);
        
        return min;
    },
    
    // --------------------------
    // For searching
    _getDataTree: function(){
        if(!this._dataTree){
            this._dataTree = this._createDataTree();
        }
    
        return this._dataTree;
    },
    
    // Indexes data on a hierarchical index,
    //  in the order of _dimensionList.
    // The values of key dimensions of datums
    //  must identify them.
    _createDataTree: function(){
        
        function recursive(parentDimNode, datum, dimIndex /* level*/){
            // parentDimNode has one child per != keyIndex 
            // that data have on this dimension, on this path.
            var dimName  = this._dimensionList[dimIndex].name,
                keyIndex = datum.elem[dimName].leafIndex,
                dimNode = parentDimNode[keyIndex];

            if(dimIndex === lastD){
                // Must be unique...
                if(parentDimNode[keyIndex]){
                    throw new Error("Non-unique dimension list.");
                }
                
                // Index datum!
                parentDimNode[keyIndex] = datum;
                
            } else {
                if(!dimNode){
                    dimNode = parentDimNode[keyIndex] = [];
                }
                
                recursive.call(this, dimNode, datum, dimIndex + 1);
            }
        }
        
        var tree = [],
            lastD = this._dimensionList.length - 1;
        
        this.getData().forEach(function(datum){
            recursive.call(this, tree, datum, 0);
        }, this);
        
        return tree;
    },
    
    /**
     * Finds a datum given a datum key.
     * If a matching datum cannot be found then,
     * if the argument 'createNull' is true,
     * a «null datum» is returned, 
     * otherwise, 
     * null is returned.
     * 
     * If an underspecified datum key is given, 
     * undefined is returned.
     * 
     * A datum key is an object 
     * with one property per data dimension.
     * 
     * The property name is the data dimension name,
     * and the property value is the index 
     * of the value in that dimension.
     * @example
     * <pre>
     * var datumKey = {
     *     series: 1,
     *     category: 23
     * };
     * </pre>
     */
    findDatum: function(datumKey, createNull){
        var parentDimNode = this._getDataTree();
        
        for(var d = 0, D = this._dimensionList.length ; d < D ; d++){
            
            var dimName  = this._dimensionList[d].name,
                keyIndex = datumKey[dimName];
            
            if(keyIndex == null){
                // Underspecified reference
                return; // undefined (or, could return more than one...)
            }
            
            var dimNode = parentDimNode[keyIndex];
            if(dimNode == null){
                return createNull ? 
                        this._createNullDatum(datumKey) : 
                        null; // not found
            }
            
            parentDimNode = dimNode;
        }
        
        // will be a datum
        return parentDimNode;
    },
    
    // TODO: are null datums really necessary?
    _createNullDatum: function(datumRef){
        // TODO: hardcoded for 2 dimensions
        return new pvc.Datum(
                    this, 
                    -1, 
                    {
                        series:   this._dimensions['series'].getElement(datumRef.series),
                        category: this._dimensions['category'].getElement(datumRef.category)
                    },
                    null);
    },
    
    // ---------------------
    // Selections - Many datums
    
    /**
     * Deselects any selected data.
     */
    clearSelections: function(){
         pvc.forEachOwn(this._selections, function(datum){
            datum._deselect();
        });
        
        this._selections = {};
        this._selectedCount = 0;
    },
    
    /**
     * Returned the number of selected datums.
     */
    getSelectedCount: function(){
        return this._selectedCount;
    },
    
    /**
     * Returns an array with the selected datums.
     * @return {Datum[]} The selected datums.
     */
    getSelections: function(){
        var selectionList = [];
        
        if(this._selections){
            pvc.forEachOwn(this._selections, function(datum){
                selectionList.push(datum);
            });
        }
        
        return selectionList;
    },
    
    /**
     * Changes the selected state of the given datums 
     * to the state 'select'.
     * @return {boolean} true if any datums changed their state.
     */
    setSelections: function(data, select){
        var anyChanged = false;
        
        if(data){
            data.forEach(function(datum){
                if(datum.setSelected(select)){
                    // already called _onDatumSelectedChanged, below
                    anyChanged = true;
                }
            });
        }
        
        return anyChanged;
    },
        
    /**
     * Pseudo-toggles the selected state of the given datums.
     * Deselects all if all were selected,
     * selects all otherwise.
     */
    toggleSelections: function(data){
        if(!this.setSelections(data, true)){
            this.setSelections(data, false);
        }
    },
    
    // Called by a Datum when its selected state changed
    _onDatumSelectedChanged: function(datum, selected){
        if(selected){
            this._selections[datum.index] = datum;
            this._selectedCount++;
        } else {
            delete this._selections[datum.index];
            this._selectedCount--;
        }
    },
    
    // ---------------------
    // Querying
    
    /**
     * Returns all the datums that 
     * satisfy the given 'where' specification.
     * @see #forEachWhere
     */
    getWhere: function(where, keyArgs){
        var data = [];
        
        this.forEachWhere(where, function(datum){
            data.push(datum);
        });
        
        var sorter = pvc.get(keyArgs, 'sorter');
        if(sorter){
            // Sorts in-place
            data.sort(sorter);
        }

        return data;
    },
    
    /**
     * Calls the specified function for each datum that 
     * satisfies the given 'where' specification.
     * 
     * The format of the where specification is:
     * where := [orWhere1, orWhere2, ...]
     * 
     * orWhere:= {
     *      // All of the dimension filters must match:
     *      andDimName1: [orBaseValue1, orBaseValue2, ...],
     *      andDimName2: [orBaseValue1, orBaseValue2, ...],
     *      ...
     * }
     * 
     * @example:
     * All the datums of the 'Green' series 
     * unioned with
     * all the datums of the 'Blue' series that have
     * the 'Bread' or the 'Butter' category.
     * <pre>
     * [
     *      {series: ['Green']}, // OR
     *      {series: ['Blue'], category: ['Bread', 'Butter']}
     * ]
     * </pre>
     */
    forEachWhere: function(where, fun, ctx){
        // DimA X DimB X DimC X ...

        var D = this._dimensionList.length,
            firstDimNode = this._getDataTree(),
            seen = {};
        
        // CROSS JOIN
        function recursive(dimNode, orWhere, d /* level */){
            if(d === D){ // one more
                // dimNode is a datum!
                var id = dimNode.index;
                if(!seen.hasOwnProperty(id)){
                    seen[id] = true;
                    fun.call(ctx, dimNode);
                }
            } else {
                var orIndexes = orWhere[d];
                if(orIndexes){
                    // Dimension is constrained by 'where'
                    orIndexes.forEach(function(orIndex){
                        // Index, along this path has any datums?
                        var childDimNode = dimNode[orIndex];
                        if(childDimNode){
                            recursive.call(this, childDimNode, orWhere, d + 1);
                        }
                    }, this);
                } else {
                    // Dimension is not constrained by 'where'
                    // Traverse only values' indexes that have datums, along this path
                    pvc.forEachOwn(dimNode, function(childDimNode /*, orIndexText*/){
                        
                        recursive.call(this, childDimNode, orWhere, d + 1);
                    });
                }
            }
        }
        
        // For each OR where clause
        where.forEach(function(orWhere){
            recursive.call(this, firstDimNode, this._expandOrWhereClause(orWhere), 0);
        }, this);
    },
    
    /*
     * orWhere: {
     *      // All of the dimension filters must match:
     *      andDimName1: [orBaseValue1, orBaseValue2, ...],
     *      andDimName2: [orBaseValue1, orBaseValue2, ...],
     *      ...
     * }
     * 
     * returns:
     * expandedOrWhere: [
     *      // All of the dimension filters must match:
     *      andDimIndex1: [orValueIndex1, orValueIndex2, orValueIndex3, ...],
     *      
     *      andDimIndex2: [orValueIndex1, orValueIndex2, ...],
     *      
     *      ...
     * ]
     */
    _expandOrWhereClause: function(orWhere){
        var expandedOrWhere = [];
        
        // Expand values
        pvc.forEachOwn(orWhere, function(orBaseValueList, andDimName){
            var dimension = this.getDimension(andDimName),
                orValueIndexList = expandedOrWhere[dimension.index] = [];
                
                // For each possible base value
                orBaseValueList.forEach(function(orBaseValue){
                    
                    // All descendant values of
                    dimension.forEachDescendantOrSelf(
                        orBaseValue, 
                        function(/* @ignore */orValue, orValueIndex){
                            orValueIndexList.push(orValueIndex);
                        });
                });
        }, this);
        
        return expandedOrWhere;
    }
});
pvc.Abstract = Base.extend({
    invisibleLineWidth: 0.001,
    defaultLineWidth:   1.5
});

/**
 * The main chart component
 */
pvc.BaseChart = pvc.Abstract.extend({

    isPreRendered: false,

    /**
     * Indicates if the chart is rendering with animation.
     */
    isAnimating:   false,
    _renderAnimationStart: false,

    // data
    dataEngine: null,
    resultset:  [],
    metadata:   [],

    // panels
    basePanel:   null,
    titlePanel:  null,
    legendPanel: null,

    legendSource: "series",
    colors: null,

    _renderVersion: 0,
    
    // renderCallback
    renderCallback: undefined,

    constructor: function(options) {

        this.options = pvc.mergeDefaults({}, pvc.BaseChart.defaultOptions, options);
    },

    /**
     * Creates an appropriate DataEngine
     * @virtual
     */
    createDataEngine: function() {
        return new pvc.DataEngine(this);
    },

    /**
     * Processes options after user options and defaults have been merged.
     * Applies restrictions,
     * performs validations and
     * options values implications.
     */
    _processOptions: function(){

        var options = this.options;

        this._processOptionsCore(options);
        
        /* DEBUG options */
        if(pvc.debug && options){
            pvc.log("OPTIONS:\n" + JSON.stringify(options));
        }

        return options;
    },

    /**
     * Processes options after user options and default options have been merged.
     * Override to apply restrictions, perform validation or
     * options values implications.
     * When overriden, the base implementation should be called.
     * The implementation must be idempotent -
     * its successive application should yield the same results.
     * @virtual
     */
    _processOptionsCore: function(options){
        // Disable animation if environment doesn't support it
        if (!$.support.svg || pv.renderer() === 'batik') {
            options.animate = false;
        }

        var margins = options.margins;
        if(margins){
            options.margins = this._parseMargins(margins);
        }
    },
    
    /**
     * Building the visualization has 2 stages:
     * First the preRender method prepares and builds 
     * every object that will be used.
     * Later the render method effectively renders.
     */
    preRender: function() {
        /* Increment render version to allow for cache invalidation  */
        this._renderVersion++;
        this.isPreRendered = false;

        pvc.log("Prerendering in pvc");

        // If we don't have data, we just need to set a "no data" message
        // and go on with life.
        if (!this.allowNoData && this.resultset.length === 0) {
            throw new NoDataException();
        }

        // Now's as good a time as any to completely clear out all
        //  tipsy tooltips
        pvc.removeTipsyLegends();
        
        /* Options may be changed between renders */
        this._processOptions();

        // Initialize the data engine and its translator
        this.initDataEngine();

        // Create color schemes
        this.colors = pvc.createColorScheme(this.options.colors);
        this.secondAxisColor = pvc.createColorScheme(this.options.secondAxisColor);

        // Initialize chart panels
        this.initBasePanel();

        this.initTitlePanel();

        this.initLegendPanel();

        // ------------

        this.isPreRendered = true;
    },

    /**
     * Initializes the data engine
     */
    initDataEngine: function() {
        var de = this.dataEngine;
        if(!de){
            de = this.dataEngine = this.createDataEngine();
        }
//        else {
//            //de.clearDataCache();
//        }

        de.setData(this.metadata, this.resultset);
        de.setCrosstabMode(this.options.crosstabMode);
        de.setSeriesInRows(this.options.seriesInRows);
        // TODO: new
        de.setMultiValued(this.options.isMultiValued);

        // columns where measure values are, for relational data
        de.setValuesIndexes(this.options.measuresIndexes);

        de.setDataOptions(this.options.dataOptions);

        // ---

        de.createTranslator();

        if(pvc.debug){ 
            pvc.log(this.dataEngine.getInfo()); 
        }
    },

    /**
     * Creates and initializes the base (root) panel.
     */
    initBasePanel: function() {
        // Since we don't have a parent panel
        // we need to manually create the points.
        this.originalWidth  = this.options.width;
        this.originalHeight = this.options.height;
        
        this.basePanel = new pvc.BasePanel(this);
        this.basePanel.setSize(this.options.width, this.options.height);
        
        var margins = this.options.margins;
        if(margins){
            this.basePanel.setMargins(margins);
        }
        
        this.basePanel.create();
        this.basePanel.applyExtensions();

        this.basePanel.getPvPanel().canvas(this.options.canvas);
    },

    /**
     * Creates and initializes the title panel,
     * if the title is specified.
     */
    initTitlePanel: function(){
        if (this.options.title != null && this.options.title != "") {
            this.titlePanel = new pvc.TitlePanel(this, {
                title:      this.options.title,
                anchor:     this.options.titlePosition,
                titleSize:  this.options.titleSize,
                titleAlign: this.options.titleAlign
            });

            this.titlePanel.appendTo(this.basePanel); // Add it
        }
    },

    /**
     * Creates and initializes the legend panel,
     * if the legend is active.
     */
    initLegendPanel: function(){
        if (this.options.legend) {
            this.legendPanel = new pvc.LegendPanel(this, {
                anchor: this.options.legendPosition,
                legendSize: this.options.legendSize,
                align: this.options.legendAlign,
                minMarginX: this.options.legendMinMarginX,
                minMarginY: this.options.legendMinMarginY,
                textMargin: this.options.legendTextMargin,
                padding: this.options.legendPadding,
                textAdjust: this.options.legendTextAdjust,
                shape: this.options.legendShape,
                markerSize: this.options.legendMarkerSize,
                drawLine: this.options.legendDrawLine,
                drawMarker: this.options.legendDrawMarker
            });

            this.legendPanel.appendTo(this.basePanel); // Add it
        }
    },

    /**
     * Render the visualization.
     * If not pre-rendered, do it now.
     */
    render: function(bypassAnimation, rebuild) {
        try{
            this._renderAnimationStart = 
            this.isAnimating = this.options.animate && !bypassAnimation;
            
            if (!this.isPreRendered || rebuild) {
                this.preRender();
            }

            if (this.options.renderCallback) {
                this.options.renderCallback.call(this);
            }

            // When animating, renders the animation's 'start' point
            this.basePanel.getPvPanel().render();

            // Transition to the animation's 'end' point
            if (this.isAnimating) {
                this._renderAnimationStart = false;
                
                var me = this;
                this.basePanel.getPvPanel()
                        .transition()
                        .duration(2000)
                        .ease("cubic-in-out")
                        .start(function(){
                            me.isAnimating = false;
                            me._onRenderEnd(true);
                        });
            } else {
                this._onRenderEnd(false);
            }
            
        } catch (e) {
            if (e instanceof NoDataException) {

                if (!this.basePanel) {
                    pvc.log("No panel");
                    this.initBasePanel();
                }

                pvc.log("creating message");
                var pvPanel = this.basePanel.getPvPanel(), 
                    message = pvPanel.anchor("center").add(pv.Label);
                
                message.text("No data found");

                this.basePanel.extend(message, "noDataMessage_");
                
                pvPanel.render();

            } else {
                // We don't know how to handle this
                pvc.logError(e.message);
                throw e;
            }
        }
    },

    /**
     * Animation
     */
    animate: function(start, end) {
        return this._renderAnimationStart ? start : end;
    },
    
    /**
     * Called when a render has ended.
     * When the render performed an animation
     * and the 'animated' argument will have the value 'true'.
     *
     * The default implementation calls the base panel's
     * #_onRenderEnd method.
     * @virtual
     */
    _onRenderEnd: function(animated){
        this.basePanel._onRenderEnd(animated);
    },

    /**
     * Method to set the data to the chart.
     * Expected object is the same as what comes from the CDA: 
     * {metadata: [], resultset: []}
     */
    setData: function(data, options) {
        this.setResultset(data.resultset);
        this.setMetadata(data.metadata);

        $.extend(this.options, options);
    },

    /**
     * Sets the resultset that will be used to build the chart.
     */
    setResultset: function(resultset) {
        this.resultset = resultset;
        if (resultset.length == 0) {
            pvc.log("Warning: Resultset is empty");
        }
    },

    /**
     * Sets the metadata that, optionally, 
     * will give more information for building the chart.
     */
    setMetadata: function(metadata) {
        this.metadata = metadata;
        if (metadata.length == 0) {
            pvc.log("Warning: Metadata is empty");
        }
    },

    /**
     * This is the method to be used for the extension points
     * for the specific contents of the chart. already ge a pie
     * chart! Goes through the list of options and, if it
     * matches the prefix, execute that method on the mark.
     * WARNING: It's the user's responsibility to make sure that
     * unexisting methods don't blow this.
     */
    extend: function(mark, prefix, keyArgs) {
        // if mark is null or undefined, skip
        if(pvc.debug){
            pvc.log("Applying Extension Points for: '" + prefix +
                    "'" + (mark ? "" : "(target mark does not exist)"));
        }

        if (mark) {
            var points = this.options.extensionPoints;
            if(points){
                for (var p in points) {
                    // Starts with
                    if(p.indexOf(prefix) === 0){
                        var m = p.substring(prefix.length);

                        // Not everything that is passed to 'mark' argument
                        //  is actually a mark...(ex: scales)
                        // Not locked and
                        // Not intercepted and
                        if(mark.isLocked && mark.isLocked(m)){
                            pvc.log("* " + m + ": locked extension point!");
                        } else if(mark.isIntercepted && mark.isIntercepted(m)) {
                            pvc.log("* " + m + ":" + JSON.stringify(v) + " (controlled)");
                        } else {
                            var v = points[p];

                            if(pvc.debug){
                                pvc.log("* " + m + ": " + JSON.stringify(v));
                            }

                            // Distinguish between mark methods and properties
                            if (typeof mark[m] === "function") {
                                mark[m](v);
                            } else {
                                mark[m] = v;
                            }
                        }
                    }
                }
            }
        }
    },

    /**
     * Obtains the specified extension point.
     * Arguments are concatenated with '_'.
     */
    _getExtension: function(extPoint) {
        var points = this.options.extensionPoints;
        if(!points){
            return undefined; // ~warning
        }

        extPoint = pvc.arraySlice.call(arguments).join('_');
        return points[extPoint];
    },

    isOrientationVertical: function(orientation) {
        return (orientation || this.options.orientation) === "vertical";
    },

    isOrientationHorizontal: function(orientation) {
        return (orientation || this.options.orientation) == "horizontal";
    },

    /**
     * Converts a css-like shorthand margin string
     * to a margins object.
     *
     * <ol>
     *   <li> "1" - {all: 1}</li>
     *   <li> "1 2" - {top: 1, left: 2, right: 2, bottom: 1}</li>
     *   <li> "1 2 3" - {top: 1, left: 2, right: 2, bottom: 3}</li>
     *   <li> "1 2 3 4" - {top: 1, right: 2, bottom: 3, left: 4}</li>
     * </ol>
     */
    _parseMargins: function(margins){
        if(margins != null){
            if(typeof margins === 'string'){

                var comps = margins.split(/\s+/);
                switch(comps.length){
                    case 1:
                        margins = {all: comps[0]};
                        break;
                    case 2:
                        margins = {top: comps[0], left: comps[1], right: comps[1], bottom: comps[0]};
                        break;
                    case 3:
                        margins = {top: comps[0], left: comps[1], right: comps[1], bottom: comps[2]};
                        break;
                    case 4:
                        margins = {top: comps[0], right: comps[2], bottom: comps[3], left: comps[4]};
                        break;

                    default:
                        pvc.log("Invalid 'margins' option value: " + JSON.stringify(margins));
                        margins = null;
                }
            } else if (typeof margins === 'number') {
                margins = {all: margins};
            } else if (typeof margins !== 'object') {
                pvc.log("Invalid 'margins' option value: " + JSON.stringify(margins));
                margins = null;
            }
        }

        return margins;
    }
}, {
    // NOTE: undefined values are not considered by $.extend
    // and thus BasePanel does not receive null properties...
    defaultOptions: {
        canvas: null,

        width:  400,
        height: 300,

        orientation: 'vertical',

        extensionPoints:  undefined,
        
        crosstabMode:     true,
        isMultiValued:    false,
        seriesInRows:     false,
        measuresIndexes:  undefined,
        dataOptions:      undefined,
        getCategoryLabel: undefined,
        getSeriesLabel:   undefined,

        timeSeries:       undefined,
        timeSeriesFormat: undefined,

        animate: true,

        title:         null,
        titlePosition: "top", // options: bottom || left || right
        titleAlign:    "center", // left / right / center
        titleSize:     undefined,

        legend:           false,
        legendPosition:   "bottom",
        legendSize:       undefined,
        legendAlign:      undefined,
        legendMinMarginX: undefined,
        legendMinMarginY: undefined,
        legendTextMargin: undefined,
        legendPadding:    undefined,
        legendTextAdjust: undefined,
        legendShape:      undefined,
        legendDrawLine:   undefined,
        legendDrawMarker: undefined,
        legendMarkerSize: undefined,
        
        colors: null,

        secondAxis: false,
        secondAxisIdx: -1,
        secondAxisColor: undefined,

        tooltipFormat: function(s, c, v, datum) {
            return s + ", " + c + ":  " + this.chart.options.valueFormat(v) +
                   (datum && datum.percent ? ( " (" + datum.percent.label + ")") : "");
        },

        valueFormat: function(d) {
            return pv.Format.number().fractionDigits(0, 2).format(d);
            // pv.Format.number().fractionDigits(0, 10).parse(d));
        },

        stacked: false,
        
        percentageNormalized: false,

        percentValueFormat: function(d){
            return pv.Format.number().fractionDigits(0, 2).format(d) + "%";
        },

        clickable:  false,
        selectable: false,

        clickAction: function(s, c, v) {
            pvc.log("You clicked on series " + s + ", category " + c + ", value " + v);
        },

        renderCallback: undefined,

        margins: undefined
    }
});
/**
 * Base panel. 
 * A lot of them will exist here, with some common properties. 
 * Each class that extends pvc.base will be 
 * responsible to know how to use it.
 */
pvc.BasePanel = pvc.Abstract.extend({

    chart: null,
    _parent: null,
    _children: null,
    type: pv.Panel, // default one
    height: null,
    width: null,
    anchor: "top",
    pvPanel: null,
    fillColor: "red",
    margins: null,

    constructor: function(chart, options) {

        this.chart = chart;

        $.extend(this, options);

        this.margins = {
            top:    0,
            right:  0,
            bottom: 0,
            left:   0
        };
    },

    create: function() {

        if (!this._parent) {
            // Should be created for the vis panel only
            this.pvPanel = new pv.Panel();
            //this.extend(this.pvPanel, "base_");
        } else {
            this.pvPanel = this._parent.pvPanel.add(this.type);
        }
        
        this.pvPanel
            .width(this._originalSize.width)
            .height(this._originalSize.height);
    },

    /**
     * Adds a panel to children array.
     */
    _addChild: function(child){
        if(child._parent){
            throw new Error("Child already has a parent.");
        }
        
        child._parent = this;
        (this._children || (this._children = [])).push(child);
    },

    /**
     * Create the panel, appending it to the previous one using
     * a specified anchor.
     *
     * Will: 
     * 1) create the panel
     * 2) subtract it's size from the previous panel's size 
     * 3) append it to the previous one in the correct position.
     */
    appendTo: function(parent) {
        if(parent){
            parent._addChild(this);
        }
        
        this.create();
        this.applyExtensions();

        // Layout child
        var a = this.anchor,
            ao = this.anchorOrtho(),
            aol = this.anchorOrthoLength(),
            margins = this._parent.margins;

        this._parent[aol] -= this[aol];

        // Place the child
        this.pvPanel[a ](margins[a ]);
        this.pvPanel[ao](margins[ao]);

        margins[a] += this[aol];
    },
    
    /**
     * Override to apply specific extensions points.
     * @virtual
     */
    applyExtensions: function(){
        if (!this._parent) {
            this.extend(this.pvPanel, "base_");
        }
    },

    /**
     * This is the method to be used for the extension points
     * for the specific contents of the chart. already ge a pie
     * chart! Goes through the list of options and, if it
     * matches the prefix, execute that method on the mark.
     * WARNING: It's the user's responsibility to make sure that
     * unexisting methods don't blow this.
     */
    extend: function(mark, prefix) {
        this.chart.extend(mark, prefix);
    },

    /**
     * Obtains the specified extension point.
     * Arguments are concatenated with '_'.
     */
    _getExtension: function(extPoint) {
        return this.chart._getExtension.apply(this.chart, arguments);
    },

    /**
     * Called when a render has ended.
     * When the render performed an animation
     * and the 'animated' argument will have the value 'true'.
     *
     * The default implementation calls each child panel's
     * #_onRenderEnd method.
     * @virtual
     */
    _onRenderEnd: function(animated){
        if(this._children){
            this._children.forEach(function(child){
                child._onRenderEnd(animated);
            });
        }
    },
    
    /**
     * Sets the size for the panel, 
     * for when the parent panel is undefined
     */
    setSize: function(w, h) {
        this.width  = w;
        this.height = h;

        this._originalSize = {
            width:  w,
            height: h
        };
    },

    setAnchoredSize: function(size){
        if (this.isAnchorTopOrBottom()) {
            this.setSize(this._parent.width, size);
        } else {
            this.setSize(size, this._parent.height);
        }
    },

    /**
     * Returns the width of the Panel
     */
    getWidth: function() {
        return this.width;
    },

    /**
     * Returns the height of the Panel
     */
    getHeight: function() {
        return this.height;
    },
    
    setWidth: function(w) {
        this.width = w;

        (this._originalSize || (this._originalSize = {})).width = w;
    },
    
    setHeight: function(h) {
        this.height = h;

        (this._originalSize || (this._originalSize = {})).height = h;
    },

    consumeFreeClientSize: function(){
        if(this._parent){
            this.setSize(this._parent.width, this._parent.height);
        }
    },

    /**
     * Sets the margins of the panel.
     * Must be called after #setSize and before any child panels are added.
     */
    setMargins: function(margins){
        var m = margins.all;
        if(m != null){
            var allEqualMargins = pv.dict(Object.keys(this.margins), function(){ return m; });
            this.setMargins(allEqualMargins);
        } else {
            for(var anchor in margins){
                if(this.margins.hasOwnProperty(anchor)){
                    m = +margins[anchor]; // -> to number
                    if(m >= 0){
                        this.margins[anchor] = m;
                        this[this.anchorOrthoLength(anchor)] -= m;
                    }
                }
            }
        }
    },

    /**
     * Returns the underlying protovis Panel.
     * If 'layer' is specified returns
     * the protovis panel for the specified layer name.
     */
    getPvPanel: function(layer) {
        if(!layer){
            return this.pvPanel;
        }

        if(!this._parent){
            throw new Error("Layers are not possible on a root panel.");
        }

        if(!this.pvPanel){
            throw new Error(
               "Cannot access layer panels without having created the main panel.");
        }

        var pvPanel = null;
        if(!this._layers){
            this._layers = {};
        } else {
            pvPanel = this._layers[layer];
        }

        if(!pvPanel){
            pvPanel = this._parent.pvPanel.add(this.type)
                            .extend(this.pvPanel);

            this.initLayerPanel(pvPanel, layer);

            this._layers[layer] = pvPanel;
        }

        return pvPanel;
    },
    
    /**
     * Initializes a new layer panel.
     * @virtual
     */
    initLayerPanel: function(pvPanel, layer){
    },

    _createPropDatumTooltip: function(){
        var myself = this,
            tooltipFormat = this.chart.options.tooltipFormat;

        return function(){
            // TODO: for the no series case... 's' assumes the value "Series"
            // added by the translator
            var tooltip = '',
                datum = this.datum();
            if(datum){
                tooltip = datum.value;
                if(tooltipFormat){
                    var s = datum.elem.series.rawValue,
                        c = datum.elem.category.rawValue;

                    tooltip = tooltipFormat.call(myself, s, c, tooltip, datum);
                }
            }

            return tooltip;
        };
    },

    /**
     * Returns true if the anchor is one of the values 'top' or
     * 'bottom'.
     */
    isAnchorTopOrBottom: function(anchor) {
        if (!anchor) {
            anchor = this.anchor;
        }
        return anchor === "top" || anchor === "bottom";
    },

    anchorOrtho: function(anchor) {
        if (!anchor) {
            anchor = this.anchor;
        }
        return pvc.BasePanel.relativeAnchor[anchor];
    },

    anchorOrthoMirror: function(anchor) {
        if (!anchor) {
            anchor = this.anchor;
        }
        return pvc.BasePanel.relativeAnchorMirror[anchor];
    },

    anchorOpposite: function(anchor) {
        if (!anchor) {
            anchor = this.anchor;
        }
        return pvc.BasePanel.oppositeAnchor[anchor];
    },

    anchorLength: function(anchor) {
        if (!anchor) {
            anchor = this.anchor;
        }
        return pvc.BasePanel.parallelLength[anchor];
    },

    anchorOrthoLength: function(anchor) {
        if (!anchor) {
            anchor = this.anchor;
        }
        return pvc.BasePanel.orthogonalLength[anchor];
    },

    isOrientationVertical: function(orientation) {
        return this.chart.isOrientationVertical(orientation);
    },

    isOrientationHorizontal: function(orientation) {
        return this.chart.isOrientationHorizontal(orientation);
    }
}, {
    // Determine what is the associated method to
    // call to position the labels correctly
    relativeAnchor: {
        top: "left",
        bottom: "left",
        left: "bottom",
        right: "bottom"
    },

    relativeAnchorMirror: {
        top: "right",
        bottom: "right",
        left: "top",
        right: "top"
    },

    oppositeAnchor: {
        top: "bottom",
        bottom: "top",
        left: "right",
        right: "left"
    },

    parallelLength: {
        top: "width",
        bottom: "width",
        right: "height",
        left: "height"
    },

    orthogonalLength: {
        top: "height",
        bottom: "height",
        right: "width",
        left: "width"
    }
});

/*
 * Title panel. Generates the title. Specific options are: <i>title</i> - text.
 * Default: null <i>titlePosition</i> - top / bottom / left / right. Default:
 * top <i>titleSize</i> - The size of the title in pixels. Default: 25
 * 
 * Has the following protovis extension points:
 * 
 * <i>title_</i> - for the title Panel <i>titleLabel_</i> - for the title
 * Label
 */
pvc.TitlePanel = pvc.BasePanel.extend({

    pvLabel: null,
    anchor: "top",
    titlePanel: null,
    title: null,
    titleSize: 25,
    titleAlign: "center",
    font: "14px sans-serif",

//    constructor: function(chart, options) {
//        this.base(chart, options);
//    },

    create: function() {
        // Size will depend on positioning and font size mainly
        this.setAnchoredSize(this.titleSize);
        
        this.base();

        // Extend title
        this.extend(this.pvPanel, "title_");

        // Label
        var rotationByAnchor = {
            top: 0,
            right: Math.PI / 2,
            bottom: 0,
            left: -Math.PI / 2
        };

        this.pvLabel = this.pvPanel.add(pv.Label)
            .text(this.title)
            .font(this.font)
            .textAlign("center")
            .textBaseline("middle")
            .bottom(this.height / 2)
            .left(this.width / 2)
            .textAngle(rotationByAnchor[this.anchor]);

        // Cases:
        if (this.titleAlign == "center") {
            this.pvLabel.bottom(this.height / 2).left(this.width / 2);
        } else {
            this.pvLabel.textAlign(this.titleAlign);

            if (this.isAnchorTopOrBottom()) {
                this.pvLabel
                    .bottom(null)
                    .left(null) // reset
                    [this.titleAlign](0)
                    .bottom(this.height / 2);

            } else if (this.anchor == "right") {
                if (this.titleAlign == "left") {
                    this.pvLabel
                        .bottom(null)
                        .top(0);
                } else {
                    this.pvLabel
                        .bottom(0);
                }
            } else if (this.anchor == "left") {
                if (this.titleAlign == "right") {
                    this.pvLabel
                        .bottom(null)
                        .top(0);
                } else {
                    this.pvLabel
                        .bottom(0);
                }
            }
        }

        // Extend title label
        this.extend(this.pvLabel, "titleLabel_");
    }
});

/*
 * Legend panel. Generates the legend. Specific options are:
 * <i>legend</i> - text. Default: false
 * <i>legendPosition</i> - top / bottom / left / right. Default: bottom
 * <i>legendSize</i> - The size of the legend in pixels. Default: 25
 *
 * Has the following protovis extension points:
 *
 * <i>legend_</i> - for the legend Panel
 * <i>legendRule_</i> - for the legend line (when applicable)
 * <i>legendDot_</i> - for the legend marker (when applicable)
 * <i>legendLabel_</i> - for the legend label
 * 
 */
pvc.LegendPanel = pvc.BasePanel.extend({

  _parent: null,
  pvRule: null,
  pvDot: null,
  pvLabel: null,

  anchor: "bottom",
  align: "left",
  pvLegendPanel: null,
  legend: null,
  legendSize: null,
  minMarginX: 8,
  minMarginY: 20,
  textMargin: 6,
  padding: 24,
  textAdjust: 7,
  shape: "square",
  markerSize: 15,
  drawLine: false,
  drawMarker: true,

  constructor: function(chart, options){
    this.base(chart,options);
  },

  create: function(){
    var myself = this,
      c, cLen,
      c1 = this.chart.colors(),
      c2 = this.chart.secondAxisColor(),
      x,y;

    //pvc.log("Debug PMartins");
    
    var data = this.chart.legendSource == "series"
               ? this.chart.dataEngine.getSeries()
               : this.chart.dataEngine.getCategories();
    
    cLen = data.length;

    if (this.chart.options.secondAxis) {
        var args = this.chart.dataEngine.getSecondAxisSeries();
        data = data.concat(args);
    }
    
    c = function(arg){
        return arg < cLen
               ? c1.apply(this, arguments)
               : c2.call(this, arg - cLen);
    };
    
    // Determine the size of the biggest cell
    // Size will depend on positioning and font size mainly
    var maxTextLen = 0;
    for (var i in data){
        if(maxTextLen < data[i].length){
            maxTextLen = data[i].length;
        }
    }
    
    var cellsize = this.markerSize + maxTextLen * this.textAdjust;

    this.setAnchoredSize(this.legendSize);

    var realxsize, realysize;
    if (this.anchor == "top" || this.anchor == "bottom"){
      var maxperline = data.length;

      //if the legend is bigger than the available size, multi-line and left align
      if(maxperline*(cellsize + this.padding) - this.padding + myself.minMarginX > this.width){
        this.align = "left";
        maxperline = Math.floor((this.width + this.padding - myself.minMarginX)/(cellsize + this.padding));
      }
      realxsize = maxperline*(cellsize + this.padding) + myself.minMarginX - this.padding;
      realysize = myself.padding*(Math.ceil(data.length/maxperline));

      if(this.height == null){
          this.setHeight(realysize);
      }

      //changing margins if the alignment is not "left"
      if(this.align == "right"){
        myself.minMarginX = this.width - realxsize;
      }
      else if (this.align == "center"){
        myself.minMarginX = (this.width - realxsize)/2;
      }

      x = function(){
        return (this.index % maxperline) * (cellsize + myself.padding) + 
                myself.minMarginX;
      };
      
      myself.minMarginY = (myself.height - realysize) / 2;
      
      y = function(){
        var n = Math.floor(this.index/maxperline); 
        return myself.height  - n * myself.padding - myself.minMarginY - myself.padding/2;
      };
      
    } else {
      realxsize = cellsize + this.minMarginX;
      realysize = myself.padding*data.length;
      if(this.align == "middle"){
        myself.minMarginY = (myself.height - realysize + myself.padding)/2  ;
      } else if (this.align == "bottom"){
        myself.minMarginY = myself.height - realysize;
      }
      x = myself.minMarginX;
      y = function(){
        return myself.height - this.index*myself.padding - myself.minMarginY;
      };
    }

    if(this.width == null){
      this.setWidth(realxsize);
    }

    this.base();

    //********** Markers and Lines ***************************

    this.pvLegendPanel = this.pvPanel.add(pv.Panel)
        .data(data)
        .def("hidden","false")
        .left(x)
        .bottom(y)
        .height(this.markerSize)
        .cursor("pointer")
        .fillStyle(function(){
          return this.hidden()=="true"
                 ? "rgba(200,200,200,1)"
                 : "rgba(200,200,200,0.0001)";
        })
        .event("click",function(e){
          return myself.toggleVisibility(this.index);
        });

    // defined font function
    var computeDecoration = function(idx){
      if(myself.chart.dataEngine.isDimensionVisible(myself.chart.legendSource, idx)){
        return "";
      }
      else{
        return "line-through"
      }
    };
    
    var computeTextStyle = function(idx){
      if(myself.chart.dataEngine.isDimensionVisible(myself.chart.legendSource, idx)){
        return "black"
      }
      else{
        return "#ccc"
      }
    };

    if(this.drawLine == true && this.drawMarker == true){
      
      this.pvRule = this.pvLegendPanel.add(pv.Rule)
      .left(0)
      .width(this.markerSize)
      .lineWidth(1)
      .strokeStyle(function(){
        return c(this.index);
      })

      this.pvDot = this.pvRule.anchor("center").add(pv.Dot)
      .shapeSize(this.markerSize)
      .shape(function(){
        return myself.shape ? myself.shape :
          this.parent.index < cLen  ? 'square':
           'bar';
      })
      .lineWidth(0)
      .fillStyle(function(){
        return c(this.parent.index);
      })

      this.pvLabel = this.pvDot.anchor("right").add(pv.Label)
      .textMargin(myself.textMargin)
    }
    else if(this.drawLine == true){
      
      this.pvRule = this.pvLegendPanel.add(pv.Rule)
      .left(0)
      .width(this.markerSize)
      .lineWidth(1)
      .strokeStyle(function(){
        return c(this.parent.index);
      })

      this.pvLabel = this.pvRule.anchor("right").add(pv.Label)
      .textMargin(myself.textMargin)

    }
    else if(this.drawMarker == true){

      this.pvDot = this.pvLegendPanel.add(pv.Dot)
      .left(this.markerSize/2)
      .shapeSize(this.markerSize)
      .shape(function(){
        return myself.shape ? myself.shape :
          this.parent.index < cLen  ? 'square':
           'bar';
      })
      .angle(1.57)
      .lineWidth(2)
      .strokeStyle(function(){
        return c(this.parent.index);
      })
      .fillStyle(function(){
        return c(this.parent.index);
      })


      this.pvLabel = this.pvDot.anchor("right").add(pv.Label)
      .textMargin(myself.textMargin)
    
    }

    this.pvLabel
    .textDecoration(function(){
      return computeDecoration(this.parent.index)
    })
    .textStyle(function(){
      return computeTextStyle(this.parent.index)
    })

    // Extend legend
    this.extend(this.pvPanel,"legendArea_");
    this.extend(this.pvLegendPanel,"legendPanel_");
    this.extend(this.pvRule,"legendRule_");
    this.extend(this.pvDot,"legendDot_");
    this.extend(this.pvLabel,"legendLabel_");
  },

  toggleVisibility: function(idx){
    
    pvc.log("Worked. Toggling visibility of index " + idx);
    this.chart.dataEngine.toggleDimensionVisible(this.chart.legendSource, idx);

    // Forcing removal of tipsy legends
    pvc.removeTipsyLegends();

    // Rerender chart
    this.chart.render(true, true);
    
    return this.pvLabel;
  }
});
/**
 * TimeseriesAbstract is the base class for all categorical or timeseries
 */
pvc.TimeseriesAbstract = pvc.BaseChart.extend({

    allTimeseriesPanel : null,

    constructor: function(options){

        this.base(options);

        // Apply options
        pvc.mergeDefaults(this.options, pvc.TimeseriesAbstract.defaultOptions, options);
    },

    preRender: function(){

        this.base();

        // Do we have the timeseries panel? add it
        if (this.options.showAllTimeseries){
            this.allTimeseriesPanel = new pvc.AllTimeseriesPanel(this, {
                anchor: this.options.allTimeseriesPosition,
                allTimeseriesSize: this.options.allTimeseriesSize
            });

            this.allTimeseriesPanel.appendTo(this.basePanel); // Add it
        }
    }
}, {
    defaultOptions: {
        showAllTimeseries: true,
        allTimeseriesPosition: "bottom",
        allTimeseriesSize: 50
    }
});


/*
 * AllTimeseriesPanel panel. Generates a small timeseries panel that the user
 * can use to select the range:
 * <i>allTimeseriesPosition</i> - top / bottom / left / right. Default: top
 * <i>allTimeseriesSize</i> - The size of the timeseries in pixels. Default: 100
 *
 * Has the following protovis extension points:
 *
 * <i>allTimeseries_</i> - for the title Panel
 * 
 */
pvc.AllTimeseriesPanel = pvc.BasePanel.extend({

    _parent: null,
    pvAllTimeseriesPanel: null,
    anchor: "bottom",
    allTimeseriesSize: 50,

    constructor: function(chart, options){
        this.base(chart,options);
    },

    create: function(){
        this.setAnchoredSize(this.allTimeseriesSize);
        
        this.base();

        // Extend panel
        this.extend(this.pvPanel,"allTimeseries_");
    }
});
/**
 * CategoricalAbstract is the base class for all categorical or timeseries
 */
pvc.CategoricalAbstract = pvc.TimeseriesAbstract.extend({

    yAxisPanel : null,
    xAxisPanel : null,
    secondXAxisPanel: null,
    secondYAxisPanel: null,
    
    categoricalPanel: null, // This will act as a holder for the specific panel

    yScale: null,
    xScale: null,

    constructor: function(options){

        this.base(options);

        pvc.mergeDefaults(this.options, pvc.CategoricalAbstract.defaultOptions, options);
    },

    /**
     * Processes options after user options and default options have been merged.
     * @override
     */
    _processOptionsCore: function(options){

        this.base(options);

        // Sanitize some options
        if(options.showTooltips){
            var tipsySettings = options.tipsySettings;
            if(tipsySettings){
                tipsySettings = options.tipsySettings = pvc.create(tipsySettings);
                this.extend(tipsySettings, "tooltip_");
            }
        }

        if (!options.showYScale){
            options.yAxisSize = 0;
        }

        if (!options.showXScale){
            options.xAxisSize = 0;
        }

        if(options.secondAxis && options.secondAxisIndependentScale){
            options.secondAxisSize = this._isSecondAxisVertical() ?
                                        options.yAxisSize :
                                        options.xAxisSize;
        } else {
            options.secondAxisSize = 0;
        }

        if(options.stacked){
            options.orthoFixedMin = 0;

            if(options.percentageNormalized){
                options.orthoFixedMax = 100;
            }
        } else {
            options.percentageNormalized = false;
        }
    },

    _isSecondAxisVertical: function(){
        return this.isOrientationVertical();
    },

    preRender: function(){
        var options = this.options;
        
        // NOTE: creates root BasePanel, 
        //  and its Title and Legend child panels.
        this.base();

        pvc.log("Prerendering in CategoricalAbstract");

        this.initSecondXAxis();
        this.initXAxis();
        this.initSecondYAxis();
        this.initYAxis();
        
        // NOTE: must be evaluated before axis panels' creation
        //  because getZZZZScale calls assume this (bypassAxisSize = false)
        this.xScale = this.getXScale();
        this.yScale = this.getYScale();
        if(options.secondAxis){
            this.secondScale = this.getSecondScale();
        }

        // --------------

        if(this.secondXAxisPanel){
            this.secondXAxisPanel.setScale(this.secondScale);
            this.secondXAxisPanel.appendTo(this.basePanel); // Add it
        }
        
        if(this.xAxisPanel){
            this.xAxisPanel.setScale(this.xScale);
            this.xAxisPanel.appendTo(this.basePanel); // Add it
        }
        
        if(this.secondYAxisPanel){
            this.secondYAxisPanel.setScale(this.secondScale);
            this.secondYAxisPanel.appendTo(this.basePanel); // Add it
        }
        
        if(this.yAxisPanel){
            this.yAxisPanel.setScale(this.yScale);
            this.yAxisPanel.appendTo(this.basePanel); // Add it
        }

        // ---------------
        
        this.categoricalPanel = this.createCategoricalPanel();
        this.categoricalPanel.appendTo(this.basePanel); // Add it
    },

    /* @abstract */
    createCategoricalPanel: function(){
        throw new Error("Not implemented.");
    },

    /**
     * Initializes the X axis. It's in a separate function to allow overriding this value.
     */
    initXAxis: function(){
    	var options = this.options;
        if (options.showXScale){
            this.xAxisPanel = new pvc.XAxisPanel(this, {
                ordinal: this.isXAxisOrdinal(),
                showAllTimeseries: false,
                anchor: options.xAxisPosition,
                axisSize: options.xAxisSize,
                fullGrid:  options.xAxisFullGrid,
                endLine: options.xAxisEndLine,
                domainRoundMode:  options.xAxisDomainRoundMode,
                desiredTickCount: options.xAxisDesiredTickCount,
                minorTicks:  options.xAxisMinorTicks,
                ordinalDimensionName: this.getAxisOrdinalDimension('x'),
                useCompositeAxis: options.useCompositeAxis,
                font: options.axisLabelFont,
                title: options.xAxisTitle,
                titleFont: options.axisTitleFont,
                titleSize: options.xAxisTitleSize,
                clickAction: options.xAxisClickAction,
                doubleClickAction: options.xAxisDoubleClickAction
            });
        }
    },

    /**
     * Initializes the Y axis. It's in a separate function to allow overriding this value.
     */
    initYAxis: function(){
    	var options = this.options;
        if (options.showYScale){
            this.yAxisPanel = new pvc.YAxisPanel(this, {
                ordinal: this.isYAxisOrdinal(),
                showAllTimeseries: false,
                anchor:   options.yAxisPosition,
                axisSize: options.yAxisSize,
                fullGrid: options.yAxisFullGrid,
                endLine:  options.yAxisEndLine,
                domainRoundMode:  options.yAxisDomainRoundMode,
                desiredTickCount: options.yAxisDesiredTickCount,
                minorTicks:       options.yAxisMinorTicks,
                ordinalDimensionName: this.getAxisOrdinalDimension('y'),
                useCompositeAxis: options.useCompositeAxis,
                font: options.axisLabelFont,
                title: options.yAxisTitle,
                titleSize: options.yAxisTitleSize,
                titleFont:  options.axisTitleFont,
                clickAction:       options.yAxisClickAction,
                doubleClickAction: options.yAxisDoubleClickAction
            });
        }
    },

    /**
     * Initializes the second axis for X, if exists and only for horizontal charts.
     */
    initSecondXAxis: function(){
    	var options = this.options;
        if(options.secondAxis && 
           options.secondAxisIndependentScale &&
           this.isOrientationHorizontal()){
           
            this.secondXAxisPanel = new pvc.SecondXAxisPanel(this, {
                ordinal: this.isXAxisOrdinal(),
                showAllTimeseries: false,
                anchor: pvc.BasePanel.oppositeAnchor[options.xAxisPosition],
                axisSize: options.secondAxisSize,
                domainRoundMode:  options.secondAxisDomainRoundMode,
                desiredTickCount: options.secondAxisDesiredTickCount,
                minorTicks:       options.secondAxisMinorTicks,
                ordinalDimensionName: this.getAxisOrdinalDimension('x'),
                tickColor: options.secondAxisColor,
                title: options.secondAxisTitle,
                titleFont: options.axisTitleFont,
                titleSize: options.secondAxisTitleSize
            });
        }
    },

    /**
     * Initializes the second axis for Y, if exists and only for vertical charts.
     */
    initSecondYAxis: function(){
    	var options = this.options;
        if(options.secondAxis && 
           options.secondAxisIndependentScale &&
           this.isOrientationVertical()){

            this.secondYAxisPanel = new pvc.SecondYAxisPanel(this, {
                ordinal: this.isYAxisOrdinal(),
                showAllTimeseries: false,
                anchor: pvc.BasePanel.oppositeAnchor[options.yAxisPosition],
                axisSize: options.secondAxisSize,
                domainRoundMode:  options.secondAxisDomainRoundMode,
                desiredTickCount: options.secondAxisDesiredTickCount,
                minorTicks:       options.secondAxisMinorTicks,
                ordinalDimensionName: this.getAxisOrdinalDimension('y'),
                tickColor: options.secondAxisColor,
                title: options.secondAxisTitle,
                titleFont: options.axisTitleFont,
                titleSize: options.secondAxisTitleSize
            });
        }
    },

    /**
     * Indicates if xx is an ordinal scale.
     */
    isXAxisOrdinal: function(){
        return this.isOrientationVertical()? 
            !this.options.timeSeries : 
            this.options.orthoAxisOrdinal;
    },

    /**
     * Indicates if yy is an ordinal scale.
     */
    isYAxisOrdinal: function(){
        return this.isOrientationVertical()? 
            this.options.orthoAxisOrdinal :
            !this.options.timeSeries;
    },

    /**
     *  The data dimension name to use on an ordinal axis.
     */
    getAxisOrdinalDimension: function(axis){
        var onSeries = false;

        // onSeries can only be true if the perpendicular axis is ordinal
        if (this.options.orthoAxisOrdinal) {
            // (X && !V) || (!X && V)
            var isVertical = this.isOrientationVertical();
            onSeries = (axis == "x") ? !isVertical : isVertical;
        }

        return onSeries ? 'series' : 'category';
    },

    /**
     * xx scale for categorical charts.
     * Must be called before axis panels are created (bypassAxisSize = false).
     */
    getXScale: function(){
        if (this.isOrientationVertical()) {
            return this.options.timeSeries? 
                this.getTimeseriesScale({bypassAxisOffset: true}) :
                this.getOrdinalScale();
        }

        return this.options.orthoAxisOrdinal ? 
            this.getOrdinalScale({orthoAxis: "x"}) :
            this.getLinearScale({bypassAxisOffset: true});
    },

    /**
     * yy scale for categorical charts.
     * Must be called before axis panels are created (bypassAxisSize = false).
     */
    getYScale: function(){
        if (this.isOrientationVertical()) {
            return this.options.orthoAxisOrdinal ? 
                this.getOrdinalScale({orthoAxis: "y"}) : 
                this.getLinearScale();
        }
        
        return this.options.timeSeries ? 
            this.getTimeseriesScale(): 
            this.getOrdinalScale();
    },

    _getAxisSize: function(bypass, axisName){
        if(bypass){
            return 0;
        }

        var axis = this[axisName + "AxisPanel"];
        return axis ? axis.axisSize : 0;
    },

    /**
     * Scale for an ordinal axis.
     * If orthoAxis is null:
     *   xx if orientation is vertical, yy otherwise.
     * Else 
     *   yy if if orthoAxis is "y"
     *   xx if if orthoAxis is "x"
     *
     * Keyword arguments:
     *   bypassAxisSize: boolean,     default is false
     *   orthoAxis: "y", "x" or null, default is null
     */
    getOrdinalScale: function(keyArgs){

        var bypassAxisSize = pvc.get(keyArgs, 'bypassAxisSize', false),
            orthoAxis = pvc.get(keyArgs, 'orthoAxis', null),
            options   = this.options,
            yAxisSize = this._getAxisSize(bypassAxisSize, 'y'),
            xAxisSize = this._getAxisSize(bypassAxisSize, 'x');
        
        // DOMAIN
        var data = orthoAxis ?
                this.dataEngine.getVisibleSeries() :
                this.dataEngine.getVisibleCategories();
        
        // NOTE: assumes data elements convert well to string
        var scale = new pv.Scale.ordinal(data);
        
        // RANGE
        if (orthoAxis) {   // added by CvK
            if (orthoAxis == "y") {
                scale.min = 0;
                scale.max = this.basePanel.height - xAxisSize;
            } else {   // assume orthoAxis == "x"
                if(options.yAxisPosition == "left"){
                    scale.min = yAxisSize;
                    scale.max = this.basePanel.width;
                } else {
                    scale.min = 0;
                    scale.max = this.basePanel.width - yAxisSize;
                }
            }
        } else {   // !orthoAxis (so normal ordinal axis)
            var isX = this.isOrientationVertical(),
                rSize = isX ? this.basePanel.width : this.basePanel.height;

            if (isX){
                var secondYAxisSize = bypassAxisSize || !this._isSecondAxisVertical() ? 
                                        0 :
                                        options.secondAxisSize;
                if(options.yAxisPosition == "left"){
                    scale.min = yAxisSize;
                    scale.max = rSize - secondYAxisSize;
                } else {
                    scale.min = secondYAxisSize;
                    scale.max = rSize - yAxisSize;
                }
            } else {
                var secondXAxisSize = this._getAxisSize(
                                bypassAxisSize || this._isSecondAxisVertical(),
                                'second');
                scale.min = 0;
                scale.max = rSize - xAxisSize - secondXAxisSize;
            }
        }  // end else-part -- if (orthoAxis)

        var panelSizeRatio = options.panelSizeRatio;
        scale.splitBanded(scale.min, scale.max, panelSizeRatio);
        
        var range = scale.range(),
            step  = range.band / panelSizeRatio; // =def (band + margin)
        
        range.step   = step;
        range.margin = step * (1 - panelSizeRatio);
        
        return scale;
    },

    /**
     * Scale for a linear axis.
     * xx if orientation is horizontal, yy otherwise.
     * 
     * Keyword arguments:
     *   bypassAxisSize:    boolean, default is false
     *   bypassAxisOffset:  boolean, default is false
     */
    getLinearScale: function(keyArgs){

        var bypassAxisSize   = pvc.get(keyArgs, 'bypassAxisSize',   false),
            bypassAxisOffset = pvc.get(keyArgs, 'bypassAxisOffset', false),
            options   = this.options,
            isX = this.isOrientationHorizontal(),
            dMin, // Domain
            dMax,
            bound,
            lockedMin = true,
            lockedMax = true;
        
        /* 
         * Note that in the following dMin and dMax calculations,
         * orthFixedMin and orthoFixedMax already take into account if
         * stacked or percentageNormalized are set.
         * @see _processOptionsCore
         */

        // Min
        bound = parseFloat(options.orthoFixedMin);
        if(!isNaN(bound)){
            dMin = bound;
        } else {
            dMin = this.dataEngine.getVisibleSeriesAbsoluteMin(); // may be < 0 !
            lockedMin = false;
        }

        // Max
        bound = parseFloat(options.orthoFixedMax);
        if(!isNaN(bound)){
            dMax = bound;
        } else if(options.stacked) {
            dMax = this.dataEngine.getCategoriesMaxSumOfVisibleSeries(); // may be < 0 !
            lockedMax = false;
        } else {
            dMax = this.dataEngine.getVisibleSeriesAbsoluteMax(); // may be < 0 !
            lockedMax = false;
        }
        
        /*
         * If both negative or both positive
         * the scale does not contain the number 0.
         *
         * Currently this option ignores locks. Is this all right?
         */
        if(options.originIsZero && (dMin * dMax > 0)){
            if(dMin > 0){
                dMin = 0;
                lockedMin = true;
            } else {
                dMax = 0;
                lockedMax = true;
            }
        }

        /*
         * If the bounds (still) are the same, things break,
         * so we add a wee bit of variation.
         *
         * This one must ignore locks.
         */
        if (dMin === dMax) {
            dMin = dMin !== 0 ? dMin * 0.99 : options.originIsZero ? 0 : -0.1;
            dMax = dMax !== 0 ? dMax * 1.01 : 0.1;
        } else if(dMin > dMax){
            // What the heck...
            // Is this ok or should throw?
            bound = dMin;
            dMin = dMax;
            dMax = bound;
        }

        // Adding a small offset to the scale's dMin and dMax,
        //  as long as they are not 0 and originIsZero=true.
        // DCL: 'axisOffset' is a percentage??
        if(!bypassAxisOffset &&
           options.axisOffset > 0 &&
           (!lockedMin || !lockedMax)){

            var dOffset = (dMax - dMin) * options.axisOffset;
            if(!lockedMin){
                dMin -= dOffset;
            }

            if(!lockedMax){
                dMax += dOffset;
            }
        }
        
        var scale = new pv.Scale.linear(dMin, dMax);
        
        // Domain rounding
        pvc.roundScaleDomain(
                scale, 
                isX ? options.xAxisDomainRoundMode  : options.yAxisDomainRoundMode,
                isX ? options.xAxisDesiredTickCount : options.yAxisDesiredTickCount);
        
        // ----------------------------

        // RANGE
        
        // NOTE: By the time this is evaluated by getZZZScale() methods,
        // axis panels have not yet been created,
        // but titles and legends already have been.
        // In those situations it is specified: bypassAxisSize = false
        var rSize = isX ? this.basePanel.width : this.basePanel.height;
        if(isX){
            var yAxisSize = this._getAxisSize(bypassAxisSize, 'y'),
                secondYAxisSize = this._getAxisSize(bypassAxisSize || !this._isSecondAxisVertical(), 'second');

            if(options.yAxisPosition == "left"){
                scale.min = yAxisSize;
                scale.max = rSize - secondYAxisSize;
            } else {
                scale.min = secondYAxisSize;
                scale.max = rSize - yAxisSize;
            }

        } else {
            var xAxisSize = this._getAxisSize(bypassAxisSize, 'x'),
                secondXAxisSize = this._getAxisSize(bypassAxisSize || this._isSecondAxisVertical(), 'second');
            
            scale.min = 0;
            scale.max = rSize - xAxisSize - secondXAxisSize;
        }

        scale.range(scale.min, scale.max);
        
        return scale;
    },

    /**
     * Scale for the timeseries axis.
     * xx if orientation is vertical, yy otherwise.
     *
     * Keyword arguments:
     *   bypassAxisSize:   boolean, default is false
     *   bypassAxisOffset: boolean, default is false
     */
    getTimeseriesScale: function(keyArgs){

        var bypassAxisSize   = pvc.get(keyArgs, 'bypassAxisSize',   false),
            bypassAxisOffset = pvc.get(keyArgs, 'bypassAxisOffset', false),
            options = this.options,
            isX = this.isOrientationVertical();
        
        // DOMAIN
        var categories = this.dataEngine.getVisibleCategories();
        
        // Adding a small offset to the scale's domain:
        var parser = pv.Format.date(options.timeSeriesFormat),
            dMin = parser.parse(categories[0]),
            dMax = parser.parse(categories[categories.length - 1]),
            dOffset = 0;
        
        if(!bypassAxisOffset){
            dOffset = (dMax.getTime() - dMin.getTime()) * options.axisOffset;
        }

        var scale = new pv.Scale.linear(
                                new Date(dMin.getTime() - dOffset),
                                new Date(dMax.getTime() + dOffset));

        // Domain rounding
        // TODO: pvc.scaleTicks(scale) does not like Dates...
        pvc.roundScaleDomain(
                scale, 
                isX ? options.xAxisDomainRoundMode  : options.yAxisDomainRoundMode,
                isX ? options.xAxisDesiredTickCount : options.yAxisDesiredTickCount);
        
        // RANGE
        var rSize = isX ? this.basePanel.width : this.basePanel.height;
        
        if(isX){
            var yAxisSize = this._getAxisSize(bypassAxisSize, 'y'),
                secondYAxisSize = this._getAxisSize(bypassAxisSize || !this._isSecondAxisVertical(), 'second');

            if(options.yAxisPosition == "left"){
                scale.min = yAxisSize;
                scale.max = rSize - secondYAxisSize;
            } else {
                scale.min = secondYAxisSize;
                scale.max = rSize - yAxisSize;
            }
        } else {
            var xAxisSize = this._getAxisSize(bypassAxisSize, 'x'),
                secondXAxisSize = this._getAxisSize(bypassAxisSize || this._isSecondAxisVertical(), 'second');
            
            scale.min = 0;
            scale.max = rSize - xAxisSize - secondXAxisSize;
        }

        scale.range(scale.min , scale.max);
        
        return scale;
    },

    /**
     * Scale for the second linear axis. yy if orientation is vertical, xx otherwise.
     *
     * Keyword arguments:
     *   bypassAxisSize:   boolean, default is false
     *   bypassAxisOffset: boolean, default is false (only implemented for not independent scale)
     */
    getSecondScale: function(keyArgs){

        var options = this.options;
        
        if(!options.secondAxis || !options.secondAxisIndependentScale){
            return this.getLinearScale(keyArgs);
        }
        
        // DOMAIN
        var bypassAxisSize   = pvc.get(keyArgs, 'bypassAxisSize',   false),
            dMax = this.dataEngine.getSecondAxisMax(),
            dMin = this.dataEngine.getSecondAxisMin();

        if(dMin * dMax > 0 && options.secondAxisOriginIsZero){
            if(dMin > 0){
                dMin = 0;
            } else {
                dMax = 0;
            }
        }

        // Adding a small offset to the scale's domain:
        var dOffset = (dMax - dMin) * options.secondAxisOffset,
            scale = new pv.Scale.linear(
                        dMin - (options.secondAxisOriginIsZero && dMin == 0 ? 0 : dOffset),
                        dMax + (options.secondAxisOriginIsZero && dMax == 0 ? 0 : dOffset));

        // Domain rounding
        pvc.roundScaleDomain(scale, options.secondAxisRoundDomain, options.secondAxisDesiredTickCount);
                
        // RANGE
        var xAxisSize = this._getAxisSize(bypassAxisSize, 'x'),
            yAxisSize = this._getAxisSize(bypassAxisSize, 'y'),
            isX = !this._isSecondAxisVertical(),
            rSize = isX ? this.basePanel.width : this.basePanel.height;
                
        if(isX){
            if(options.yAxisPosition == "left"){
                scale.min = yAxisSize;
                scale.max = rSize;
            } else {
                scale.min = 0;
                scale.max = rSize - yAxisSize;
            }
        } else {
            scale.min = 0;
            scale.max = rSize - xAxisSize;
        }

        scale.range(scale.min, scale.max);
        
        return scale;
    },
    
    markEventDefaults: {
        strokeStyle: "#5BCBF5",  /* Line Color */
        lineWidth: "0.5",  /* Line Width */
        textStyle: "#5BCBF5", /* Text Color */
        verticalOffset: 10, /* Distance between vertical anchor and label */
        verticalAnchor: "bottom", /* Vertical anchor: top or bottom */
        horizontalAnchor: "right", /* Horizontal anchor: left or right */
        forceHorizontalAnchor: false, /* Horizontal anchor position will be respected if true */
        horizontalAnchorSwapLimit: 80 /* Horizontal anchor will switch if less than this space available */
    },
    
    markEvent: function(dateString, label, options){

        if(!this.options.timeSeries){
            pvc.log("Attempting to mark an event on a non timeSeries chart");
            return;
        }

        var o = $.extend({}, this.markEventDefaults, options);
        
        var scale = this.getTimeseriesScale({
                        bypassAxisSize:   true,
                        bypassAxisOffset: true
                    });

        // Are we outside the allowed scale? 
        var d = pv.Format.date(this.options.timeSeriesFormat).parse(dateString);
        var dpos = scale( d );
        
        if( dpos < scale.range()[0] || dpos > scale.range()[1]){
            pvc.log("Event outside the allowed range, returning");
            return;
        }

        // Add the line

        var panel = this.categoricalPanel.pvPanel;
        var h = this.yScale.range()[1];

        // Detect where to place the horizontalAnchor
        //var anchor = o.horizontalAnchor;
        if( !o.forceHorizontalAnchor )
        {
            var availableSize = o.horizontalAnchor == "right"?scale.range()[1]-dpos:dpos;
            
            // TODO: Replace this availableSize condition with a check for the text size
            if (availableSize < o.horizontalAnchorSwapLimit ){
                o.horizontalAnchor = o.horizontalAnchor == "right"?"left":"right";
            }
            
        }

        var line = panel.add(pv.Line)
            .data([0,h])
            .strokeStyle(o.strokeStyle)
            .lineWidth(o.lineWidth)
            .bottom(function(d){
                return d;
            })
            .left(dpos);

        //var pvLabel = 
        line.anchor(o.horizontalAnchor)
            .top( o.verticalAnchor == "top" ? o.verticalOffset : (h - o.verticalOffset))
            .add(pv.Label)
            .text(label)
            .textStyle(o.textStyle)
            .visible(function(d){
                return this.index==0;
            });
    },

    clearSelections: function(){
        this.dataEngine.clearSelections();
        this.categoricalPanel._handleSelectionChanged();
    }

}, {
    defaultOptions: {
        showAllTimeseries: false,
        showXScale: true,
        showYScale: true,

        originIsZero: true,

        axisOffset: 0,
        axisLabelFont: '10px sans-serif',
        axisTitleFont: '12px sans-serif', // 'bold '
        
        orthoFixedMin: null, // when percentageNormalized => 0
        orthoFixedMax: null, // when percentageNormalized => 100

        timeSeries: false,
        timeSeriesFormat: "%Y-%m-%d",

        // CvK  added extra parameter for implementation of HeatGrid
        orthoAxisOrdinal: false,
        // if orientation==vertical then perpendicular-axis is the y-axis
        //  else perpendicular-axis is the x-axis.

        useCompositeAxis: false,

        xAxisPosition: "bottom",
        xAxisSize: undefined,
        xAxisFullGrid: false,
        xAxisEndLine:  false,
        xAxisDomainRoundMode: 'none',  // for linear scales
        xAxisDesiredTickCount: null,   // idem
        xAxisMinorTicks:  true,   // idem
        xAxisClickAction: null,
        xAxisDoubleClickAction: null,
        xAxisTitle: undefined,
        xAxisTitleSize: undefined,

        yAxisPosition: "left",
        yAxisSize: undefined,
        yAxisFullGrid: false,
        yAxisEndLine:  false,
        yAxisDomainRoundMode: 'none',
        yAxisDesiredTickCount: null,
        yAxisMinorTicks:  true,
        yAxisClickAction: null,
        yAxisDoubleClickAction: null,
        yAxisTitle: undefined,
        yAxisTitleSize: undefined,
        
        secondAxisIndependentScale: false,
        secondAxisOriginIsZero: true,
        secondAxisOffset: 0,
        secondAxisColor: "blue",
        //secondAxisSize: 0, // calculated
        secondAxisDomainRoundMode: 'none',  // only with independent second scale
        secondAxisDesiredTickCount: null,   // idem
        secondAxisMinorTicks: true,
        secondAxisTitle: undefined,
        secondAxisTitleSize: undefined,

        panelSizeRatio: 0.9,
        
        // Content/Plot area clicking
        clickAction: null,
        doubleClickAction: null,
        doubleClickMaxDelay: 300, //ms

        // Selection
        // Use CTRL key to make fine-grained selections
        ctrlSelectMode: true,

        // function to be invoked when a selection occurs
        // (shape click-select, row/column click and lasso finished)
        selectionChangedAction: null,

        // Selection - Rubber band
        rubberBandFill: 'rgba(203, 239, 163, 0.6)', // 'rgba(255, 127, 0, 0.15)',
        rubberBandLine: '#86fe00', //'rgb(255,127,0)',

        // Tooltips
        showTooltips:  true,
        customTooltip: null, // function(s, c, v, datum) -> tooltip text
        tipsySettings: {
            gravity: "s",
            fade: true
        }
    }
});
pvc.CategoricalAbstractPanel = pvc.BasePanel.extend({

    orientation: "vertical",
    stacked: false,

    constructor: function(chart, options){

        // Shared state between _handleClick and _handleDoubleClick
        this._ignoreClicks = 0;

        this.base(chart, options);
    },

    /*
     * @override
     */
    create: function(){
        // Occupy all space available in the parent panel
        this.consumeFreeClientSize();

        // Create the this.pvPanel
        this.base();

        // Send the panel behind the axis, title and legend, panels
        this.pvPanel.zOrder(-10);

        // Overflow
        var options = this.chart.options;
        if (parseFloat(options.orthoFixedMin) > 0 ||
            parseFloat(options.orthoFixedMax) > 0){
            this.pvPanel["overflow"]("hidden");
        }
        
        // Create something usefull...
        this.createCore();
        
        if (options.selectable && pv.renderer() !== 'batik'){
            this._createSelectionOverlay();
        }
    },

    /**
     * Override to create marks specific to a given chart.
     * @virtual 
     */
    createCore: function(){
        // NOOP
    },
    
    /**
     * @override
     */
    applyExtensions: function(){
        this.base();

        // Extend body
        this.extend(this.pvPanel, "chart_");
    },
    
    /* @override */
    isOrientationVertical: function(){
        return this.orientation == "vertical";
    },

    /* @override */
    isOrientationHorizontal: function(){
        return this.orientation == "horizontal";
    },

    /**
     * Override to detect the datum that is being rendered.
     * Called during PV rendering, from within property functions.
     * This should only be called on places where it is possible,
     * through the indexes of current PV mark to 'guess' an
     * associated datum.
     * @virtual
     */
    _getRenderingDatum: function(mark){
        return null;
    },

    /**
     * Returns a datum given its visible series and category indexes.
     * @virtual
     */
    _getRenderingDatumByIndexes: function(visibleSerIndex, visibleCatIndex){
        var de = this.chart.dataEngine,
            datumRef = {
                category: de.translateDimensionVisibleIndex('category', visibleCatIndex),
                series:   de.translateDimensionVisibleIndex('series',   visibleSerIndex)
            };

        return de.findDatum(datumRef, true);
    },

    // ----------------------------
    // Click / Double-click

    _handleDoubleClick: function(mark, ev){
        var action = this.chart.options.doubleClickAction;
        if(action){
            var datum = mark.datum();
            if(datum){
                var s = datum.elem.series.rawValue,
                    c = datum.elem.category.rawValue,
                    v = datum.value;

                this._ignoreClicks = 2;

                action.call(mark, s, c, v, ev, datum);
            }
        }
    },

    _shouldHandleClick: function(){
        var options = this.chart.options;
        return options.selectable || (options.clickable && options.clickAction);
    },
    
    _handleClick: function(mark, ev){
        if(!this._shouldHandleClick()){
            return;
        }

        // Selection
        var datum = mark.datum();
        if(datum){
            var options = this.chart.options;
            
            if(!options.doubleClickAction){
                this._handleClickCore(mark, datum, ev);
            } else {
                // Delay click evaluation so that
                // it may be canceled if double click meanwhile
                // fires.
                var myself = this;
                window.setTimeout(
                    function(){
                        myself._handleClickCore.call(myself, mark, datum, ev);
                    },
                    options.doubleClickMaxDelay || 300);

            }
        }
    },

    _handleClickCore: function(mark, datum, ev){
        if(this._ignoreClicks) {
            this._ignoreClicks--;
            return;
        }

        // Classic clickAction
        var action = this.chart.options.clickAction;
        if(action){
            var dims = datum.elem,
                s = dims.series.rawValue,
                c = dims.category.rawValue,
                v = datum.value;

            action.call(mark, s, c, v, ev, datum);
        }

        // Selection
        var options = this.chart.options;
        if(options.selectable){
            if(options.ctrlSelectMode && !ev.ctrlKey){
                // hard select
                datum.engine.clearSelections();
                datum.setSelected(true);
            } else {
                datum.toggleSelected();
            }

            this._handleSelectionChanged();
        }
    },

    _handleSelectionChanged: function(){
        this._renderSignums();

        // Fire action
        var action = this.chart.options.selectionChangedAction;
        if(action){
            var selections = this.chart.dataEngine.getSelections();

            action.call(null, selections);
        }
    },

    _addPropClick: function(mark){
        var myself = this;
        mark.cursor("pointer")
            .event("click", function(){
                var ev = arguments[arguments.length - 1];
                return myself._handleClick(this, ev);
            });
    },

    _addPropDoubleClick: function(mark){
        var myself = this;
        mark.cursor("pointer")
            .event("dblclick", function(){
                var ev = arguments[arguments.length - 1];
                return myself._handleDoubleClick(this, ev);
            });
    },
    
    /**
     * The default implementation renders
     * the marks returned by #_getSignums, 
     * or this.pvPanel if none is returned.
     * which is generally in excess of what actually requires
     * to be re-rendered.
     *
     * Override to render a more specific set of marks.
     * @virtual
     */
    _renderSignums: function(){
        var marks = this._getSignums();
        if(!marks || !marks.length){
            this.pvPanel.render();
        } else {
            marks.forEach(function(mark){ mark.render(); });
        }
    },

    /**
     * Returns an array of marks whose instances are associated to a datum, or null.
     * @virtual
     */
    _getSignums: function(){
        return null;
    },

    /**
     * The default implementation returns
     * the datums associated with
     * the instances of the marks returned by #_getSignums.
     * 
     * Override to provide a specific
     * selection detection implementation.
     *
     * When overriding, 
     * use #_intersectsRubberBandSelection
     * to check if a mark is covered by the rubber band.
     *
     * Returns an array of being selected datum.
     * @virtual
     */
    _detectSelectingData: function(){
        var data = [];

        var selectableMarks = this._getSignums();
        if(selectableMarks){
            selectableMarks.forEach(function(mark){
                this._forEachSelectingMarkInstance(mark, function(datum){
                    data.push(datum);
                }, this);
            }, this);
        }
        
        return data;
    },
    
    /**
     * Add rubberband functionality to main panel (includes axis).
     * Override to prevent rubber band selection.
     * @virtual
     **/
    _createSelectionOverlay: function(){
        //TODO: flip support: parallelLength etc..

        var myself = this,
            isHorizontal = this.isOrientationHorizontal(),
            chart = this.chart,
            options  = chart.options,
            dataEngine = chart.dataEngine,
            titlePanel = chart.titlePanel,
            xAxisPanel = chart.xAxisPanel,
            yAxisPanel = chart.yAxisPanel;

        var dMin = 10; // Minimum dx or dy for a rubber band selection to be relevant

        var isSelecting = false;

        // Helper
        // Sets all positions to 0 except the specified one
        var positions = ['top', 'left', 'bottom', 'right'];
        function setPositions(position, value){
            var obj = {};
            for(var i = 0; i < positions.length ; i++){
                obj[positions[i]] = (positions[i] == position) ? value : 0;
            }
            return obj;
        }

        // Callback to handle end of rubber band selection
        function dispatchRubberBandSelection(ev){
            var rb = myself.rubberBand;

            // Get offsets
            var titleOffset;
            if(titlePanel != null){
                titleOffset = setPositions(options.titlePosition, titlePanel.titleSize);
            } else {
                titleOffset = setPositions();
            }

            var xAxisOffset = setPositions(options.xAxisPosition, xAxisPanel ? xAxisPanel.height : 0),
                yAxisOffset = setPositions(options.yAxisPosition, yAxisPanel ? yAxisPanel.width  : 0);

            var y = 0,
                x = 0;

            // Rubber band selects over any of the axes?
            var xSelections = [],
                ySelections = [];

            if(options.useCompositeAxis){
                //1) x axis
                x = rb.x - titleOffset['left'] - yAxisOffset['left'];
                y = rb.y - titleOffset['top'];

                if(options.xAxisPosition === 'bottom'){//chart
                    y -= myself.height;
                }

                if(xAxisPanel){
                    xSelections = xAxisPanel.getAreaSelections(x, y, rb.dx, rb.dy);
                }
                
                //2) y axis
                x = rb.x - titleOffset['left'];
                y = rb.y - titleOffset['top'] - xAxisOffset['top'];

                if(options.yAxisPosition === 'right'){//chart
                    x -= myself.width;
                }

                if(yAxisPanel){
                    ySelections = yAxisPanel.getAreaSelections(x, y, rb.dx, rb.dy);
                }
            }

            var cSelections = isHorizontal ? ySelections : xSelections,
                sSelections = isHorizontal ? xSelections : ySelections;

            if(options.ctrlSelectMode && !ev.ctrlKey){
                dataEngine.clearSelections();
            }

            var selectedData,
                toggle = false;

            // Rubber band selects on both axes?
            if(ySelections.length > 0 && xSelections.length > 0){
                // Select the INTERSECTION
                selectedData = dataEngine.getWhere([
                    {series: sSelections, /* AND */ category: cSelections}
                ]);
                
            } else if (ySelections.length > 0 || xSelections.length > 0){
                // Select the UNION
                toggle = true;

                selectedData = dataEngine.getWhere([
                    {series: sSelections}, // OR
                    {category: cSelections}
                ]);

            } else {
                selectedData = myself._detectSelectingData();
            }

            if(selectedData){
                if(toggle){
                    dataEngine.toggleSelections(selectedData);
                } else {
                    dataEngine.setSelections(selectedData, true);
                }

                myself._handleSelectionChanged();
            }
        }

        // Rubber band
        var selectBar = this.selectBar = this.pvPanel.root
            .add(pv.Bar)
                .visible(function() {return isSelecting;} )
                .left(function() {return this.parent.selectionRect.x; })
                .top(function() {return this.parent.selectionRect.y; })
                .width(function() {return this.parent.selectionRect.dx; })
                .height(function() {return this.parent.selectionRect.dy; })
                .fillStyle(options.rubberBandFill)
                .strokeStyle(options.rubberBandLine);

        // Rubber band selection behavior definition
        if(!options.extensionPoints ||
           !options.extensionPoints.base_fillStyle){

            var invisibleFill = 'rgba(127,127,127,0.00001)';
            this.pvPanel.root.fillStyle(invisibleFill);
        }

        var selectionEndedDate;
        this.pvPanel.root
            .event("click", function() {
                // It happens sometimes that the click is fired 
                //  after mouse up, ending up clearing a just made selection.
                if(selectionEndedDate){
                    var timeSpan = new Date() - selectionEndedDate;
                    if(timeSpan < 300){
                        selectionEndedDate = null;
                        return;
                    }
                }
                
                dataEngine.clearSelections();
                myself._handleSelectionChanged();
            })
            .event('mousedown', pv.Behavior.selector(false))
            .event('select', function(){
                if(!isSelecting && !chart.isAnimating){
                    var rb = this.selectionRect;
                    if(Math.sqrt(rb.dx * rb.dx + rb.dy * rb.dy) <= dMin){
                        return;
                    }

                    isSelecting = true;
                    myself.rubberBand = rb;
                }

                selectBar.render();
            })
            .event('selectend', function(dummy, ev){
                if(isSelecting){
                    isSelecting = false;
                    selectBar.render(); // hide rubber band

                    // Process selection
                    dispatchRubberBandSelection(ev);

                    selectionEndedDate = new Date();
                }
            });
    },

    _forEachSelectingMarkInstance: function(mark, fun, ctx){
        if(mark.type === 'area' || mark.type === 'line'){
            var instancePrev = null,
                seriesPrev;
                
            this._forEachSignumInstance(mark, function(instance, t){
                // Skip first instance
                if(instancePrev){
                    var series = instance.datum.elem.series.absValue;
                    if(series === seriesPrev){
                        var shape = mark.getInstanceShape(instancePrev, instance).apply(t);
                        if (shape.intersectsRect(this.rubberBand)){
                            fun.call(ctx, instancePrev.datum);
                        }
                    }
                }

                instancePrev = instance;
                seriesPrev   = instance.datum.elem.series.absValue;
            }, this);
        } else {
            mark.forEachInstance(function(instance, t){
                var shape = mark.getInstanceShape(instance).apply(t);
                if (shape.intersectsRect(this.rubberBand)){
                    fun.call(ctx, instance.datum);
                }
            }, this);
        }
    },

    _forEachSignumInstance: function(mark, fun, ctx){
        mark.forEachInstance(function(instance, t){
            if(instance.datum){
                fun.call(ctx, instance, t);
            }
        });
    }
});
/**
 * AxisPanel panel.
 */
pvc.AxisPanel = pvc.BasePanel.extend({

    _parent: null,
    
    pvRule:     null,
    pvTicks:    null,
    pvLabel:    null,
    pvRuleGrid: null,
    pvEndLine:  null,
    pvScale:    null,
    
    ordinal: false,
    ordinalDimensionName: null, // To be used in ordinal scales
    anchor: "bottom",
    axisSize: undefined,
    tickLength: 6,
    tickColor: "#aaa",
    panelName: "axis", // override
    scale: null,
    fullGrid: false,
    endLine:  false,
    font: '10px sans-serif', // label font
    titleFont: '12px sans-serif',
    title: undefined,
    titleSize: 0,

    // To be used in linear scales
    domainRoundMode: 'none',
    desiredTickCount: null,
    minorTicks:       true,
    
    clickAction: null,
    doubleClickAction: null,

    constructor: function(chart, options){
        
        this.base(chart,options);

        this._calcLayout();
    },

    _calcLayout: function(){

        var titleSize = 0;

        if(this.title){
            titleSize = Math.ceil(
                            pvc.text.getTextHeight(this.title, this.titleFont)
                            *
                            pvc.goldenRatio);

            if(this.titleSize > titleSize){
                titleSize = this.titleSize;
            }

            if(this.axisSize  != null &&
               this.titleSize != null &&
               titleSize > this.axisSize){
                pvc.log("WARNING: Inconsistent options '" +
                            this.panelName + "TitleSize: " +  JSON.stringify(this.titleSize) +
                            this.panelName + "Size: " +  JSON.stringify(this.axisSize));

               titleSize = this.axisSize;
            }
        }

        this.titleSize = titleSize;

        if(this.axisSize == null){
            this.axisSize = this.titleSize + 50;
        }
    },

    create: function(){

        this.setAnchoredSize(this.axisSize);
        
        this.base();
        
        // ??
        this.extend(this.pvScale, this.panelName + "Scale_");
        
        this.renderAxis();
    },

    /**
     * @override
     */
    applyExtensions: function(){
        
        this.base();

        this.extend(this.pvPanel,      this.panelName + "_"     );
        this.extend(this.pvRule,       this.panelName + "Rule_" );
        this.extend(this.pvTicks,      this.panelName + "Ticks_");
        this.extend(this.pvLabel,      this.panelName + "Label_");
        this.extend(this.pvRuleGrid,   this.panelName + "Grid_" );
        this.extend(this.pvTitle,      this.panelName + "TitleLabel_");
        this.extend(this.pvEndLine,    this.panelName + "EndLine_");
        this.extend(this.pvMinorTicks, this.panelName + "MinorTicks_");
    },

    setScale: function(scale){
        this.pvScale = scale;
        this.scale = scale; // TODO: At least HeatGrid depends on this. Maybe Remove?
    },
    
    /**
     * Initializes a new layer panel.
     * @override
     */
    initLayerPanel: function(pvPanel, layer){
        if(layer === 'gridLines'){
            pvPanel.zOrder(-10);
        }
    },
    
    renderAxis: function(){
        // Z-Order
        // ==============
        // -10 - grid lines   (on 'gridLines' background panel)
        //   0 - content (specific chart types should render content on this zOrder)
        //  10 - end line     (on main foreground panel)
        //  20 - ticks        (on main foreground panel)
        //  30 - ruler (begin line) (on main foreground panel)
        //  40 - labels       (on main foreground panel)
        
        // Range
        var rMin  = this.pvScale.min,
            rMax  = this.pvScale.max,
            rSize = rMax - rMin,
            ruleParentPanel = this.pvPanel;

        if(this.title){
           this.pvTitlePanel = this.pvPanel.add(pv.Panel)
                [this.anchor             ](0)     // bottom (of the axis panel)
                [this.anchorOrthoLength()](this.titleSize) // height
                [this.anchorOrtho()      ](rMin)  // left
                [this.anchorLength()     ](rSize) // width
                ;

            this.pvTitle = this.pvTitlePanel.anchor('center').add(pv.Label)
                .lock('text', this.title)
                .lock('font', this.titleFont)

                // Rotate text over center point
                .lock('textAngle',
                    this.anchor === 'left'  ? -Math.PI/2 :
                    this.anchor === 'right' ?  Math.PI/2 :
                    null)
                ;

            // Create a container panel to draw the remaining axis components
            ruleParentPanel = this.pvPanel.add(pv.Panel)
                [this.anchorOpposite()   ](0) // top (of the axis panel)
                [this.anchorOrthoLength()](this.axisSize - this.titleSize) // height
                [this.anchorOrtho()      ](0)     // left
                [this.anchorLength()     ](rSize) // width
                ;
        }

        this.pvRule = ruleParentPanel.add(pv.Rule)
            .zOrder(30) // see pvc.js
            .strokeStyle('black')
            // ex: anchor = bottom
            [this.anchorOpposite()](0)     // top    (of the axis panel)
            [this.anchorLength()  ](rSize) // width  
            [this.anchorOrtho()   ](rMin); // left


        if(this.endLine){
            var anchorOrthoLength = this.anchorOrthoLength(),
                ruleLength = this._parent[anchorOrthoLength] - 
                             this[anchorOrthoLength];
            
        	this.pvEndLine = this.pvRule.add(pv.Rule)
                    .zOrder(10)
                    .visible(true) // break inheritance of pvRule's visible property
                    .strokeStyle("#f0f0f0")
                    [this.anchorOpposite()](-ruleLength)
                    [this.anchorLength()  ](null)
                    [this.anchorOrtho()   ](rMax)
                    [anchorOrthoLength    ]( ruleLength);
        }
         
        if (this.ordinal){
            if(this.useCompositeAxis){
                this.renderCompositeOrdinalAxis();
            } else {
                this.renderOrdinalAxis();
            }
        } else {
            this.renderLinearAxis();
        }
    },
    
    renderOrdinalAxis: function(){

        var scale = this.pvScale,
            anchorOpposite    = this.anchorOpposite(),
            anchorLength      = this.anchorLength(),
            anchorOrtho       = this.anchorOrtho(),
            anchorOrthoLength = this.anchorOrthoLength(),
            ordinalDimension  = this.chart.dataEngine.getDimension(this.ordinalDimensionName),
            ticks =  ordinalDimension.getVisibleElements();
        
        // Ordinal ticks correspond to ordinal datums.
        // Ordinal ticks are drawn at the center of each band,
        //  and not at the beginning, as in a linear axis.
        this.pvTicks = this.pvRule.add(pv.Rule)
            .zOrder(20) // see pvc.js
            .data(ticks)
            //[anchorOpposite   ](0)
            [anchorLength     ](null)
            [anchorOrtho      ](function(e){
                return scale(e.value) + (scale.range().band / 2);
            })
            [anchorOrthoLength](this.tickLength)
            .strokeStyle('rgba(0,0,0,0)'); // Transparent by default, but extensible

        var align = this.isAnchorTopOrBottom() 
                    ? "center"
                    : (this.anchor == "left") ? "right" : "left";
        
        // All ordinal labels are relevant and must be visible
        this.pvLabel = this.pvTicks.anchor(this.anchor).add(pv.Label)
            .zOrder(40) // see pvc.js
            .textAlign(align)
            //.textBaseline("middle")
            .text(function(e){return e.label;})
            .font("9px sans-serif");
        
        if(this.fullGrid){
            // Grid rules are visible on all ticks,
            //  but on the first tick. 
            // The 1st tick is not shown.
            // The 2nd tick separates categ 1 from categ 2.
            // The Nth tick separates categ. N-1 from categ. N
            // No grid line is drawn at the end.
            var ruleLength = this._parent[anchorOrthoLength] - 
                             this[anchorOrthoLength];
            
            this.pvRuleGrid = this.getPvPanel('gridLines').add(pv.Rule)
                .extend(this.pvRule)
                .data(ticks)
                .strokeStyle("#f0f0f0")
                [anchorOpposite   ](-ruleLength)
                [anchorLength     ](null)
                [anchorOrtho      ](function(e){
                    return scale(e.value) - scale.range().margin / 2;
                })
                [anchorOrthoLength]( ruleLength)
                .visible(function(){return (this.index > 0);});
        }
    },

    renderLinearAxis: function(){
        // NOTE: Includes time series, 
        // so "d" may be a number or a Date object...
        
        var scale  = this.pvScale,
            ticks  = pvc.scaleTicks(
                        scale, 
                        this.domainRoundMode === 'tick', 
                        this.desiredTickCount),
            anchorOpposite    = this.anchorOpposite(),    
            anchorLength      = this.anchorLength(),
            anchorOrtho       = this.anchorOrtho(),
            anchorOrthoLength = this.anchorOrthoLength(),
            tickStep = Math.abs(ticks[1] - ticks[0]); // ticks.length >= 2
                
        // (MAJOR) ticks
        var pvTicks = this.pvTicks = this.pvRule.add(pv.Rule)
            .zOrder(20)
            .data(ticks)
            // [anchorOpposite ](0) // Inherited from pvRule
            [anchorLength     ](null)
            [anchorOrtho      ](scale)
            [anchorOrthoLength](this.tickLength);
            // Inherit axis color
            //.strokeStyle('black'); // control visibility through color or through .visible
        
        // MINOR ticks are between major scale ticks
        if(this.minorTicks){
            this.pvMinorTicks = this.pvTicks.add(pv.Rule)
                .zOrder(20) // not inherited
                //.data(ticks)  // ~ inherited
                //[anchorOpposite   ](0)   // Inherited from pvRule
                //[anchorLength     ](null)  // Inherited from pvTicks
                [anchorOrtho      ](function(d){ 
                    return scale((+d) + (tickStep / 2)); // NOTE: (+d) converts Dates to numbers, just like d.getTime()
                })
                [anchorOrthoLength](this.tickLength / 2)
                .visible(function(){
                    return (!pvTicks.scene || pvTicks.scene[this.index].visible) &&
                           (this.index < ticks.length - 1); 
                });
        }
        
        this.renderLinearAxisLabel(ticks);
        
        // Now do the full grids
        if(this.fullGrid){
            // Grid rules are visible (only) on MAJOR ticks.
            // When EndLine is active it is drawn above the last grid line.
            var ruleLength = this._parent[anchorOrthoLength] - 
                             this[anchorOrthoLength];
            
            this.pvRuleGrid = this.getPvPanel('gridLines').add(pv.Rule)
                .extend(this.pvRule)
            	.data(ticks)
                .strokeStyle("#f0f0f0")
                [anchorOpposite   ](-ruleLength)
                [anchorLength     ](null)
                [anchorOrtho      ](scale)
                [anchorOrthoLength]( ruleLength);
        }
    },
    
    renderLinearAxisLabel: function(ticks){
        // Labels are visible (only) on MAJOR ticks,
        // On first and last tick care is taken
        //  with their H/V alignment so that
        //  the label is not drawn off the chart.

        // Use this margin instead of textMargin, 
        // which affects all margins (left, right, top and bottom).
        // Exception is the small 0.5 textMargin set below....
        var labelAnchor = this.pvTicks.anchor(this.anchor)
                                .addMargin(this.anchorOpposite(), 2);
        
        var label = this.pvLabel = labelAnchor.add(pv.Label)
            .zOrder(40)
            .text(this.pvScale.tickFormat)
            .font("9px sans-serif")
            .textMargin(0.5) // Just enough for some labels not to be cut (vertical)
            .visible(true);
        
        // Label alignment
        var rootPanel = this.pvPanel.root;
        if(this.isAnchorTopOrBottom()){
            label.textAlign(function(){
                var absLeft;
                if(this.index === 0){
                    absLeft = label.toScreenTransform().transformHPosition(label.left());
                    if(absLeft <= 0){
                        return 'left'; // the "left" of the text is anchored to the tick's anchor
                    }
                } else if(this.index === ticks.length - 1) { 
                    absLeft = label.toScreenTransform().transformHPosition(label.left());
                    if(absLeft >= rootPanel.width()){
                        return 'right'; // the "right" of the text is anchored to the tick's anchor
                    }
                }
                return 'center';
            });
        } else {
            label.textBaseline(function(){
                var absTop;
                if(this.index === 0){
                    absTop = label.toScreenTransform().transformVPosition(label.top());
                    if(absTop >= rootPanel.height()){
                        return 'bottom'; // the "bottom" of the text is anchored to the tick's anchor
                    }
                } else if(this.index === ticks.length - 1) { 
                    absTop = label.toScreenTransform().transformVPosition(label.top());
                    if(absTop <= 0){
                        return 'top'; // the "top" of the text is anchored to the tick's anchor
                    }
                }
                
                return 'middle';
            });
        }
    },

    // ----------------------------
    // Click / Double-click
    _handleDoubleClick: function(d, ev){
        if(!d){
            return;
        }
        
        var action = this.doubleClickAction;
        if(action){
            this._ignoreClicks = 2;

            action.call(null, d, ev);
        }
    },

    _shouldHandleClick: function(){
        var options = this.chart.options;
        return options.selectable || (options.clickable && this.clickAction);
    },

    _handleClick: function(d, ev){
        if(!d || !this._shouldHandleClick()){
            return;
        }

        // Selection
        
        if(!this.doubleClickAction){
            this._handleClickCore(d, ev);
        } else {
            // Delay click evaluation so that
            // it may be canceled if double click meanwhile
            // fires.
            var myself  = this,
                options = this.chart.options;
            window.setTimeout(
                function(){
                    myself._handleClickCore.call(myself, d, ev);
                },
                options.doubleClickMaxDelay || 300);
        }
    },

    _handleClickCore: function(d, ev){
        if(this._ignoreClicks) {
            this._ignoreClicks--;
            return;
        }

        // Classic clickAction
        var action = this.clickAction;
        if(action){
            action.call(null, d, ev);
        }

        // TODO: should this be cancellable by the click action?
        var options = this.chart.options;
        if(options.selectable && this.ordinal){
            var toggle = options.ctrlSelectMode && !ev.ctrlKey;
            this._selectOrdinalElement(d, toggle);
        }
    },

    _selectOrdinalElement: function(element, toggle){
        var dataEngine = this.chart.dataEngine;

        var dimClause = {};
        dimClause[this.ordinalDimensionName] = [element.path];
        var selectedData = dataEngine.getWhere([dimClause]);

        if(toggle){
            dataEngine.clearSelections();
        }
        
        dataEngine.toggleSelections(selectedData);

        this.chart.categoricalPanel._handleSelectionChanged();
    },

    /////////////////////////////////////////////////
    //begin: composite axis
    
    getLayoutSingleCluster: function(elements, orientation, maxDepth){
        
        var depthLength = this.axisSize - this.titleSize;

        // displace to take out bogus-root
        maxDepth++;
        var baseDisplacement = depthLength / maxDepth;
        var margin = maxDepth > 2 ? ((1/12) * depthLength) : 0;//heuristic compensation
        baseDisplacement -= margin;
        
        var scaleFactor = maxDepth / (maxDepth - 1);
        var orthogonalLength = pvc.BasePanel.orthogonalLength[orientation];
        //var dlen = (orthogonalLength == 'width')? 'dx' : 'dy';
        
        var displacement = (orthogonalLength == 'width')?
                ((orientation == 'left')? [-baseDisplacement, 0] : [baseDisplacement, 0]) :
                ((orientation == 'top')?  [0, -baseDisplacement] : [0, baseDisplacement]);

        // Store without compensation for lasso handling
        this.axisDisplacement = displacement.slice(0);

        for(var i=0;i<this.axisDisplacement.length;i++){
            var ad = this.axisDisplacement[i];
            if(ad < 0){
                ad -= margin;
            } else if(ad > 0){
                ad = 0 ;
            }

            this.axisDisplacement[i] = ad * scaleFactor;
        }
        
        this.pvRule
            .strokeStyle(null)
            .lineWidth(0);

        var panel = this.pvRule
                        .add(pv.Panel)
                            [orthogonalLength](depthLength)//.overflow('hidden')
                            .strokeStyle(null)
                            .lineWidth(0) //cropping panel
                        .add(pv.Panel)
                            [orthogonalLength](depthLength * scaleFactor)
                            .strokeStyle(null)
                            .lineWidth(0);// panel resized and shifted to make bogus root disappear

        panel.transform(pv.Transform.identity.translate(displacement[0], displacement[1]));
        
        // Create with bogus-root
        // pv.Hierarchy must always have exactly one root and
        //  at least one element besides the root
        var layout = panel.add(pv.Layout.Cluster.Fill)
            .nodes(elements)
            .orient(orientation);
            
        // keep node references for lasso selection
        this.storedElements = elements;
        
        return layout;
    },
    
    getBreadthCounters: function(elements){
       var breadthCounters = {};
       for(var i =0; i<elements.length; i++){
            var name = elements[i][0];
            if(!breadthCounters[name]){
                breadthCounters[name] = 1;
            }
            else {
                breadthCounters[name] = breadthCounters[name] + 1;
            }
        }
        return breadthCounters;
    },
    
    getAreaSelections: function(x, y, dx, dy){
        
        var selections = [];
        
        if(!this.useCompositeAxis){
            return selections;
        }
        
        x-= this.axisDisplacement[0];
        y-= this.axisDisplacement[1];
        
        var xf = x + dx,
            yf = y + dy;
            
        this.storedElements[0].visitBefore(function(node, i){
            if(i > 0){
                var centerX = node.x + node.dx /2,
                    centerY = node.y + node.dy /2;
            
                if(x < centerX && centerX < xf && 
                   y < centerY && centerY < yf){
                    selections.push(node.path);
                }
           }
        });
        
        // Remove selections following an ascendant selection
        var lastSelection = null;
        var compressedSelections = [];
        for(var i = 0 ; i < selections.length ; i++){
            var selection = selections[i];
            if(lastSelection == null || !pvc.arrayStartsWith(selection, lastSelection)){
                lastSelection = selection;
                compressedSelections.push(selection);
            }
        }
        
        return compressedSelections;
    },


    renderCompositeOrdinalAxis: function(){
        var myself = this,
            chart = this.chart;

        var isTopOrBottom = this.isAnchorTopOrBottom(),
            axisDirection = isTopOrBottom ? 'h' : 'v';
        
        var ordinalDimension = chart.dataEngine.getDimension(this.ordinalDimensionName),
            // TODO: extend this to work with chart.orientation?
            reverse  = this.anchor == 'bottom' || this.anchor == 'left',
            treeInfo = ordinalDimension.createElementsTree(true, reverse),
            maxDepth = treeInfo.maxDepth,
            elements = treeInfo.root.nodes(); // descendantOrSelf, pre-order traversal, copy

        var tipsyGravity = 's';
        switch(this.anchor){
            case 'bottom':
                tipsyGravity = 's';
                break;
            case 'top':
                tipsyGravity = 'n';
                break;
            case 'left':
                tipsyGravity = 'w';
                break;
            case 'right':
                tipsyGravity = 'e';
                break;
        }

        var layout = this.getLayoutSingleCluster(elements, this.anchor, maxDepth);

        var diagDepthCutoff = 2; //depth in [-1/(n+1), 1]
        var vertDepthCutoff = 2;

        // See what will fit so we get consistent rotation
        layout.node
            .def("fitInfo", null)
            .height(function(d, e, f){
                // Just iterate and get cutoff
                var fitInfo = pvc.text.getFitInfo(d.dx, d.dy, d.label, myself.font, diagMargin);
                if(!fitInfo.h){
                    if(axisDirection == 'v' && fitInfo.v){ // prefer vertical
                        vertDepthCutoff = Math.min(diagDepthCutoff, d.depth);
                    } else {
                        diagDepthCutoff = Math.min(diagDepthCutoff, d.depth);
                    }
                }

                this.fitInfo(fitInfo);

                return d.dy;
            });

        // label space (left transparent)
        // var lblBar =
        layout.node.add(pv.Bar)
            .fillStyle('rgba(127,127,127,.001)')
            .strokeStyle(function(d){
                if(d.maxDepth == 1 || d.maxDepth == 0) { // 0, 0.5, 1
                    return null;
                }

                return "rgba(127,127,127,0.3)"; //non-terminal items, so grouping is visible
            })
            .lineWidth( function(d){
                if(d.maxDepth == 1 || d.maxDepth == 0) {
                    return 0;
                }
                return 0.5; //non-terminal items, so grouping is visible
            })
            .text(function(d){
                return d.label;
            });

        //cutoffs -> snap to vertical/horizontal
        var H_CUTOFF_ANG = 0.30;
        var V_CUTOFF_ANG = 1.27;
        //var V_CUTOFF_RATIO = 0.8;
        var diagMargin = pvc.text.getFontSize(this.font) / 2;

        var align = isTopOrBottom ?
                    "center" :
                    (this.anchor == "left") ? "right" : "left";

        //draw labels and make them fit
        this.pvLabel = layout.label.add(pv.Label)
            .def('lblDirection','h')
            .textAngle(function(d){
                if(d.depth >= vertDepthCutoff && d.depth < diagDepthCutoff){
                    this.lblDirection('v');
                    return -Math.PI/2;
                }

                if(d.depth >= diagDepthCutoff){
                    var tan = d.dy/d.dx;
                    var angle = Math.atan(tan);
                    //var hip = Math.sqrt(d.dy*d.dy + d.dx*d.dx);

                    if(angle > V_CUTOFF_ANG){
                        this.lblDirection('v');
                        return -Math.PI/2;
                    }

                    if(angle > H_CUTOFF_ANG) {
                        this.lblDirection('d');
                        return -angle;
                    }
                }

                this.lblDirection('h');
                return 0;//horizontal
            })
            .textMargin(1)
            //override central alignment for horizontal text in vertical axis
            .textAlign(function(d){
                return (axisDirection != 'v' || d.depth >= vertDepthCutoff || d.depth >= diagDepthCutoff)? 'center' : align;
            })
            .left(function(d) {
                return (axisDirection != 'v' || d.depth >= vertDepthCutoff || d.depth >= diagDepthCutoff)?
                     d.x + d.dx/2 :
                     ((align == 'right')? d.x + d.dx : d.x);
            })
            .font(myself.font)
            .text(function(d){
                var fitInfo = this.fitInfo();
                switch(this.lblDirection()){
                    case 'h':
                        if(!fitInfo.h){//TODO: fallback option for no svg
                            return pvc.text.trimToWidth(d.dx, d.label, myself.font, '..');
                        }
                        break;
                    case 'v':
                        if(!fitInfo.v){
                            return pvc.text.trimToWidth(d.dy, d.label, myself.font, '..');
                        }
                        break;
                    case 'd':
                       if(!fitInfo.d){
                          //var ang = Math.atan(d.dy/d.dx);
                          var diagonalLength = Math.sqrt(d.dy*d.dy + d.dx*d.dx) ;
                          return pvc.text.trimToWidth(diagonalLength - diagMargin, d.label, myself.font,'..');
                        }
                        break;
                }
                return d.label;
            })
            .cursor('default')
            .events('all'); //labels don't have events by default

        if(this._shouldHandleClick()){
            this.pvLabel
                .cursor("pointer")
                .event('click', function(d){
                    var ev = arguments[arguments.length - 1];
                    return myself._handleClick(d, ev);
                });
        }

        if(this.doubleClickAction){
            this.pvLabel
                .cursor("pointer")
                .event("dblclick", function(d){
                    var ev = arguments[arguments.length - 1];
                    myself._handleDoubleClick(d, ev);
                });
        }

        // tooltip
        this.pvLabel
            //.def('tooltip', '')
            .title(function(d){
                this.instance()['tooltip'] = d.label;
                return '';
            })
            .event("mouseover", pv.Behavior.tipsy({//Tooltip
                gravity: tipsyGravity,
                fade: true,
                offset: diagMargin * 2,
                opacity:1
            }));
    }
    // end: composite axis
    /////////////////////////////////////////////////
});

/*
 * XAxisPanel panel.
 *
 */
pvc.XAxisPanel = pvc.AxisPanel.extend({

    anchor: "bottom",
    panelName: "xAxis"

    //constructor: function(chart, options){
    //    this.base(chart,options);
    //}
});

/*
 * SecondXAxisPanel panel.
 *
 */
pvc.SecondXAxisPanel = pvc.XAxisPanel.extend({

    panelName: "secondXAxis"

    //constructor: function(chart, options){
    //    this.base(chart,options);
    //}
});


/*
 * YAxisPanel panel.
 *
 */
pvc.YAxisPanel = pvc.AxisPanel.extend({

    anchor: "left",
    panelName: "yAxis"

    //constructor: function(chart, options){
    //    this.base(chart,options);
    //}
});

/*
 * SecondYAxisPanel panel.
 *
 */
pvc.SecondYAxisPanel = pvc.YAxisPanel.extend({

    panelName: "secondYAxis"

    //constructor: function(chart, options){
    //    this.base(chart,options);
    //}
});

/**
 * PieChart is the main class for generating... pie charts (surprise!).
 */
pvc.PieChart = pvc.BaseChart.extend({

  pieChartPanel : null,
  legendSource: 'category',
  tipsySettings: {
    gravity: "s",
    fade: true
  },

  constructor: function(options){

    this.base(options);

    // Apply options
    pvc.mergeDefaults(this.options, pvc.PieChart.defaultOptions, options);
  },

  preRender: function(){

    this.base();

    pvc.log("Prerendering in pieChart");

    this.pieChartPanel = new pvc.PieChartPanel(this, {
      innerGap: this.options.innerGap,
      explodedSliceRadius: this.options.explodedSliceRadius,
      explodedSliceIndex:  this.options.explodedSliceIndex,
      showValues:   this.options.showValues,
      showTooltips: this.options.showTooltips
    });

    this.pieChartPanel.appendTo(this.basePanel); // Add it
  }

}, {
    defaultOptions: {
        showValues: true,
        innerGap: 0.9,
        explodedSliceRadius: 0,
        explodedSliceIndex:  null,
        
        showTooltips:  true,
        tooltipFormat: function(s, c, v){
            var val = this.chart.options.valueFormat(v);
            var pct = this.chart.options.percentValueFormat(v / this.sum * 100);
            return c + ":  " + val + " (" + pct + ")";
        }
    }
});


/*
 * Pie chart panel. Generates a pie chart. Specific options are:
 * <i>showValues</i> - Show or hide slice value. Default: false
 * <i>explodedSliceIndex</i> - Index of the slice to explode. Default: null
 * <i>explodedSliceRadius</i> - If one wants a pie with an exploded effect,
 *  specify a value in pixels here. If above argument is specified, explodes
 *  only one slice. Else explodes all. Default: 0
 * <i>innerGap</i> - The percentage of the inner area used by the pie. Default: 0.9 (90%)
 *
 * Has the following protovis extension points:
 *
 * <i>chart_</i> - for the main chart Panel
 * <i>pie_</i> - for the main pie wedge
 * <i>pieLabel_</i> - for the main pie label
 */


pvc.PieChartPanel = pvc.BasePanel.extend({

  _parent: null,
  pvPie: null,
  pvPieLabel: null,
  data: null,

  innerGap: 0.9,
  explodedSliceRadius: 0,
  explodedSliceIndex: null,
  showTooltips: true,
  showValues: true,

  sum: 0,

  constructor: function(chart, options){

    this.base(chart,options);

  },

  create: function(){

    var myself=this;

    this.consumeFreeClientSize();
    
    this.base();
    
    // Add the chart. For a pie chart we have one series only

    var colors = this.chart.colors(pv.range(this.chart.dataEngine.getCategoriesSize()));
    var colorFunc = function(d){
      var cIdx = myself.chart.dataEngine.getVisibleCategoriesIndexes()[this.index];
      return colors(cIdx);
    };
    
    this.data = this.chart.dataEngine.getVisibleValuesForSeriesIndex(0);

    this.sum = pv.sum(this.data);
    var a = pv.Scale.linear(0, this.sum).range(0, 2 * Math.PI);
    var r = pv.min([this.width, this.height])/2 * this.innerGap;

    pvc.log("Radius: "+ r + "; Maximum sum: " + this.sum);


    this.pvPie = this.pvPanel.add(pv.Wedge)
    .data(this.data)
    .bottom(function(d){
      return myself.explodeSlice("cos", a, this.index);
    })
    .left(function(d){
      return myself.explodeSlice("sin", a, this.index);
    })
    .outerRadius(function(d){
      return myself.chart.animate(0 , r)
    })
    .fillStyle(colorFunc)
    .angle(function(d){
      return a(d)
    })
    .text(function(d){
      var s = myself.chart.dataEngine.getVisibleSeries()[this.parent.index]
      var c = myself.chart.dataEngine.getVisibleCategories()[this.index]
      return myself.chart.options.tooltipFormat.call(myself,s,c,d);
    })

    if(this.showTooltips){
      this.extend(this.chart.tipsySettings,"tooltip_");
      this.pvPie
      .event("mouseover", pv.Behavior.tipsy(this.chart.tipsySettings));

    }

    if (this.chart.options.clickable){
      this.pvPie
      .cursor("pointer")
      .event("click",function(d){
        var s = myself.chart.dataEngine.getVisibleSeries()[this.parent.index];
        var c = myself.chart.dataEngine.getVisibleCategories()[this.index];
        var e = arguments[arguments.length-1];
        return myself.chart.options.clickAction(s, c, d, e);
      });
    }

    // Extend pie
    this.extend(this.pvPie,"pie_");


    this.pvPieLabel = this.pvPie.anchor("outer").add(pv.Label)
    //.textAngle(0)
    .text(function(d){
      return " "+ d.toFixed(2)
    })
    .textMargin(10)
    .visible(this.showValues);

    // Extend pieLabel
    this.extend(this.pvPieLabel,"pieLabel_");


    // Extend body
    this.extend(this.pvPanel,"chart_");


  },

  accumulateAngle: function(a,idx){

    var arr = this.data.slice(0,idx);
    arr.push(this.data[idx]/2);
    var angle = a(pv.sum(arr));
    return angle;

  },

  explodeSlice: function(fun, a, idx){

    var size = 0;
    if(this.explodedSliceIndex == null){
      size = this.explodedSliceRadius
    }
    else{
      size = this.explodedSliceIndex==idx?this.explodedSliceRadius:0;
    }
    return (fun=="cos"?this.height:this.width)/2 + size*Math[fun](this.accumulateAngle(a,idx));

  }

});

/**
 * BarChart is the main class for generating... bar charts (another surprise!).
 */
pvc.BarChart = pvc.CategoricalAbstract.extend({

    barChartPanel : null,

    constructor: function(options){

        this.base(options);

        // Apply options
        pvc.mergeDefaults(this.options, pvc.BarChart.defaultOptions, options);
    },

    /**
     * Processes options after user options and default options have been merged.
     * @override
     */
    _processOptionsCore: function(options){

        options.waterfall = false;
        options.percentageNormalized = false;
        
        this.base(options);
    },

    /* @override */
    createCategoricalPanel: function(){
        pvc.log("Prerendering in barChart");

        this.barChartPanel = new pvc.WaterfallChartPanel(this, {
            waterfall:          false,
            barSizeRatio:       this.options.barSizeRatio,
            maxBarSize:         this.options.maxBarSize,
            showValues:         this.options.showValues,
            valuesAnchor:       this.options.valuesAnchor,
            orientation:        this.options.orientation
        });
        
        return this.barChartPanel;
    }
}, {
    defaultOptions: {
        showValues:   true,
        barSizeRatio: 0.9,
        maxBarSize:   2000,
        valuesAnchor: "center"
    }
});


/***************
 *  removed BarChartPanel  (CvK)
 *
 * Refactored the CODE:  BarChartPanel is now replaced by the
 *    WaterfallChartPanel as the Waterfallchart code is easier to extend.
 *    (in a next refactoringstep we could take the waterfall specific
 *     code out of the Waterfallchart panel out and make 
 *     restore inherence to waterfall being a special case of barChart.
 *
 ***************/


/**
 * A NormalizedBarChart is a 100% stacked bar chart.
 */
pvc.NormalizedBarChart = pvc.CategoricalAbstract.extend({

    barChartPanel : null,

    constructor: function(options){

        this.base(options);

        // Apply options
        options = pvc.mergeDefaults(this.options, pvc.NormalizedBarChart.defaultOptions, options);
    },

    /**
     * Processes options after user options and default options have been merged.
     * @override
     */
    _processOptionsCore: function(options){

        options.waterfall = false;
        options.stacked = true;
        options.percentageNormalized = true;

        this.base(options);
    },
    
    /* @override */
    createCategoricalPanel: function(){
        pvc.log("Prerendering in barChart");

        this.barChartPanel = new pvc.WaterfallChartPanel(this, {
            waterfall:          false,
            barSizeRatio:       this.options.barSizeRatio,
            maxBarSize:         this.options.maxBarSize,
            showValues:         this.options.showValues,
            valuesAnchor:       this.options.valuesAnchor,
            orientation:        this.options.orientation
        });
        
        return this.barChartPanel;
    }
}, {
    defaultOptions: {
        showValues:   true,
        barSizeRatio: 0.9,
        maxBarSize:   2000,
        valuesAnchor: "center"
    }
});
/**
 * ScatterAbstract is the class that will be extended by
 * dot, line, stackedline and area charts.
 */
pvc.ScatterAbstract = pvc.CategoricalAbstract.extend({

    scatterChartPanel : null,
    
    constructor: function(options){

        this.base(options);

        // Apply options
        pvc.mergeDefaults(this.options, pvc.ScatterAbstract.defaultOptions, options);
    },

    /* @override */
    createCategoricalPanel: function(){
        pvc.log("Prerendering in ScatterAbstract");

        this.scatterChartPanel = new pvc.ScatterChartPanel(this, {
            showValues:     this.options.showValues,
            valuesAnchor:   this.options.valuesAnchor,
            showLines:      this.options.showLines,
            showDots:       this.options.showDots,
            showAreas:      this.options.showAreas,
            orientation:    this.options.orientation
        });

        return this.scatterChartPanel;
    }
}, {
    defaultOptions: {
        showDots: false,
        showLines: false,
        showAreas: false,
        showValues: false,
        axisOffset: 0.05,
        valuesAnchor: "right",
        panelSizeRatio: 1
    }
});

/**
 * Dot Chart
 */
pvc.DotChart = pvc.ScatterAbstract.extend({

    constructor: function(options){

        this.base(options);

        this.options.showDots = true;
    }
});

/**
 * Line Chart
 */
pvc.LineChart = pvc.ScatterAbstract.extend({

    constructor: function(options){

        this.base(options);

        this.options.showLines = true;
    }
});

/**
 * Stacked Line Chart
 */
pvc.StackedLineChart = pvc.ScatterAbstract.extend({

    constructor: function(options){

        this.base(options);

        this.options.showLines = true;
        this.options.stacked = true;
    }
});

/**
 * Stacked Area Chart
 */
pvc.StackedAreaChart = pvc.ScatterAbstract.extend({

    constructor: function(options){

        this.base(options);

        this.options.showAreas = true;
        this.options.stacked = true;
    }
});

/*
 * Scatter chart panel. Base class for generating the other xy charts. Specific options are:
 * <i>showDots</i> - Show or hide dots. Default: true
 * <i>showAreas</i> - Show or hide dots. Default: false
 * <i>showLines</i> - Show or hide dots. Default: true
 * <i>showValues</i> - Show or hide line value. Default: false
 *
 * Has the following protovis extension points:
 *
 * <i>chart_</i> - for the main chart Panel
 * <i>line_</i> - for the actual line
 * <i>linePanel_</i> - for the panel where the lines sit
 * <i>lineDot_</i> - the dots on the line
 * <i>lineLabel_</i> - for the main line label
 */
pvc.ScatterChartPanel = pvc.CategoricalAbstractPanel.extend({

    pvLine: null,
    pvLineOrArea: null,
    pvDot: null,
    pvLabel: null,
    pvCategoryPanel: null,

    showAreas: false,
    showLines: true,
    showDots: true,
    showValues: true,
    
    valuesAnchor: "right",

    _seriesDimName: 'series',

//    constructor: function(chart, options){
//        this.base(chart,options);
//    },
  
    /**
     * @override
     */
    createCore: function(){

        var myself = this,
            chart = this.chart,
            options  = chart.options,
            de = chart.dataEngine,
            isVertical = this.isOrientationVertical(),
            invisibleFill = 'rgba(127,127,127,0.00001)';

        // ------------------
        // DATA
        var seriesDimension = de.getDimension(this._seriesDimName),
            visibleSeriesElems = seriesDimension.getVisibleElements(),

            // Cache series data
            dataBySeries = this._calcDataBySeries(visibleSeriesElems),
            selDataBySeries = this._calcSelDataBySeries(dataBySeries),

            stackedOffsets = options.stacked ?
                    this._computeStackedOffsets(de.getVisibleTransposedValues(), true) :
                    null;

        // ------------------
        // SIGNUM (COORDINATES)
        var anchor = isVertical ? "bottom" : "left",
            anchorOrtho = this.anchorOrtho(anchor),
            anchorOrthoLength = this.anchorOrthoLength(anchor),
            anchorOpposite = this.anchorOpposite(anchor),
            
            orthoScale = chart.getLinearScale({bypassAxisSize: true}),
            orthoZero  = orthoScale(0),
            baseScale,
            signumBasePosition,
            signumSelBasePosition;

        if(options.timeSeries){ // ~ Continuous base scale
            baseScale = chart.getTimeseriesScale({
                            bypassAxisSize:   true,
                            bypassAxisOffset: true
                        });

            signumBasePosition = function(){
                return baseScale(this.datum().elem.category.value);
            };

            signumSelBasePosition = function(){
                var pos = signumBasePosition.call(this);

                // Odd indexes correspond to intermediate auxiliary dots
                if(this.index % 2 > 0){
                    var prevScene = this.sibling();
                    if(prevScene){
                        var prevPos = prevScene[anchorOrtho];
                        pos -= (pos - prevPos) / 2;
                    }
                }

                return pos;
            };
        } else { // ~ Discrete base scale
            baseScale = chart.getOrdinalScale({bypassAxisSize: true});
            
            var halfBand = baseScale.range().band / 2;

            signumBasePosition = function(){
                return baseScale(this.datum().elem.category.value) + halfBand;
            };

            signumSelBasePosition = function(){
                var pos = signumBasePosition.call(this);

                // Odd indexes correspond to intermediate auxiliary dots
                if(this.index % 2 > 0){
                    pos -= halfBand;
                }

                return pos;
            };
        }

        function signumOrthoPosition(){
            return orthoZero;
        }

         function signumOrthoLength(){
            var len = calcSignumOrthoLength.call(this);
            return myself.chart.animate(0, len);
        }

        function signumSelOrthoLength(){
            var len = calcSignumOrthoLength.call(this);

            // Odd indexes correspond to intermediate auxiliary dots
            if(this.index % 2 > 0){
                var prevScene = this.sibling();
                if(prevScene){
                    var prevLen = prevScene[anchorOrthoLength];
                    len -= (len - prevLen) / 2;
                }
            }

            return myself.chart.animate(0, len);
        }

        // Not animated
        function calcSignumOrthoLength(){

            var datum = this.datum(),
                orthoDomainOffset;
            if(stackedOffsets){
                // Assuming all categories are visible...
                var seriesIndex = datum.elem.category.leafIndex;
                orthoDomainOffset = stackedOffsets[this.parent.index][seriesIndex];
            }

            var value = (datum.value || 0) + (orthoDomainOffset || 0);
            return orthoScale(value) - orthoZero;
        }

        // ------------------
        // COLOR
        
        // -- DOT --
        function dotColorInterceptor(getDatumColor, args){
            if(!myself.showDots){
                return invisibleFill;
            }

            var darker = !getDatumColor && myself.showAreas ? 0.6 : null;
            return calcColor.call(this, getDatumColor, args, null, darker);
        }

        // -- LINE --
        function lineColorInterceptor(getDatumColor, args){

            var darker = !getDatumColor && options.stacked ? 0.6 : null,
                grayIfSelected = true;
            
            return calcColor.call(this, getDatumColor, args, null, darker, null, grayIfSelected);
        }
        
        function lineSelColorInterceptor(getDatumColor, args){
            
            if(!myself.showLines || !this.datum().isSelected()){
                return invisibleFill;
            }

            var darker = !getDatumColor && options.stacked ? 0.6 : null;

            return calcColor.call(this, getDatumColor, args, null, darker);
        }

        // -- AREA --
        var areaColorAlpha = this.showAreas && this.showLines && !options.stacked ?
                            0.5 : null;

        function fillColorInterceptor(getDatumColor, args){
            if(!myself.showAreas){
                return invisibleFill;
            }

            var hasSelections = de.getSelectedCount() > 0,
                grayAlpha = options.stacked && hasSelections ? 1 : null,
                grayIfSelected = true;

            return calcColor.call(this, getDatumColor, args, areaColorAlpha, null, grayAlpha, grayIfSelected);
        }

        function selAreaColorInterceptor(getDatumColor, args){
            if(!myself.showAreas || !this.datum().isSelected()){
                return invisibleFill;
            }

            return calcColor.call(this, getDatumColor, args, areaColorAlpha);
        }

        // Generic color "controller"
        var colors = chart.colors(pv.range(seriesDimension.getSize()));
        
        function calcColor(getDatumColor, args, alpha, darker, grayAlpha, grayIfSelected){
            var color;

            if(getDatumColor){
                color = getDatumColor.apply(this, args);
                if(color === null){
                    return null;
                }
            }

            if(color === undefined){
                var seriesIndex = this.datum().elem[myself._seriesDimName].leafIndex;
                color = colors(seriesIndex);
            }

            // ----------

            if(de.getSelectedCount() > 0 &&
               (grayIfSelected || !this.datum().isSelected())){
                return pvc.toGrayScale(color, grayAlpha);
            }

            if(alpha != null){
                color = color.alpha(alpha);
                //color = options.stacked ? color.darker(0.6) : color.alpha(0.4);
            }

            if(darker != null){
                color = color.darker(darker);
            }

            return color;
        }
        
        // ---------------
        // BUILD
        this.pvPanel.zOrder(0);

        if(options.showTooltips || this._shouldHandleClick()){
            this.pvPanel
              // Receive events even if in a transparent panel (#events default is "painted")
              .events("all")
              .event("mousemove", pv.Behavior.point(40))
              ;
        }

        this.pvScatterPanel = this.pvPanel.add(pv.Panel).data(visibleSeriesElems);

        this.pvArea = this.pvScatterPanel.add(pv.Area)
            .lock('data',  function(seriesElem){ return dataBySeries[seriesElem.absValue]; })
            .lock('datum', function(datum){ return datum; })
            .lock('segmented', false) // fixed

            // Physical dimensions
            .lock(anchor,            signumOrthoPosition) // ex: bottom
            .lock(anchorOrthoLength, signumOrthoLength)   // ex: height
            .lock(anchorOrtho,       signumBasePosition)  // ex: left

            // Style
            // These have no meaning in the area and should not be used
            .lock('strokeStyle', null)
            .lock('lineWidth',   0)

            .intercept('fillStyle', fillColorInterceptor, this._getExtension('area', 'fillStyle'))
            ;
        
        this.pvLine = this.pvArea.anchor(anchorOpposite).add(pv.Line)
            // should lock lots of things here...
            
            // Style
            .intercept('strokeStyle', lineColorInterceptor, this._getExtension('line', 'strokeStyle'))
            .lineWidth(this.showLines ? 1.5 : 0.001)

            .text(this._createPropDatumTooltip())
            ;

        // -- SELECTION --
        this.pvSelArea = this.pvArea.add(pv.Area)
            .data(function(seriesElem){ return selDataBySeries[seriesElem.absValue]; })
            // datum function inherited
            .visible(function(){ return !chart.isAnimating; })
            .segmented(true) // fixed

            // Physical dimensions
            // anchor function inherited
            [anchorOrtho](signumSelBasePosition) // ex: left
            [anchorOrthoLength](signumSelOrthoLength) // ex: height

            // Style
            // NOTE: the order: fillStyle, strokeStyle, lineWidth IS relevant
            .intercept('fillStyle',  selAreaColorInterceptor, this._getExtension('area', 'fillStyle'))
            
            // TRY to hide vertical lines between contiguous areas
            // When alpha is used (in non-stacked charts, see logic in selAreaColorInterceptor)
            // it is better to hide the stroke altogether,
            // because strokes with alpha do not generally render with the same color as the fill.
            // When alpha is not used, we specify a larger line width to bridge the gaps between areas.
            //  But when the line with is too large, and showLines = false,
            //   when selected, the area becomes noticeably bigger than when
            //   not selected.
            //   When also showDots = false,
            //   the join between lines on small angle corners, like:  /\
            //   becomes very hairy...
            .strokeStyle(function(){ return this.fillStyle(); })
            .lineWidth(function(){
                var color = this.strokeStyle();
                return (!color || color.a < 1) ? 0.00001 : 0.5;
            })

            // Interaction
            .events("all")
            ;

//        METHOD 2 - not better - explicit lines separating areas
//        The disadvantage is that lines in areas get drawn all around, not just vertically.
//        
//        var lineColor = pv.Color.names.white.alpha(0.3);
//        function selAreaStrokeColor(){
//            if(!myself.showAreas || !this.datum().isSelected()){
//                return invisibleFill;
//            }
//
//            return lineColor;
//        }
//        .strokeStyle(selAreaStrokeColor)
//        .lineWidth(function(){ return (this.index % 2) == 0 ? 0.3 : 0.01; })

        this.pvSelLine = this.pvSelArea
            .anchor(anchorOpposite) // receives from pvSelArea/anchor: data, datum, visible, left, top, right, ...
            .extend(this.pvLine)    // receive others, not overriden by anchor from pvLine: text, lineWidth, user extensions
            .add(pv.Line)
            // ----------
            //.data(function(seriesElem){ return selDataBySeries[seriesElem.absValue]; })
            // datum function inherited
            //.visible(function(){ return !chart.isAnimating; })
            .segmented(true) // fixed
            
            .intercept('strokeStyle', lineSelColorInterceptor, this._getExtension('line', 'strokeStyle'))
            .intercept('fillStyle',   lineSelColorInterceptor, this._getExtension('line', 'fillStyle'))
            .events("all")
            ;

        // -- DOT --
        // NOTE: must be added AFTER selection marks because of Z-order!
        this.pvDot = this.pvLine.add(pv.Dot)
            .shapeSize(12)
            .lineWidth(1.5)
            .intercept('strokeStyle', dotColorInterceptor, this._getExtension('dot', 'strokeStyle'))
            .intercept('fillStyle',   dotColorInterceptor, this._getExtension('dot', 'fillStyle'))
            ;

        if(this.showValues){
            this.pvLabel = this.pvDot
                .anchor(this.valuesAnchor)
                .add(pv.Label)
                // ------
                .bottom(0)
                .text(function(){
                    return options.valueFormat(this.datum().value);
                })
                ;
        }
        
        // -- INTERACTION --
        if(options.showTooltips){
            // TODO - tooltips centered on areas?
//            var settings = pvc.mergeOwn(
//                        pvc.create(options.tipsySettings),
//                        {
//                            gravity: function(){
//                                return tipsyBehavior.tipMark.type === 'area' ? "c" : "s";
//                            }
//                        });
            this.pvDot
                .localProperty("tooltip", String) // see pvc.js
                .tooltip(function(){
                    var tooltip;

                    if(options.customTooltip){
                        var datum = this.datum(),
                            v = datum.value,
                            s = datum.elem.series.rawValue,
                            c = datum.elem.category.rawValue;

                        tooltip = options.customTooltip.call(null, s, c, v, datum);
                    }

                    return tooltip;
                })
                .title(function(){
                    return ''; // prevent browser tooltip
                })
                .event("point", pv.Behavior.tipsy(options.tipsySettings))
                ;
        }
        
        if (this._shouldHandleClick()){
            this._addPropClick(this.pvDot);

            if(this.showAreas){
                this._addPropClick(this.pvSelArea);
            }
        }

        if(options.doubleClickAction) {
            this._addPropDoubleClick(this.pvDot);

            if(this.showAreas){
                this._addPropDoubleClick(this.pvSelArea);
            }
        }
    },

    /**
     * Called when a render has ended.
     *
     * Re-renders selection marks.
     */
    _onRenderEnd: function(animated){
        if(animated){
            this.pvSelArea.render();
            this.pvSelLine.render();
        }
    },
    
    /**
     * @override
     */
    applyExtensions: function(){

        this.base();

        // Extend lineLabel
        this.extend(this.pvLabel, "lineLabel_");
        
        this.extend(this.pvScatterPanel, "scatterPanel_");
        this.extend(this.pvArea,  "area_");
        this.extend(this.pvLine,  "line_");
        this.extend(this.pvDot,   "dot_");
        this.extend(this.pvLabel, "label_");
    },

    /**
     * Returns the datum associated with the
     * current rendering indexes of this.pvLine.
     *
     * @override
     */
    _getRenderingDatum: function(mark){
        return (mark || this.pvLine).datum();
    },
    
    /**
     * Renders this.pvBarPanel - the parent of the marks that are affected by selection changes.
     * @override
     */
    _renderSignums: function(){
        this.pvScatterPanel.render();
    },

    /**
     * Returns an array of marks whose instances are associated to a datum, or null.
     * @override
     */
    _getSignums: function(){
        var marks = [];
        
        marks.push(this.pvDot);
        
        if(this.showLines || this.showAreas){
            marks.push(this.pvSelLine);
        }
        
        return marks;
    },

    _calcDataBySeries: function(visibleSeriesElems){
        var dataBySeries = {},
            dataEngine = this.chart.dataEngine;

        visibleSeriesElems.forEach(function(seriesElem){
            var dimsFilter = {};
            dimsFilter[this._seriesDimName] = [seriesElem.absValue];

            var data = dataEngine.getWhere([dimsFilter]);

            dataBySeries[seriesElem.absValue] = data;
        }, this);

        return dataBySeries;
    },

    _calcSelDataBySeries: function(dataBySeries){
        var selDataBySeries = {};

        pvc.forEachOwn(dataBySeries, function(data, absSeriesValue){
            selDataBySeries[absSeriesValue] = this._calcSeriesSelData(data);
        }, this);

        return selDataBySeries;
    },

    _calcSeriesSelData: function(data){
        /*
         * Area selection data is twice the size of data.
         * When an area is selected, the dot-datum must be in the middle!
         * So, we create a before-dot area and an after-dot area.
         *  j | 0           | 1            | ... j            | ... | n = N-1
         *    | -  (D0) AA0 | BA1 (D1) AA1 | ... BAj (Dj) AAj | ... | BAn (Dn) - |
         *  k | -       0   | 1        2   |     2j-1     2j  | ... | 
         *
         *  D  - Dot/Datum
         *  BA - Before-Area
         *  AA - After-Area
         *
         * Only the first and last dots do not have a before and an after area,
         * respectively.
         *
         * All AA are in an even k-index.
         */
        var categCount = data.length;
        if(categCount <= 1){
            return [];
        }
        // >= 2
        
        var selData = [];
        
        for(var c = 0 ; c < categCount ; c++){
            var datum = data[c];

            // If not the first
            if(c){
                selData.push(datum);
            }

            // If not the last
            //if(c < categCount){
                selData.push(datum);
            //}
        }

        return selData;
    },
    
    _computeStackedOffsets: function(dataSet, reverse){
        /**
         *     c0, c1, c2, c3
         * [  [              ] s0
         *    [              ] s1
         *  ]
         */
        var stackedOffsets = [],
            seriesCount = dataSet.length;

        if(seriesCount){
            var categCount  = dataSet[0].length;
            if(categCount){
                var start = reverse ? seriesCount - 2 : 1,
                    stop  = reverse ? -1 : seriesCount, // stop is exclusive...
                    step  = reverse ? -1 : 1;

                // reverse ? seriesCount - 1 : 0
                stackedOffsets[start - step] = pvc.newArray(categCount, 0);

                for(var c = 0 ; c < categCount ; c++){
                    var categOffset = 0;
                    new pvc.Range(start, stop, step).forEach(function(s){
                        var seriesOffsets = stackedOffsets[s] ||
                                            (stackedOffsets[s] = new Array(categCount)); // happens on c == 0

                        categOffset += dataSet[s - step][c] || 0;

                        seriesOffsets[c] = categOffset;
                    });
                }

            }
        }

        return stackedOffsets;
    }
});

/**
 * HeatGridChart is the main class for generating... heatGrid charts.
 *  A heatGrid visualizes a matrix of values by a grid (matrix) of *
 *  bars, where the color of the bar represents the actual value.
 *  By default the colors are a range of green values, where
 *  light green represents low values and dark green high values.
 *  A heatGrid contains:
 *     - two categorical axis (both on x and y-axis)
 *     - no legend as series become rows on the perpendicular axis 
 *  Please contact CvK if there are issues with HeatGrid at cde@vinzi.nl.
 */
pvc.HeatGridChart = pvc.CategoricalAbstract.extend({

    heatGridChartPanel : null,

    constructor: function(options){

        this.base(options);

        var defaultOptions = {
            colorValIdx: 0,
            sizeValIdx: 0,
            defaultValIdx: 0,
            measuresIndexes: [2],

            //multi-dimensional clickable label
            useCompositeAxis:false,
            showValues: true,
            axisOffset: 0,
            
            orientation: "vertical",
            // use a categorical here based on series labels
            scalingType: "linear",    // "normal" (distribution) or "linear"
            normPerBaseCategory: true,
            numSD: 2,                 // width (only for normal distribution)
            nullShape: undefined,
            shape: undefined,
            useShapes: false,
            colorRange: ['red', 'yellow','green'],
            colorRangeInterval:  undefined,
            minColor: undefined, //"white",
            maxColor: undefined, //"darkgreen",
            nullColor:  "#efc5ad"  // white with a shade of orange
        };

        // Apply options
        pvc.mergeDefaults(this.options, defaultOptions, options);

        // enforce some options  for the HeatGridChart
        this.options.orthoAxisOrdinal = true;
        this.options.legend = false;
        this.options.orginIsZero = true;
        if(this.options.useCompositeAxis){//force array support
            this.options.isMultiValued = true;
        }
    },

    /* @override */
    createCategoricalPanel: function(){
        pvc.log("Prerendering in heatGridChart");

        var options = this.options;
        this.heatGridChartPanel = new pvc.HeatGridChartPanel(this, {
            heatGridSizeRatio:  options.heatGridSizeRatio,
            maxHeatGridSize:    options.maxHeatGridSize,
            showValues:         options.showValues,
            orientation:        options.orientation
        });

        return this.heatGridChartPanel;
    }
});

/*
 * HeatGrid chart panel. Generates a heatGrid chart. Specific options are:
 * <i>orientation</i> - horizontal or vertical. Default: vertical
 * <i>showValues</i> - Show or hide heatGrid value. Default: false
 * <i>heatGridSizeRatio</i> - In multiple series, percentage of inner
 * band occupied by heatGrids. Default: 0.5 (50%)
 * <i>maxHeatGridSize</i> - Maximum size of a heatGrid in pixels. Default: 2000
 *
 * Has the following protovis extension points:
 *
 * <i>chart_</i> - for the main chart Panel
 * <i>heatGrid_</i> - for the actual heatGrid
 * <i>heatGridPanel_</i> - for the panel where the heatGrids sit
 * <i>heatGridLabel_</i> - for the main heatGrid label
 */
pvc.HeatGridChartPanel = pvc.CategoricalAbstractPanel.extend({

    pvHeatGrid: null,
    pvHeatGridLabel: null,
    data: null,

    heatGridSizeRatio: 0.5,
    maxHeatGridSize: 200,

    showValues: true,
    orientation: "vertical",

    colorValIdx:   0,
    sizeValIdx:    0,
    defaultValIdx: 0,
    shape: "square",
    nullShape: "cross",

    defaultBorder: 1,
    nullBorder: 2,
    selectedBorder: 2,
    
    selectNullValues: false,
    
//    constructor: function(chart, options){
//        this.base(chart,options);
//    },

    getValue: function(d, i){
        if(d != null && d[0] !== undefined){
            if(i != null && d[i] !== undefined){
                return d[i];
            }
            
            return d[0];
        }
        
        return d;
    },
    
    getColorValue: function(d){
        return this.getValue(d, this.colorValIdx);
    },

    valuesToText: function(vals){
        if(vals != null && vals[0] !== undefined){// $.isArray(vals)){
            return vals.join(', ');
        }
        else return vals;
    },

    /**
     * @override
     */
    createCore: function(){

        var myself = this,
            options = this.chart.options;
        
        this.colorValIdx = options.colorValIdx;
        this.sizeValIdx = options.sizeValIdx;
        this.selectNullValues = options.nullShape != null;
        
        // colors
        options.nullColor = pv.color(options.nullColor);
        if(options.minColor != null) options.minColor = pv.color(options.minColor);
        if(options.maxColor != null) options.maxColor = pv.color(options.maxColor);
        
        if(options.shape != null) {this.shape = options.shape;}
        
        var anchor = this.isOrientationVertical() ? "bottom" : "left";

        // reuse the existings scales
        var xScale = this.chart.xAxisPanel.scale;
        var yScale = this.chart.yAxisPanel.scale;
        
        var cols = (anchor === "bottom") ? xScale.domain() : yScale.domain();

        // NOTE: used in .getNormalColorScale()
        var origData = this.origData = this.chart.dataEngine.getVisibleTransposedValues();
        
        // create a mapping of the data that shows the columns (rows)
        var data = origData.map(function(d){
            return pv.dict(cols, function(){
                return d[this.index];
            });
        });

        // get an array of scaling functions (one per column)
        var fill = this.getColorScale(data, cols);

        /* The cell dimensions. */
        var w = (xScale.max - xScale.min) / xScale.domain().length;
        var h = (yScale.max - yScale.min) / yScale.domain().length;

        if (anchor !== "bottom") {
            var tmp = w;
            w = h;
            h = tmp;
        }
        
        this._cellWidth = w;
        this._cellHeight = h;
        
        this.pvHeatGrid = this.pvPanel.add(pv.Panel)
            .data(cols)
            [pvc.BasePanel.relativeAnchor[anchor]](function(){ //ex: datum.left(i=1 * w=15)
                return this.index * w;
                })
            [pvc.BasePanel.parallelLength[anchor]](w)
            .add(pv.Panel)
            .data(data)
            .datum(function(){
                return myself._getRenderingDatum();
            })
            [anchor]
            (function(){
                return this.index * h;
            })
            [pvc.BasePanel.orthogonalLength[anchor]](h)
            .antialias(false)
            .strokeStyle(null)
            .lineWidth(0)
            .overflow('hidden'); //overflow important if showValues=true
        
        // tooltip text
        this.pvHeatGrid.text(function(d,f){
            return myself.getValue(d[f]);
        });
         
        // set coloring and shape / sizes if enabled
        if(options.useShapes){
            this.createHeatMap(data, w, h, options, fill);
        } else {
            // no shapes, apply color map to panel itself
            this.pvHeatGrid.fillStyle(function(dat, col){
                return (dat[col] != null) ? fill[col](dat[col]) : options.nullColor;
            });

            // Tooltip
            if(options.showTooltips){
                this.pvHeatGrid
                    .event("mouseover", pv.Behavior.tipsy(options.tipsySettings));
            }
        }

        // clickAction
        if (this._shouldHandleClick()){
            this._addPropClick(this.pvHeatGrid);
        }
        
        //showValues
        if(this.showValues){
            var getValue = function(row, rowAgain, rowCol){
                return row[rowCol];
            };

            this.pvHeatGridLabel = this.pvHeatGrid
                .anchor("center")
                .add(pv.Label)
                .bottom(0)
                .text(getValue);
        }
    },

    /**
     * @override
     */
    applyExtensions: function(){

        this.base();

        if(this.pvHeatGridLabel){
            this.extend(this.pvHeatGridLabel, "heatGridLabel_");
        }

        // Extend heatGrid and heatGridPanel
        this.extend(this.pvHeatGrid,"heatGridPanel_");
        this.extend(this.pvHeatGrid,"heatGrid_");
    },

    /**
     * Returns the datum associated with the
     * current rendering indexes of this.pvHeatGrid.
     *
     * @override
     */
    _getRenderingDatum: function(mark){
        if(!mark){
            mark = this.pvHeatGrid;
        }

        var index = mark.index;
        if(index < 0){
            return null;
        }

        var visibleSerIndex = index,
            visibleCatIndex = mark.parent.index;

        return this._getRenderingDatumByIndexes(visibleSerIndex, visibleCatIndex);
    },
    
    // heatgrid with resizable shapes instead of panels
    createHeatMap: function(data, w, h, options, fill){
        var myself = this,
            dataEngine = this.chart.dataEngine;
        
        //total max in data
        var maxSizeVal = pv.max(data, function(datum){// {col:value ..}
            return pv.max( pv.values(datum).map(
                function(d){ return myself.getValue(d, myself.sizeValIdx); })) ;
        });

        var minSizeVal = pv.min(data, function(datum){// {col:value ..}
            return pv.min( pv.values(datum).map(
                function(d){ return myself.getValue(d, myself.sizeValIdx); })) ;
        });

        var maxSizeSpan = Math.abs(maxSizeVal - minSizeVal);

        var maxRadius = Math.min(w,h) / 2;
        if(this.shape === 'diamond'){
            // Protovis draws diamonds inscribed on
            // a square with half-side radius*Math.SQRT2
            // (so that diamonds just look like a rotated square)
            // For the height of the dimanod not to exceed the cell size
            // we compensate that factor here.
            maxRadius /= Math.SQRT2;
        }

        // Small margin
        maxRadius -= 2;

        var maxArea = maxRadius * maxRadius;// apparently treats as square area even if circle, triangle is different
     
        var sizeValueToArea = function(value){
            return 1 + (maxArea - 1) *
                       (value == null ? 0 : (Math.abs(value - minSizeVal) / maxSizeSpan));
        };
        
        var getLineWidth = function(value, isSelected){
            if(myself.sizeValIdx == null ||
               !myself.isNullShapeLineOnly() ||
               myself.getValue(value, myself.sizeValIdx) != null)
            {
                return isSelected ? myself.selectedBorder : myself.defaultBorder;
            } 
            
            // is null and needs border to show up
            if(isSelected){
                return (myself.selectedBorder == null || myself.selectedBorder == 0) ?
                       myself.nullBorder :
                       myself.selectedBorder;
            }

            return (myself.defaultBorder > 0) ? myself.defaultBorder : myself.nullBorder;
        };
        
        var getBorderColor = function(value, i, selected){
            // return getFillColor(value,i,selected).darker();
            var bcolor = getFillColor(value, i, true);
            return (dataEngine.getSelectedCount() == 0 || selected) ? bcolor.darker() : bcolor;
        };
        
        var getFillColor = function(value, i, isSelected){
           var color = options.nullColor;
           if(myself.colorValIdx != null && myself.getColorValue(value) != null){
               color =  fill[i](myself.getColorValue(value));
           }
           
           if(dataEngine.getSelectedCount() > 0 && !isSelected){
                //non-selected items
                //return color.alpha(0.5);
                return pvc.toGrayScale(color);
           }
           
           return color;
        };
        
        // chart generation
        this.shapes = this.pvHeatGrid
            .add(pv.Dot)
            .localProperty("selected", Boolean) // localProperty: see pvc.js
            .selected(function(){ return this.datum().isSelected(); })
            .shape( function(r, ra ,i){
                if(options.sizeValIdx == null){
                    return myself.shape;
                }
                return myself.getValue(r[i], options.sizeValIdx) != null ? myself.shape : options.nullShape;
            })
            .shapeSize(function(r,ra, i) {
                if(myself.sizeValIdx == null){
                    if(options.nullShape == null &&
                       myself.getValue(r[i], myself.colorValIdx) == null){
                        return 0;
                    }
                    
                    return maxArea;
                }
                
                var val = myself.getValue(r[i], myself.sizeValIdx);
                return (val == null && options.nullShape == null) ?
                        0 : sizeValueToArea(myself.getValue(r[i], myself.sizeValIdx));
            })
            .lock('shapeAngle') // rotation of shapes may cause them to not fit the calculated cell. Would have to improve the radius calculation code.
            .fillStyle(function(r, ra, i){
                return getFillColor(r[i], i, this.selected());
            })
            .lineWidth(function(r, ra, i){
                return getLineWidth(r[i], this.selected());
            })
            .strokeStyle(function(r, ra, i){
                if( !(getLineWidth(r[i], this.selected()) > 0) ){ //null|<0
                    return null;//no style
                }

                //has width
                return (myself.getValue(r[i], myself.sizeValIdx) != null) ?
                            getBorderColor(r[i], i, this.selected()) :
                            getFillColor(r[i], i, this.selected());
            })
            .text(function(r, ra, i){
                return myself.valuesToText(r[i]);
            });

        if(this._shouldHandleClick()){
            this._addPropClick(this.shapes);
        }

        if(options.doubleClickAction){
            this._addPropDoubleClick(this.shapes);
        }
        
        if(options.showTooltips){
            this.shapes
                .localProperty("tooltip", String) // localProperty: see pvc.js
                .tooltip(function(){
                    var tooltip = this.tooltip();
                    if(!tooltip){
                        var datum = this.datum(),
                            v = datum.value;

                        if(options.customTooltip){
                            var s = datum.elem.series.rawValue,
                                c = datum.elem.category.rawValue;
                            tooltip = options.customTooltip(s, c, v, datum);
                        } else {
                            tooltip = myself.valuesToText(v);
                        }
                    }
                    
                    return tooltip;
                })
                .title(function(){
                    return ''; //prevent browser tooltip
                })
                .event("mouseover", pv.Behavior.tipsy(options.tipsySettings));
        }
    },

    /**
     * Prevent creation of selection overlay if not 'isMultiValued'.
     * @override
     */
    _createSelectionOverlay: function(){
        var options = this.chart.options;
        if(options.useShapes && options.isMultiValued){
            this.base();
        }
    },
    
    isNullShapeLineOnly: function(){
      return this.nullShape == 'cross';  
    },

// TODO:
//    isValueNull: function(s,c){
//      var sIdx = this.chart.dataEngine.getSeries().indexOf(s);
//      var cIdx = this.chart.dataEngine.getCategories().indexOf(c);
//      var val = this.chart.dataEngine.getValues()[cIdx][sIdx];
//
//      return val == null || val[0] == null;
//    },

    /**
     * Returns an array of marks whose instances are associated to a datum, or null.
     * @override
     */
    _getSignums: function(){
        return [this.shapes];
    },
    
    /**
     * Renders the heat grid panel.
     * @override
     */
    _renderSignums: function(){
        this.pvPanel.render();
    },

    /*
     *selections (end)
     **********************/
    
//    /**
//     * TODO: Get label color that will contrast with given bg color
//     */
//    getLabelColor: function(r, g, b){
//        var brightness = (r*299 + g*587 + b*114) / 1000;
//        if (brightness > 125) {
//            return '#000000';
//        } else {
//            return '#ffffff';
//        }
//    },
    
  /***********
   * compute an array of fill-functions. Each column out of "cols" 
   * gets it's own scale function assigned to compute the color
   * for a value. Currently supported scales are:
   *    -  linear (from min to max
   *    -  normal distributed from   -numSD*sd to  numSD*sd 
   *         (where sd is the standards deviation)
   ********/
  getColorScale: function(data, cols) {
      switch (this.chart.options.scalingType) {
        case "normal":
          return this.getNormalColorScale(data, cols, this.colorValIdx, this.origData);//TODO:
        case "linear":
          return this.getLinearColorScale(data, cols, this.colorValIdx);
        case "discrete":
            return this.getDiscreteColorScale(data, cols, this.chart.options, this.colorValIdx);
        default:
          throw "Invalid option " + this.scaleType + " in HeatGrid";
    }
  },
  
  getColorRangeArgs: function(options){
    var rangeArgs = options.colorRange;
    if(options.minColor != null && options.maxColor != null){
        rangeArgs = [options.minColor,options.maxColor];
    }
    else if (options.minColor != null){
        rangeArgs.splice(0,1,options.minColor);
    }
    else if (options.maxColor != null){
        rangeArgs.splice(rangeArgs.length-1,1,options.maxColor);
    }
    return rangeArgs;
  },
  
  getColorDomainArgs: function(data, cols, options, rangeArgs, colorIdx){
    var domainArgs = options.colorRangeInterval;
    if(domainArgs != null && domainArgs.length > rangeArgs.length){
        domainArgs = domainArgs.slice(0, rangeArgs.length);
    }
    if(domainArgs == null){
        domainArgs = [];
    }
    
    if(domainArgs.length < rangeArgs.length){
        var myself = this;
        var min = pv.dict(cols, function(cat){
          return pv.min(data, function(d){
            var val = myself.getValue(d[cat], colorIdx);
            if(val!= null) return val;
            else return Number.POSITIVE_INFINITY;//ignore nulls
          });
        });
        var max = pv.dict(cols, function(cat){
          return pv.max(data, function(d){
            var val = myself.getValue(d[cat], colorIdx);
            if(val!= null) return val;
            else return Number.NEGATIVE_INFINITY;//ignore nulls
          });
        });
        
        if(options.normPerBaseCategory){
            return pv.dict(cols, function(category){
              return myself.padColorDomainArgs(rangeArgs, [], min[category], max[category]);  
            });
        }
        else {
            var theMin = min[cols[0]];
            for (var i=1; i<cols.length; i++) {
              if (min[cols[i]] < theMin) theMin = min[cols[i]];
            }
            var theMax = max[cols[0]];
            for (var i=1; i<cols.length; i++){
              if (max[cols[i]] > theMax) theMax = max[cols[i]];
            }
            if(theMax == theMin)
            {
                if(theMax >=1){
                    theMin = theMax -1;
                } else {
                    theMax = theMin +1;
                }
            }
            return this.padColorDomainArgs(rangeArgs, domainArgs, theMin, theMax);
        }
        
    }
    
    return domainArgs;
  },
  
  padColorDomainArgs: function(rangeArgs, domainArgs, min, max){
    //use supplied numbers
    var toPad =
          domainArgs == null ?
          rangeArgs.length +1 :
          rangeArgs.length +1 - domainArgs.length;
    switch(toPad){
      case 1:
          //TODO: should adapt to represent middle?
          domainArgs.push(max);
          break;
      case 2:
          domainArgs = [min].concat(domainArgs).concat(max);
          break;
      default://build domain from range
          var step = (max - min)/(rangeArgs.length -1);
          domainArgs = pv.range(min, max +step , step);
    }
    return domainArgs;
  },
  
  getDiscreteColorScale: function(data, cols, options, colorIdx){
    var colorRange = this.getColorRangeArgs(options);
    var domain = this.getColorDomainArgs(data, cols, options, colorRange, colorIdx);

    //d0--cR0--d1--cR1--d2
    var getColorVal = function(val, domain, colorRange){
        if(val == null) return options.nullColor;
        if(val <= domain[0]) return pv.color(colorRange[0]);
        for(var i=0; i<domain.length-1;i++){
             if(val > domain[i] && val < domain[i+1]){
                return pv.color(colorRange[i]);
             }
        }
        return pv.color(colorRange[colorRange.length-1]);
    };
    
    if(options.normPerBaseCategory){
        return pv.dict(cols, function (category){
            var dom = domain[category];
            return function(val){
                return getColorVal(val, dom, colorRange);
            }
        });
        
    }
    else {
        return pv.dict(cols, function(col){
            return function(val){
                return getColorVal(val, domain, colorRange);
            };
           
        });
    }
    
  },

  getLinearColorScale: function(data, cols, colorIdx){

    var options = this.chart.options;
    var myself = this;

    var rangeArgs = this.getColorRangeArgs(options);
    
    var domainArgs = options.colorRangeInterval;
    if(domainArgs != null && domainArgs.length > rangeArgs.length){
        domainArgs = domainArgs.slice(0, rangeArgs.length);
    }
    if(domainArgs == null){
        domainArgs = [];
    }
    
    if(domainArgs.length < rangeArgs.length || options.normPerBaseCategory){
        
        var min = pv.dict(cols, function(cat){
          return pv.min(data, function(d){
            var val = myself.getValue(d[cat], colorIdx);
            if(val!= null) return val;
            else return Number.POSITIVE_INFINITY;//ignore nulls
          });
        });
        var max = pv.dict(cols, function(cat){
          return pv.max(data, function(d){
            var val = myself.getValue(d[cat], colorIdx);
            if(val!= null) return val;
            else return Number.NEGATIVE_INFINITY;//ignore nulls
          });
        });
        
        if (options.normPerBaseCategory){  //  compute a scale-function for each column (each key
          //overrides colorRangeIntervals
            return pv.dict(cols, function(f){
                var fMin = min[f],
                    fMax = max[f];
                if(fMax == fMin)
                {
                    if(fMax >=1){
                        fMin = fMax -1;
                    } else {
                        fMax = fMin +1;    
                    }
                }
                var step = (fMax - fMin)/( rangeArgs.length -1);
                var scale = pv.Scale.linear();
                scale.domain.apply(scale, pv.range(fMin,fMax + step, step));
                scale.range.apply(scale,rangeArgs);
                return scale;
            });
        }
        else {   // normalize over the whole array
            var theMin = min[cols[0]];
            for (var i=1; i<cols.length; i++) {
              if (min[cols[i]] < theMin) theMin = min[cols[i]];
            }
            var theMax = max[cols[0]];
            for (var i=1; i<cols.length; i++){
              if (max[cols[i]] > theMax) theMax = max[cols[i]];
            }
            if(theMax == theMin)
            {
                if(theMax >=1){
                    theMin = theMax -1;
                } else {
                    theMax = theMin +1;
                }
            } 
          //use supplied numbers
          var toPad =
                domainArgs == null ?
                rangeArgs.length :
                rangeArgs.length - domainArgs.length;
          switch(toPad){
            case 1:
                //TODO: should adapt to represent middle?
                domainArgs.push(theMax);
                break;
            case 2:
                domainArgs = [theMin].concat(domainArgs).concat(theMax);
                break;
            default:
                var step = (theMax - theMin)/(rangeArgs.length -1);
                domainArgs = pv.range(theMin, theMax + step, step);
          }
        }
    }
    var scale = pv.Scale.linear();
    scale.domain.apply(scale,domainArgs);
    scale.range.apply(scale,rangeArgs);
    return pv.dict(cols,function(f){ return scale;});
  },

  getNormalColorScale: function (data, cols, origData){
    var fill;
    var options = this.chart.options;
    if (options.normPerBaseCategory) {
      // compute the mean and standard-deviation for each column
      var myself = this;
      var mean = pv.dict(cols, function(f){
        return pv.mean(data, function(d){
          return myself.getValue(d[f]);
        })
      });
      var sd = pv.dict(cols, function(f){
        return pv.deviation(data, function(d){
          myself.getValue(d[f]);
        })
      });
      //  compute a scale-function for each column (each key)
      fill = pv.dict(cols, function(f){
        return pv.Scale.linear()
          .domain(-options.numSD * sd[f] + mean[f],
                  options.numSD * sd[f] + mean[f])
          .range(options.minColor, options.maxColor);
      });
    } else {   // normalize over the whole array
      var mean = 0.0, sd = 0.0, count = 0;
      for (var i=0; i<origData.length; i++)
        for(var j=0; j<origData[i].length; j++)
          if (origData[i][j] != null){
            mean += origData[i][j];
            count++;
          }
      mean /= count;
      for (var i=0; i<origData.length; i++){
        for(var j=0; j<origData[i].length; j++){
          if (origData[i][j] != null){
            var variance = origData[i][j] - mean;
            sd += variance*variance;
          }
        }
      }
      sd /= count;
      sd = Math.sqrt(sd);
      
      var scale = pv.Scale.linear()
        .domain(-options.numSD * sd + mean,
                options.numSD * sd + mean)
        .range(options.minColor, options.maxColor);
      fill = pv.dict(cols, function(f){
        return scale;
      });
    }

    return fill;  // run an array of values to compute the colors per column
}


});//end: HeatGridChartPanel

/**
 * MetricAbstract is the base class for all chart types that have
 * a two linear axis.
 * If the base-axis is a categorical axis you should use categoricalAbstract.
 * 
 * If you have issues with this class please contact CvK at cde@vinzi.nl 
 */
pvc.MetricAbstract = pvc.CategoricalAbstract.extend({

    constructor: function(options){
        this.base(options);

        // This categorical chart does not support selection, yet
        this.options.selectable = false;
    },

    /* @override */
    preRender: function(){
        this.base();
        
        pvc.log("Prerendering in MetricAbstract");
    },

    /*
    * Indicates if x-axis (horizontal axis) is an ordinal scale
    */
    // CvK: if we move ordinal-ordinal to a separate class this functions
    // can be probably be thrown out as it becomes identical to the
    // parent function.
    isXAxisOrdinal: function(){
        return this.options.orthoAxisOrdinal && !this.isOrientationVertical();
    },

    /*
     * Indicates if y-axis (vertical axis) is an ordinal scale
     */
    // CvK: if we move ordinal-ordinal to a separate class this functions
    // can be probably be thrown out as it becomes identical to the
    // parent fucntion.
    isYAxisOrdinal: function(){
        return this.options.orthoAxisOrdinal && this.isOrientationVertical();
    },

    /**
     * Scale for a linear base axis.
     * xx if orientation is horizontal, yy otherwise.
     *
     * Keyword arguments:
     *   bypassAxisSize:   boolean, default is false
     */
    getLinearBaseScale: function(keyArgs){
        var bypassAxisSize = pvc.get(keyArgs, 'bypassAxisSize', false),
            yAxisSize = this._getAxisSize(bypassAxisSize, 'y'),
            xAxisSize = this._getAxisSize(bypassAxisSize, 'x');

        var isVertical = this.options.orientation=="vertical";

        // compute the input-domain of the scale
        var domainMin = this.dataEngine.getCategoryMin();
        var domainMax = this.dataEngine.getCategoryMax();
        // Adding a small relative offset to the scale to prevent that
        // points are located on top of the axis:
        var offset = (domainMax - domainMin) * this.options.axisOffset;
        domainMin -= offset;
        domainMax += offset;

        // compute the output-range
        var rangeMin, rangeMax;
        if (isVertical) {
          rangeMin = yAxisSize;
          rangeMax = this.basePanel.width;
        } else {
          rangeMin = 0;
          rangeMax = this.basePanel.height - xAxisSize;
        }

        // create the (linear) Scale
        var scale = new pv.Scale.linear()
                      .domain(domainMin, domainMax)
                      .range(rangeMin, rangeMax);

        scale.min = rangeMin;
        scale.max = rangeMax;

        return scale;
    },

    /*
     * get the scale for the axis with horizontal orientation
     */
    getXScale: function(){
        var scale = null;

        if (this.isOrientationVertical()) {
            scale = this.options.timeSeries  ?
                    this.getTimeseriesScale()     :
                    this.getLinearBaseScale();   // linear is the default
        } else {
            scale = this.getLinearScale();
        } 

        return scale;
    },

    /*
     * get the scale for the axis with the vertical orientation.
     */
    getYScale: function(){
        var scale = null;
        if (this.isOrientationVertical()) {
            scale = this.getLinearScale();
        } else {
            scale = this.options.timeSeries  ?
                this.getTimeseriesScale()     :
                this.getLinearBaseScale();
        }

        return scale;
      }
});
/*********
 *  Panel use to draw line and dotCharts
 *     LScatter is for graphs with a linear base-axis
 *
 *  The original ScatterChartPanel was difficult to generalize as
 *  many (scattered) changes were needed in the long create function.
 *     OScatter could be develofor graphs with a ordinal base-axis
 *
 *  Later we might consider to merge LScatter and OScatter again, and 
 *  refactor the general stuff to an abstract base class.
 *********/


/*
 * Scatter chart panel. Base class for generating the other xy charts. Specific options are:
 * <i>orientation</i> - horizontal or vertical. Default: vertical
 * <i>showDots</i> - Show or hide dots. Default: true
 * <i>showValues</i> - Show or hide line value. Default: false
 * <i>panelSizeRatio</i> - Ratio of the band occupied by the pane;. Default: 0.5 (50%)
 * <i>lineSizeRatio</i> - In multiple series, percentage of inner
 * band occupied by lines. Default: 0.5 (50%)
 * <i>maxLineSize</i> - Maximum size of a line in pixels. Default: 2000
 *
 * Has the following protovis extension points:
 *
 * <i>chart_</i> - for the main chart Panel
 * <i>line_</i> - for the actual line
 * <i>linePanel_</i> - for the panel where the lines sit
 * <i>lineDot_</i> - the dots on the line
 * <i>lineLabel_</i> - for the main line label
 */

pvc.MetricScatterChartPanel = pvc.CategoricalAbstractPanel.extend({
    
  pvLine: null,
  pvArea: null,
  pvDot: null,
  pvLabel: null,
  pvCategoryPanel: null,
  
  showAreas: false,
  showLines: true,
  showDots: true,
  showValues: true,
  valuesAnchor: "right",
  
//  constructor: function(chart, options){
//    this.base(chart,options);
//  },

  prepareDataFunctions: function(){
    /*
        This function implements a number of helper functions via
        closures. The helper functions are all stored in this.DF
        Overriding this function allows you to implement
        a different ScatterChart.
     */
    var myself = this,
        chart = this.chart,
        dataEngine = chart.dataEngine,
        options = chart.options,
        baseScale = chart.getLinearBaseScale({bypassAxisSize: true}),
        orthoScale = chart.getLinearScale({bypassAxisSize: true}),
        tScale,
        parser;

    if(options.timeSeries){
        parser = pv.Format.date(options.timeSeriesFormat);
        tScale = chart.getTimeseriesScale({bypassAxisSize: true});
    }
    
    // create empty container for the functions and data
    myself.DF = {}

    // calculate a position along the base-axis
    myself.DF.baseCalculation = options.timeSeries ?
          function(d) { return tScale(parser.parse(d.category)); } :
          function(d) { return baseScale(d.category); };
      

    // calculate a position along the orthogonal axis
    myself.DF.orthoCalculation = function(d){
      return chart.animate(0, orthoScale(d.value));
    };

    // get a data-series for the ID
//    var pFunc;
//    if (options.timeSeries) {
//        pFunc = function(a,b){
//            return parser.parse(a.category) - parser.parse(b.category);
//        };
//    }

    var sortFun = function(a, b) {return a.category - b.category; };
    myself.DF.getSeriesData =
        function(d){
            return dataEngine.getObjectsForSeriesIndex(d, sortFun);
        };


    var colors = this.chart.colors(pv.range(dataEngine.getSeriesSize()));

    myself.DF.colorFunc = function(d){
        // return colors(d.serieIndex)
        return colors(dataEngine.getVisibleSeriesIndexes()[this.parent.index])
    };
  },

    /**
     * @override
     */
    createCore: function(){
        // Mantain the panel at its default normal z-order
        this.pvPanel.zOrder(0);

        var myself = this,
            options = this.chart.options,
            dataEngine = this.chart.dataEngine;

        if(options.showTooltips || this._shouldHandleClick()){
            this.pvPanel
                // Receive events even if in a transparent panel (default is "painted")
                .events("all")
                .event("mousemove", pv.Behavior.point(40));
        }

        var anchor = this.isOrientationVertical() ? "bottom" : "left";

        // prepare data and functions when creating (rendering) the chart.
        this.prepareDataFunctions();

        //var maxLineSize;

        // Stacked?
        if (options.stacked){

            pvc.log("WARNING: the stacked option of metric charts still needs to be implemented.");

        } else {

            // Add the series identifiers to the scatterPanel
            // One instance of pvScatterPanel per series
            this.pvScatterPanel = this.pvPanel.add(pv.Panel)
                .data(dataEngine.getVisibleSeriesIndexes());

            // Add the area
            // CvK: why adding area's if showArea
            this.pvArea = this.pvScatterPanel.add(pv.Area)
                .fillStyle(this.showAreas ? myself.DF.colorFunc : null);

            var lineWidth = this.showLines ? 1.5 : 0.001;

            // Add line and make lines invisible if not needed.
            this.pvLine = this.pvArea.add(pv.Line)
                .data(myself.DF.getSeriesData)
                .lineWidth(lineWidth)
                [pvc.BasePanel.relativeAnchor[anchor]](myself.DF.baseCalculation)
                [anchor](myself.DF.orthoCalculation);
        }

        this.pvLine
            .strokeStyle(myself.DF.colorFunc)
            .text(function(d){
                var v, c;
                var s = dataEngine.getVisibleSeries()[this.parent.index];
                if(typeof d == "object"){
                    v = d.value;
                    c = d.category;
                } else {
                    v = d;
                    c = dataEngine.getVisibleCategories()[this.index];
                }
                
                return options.tooltipFormat.call(myself,s,c,v);
            });

        if(options.showTooltips){
            this.pvLine.event("point", pv.Behavior.tipsy(options.tipsySettings));
        }

        this.pvDot = this.pvLine.add(pv.Dot)
            .shapeSize(12)
            .lineWidth(1.5)
            .strokeStyle(this.showDots ? myself.DF.colorFunc : null)
            .fillStyle(this.showDots ? myself.DF.colorFunc : null);
    
        if (this._shouldHandleClick()){
            this.pvDot
                .cursor("pointer")
                .event("click", function(d){
                    var v, c, e;
                    var s = dataEngine.getSeries()[this.parent.index];
                    if( typeof d == "object"){
                        v = d.value;
                        c = d.category
                    } else {
                        v = d
                        c = dataEngine.getCategories()[this.index];
                    }

                    e = arguments[arguments.length-1];

                    return options.clickAction(s, c, v, e);
                });
        }

        if(this.showValues){
            this.pvLabel = this.pvDot
                .anchor(this.valuesAnchor)
                .add(pv.Label)
                .bottom(0)
                .text(function(d){
                    return options.valueFormat(typeof d == "object"?d.value:d);
                });
        }
    },
    /**
     * @override
     */
    applyExtensions: function(){

        this.base();

        // Extend lineLabel
        if(this.pvLabel){
            this.extend(this.pvLabel, "lineLabel_");
        }

        // Extend line and linePanel
        this.extend(this.pvScatterPanel, "scatterPanel_");
        this.extend(this.pvArea, "area_");
        this.extend(this.pvLine, "line_");
        this.extend(this.pvDot, "dot_");
        this.extend(this.pvLabel, "label_");
    }
});
/**
 * ScatterAbstract is the class that will be extended by dot, line, stackedline and area charts.
 */
pvc.MetricScatterAbstract = pvc.MetricAbstract.extend({

    scatterChartPanel : null,
  
    constructor: function(options){

        this.base(options);

        // Apply options
        pvc.mergeDefaults(this.options, pvc.MetricScatterAbstract.defaultOptions, options);
    },

     /* @override */
    createCategoricalPanel: function(){
        pvc.log("Prerendering in MetricScatterAbstract");

        this.scatterChartPanel = new pvc.MetricScatterChartPanel(this, {
            showValues: this.options.showValues,
            valuesAnchor: this.options.valuesAnchor,
            showLines: this.options.showLines,
            showDots: this.options.showDots,
            showAreas: this.options.showAreas,
            orientation: this.options.orientation
        });

        return this.scatterChartPanel;
    }
}, {
    defaultOptions: {
        showDots: false,
        showLines: false,
        showAreas: false,
        showValues: false,
        axisOffset: 0.05,
        valuesAnchor: "right",
        panelSizeRatio: 1
    }
});

/**
 * Metric Dot Chart
 */
pvc.MetricDotChart = pvc.MetricScatterAbstract.extend({

  constructor: function(options){

    this.base(options);

    this.options.showDots = true;
  }
});


/**
 * Metric Line Chart
 */
pvc.MetricLineChart = pvc.MetricScatterAbstract.extend({

  constructor: function(options){

    this.base(options);

    this.options.showLines = true;
  }
});

/**
 * Metric Stacked Line Chart
 */
pvc.mStackedLineChart = pvc.MetricScatterAbstract.extend({

  constructor: function(options){

    this.base(options);

    this.options.showLines = true;
    this.options.stacked = true;
  }
});

/**
 * Metric Stacked Area Chart
 */
pvc.mStackedAreaChart = pvc.MetricScatterAbstract.extend({

  constructor: function(options){

    this.base(options);

    this.options.showAreas = true;
    this.options.stacked = true;
  }
});
/**
 * WaterfallChart is the main class for generating... waterfall charts.
 *
 * The waterfall chart is an alternative to the pie chart for
 * showing distributions. The advantage of the waterfall chart is that
 * it possibilities to visualize sub-totals and offers more convenient
 * possibilities to compare the size of categories (in a pie-chart you
 * have to compare wedges that are at a different angle, which
 * requires some additional processing/brainpower of the end-user).
 *
 * Waterfall charts are basically Bar-charts with some added
 * functionality. Given the complexity of the added features this
 * class has it's own code-base. However, it would be easy to
 * derive a BarChart class from this class by switching off a few
 * features.
 *
 * If you have an issue or suggestions regarding the Waterfall-charts
 * please contact CvK at cde@vinzi.nl
 */
pvc.WaterfallChart = pvc.CategoricalAbstract.extend({

    wfChartPanel : null,

    constructor: function(options){

        this.base(options);

        // Apply options
        pvc.mergeDefaults(this.options, pvc.WaterfallChart.defaultOptions, options);
    },

    /**
     * Processes options after user options and default options have been merged.
     * @override
     */
    _processOptionsCore: function(options){

        // Waterfall charts are always stacked and not percentageNormalized
        options.waterfall = true;
        options.stacked = true;
        options.percentageNormalized = false;

        this.base(options);
    },

    /**
     * Creates a custom WaterfallDataEngine.
     * [override]
     */
    createDataEngine: function(){
        return new pvc.WaterfallDataEngine(this);
    },

    /* @override */
    createCategoricalPanel: function(){
        var logMessage = "Prerendering a ";
        if (this.options.waterfall)
            logMessage += "WaterfallChart";
        else
            logMessage +=  (this.options.stacked ? "stacked" : "normal") +
                           " BarChart";
        pvc.log(logMessage);
        
        this.wfChartPanel = new pvc.WaterfallChartPanel(this, {
            waterfall:      this.options.waterfall,
            barSizeRatio:   this.options.barSizeRatio,
            maxBarSize:     this.options.maxBarSize,
            showValues:     this.options.showValues,
            orientation:    this.options.orientation
        });
        
        return this.wfChartPanel;
    }
}, {
    defaultOptions: {
        showValues:   true,
        barSizeRatio: 0.9,
        maxBarSize:   2000
    }
});


pvc.WaterfallDataEngine = pvc.DataEngine.extend({
    constructor: function(chart){
        this.base(chart);
    },

    /**
     * Creates and prepares the custom WaterfallTranslator.
     * [override]
     */
    createTranslator: function(){
        this.base();

        var sourceTranslator = this.translator;

        this.translator = new pvc.WaterfallTranslator(
                            sourceTranslator,
                            this.chart.options.waterfall,
                            this.chart.isOrientationVertical());

        pvc.log("Creating WaterfallTranslator wrapper");

        this.prepareTranslator();
    }
});

pvc.WaterfallTranslator = pvc.DataTranslator.extend({

    constructor: function(sourceTranslator, isWaterfall, isVertical){
        this.base();

        this.sourceTranslator = sourceTranslator;

        this.isWaterfall = isWaterfall;
        this.isVertical  = isVertical;
    },

    prepareImpl: function(){
        // Call base version
        this.base();

        /*
         (Total column is for waterfall)
         Values:
         [["X",    "Ser1", "Ser2", "Ser3"],
          ["Cat1", "U",      800,    1200],  // 1800 (depends on visible series)
          ["Cat2", "D",      100,     600],  //  700
          ["Cat3", "D",      400,     300],  //  700
          ["Cat4", "D",      200,     100],  //  300
          ["Cat5", "D",      100,     200]]  //  300
         */

        this.sourceTranslator.setData(this.metadata, this.resultset);
        this.sourceTranslator.dataEngine = this.dataEngine;
        this.sourceTranslator.prepareImpl();

        // The MultiValueTranslator doesn't support this kind of treatment...
        this.values = this.sourceTranslator.values;
        this.metadata = this.sourceTranslator.metadata;
        this.resultset = this.sourceTranslator.resultset;

        if(this.isWaterfall && this.isVertical){
            // Put the Total column in the last position
            //  so that when drawing, reversed,
            //  it remains at the bottom
            // ... ["Cat1",  800, 1200, "U"],
            // row[1] -> row[L-1]
            this.values = this.values.map(function(row){
                row = row.slice(0);
                row.push(row[1]);
                row.splice(1, 1);

                return row;
            });
        }
    }
});

/**
 * Waterfall chart panel (also bar-chart). Generates a bar chart. Specific options are:
 * <i>orientation</i> - horizontal or vertical. Default: vertical
 * <i>showValues</i> - Show or hide bar value. Default: false
 * <i>barSizeRatio</i> - In multiple series, percentage of inner
 * band occupied by bars. Default: 0.9 (90%)
 * <i>maxBarSize</i> - Maximum size (width) of a bar in pixels. Default: 2000
 *
 * Has the following protovis extension points:
 *
 * <i>chart_</i> - for the main chart Panel
 * <i>bar_</i> - for the actual bar
 * <i>barPanel_</i> - for the panel where the bars sit
 * <i>barLabel_</i> - for the main bar label
 */
pvc.WaterfallChartPanel = pvc.CategoricalAbstractPanel.extend({

    pvBar: null,
    pvBarLabel: null,
    pvWaterfallLine: null,
    pvCategoryPanel: null,
    pvSecondLine: null,
    pvSecondDot: null,

    data: null,

    waterfall: false,

    barSizeRatio: 0.9,
    maxBarSize: 200,
    showValues: true,

    ruleData: null,

    constructor: function(chart, options){
          this.base(chart, options);

          // Cache
          options = this.chart.options;
          this.stacked = options.stacked;
          this.percentageNormalized = this.stacked && options.percentageNormalized;
    },

    /***
    * Functions that transforms a dataSet to waterfall-format.
    *
    * The assumption made is that the first category is a tekst column
    * containing one of the following values:
    *    - "U":  If this category (row) needs go upwards (height
    *       increases)
    *    - "D": If the waterfall goes downward.
    *    - other values: the waterfall resets to zero (used represent
    *        intermediate subtotal) Currently subtotals need to be
    *        provided in the dataSet.
    *  This function computes the offsets of each bar and stores the
    *  offset in the first category (for stacked charts)
    */
    constructWaterfall: function(dataSet){
        var cumulated = 0,
            categoryIndexes = [],
            categoryTotals = [],
            cats = this.chart.dataEngine.getVisibleCategoriesIndexes(),
            seriesCount  = dataSet.length,
            totalsSeriesIndex = this.isOrientationHorizontal()
                                ? 0
                                : (seriesCount - 1),
            totalsSeries = dataSet[totalsSeriesIndex],
            catCount = cats.length;

        for(var c = 0 ; c < catCount; c++) {
            categoryIndexes.push(cats[c]);

            // Determine next action (direction)
            var mult;
            if (totalsSeries[c] == "U") {
                mult = 1;
            } else if (totalsSeries[c] == "D") {
                mult = -1;
            } else {
                mult = 1;
                cumulated = 0;
            }

            if (mult > 0){
                totalsSeries[c] = cumulated;
            }

            // Update the other series and determine new cumulated
            for(var seriesIndex = 0 ; seriesIndex < seriesCount ; seriesIndex++) {
                if(seriesIndex !== totalsSeriesIndex){
                    var series = dataSet[seriesIndex],
                        val = Math.abs(series[c]);

                    // Negative values not allowed
                    series[c] = val;

                    // Only use negative values internally for the waterfall
                    //  to control Up or Down
                    cumulated += mult * val;
                }
            }

            if (mult < 0) {
                totalsSeries[c] = cumulated;
            }

            categoryTotals.push(cumulated);
        }

        return {
            categoryIndexes: categoryIndexes,
            categoryTotals: categoryTotals
        };
    },

    getDataSet: function() {
        var dataSet;
        if(this.stacked){
          /*
            Values
            Total  A     B
            [["U", 800, 1200],  // 1800 (depends on visible series)
             ["D", 100,  600],  //  700
             ["D", 400,  300],  //  700
             ["D", 200,  100],  //  300
             ["D", 100,  200]]  //  300

            Values Transposed
            [[ "U", "D", "D", "D", "D"],
             [ 800, 100, 400, 200, 100],
             [1200, 600, 300, 100, 200]]
           */
            dataSet = pvc.padMatrixWithZeros(
                             this.chart.dataEngine.getVisibleTransposedValues());

            if (this.waterfall){
                // NOTE: changes dataSet
                this.ruleData = this.constructWaterfall(dataSet);
            } else if(this.percentageNormalized){
                this._hundredPercentData = this._createHundredPercentData(dataSet);
            }
        } else {
            dataSet = this.chart.dataEngine.getVisibleCategoriesIndexes();
        }

        return dataSet;
    },

    _createHundredPercentData: function(dataSet){
        /*
         * The dataSet is transposed, because this is a stacked chart:
         * dataSet:
         *  [[     800,   100,     400,     200,     100],   // visible series 1
         *   [    1200,   600,     300,     100,     200]]   // visible series 2
         * ----------------------------------------------
         *        2000,   700,     700,     300,     300     // category totals
         *          20,     7,       7,       3,       3     // category totals /100
         *
         * hundredPercentData:
         *   [[ 800/20, 100/7,   400/7,   200/3,   100/3]
         *    [1200/20, 600/7,   300/7,   100/3,   200/3]]
         *
         * Actually, each cell in hundredPercentData has the format:
         *   {value: 10.2345, label: "10.23%"}
         */

        var categsCount  = this.chart.dataEngine.getVisibleCategoriesIndexes().length,
            // seriesCount  = dataSet.length,
            categsTotals = new pvc.Range(categsCount).map(function(){ return 0; }),
            percentFormatter = this.chart.options.percentValueFormat;

        // Sum each category across series
        dataSet.forEach(function(seriesRow/*, seriesIndex*/){
            seriesRow.forEach(function(value, categIndex){
                categsTotals[categIndex] += pvc.number(value);
            });
        });

        // Build the 100 percent dataSet
        return dataSet.map(function(seriesRow/*, seriesIndex*/){
            return seriesRow.map(function(value, categIndex){
                value = ((100 * value) / categsTotals[categIndex])
                return {
                    value: value,
                    label: percentFormatter(value)
                };
            });
        });
    },
    
    /**
     * Returns the datum associated with the 
     * current rendering indexes of this.pvBar.
     *
     * In the case of one hundred percent charts,
     * the returned datum is augmented with a percent field,
     * which contains an object with the properties 'value' and 'label'.
     * @override 
     */
    _getRenderingDatum: function(mark){
        if(!mark){
            mark = this.pvBar;
        }
        var index = mark.index;
        if(index < 0){
            return null;
        }
        
        var visibleSerIndex = this.stacked ? mark.parent.index : index,
            visibleCatIndex = this.stacked ? index : mark.parent.index;

        return this._getRenderingDatumByIndexes(visibleSerIndex, visibleCatIndex);
    },

    /**
     * Augments the datum with 100% normalized value information.
     * @override
     */
    _getRenderingDatumByIndexes: function(visibleSerIndex, visibleCatIndex){
        var datum = this.base(visibleSerIndex, visibleCatIndex);

        // Augment the datum's values with 100 percent data
        if(datum && this._hundredPercentData){
            var renderVersion = this.chart._renderVersion;
            if(!datum.percent || datum._pctRV !== renderVersion){
                datum._pctRV = renderVersion;
                
                datum.percent = this._hundredPercentData[visibleSerIndex][visibleCatIndex];
            }
        }

        return datum;
    },

    /*
     *   This function implements a number of helper functions in order
     *   to increase the readability and extensibility of the code by:
     *    1: providing symbolic names to the numerous anonymous
     *        functions that need to be passed to CC
     *    2: by moving large parts of the local variable (parameters
     *       and scaling functions out of the 'create' function to this
     *       prepareDataFunctions block.
     *    3: More sharing of code due to introduction of the 'this.DF'
     *        for storing all helper functions.
     *    4: increased code-sharing between stacked and non-stacked
     *       variant of the bar chart.
     *    The create function is now much cleaner and easier to understand.
     *
     *   These helper functions (closures) are all stored in 'this.DF'
     *
     *   Overriding this 'prepareDataFunctions' allows you to implement
     *   a different ScatterScart.
     *   however, it is also possible to replace specific functions
     *   from the 'this.DF' object.
     */
    prepareDataFunctions:  function(dataSet, isVertical) {
        var myself = this,
            chart  = this.chart,
            options = chart.options,
            dataEngine = chart.dataEngine;

        // create empty container for the functions and data
        this.DF = {};

        // first series are symbolic labels, so hide it such that
        // the axis-range computation is possible.
        /*
            var lScale = this.waterfall
                         ? this.callWithHiddenFirstSeries(
                                this.chart,
                                this.chart.getLinearScale,
                                true)
                     : this.chart.getLinearScale({bypassAxisSize: true});
        */
        /** start  fix  (need to resolve this nicely  (CvK))**/
        if (this.waterfall) {
            // extract the maximum
            var mx = 0,
                catCount = dataSet[0].length;
            for(var c = 0 ; c < catCount ; c++) {
                var h = 0;
                for(var s = 0 ; s < dataSet.length ; s++){
                    h += dataSet[s][c];
                }
                if (h > mx) {
                	mx = h;
                }
            }

            // set maximum as a fixed bound
            options.orthoFixedMax = mx;
        }

        var lScale = chart.getLinearScale({bypassAxisSize: true});
        /** end fix **/

        var l2Scale = chart.getSecondScale({bypassAxisSize: true}),
            oScale  = chart.getOrdinalScale({bypassAxisSize: true});

        // determine barPositionOffset and barScale
        var barPositionOffset = 0,
            barScale, // for !stacked and overflow markers
            ordBand = oScale.range().band,
            barSize = ordBand;

        if(!this.stacked){
            var ordDomain = dataEngine.getVisibleSeriesIndexes();
            if(!isVertical){
                // Non-stacked Horizontal bar charts show series from
                //  top to bottom (according to the legend)
            	ordDomain = ordDomain.slice(0);
            	ordDomain.reverse();
            }

            // NOTE: 'barSizeRatio' affects the space between bars.
            // Space between categories is controlled by panelSizeRatio.
            barScale = new pv.Scale.ordinal(ordDomain)
                            .splitBanded(0, ordBand, this.barSizeRatio);

            // Export needed for generated overflow markers.
            this.DF.barScale = barScale;

            barSize = barScale.range().band;
        }

        if (barSize > this.maxBarSize) {
            barPositionOffset = (barSize - this.maxBarSize) / 2;
            barSize = this.maxBarSize;
        }

        this.DF.maxBarSize = barSize;

        /*
         * functions to determine positions along BASE axis.
         */
        if(this.stacked){
            this.DF.basePositionFunc = function(d){
                return barPositionOffset + 
                       oScale(dataEngine.getVisibleCategories()[this.index]);
            };

            // for drawRules
            if (this.waterfall){
                this.DF.baseRulePosFunc = function(d){
                    return barPositionOffset + oScale(d);
                };
            }
        } else {
            // TODO: barPositionOffset - does not affect this?
            this.DF.catContainerBasePosFunc = function(d){
                // TODO: d?? is it an index?, a category value??
                return oScale(dataEngine.getVisibleCategories()[d]);
            };

            this.DF.catContainerWidth = ordBand;

            this.DF.relBasePosFunc = function(d){
                return barPositionOffset + 
                       barScale(dataEngine.getVisibleSeriesIndexes()[this.index]);
            };
        }

        if(options.secondAxis){
            var parser = pv.Format.date(options.timeSeriesFormat);
            this.DF.secBasePosFunc = function(d){
                return options.timeSeries
                       ? tScale(parser.parse(d.category))
                       : (oScale(d.category) + ordBand / 2);
            };
        }

        /*
        * functions to determine positions along ORTHOGONAL axis
        */
       var rZero = lScale(0);
       this.DF.orthoBotPos = this.stacked ?
            rZero :
            function(d){ return lScale(pv.min([0,d])); };

        this.DF.orthoLengthFunc = (function(){
            if(this.percentageNormalized){
                return function(){
                    // Due to the Stack layout, this is evaluated in a strange way
                    // for which the datum property does not work:
                    var datum = myself._getRenderingDatum(this);
                    var d = datum.percent.value;
                    return chart.animate(0, lScale(d) - rZero);
                }
            }

            if(this.stacked){
                return function(d){
                    return chart.animate(0, lScale(d||0) - rZero);
                };
            }

            return function(d){
                return chart.animate(0, Math.abs(lScale(d||0) - rZero));
            };

        }.call(this));

        if(options.secondAxis){
            this.DF.secOrthoLengthFunc = function(d){
                return chart.animate(0, l2Scale(d.value));
            };
        }
        
        /*
         * functions to determine the color of Bars
         * (fillStyle of this.pvBar)
         */
        var seriesCount = dataEngine.getSeriesSize(),
            colors = chart.colors(pv.range(seriesCount)),

            // Only relevant for stacked:
            totalsSeriesIndex = this.isOrientationHorizontal() ?
                                0 : (seriesCount - 1);

        this.DF.colorFunc = function(){
            var datum = this.datum(),
                seriesIndex = datum.elem.series.leafIndex;

            // Change the color of the totals series
            if (myself.waterfall && seriesIndex == totalsSeriesIndex) {
                return pv.Color.transparent;
            }

            var color = colors(seriesIndex),
                shouldDimColor = dataEngine.getSelectedCount() > 0 &&
                                 !datum.isSelected();

            return shouldDimColor ? pvc.toGrayScale(color) : color;
        };
    },

    /****
    *  Functions used to draw a set of horizontal rules that connect
    *  the bars that compose the waterfall
    ****/
    drawWaterfalls: function(panel) {
        var ruleData = this.ruleData;

        if (!this.stacked){
            pvc.log("Waterfall must be stacked");
            return;
        }

        this.drawWaterfallRules(
                    panel,
                    ruleData.categoryIndexes,
                    ruleData.categoryTotals,
                    2);
    },

    drawWaterfallRules: function(panel, cats, vals, offset) {
        var data = [],
            anchor = this.isOrientationVertical() ? "bottom" : "left";

        // build the dataSet as a hashmap
        var x1 = offset + this.DF.baseRulePosFunc(cats[0]);
        for(var i = 0; i < cats.length-1 ; i++)
        {
            var x2 = offset + this.DF.baseRulePosFunc(cats[i+1]);
            data.push({
                x: x1,
                y: this.DF.orthoLengthFunc(vals[i]),
                w: x2 - x1
            });
            x1 = x2;  // go to next element
        }

        this.pvWaterfallLine = panel.add(pv.Rule)
            .data(data)
            [this.anchorOrtho(anchor) ](function(d) {return d.x;})
            [anchor                   ](function(d) {return d.y;})
            [this.anchorLength(anchor)](function(d) {return d.w;})
            .strokeStyle("#c0c0c0");
    },

    /**
     * @override
     */
    createCore: function(){
        var myself = this,
            dataEngine = this.chart.dataEngine,
            options = this.chart.options;
        
        var isVertical = this.isOrientationVertical(),
            anchor = isVertical ? "bottom" : "left",
            anchorOrtho = this.anchorOrtho(anchor),
            anchorOrthoLength = this.anchorOrthoLength(anchor),
            anchorLength = this.anchorLength(anchor),
            dataSet = this.getDataSet();

        // prepare data and functions when creating (rendering) the chart.
        this.prepareDataFunctions(dataSet, isVertical);

        var maxBarSize = this.DF.maxBarSize;

        if (this.stacked){
            if (this.waterfall){
                this.drawWaterfalls(this.pvPanel);
            }
            
            // one item per visible category ->
            //  [
            //      // 1st visible category
            //      [datum1, datum2, datum3] // 1 per visible series
            this.pvBarPanel = this.pvPanel.add(pv.Layout.Stack)
                //.data()        // datums -> categories
                .layers(dataSet) // series
                // Stacked Vertical bar charts show series from
                //  top to bottom (according to the legend)
                .order(isVertical  ? "reverse"     : null)
                .orient(isVertical ? "bottom-left" : "left-bottom")
                .x(this.DF.basePositionFunc)
                .y(this.DF.orthoLengthFunc)
                [anchor](this.DF.orthoBotPos);

            this.pvBar = this.pvBarPanel.layer.add(pv.Bar)
                .data(function(seriesRow){ return seriesRow; })
                [anchorLength](maxBarSize)
                .fillStyle(this.DF.colorFunc);

        } else {   //  not this.stacked
            // define a container (panel) for each category label.
            // later the individuals bars of series will be drawn in
            // these panels.
            this.pvBarPanel = this.pvPanel.add(pv.Panel)
                                .data(dataSet)
                                [anchorOrtho      ](this.DF.catContainerBasePosFunc)
                                [anchor           ](0)
                                [anchorLength     ](this.DF.catContainerWidth)
                                // pvBarPanel[X]  = this[X]  (copy the function)
                                [anchorOrthoLength](this[anchorOrthoLength]);

            // next add the bars to the bar-containers in pvBarPanel
            this.pvBar = this.pvBarPanel.add(pv.Bar)
                .data(function(d){
                        return pvc.padArrayWithZeros(
                                dataEngine.getVisibleValuesForCategoryIndex(d));
                      })
                .fillStyle(this.DF.colorFunc)
                [anchorOrtho      ](this.DF.relBasePosFunc)
                [anchor           ](this.DF.orthoBotPos)
                [anchorOrthoLength](this.DF.orthoLengthFunc)
                [anchorLength     ](maxBarSize);
        }  // end of if (stacked)

        this.pvBar
            .datum(function(){ 
                return myself._getRenderingDatum();
            });
        
        // generate red markers if some data falls outside the panel bounds
        this.generateOverflowMarkers(anchor, this.stacked);

        if(options.secondAxis){
            // Second axis - support for line
            this.pvSecondScatterPanel = this.pvPanel.add(pv.Panel)
                .data(dataEngine.getSecondAxisIndices());

            this.pvArea = this.pvSecondScatterPanel.add(pv.Area)
                .fillStyle(null);
            
            var valueComparer = options.timeSeries ?
                                pvc.createDateComparer(
                                    pv.Format.date(options.timeSeriesFormat), 
                                    function(item){return item.category;}) :
                                null;

            // TODO: this.chart.secondAxisColor();
            var secondAxisColors = pvc.toArray(options.secondAxisColor);
            function secondAxisColorScale(){
                return secondAxisColors[this.parent.index % secondAxisColors.length];
            }

            this.pvSecondLine = this.pvArea.add(pv.Line)
                .segmented(true)
                .data(function(d){
                        return dataEngine.getObjectsForSecondAxis(d, valueComparer);
                    })
                .strokeStyle(secondAxisColorScale)
                [anchorOrtho](this.DF.secBasePosFunc)
                [anchor     ](this.DF.secOrthoLengthFunc);

            this.pvSecondDot = this.pvSecondLine.add(pv.Dot)
                .shapeSize(8)
                .lineWidth(1.5)
                .fillStyle(secondAxisColorScale);
        }

        // For labels, tooltips
        this.pvBar
            // Ends up being the default tooltip
            //  when the property ".tooltip" below evals to falsy.
            .text(this._createPropDatumTooltip());

        if(options.showTooltips){
            /*
            this.tipsySettings = {
                html: true,
                gravity: "c",
                fade: false,
                followMouse:true
            };
            */
            this.pvBar
                .localProperty("tooltip", String) // see pvc.js
                .tooltip(function(){
                    var tooltip;

                    if(options.customTooltip){
                        var datum = this.datum(),
                            v = datum.value,
                            s = datum.elem.series.rawValue,
                            c = datum.elem.category.rawValue;

                        tooltip = options.customTooltip.call(null, s, c, v, datum);
                    }
                    
                    return tooltip;
                })
                .title(function(){
                    return ''; // prevent browser tooltip
                })
                .event("mouseover", pv.Behavior.tipsy(options.tipsySettings));
        }


        if(this._shouldHandleClick()){
            this._addPropClick(this.pvBar);
        }
        
        if(options.doubleClickAction) {
            this._addPropDoubleClick(this.pvBar);
        }

        if(this.showValues){
            this.pvBarLabel = this.pvBar
                .anchor(this.valuesAnchor || 'center')
                .add(pv.Label)
                .bottom(0)
                .visible(function(d) { //no space for text otherwise
                    var v;
                    if(myself.percentageNormalized){
                        v = this.datum().percent.value;
                    } else {
                        v = parseFloat(d);
                    }
                    
                    return !isNaN(v) && Math.abs(v) >= 1;
                 })
                .text(function(d){
                    if(myself.percentageNormalized){
                        return options.valueFormat(Math.round(this.datum().percent.value));
                    }
                    return options.valueFormat(d);
                });
        }
    },

    /**
     * @override
     */
    applyExtensions: function(){

        this.base();

        if(this.pvBarLabel){
            this.extend(this.pvBarLabel, "barLabel_");
        }
         
        if (this.pvWaterfallLine){
            this.extend(this.pvWaterfallLine, "barWaterfallLine_");
        }

        // Extend bar and barPanel
        this.extend(this.pvBarPanel, "barPanel_");
        this.extend(this.pvBar, "bar_");

        // Extend secondAxis
        if(this.pvSecondLine){
            this.extend(this.pvSecondLine, "barSecondLine_");
        }

        if(this.pvSecondDot){
            this.extend(this.pvSecondDot, "barSecondDot_");
        }
    },

    /*******
    *  Function used to generate overflow and underflowmarkers.
    *  This function is only used when fixedMinX and orthoFixedMax are set
    *******/
    generateOverflowMarkers: function(anchor, stacked){
        if (stacked) {
            if ((this.chart.options.orthoFixedMin != null) ||
                (this.chart.options.orthoFixedMax != null)){
                pvc.log("WARNING: overflow markers not implemented for Stacked graph yet");
            }
            return;
        }

        var myself = this;
        if  (this.chart.options.orthoFixedMin != null){
            // CvK: adding markers for datapoints that are off-axis
            //  UNDERFLOW  =  datavalues < orthoFixedMin
            this.doGenOverflMarks(anchor, true, this.DF.maxBarSize,
                0, this.DF.barScale,
                function(d){
                    var res = myself.chart.dataEngine
                    .getVisibleValuesForCategoryIndex(d);
                    // check for off-grid values (and replace by null)
                    var fixedMin = myself.chart.options.orthoFixedMin;
                    for(var i=0; i<res.length; i++)
                        res[i] = (res[i] < fixedMin) ? fixedMin : null;
                    return res;
                });
        }

        if (this.chart.options.orthoFixedMax != null){
            // CvK: overflow markers: max > orthoFixedMax
            this.doGenOverflMarks(anchor, false, this.DF.maxBarSize,
                Math.PI, this.DF.barScale,
                function(d){
                    var res = myself.chart.dataEngine
                    .getVisibleValuesForCategoryIndex(d);
                    // check for off-grid values (and replace by null)
                    var fixedMax = myself.chart.options.orthoFixedMax;
                    for(var i=0; i<res.length; i++)
                        res[i] = (res[i] > fixedMax) ? fixedMax : null;
                    return res;
                });
        }
    },

    // helper routine used for both underflow and overflow marks
    doGenOverflMarks: function(anchor, underflow, maxBarSize, angle, barScale, dataFunction){
        var myself = this;
        var offGridBarOffset = maxBarSize/2,
            lScale = this.chart.getLinearScale({bypassAxisSize: true});

        var offGridBorderOffset = underflow
                                    ? lScale.min + 8
                                    : lScale.max - 8;

        if (this.orientation != "vertical"){
            angle += Math.PI/2.0;
        }

        this.overflowMarkers = this.pvBarPanel.add(pv.Dot)
            .shape("triangle")
            .shapeSize(10)
            .shapeAngle(angle)
            .lineWidth(1.5)
            .strokeStyle("red")
            .fillStyle("white")
            .data(dataFunction)
            [this.anchorOrtho(anchor)](function(d){
                var res = barScale(myself.chart.dataEngine
                    .getVisibleSeriesIndexes()[this.index])
                    + offGridBarOffset;
                return res;
            })
            [anchor](function(d){
                // draw the markers at a fixed position (null values are
                // shown off-grid (-1000)
                return (d != null) ? offGridBorderOffset: -10000;
            }) ;
    },

    /**
     * Renders this.pvBarPanel - the parent of the marks that are affected by selection changes.
     * @override
     */
    _renderSignums: function(){
        this.pvBarPanel.render();
    },

    /**
     * Returns an array of marks whose instances are associated to a datum, or null.
     * @override
     */
    _getSignums: function(){
        return [this.pvBar];
    }
});
/**
 * Bullet chart generation
 */
pvc.BulletChart = pvc.BaseChart.extend({

  bulletChartPanel : null,
  allowNoData: true,

  constructor: function(options){

    this.base(options);

    // Apply options
    pvc.mergeDefaults(this.options, pvc.BulletChart.defaultOptions, options);
  },

  preRender: function(){

    this.base();

    pvc.log("Prerendering in bulletChart");


    this.bulletChartPanel = new pvc.BulletChartPanel(this, {
      showValues: this.options.showValues,
      showTooltips: this.options.showTooltips,
      orientation: this.options.orientation
    });

    this.bulletChartPanel.appendTo(this.basePanel); // Add it
  }
}, {
  defaultOptions: {
      showValues: true,
      orientation: "horizontal",
      showTooltips: true,
      legend: false,

      bulletSize:     30,  // Bullet size
      bulletSpacing:  50,  // Spacing between bullets
      bulletMargin:  100,  // Left margin

      // Defaults
      bulletMarkers:  null,     // Array of markers to appear
      bulletMeasures: null,     // Array of measures
      bulletRanges:   null,     // Ranges
      bulletTitle:    "Bullet", // Title
      bulletSubtitle: "",       // Subtitle
      bulletTitlePosition: "left", // Position of bullet title relative to bullet



      axisDoubleClickAction: null,
      
      crosstabMode: true,
      seriesInRows: true,

      tipsySettings: {
        gravity: "s",
        fade: true
      }
    }
});



/*
 * Bullet chart panel. Generates a bar chart. Specific options are:
 * <i>orientation</i> - horizontal or vertical. Default: vertical
 * <i>showValues</i> - Show or hide bar value. Default: false
 *
 * Has the following protovis extension points:
 *
 * <i>chart_</i> - for the main chart Panel
 * <i>bulletsPanel_</i> - for the bullets panel
 * <i>bulletPanel_</i> - for the bullets pv.Layout.Bullet
 * <i>bulletRange_</i> - for the bullet range
 * <i>bulletMeasure_</i> - for the bullet measure
 * <i>bulletMarker_</i> - for the marker
 * <i>bulletRule_</i> - for the axis rule
 * <i>bulletRuleLabel_</i> - for the axis rule label
 * <i>bulletTitle_</i> - for the bullet title
 * <i>bulletSubtitle_</i> - for the main bar label
 */


pvc.BulletChartPanel = pvc.BasePanel.extend({

  _parent: null,
  pvBullets: null,
  pvBullet: null,
  data: null,
  onSelectionChange: null,
  showTooltips: true,
  showValues: true,
  tipsySettings: {
    gravity: "s",
    fade: true
  },

//  constructor: function(chart, options){
//    this.base(chart,options);
//  },

  create: function(){

    var myself  = this;

    this.consumeFreeClientSize();
    
    var data = this.buildData();

    this.base();
    
    var anchor = myself.chart.options.orientation=="horizontal"?"left":"bottom";
    var size, angle, align, titleLeftOffset, titleTopOffset, ruleAnchor, leftPos, topPos, titleSpace;
    
    if(myself.chart.options.orientation=="horizontal"){
      size = this.width - this.chart.options.bulletMargin - 20;
      angle=0;
      switch (myself.chart.options.bulletTitlePosition) {
        case 'top':
          leftPos = this.chart.options.bulletMargin;
          titleLeftOffset = 0;
          align = 'left';
          titleTopOffset = -12;
          titleSpace = parseInt(myself.chart.options.titleSize/2);
          break;
        case 'bottom':
          leftPos = this.chart.options.bulletMargin;
          titleLeftOffset = 0;
          align = 'left';
          titleTopOffset = myself.chart.options.bulletSize + 32;
          titleSpace = 0;
          break;
        case 'right':
          leftPos = 5;
          titleLeftOffset = size + 5;
          align = 'left';
          titleTopOffset = parseInt(myself.chart.options.bulletSize/2);
          titleSpace = 0;
          break;
        case 'left':
        default:
          leftPos = this.chart.options.bulletMargin;
          titleLeftOffset = 0;
          titleTopOffset = parseInt(myself.chart.options.bulletSize/2);
          align = 'right';
          titleSpace = 0;
      }
      ruleAnchor = "bottom";
      topPos = function(){
        //TODO: 10
        return (this.index * (myself.chart.options.bulletSize + myself.chart.options.bulletSpacing)) + titleSpace;
      };
    }
    else
    {
      size = this.height - this.chart.options.bulletMargin - 20;
      switch (myself.chart.options.bulletTitlePosition) {
        case 'top':
          leftPos = this.chart.options.bulletMargin;
          titleLeftOffset = 0;
          align = 'left';
          titleTopOffset = -20;
          angle = 0;
          topPos = undefined;
          break;
        case 'bottom':
          leftPos = this.chart.options.bulletMargin;
          titleLeftOffset = 0;
          align = 'left';
          titleTopOffset = size + 20;
          angle = 0;
          topPos = 20;
          break;
        case 'right':
          leftPos = 5;
          titleLeftOffset = this.chart.options.bulletSize + 40;
          align = 'left';
          titleTopOffset = size;
          angle = -Math.PI/2;
          topPos = undefined;
          break;
        case 'left':
        default:
          leftPos = this.chart.options.bulletMargin;
          titleLeftOffset = -12;
          titleTopOffset = this.height - this.chart.options.bulletMargin - 20;
          align = 'left';
          angle = -Math.PI/2;
          topPos = undefined;
      }
      ruleAnchor = "right";
      leftPos = function(){
        return myself.chart.options.bulletMargin + this.index * (myself.chart.options.bulletSize + myself.chart.options.bulletSpacing);
      };

    }

    this.pvBullets = this.pvPanel.add(pv.Panel)
    .data(data)
    [pvc.BasePanel.orthogonalLength[anchor]](size)
    [pvc.BasePanel.parallelLength[anchor]](this.chart.options.bulletSize)
    .margin(20)
    .left(leftPos)
    .top(topPos);
    

    this.pvBullet = this.pvBullets.add(pv.Layout.Bullet)
    .orient(anchor)
    .ranges(function(d){
      return d.ranges;
    })
    .measures(function(d){
      return d.measures;
    })
    .markers(function(d){
      return d.markers;
    });
    
    
    if (myself.chart.options.clickable){
      this.pvBullet
      .cursor("pointer")
      .event("click",function(d){
        var s = d.title;
        var c = d.subtitle;
        var ev = pv.event;
        return myself.chart.options.clickAction(s,c, d.measures, ev);
      });
    }
    
    

    this.pvBulletRange = this.pvBullet.range.add(pv.Bar);
    this.pvBulletMeasure = this.pvBullet.measure.add(pv.Bar)
    .text(function(d){
      return myself.chart.options.valueFormat(d);
    });


    this.pvBulletMarker = this.pvBullet.marker.add(pv.Dot)
    .shape("square")
    .fillStyle("white")
    .text(function(d){
      return myself.chart.options.valueFormat(d);
    });


    if(this.showTooltips){
      // Extend default
      this.extend(this.tipsySettings,"tooltip_");
      this.pvBulletMeasure.event("mouseover", pv.Behavior.tipsy(this.tipsySettings));
      this.pvBulletMarker.event("mouseover", pv.Behavior.tipsy(this.tipsySettings));
    }

    this.pvBulletRule = this.pvBullet.tick.add(pv.Rule);

    this.pvBulletRuleLabel = this.pvBulletRule.anchor(ruleAnchor).add(pv.Label)
    .text(this.pvBullet.x.tickFormat);

    this.pvBulletTitle = this.pvBullet.anchor(anchor).add(pv.Label)
    .font("bold 12px sans-serif")
    .textAngle(angle)
    .left(-10)
    .textAlign(align)
    .textBaseline("bottom")
    .left(titleLeftOffset)
    .top(titleTopOffset)
    .text(function(d){
      return d.formattedTitle;
    });

    this.pvBulletSubtitle = this.pvBullet.anchor(anchor).add(pv.Label)
    .textStyle("#666")
    .textAngle(angle)
    .textAlign(align)
    .textBaseline("top")
    .left(titleLeftOffset)
    .top(titleTopOffset)
    .text(function(d){
      return d.formattedSubtitle;
    });

    var doubleClickAction = (typeof(myself.chart.options.axisDoubleClickAction) == 'function') ?
    function(d, e) {
            //ignoreClicks = 2;
            myself.chart.options.axisDoubleClickAction(d, e);

    }: null;
    
    if (doubleClickAction) {
    	this.pvBulletTitle.events('all')  //labels don't have events by default
            .event("dblclick", function(d){
                    doubleClickAction(d, arguments[arguments.length-1]);
                });

    	this.pvBulletSubtitle.events('all')  //labels don't have events by default
            .event("dblclick", function(d){
                    doubleClickAction(d, arguments[arguments.length-1]);
                });

    }

    // Extension points
    this.extend(this.pvBullets,"bulletsPanel_");
    this.extend(this.pvBullet,"bulletPanel_");
    this.extend(this.pvBulletRange,"bulletRange_");
    this.extend(this.pvBulletMeasure,"bulletMeasure_");
    this.extend(this.pvBulletMarker,"bulletMarker_");
    this.extend(this.pvBulletRule,"bulletRule_");
    this.extend(this.pvBulletRuleLabel,"bulletRuleLabel_");
    this.extend(this.pvBulletTitle,"bulletTitle_");
    this.extend(this.pvBulletSubtitle,"bulletSubtitle_");

    // Extend body
    this.extend(this.pvPanel,"chart_");
  },

  /*
   * Data array to back up bullet charts; Case 1:
   *
   * <i>1) No data is passed</i> - In this case, we'll grab all the value from the options
   * and generate only one bullet
   *
   */

  buildData: function(){

    pvc.log("In buildData: " + this.chart.dataEngine.getInfo() );

    var defaultData = {
      title:     this.chart.options.bulletTitle,
      subtitle:  this.chart.options.bulletSubtitle,
      ranges:    this.chart.options.bulletRanges   || [],
      measures:  this.chart.options.bulletMeasures || [],
      markers:   this.chart.options.bulletMarkers  || []
    };
    
    var data = [],
        options = this.chart.options,
        getSeriesLabel   = options.getSeriesLabel || pv.identity,
        getCategoryLabel = options.getCategoryLabel || pv.identity;

    if(this.chart.dataEngine.getSeriesSize() == 0 ) {
      // No data
      data.push($.extend({}, defaultData));
    }
    else {
      // We have data. Iterate through the series.
      var indices = this.chart.dataEngine.getVisibleSeriesIndexes();
      for(var i in indices) if (indices.hasOwnProperty(i))
      {
        var s = this.chart.dataEngine.getSerieByIndex(i);
        var v = this.chart.dataEngine.getVisibleValuesForSeriesIndex(i);
        var d = $.extend({},defaultData);

        switch(v.length){
          case 0:
            // Value only
            d.measures = [s];
            break;

          case 2:
            // Name, value and markers
            d.markers = [v[1]];
            // NO break!
          case 1:
            // name and value
            d.title = s;
            d.formattedTitle = getCategoryLabel(s);
            d.measures = [v[0]];
            break;

          default:
            // greater or equal 4
            d.title = s;
            d.subtitle = v[0];
            d.formattedTitle = getCategoryLabel(s);
            d.formattedSubtitle = getSeriesLabel(v[0])
            d.measures = [v[1]];
            d.markers = [v[2]];
            if (v.length >= 3){
              d.ranges = v.slice(3);
            }
        }
        data.push(d);
      }
    }
   
    return data;
  }
});

/**
 * Parallel coordinates offer a way to visualize data and make (sub-)selections
 * on this dataset.
 * This code has been based on a protovis example:
 *    http://vis.stanford.edu/protovis/ex/cars.html
 */
pvc.ParallelCoordinates = pvc.BaseChart.extend({

  parCoordPanel : null,
  legendSource: 'category',

  tipsySettings: {
    gravity: "s",
    fade: true
  },

  constructor: function(options){

    this.base(options);

    // Apply options
    pvc.mergeDefaults(this.options, pvc.ParallelCoordinates.defaultOptions, options);
  },

  preRender: function(){

    this.base();

    pvc.log("Prerendering in parallelCoordinates");

    this.parCoordPanel = new pvc.ParCoordPanel(this, {
      topRuleOffset : this.options.topRuleOffset,
      botRuleOffset : this.options.botRuleOffset,
      leftRuleOffset : this.options.leftRuleOffset,
      rightRuleOffset : this.options.rightRuleOffset,
      sortCategorical : this.options.sortCategorical,
      mapAllDimensions : this.options.mapAllDimensions,
      numDigits : this.options.numDigits
    });

    this.parCoordPanel.appendTo(this.basePanel); // Add it
  }
}, {
    defaultOptions: {
      topRuleOffset: 30,
      botRuleOffset: 30,
      leftRuleOffset: 60,
      rightRuleOffset: 60,
	// sort the categorical (non-numerical dimensions)
      sortCategorical: true,
	// map numerical dimension too (uniform (possible non-linear)
	// distribution of the observed values)
      mapAllDimensions: true,
	// number of digits after decimal point.
      numDigits: 0
    }
});


/*
 * ParCoord chart panel. Generates a serie of Parallel Coordinate axis 
 * and allows you too make selections on these parallel coordinates.
 * The selection will be stored in java-script variables and can be
 * used as part of a where-clause in a parameterized SQL statement.
 * Specific options are:
 *   << to be filled in >>

 * Has the following protovis extension points:
 *
 * <i>chart_</i> - for the main chart Panel
 * <i>parCoord_</i> - for the parallel coordinates
 *    << to be completed >>
 */


pvc.ParCoordPanel = pvc.BasePanel.extend({

  pvParCoord: null,

  dimensions: null, 
  dimensionDescr: null,

  data: null,

  constructor: function(chart, options){

    this.base(chart,options);

  },

    /*****
     * retrieve the data from database and transform it to maps.
     *    - this.dimensions: all dimensions
     *    - this.dimensionDescr: description of dimensions
     *    - this.data: array with hashmap per data-point
     *****/
  retrieveData: function () {
    var de = this.chart.dataEngine;
    var numDigit = this.chart.options.numDigits;

    this.dimensions = de.getVisibleCategories();
    var values = de.getValues();

    var dataRowIndex = de.getVisibleSeriesIndexes();
    var pCoordIndex = de.getVisibleCategoriesIndexes();

    var pCoordKeys = de.getCategories();

    /******
     *  Generate a Coordinate mapping. 
     *  This mapping is required for categorical dimensions and
     *  optional for the numerical dimensions (in 4 steps)
     ********/
    // 1: generate an array of coorMapping-functions
    // BEWARE: Only the first row (index 0) is used to test whether 
    // a dimension is categorical or numerical!
    var pCoordMapping = (this.chart.options.mapAllDimensions) ?
      pCoordIndex.map( function(d) {return (isNaN(values[d][0])) ? 
              {categorical: true, len: 0, map: [] } : 
                             {categorical: false, len: 0,
                                 map: [], displayValue: [] }; })
    : pCoordIndex.map( function(d) {return (isNaN(values[d][0])) ? 
              {categorical: true, len: 0, map: [] } : 
              null; }) ;
  
      // 2: and generate a helper-function to update the mapping
      //  For non-categorical value the original-value is store in displayValue
    var coordMapUpdate = function(i, val) {
      var cMap = pCoordMapping[i];
      var k = null; // define in outer scope.
      if (cMap.categorical == false) {
        var keyVal = val.toFixed(numDigit);   // force the number to be a string
        k = cMap.map[keyVal];
        if (k == null) {
          k = cMap.len;
          cMap.len++;
          cMap.map[keyVal] = k;
          cMap.displayValue[keyVal] = val;
        }
      } else {
        k = cMap.map[val];
        if (k == null) {
          k = cMap.len;
          cMap.len++;
          cMap.map[val] = k;
        }
      }
      return k;
    };

    // 3. determine the value to be displayed
    //   for the categorical dimensions map == displayValue
    for(var d in pCoordMapping){
        if (pCoordMapping.hasOwnProperty(d) && 
            pCoordMapping[d] && 
            pCoordMapping[d].categorical) {
            pCoordMapping[d].displayValue = pCoordMapping[d].map
        }
    }
    
    // 4. apply the sorting of the dimension
    if (   this.chart.options.sortCategorical
        || this.chart.options.mapAllDimensions) {
      // prefill the coordMapping in order to get it in sorted order.
      // sorting is required if all dimensions are mapped!!
      for (var i=0; i<pCoordMapping.length; i++) {
         if (pCoordMapping[i]) {
           // add all data
           for (var col=0; col<values[i].length; col++)
               coordMapUpdate(i, values[i][col]);
           // create a sorted array
           var cMap = pCoordMapping[i].map;
           var sorted = [];
           for(var item in cMap){
                if(cMap.hasOwnProperty(item)){
                    sorted.push(item);
                }
           }
           sorted.sort();
           // and assign a new index to all items
           if (pCoordMapping[i].categorical)
             for(var k=0; k<sorted.length; k++)
               cMap[sorted[k]] = k;
           else
             for(var k=0; k<sorted.length; k++)
               cMap[sorted[k]].index = k;
         }      
      }
    }

    /*************
    *  Generate the full dataset (using the coordinate mapping).
    *  (in 2 steps)
    ******/
    //   1. generate helper-function to transform a data-row to a hashMap
    //   (key-value pairs). 
    //   closure uses pCoordKeys and values
    var generateHashMap = function(col) {
      var record = {};
      for(var i in pCoordIndex) {
          if(pCoordIndex.hasOwnProperty(i)){
                record[pCoordKeys[i]] = (pCoordMapping[i]) ?
                    coordMapUpdate(i, values[i][col]) :
                    values[i][col];
          }
      }
      return record;
    };
    // 2. generate array with a hashmap per data-point
    this.data = dataRowIndex.map(function(col) { return generateHashMap (col)});

    
    /*************
    *  Generate an array of descriptors for the dimensions (in 3 steps).
    ******/
    // 1. find the dimensions
    var descrVals = this.dimensions.map(function(cat)
           {
             var item = {};
             // the part after "__" is assumed to be the units
             var elements = cat.split("__");
             item.id = cat;
             item.name = elements[0];
             item.unit = (elements.length >1)? elements[1] : "";
             return item;
           });

    // 2. compute the min, max and step(-size) per dimension)
    for(var i=0; i<descrVals.length; i++) {
      var item = descrVals[i];
      var index = pCoordIndex[i];
	// orgRowIndex is the index in the original dataset
	// some indices might be (non-existent/invisible)
      item.orgRowIndex = index;

      // determine min, max and estimate step-size
      var len = values[index].length;
      var theMin, theMax, theMin2, theMax2;

      // two version of the same code (one with mapping and one without)
      if (pCoordMapping[index]) {
        theMin = theMax = theMin2 = theMax2 =
               pCoordMapping[index].displayValue[ values[index][0] ] ;

        for(var k=1; k<len; k++) {
          var v = pCoordMapping[index].displayValue[ values[index][k] ] ;
          if (v < theMin)
          {
            theMin2 = theMin;
            theMin = v;
          }
          if (v > theMax) {
            theMax2 = theMax;
            theMax = v;
          }
        }
      } else {  // no coordinate mapping applied
        theMin = theMax = theMin2 = theMax2 = values[index][0];

        for(var k=1; k<len; k++) {
          var v = values[index][k];
          if (v < theMin)
          {
            theMin2 = theMin;
            theMin = v;
          }
          if (v > theMax) {
            theMax2 = theMax;
            theMax = v;
          }
        }
      }   // end else:  coordinate mapping applied

      var theStep = ((theMax - theMax2) + (theMin2-theMin))/2;
      item.min = theMin;
      item.max = theMax;
      item.step = theStep;

      // 3. and include the mapping (and reverse mapping) 
      item.categorical = false; 
      if (pCoordMapping[index]) {
        item.map = pCoordMapping[index].map;
        item.mapLength = pCoordMapping[index].len;
        item.categorical = pCoordMapping[index].categorical; 

        // create the reverse-mapping from key to original value
        if (item.categorical == false) {
          item.orgValue = [];
          var theMap =  pCoordMapping[index].map;
          for (key in theMap){
              if(theMap.hasOwnProperty(key)){
                item.orgValue[ theMap[key] ] = 0.0+key;
              }
          }
        }
      }
    }

    // generate a object using the given set of keys and values
    //  (map from keys[i] to vals[i])
    var genKeyVal = function (keys, vals) {
       var record = {};
      for (var i = 0; i<keys.length; i++)
         record[keys[i]] = vals[i];
      return record;
    };
    this.dimensionDescr = genKeyVal(this.dimensions, descrVals);
  },

  create: function(){

    var myself = this;
    
    this.consumeFreeClientSize();

    this.base();

    this.retrieveData();

    // used in the different closures
    var height = this.height,
    numDigits = this.chart.options.numDigits,
    topRuleOffs = this.chart.options.topRuleOffset,
    botRuleOffs = this.chart.options.botRuleOffset,
    leftRuleOffs = this.chart.options.leftRuleOffset,
    rightRulePos = this.width - this.chart.options.rightRuleOffset,
    topRulePos = this.height- topRuleOffs,
    ruleHeight = topRulePos - botRuleOffs,
    labelTopOffs = topRuleOffs - 12,
      // use dims to get the elements of dimDescr in the appropriate order!!
    dims = this.dimensions,
    dimDescr = this.dimensionDescr;

    /*****
     *   Generate the scales x, y and color
     *******/
    // getDimSc is the basis for getDimensionScale and getDimColorScale
    var getDimSc = function(t, addMargin) {
      var theMin = dimDescr[t].min;
      var theMax = dimDescr[t].max;
      var theStep = dimDescr[t].step;
      // add some margin at top and bottom (based on step)
      if (addMargin) {
        theMin -= theStep;
        theMax += theStep;
      }
      return pv.Scale.linear(theMin, theMax)
              .range(botRuleOffs, topRulePos);
    }; 
    var getDimensionScale = function(t) {
	var scale = getDimSc(t, true)
              .range(botRuleOffs, topRulePos);
      var dd = dimDescr[t];
      if (   dd.orgValue
          && (dd.categorical == false)) {
        // map the value to the original value
        var func = function(x) { var res = scale( dd.orgValue[x]);
                      return res; };
        // wire domain() and invert() to the original scale
        func.domain = function() { return scale.domain(); };
        func.invert = function(d) { return scale.invert(d); };
        return func;
      }
      else
        return scale;
    }; 
    var getDimColorScale = function(t) {
	var scale = getDimSc(t, false)
              .range("steelblue", "brown");
        return scale;
    }; 

    var x = pv.Scale.ordinal(dims).splitFlush(leftRuleOffs, rightRulePos);
    var y = pv.dict(dims, getDimensionScale);
    var colors = pv.dict(dims, getDimColorScale);



    /*****
     *   Generate tools for computing selections.
     *******/
    // Interaction state. 
    var filter = pv.dict(dims, function(t) {
      return {min: y[t].domain()[0], max: y[t].domain()[1]};  });
    var active = dims[0];   // choose the active dimension 

    var selectVisible = (this.chart.options.mapAllDimensions) ?
      function(d) { return dims.every(  
	    // all dimension are handled via a mapping.
            function(t) {
              var dd = dimDescr[t];
              var val = (dd.orgValue && (dd.categorical == false)) ?
                    dd.orgValue[d[t]] : d[t];
	      return (val >= filter[t].min) && (val <= filter[t].max); }
        )}
    : function(d) { return dims.every(  
            function(t) {
		// TO DO: check whether this operates correctly for
		// categorical dimensions  (when mapAllDimensions == false
		return (d[t] >= filter[t].min) && (d[t] <= filter[t].max); }
        )};
 

    /*****
     *   generateLinePattern produces a line pattern based on
     *          1. the current dataset.
     *          2. the current filter settings.
     *          3. the provided colorMethod.
     *  The result is an array where each element contains at least
     *            {x1, y1, x2, y2, color}
     *  Two auxiliary fields are 
     *  Furthermore auxiliary functions are provided
     *     - genAuxData: generate the auxiliary dataset (of clean is)
     *     - drawLinePattern
     *     - colorFuncBg
     *     - colorFuncFreq
     *     - colorFuncActive
     *******/
      var auxData = null;
      var genAuxData = function() {
	  if (auxData === null) {
	      // generate a new (reusable) structure.
	      auxData = [];
	      var genNewArray = function (k, l) {
		  // generated an array with null values
		  var arr = []
		  for (var a=0; a<k; a++) {
		      var elem = []
		      for (var b=0; b<l; b++) 
			  elem.push(0);
		      arr.push(0);
		  }
		  return arr;
	      };
	      for(var i =0; i<dims.length -1; i++) {
		  var currDimLen = dimDescr[ dims[i] ].mapLength;
		  var nextDimLen = dimDescr[ dims[i+1] ].mapLength;
		  auxData.push( genNewArray(currDimLen, nextDimLen) )
	      }
	  } else {
	  // re-use the existing data-structure if it exists already
	      for (var a in auxData){
                  if(auxData.hasOwnProperty(a)){
                      for (var b in a){
                          if(a.hasOwnProperty(b)){
                              for (c=0; c<b.length; c++)
                                  b[c] = 0;
                          }
                      }
                  }
              }
	  }

      };
      var generateLinePattern = function (colFunc) {
	  // find a filtered data-set
	  var filterData = selectVisible(myself.data)

      };
      var drawLinePattern = function (panel, pattern) {
      };
      var colorFuncBg = function() {
	  return "#ddd";
      };


    /*****
     *   Draw the chart and its annotations (except dynamic content)
     *******/
    // Draw the data to the parallel dimensions 
    // (the light grey dataset is a fixed background)
    this.pvParCoord = this.pvPanel.add(pv.Panel)
      .data(myself.data)
      .visible(selectVisible)
      .add(pv.Line)
      .data(dims)
	  .left(function(t, d) { return x(t); } )
      .bottom(function(t, d) { var res = y[t] (d[t]);
			       return res; })
      .strokeStyle("#ddd")
      .lineWidth(1)
      .antialias(false);

    // Rule per dimension.
    rule = this.pvPanel.add(pv.Rule)
      .data(dims)
      .left(x)
      .top(topRuleOffs)
      .bottom(botRuleOffs);

    // Dimension label
    rule.anchor("top").add(pv.Label)
      .top(labelTopOffs)
      .font("bold 10px sans-serif")
      .text(function(d) { return dimDescr[d].name; });


    // add labels on the categorical dimension
    //  compute the array of labels
    var labels = [];
    var labelXoffs = 6,
    labelYoffs = 3;
    for(d in dimDescr) {
     if(dimDescr.hasOwnProperty(d)){
          var dim = dimDescr[d];
          if (dim.categorical) {
            var  xVal = x(dim.id) + labelXoffs;
            for (var l in dim.map){
                 if(dim.map.hasOwnProperty(l)){
                      labels[labels.length] = {
                        x:  xVal,
                        y:  y[dim.id](dim.map[l]) + labelYoffs,
                        label: l
                      };
                 }
            }
          }
      }
    }
    var dimLabels = this.pvPanel.add(pv.Panel)
      .data(labels)
      .add(pv.Label)
      .left(function(d) {return d.x})
      .bottom(function(d) { return d.y})
      .text(function(d) { return d.label})
      .textAlign("left");
    
      
    /*****
     *   Add an additional panel over the top for the dynamic content
     *    (and draw the (full) dataset)
     *******/
    // Draw the selected (changeable) data on a new panel on top
    var change = this.pvPanel.add(pv.Panel);
    var line = change.add(pv.Panel)
      .data(myself.data)
      .visible(selectVisible)
      .add(pv.Line)
      .data(dims)
      .left(function(t, d) { return x(t);})
      .bottom(function(t, d) { return y[t](d[t]); })
      .strokeStyle(function(t, d) { 
        var dd = dimDescr[active];
        var val =  (   dd.orgValue && (dd.categorical == false)) ?
          dd.orgValue[ d[active] ] :
          d[active];
        return colors[active](val);})
      .lineWidth(1);

 

    /*****
     *   Add the user-interaction (mouse-interface)
     *   and the (dynamic) labels of the selection.
     *******/

    // Updater for slider and resizer.
    function update(d) {
      var t = d.dim;
      filter[t].min = Math.max(y[t].domain()[0], y[t].invert(height - d.y - d.dy));
      filter[t].max = Math.min(y[t].domain()[1], y[t].invert(height - d.y));
      active = t;
      change.render();
      return false;
    }

    // Updater for slider and resizer.
    function selectAll(d) {
      if (d.dy < 3) {  // 
        var t = d.dim;
        filter[t].min = Math.max(y[t].domain()[0], y[t].invert(0));
        filter[t].max = Math.min(y[t].domain()[1], y[t].invert(height));
        d.y = botRuleOffs; d.dy = ruleHeight;
        active = t;
        change.render();
      }
      return false;
    }

    // Handle select and drag 
    var handle = change.add(pv.Panel)
      .data(dims.map(function(dim) { return {y:botRuleOffs, dy:ruleHeight, dim:dim}; }))
      .left(function(t) { return x(t.dim) - 30; })
      .width(60)
      .fillStyle("rgba(0,0,0,.001)")
      .cursor("crosshair")
      .event("mousedown", pv.Behavior.select())
      .event("select", update)
      .event("selectend", selectAll)
      .add(pv.Bar)
      .left(25)
      .top(function(d) {return d.y;})
      .width(10)
      .height(function(d) { return d.dy;})
      .fillStyle(function(t) { return  (t.dim == active)
        ? colors[t.dim]((filter[t.dim].max + filter[t.dim].min) / 2)
        : "hsla(0,0,50%,.5)"})
      .strokeStyle("white")
      .cursor("move")
      .event("mousedown", pv.Behavior.drag())
      .event("dragstart", update)
      .event("drag", update);

    handle.anchor("bottom").add(pv.Label)
      .textBaseline("top")
      .text(function(d) { return (dimDescr[d.dim].categorical) ?
                   "" :
                   filter[d.dim].min.toFixed(numDigits) + dimDescr[d.dim].unit;
                 });

    handle.anchor("top").add(pv.Label)
      .textBaseline("bottom")
      .text(function(d) {return (dimDescr[d.dim].categorical) ?
                  "" :
                  filter[d.dim].max.toFixed(numDigits) + dimDescr[d.dim].unit});


    /*****
     *  add the extension points
     *******/

    // Extend ParallelCoordinates
    this.extend(this.pvParCoord,"parCoord_");
    // the parCoord panel is the base-panel (not the colored dynamic overlay)

    // Extend body
    this.extend(this.pvPanel,"chart_");
  }
});
/**
 * DataTree visualises a data-tree (also called driver tree).
 * It uses a data-sources to obtain the definition of data tree.
 * Each node of the tree can have it's own datasource to visualize the
 * node. 
 */
pvc.DataTree = pvc.BaseChart.extend({

    // the structure of the dataTree is provided by a separate datasource
    structEngine:   null,
    structMetadata: null,
    structDataset:  null,

    DataTreePanel : null,
    legendSource: 'category',

    constructor: function(options){

        this.base(options);

        // Apply options
        pvc.mergeDefaults(this.options, pvc.DataTree.defaultOptions, options);

        // Create DataEngine
        this.structEngine = new pvc.DataEngine(this);
    },

    setStructData: function(data){
        this.structDataset = data.resultset;
        if (this.structDataset.length == 0){
            pvc.log("Warning: Structure-dataset is empty")
        }

        this.structMetadata = data.metadata;
        if (this.structMetadata.length == 0){
            pvc.log("Warning: Structure-Metadata is empty")
        }
    },
  
    preRender: function(){

        this.base();

        pvc.log("Prerendering a data-tree");

        // Getting structure-data engine and initialize the translator
        this.structEngine.setData(this.structMetadata,this.structDataset);
        this.structEngine.setCrosstabMode(true);
        this.structEngine.setSeriesInRows(true);
        this.structEngine.createTranslator();
    
        pvc.log(this.structEngine.getInfo());

        this.dataTreePanel = new pvc.DataTreePanel(this, {
            topRuleOffset : this.options.topRuleOffset,
            botRuleOffset : this.options.botRuleOffset,
            leftRuleOffset : this.options.leftRuleOffset,
            rightRuleOffset : this.options.rightRuleOffset,
            boxplotColor:  this.options.boxplotColor,
            valueFontsize: this.options.valueFontsize,
            headerFontsize: this.options.headerFontsize,
            border: this.options.border,
            perpConnector: this.options.perpConnector,
            numDigits: this.options.numDigits,
            minVerticalSpace: this.options.minVerticalSpace,
            connectorSpace: this.options.connectorSpace,
            minAspectRatio: this.options.minAspectRatio
        });

        this.dataTreePanel.appendTo(this.basePanel); // Add it
    }
}, {
    defaultOptions: {
        // margins around the full tree
        topRuleOffset: 30,
        botRuleOffset: 30,
        leftRuleOffset: 60,
        rightRuleOffset: 60,
        // box related parameters
        boxplotColor: "grey",
        headerFontsize: 16,
        valueFontsize: 20,
        border:  2,     // bordersize in pixels
        // use perpendicular connector lines  between boxes.
        perpConnector: false,
        // number of digits (after dot for labels)
        numDigits: 0,
        // the space for the connectors is 15% of the width of a grid cell
        connectorSpace: 0.15,
        // the vertical space between gridcells is at least 5%
        minVerticalSpace: 0.05,
        // aspect ratio = width/height  (used to limit AR of the boxes)
        minAspectRatio: 2.0,

        selectParam: undefined
    }
});


/*
 * DataTree chart panel. 
 *   << to be filled out >>
 *
 * Has the following protovis extension points:
 *
 * <i>chart_</i> - for the main chart Panel
 *    << to be filled out >>
 */
pvc.DataTreePanel = pvc.BasePanel.extend({

  pvDataTree: null,

  treeElements: null, 

  structMap: null,
  structArr: null,

  hRules: null,
  vRules: null,
  rules: null,

//  constructor: function(chart, options){
//    this.base(chart,options);
//  },

  // generating Perpendicular connectors 
  // (only using horizontal and vertical rules)
  // leftLength gives the distance from the left box to the
  // splitting point of the connector
  generatePerpConnectors: function(leftLength) {

    this.hRules = [];
    this.vRules = [];
    this.rules  = [];  // also initialize this rule-set

    for(var e in this.structMap) {
      var elem = this.structMap[e];
      if (elem.children != null) {
        var min = +10000, max = -10000;
        var theLeft = elem.left + elem.width;
        this.hRules.push({"left": theLeft,
                    "width": leftLength,
                    "bottom": elem.bottom + elem.height/2});
        theLeft += leftLength;
        for(var i in elem.children) {
          var child = this.structMap[ elem.children[i] ];
          var theBottom = child.bottom + child.height/2;
          if (theBottom > max) max = theBottom;
          if (theBottom < min) min = theBottom;
          this.hRules.push({"left": theLeft,
                      "width": child.left - theLeft,
                      "bottom": theBottom});
        }

        // a vertical rule is only added when needed
        if (max > min)
          this.vRules.push({"left": theLeft,
                      "bottom": min,
                      "height": max - min})
      }
    }
  },

  // generate a line segment and add it to rules
  generateLineSegment: function(x1, y1, x2, y2) {
    var line = [];
    line.push({"x":  x1,
               "y":  y1});
    line.push({"x":  x2,
               "y":  y2});
    this.rules.push(line);
  },

  // leftLength gives the distance from the left box to the
  // splitting point of the connector
  generateConnectors: function(leftLength) {

    this.hRules = [];
    this.vRules = [];

    if (this.chart.options.perpConnector) {
      this.generatePerpConnectors(leftLength);
      return;
    }

    // this time were using diagonal rules
    this.rules = [];

    for(var e in this.structMap) {
      var elem = this.structMap[e];
      if (elem.children != null) {

        // compute the mid-point
        var min = +10000, max = -10000;
        for(var i in elem.children) {
          var child = this.structMap[ elem.children[i] ];
          var theCenter = child.bottom + child.height/2;
          if (theCenter > max) max = theCenter;
          if (theCenter < min) min = theCenter;
        }
        var mid = (max + min)/2

        var theLeft1 = elem.left + elem.width;
        var theLeft2 = theLeft1 + leftLength;

        // outbound line of the left-hand box
        this.generateLineSegment(theLeft1, elem.bottom + elem.height/2,
                                theLeft2, mid);

        // incoming lines of the right-hand boxes
        for(var i in elem.children) {
          var child = this.structMap[ elem.children[i] ];
          var theCenter = child.bottom + child.height/2;

          this.generateLineSegment(theLeft2, mid,
                                   child.left, theCenter);
        }
      }
    }
  },

  retrieveStructure: function () {
    var de = this.chart.structEngine;
    var options = this.chart.options;

    var colLabels = de.getVisibleCategories();
    this.treeElements = de.getVisibleSeries();
    var values = de.getValues();

    // if a fifth column is added, then
    //  bottom and height are provided in the dataset.
    var bottomHeightSpecified = (colLabels.length > 4);

    // trim al element labels (to allow for matching without spaces)
    for(var e in this.treeElements) 
      this.treeElements[e] = $.trim(this.treeElements[e]);

    // get the bounds (minimal and maximum column and row indices)
    // first a bounds object with two helper-functions is introduced
    var bounds = [];
    bounds.getElement = function(label) {
      // create the element if it does not exist
      if (bounds[label] == null)
        bounds[label] = {"min": +10000, "max": -10000};
      return bounds[label];
    }
    bounds.addValue = function(label, value) {
      var bnd = bounds.getElement(label);
      if (value < bnd.min)
        bnd.min = value;
      if (value > bnd.max)
        bnd.max = value;
      return bnd;
    }
    for(var e in this.treeElements) {
      var elem = this.treeElements[e];
      var col = elem[0];
      var colnr = col.charCodeAt(0);
      var row = parseInt(elem.slice(1));
      bounds.addValue("__cols", colnr);
      bounds.addValue(col,row);
    }

    // determine parameters to find column-bounds    
    var bnds = bounds.getElement("__cols");
    var gridWidth  = this.innerWidth/(bnds.max - bnds.min + 1); // integer
    var connectorWidth = options.connectorSpace * gridWidth;
    var cellWidth = gridWidth - connectorWidth;
    var maxCellHeight = cellWidth/options.minAspectRatio;
    var colBase = bnds.min;
    delete bounds["__cols"];

    // compute additional values for each column
    for (var e in bounds) {
      var bnds = bounds[e];
      if (typeof bnds == "function")
        continue;
      var numRows = bnds.max - bnds.min + 1;

      bnds.gridHeight = this.innerHeight/numRows;
      bnds.cellHeight = bnds.gridHeight*(1.0 - options.minVerticalSpace);
      if (bnds.cellHeight > maxCellHeight)
        bnds.cellHeight = maxCellHeight;
      bnds.relBottom = (bnds.gridHeight - bnds.cellHeight)/2;
      bnds.numRows = numRows;
    };

    // generate the elements
    var whitespaceQuote = new RegExp ('[\\s\"\']+',"g"); 
    this.structMap = {};
    for(var e in this.treeElements) {
      var box = {};
      var elem = this.treeElements[e];
      box.box_id = elem;
      this.structMap[elem] = box;

      var col = elem[0];
      var colnr = col.charCodeAt(0);
      var row = parseInt(elem.slice(1));
      var bnds = bounds.getElement(col);

      box.colIndex = colnr - colBase;
      box.rowIndex = bnds.numRows - (row - bnds.min) - 1;

      box.left = this.leftOffs + box.colIndex * gridWidth;
      box.width = cellWidth;
      if (bottomHeightSpecified) {
	  box.bottom = values[4][e];
	  box.height = values[5][e];
      } else {
	  box.bottom = this.botOffs + box.rowIndex * bnds.gridHeight
	      + bnds.relBottom;
	  box.height = bnds.cellHeight;
      }
      box.label = values[0][e];
      box.selector = values[1][e];
      box.aggregation = values[2][e];
      var children = values[3][e].replace(whitespaceQuote, " ");
      
      box.children = (children == " " || children ==  "") ?
         null : children.split(" ");
    }

    this.generateConnectors((gridWidth - cellWidth)/2);

    // translate the map to an array (needed by protovis)
    this.structArr = [];
    for(var e in this.structMap) {
      var elem = this.structMap[e];
      this.structArr.push(elem);
    }
  },

  findDataValue: function(key, data) {
    for(var i=0; i < data[0].length; i++)
      if (data[0][ i ] == key)
        return data[1][ i ];

    pvc.log("Error: value with key : "+key+" not found.")
  },

  generateBoxPlots: function() {
    var options = this.chart.options;

    for(var e in this.structArr) {
      var elem = this.structArr[e];
      if (elem.values.length == 0)
        continue;

      elem.subplot = {};
      var sp = elem.subplot;

      // order the data elements from 5% bound to 95% bound
      // and determine the horizontal scale
      var dat = [];
      var margin = 15;
      var rlMargin = elem.width/6;

      // generate empty rule sets (existing sets are overwritten !)
      sp.hRules = [];
      sp.vRules = [];
      sp.marks = [];
      sp.labels = [];

      dat.push(this.findDataValue("_p5", elem.values));
      dat.push(this.findDataValue("_p25", elem.values));
      dat.push(this.findDataValue("_p50", elem.values));
      dat.push(this.findDataValue("_p75", elem.values));
      dat.push(this.findDataValue("_p95", elem.values));

      var noBox = false;

	if (typeof(dat[2]) != "undefined") {
        // switch order (assume computational artifact)
        if (dat[4] < dat[0]) {
          dat = dat.reverse();
          pvc.log(" dataset "+ elem.box_id +
	  	" repaired (_p95 was smaller than _p5)");
          }
        if (dat[4] > dat[0])
          sp.hScale = pv.Scale.linear( dat[0], dat[4]);
        else {
          noBox = true;
          // generate a fake scale centered around dat[0] (== dat[4])
          sp.hScale = pv.Scale.linear( dat[0] - 1e-10, dat[0] + 1e-10);
        }
        sp.hScale.range(elem.left + rlMargin, elem.left + elem.width - rlMargin);
        var avLabel = "" + dat[2];   // prepare the label

        for(var i=0; i< dat.length; i++) dat[i] = sp.hScale( dat[i]) 

        sp.bot = elem.bottom + elem.height / 3,
        sp.top = elem.bottom + 2 * elem.height / 3,
        sp.mid = (sp.top + sp.bot) / 2;   // 2/3 of height
        sp.textBottom = elem.bottom + margin;
        sp.textBottom = sp.bot - options.valueFontsize - 1;

        // and add the new set of rules for a box-plot.
        var lwa = 3;   // constant for "lineWidth Average"
        if (noBox) {
            sp.vRules.push({"left": dat[0],
                          "bottom": sp.bot,
                          "lWidth": lwa,
                          "height": sp.top - sp.bot});
        } else {
          sp.hRules.push({"left": dat[0],
                        "width":  dat[1] - dat[0],
                        "lWidth": 1,
                        "bottom": sp.mid});
          sp.hRules.push({"left": dat[1],
                        "width":  dat[3] - dat[1],
                        "lWidth": 1,
                        "bottom": sp.bot});
          sp.hRules.push({"left": dat[1],
                        "width":  dat[3] - dat[1],
                        "lWidth": 1,
                        "bottom": sp.top});
          sp.hRules.push({"left": dat[3],
                        "width":  dat[4] - dat[3],
                        "lWidth": 1,
                        "bottom": sp.mid});
          for(var i=0; i<dat.length; i++)
            sp.vRules.push({"left": dat[i],
                          "bottom": sp.bot,
                          "lWidth": (i == 2) ? lwa : 1,
                          "height": sp.top - sp.bot});
        }

        sp.labels.push({left: dat[2],
                      bottom: sp.textBottom,
                      text: this.labelFixedDigits(avLabel),
                      size: options.smValueFont,
                      color: options.boxplotColor});
    }
    }
  } ,

  labelFixedDigits: function(value) {
    if (typeof value == "string")
        value = parseFloat(value);

    if (typeof value == "number") {
      var nd = this.chart.options.numDigits;

      value = value.toFixed(nd);
    }

    // translate to a string again
    return "" + value;
  } ,

  addDataPoint: function(key) {
    var options = this.chart.options;

    for(var e in this.structArr) {
      var elem = this.structArr[e];

      if (elem.values.length == 0)
        continue;
      var value = this.findDataValue(key, elem.values)
      if (typeof value == "undefined")
        continue;

      var sp = elem.subplot;
      var theLeft = sp.hScale(value); 

      var theColor = "green";
      sp.marks.push( {
        left: theLeft,
        bottom: sp.mid,
        color: theColor })
      
      sp.labels.push({left: theLeft,
                      bottom: sp.textBottom,
                      text: this.labelFixedDigits(value),
                      size: options.valueFont,
                      color: theColor});
    }
  }, 

  retrieveData: function () {
    var de = this.chart.dataEngine;
    var options = this.chart.options;

    var colLabels = de.getVisibleCategories();
    var selectors = de.getVisibleSeries();
    var values = de.getValues();
    var selMap = {}
    
    // create empty datasets and selMap
    var numCols = values.length;
    for(var e in this.structArr) {
      var elem = this.structArr[e];
      elem.values = [];
      for(var i=0; i<numCols; i++) elem.values.push([]);
      selMap[ elem.selector ] = elem; 
    }

    // distribute the dataset over the elements based on the selector
    var boxNotFound = {};
    for(var i in selectors) {
      var box = selMap[ selectors[ i ] ];
      if (typeof(box) != "undefined")
        for(var j in values) box.values[j].push(values[ j ][ i ])
      else
        boxNotFound[ selectors[i] ] = true
    }

    for (var sel in boxNotFound)
        pvc.log("Could'nt find box for selector: "+ sel)

    this.generateBoxPlots();

    var whitespaceQuote = new RegExp ('[\\s\"\']+',"g");
    if(options.selectParam){
        var selPar = options.selectParam.replace(whitespaceQuote, '');
        if (   (selPar != "undefined")
            && (selPar.length > 0)
            && (typeof window[selPar] != "undefined")) {
            selPar = window[selPar]
            this.addDataPoint(selPar);
        }
    }
  } ,


  create: function(){

    this.consumeFreeClientSize();

    this.base();

    var myself  = this;

    var options = this.chart.options;
    options.smValueFontsize = Math.round(0.6 * options.valueFontsize);
    options.smValueFont = "" + options.smValueFontsize + "px sans-serif"
    options.valueFont = "" + options.valueFontsize + "px sans-serif";

    // used in the different closures
    var topRuleOffs = options.topRuleOffset,
        botRuleOffs = options.botRuleOffset,
        leftRuleOffs = options.leftRuleOffset;

    // set a few parameters which will be used during data-retrieval
    this.innerWidth = this.width - leftRuleOffs - options.rightRuleOffset;
    this.innerHeight = this.height - topRuleOffs - botRuleOffs;
    this.botOffs = botRuleOffs;
    this.leftOffs = leftRuleOffs;

    // retrieve the data and transform it to the internal representation.
    this.retrieveStructure();

    this.retrieveData();

    /*****
     *   Generate the scales x, y and color
     *******/

/*
pv.Mark.prototype.property("testAdd");
    pv.Mark.prototype.testAdd = function(x) { 
return pv.Label(x);
                      }
*/
    var topMargin = options.headerFontsize + 3;

    // draw the connectors first (rest has to drawn over the top)
    var rules = this.rules;
    for (var i = 0; i < rules.length; i++) {
      this.pvPanel.add(pv.Line)
        .data(rules[ i ])
        .left(function(d) { return d.x})
        .bottom(function(d) { return d.y})
        .lineWidth(1)
        .strokeStyle("black");
    }
    // draw the data containers with decorations
    this.pvDataTree = this.pvPanel.add(pv.Bar)
      .data(myself.structArr)
      .left(function(d) { return d.left})
      .bottom(function(d) { return d.bottom})
      .height(function(d) { return d.height})
      .width(function(d) { return d.width})
      .fillStyle("green")
//;  this.pvDataTree
    .add(pv.Bar)
//      .data(function(d) {return d; })
      .left(function(d) { return d.left + options.border})
      .bottom(function(d) { return d.bottom + options.border})
      .height(function(d) { return d.height - options.border - topMargin})
      .width(function(d) { return d.width - 2 * options.border})
      .fillStyle("white")
    .add(pv.Label)
      .text(function(d) { return d.label})
      .textAlign("center")
      .left(function (d) {return  d.left + d.width/2})
      .bottom(function(d) {return d.bottom + d.height 
                - options.headerFontsize - 5 + options.headerFontsize/5
})
      .font("" + options.headerFontsize + "px sans-serif")
      .textStyle("white")
      .fillStyle("blue");

    // add the box-plots
    for(var i=0; i<this.structArr.length; i++) {
      var box = this.structArr[i];
      this.pvPanel.add(pv.Rule)
        .data(box.subplot.hRules)
        .left(function(d) { return d.left})
        .width( function(d) { return d.width})
        .bottom( function(d) { return d.bottom})
        .lineWidth( function(d) { return d.lWidth; })
        .strokeStyle(myself.chart.options.boxplotColor);

      this.pvPanel.add(pv.Rule)
        .data(box.subplot.vRules)
        .left(function(d) { return d.left})
        .height( function(d) { return d.height})
        .bottom( function(d) { return d.bottom})
        .lineWidth( function(d) { return d.lWidth; })
        .strokeStyle(myself.chart.options.boxplotColor);

      this.pvPanel.add(pv.Dot)
        .data(box.subplot.marks)
        .left(function(d) { return d.left })
        .bottom(function(d){ return d.bottom})
        .fillStyle(function(d) {return d.color});


      this.pvPanel.add(pv.Label)
        .data(box.subplot.labels)
        .left(function(d) { return d.left })
        .bottom(function(d){ return d.bottom})
        .font(function(d) { return d.size})
        .text(function(d) { return d.text})
        .textAlign("center")
        .textStyle(function(d) {return d.color});

    }

    // add the connecting rules (perpendicular rules)
    if (options.perpConnector) {
      this.pvPanel.add(pv.Rule)
        .data(myself.vRules)
        .left(function(d) { return d.left})
        .bottom(function(d) { return d.bottom})
        .height(function(d) { return d.height})
        .strokeStyle("black");
      this.pvPanel.add(pv.Rule)
        .data(myself.hRules)
        .left(function(d) { return d.left})
        .bottom(function(d) { return d.bottom})
        .width(function(d) { return d.width})
        .strokeStyle("black");
    }

    /*****
     *   draw the data-tree
     *******/

    /*****
     *  add the extension points
     *******/

    // Extend the dataTree
    this.extend(this.pvDataTree,"dataTree_");

    // Extend body
    this.extend(this.pvPanel,"chart_");
  }
});
/**
 * BoxplotChart is the main class for generating... categorical boxplotcharts.
 * 
 * The boxplot is used to represent the distribution of data using:
 *  - a box to represent the region that contains 50% of the datapoints,
 *  - the whiskers to represent the regions that contains 95% of the datapoints, and
 *  - a center line (in the box) that represents the median of the dataset.
 * For more information on boxplots you can visit  http://en.wikipedia.org/wiki/Box_plot
 *
 * If you have an issue or suggestions regarding the ccc BoxPlot-charts
 * please contact CvK at cde@vinzi.nl
 */
pvc.BoxplotChart = pvc.CategoricalAbstract.extend({

    bpChartPanel : null,

    constructor: function(options){

        this.base(options);

        // Apply options
        pvc.mergeDefaults(this.options, pvc.BoxplotChart.defaultOptions, options);

        // This categorical chart does not support selection, yet
        this.options.selectable = false;
    },
    
    /* @override */
    createCategoricalPanel: function(){
        pvc.log("Prerendering in boxplotChart");

       this.bpChartPanel = new pvc.BoxplotChartPanel(this, {
            panelSizeRatio: this.options.panelSizeRatio,
            boxSizeRatio: this.options.boxSizeRatio,
            showValues: this.options.showValues,
            showTooltips: this.options.showTooltips,
            orientation: this.options.orientation,
	    // boxplot specific options
	    boxplotColor: this.options.boxplotColor
        });

        return this.bpChartPanel;
    }
}, {
    defaultOptions: {
        showValues:   true,
        boxplotColor: "darkgreen"  // "gray"
    }
});

/*
 * Boxplot chart panel generates the actual box-plot with a categorical base-axis.
 * for more information on the options see the documentation file.
 */
pvc.BoxplotChartPanel = pvc.CategoricalAbstractPanel.extend({

    pvBox: null,
    pvBoxLabel: null,

    boxSizeRatio: 0.5,
    boxplotColor: "grey",
    
    showValues: true,

    hRules: null,
    vRules: null,
    bars: null,

//    constructor: function(chart, options){
//        this.base(chart,options);
//    },

   /**
     * @override
     */
    createCore: function(){
        var myself = this,
            options = this.chart.options,
            dataEngine = this.chart.dataEngine;

        this.hRules = [];
        this.vRules = [];
        this.bars = [];

        var anchor = this.isOrientationVertical() ? "bottom" : "left";

        // prepare data and functions when creating (rendering) the chart.
        this.prepareDataFunctions();

        this.generateBoxPlots();

        // define a panel for each category label.
        // later the individuals bars of series will be drawn in
        // these panels.
        this.pvBoxPanel = this.pvPanel.add(pv.Panel);

        // add the box-plots to the chart
        this.pvBar = this.pvBoxPanel.add(pv.Bar)
            .data(this.bars)
            .left(function(d) { return d.left; })
            .width( function(d) { return d.width; })
            .height( function(d) { return d.height; })
            .bottom( function(d) { return d.bottom; })
            .fillStyle( function(d) { return d.fillStyle; });

        this.pvBoxPanel.add(pv.Rule)
            .data(this.hRules)
            .left(function(d) { return d.left; })
            .width( function(d) { return d.width; })
            .bottom( function(d) { return d.bottom; })
            .lineWidth( function(d) { return d.lWidth; })
            .strokeStyle(options.boxplotColor);

        this.pvBoxPanel.add(pv.Rule)
            .data(this.vRules)
            .left(function(d) { return d.left; })
            .height( function(d) { return d.height; })
            .bottom( function(d) { return d.bottom; })
            .lineWidth( function(d) { return d.lWidth; })
            .strokeStyle(options.boxplotColor);

        if(options.secondAxis){
            var timeSeries = options.timeSeries,
                parser = timeSeries ? 
                            pv.Format.date(options.timeSeriesFormat) :
                            null;

            // Second axis - support for lines
            this.pvSecondLine = this.pvPanel.add(pv.Line)
                .data(function(d){
                    return dataEngine.getObjectsForSecondAxis(d,
                        timeSeries ?
                            function(a,b){
                                return parser.parse(a.category) - parser.parse(b.category);
                            } : 
                            null);
                    })
                .strokeStyle(function(){
                    var cols = options.secondAxisColor;
                    cols = cols instanceof Array ? cols : [cols];
                    return cols[this.parent.index % cols.length];
                })
                [pvc.BasePanel.relativeAnchor[anchor]](myself.DF.secBasePosFunc)
                [anchor](myself.DF.secOrthoLengthFunc);

            this.pvSecondDot = this.pvSecondLine.add(pv.Dot)
                .shapeSize(8)
                .lineWidth(1.5)
                .fillStyle(function(){
                    var cols = options.secondAxisColor;
                    cols = cols instanceof Array ? cols : [cols];
                    return cols[this.parent.index % cols.length];
                });
        }

        // add Labels:
        this.pvBar
            .text(function(d){
                var s = dataEngine.getVisibleSeries()[this.parent.index];
                var c = dataEngine.getVisibleCategories()[this.index];
                
                return options.tooltipFormat.call(myself,s,c,d.value);
            });

        if(this.showTooltips){
            this.pvBar.
                event("mouseover", pv.Behavior.tipsy(options.tipsySettings));
        }


        if (this._shouldHandleClick()){
            this.pvBar
                .cursor("pointer")
                .event("click", function(d){
                    var s = dataEngine.getVisibleSeries()[this.parent.index];
                    var c = dataEngine.getVisibleCategories()[this.index];

                    var ev = arguments[arguments.length-1];
                    return options.clickAction(s,c, d.value, ev);
                });
        }
    },

    /**
     * @override
     */
    applyExtensions: function(){

        this.base();

        // Extend bar and barPanel
        this.extend(this.pvBoxPanel,"boxPanel_");
        this.extend(this.pvBoxPanel,"box_");
    },

    /*
     *   This function implements a number of helper functions in order
     *   to increase the readibily and extendibility of the code by:
     *    1: providing symbolic names (abstractions) to the numerous anonymous
     *        functions that need to be passed to Protovis
     *    2: by moving large parts of the local variabele (parameters
     *       and scaling functions out of the 'create' function to this
     *       prepareDataFunctions blok.
     *
     *   These helper functions (closures) are all stored in 'this.DF'
     *
     *   Overriding this 'prepareDataFunctions' allows you to implement
     *   a different ScatterScart, however, it is also possible to
     *   replace specific functions from the 'this.DF' object.
     *
     *   Currently I still use a separate chart-type for waterfall/bar plots
     *   and for box-plots.
     */
    prepareDataFunctions:  function() {
        var myself = this,
            chart = this.chart,
            options = chart.options;

        // create empty container for the functions and data
        this.DF = {};

        var lScale = chart.getLinearScale({bypassAxisSize: true});

        var l2Scale = chart.getSecondScale({bypassAxisSize: true});
        var oScale = chart.getOrdinalScale({bypassAxisSize: true});

        /*
         * fuctions to determine positions along base axis.
         */
	// find the left side of the container
        this.DF.catContainerBasePosFunc = oScale;

        this.DF.catContainerWidth = oScale.range().band;

	// find the relative position within this container

        if(options.timeSeries){
            var parser = pv.Format.date(options.timeSeriesFormat);

            this.DF.secBasePosFunc =
                function(d){
                    return tScale(parser.parse(d.category));
                };
        } else {
            this.DF.secBasePosFunc =
                function(d){
                    return oScale(d.category) + oScale.range().band/2;
                };
        }
        
        /*
         * functions to determine positions along orthogonal axis
         */
        this.DF.orthoLengthFunc = function(d){
	    return lScale(d);
        };

        this.DF.secOrthoLengthFunc = function(d){
            return myself.chart.animate(0,l2Scale(d.value));
        };
    },

    generateBoxPlots: function() {
        var de = this.chart.dataEngine;
        var categories = de.getVisibleCategories();
        //var visibleSeries = de.getVisibleSeries();
        var values = de.getValues();

        var lwa = 2;   // lineWidth of average.

        // store the index of the different values
        var median = 0,
            p25 = 1,
            p75 = 2,
            p5  = 3,
            p95 = 4;

        // boxplot covers third of width of container
        var widthBox = this.DF.catContainerWidth/3;
        
        // to do: adjust for max-width and minWidth
        var leftOffset = (this.DF.catContainerWidth - widthBox)/2;

        for(var index = 0; index < categories.length; index++) {
            // order the data elements from 5% bound to 95% bound
            // and determine the horizontal scale
            var valuesRow = values[index],
                dat = valuesRow.map(this.DF.orthoLengthFunc);

            var leftBox = this.DF.catContainerBasePosFunc(index) + leftOffset,
                rightBox = leftBox + widthBox,
                midBox = (leftBox + rightBox)/2;

            this.vRules.push({
                    "left": midBox,
                    "height": dat[p25] - dat[p5],
                    "lWidth": 1,
                    "bottom": dat[p5]
                });

            this.vRules.push({
                    "left": leftBox,
                    "height": dat[p75] - dat[p25],
                    "lWidth": 1,
                    "bottom": dat[p25]
                });

            this.vRules.push({
                    "left": rightBox,
                    "height": dat[p75] - dat[p25],
                    "lWidth": 1,
                    "bottom": dat[p25]
                });

            this.vRules.push({
                    "left": midBox,
                    "height": dat[p95] - dat[p75],
                    "lWidth": 1,
                    "bottom": dat[p75]
                });
            
            for(var i=0; i< dat.length; i++){
                this.hRules.push({
                    "left":   leftBox,
                    "bottom": dat[i],
                    "lWidth": (i == median) ? lwa : 1,
                    "width":  widthBox
                });
            }
            
            this.bars.push({
                    "value":     valuesRow[median],
                    "left":      leftBox,
                    "bottom":    dat[p25],
                    "width":     widthBox,
                    "height":    dat[p75]-dat[p25],
                    "fillStyle": "limegreen"
                  });
          }
    }
});
