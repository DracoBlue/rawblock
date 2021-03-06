if (!window.rb) {
    /**
     * rawblock main object holds classes and util properties and methods to work with rawblock
     * @namespace rb
     */
    window.rb = {};
}

(function (window, document, undefined) {
    'use strict';

    /* Begin: global vars end */
    var rb = window.rb;
    var regnameSeparator = /\{-}/g;
    var regSplit = /\s*?,\s*?|\s+?/g;
    var slice = Array.prototype.slice;

    /**
     * The jQuery or dom.js (rb.$) plugin namespace.
     * @external "jQuery.fn"
     * @see {@link http://learn.jquery.com/plugins/|jQuery Plugins}
     */

    /**
     * Reference to the internally used dom.js or jQuery instance
     * @memberof rb
     */
    rb.$ = rb.$ || window.jQuery || window.dom;

    var $ = rb.$;

    /**
     * Reference to the root element (mostly html element)
     * @memberof rb
     * @type {Element}
     */
    rb.root = document.documentElement;

    /**
     * Reference to the jQueryfied/rb.$ root element
     * @memberof rb
     * @type {jQueryfiedDOMList}
     */
    rb.$root = $(rb.root);

    /**
     * Reference to the jQueryfied/rb.$ window object
     * @memberof rb
     * @type {jQueryfiedDOMList}
     */
    rb.$win = $(window);

    /**
     * Reference to the jQueryfied//rb.$ document object
     * @memberof rb
     * @type {jQueryfiedDOMList}
     */
    rb.$doc = $(document);

    /**
     * Namespace for global template functions. Compiled JavaScript templates should be added to this hash object. (see jst grunt task).
     * @memberof rb
     */
    rb.templates = {};

    rb.statePrefix = 'is-';
    rb.utilPrefix = 'u-';
    rb.jsPrefix = '';
    rb.nameSeparator = '-';
    rb.elementSeparator = '-';
    rb.attrSel = '';

    /* End: global vars end */

    /* Begin: ID/Symbol */
    /**
     * Returns a Symbol or unique String
     * @memberof rb
     * @param {String} description ID or description of the symbol
     * @type {Function}
     * @returns {String|Symbol}
     */
    rb.Symbol = window.Symbol;
    var id = Math.round(Date.now() * Math.random());

    /**
     * Returns a unique id based on Math.random and Date.now().
     * @memberof rb
     * @returns {string}
     */
    rb.getID = function () {
        id += Math.round(Math.random() * 1000);
        return id.toString(36);
    };

    if (!rb.Symbol) {
        rb.Symbol = function (name) {
            name = name || '_';
            return name + rb.getID();
        };
    }

    /* End: ID/Symbol */

	/**
     * Creates a promise with a resolve and a reject method.
     * @returns promise {Deferred}
     */
    rb.deferred = function(){
        var tmp = {
            isResolved: false,
            isRejected: false,
            isDone: false,
        };
        var promise = new Promise(function(resolve, reject){
            tmp.resolve = function(data){
                promise.isResolved = true;
                promise.isDone = true;
                return resolve(data);
            };
            tmp.reject = function(data){
                promise.isRejected = true;
                promise.isDone = true;
                return reject(data);
            };
        });

        Object.assign(promise, tmp);

        return promise;
    };

    /**
     * A jQuery/rb.$ plugin to add or remove state classes.
     * @param state {string}
     * @param [add] {boolean}
     * @returns {jQueryfiedDOMList}
     */
    $.fn.rbChangeState = function(state, add){
        if(this.length){
            state = rb.statePrefix + (state.replace(regnameSeparator, rb.nameSeparator));
            this[add ? 'addClass' : 'removeClass'](state);
        }
        return this;
    };

    /* Begin: rbSlideUp / rbSlideDown */
    /**
     * A jQuery/rb.$ plugin to slideUp content. Difference to $.fn.slideUp: The plugin handles content hiding via height 0; visibility: hidden;
     * Also does not animate padding, margin, borders (use child elements)
     * @function external:"jQuery.fn".rbSlideUp
     * @param [options] {object} All jQuery animate options
     * @returns {jQueryfiedDOMList}
     */
    $.fn.rbSlideUp = function (options) {
        if (!options) {
            options = {};
        }

        if (this.length) {
            var opts = Object.assign({}, options, {
                always: function () {
                    this.style.display = options.display ? 'none' : '';
                    this.style.visibility = 'hidden';

                    if (options.always) {
                        return options.always.apply(this, arguments);
                    }
                }
            });

            if (opts.easing) {
                rb.addEasing(opts.easing);
            }
            this
                .stop()
                .animate({height: 0}, opts)
                .css({overflow: 'hidden', display: 'block', visibility: 'inherit'})
            ;
        }
        return this;
    };

    /**
     * A jQuery/rb.$ plugin to slideDown content. Difference to $.fn.slideDown: The plugin handles content showing also using visibility: 'inherit'
     * Also does not animate padding, margin, borders (use child elements)
     * @function external:"jQuery.fn".rbSlideDown
     * @param options {object} All jQuery animate options
     * @returns {jQueryfiedDOMList|Number}
     */
    $.fn.rbSlideDown = function (options) {
        var opts;
        var ret = this;

        if (!options) {
            options = {};
        }

        if (this.length) {
            opts = Object.assign({}, options, {
                always: function () {
                    this.style.overflow = '';
                    this.style.height = 'auto';

                    if (options.always) {
                        return options.always.apply(this, arguments);
                    }
                },
            });
        }

        this.each(function () {
            var endValue;
            var $panel = $(this);
            var startHeight = this.clientHeight + 'px';

            $panel.css({overflow: 'hidden', display: 'block', height: 'auto', visibility: 'inherit'});

            endValue = this.clientHeight;

            if(options.getHeight){
                ret = endValue;
            }

            $panel
                .css({height: startHeight})
                .animate({height: endValue}, opts)
            ;
        });

        return ret;
    };

    /* End: rbSlideUp / rbSlideDown */

    /* Begin: getScrollingElement */

    //Todo: move into polyfills
    if(!('scrollingElement' in document)){
        Object.defineProperty(document, 'scrollingElement', {
            get: ((document.compatMode == 'BackCompat' || 'WebkitAppearance' in rb.root.style) ?
                function(){
                    return  document.body || rb.root;
                } :
                function(){
                    return rb.root;
                }),
            enumerable: true,
            configurable: true,
        });
    }

    /**
     * @memberof rb
     * @deprecated use `document.scrollingElement` instead
     * @returns {Element} The DOM element that scrolls the viewport (either html or body)
     */
    rb.getScrollingElement = function () {
        return document.scrollingElement;
    };

	/**
     * Alias to `getScrollingElement` can be used to override scrollingElement for project-specific needs.
     * @type function
     * @memberof rb
     */
    rb.getPageScrollingElement = rb.getScrollingElement;

    rb.getScrollingEventObject = function(element){
        var scrollObj;

        if(!element){
            element = rb.getPageScrollingElement();
        }

        if(element.matches && element.ownerDocument && element.matches('html, body')){
            scrollObj = element.ownerDocument.defaultView;
        } else if('addEventListener' in element){
            scrollObj = element;
        } else {
            scrollObj = window;
        }
        return scrollObj;
    };
    /* End: getScrollingElement */

    /* Begin: contains */
    var _contains = function (element) {
        return element == this || element.contains(this);
    };
    /**
     * Tests whether an element is inside or equal to a list of elements.
     * @memberof rb
     * @param containerElements {Element[]|Element} Array of elements that might contain innerElement.
     * @param innerElement {Element} An element that might be inside of one of containerElements.
     * @returns {Element|undefined|null} The first element in containerElements, that contains innerElement or is the innerElement.
     */
    rb.contains = function (containerElements, innerElement) {
        return Array.isArray(containerElements) ?
            containerElements.find(_contains, innerElement) :
            _contains.call(innerElement, containerElements) ?
                containerElements :
                null
            ;
    };
    rb.contains._contains = _contains;
    /* End: contains */

    /* Begin: throttle */
    /**
     * Throttles a given function
     * @memberof rb
     * @param {function} fn - The function to be throttled.
     * @param {object} [options] - options for the throttle.
     *  @param {object} options.that=null -  the context in which fn should be called.
     *  @param {boolean} options.write=false -  wether fn is used to write layout.
     *  @param {boolean} options.read=false -  wether fn is used to read layout.
     *  @param {number} options.delay=200 -  the throttle delay.
     *  @param {boolean} options.unthrottle=false -  Wether function should be invoked directly.
     * @returns {function} the throttled function.
     */
    rb.throttle = function (fn, options) {
        var running, that, args;
        var lastTime = 0;
        var Date = window.Date;
        var _run = function () {
            running = false;
            lastTime = Date.now();
            fn.apply(that, args);
        };
        var afterAF = function () {
            rb.rIC(_run);
        };
        var getAF = function () {
            rb.rAFQueue(afterAF);
        };

        if (!options) {
            options = {};
        }

        if (!options.delay) {
            options.delay = 200;
        }

        if (options.write) {
            afterAF = _run;
        } else if (!options.read) {
            getAF = _run;
        }

        return function () {
            if (running) {
                return;
            }
            var delay = options.delay;
            running = true;

            that = options.that || this;
            args = arguments;

            if (options.unthrottle) {
                _run();
            } else {
                if (delay && !options.simple) {
                    delay -= (Date.now() - lastTime);
                }
                if (delay < 0) {
                    delay = 0;
                }
                setTimeout(getAF, delay);
            }

        };
    };
    /* End: throttle */

    /* Begin: resize */
    var iWidth, cHeight, installed;
    var docElem = rb.root;

    /**
     *
     * Resize uitility object to listen/unlisten (on/off) for throttled window.resize events.
     * @memberof rb
     * @extends jQuery.Callbacks
     * @property {object} resize
     * @property {Function} resize.on Adds the passed function to listen to the global window.resize
     * @property {Function} resize.off Removes the passed function to unlisten from the global window.resize
     */
    rb.resize = Object.assign(rb.$.Callbacks(),
        {
            _setup: function () {
                if (!installed) {
                    installed = true;
                    rb.rIC(function () {
                        iWidth = innerWidth;
                        cHeight = docElem.clientHeight;
                    });
                    window.removeEventListener('resize', this._run);
                    window.addEventListener('resize', this._run);
                }
            },
            _teardown: function () {
                if (installed && !this.has()) {
                    installed = false;
                    window.removeEventListener('resize', this._run);
                }
            },
            on: function (fn) {
                this.add(fn);
                this._setup();
            },
            off: function (fn) {
                this.remove(fn);
                this._teardown();
            },
        }
    );

    rb.resize._run = rb.throttle(function () {
        if (iWidth != innerWidth || cHeight != docElem.clientHeight) {
            iWidth = innerWidth;
            cHeight = docElem.clientHeight;

            this.fire();
        }
    }, {that: rb.resize, read: true});

    /* End: resize */

    /* Begin: getCSSNumbers */
    /**
     * Sums up all style values of an element
     * @memberof rb
     * @param element {Element}
     * @param styles {String[]} The names of the style properties (i.e. paddingTop, marginTop)
     * @param onlyPositive {Boolean} Whether only positive numbers should be considered
     * @returns {number} Total of all style values
     * @example
     * var innerWidth = rb.getCSSNumbers(domElement, ['paddingLeft', 'paddingRight', 'width'];
     */
    rb.getCSSNumbers = function (element, styles, onlyPositive) {
        var i, value;
        var numbers = 0;
        var cStyles = rb.getStyles(element);
        if (!Array.isArray(styles)) {
            styles = [styles];
        }

        for (i = 0; i < styles.length; i++) {
            value = $.css(element, styles[i], true, cStyles);

            if (!onlyPositive || value > 0) {
                numbers += value;
            }
        }

        return numbers;
    };
    /* End: getCSSNumbers */

    /* Begin: memoize */

	/**
	 * Simple memoize method
     * @param fn {function}
     * @param [justOne] {boolean}
     * @returns {Function}
     */
    rb.memoize = function(fn, justOne){
        var cache = {};
        return justOne ?
            function(argsString){
                if(argsString in cache){
                    return cache[argsString];
                }
                cache[argsString] = fn.call(this, argsString);
                return cache[argsString];
            } :
            function(){
                var args = slice.call(arguments);
                var argsString = args.join(',');
                if(argsString in cache){
                    return cache[argsString];
                }
                cache[argsString] = fn.apply(this, args);
                return cache[argsString];
            }
        ;
    };
    /* End: memoize */

    /* Begin: parseValue */
    rb.parseValue = (function () {
        var regNumber = /^\-{0,1}\+{0,1}\d+?\.{0,1}\d*?$/;
        /**
         * Parses a String into another type using JSON.parse, if this fails returns the given string
         * @alias rb#parseValue
         * @param {String} attrVal The string to be parsed
         * @returns {String} The parsed string.
         */
        var parseValue = function (attrVal) {

            if (attrVal == 'true') {
                attrVal = true;
            }
            else if (attrVal == 'false') {
                attrVal = false;
            } else if (attrVal == 'null') {
                attrVal = null;
            }
            else if (regNumber.test(attrVal)) {
                attrVal = parseFloat(attrVal);
            }
            else if ((attrVal.startsWith('{') && attrVal.endsWith('}')) || (attrVal.startsWith('[') && attrVal.endsWith(']'))) {
                try {
                    attrVal = JSON.parse(attrVal);
                } catch (e) {}
            }
            return attrVal;
        };
        return parseValue;
    })();
    /* End: parseValue */

    /* Begin: idleCallback */
    rb.rIC = window.requestIdleCallback ?
        function(fn){
            return requestIdleCallback(fn, {timeout: 99});
        } :
        function(fn){
            return setTimeout(fn);
        }
    ;
    /* End: idleCallback */

    /* Begin: rAF helpers */

    rb.rAFQueue = (function () {
        var isInProgress, inProgressStack;
        var fns1 = [];
        var fns2 = [];
        var curFns = fns1;

        var run = function () {
            inProgressStack = curFns;
            curFns = fns1.length ? fns2 : fns1;

            isInProgress = true;
            while (inProgressStack.length) {
                inProgressStack.shift()();
            }
            isInProgress = false;
        };

        /**
         * Invokes a function inside a rAF call
         * @memberof rb
         * @alias rb#rAFQueue
         * @param fn {Function} the function that should be invoked
         * @param inProgress {boolean} Whether the fn should be added to an ongoing rAF or should be appended to the next rAF.
         * @param hiddenRaf {boolean} Whether the rAF should also be used if document is hidden.
         */
        return function (fn, inProgress, hiddenRaf) {

            if (inProgress && isInProgress) {
                fn();
            } else {
                curFns.push(fn);
                if (curFns.length == 1) {
                    ((hiddenRaf || !document.hidden) ? requestAnimationFrame : setTimeout)(run);
                }
            }
        };
    })();

    /**
     * Generates and returns a new, rAFed version of the passed function, so that the passed function is always called using requestAnimationFrame. Normally all methods/functions, that mutate the DOM/CSSOM, should be wrapped using `rb.rAF` to avoid layout thrashing.
     * @memberof rb
     * @param fn {Function} The function to be rAFed
     * @param options {Object} Options object
     * @param options.that=null {Object} The context in which the function should be invoked. If nothing is passed the context of the wrapper function is used.
     * @param options.queue=false {Object} Whether the fn should be added to an ongoing rAF (i.e.: `false`) or should be queued to the next rAF (i.e.: `true`).
     * @param options.throttle=false {boolean} Whether multiple calls in one frame cycle should be throtteled to one.
     * @returns {Function}
     *
     * @example
     *  class Foo {
	 *      constructor(element){
	 *          this.element = element;
	 *          this.changeLayout = rb.rAF(this.changeLayout);
	 *      }
	 *
	 *      changeLayout(width){
	 *          this.element.classList[width > 800 ? 'add' : 'remove']('is-large');
	 *      }
	 *
	 *      measureLayout(){
	 *          this.changeLayout(this.element.offsetWidth);
	 *      }
	 *  }
     */
    rb.rAF = function (fn, options) {
        var running, args, that, inProgress;
        var batchStack = [];
        var run = function () {
            running = false;
            if (!options.throttle) {
                while (batchStack.length) {
                    args = batchStack.shift();
                    fn.apply(args[0], args[1]);
                }
            } else {
                fn.apply(that, args);
            }
        };
        var rafedFn = function () {
            args = arguments;
            that = options.that || this;
            if (!options.throttle) {
                batchStack.push([that, args]);
            }
            if (!running) {
                running = true;
                rb.rAFQueue(run, inProgress);
            }
        };

        if (!options) {
            options = {};
        }

        inProgress = !options.queue;

        if (fn._rbUnrafedFn) {
            rb.log('double rafed', fn);
        }

        rafedFn._rbUnrafedFn = fn;

        return rafedFn;
    };

    /* End: rAF helpers */

    /* Begin: rAFs helper */

    /**
     * Invokes `rb.rAF` on multiple methodnames of on object.
     *
     * @memberof rb
     *
     * @param {Object} obj
     * @param {Object} [options]
     * @param {...String} methodNames
     *
     * @example
     * rb.rAFs(this, {throttle: true}, 'renderList', 'renderCircle');
     */
    rb.rAFs = function (obj) {
        var options;
        var args = slice.call(arguments);

        args.shift();

        if (typeof args[0] == 'object') {
            options = args.shift();
        }

        args.forEach(function (fn) {
            obj[fn] = rb.rAF(obj[fn], options);
        });
    };
    /* End: rAFs helper */

    /* Begin: rbComponent */

    /**
     * A jQuery plugin that returns a component instance by using rb.getComponent.
     * @function external:"jQuery.fn".rbComponent
     * @see rb.getComponent
     * @param [name] {String} The name of the property or method.
     * @param [initialOpts] {Object}
     *
     * @returns {ComponentInstance|jQueryfiedDOMList}
     */
    $.fn.rbComponent = function (name, initialOpts) {
        var ret;
        var elem = this.get(0);

        if(elem){
            ret = rb.getComponent(elem, name, initialOpts);
        }

        return ret;
    };
    /* End: rbComponent */

    /* Begin: addEasing */
    var BezierEasing;
    var easingMap = {
        ease: '0.25, 0.1, 0.25, 1',
        linear: '0, 0, 1, 1',
        'ease-in': '0.42, 0, 1, 1',
        'ease-out': '0.00, 0.0, 0.58, 1',
        'ease-in-out': '0.42, 0, 0.58, 1',
    };
    /**
     * Generates an easing function from a CSS easing value and adds it to the rb.$.easing object. requires npm module: "bezier-easing".
     * @memberof rb
     * @param {String} easing The easing value. Expects a string with 4 numbers separated by a "," describing a cubic bezier curve.
     * @param {String} [name] Human readable name of the easing.
     * @returns {Function} Easing a function
     */
    rb.addEasing = function (easing, name) {
        var bezierArgs;
        if (typeof easing != 'string') {
            return;
        }

        if(easingMap[easing]){
            name = easing;
            easing = easingMap[easing];
        }

        BezierEasing = BezierEasing || rb.BezierEasing || window.BezierEasing;

        if (BezierEasing && !$.easing[easing] && (bezierArgs = easing.match(/([0-9\.]+)/g)) && bezierArgs.length == 4) {
            bezierArgs = bezierArgs.map(function (str) {
                return parseFloat(str);
            });

            $.easing[easing] = BezierEasing.apply(this, bezierArgs);

            if(typeof $.easing[easing] == 'object' && typeof $.easing[easing].get == 'function'){
                $.easing[easing] = $.easing[easing].get;
            }

            if(name && !$.easing[name]){
                $.easing[name] = $.easing[easing];
            }
        }

        return $.easing[easing] || $.easing.swing || $.easing.linear;
    };
    /* End: addEasing */

    /* Begin: cssSupports */
    var CSS = window.CSS;
    rb.cssSupports = CSS && CSS.supports ?
        function(){
            return CSS.supports.apply(CSS, arguments);
        } :
        function(){
            return '';
        }
    ;
    /* End: cssSupports */

    /* Begin: rb.events */

    rb.events = {
        _init: function() {
            this.proxyKey = rb.Symbol('_fnProxy');
        },
        Event: function(type, options){
            var event;
            if(!options){
                options = {};
            }

            if(options.bubbles == null){
                options.bubbles = true;
            }

            if(options.cancelable == null){
                options.cancelable = true;
            }

            event = new CustomEvent(type, options);

            if(!event.isDefaultPrevented){
                event.isDefaultPrevented = function(){
                    rb.log('deprecated');
                    return event.defaultPrevented;
                };
                event.isDefaultPrevented._deprecated = true;
            }

            return event;
        },
        dispatch: function(element, type, options){
            var event = this.Event(type, options);
            element.dispatchEvent(event);
            return event;
        },
        proxy: function(fn, type, key, proxy){
            if(!proxy){
                return fn[this.proxyKey] && fn[this.proxyKey][type] && fn[this.proxyKey][type][key];
            }
            if(!fn[this.proxyKey]){
                fn[this.proxyKey] = {};
            }
            if(!fn[this.proxyKey][type]){
                fn[this.proxyKey][type] = {};
            }
            if(!fn[this.proxyKey][type][key]){
                fn[this.proxyKey][type][key] = proxy;
            }
            if(fn != proxy){
                this.proxy(proxy, type, key, proxy);
            }
        },
        _runDelegate: function(event, target, handler, context, args){
            if(!target){return;}

            var ret;
            var oldDelegatedTarget = event.delegatedTarget;
            var oldDelegateTarget = event.delegateTarget;

            event.delegatedTarget = target;
            event.delegateTarget = target;

            ret = handler.apply(this, arguments);

            event.delegatedTarget = oldDelegatedTarget;
            event.delegateTarget = oldDelegateTarget;

            return ret;
        },
        proxies: {
            closest: function(handler, selector){
                var proxy = rb.events.proxy(handler, 'closest', selector);

                if(!proxy){
                    proxy = function(e){
                        return rb.events._runDelegate(e, e.target.closest(selector), handler, this, arguments);
                    };
                    rb.events.proxy(handler, 'closest', selector, proxy);
                }

                return proxy;
            },
            matches: function(handler, selector){
                var proxy = rb.events.proxy(handler, 'matches', selector);

                if(!proxy){
                    proxy = function(e){
                        return rb.events._runDelegate(e, e.target.matches(selector) ? e.target : null, handler, this, arguments);
                    };
                    rb.events.proxy(handler, 'matches', selector, proxy);
                }

                return proxy;
            },
            keycodes: function(handler, keycodes){
                var keycodesObj;
                var proxy = rb.events.proxy(handler, 'keycodes', keycodes);

                if(!proxy){
                    proxy = function(e){
                        if(!keycodesObj){
                            keycodesObj = keycodes.trim().split(regSplit).reduce(function(obj, value){
                                obj[value] = true;
                                return obj;
                            }, {});
                        }

                        if(keycodesObj[e.keyCode]){
                            return handler.apply(this, arguments);
                        }
                    };
                    rb.events.proxy(handler, 'keycodes', keycodes, proxy);
                }

                return proxy;
            },
            once: function(handler, once, opts, type){
                var proxy = rb.events.proxy(handler, 'conce', '');
                if(!proxy){
                    proxy = function(e){
                        var ret = handler.apply(this, arguments);
                        rb.events.remove(e && e.target || this, type, handler, opts);
                        return ret;
                    };
                    rb.events.proxy(handler, 'conce', '', proxy);
                }
                return proxy;
            },
        },
        applyProxies: function(handler, opts, type){
            var proxy;
            if(opts){
                for(proxy in opts){
                    if(this.proxies[proxy] && proxy != 'once'){
                        handler = this.proxies[proxy](handler, opts[proxy], opts, type);
                    }
                }

                if('once' in opts){
                    handler = this.proxies.once(handler, opts.once, opts, type);
                }
            }

            return handler;
        },
        special: {},
    };

    rb.events.proxies.delegate = rb.events.proxies.closest;

    [['add', 'addEventListener'], ['remove', 'removeEventListener']].forEach(function(action){
        /**
         *
         * @name rb.event.add
         *
         * @param element
         * @param type
         * @param handler
         * @param opts
         */
        /**
         *
         * @name rb.event.remove
         *
         * @param element
         * @param type
         * @param handler
         * @param opts
         */
        rb.events[action[0]] = function(element, type, handler, opts){
            if(!this.special[type] || this.special[type].applyProxies !== false){
                handler = rb.events.applyProxies(handler, opts, type);
            }
            if(this.special[type]){
                this.special[type][action[0]](element, handler, opts);
            } else {
                //todo: add passive support
                element[action[1]](type, handler, !!(opts && opts.capture));
            }
        };
    });

    rb.events._init();

    /* End: rb.events */

    /**
     * Invokes on the first element in collection the closest method and on the result the querySelector method.
     * @function external:"jQuery.fn".closestFind
     * @param {String} selectors Two selectors separated by a white space and/or comma. First is used for closest and second for querySelector. Example: `".rb-item, .item-input"`.
     * @returns {jQueryfiedObject}
     */
    $.fn.closestFind = function (selectors) {
        var sels;
        var closestSel, findSel;
        var elem = this.get(0);
        if (elem) {
            sels = selectors.split(regSplit);
            closestSel = sels.shift();
            findSel = sels.join(' ');
            elem = elem.closest(closestSel);
            if (elem) {
                elem = elem.querySelector(findSel);
            }
        }
        return $(elem || []);
    };

    /* Begin: clickarea delegate */
    var initClickArea = function(){

        var supportMouse = typeof window.MouseEvent == 'function';
        var clickAreaSel = '.' + rb.utilPrefix + 'clickarea';
        var clickAreaactionSel = '.' + rb.utilPrefix + 'clickarea' + rb.nameSeparator + 'action';
        var abortSels = 'a[href], a[href] *, button *, ' + clickAreaactionSel + ', ' + clickAreaactionSel + ' *';

        var getSelection = window.getSelection || function () {
                return {};
            };
        var regInputs = /^(?:input|select|textarea|button|a)$/i;

        document.addEventListener('click', function (e) {

            if (e.defaultPrevented || e.button == 2 || regInputs.test(e.target.nodeName || '') || e.target.matches(abortSels)) {
                return;
            }
            var event, selection;
            var item = e.target.closest(clickAreaSel);
            var link = item && item.querySelector(clickAreaactionSel);

            if (link) {
                selection = getSelection();
                if (selection.anchorNode && !selection.isCollapsed && item.contains(selection.anchorNode)) {
                    return;
                }
                if (supportMouse && link.dispatchEvent) {
                    event = new MouseEvent('click', {
                        cancelable: true,
                        bubbles: true,
                        shiftKey: e.shiftKey,
                        altKey: e.altKey,
                        ctrlKey: e.ctrlKey,
                        metaKey: e.metaKey,
                        button: e.button,
                        which: e.which,
                    });
                    link.dispatchEvent(event);
                } else if (link.click) {
                    link.click();
                }
            }
        });
    };
    /* End: clickarea delegate */

    /**
     * Sets focus to an element. Note element has to be focusable
     * @memberof rb
     * @type function
     * @param element The element that needs to get focus.
     * @param [delay] {Number} The delay to focus the element.
     */
    rb.setFocus = (function(){
        var element, attempts, abort, focusTimer;
        var scrollableElements = [];
        var regKeyboadElements = /^(?:input|textarea)$/i;
        var btns = {button: 1, submit: 1, reset: 1, image: 1, file: 1};

        var calcScrollableElements = function(){
            var parent = element.parentNode;
            while(parent){
                if(parent.offsetHeight < parent.scrollHeight || parent.offsetWidth < parent.scrollWidth){
                    scrollableElements.push([parent, parent.scrollTop, parent.scrollLeft]);
                }
                parent = parent.parentNode;
            }
            parent = document.scrollingElement;
            scrollableElements.push([parent, parent.scrollTop, parent.scrollLeft]);
        };

        var restoreScrollPosition = function(){
            var i;

            for(i = 0; i < scrollableElements.length; i++){
                scrollableElements[i][0].scrollTop = scrollableElements[i][1];
                scrollableElements[i][0].scrollLeft = scrollableElements[i][2];
            }
            scrollableElements = [];
        };

        var setAbort = function(){
            abort = true;
        };

        var cleanup = function(){
            element = null;
            attempts = 0;
            abort = false;
            document.removeEventListener('focus', setAbort, true);
            if(focusTimer){
                clearTimeout(focusTimer);
                focusTimer = null;
            }
        };

        var doFocus = function () {

            if(!element || abort || attempts > 9){
                cleanup();
            } else if(rb.getStyles(element).visibility != 'hidden' && (element.offsetHeight || element.offsetWidth)){
                rb.isScriptFocus = true;
                rb.$doc.trigger('rbscriptfocus');
                calcScrollableElements();

                if ($.prop(element, 'tabIndex') < 0 && !element.getAttribute('tabindex')) {
                    element.setAttribute('tabindex', '-1');
                    element.classList.add('js' + rb.nameSeparator + 'rb' + rb.nameSeparator + 'scriptfocus');
                }
                try {
                    element.focus();
                } catch (e){}
                restoreScrollPosition();
                rb.isScriptFocus = false;
                cleanup();
            } else {
                if(attempts == 2){
                    document.addEventListener('focus', setAbort, true);
                }
                attempts++;
                waitForFocus(150);
            }
        };

        var waitForFocus = function (delay) {
            if (element !== document.activeElement) {
                focusTimer = setTimeout(doFocus, delay || 40);
            }
        };

        return function(givenElement, delay){
            if (givenElement && givenElement !== document.activeElement && element !== givenElement) {
                cleanup();

                element = givenElement;

                if(regKeyboadElements.test(element.nodeName) && !btns[element.type]){
                    doFocus();
                } else {
                    waitForFocus(delay);
                }
            }
        };
    })();

    /* Begin: focus-within polyfill */
    var initFocusWithin = function(){
        var running = false;
        var isClass = rb.utilPrefix + 'focus' + rb.nameSeparator + 'within';
        var isClassSelector = '.' + isClass;

        var updateFocus = function () {
            var oldFocusParents, newFocusParents, i, len;

            var parent = document.activeElement;

            if(parent){
                newFocusParents = [];

                while (parent && parent.classList && !parent.classList.contains(isClass)) {
                    newFocusParents.push(parent);
                    parent = parent.parentNode;
                }

                if ((oldFocusParents = parent.querySelectorAll && parent.querySelectorAll(isClassSelector))) {
                    for (i = 0, len = oldFocusParents.length; i < len; i++) {
                        oldFocusParents[i].classList.remove(isClass);
                    }
                }
                for (i = 0, len = newFocusParents.length; i < len; i++) {
                    newFocusParents[i].classList.add(isClass);
                }

                //if((oldFocusParents && oldFocusParents.length) || newFocusParents.length){
                //    rb.rIC(function(){
                //        if(oldFocusParents){
                //            for (i = 0, len = oldFocusParents.length; i < len; i++) {
                //                rb.events.dispatch(oldFocusParents[i], 'rb_focusleave', {bubbles: false, cancelable: false});
                //            }
                //        }
                //
                //        for (i = 0, len = newFocusParents.length; i < len; i++) {
                //            rb.events.dispatch(newFocusParents[i], 'rb_focusenter', {bubbles: false, cancelable: false});
                //        }
                //    });
                //}
            }

            running = false;
        };

        var update = function () {
            if (!running) {
                running = true;
                rb.rAFQueue(updateFocus, true);
            }
        };

        document.addEventListener('focus', update, true);
        document.addEventListener('blur', update, true);
        update();
    };
    /* End: focus-within polyfill */


    /* * * Begin: keyboard-focus * * */

    var initKeyboardFocus = function(){
        var keyboardFocusElem;
        var hasKeyboardFocus = false;
        var isKeyboardBlocked = false;
        var eventOpts = {passive: true, capture: true};
        var root = rb.root;
        var isClass = rb.utilPrefix + 'keyboardfocus';
        var isWithinClass = rb.utilPrefix + 'keyboardfocus' + rb.nameSeparator + 'within';

        var unblockKeyboardFocus = function (e) {
            if(e.keyCode == 9){
                isKeyboardBlocked = false;
            }
        };

        var _removeChildFocus = function () {
            if (keyboardFocusElem && keyboardFocusElem != document.activeElement) {
                keyboardFocusElem.classList.remove(isClass);
                keyboardFocusElem = null;
            }
        };

        var removeChildFocus = function () {
            if (keyboardFocusElem) {
                rb.rAFQueue(_removeChildFocus);
            }
        };

        var _removeKeyBoardFocus = rb.rAF(function () {
            hasKeyboardFocus = false;
            _removeChildFocus();
            root.classList.remove(isWithinClass);
        }, {throttle: true});

        var removeKeyBoardFocus = function () {
            isKeyboardBlocked = true;
            if (hasKeyboardFocus) {
                _removeKeyBoardFocus();
            }
        };

        var setKeyboardFocus = rb.rAF(function () {

            if (!isKeyboardBlocked || hasKeyboardFocus) {

                if (keyboardFocusElem != document.activeElement) {
                    _removeChildFocus();

                    keyboardFocusElem = document.activeElement;

                    if (keyboardFocusElem && keyboardFocusElem.classList) {
                        keyboardFocusElem.classList.add(isClass);
                    } else {
                        keyboardFocusElem = null;
                    }
                }

                if (!hasKeyboardFocus) {
                    root.classList.add(isWithinClass);
                }
                hasKeyboardFocus = true;
            }
        }, {throttle: true});

        var pointerEvents = (window.PointerEvent) ?
                ['pointerdown', 'pointerup'] :
                ['mousedown', 'mouseup']
            ;

        root.addEventListener('blur', removeChildFocus, eventOpts);
        root.addEventListener('focus', function(){
            if(!isKeyboardBlocked || hasKeyboardFocus){
                setKeyboardFocus();
            }
        }, eventOpts);
        root.addEventListener('keydown', unblockKeyboardFocus, eventOpts);
        root.addEventListener('keypress', unblockKeyboardFocus, eventOpts);

        pointerEvents.forEach(function (eventName) {
            document.addEventListener(eventName, removeKeyBoardFocus, eventOpts);
        });
    };
    /* End: keyboard-focus */


    (function(){
        var console = window.console || {};
        var log = console.log && console.log.bind ? console.log : rb.$.noop;
        var logs = ['error', 'warn', 'info', 'log'].map(function(errorName, errorLevel){
            var fnName = (errorName == 'log') ?
                'log' :
                'log' + (errorName.charAt(0).toUpperCase()) + (errorName.substr(1))
            ;
            return {
                name: fnName,
                errorLevel: errorLevel,
                fn: (console[errorName] && console[errorName].bind ? console[errorName] : rb.$.noop).bind(console)
            };
        });


        /**
         * Adds a log method and a isDebug property to an object, which can be muted by setting isDebug to false.
         * @memberof rb
         * @param obj    {Object}
         * @param [initial] {Boolean}
         */
        rb.addLog = function (obj, initial) {
            var fakeLog = rb.$.noop;

            var setValue = function(){
                var level = obj.__isDebug;
                logs.forEach(function(log){
                    var fn = (level !== false && (level === true || level >= log.errorLevel)) ?
                        log.fn :
                        fakeLog;

                    obj[log.name] = fn;
                });
            };

            obj.__isDebug = initial;
            setValue();

            Object.defineProperty(obj, 'isDebug', {
                configurable: true,
                enumerable: true,
                get: function () {
                    return obj.__isDebug;
                },
                set: function (value) {
                    if(obj.__isDebug !== value){
                        obj.__isDebug = value;
                        setValue();
                    }
                }
            });
        };
    })();

    rb.addLog(rb, 1);

    var cbs = [];
    var setupClick = function () {
        var clickClass = ['js', 'rb', 'click'].join(rb.nameSeparator);
        var clickSel = '.' + clickClass;
        var applyBehavior = function (clickElem, e) {
            var i, len, attr, found;
            for (i = 0, len = cbs.length; i < len; i++) {
                attr = clickElem.getAttribute(cbs[i].attr);

                if (attr != null) {
                    found = true;
                    cbs[i].fn(clickElem, e, attr);
                    break;
                }
            }

            if (!found) {
                clickElem.classList.remove(clickClass);
            }
        };
        setupClick = rb.$.noop;

        document.addEventListener('keydown', function (e) {
            var elem = e.target;
            if ((e.keyCode == 40 || e.keyCode == 32 || e.keyCode == 13) && elem.classList.contains(clickClass)) {
                applyBehavior(elem, e);
            }
        }, true);

        document.addEventListener('click', function (e) {
            var clickElem = e.target.closest(clickSel);
            while (clickElem) {
                applyBehavior(clickElem, e);

                clickElem = clickElem.parentNode;
                if (clickElem && clickElem.closest) {
                    clickElem = clickElem.closest(clickSel);
                }

                if (clickElem && !clickElem.closest) {
                    clickElem = null;
                }
            }

        }, true);

        return clickClass;
    };

    /**
     * Allows to add click listeners for fast event delegation. For elements with the class `js-rb-click` and a data-{name} attribute.
     * @property rb.click.add {Function} add the given name and the function as a delegated click handler.
     * @memberof rb
     * @example
     * //<a class="js-rb-click" data-lightbox="1"></a>
     * rb.click.add('lightbox', function(element, event, attrValue){
	 *
	 * });
     */
    rb.click = {
        cbs: cbs,
        add: function (name, fn) {
            cbs.push({
                attr: 'data-' + name,
                fn: fn,
            });
            if (cbs.length == 1) {
                this.clickClass = setupClick();
            }
        }
    };

    var regNum = /:(\d)+\s*$/;
    var regTarget = /^\s*?\.?([a-z0-9_\$]+)\((.*?)\)\s*?/i;

    /**
     * Returns an array of elements based on a string.
     * @memberof rb
     * @param targetStr {String} Either a whitespace separated list of ids or q jQuery traversal method. ("foo-1 bar-2", "next(.input)")
     * @param element {Element} The element that should be used as starting point for the jQuery traversal method.
     * @returns {Element[]}
     */
    rb.getElementsByString = function (targetStr, element) {
        var i, len, target, temp, num, match;

        if (targetStr) {
            if ((num = targetStr.match(regNum))) {
                targetStr = targetStr.replace(num[0], '');
                num = num[1];
            }

            switch (targetStr){
                case 'window':
                    target = [window];
                    break;
                case 'document':
                    target = [document];
                    break;
                case 'scrollingElement':
                    target = [rb.getPageScrollingElement()];
                    break;
                case 'scrollingEventObject':
                    target = [rb.getScrollingEventObject()];
                    break;
                default:
                    if ((match = targetStr.match(regTarget))) {

                        if (match[1] == '$' || match[1] == 'sel') {
                            target = Array.from(document.querySelectorAll(match[2]));
                        } else if ($.fn[match[1]]) {
                            if (!match[2]) {
                                match[2] = null;
                            }
                            target = $(element)[match[1]](match[2]).get();
                        }
                    } else {
                        targetStr = targetStr.split(regSplit);
                        target = [];
                        for (i = 0, len = targetStr.length; i < len; i++) {
                            temp = targetStr[i] && document.getElementById(targetStr[i]);
                            if (temp) {
                                target.push(temp);
                            }
                        }
                    }
                    break;
            }

            if (num && target) {
                target = target[num] ? [target[num]] : [];
            }
        }

        return target || [];
    };

    rb.elementFromStr = rb.getElementsByString;

    /**
     * Parses data-* attributes and returns an object.
     *
     * @memberof rb
     * @param {Element} element
     * @param {Object} [attrsObject]
     * @param {String} [prefix]
     * @param {String} [exclude]
     * @return {Object}
     */
    rb.parseDataAttrs = function(element, attrsObject, prefix, exclude){
        var i, name;
        var attributes = element.attributes;
        var len = attributes.length;

        if(!attrsObject){
            attrsObject = {};
        }

        prefix = prefix ? prefix + '-' : '';

        prefix = 'data-' + prefix;

        for (i = 0; i < len; i++) {
            name = attributes[i].nodeName;
            if (name != exclude && name.startsWith(prefix)) {
                attrsObject[$.camelCase(name.replace(prefix, ''))] = rb.parseValue(attributes[i].nodeValue);
            }
        }

        return attrsObject;
    };

    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

    /**
     * Returns the descriptor of a property. Moves up the prototype chain to do so.
     *
     * @memberof rb
     * @static
     *
     * @param {Object} object
     * @param {String} name
     * @returns {Object|undefined}
     */
    rb.getPropertyDescriptor = function getPropertyDescriptor(object, name) {
        var proto = object, descriptor;
        if (name in proto) {
            while (proto && !(descriptor = getOwnPropertyDescriptor(proto, name))) {
                proto = Object.getPrototypeOf(proto);
            }
        }
        return descriptor;
    };

    /* begin: html escape */
    // List of HTML entities for escaping.
    var escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '`': '&#x60;'
    };

    // Functions for escaping and unescaping strings to/from HTML interpolation.
    var createEscaper = function (map) {
        var escaper = function (match) {
            return map[match];
        };
        // Regexes for identifying a key that needs to be escaped
        var source = '(?:' + Object.keys(map).join('|') + ')';
        var testRegexp = new RegExp(source);
        var replaceRegexp = new RegExp(source, 'g');
        return function (string) {
            string = string == null ? '' : '' + string;
            return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
        };
    };

    /**
     * Converts the characters "&", "<", ">", '"', "'", and "\`" in `string` to
     * their corresponding HTML entities.
     *
     * @static
     * @memberOf rb
     * @category String
     * @param {string} [string=''] The string to escape.
     * @returns {string} Returns the escaped string.
     * @example
     *
     * rb.escape('fred, barney, & pebbles');
     * // => 'fred, barney, &amp; pebbles'
     */
    rb.escape = createEscaper(escapeMap);

    if (!window._) {
        window._ = {};
    }
    if (!_.escape) {
        _.escape = rb.escape;
    }
    /* end: html escape */


    /**
     * Returns yes, if condition is true-thy no/empty string otherwise. Can be used inside of [`rb.template`]{@link rb.template}
     * @param condition
     * @param {String} yes
     * @param {String} [no=""]
     * @returns {string}
     */
    rb.if = function (condition, yes, no) {
        return condition ? yes : (no || '');
    };

    rb._utilsInit = function(){
        initClickArea();
        initFocusWithin();
        initKeyboardFocus();
        rb._utilsInit = rb.$.noop;
    };
})(window, document);

(function (window, document) {
    'use strict';

    var elements, useMutationEvents, implicitlyStarted, liveBatch, initClass, attachedClass, started;

    var live = {};
    var removeElements = [];
    var rb = window.rb;
    var $ = rb.$;
    var componentExpando = rb.Symbol('_rbComponent');
    var expando = rb.Symbol('_rbCreated');
    var docElem = rb.root;
    var hooksCalled = {};
    var unregisteredFoundHook = {};

    var extendStatics = function (Class, proto, SuperClasss, prop) {
        var value = $.extend(true, {}, SuperClasss[prop], proto[prop], Class[prop]);

        Object.defineProperty(Class, prop, {
            configurable: true,
            enumerable: true,
            writable: true,
            value: value,
        });

        if (proto[prop]) {
            Object.defineProperty(proto, prop, {
                configurable: true,
                enumerable: true,
                writable: true,
                value: null,
            });
        }
    };

    var initClickCreate = function () {
        initClickCreate = $.noop;
        rb.click.add('module', function (elem) {
            rb.getComponent(elem);
            rb.rAFQueue(function () {
                elem.classList.remove(rb.click.clickClass);
                if(!elem.classList.contains(attachedClass)){
                    elem.classList.add(initClass);
                    live.searchModules();
                }
            }, true);
            liveBatch.run();
        });
    };

    var initWatchCss = function () {
        initWatchCss = $.noop;
        var elements = document.getElementsByClassName(attachedClass);

        rb.checkCssCfgs = function () {
            var i, elem, component;
            var len = elements.length;
            for (i = 0; i < len; i++) {
                elem = elements[i];
                component = elem && elem[componentExpando];

                if (component && component.hasCssCfgChanged && component.hasCssCfgChanged()) {
                    component.parseOptions();
                }
            }
        };

        rb.resize.on(rb.checkCssCfgs);
    };

    var initObserver = function () {
        var removeComponents = (function () {
            var runs, timer;
            var i = 0;
            var main = function () {
                var len, instance, element;
                var start = Date.now();
                for (len = live._attached.length; i < len && Date.now() - start < 4; i++) {
                    element = live._attached[i];

                    if (element && (instance = element[componentExpando]) && !docElem.contains(element)) {
                        element.classList.add(initClass);
                        live.destroyComponent(instance, i, element);

                        i--;
                        len--;
                    }
                }

                if (i < len) {
                    timer = setTimeout(main, 40);
                } else {
                    timer = false;
                }
                runs = false;
            };
            return function () {
                if (!runs) {
                    runs = true;
                    i = 0;
                    if (timer) {
                        clearTimeout(timer);
                    }
                    setTimeout(main, 99);
                }
            };
        })();

        var onMutation = function (mutations) {
            var i, mutation;
            var len = mutations.length;

            for (i = 0; i < len; i++) {
                mutation = mutations[i];
                if (mutation.addedNodes.length) {
                    live.searchModules();
                }
                if (mutation.removedNodes.length) {
                    removeComponents();
                }
            }
        };

        if (!useMutationEvents && window.MutationObserver) {
            new MutationObserver(onMutation)
                .observe(docElem, {subtree: true, childList: true})
            ;
        } else {
            docElem.addEventListener('DOMNodeInserted', live.searchModules);
            document.addEventListener('DOMContentLoaded', live.searchModules);
            docElem.addEventListener('DOMNodeRemoved', (function () {
                var mutation = {
                    addedNodes: []
                };
                var mutations = [
                    mutation
                ];
                var run = function () {
                    onMutation(mutations);
                    mutation.removedNodes = false;
                };
                return function (e) {
                    if (!mutation.removedNodes) {
                        mutation.removedNodes = [];
                        setTimeout(run, 9);
                    }
                    if (e.target.nodeType == 1) {
                        mutation.removedNodes.push(e.target);
                    }
                };
            })());
        }
    };

    var createBatch = function () {
        var runs;
        var batch = [];
        var run = function () {
            while (batch.length) {
                batch.shift()();
            }
            runs = false;
        };
        return {
            run: run,
            add: function (fn) {
                batch.push(fn);
            },
            timedRun: function () {
                if (!runs) {
                    runs = true;
                    setTimeout(run);
                }
            }
        };
    };
    var extendOptions = function(obj){
        if(obj){
            ['statePrefix', 'utilPrefix', 'jsPrefix', 'nameSeparator', 'elementSeparator', 'attrSel'].forEach(function(prefixName){
                if(prefixName in obj && typeof obj[prefixName] == 'string') {
                    rb[prefixName] = obj[prefixName];
                }
            });
        }
    };
    var mainInit = function(){

        window.removeEventListener('click', mainInit, true);
        mainInit = false;

        extendOptions(rb.cssConfig);

        initClass = ['js', 'rb', 'live'].join(rb.nameSeparator);
        attachedClass = ['js', 'rb', 'attached'].join(rb.nameSeparator);

        elements = document.getElementsByClassName(initClass);

        rb._utilsInit();

        initObserver();

        initClickCreate();

        initWatchCss();

        rb.ready.resolve();
    };

    rb.ready = rb.deferred();

    rb.live = live;

    live.autoStart = true;

    live.expando = expando;
    live.componentExpando = componentExpando;

    live._failed = {};

    /**
     * List of all component classes registered by `rb.live.register`.
     * @memberof rb
     * @type {{}}
     */
    rb.components = {};
    live._attached = [];
    live.customElements = false;

    live.init = function (options) {
        if (started) {
            return;
        }

        started = true;

        if (options) {
            useMutationEvents = options.useMutationEvents || false;

            extendOptions(options);
        }

        if(mainInit){
            window.addEventListener('click', mainInit, true);
        }

        liveBatch = createBatch();

        live.searchModules();
    };

    /**
     * Registers a component class with a name and manages its livecycle. An instance of this class will be automatically constructed with the found element as the first argument. If the class has an `attached` or `detached` instance method these methods also will be invoked, if the element is removed or added from/to the DOM. In most cases the given class inherits from [`rb.Component`]{@link rb.Component}. All component classes are added to the `rb.components` namespace.
     *
     * The DOM element/markup of a component class must have a `data-module` attribute with the name as its value. The `data-module` is split by a "/" and only the last part is used as the component name. The part before can be optionally used for [`rb.live.addImportHook`]{@link rb.live.addImportHook}.
     *
     * Usually the element should also have the class `js-rb-live` to make sure it is constructed as soon as it is attached to the document. If the component element has the class `js-rb-click` instead it will be constructed on first click.
     *
     * @memberof rb
     * @param {String} name The name of your component.
     * @param Class {Class} The Component class for your component.
     * @return Class {Class}
     *
     * @example
     * class MyButton {
	 *      constructor(element){
	 *
	 *      }
	 * }
     *
     * //<button class="js-rb-live" data-module="my-button"></button>
     * rb.live.register('my-button', MyButton);
     *
     * @example
     * class Time {
	 *      constructor(element, _initialDefaultOpts){
	 *          this.element = element;
	 *      }
	 *
	 *      attached(){
	 *          this.timer = setInterval(() = > {
	 *              this.element.innerHTML = new Date().toLocaleString();
	 *          }, 1000);
	 *      }
	 *
	 *      detached(){
	 *          clearInterval(this.timer);
	 *      }
	 * }
     *
     * //<span class="js-rb-live" data-module="time"></span>
     * rb.live.register('time', Time);
     *
     */
    live.register = function (name, Class, _noCheck) {
        var proto = Class.prototype;
        var superProto = Object.getPrototypeOf(proto);
        var superClass = superProto.constructor;

        if (proto instanceof rb.Component) {
            extendStatics(Class, proto, superClass, 'defaults');
            extendStatics(Class, proto, superClass, 'events');

            proto._CssCfgExpando = rb.Symbol('_CssCfgExpando');

            if (!proto.hasOwnProperty('name')) {
                proto.name = name;
            }
        }

        if (rb.components[name]) {
            rb.log(name + ' already exists.');
        }

        rb.components[name] = Class;

        if (name.charAt(0) == '_') {
            return;
        }

        if (!_noCheck) {
            if (!started && !implicitlyStarted) {
                implicitlyStarted = true;
                setTimeout(function () {
                    if (!elements && live.autoStart) {
                        $(function () {
                            if (!elements) {
                                setTimeout(function () {
                                    if (!elements) {
                                        live.init();
                                    }
                                });
                            }
                        });
                    }
                }, 9);
            } else if (elements) {
                live.searchModules();
            }
        }

        return Class;
    };

    /**
     * Allows to add import callbacks for not yet registered components. The importCallback is only called once per component class name. The names parameter is either the component name or '*' as a wildcard. In case names is an array of strings these are treated as aliases for the same module. (rb-plugins/rb_packageloader automatically adds a wildcard hook.) If only importCallback is passed it will be also treated as a wildcard.
     *
     * There can be only one importHook for a module name.
     *
     * @memberof rb
     *
     * @param {String|String[]} [names] Component name or Component names/aliases for the module.
     * @param {Function} importCallback Callback that should import/require the module.
     *
     * @example
     * //create a short cut.
     * var addImportHook = rb.live.addImportHook;
     *
     * addImportHook('slider', function(moduleName, moduleAttributeValue, reject, element){
	 *      //non-standard futuristic import
	 *      System.import('./components/slider-v2').catch(reject);
	 * });
     *
     * //Add component class with different aliases
     * addImportHook(['accordion', 'tabs', 'panelgroup'], function(){
	 *      //webpack require
	 *      require.ensure([], function(require){
	 *          require('./components/panelgroups/index');
	 *      });
	 * });
     *
     * //Multiple component aliases with multiple modules
     * addImportHook(['accordion', 'tabs', 'panelgroup', 'slider'], function(){
	 *      //AMD or webpack require
	 *      require(['./components/slider', './components/panelgroup', './components/panel']);
	 * });
     *
     * //dynamic catch all hook
     * addImportHook(function(moduleName, moduleAttributeValue){
	 *      //AMD or webpack require
	 *      require(['./components/' + moduleAttributeValue]);
	 * });
     */
    live.addImportHook = function (names, importCallback) {
        var add = function (name) {
            if (unregisteredFoundHook[name]) {
                rb.log('overrides ' + name + ' import hook', names, importCallback);
            }
            unregisteredFoundHook[name] = importCallback;
        };

        if (typeof names == 'function') {
            importCallback = names;
            names = '*';
        }
        if (Array.isArray(names)) {
            names.forEach(add);
        } else {
            add(names);
        }
    };

    /**
     * Constructs a component class with the given element. Also attaches the attached classes and calls optionally the `attached` callback method. This method is normally only used automatically/internally by the mutation observer.
     *
     * @memberof rb
     * @see rb.getComponent
     *
     * @param element
     * @param liveClass
     * @returns {Object}
     */
    live.create = function (element, liveClass, initialOpts) {
        var instance;

        if (mainInit) {
            mainInit();
        }

        if (!(instance = element[componentExpando])) {
            instance = new liveClass(element, initialOpts);
            element[componentExpando] = instance;
        }

        rb.rAFQueue(function () {
            element.classList.add(attachedClass);
        }, true);

        if (!element[expando] && instance && (instance.attached || instance.detached)) {

            if (live._attached.indexOf(element) == -1) {
                live._attached.push(element);
            }
            if (instance.attached) {
                liveBatch.add(function () {
                    instance.attached();
                });
            }

            liveBatch.timedRun();
        }
        element[expando] = true;
        instance._created = true;

        return instance;
    };

    live.searchModules = (function () {
        var removeInitClass = rb.rAF(function () {
            while (removeElements.length) {
                removeElements.shift().classList.remove(initClass);
            }
        });
        var failed = function (element, id) {
            live._failed[id] = true;
            removeElements.push(element);
            rb.logError('failed', id, element);
        };

        var findElements = rb.throttle(function () {

            var element, modulePath, moduleId, i, hook, len;

            if(mainInit){
                mainInit();
            }

            len = elements.length;

            if (!len) {
                return;
            }

            for (i = 0; i < len; i++) {
                element = elements[i];

                if (element[expando]) {
                    removeElements.push(element);
                    continue;
                }

                modulePath = element.getAttribute('data-module') || '';
                moduleId = modulePath.split('/');
                moduleId = moduleId[moduleId.length - 1];

                if (rb.components[moduleId]) {
                    live.create(element, rb.components[moduleId]);
                    removeElements.push(element);
                }
                else if (live._failed[moduleId]) {
                    failed(element, moduleId);
                }
                else if ((hook = (unregisteredFoundHook[moduleId] || unregisteredFoundHook['*']))) {
                    if (!hooksCalled[modulePath]) {
                        hooksCalled[modulePath] = true;
                        /* jshint loopfunc: true */
                        hook(moduleId, modulePath, (function (element, moduleId) {
                            return function () {
                                failed(element, moduleId);
                            };
                        })(element, moduleId), element);
                    }
                }
                else {
                    failed(element, moduleId);
                }
            }

            removeInitClass();
            liveBatch.run();
        }, {delay: 50, read: true});

        return findElements;
    })();

    live.destroyComponent = function (instance, index, element) {

        if (!element) {
            element = instance.element;
        }

        if (index == null) {
            index = live._attached.indexOf(element);
        }
        element.classList.remove(attachedClass);

        if (element[expando]) {
            delete element[expando];
        }
        if (instance.detached) {
            instance.detached(element, instance);
        }

        live._attached.splice(index, 1);
    };

    return live;
})(window, document);

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * modified for better ES5 support by alex
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function () {
    var rb = window.rb;
    var fnTest = (/xyz/.test(function () {
            var a = xyz;
        })) ?
            /\b_super\b/ :
            /.*/
        ;

    // The base Class implementation (does nothing)
    var ES5Class = function () {
    };

    ES5Class.mixin = function (prototype, _super, prop) {
        var name, origDescriptor, descProp, superDescriptor;

        if (arguments.length < 3) {
            prop = _super;
            _super = prototype;
        }

        // Copy the properties over onto the new prototype
        for (name in prop) {
            origDescriptor = Object.getOwnPropertyDescriptor(prop, name);
            if (!origDescriptor) {
                continue;
            }

            superDescriptor = (name in _super && rb.getPropertyDescriptor(_super, name));

            for (descProp in origDescriptor) {
                // Check if we're overwriting an existing function...
                if (superDescriptor && typeof origDescriptor[descProp] == 'function' && typeof superDescriptor[descProp] == 'function') {

                    //...and using super keyword
                    if (fnTest.test(origDescriptor[descProp])) {
                        /* jshint loopfunc: true */
                        origDescriptor[descProp] = (function (_superFn, fn) {
                            return function () {
                                var tmp = this._super;

                                // Add a new ._super() method that is the same method
                                // but on the super-class
                                this._super = _superFn;

                                // The method only need to be bound temporarily, so we
                                // remove it when we're done executing
                                var ret = fn.apply(this, arguments);
                                this._super = tmp;

                                return ret;
                            };
                        })(superDescriptor[descProp], origDescriptor[descProp]);
                    }

                    //always allow NFE call for frequently called methods without this._super, but functionName._supbase
                    //see http://techblog.netflix.com/2014/05/improving-performance-of-our-javascript.html
                    origDescriptor[descProp]._supbase = superDescriptor[descProp];
                }
            }

            Object.defineProperty(prototype, name, origDescriptor);
        }
    };

    // Create a new Class that inherits from this class
    ES5Class.extend = function (prop) {
        var _super = this.prototype;
        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        var prototype = Object.create(_super);

        ES5Class.mixin(prototype, _super, prop);

        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if (('init' in this)) {
                this.init.apply(this, arguments);
            }
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this class extendable
        Class.extend = this.extend || ES5Class.extend;

        return Class;
    };
    rb.Class = ES5Class;
})();

(function (window, document, live, undefined) {
    'use strict';

    var focusClass, focusSel;
    var rb = window.rb;
    var $ = rb.$;
    var componentExpando = live.componentExpando;
    var regHTMLSel = /\.{(htmlName|name)}(.+?)(?=(\s|$|\+|\)|\(|\[|]|>|<|~|\{|}|,|'|"|:))/g;
    var regName = /\{name}/g;
    var regJsName = /\{jsName}/g;
    var regHtmlName = /\{htmlName}/g;
    var regnameSeparator = /\{-}/g;
    var regElementSeparator = /\{e}/g;
    var _setupEventsByEvtObj = function (that) {
        var eventsObjs, evt, oldCallbacks;
        var delegateEvents = [];
        var evts = that.constructor.events;

        for (evt in evts) {
            eventsObjs = rb.parseEventString(evt);

            /* jshint loopfunc: true */
            (function (eventsObjs, method) {
                var handler;

                handler = (typeof method == 'string') ?
                    function (e) {
                        return that[method].apply(that, arguments);
                    } :
                    function () {
                        return method.apply(that, arguments);
                    }
                ;

                eventsObjs.forEach(function(eventObj){
                    var prop, eventName;
                    var opts = {};
                    eventName = that.interpolateName(eventObj.event, true);

                    for(prop in eventObj.opts){
                        opts[prop] = that.interpolateName(eventObj.opts[prop]);
                    }

                    if(!opts['@']){
                        rb.events.add(that.element, eventName, handler, opts);
                    } else {
                        delegateEvents.push([null, eventName, handler, opts]);
                    }
                });
            })(eventsObjs, evts[evt]);
        }

        if(delegateEvents.length){
            oldCallbacks = {
                attached: that.attached,
                detached: that.detached,
            };

            [['attached', 'add'], ['detached', 'remove']].forEach(function(descriptor){
                that[descriptor[0]] = function(){
                    var i, len, opts;

                    for(i = 0, len = delegateEvents.length; i < len; i++){
                        opts = delegateEvents[i][3];

                        if(!delegateEvents[i][0]){
                            delegateEvents[i][0] = that.getElementsByString(opts['@']) || delegateEvents[i][0];

                            if(delegateEvents[i][0] && delegateEvents[i][0].length < 2){
                                delegateEvents[i][0] = delegateEvents[i][0][0];
                            }
                        }

                        if(delegateEvents[i][0]){
                            if(Array.isArray(delegateEvents[i][0])){
                                delegateEvents[i][0].forEach(function(elem) {
                                    rb.events[descriptor[1]](elem, delegateEvents[i][1], delegateEvents[i][2], opts);
                                });
                            } else {
                                rb.events[descriptor[1]](delegateEvents[i][0], delegateEvents[i][1], delegateEvents[i][2], opts);
                            }
                        } else {
                            rb.logWarn('element not found', opts['@'], that);
                        }

                        if(descriptor[0] == 'remove'){
                            delegateEvents[i][0] = null;
                        }
                    }

                    if(oldCallbacks[descriptor[0]]){
                        return oldCallbacks[descriptor[0]].apply(this, arguments);
                    }
                };
            });
        }
    };
    var replaceHTMLSel = rb.memoize((function(){
        var replacer = function(full, f1, f2){
            return '[' + rb.attrSel + '="{htmlName}' + f2 +'"]';
        };
        return function(str){
            return str.replace(regHTMLSel, replacer);
        };
    })(), true);
    var generateFocusClasses = function(){
        focusClass = ['js', 'rb', 'autofocus'].join(rb.nameSeparator);
        focusSel = '.' + focusClass;
    };

    rb.ready.then(generateFocusClasses);

    rb.parseEventString = rb.memoize(function(eventStr){
        var i, len, data, opts, char;
        var events = [];

        var mode = 1;

        var optsName = '';
        var optsValue = '';
        var openingCount = 0;
        var selector = '';

        for(i = 0, len = eventStr.length; i < len; i++){
            char = eventStr[i];

            if(!data){
                data = {
                    event: '',
                    opts: {},
                };
                opts = data.opts;
            }

            if(mode != 3 && mode != 4 && char == ','){
                events.push(data);
                if(mode == 2){
                    opts[optsName] = optsValue  || ' ';
                    optsName = '';
                    optsValue = '';
                }

                if(!data.event && opts.event){
                    data.event = opts.event;
                }

                data = null;
                mode = 1;
                continue;
            }

            if(mode == 1){
                if(char == ':'){
                    mode = 2;

                } else if(data.event && char == ' '){
                    mode = 4;
                } else if(char != ' ') {
                    data.event += char;
                }
            } else if(mode == 2){
                if(char == '('){
                    mode = 3;
                    openingCount++;
                } else if(char == ':'){
                    if(optsName){
                        opts[optsName] = ' ';
                        optsName = '';
                    }
                } else if(char == ' '){
                    mode = 4;
                } else {
                    optsName += char;
                }
            } else if(mode == 3){
                if(char == '('){
                    openingCount++;
                } else  if(char == ')'){
                    openingCount--;

                    if(!openingCount){
                        opts[optsName] = optsValue || ' ';
                        optsName = '';
                        optsValue = '';
                        mode = 2;
                        continue;
                    }
                }

                optsValue += char;
            } else if(mode == 4){
                selector += char;
            }
        }

        if(data){
            events.push(data);

            if(optsName){
                opts[optsName] = optsValue || ' ';
            }

            if(!data.event && opts.event){
                data.event = opts.event;
            }

            if(selector){
                for(i = 0, len = events.length; i < len; i++){
                    if(!events[i].opts.closest){
                        events[i].opts.closest = selector;
                    }
                }
            }
        }

        return events;
    }, true);

    /**
     * returns the component instance of an element. If the component is not yet initialized it will be initialized.
     *
     * @memberof rb
     * @param {Element} element - DOM element
     * @param {String} [componentName] - optional name of the component (if element has no `data-module="componentName"`).
     * @param {Object} [initialOpts] - only use if component is not initialized otherwise use `setOption`/`setOptions`
     * @returns {Object} A component instance
     */
    rb.getComponent = function (element, componentName, initialOpts) {
        var component = element && element[componentExpando];

        if (!component && element) {

            if (!rb.components[componentName]) {
                componentName = (element.getAttribute('data-module') || '').split('/');

                componentName = componentName[componentName.length - 1];
            }

            if (rb.components[componentName]) {
                component = live.create(element, rb.components[componentName], initialOpts);
            }
        }

        if(!component){
            rb.logWarn('component not found', element, componentName);
        }
        return component || null;
    };

    live.getComponent = rb.getComponent;

    rb.Component = rb.Class.extend(
        /** @lends rb.Component.prototype */
        {
            /**
             * constructs the class
             * @classdesc Component Base Class - all UI components should extend this class. This Class adds some neat stuff to parse/change options (is automatically done in constructor), listen and trigger events, react to responsive state changes and establish BEM style classes as also a11y focus management.
             *
             * For the live cycle features see [rb.live.register]{@link rb.live.register}.
             * @param element
             * @param [initialDefaults] {Object}
             * @constructs
             *
             * @example
             * //<div class="js-rb-live" data-module="my-module"></div>
             * rb.Component.extend('my-component', {
			 *      defaults: {
			 *          className: 'toggle-class',
			 *      },
			 *      events: {
			 *          'click:closest(.change-btn)': 'changeClass',
			 *      },
			 *      init: function(element, initialDefaults){
			 *          this._super(element, initialDefaults);
			 *
			 *          rb.rAFs(this, 'changeClass');
			 *      },
			 *      changeClass: function(){
			 *          this.$element.toggleClass(this.options.className);
			 *      }
			 * });
             * //If ES5 static extend method is used, rb.live.register is called implicitly.
             *
             * @example
             * //<div class="js-rb-live" data-module="my-module"></div>
             * rb.live.register('my-component', class MyComponent extends rb.Component {
			 *      static get defaults(){
			 *          return {
			 *              className: 'toggle-class',
			 *          };
			 *      }
			 *
			 *      static get events(){
			 *          return {
			 *              'click .change-btn': 'changeClass',
			 *          };
			 *      }
			 *
			 *      constructor(element, initialDefaults){
			 *          super(element, initialDefaults);
			 *          rb.rAFs(this, 'changeClass');
			 *      }
			 *
			 *      changeClass(){
			 *          this.$element.toggleClass(this.options.className);
			 *      }
			 * });
             */
            init: function (element, initialDefaults) {
                var origName = this.name;
                /**
                 * Reference to the main element.
                 * @type {Element}
                 */
                this.element = element;
                this.$element = $(element);

                /**
                 * Current options object constructed by defaults and overriding markup/CSS.
                 * @type {{}}
                 */
                this.options = {};

                this._initialDefaults = initialDefaults;
                this._stickyOpts = {};
                element[componentExpando] = this;

                this.origName = origName;

                this.parseOptions(this.options);

                this.name = this.options.name || rb.jsPrefix + this.name;
                this.jsName = this.options.jsName || origName;

                this._evtName = this.jsName + 'changed';
                this._beforeEvtName = this.jsName + 'change';

                rb.addLog(this, this.options.debug == null ? rb.isDebug : this.options.debug);

                /**
                 * Template function or hash of template functions to be used with `this.render`. On instantiation the `rb.template['nameOfComponent']` is referenced.
                 * @type {Function|{}}
                 */
                this.templates = rb.templates[this.jsName] || rb.templates[origName] || {};

                _setupEventsByEvtObj(this);
            },

            /**
             * defaults Object, represent the default options of the component.
             * While a parsed option can be of any type, it is recommended to only use immutable values as defaults.
             *
             * @see rb.Component.prototype.setOption
             *
             * @prop {Object} defaults
             * @prop {Boolean} defaults.debug=rb.isDebug If `true` log method wirtes into console. Inherits from `rb.isDebug`.
             * @prop {Number} defaults.focusDelay=0 Default focus delay for `setComponentFocus`. Can be used to avoid interference between focusing and an animation.
             * @prop {String|undefined} defaults.name=undefined Overrides the name of the component, which is used for class names by `interpolateName` and its dependent methods.
             * @prop {String} defaults.autofocusSel='' Overrides the js-rb-autofocus selector for the component.
             * @prop {Boolean} defaults.jsName=undefined Overrides the jsName of the component, which is used for events by `interpolateName` and its dependent methods.
             *
             * @example
             * <!-- overriding defaults with markup -->
             * <div data-module="mymodule" data-mymodule-options='{"fooBar": false, "baz": true}'></div>
             * <div data-module="mymodule" data-mymodule-foo-bar="false" data-mymodule-baz="true"></div>
             *
             * @example
             *
             * //creating a new component with different defaults:
             * rb.live.register('special-accordion', class SpecialAccordion extends rb.components.accordion {
			 *      static get defaults(){
			 *          return {
			 *              multiple: true,
			 *          };
			 *      }
			 * });
             *
             * //overriding defaults (before initialization for all instances) with JS
             * rb.components.accordion.defaults.multiple = true;
             *
             * //overriding defaults (after initialization for one instance) with JS
             * var accordion = rb.getComponent(accordionElement);
             * accordion.setOption('multiple', true);
             *
             * @example
             * //overriding defaults using Sass
             * .rb-accordion {
			 *      (at)include rb-js-export((
			 *          multiple: false
			 *      ));
			 * }
             *
             * //also works responsive:
             * (at)media (max-width: 800px) {
			 *   .rb-accordion {
			 *      (at)include rb-js-export((
			 *          multiple: false
			 *      ));
			 *   }
			 * }
             *
             */
            defaults: {
                focusDelay: 0,
                debug: null,
                autofocusSel: '',
            },

            /**
             * Events object can be used to specify events, that will be bound to the component element.
             *
             * The key specifies the event type and optional a selector (separated by a whitespace) for event delegation. The key will be interpolated with [`this.interpolateName`]{@link rb.Component#interpolateName}.
             *
             * The key also allows comma separated multiple events as also modifiers (`'event1,event2:modifier()'`). As modifier `"event:capture()"`, `"event:keycodes(13 32)"`, `"event:matches(.selector)"` and `"event:closest(.selector)"` (alias for `"event .selector"`) are known. The delegated element is available through the `delegatedTarget` property.
             *
             * The value is either a string representing the name of a component method or a function reference. The function is always executed in context of the component.
             *
             *
             * @example
             *
             * class MyComponent extends rb.Component {
			 *      constructor(element, initialDefaults){
			 *          super(element, initialDefaults);
			 *          this.child = this.query('.{name}__close-button');
			 *
			 *          rb.rAFs(this, 'setLayout');
			 *      }
			 *
			 *      static get events(){
			 *          return {
			 *              'mouseenter': '_onInteraction',
			 *              'click .{name}__close-button': 'close',
			 *              'focus:capture():matches(input, select)': '_onFocus',
			 *              'mouseenter:capture():matches(.teaser)': '_delegatedMouseenter',
			 *              'keypress:keycodes(13 32):matches(.ok-btn)': '_ok',
			 *              'click:closest(.ok-btn)': '_ok',
			 *              'submit:@(closest(form))': '_submit',
			 *          }
			 *      }
			 * }
             */
            events: {},
            /**
             * Shortcut to [`rb.getComponent`]{@link rb.getComponent}
             * @function
             */
            component: function(element, name, initialOpts){
                if(typeof element == 'string'){
                    element = this.interpolateName(element);
                    element = rb.getElementsByString(element, this.element)[0] || this.query(element);
                }
                return rb.getComponent(element, name, initialOpts);
            },

            /**
             * returns the id of an element, if no id exist generates one for the element
             * @param {Element} [element], if no element is given. the component element is used.
             * @param {Boolean} [async=true], sets the id async in a rAF
             * @returns {String} id
             */
            getId: function (element, async) {
                var id;

                if(typeof element == 'boolean'){
                    async = element;
                    element = null;
                }

                if (!element) {
                    element = this.element;
                }

                if(async == null){
                    async = true;
                }

                if (!(id = element.id)) {
                    id = 'js' + rb.nameSeparator + rb.getID();
                    if(async){
                        rb.rAFQueue(function(){
                            element.id = id;
                        }, true);
                    } else {
                        element.id = id;
                    }
                }

                return id;
            },

            /**
             * Dispatches an event on the component element and returns the Event object.
             * @param [type='changed'] {String|Object} The event.type that should be created. If no type is given the name 'changed' is used. Automatically prefixes the type with the name of the component. If an opbject is passed this will be used as the `event.detail` property.
             * @param [detail] {Object} The value for the event.detail property to transport event related information.
             * @returns {Event}
             */
            _trigger: function (type, detail) {
                var opts;
                if (typeof type == 'object') {
                    detail = type;
                    type = detail.type;
                }
                if (type == null) {
                    type = this._evtName;
                } else if (!type.includes(this.jsName)) {
                    type = this.jsName + type;
                }

                opts = {detail: detail || {}};

                if(detail){
                    if('bubbles' in detail){
                        opts.bubbles = detail.bubbles;
                    }
                    if('cancelable' in detail){
                        opts.cancelable = detail.cancelable;
                    }
                }

                return rb.events.dispatch(this.element, type, opts);
            },

            /**
             * Uses [`rb.getElementsByString`]{@link rb.getElementsByString} with this.element as the element argument and interpolates string using `this.interpolateName`.
             * @param {String} string
             * @param {Element} [element=this.element]
             * @returns {Element[]}
             */
            getElementsByString: function (string, element) {
                return rb.getElementsByString(this.interpolateName(string), element || this.element);
            },

            /*
             * shortcut to [`rb.setFocus`]{@link rb.setFocus}
             * @borrows rb.setFocus as setFocus
             */
            setFocus: rb.setFocus,

            /**
             *
             * @param [element] {Element|Boolean|String} The element that should be focused. In case a string is passed the string is converted to an element using `rb.elementFromStr`
             * @returns {undefined|Element}
             */
            getFocusElement: function(element){
                var focusElement;

                if (element && element !== true) {
                    if (element.nodeType == 1) {
                        focusElement = element;
                    } else if (typeof element == 'string') {
                        focusElement = rb.elementFromStr(element, this.element)[0];
                    }
                } else {
                    focusElement = this.options.autofocusSel &&
                        this.query(this.options.autofocusSel) ||
                        this.query(focusSel);
                }

                if (!focusElement && (element === true || this.element.classList.contains(focusClass))) {
                    focusElement = this.element;
                }
                return focusElement;
            },

            /**
             * Sets the focus and remembers the activeElement before. If setComponentFocus is invoked with no argument. The element with the class `js-rb-autofocus` inside of the component element is focused.
             * @param [element] {Element|Boolean|String} The element that should be focused. In case a string is passed the string is converted to an element using `rb.elementFromStr`
             * @param [delay] {Number} The delay that should be used to focus an element.
             */
            setComponentFocus: function (element, delay) {
                var focusElement;

                if (typeof element == 'number') {
                    delay = element;
                    element = null;
                }

                focusElement = (!element || element.nodeType != 1) ?
                    this.getFocusElement(element) :
                    element
                ;

                this.storeActiveElement();

                if (focusElement) {
                    this.setFocus(focusElement, delay || this.options.focusDelay);
                }
            },

            /**
             * stores the activeElement for later restore.
             *
             * @returns {Element}
             *
             * @see rb.Component.prototype.restoreFocus
             */
            storeActiveElement: function(){
                var activeElement = document.activeElement;

                this._activeElement = (activeElement && activeElement.nodeName) ?
                    activeElement :
                    null;

                return this._activeElement;
            },

            /**
             * Restores the focus to the element, that had focus before `setComponentFocus` was invoked.
             * @param [checkInside] {Boolean} If checkInside is true, the focus is only restored, if the current activeElement is inside the component itself.
             * @param [delay] {Number}
             */
            restoreFocus: function (checkInside, delay) {
                var activeElem = this._activeElement;

                if (!activeElem) {
                    return;
                }

                if (typeof checkInside == 'number') {
                    delay = checkInside;
                    checkInside = null;
                }

                this._activeElement = null;
                if (!checkInside || this.element == document.activeElement || this.element.contains(document.activeElement)) {
                    this.setFocus(activeElem, delay || this.options.focusDelay);
                }
            },

            /**
             * Interpolates {name}, {jsName} and {htmlName} to the name of the component. Helps to generate BEM-style Class-Structure.
             * @param {String} str
             * @param {Boolean} [isJs=false]
             * @returns {string}
             *
             * @example
             * //assume the name of the component is dialog
             * this.interpolateName('.{name}__button'); //return '.dialog__button'
             */
            interpolateName: function (str, isJs) {

                if(!isJs && rb.attrSel){
                    str = replaceHTMLSel(str);
                }

                return str
                    .replace(regName, isJs ? this.jsName : this.name)
                    .replace(regJsName, this.jsName)
                    .replace(regHtmlName, this.name)
                    .replace(regnameSeparator, rb.nameSeparator)
                    .replace(regElementSeparator, rb.elementSeparator)
                ;
            },

            /**
             * Returns first matched element. Interpolates selector with `interpolateName`.
             * @param {String} selector
             * @param {Element} [context=this.element]
             * @returns {Element}
             */

            query: function (selector, context) {
                return (context || this.element).querySelector(this.interpolateName(selector));
            },

            _qSA: function(selector, context){
                return (context || this.element).querySelectorAll(this.interpolateName(selector));
            },

            /**
             * Returns Array of matched elements. Interpolates selector with `interpolateName`.
             * @param {String} selector
             * @param {Element} [context=this.element]
             * @returns {Element[]}
             */
            queryAll: function (selector, context) {
                return Array.from(this._qSA(selector, context));
            },

            /**
             * Returns jQuery list of matched elements. Interpolates selector with `interpolateName`.
             * @param {String} selector
             * @param {Element} [context=this.element]
             * @returns {jQueryfiedNodeList}
             */
            $queryAll: function (selector, context) {
                return $(this._qSA(selector, context));
            },

            /*
             * Parses the Options from HTML (data-* attributes) and CSS using rb.parsePseudo. This function is automatically invoked by the init/constructor.
             * @param opts
             * @param initialOpts
             */
            parseOptions: function (opts) {
                var options = $.extend(true, opts || {}, this.constructor.defaults, this._initialDefaults, this.parseCSSOptions(), this.parseHTMLOptions(), this._stickyOpts);
                this.setOptions(options);
            },

            /*
             * Sets mutltiple options at once.
             * @param opts
             */
            setOptions: function (opts, isSticky) {
                var oldValue, newValue;

                if(opts !== this.options){
                    for (var prop in opts) {
                        newValue = opts[prop];
                        oldValue = this.options[prop];
                        if (newValue !== oldValue &&
                            (!oldValue || typeof newValue != 'object' || typeof oldValue != 'object' ||
                            JSON.stringify(newValue) != JSON.stringify(oldValue))) {
                            this.setOption(prop, newValue, isSticky);
                        }
                    }
                }
            },

            /**
             * Sets an option. The function should be extended to react to dynamic option changes after instantiation.
             * @param name {String} Name of the option.
             * @param isSticky=false {boolean} Whether the option can't be overwritten with CSS option.
             * @param value {*} Value of the option.
             *
             * @example
             * class MyComponent extends rb.Component {
			 *      setOptions(name, value){
			 *          super.setOption(name, value);
			 *
			 *          if(name == 'foo'){
			 *              this.updateFoo();
			 *          }
			 *      }
			 * }
             */
            setOption: function (name, value, isSticky) {
                this.options[name] = value;

                if(isSticky){
                    this._stickyOpts[name] = value;
                }

                if (name == 'debug') {
                    this.isDebug = value;
                } else if ((name == 'name' || name == 'jsName') && this.name && this.jsName && this.logWarn) {
                    this.logWarn('don\'t change name after init.');
                }
            },
            setChildOption: function ($childs, name, value, isSticky) {
                var run = function (elem) {
                    var component = this && this[componentExpando] ||
                        elem[componentExpando] ||
                            elem;
                    if (component && component.setOption) {
                        component.setOption(name, value, isSticky);
                    }
                };

                if($childs.each){
                    $childs.each(run);
                } else if($childs.forEach){
                    $childs.forEach(run);
                } else {
                    run($childs);
                }
            },
            /**
             * Convenient method to render a template. Expects a template function with the given name added to the templates hash property of the component. The data will be extended with the name of the component.
             * @param {String} [name]
             * @param {Object} data
             * @returns {String}
             *
             * @example
             * //sources/_templates/my-component/main.ejs:
             *
             * //<div class="rb-<%= component %>">
             * //    <h1 class="<%= component %>-header">
             * //        <%- title ->
             * //    </h1>
             * //</div>
             *
             * //require('sources/js/_templates/my-component.js');
             *
             * rb.live.register('my-component', class MyComponent extends rb.Component {
			 *      renderMain(){
			 *          this.element.innerHTML = this.render('main', {title: 'foo'});
			 *      }
			 * });
             */
            render: function (name, data) {
                if (typeof name == 'object') {
                    data = name;
                    name = '';
                }
                if (!data.name) {
                    data.name = this.name;
                }

                if (!data.component) {
                    data.component = this.component;
                }

                return this.templates[name] ?
                    this.templates[name](data) :
                    (!name && typeof this.templates == 'function') ?
                        this.templates(data) :
                        ''
                    ;
            },
            /*
             * parses the HTML options (data-*) of a given Element. This method is automatically invoked by the constructor or in case of a CSS option change.
             * @returns {{}}
             */
            parseHTMLOptions: function (_element) {
                if(_element){
                    rb.logError('use `rb.parseDataAttrs` instead of parseHTMLOptions.');
                    return {};
                }

                var element = this.element;
                var mainOptions = 'data-' + this.origName + '-options';
                var options = rb.jsonParse(element.getAttribute(mainOptions)) || {};

                return rb.parseDataAttrs(element, options, this.origName, mainOptions);
            },

            /*
             * parses the CSS options (::before pseudo) of the component
             * @returns {{}}
             */
            parseCSSOptions: function() {
                return rb.parsePseudo(this.element, this._CssCfgExpando) || false;
            },

            hasCssCfgChanged: function(){
                return rb.hasPseudoChanged(this.element, this._CssCfgExpando);
            },

            destroy: function () {
                live.destroyComponent(this);
            },

            _super: function () {
                this.logWarn('no _super');
            },
            /**
             * Passes args to `console.log` if isDebug option is `true.
             * @param {...*} args
             */
            log: function () {

            },
        }
    );

    rb.Component.prototype.getElementsFromString = rb.Component.prototype.getElementsByString;

    rb.Component.extend = function (name, prop, noCheck) {
        var Class = rb.Class.extend.call(this, prop);

        if (prop.statics) {
            Object.assign(Class, prop.statics);
            Class.prototype.statics = null;
        }

        live.register(name, Class, noCheck);
        return Class;
    };

    rb.Component.mixin = function (Class, prop) {
        Class.defaults = $.extend(true, Class.defaults || {}, prop.defaults);

        if (prop.statics) {
            Object.assign(Class, prop.statics);
        }

        Class.events = $.extend(true, Class.events || {}, prop.events);

        if (prop.events) {
            prop.events = null;
        }

        rb.Class.mixin(Class.prototype, prop);

        return Class;
    };

    generateFocusClasses();

})(window, document, rb.live);

(function (window, document, undefined) {
    'use strict';
    var rb = window.rb;

    rb.Component.extend('button',
        /** @lends rb.components.button.prototype */
        {
            /**
             * @static
             * @property {Object} defaults
             * @property {String} defaults.target="" String that references the target element. Is processed by rb.elementFromStr.
             * @property {String} defaults.type="toggle" Method name to invoke on target component.
             * @property {Boolean} defaults.preventDefault=false Whether the default click action should prevented.
             * @property {*} defaults.args=null Arguments to be used to invoke target method.
             */
            defaults: {
                target: '',
                type: 'toggle',
                args: null,
                switchedOff: false,
            },
            /**
             * @constructs
             * @classdesc Class component to create a button.
             * @name rb.components.button
             * @extends rb.Component
             * @param {Element} element
             * @example
             * ```html
             * <button type="button"
             *  data-module="button"
             *  class="js-rb-click"
             *  aria-controls="panel-1"
             *  data-button-type="open">
             *      click me
             * </button>
             * <div id="panel-1" data-module="panel"></div>
             * ```
             */
            init: function (element, initialDefaults) {

                this._super(element, initialDefaults);

                this._isFakeBtn = !this.element.matches('input, button');
                this._resetPreventClick = this._resetPreventClick.bind(this);

                rb.rAFs(this, {throttle: true}, '_switchOff', '_switchOn', '_setAriaControls');

                this.setOption('args', this.options.args);

                if (!this.options.switchedOff) {
                    this.setOption('switchedOff', false);
                }
            },

            events: {
                click: '_onClick',
                keydown: function (e) {
                    if (this.options.switchedOff) {
                        return;
                    }
                    var target;
                    var component = this.panelComponent ||
                        (target = this.getTarget()) && this.component(target);

                    if (component && e.keyCode == 40 && this.element.getAttribute('aria-haspopup') == 'true') {
                        if (!('isOpen' in component) || !component.isOpen) {
                            this._onClick(e);
                        } else {
                            component.setComponentFocus();
                        }
                        e.preventDefault();
                    } else {
                        this._delegateFakeClick(e);
                    }
                },
                keyup: '_delegateFakeClick',
            },
            _delegateFakeClick: function (e) {
                if (this.options.switchedOff) {
                    return;
                }
                if (this._isFakeBtn && (e.keyCode == 32 || e.keyCode == 13)) {
                    e.preventDefault();

                    if ((e.type == 'keyup' && e.keyCode == 32) || (e.type == 'keydown' && e.keyCode == 13)) {
                        this._onClick(e);
                        this._preventClick = true;
                        setTimeout(this._resetPreventClick, 33);
                    }
                }
            },
            _resetPreventClick: function () {
                this._preventClick = false;
            },
            _simpleFocus: function(){
                try {
                    if (this.element != document.activeElement) {
                        this.element.focus();
                    }
                } catch (e) {}
            },
            _onClick: function (e) {
                var args;
                if (this.options.switchedOff || this._preventClick || this.element.disabled) {
                    return;
                }
                var target = this.getTarget();
                var component = target && this.component(target);

                if (!component) {
                    return;
                }

                if (e && this.options.preventDefault && e.preventDefault) {
                    e.preventDefault();
                }

                if (this.options.type in component) {
                    args = this.args;

                    this._simpleFocus();

                    component.activeButtonComponent = this;
                    if (typeof component[this.options.type] == 'function') {
                        component[this.options.type].apply(component, args);
                    } else {
                        component[this.options.type] = args;
                    }
                }
            },

            setOption: function (name, value) {
                this._super(name, value);

                switch (name) {
                    case 'target':
                        this._setTarget(value);
                        break;
                    case 'args':
                        if (value == null) {
                            value = [];
                        } else if (!Array.isArray(value)) {
                            value = [value];
                        }
                        this.args = value;
                        break;
                    case 'switchedOff':
                        if (value) {
                            this._switchOff();
                        } else {
                            this._switchOn();
                        }

                        break;
                }
            },
            _switchOff: function () {
                if (this._isFakeBtn) {
                    this.element.removeAttribute('role');
                    this.element.removeAttribute('tabindex');
                }
            },
            _switchOn: function () {
                if (this._isFakeBtn) {
                    this.element.setAttribute('role', 'button');
                    this.element.setAttribute('tabindex', '0');
                }
            },
            _setAriaControls: function () {
                if(this.target){
                    this.$element.attr({'aria-controls': this.getId(this.target)});
                }
            },

            /**
             * Changes/sets the target element.
             * @param {Element|String} [element]
             */
            _setTarget: function (element) {
                if(!element){
                    element = this.options.target;
                }

                if(!element &&  !this.options.target){
                    element = this.element.getAttribute('aria-controls');
                }

                this.target = (typeof element == 'string') ?
                    this.getElementsByString(element)[0] :
                    element
                ;

                this.targetAttr = element;

                this._setAriaControls();
            },

            /**
             * Returns the current target component of the button
             * @returns {Element}
             */
            getTarget: function () {
                var target = this.options.target || this.element.getAttribute('aria-controls');

                if (!this.target || (target != this.targetAttr && target)) {
                    this._setTarget();
                }

                return this.target;
            },
        },
        true
    );

})(window, document);

(function () {
    if (typeof module === 'object' && module.exports) {
        module.exports = window.rb;
    }
})();


