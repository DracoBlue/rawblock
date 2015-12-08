(function (factory) {
	if (typeof module === 'object' && module.exports) {
		module.exports = factory();
	} else {
		factory();
	}
}(function() {
	'use strict';
	var rb = window.rb;

	var Panel = rb.Component.extend('panel',
		/** @lends rb.components.panel.prototype */
		{
			/**
			 * @static
			 * @mixes rb.Component.defaults
			 * @property {Object} defaults
			 * @property {String} defaults.animation='' Predefined animation: 'slide'. These should be combined with CSS transitions or animations.
			 * @property {String} defaults.easing='' CSS Easing function for the animation.
			 * @property {Number} defaults.duration=400 Duration of the animation.
			 * @property {Boolean} defaults.setFocus=true Whether the component should set the focus on open.
			 * @property {Boolean} defaults.closeOnOutsideClick=false Whether the component should be closed, if clicked outside the component.
			 * @prop {Boolean} defaults.switchedOff=false Turns off panel.
			 * @prop {Boolean} defaults.resetSwitchedOff=true Resets panel to initial state on reset switch.
			 */
			defaults: {
				animation: '', // || 'slide'
				duration: 400,
				easing: '',
				setFocus: true, // true || false
				closeOnOutsideClick: false,
				resetSwitchedOff: true,
				switchedOff: false,
			},
			/**
			 * @constructs
			 * @classdesc Class component to create a panel. The visibility should be handled using CSS. The component mainly toogles the class `is-open`.
			 * @name rb.components.panel
			 * @extends rb.Component
			 * @param element {Element}
			 *
			 * @fires moduleName#change Fires before a panel's `isOpen` state changes. The default behavior can be prevented.
			 * @fires moduleName#changed Fires after a panel's `isOpen` state changed.
			 *
			 * @property {Boolean} isOpen
			 *
			 * @example
			 * <button aria-controls="panel-1" data-module="button" type="button" class="js-click">button</button>
			 * <div id="panel-1" data-module="panel">
			 *    {{panelContent}}
			 * </div>
			 * @example
			 * rb.$('.rb-panel').rbComponent().open();
			 * rb.$('.rb-panel').on('panelchanged', function(){
			 *      console.log(rb.$(this).rbComponent().isOpen);
			 * });
			 */
			init: function(element){
				this._super(element);

				this.isOpen = this.element.classList.contains('is-open');

				this.isDefaultOpen = this.isOpen;

				this._onBodyClick =  this._onBodyClick.bind(this);

				this._opened = rb.rAF(this._opened, {throttle: true});
				this._closed = rb.rAF(this._closed, {throttle: true});

				this._switchOn = rb.rAF(this._switchOn, {throttle: true});
				this._switchOff = rb.rAF(this._switchOff, {throttle: true});

				this.setOption('easing', this.options.easing);

				if(!this.options.switchedOff){
					this.setOption('switchedOff', false);
				}
			},
			events: {
				'click .{name}-close': function(e){
					this.close();
					if(e){
						e.stopImmediatePropagation();
						e.preventDefault();
					}
				}
			},
			_switchOff: function(){
				this.element.removeAttribute('aria-hidden');
				this.element.removeAttribute('role');
				this.element.removeAttribute('tabindex');

				if(this.options.resetSwitchedOff){
					this.isOpen = this.isDefaultOpen;
				}

				if(!this.isDefaultOpen){
					this.element.classList.remove('is-open');
				}

				this.$element.css({
					visibility: '',
					height: '',
					overflow: '',
					display: '',
				});
			},
			_switchOn: function(){
				if(this.isOpen){
					this.element.classList.add('is-open');
				}

				this.element.setAttribute('aria-hidden', ''+(!this.isOpen));
				this.$element.attr({'role': 'group', tabindex: '-1'});
			},
			_onBodyClick: function(e){
				var that;
				if(!this.isOpen && !this.options.closeOnOutsideClick || !rb.root.contains(this.element)){
					this.teardownFocusEvents();
					return;
				}
				if(e.target != this.element && !this.element.contains(e.target)){
					that = this;
					this._closeTimer = setTimeout(function(){
						that.close();
					}, 44);
				}
			},
			setupFocusEvents: function(){
				this.teardownFocusEvents();
				document.body.addEventListener('click', this._onBodyClick);
			},
			teardownFocusEvents: function(){
				clearTimeout(this._closeTimer);
				document.body.addEventListener('click', this._onBodyClick);
			},
			setOption: function(name, value){
				this._super(name, value);

				if(name == 'easing' && value && typeof value == 'string'){
					rb.addEasing(value);
				} else if(name == 'switchedOff'){
					if(value){
						this._switchOff();
					} else {
						this._switchOn();
					}
				}
			},
			_handleAnimation: function(e){
				var $panel, animationComponent, animation, animationOptions;
				var panel = this;

				if(e.isDefaultPrevented() || !e.detail || e.detail.animationPrevented){return;}

				$panel = this.$element;

				if(panel.options.animation){
					animationComponent = this;
				} else if(this.options.animation !== false && this.groupComponent){
					animationComponent = this.groupComponent;
				}

				if(!animationComponent){return;}

				animation = animationComponent.options.animation;
				animationOptions = {
					duration: animationComponent.options.duration,
					easing: animationComponent.options.easing
				};

				switch (animation){
					case 'slide':
						$panel.stop();
						if(panel.isOpen){
							if(panel.groupComponent && panel.groupComponent.adjustScroll){
								panel.groupComponent.adjustScroll(panel, animationOptions);
							}
							$panel.rbSlideDown(animationOptions);
						} else {

							$panel.rbSlideUp(animationOptions);
						}
						break;
					case 'adaptHeight':
						if(panel.isOpen && panel.groupComponent && panel.groupComponent.animateWrapper){
							panel.groupComponent.animateWrapper(panel.element);
						}
				}

				return {animation: animation, options: animationOptions, event: e};
			},
			/**
			 * Opens the panel
			 * @param {Object} [options] Options are also dispatched with the event.detail property.
			 * @param {Boolean} [options.animationPrevented] If `true` panel opens without animation.
			 * @param {Boolean} [options.setFocus] Overrides the general `setFocus` option of the component instance.
			 * @returns {boolean}
			 * @example
			 * //opens a panel without animation and without setting focus.
			 * rb.$('.rb-panel').rbComponent().open({animationPrevented: true, setFocus: false});
			 */
			open: function(options){
				if(this.isOpen){
					return false;
				}
				var changeEvent = this._trigger(this._beforeEvtName, options);

				if(changeEvent.isDefaultPrevented()){return false;}

				if(this.groupComponent){
					this.groupComponent.panelChangeCB(this, 'beforeopen');
				}

				clearTimeout(this._closeTimer);

				this.isOpen = true;
				this._handleAnimation(changeEvent);
				this._opened(options);
				return true;
			},
			_opened: function(options){
				var mainOpts = this.options;
				var delay = (mainOpts.animation && mainOpts.duration) ||
					(this.groupComponent && this.groupComponent.options.animation && this.groupComponent.options.duration)
				;
				this.element.classList.add('is-open');
				this.element.setAttribute('aria-hidden', 'false');

				if(this.groupComponent){
					this.groupComponent.panelChangeCB(this, 'afteropen');
				}

				if((!options || options.setFocus !== false) && (mainOpts.setFocus || (options && options.setFocus))){
					this.setComponentFocus(delay || 0);
				}
				clearTimeout(this._closeTimer);
				if(this.options.closeOnOutsideClick){
					this.setupFocusEvents();
				}

				this._trigger();
			},

			/**
			 * Toogles the panel
			 * @param {Object} [options] Options are also dispatched with the event.detail property.
			 * @returns {boolean}
			 * @example
			 * rb.$('.rb-panel').rbComponent().toggle();
			 */
			toggle: function(options){
				return this[this.isOpen ? 'close' : 'open'](options);
			},

			/**
			 * Closes the panel
			 * @param {Object} [options] Options are dispatched with the event.detail property.
			 * @param {Boolean} [options.animationPrevented] If `true` panel closes without animation.
			 * @returns {boolean}
			 * @example
			 * rb.$('.rb-panel').rbComponent().close();
			 */
			close: function(options){
				if(!this.isOpen){
					return false;
				}
				var changeEvent = this._trigger(this._beforeEvtName, options);

				if(changeEvent.isDefaultPrevented()){return false;}

				if(this.groupComponent){
					this.groupComponent.panelChangeCB(this, 'beforeclose');
				}

				this.isOpen = false;

				this._handleAnimation(changeEvent);

				this._closed(options);
				clearTimeout(this._closeTimer);
				return true;
			},
			_closed: function(options){
				this.element.classList.remove('is-open');
				this.element.setAttribute('aria-hidden', 'true');
				if(this.groupComponent){
					this.groupComponent.panelChangeCB(this, 'afterclose');
				}
				this._trigger();
				clearTimeout(this._closeTimer);
				if(this.options.closeOnOutsideClick){
					this.teardownFocusEvents();
				}

				if(this.options.setFocus || (options && options.setFocus)){
					this.restoreFocus(true);
				}
			},
		}
	);


	rb.components.button.extend('panelbutton',
		/** @lends rb.components.panelbutton.prototype */
		{
			defaults: {},
			/**
			 * @constructs
			 * @classdesc Class component to create a panelbutton. A panelbutton controls the state of a panel the same way an ordinary button does. Additionally the panelbutton associates with the panel and reflects it's state via an aria-expanded attribute.
			 * @name rb.components.panelbutton
			 * @extends rb.components.button
			 * @param element {Element}
			 *
			 * @example
			 * <button data-target="next(.rb-panel)" data-module="panelbutton" type="button" class="js-click">button</button>
			 * <div class="rb-panel" data-module="panel">
			 *    {{panelContent}}
			 * </div>
			 */
			init: function(element){
				this._super(element);

				this.updatePanelButtonState = rb.rAF(this.updatePanelButtonState, {that: this, throttle: true});
			},
			updatePanelButtonState: function(){
				var isOpen = this.panelComponent.isOpen;
				var disable = !!(isOpen &&
					this.panelComponent.groupComponent &&
					this.panelComponent.groupComponent.options.toggle === false);

				this.element.setAttribute('aria-expanded', '' + isOpen);

				this.element.disabled = disable;

				if(this._isFakeBtn){
					this.element.setAttribute('aria-disabled', disable);
					this.element.setAttribute('tabindex', disable ? -1 : 0);
				}

			},
			_switchOff: function(){
				this._super();

				this.element.removeAttribute('aria-expanded');

				if(this._isFakeBtn){
					this.element.removeAttribute('role');
					this.element.removeAttribute('tabindex');
					this.element.removeAttribute('aria-disabled');
				}
			},
			_switchOn: function(){
				this._super();
				if(!this.panelComponent){
					this.associatePanel();
					this._isTargeting = true;
					this._setTarget();
				} else {
					this.updatePanelButtonState();
				}
			},
			setTarget: function(){
				var ret = this._super.apply(this, arguments);
				this.associatePanel();
				return ret;
			},
			associatePanel: function(){
				var panelComponent;
				var panel = this.getTarget();

				if(!panel || !(panelComponent = this.component(panel)) || !('isOpen' in panelComponent) || this.panelComponent == panelComponent){return;}

				if(this.panelComponent){
					if(this.panelComponent.buttonComponent == this){
						this.panelComponent.buttonComponent = null;
					}
					this.panelComponent.$element.off(this.panelComponent._evtName, this.updatePanelButtonState);
				}

				this.panelComponent = panelComponent;
				panelComponent.buttonComponent = this;
				panelComponent.$element.on(this.panelComponent._evtName, this.updatePanelButtonState);

				this.updatePanelButtonState();
			},
		}
	);
	return Panel;
}));