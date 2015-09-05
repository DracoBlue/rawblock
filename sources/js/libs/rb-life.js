(function(window, factory) {
	var life = factory(window, window.document);
	window.rbLife = life;
	if(typeof module == 'object' && module.exports){
		module.exports = life;
	}
}(typeof window != 'undefined' ? window : this , function(window, document) {
	'use strict';

	var elements, useMutationEvents, timer;
	var docElem = document.documentElement;

	var life = {};
	var removeElements = [];
	var initClass = 'js-rb-life';
	var attachedClass = 'js-rb-attached';
	var rb = window.rb;
	var $ = rb.$;

	window.rb.life = life;

	life.init = function(options){
		if (elements) {throw('only once');}
		clearTimeout(timer);

		if (options) {
			initClass = options.initClass || initClass;
			attachedClass = options.attachedClass || attachedClass;
			useMutationEvents = options.useMutationEvents || false;
		}

		life.initClass = initClass;

		elements = document.getElementsByClassName(initClass);

		life.batch = life.createBatch();

		life.initObserver();
		life.throttledFindElements();
	};

	life.camelCase = (function() {
		var reg = /-([\da-z])/gi;
		var camelCase = function(all, found) {
			return found.toUpperCase();
		};

		return function(str) {
			return str.replace(reg, camelCase);
		};
	})();

	life.parseValue = (function() {
		var regNumber = /^\-*\+*\d+\.*\d*$/;
		var regObj = /^\[.*\]|\{.*\}$/;
		return function( attrVal ) {

			if(attrVal == 'true'){
				attrVal = true;
			}
			else if(attrVal == 'false'){
				attrVal = false;
			}
			else if(regNumber.test(attrVal)){
				attrVal = parseFloat(attrVal);
			}
			else if(regObj.test(attrVal)){
				try {
					attrVal = JSON.parse( attrVal );
				} catch(e){}
			}
			return attrVal;
		};
	})();

	life.createBatch = function(){
		var runs;
		var batch = [];
		var run = function() {
			while ( batch.length ) {
				batch.shift()();
			}
			runs = false;
		};
		return {
			run: run,
			add: function( fn ) {
				batch.push( fn );
			},
			timedRun: function() {
				if ( !runs ) {
					runs = true;
					setTimeout( run );
				}
			}
		};
	};

	life._failed = {};
	life._behaviors = {};
	life._attached = [];

	life.register = function(name, LifeClass, noCheck) {

		life._behaviors[ name ] = LifeClass;

		if ( !noCheck ) {
			if(!elements && !timer){
				timer = setTimeout(life.init);
			}
			life.throttledFindElements();
		}
	};

	life.create = function(element, LifeClass) {
		var instance, trigger;
		if ( !element._rbWidget ) {
			instance = new LifeClass( element );
			trigger = true;
		}

		rb.rAFQueue.add(function(){
			element.classList.add( attachedClass );
		});

		if (!element._rbCreated && instance && (instance.attached || instance.detached || instance.attachedOnce)) {
			life._attached.push(element);

			if(instance.attached){
				life.batch.add(function() {
					instance.attached();
				});
			}
			if(instance.onceAttached){
				life.batch.add(function() {
					instance.onceAttached();
				});
			}
			life.batch.timedRun();
		}
		element._rbCreated = true;

		if(trigger){
			life.batch.add(function() {
				$(element).trigger(LifeClass.prototype.name +'created');
			});
		}
		return instance;
	};

	life.findElements = function() {
		var module, modulePath, moduleId, i;

		var len = elements.length;

		life.removeInitClass();

		for ( i = 0; i < len; i++ ) {
			module = elements[ i ];

			if(module._rbCreated){continue;}

			modulePath = module.getAttribute( 'data-module' ) || '';
			moduleId = modulePath.split( '/' );
			moduleId = moduleId[ moduleId.length - 1 ];

			if ( life._behaviors[ moduleId ] ) {
				life.create( module, life._behaviors[ moduleId ] );
				removeElements.push( module );
			}
			else if ( life._failed[ moduleId ] ) {
				removeElements.push( module );
			}
			else if ( modulePath && window.loadPackage ) {
				/* jshint loopfunc: true */
				(function (module, modulePath, moduleId) {
					loadPackage(modulePath).then(function () {
						if (!life._behaviors[ moduleId ]) {
							life._failed[ moduleId ] = true;
						}
					});
				})(module, modulePath, moduleId);
			}
			else {
				life._failed[ moduleId ] = true;
				removeElements.push(module);
			}
		}

		life.batch.run();
	};

	life.removeInitClass = rb.rAF(function(){
		while (removeElements.length) {
			removeElements.shift().classList.remove(initClass);
		}
	});

	life.throttledFindElements = (function() {
		var setImmediate = window.setImmediate || window.setTimeout;
		var requestAnimationFrame = window.requestAnimationFrame;
		var runs = false;
		var runImmediate = function() {
			runs = false;
			life.findElements();
		};
		var rAFRun = function() {
			setImmediate(runImmediate);
		};
		return function () {
			if ( !runs ) {
				runs = true;
				requestAnimationFrame( rAFRun );
			}
		};
	})();

	life.destroyWidget = function(instance, index){
		var element = instance.element;

		if(index == null){
			index = life._attached.indexOf(element);
		}
		element.classList.remove( attachedClass );

		if(element._rbCreated){
			delete element._rbCreated;
		}
		if ( instance.detached ) {
			instance.detached( element, instance );
		}

		life._attached.splice(index, 1);
	};

	life.initObserver = function() {
		var removeWidgets = function() {
			var i, len, instance, element;

			for(i = 0, len = life._attached.length; i < len; i++){
				element = life._attached[i];
				if( !docElem.contains(element) ){
					instance = element._rbWidget;

					element.classList.add( initClass );
					life.destroyWidget(instance, i);

					i--;
					len--;
				}
			}
		};

		var onMutation = function( mutations ) {
			var i, mutation;
			var len = mutations.length;

			for ( i = 0; i < len; i++ ) {
				mutation = mutations[ i ];
				if ( mutation.addedNodes.length ) {
					life.throttledFindElements();
				}
				if ( mutation.removedNodes.length ) {
					removeWidgets( mutation.removedNodes );
				}
			}
		};

		if ( !useMutationEvents && window.MutationObserver ) {
			new MutationObserver( onMutation )
				.observe( docElem, { subtree: true, childList: true } )
			;
		} else {
			docElem.addEventListener('DOMNodeInserted', life.throttledFindElements);
			document.addEventListener('DOMContentLoaded', life.throttledFindElements);
			docElem.addEventListener('DOMNodeRemoved', (function(){
				var mutation = {
					addedNodes: []
				};
				var mutations = [
					mutation
				];
				var run = function(){
					onMutation(mutations);
					mutation.removedNodes = false;
				};
				return function(e){
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

	return life;
}));

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
	var initializing = false;
	var fnTest = (/xyz/.test(function(){var a = xyz;})) ?
		/\b_super\b/ :
		/.*/
	;

	// The base Class implementation (does nothing)
	window.rb.life.Class = function(){};

	// Create a new Class that inherits from this class
	window.rb.life.Class.extend = function(prop) {
		var name, prototype, origDescriptor, copyDescriptor, descProp, superDescriptor;
		var _super = this.prototype;

		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		prototype = new this();
		initializing = false;

		// Copy the properties over onto the new prototype
		for (name in prop) {
			origDescriptor = Object.getOwnPropertyDescriptor(prop, name);
			if(!origDescriptor){continue;}

			superDescriptor = (name in _super && Object.getOwnPropertyDescriptor(_super, name));

			for(descProp in origDescriptor){
				// Check if we're overwriting an existing function and using super keyword
				origDescriptor[descProp] = superDescriptor && typeof origDescriptor[descProp] == "function" &&
					typeof superDescriptor[descProp] == "function" && fnTest.test(origDescriptor[descProp]) ?
					/* jshint loopfunc: true */
					(function(_superFn, fn){
						return function() {
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
					})(superDescriptor[descProp], origDescriptor[descProp]) :
					origDescriptor[descProp]
				;
			}

			Object.defineProperty(prototype, name, origDescriptor);
		}

		// The dummy class constructor
		function Class() {
			// All construction is actually done in the init method
			if ( !initializing && this.init )
				this.init.apply(this, arguments);
		}

		// Populate our constructed prototype object
		Class.prototype = prototype;

		// Enforce the constructor to be what we expect
		Class.prototype.constructor = Class;

		// And make this class extendable
		Class.extend = this.extend || window.rb.life.Class.extend;

		return Class;
	};
})();

(function(window, document, life, undefined){
	'use strict';

	var idIndex = 0;
	var regData = /^data-/;
	var $ = window.rb.$;

	life.getWidget = function(element, key, args){
		var ret, moduleId;
		var widget = element && element._rbWidget;

		if(!widget){
			moduleId = (element.getAttribute( 'data-module' ) || '').split( '/' );
			moduleId = moduleId[ moduleId.length - 1 ];

			if(life._behaviors[ moduleId ]){
				widget = life.create(element, life._behaviors[ moduleId ]);
			}
		}

		ret = widget;
		if(widget && key){
			ret = widget[key];

			if(typeof ret == 'function'){
				ret = ret.apply(widget, args || []);
			} else if(args !== undefined){
				widget[key] = args;
				ret = undefined;
			}
		}
		return ret;
	};

	life.Widget = life.Class.extend({
		defaults: {},
		init: function(element){
			this.element = element;
			this.$element = $(element);
			this.options = {};

			this.parseOptions(this.options, this.constructor.defaults);

			this.setupLifeOptions();

			element._rbWidget = this;
		},
		widget: life.getWidget,
		setupLifeOptions: function(){
			var runs, runner, onResize;
			var old = {};
			var that = this;
			if (this.options.watchCSS) {
				old.attached = this.attached;
				old.detached = this.detached;
				runner = function() {
					runs = false;
					if(that._styleOptsStr != (getComputedStyle(that.element, '::after').getPropertyValue('content') || '')){
						that.parseOptions();
					}
				};
				onResize = function() {
					if(!runs){
						runs = true;
						setTimeout(runner, 33);
					}
				};

				this.attached = function(){
					window.addEventListener('resize', onResize);
					if(old.attached){
						return old.attached.apply(this, arguments);
					}
				};
				this.detached = function(){
					window.removeEventListener('resize', onResize);
					if(old.detached){
						return old.detached.apply(this, arguments);
					}
				};
			}

		},

		getId: function(element){
			var id = (element || this.element).id;
			if (!id) {
				idIndex++;
				id = 'rbjsid-' + idIndex;
				(element || this.element).id = id;
			}
			return id;
		},

		setFocus: function(elem){
			try {
				setTimeout(function(){
					$(elem).trigger('rbscriptfocus');
					elem.focus();
				}, 0);
			} catch(e){}
		},

		parseOptions: function(opts, defaults){
			var options = Object.assign(opts || {}, defaults || {}, this.parseCSSOptions() || {}, this.parseHTMLOptions());
			this.setOptions(options);
		},

		setOptions: function(opts){
			for(var prop in opts){
				if(opts[prop] != this.options[prop]){
					this.setOption(prop, opts[prop]);
				}
			}
		},

		setOption: function(name, value){
			this.options[name] = value;
		},

		parseHTMLOptions: function(element){
			var i, name;
			var options = {};
			var attributes = (element || this.element).attributes;
			var len = attributes.length;

			for ( i = 0; i < len; i++ ) {
				name = attributes[ i ].nodeName;
				if ( !name.indexOf( 'data-' ) ) {
					options[ life.camelCase( name.replace( regData , '' ) ) ] = life.parseValue( attributes[ i ].nodeValue );
				}
			}

			return options;
		},

		parseCSSOptions: function(element){
			var style = getComputedStyle(element || this.element, '::after').getPropertyValue('content') || '';
			if(style && (!this._styleOptsStr || style != this._styleOptsStr )){
				this._styleOptsStr = style;
				try {
					style = JSON.parse(style.replace(/^"*'*"*/, '').replace(/"*'*"*$/, '').replace(/\\"/g, '"'));
				} catch(e){
					style = false;
				}
			} else {
				style = false;
			}

			return style;
		},

		destroy: function(){
			life.destroyWidget(this);
		}
	});

	life.Widget.extend = function(name, prop){
		var Class;

		if(!prop.name){
			prop.name = name;
		}
		Class = life.Class.extend.call(this, prop);
		Class.defaults = prop.defaults || {};
		life.register(name, Class);
		return Class;
	};
})(window, document, rb.life);
