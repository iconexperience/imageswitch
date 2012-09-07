// ImageSwitch v0.1b - jQuery Plugin for effects to switch from one image to another
// (c) 2012 Incors GmbH
// License: http://www.opensource.org/licenses/mit-license.php

(function($) {
	Incors = (typeof Incors !== "undefined") ? Incors : {};
	
	Incors.Util = $.extend(Incors.Util || {}, {
		emptyFunction: function() {},
		
		fisherYates: function(myArray, options) {
			options = $.extend({}, options, {
				clone: true
			}, {});
			
			targetArray = options.clone ? myArray.slice() : myArray;
			
			var i = targetArray.length;
			if (i == 0) return false;
			
			while (--i) {
				var j = Math.floor(Math.random() * ( i + 1 ));
				var tempi = targetArray[i];
				var tempj = targetArray[j];
				targetArray[i] = tempj;
				targetArray[j] = tempi;
			}
			return targetArray;
		}
	});

	Incors.ImageSwitch = function(elems, options, callback) {
	  this.elems = elems;
		
		this.animationQueues = {};
		this.transformations = {};
		this.sequenceIntervals = {};
		
		this.lastActions = {};
		
		options = options ? options : {};
		
		this.selectors = options.selectors ? options.selectors : {
			imgBottom: "img:first, .imageBottom",
			imgTop: "img:last, .imageTop"
		};
		this.switchBottomImage = options.switchBottomImage ? options.switchBottomImage : false;
			
		this._init(this.elems, options, callback, false);
	};
	
	Incors.ImageSwitch.prototype = {
		init: function(options, callback) {
		  this._init(this.elems, options, callback, false)
			return this;
		},
		
		_init: function(elems, options, callback, startInstantly) {
			callback = callback || Incors.Util.emptyFunction;
			var $this = this;
			this._wait_for_animations_finished('options', elems, function(triggerNextAnimation) {
				if (typeof $this.options == 'undefined') {
					$this.options = $.extend({}, Incors.ImageSwitch.options, options || {});
				} else {
					$.extend($this.options, options || {});
				}
			
				$.each(elems, function(i, elem) {
					if (typeof elem._displayTopImg == 'undefined') {
						elem._displayTopImg = true;
					}
				});
				callback();
				triggerNextAnimation();
			}, startInstantly, options);
		},
		
		hover: function(options) {
		  this._hover(this.elems, options);
			return this;
		},
		
		_hover: function(elems, options) {
		 	var $this = this;
			this.hoverOverCount = 0;
			
			options = $.extend({
				stop: false,
				onStartHoverOver: Incors.Util.emptyFunction,
				onFinishHoverOver: Incors.Util.emptyFunction,
				onStartHoverOut: Incors.Util.emptyFunction,
				onFinishHoverOut: Incors.Util.emptyFunction,
				onAllFinishHoverOut: Incors.Util.emptyFunction,
				hoverSelector: null,
				hoverSelectorDirectionUp: true,
				switchHoverOverElem: 'bottom', // bottom, top, toggle, blink, null
				switchHoverOutElem: 'top', // bottom, top, toggle, blink, null
				switchNonHoverOverElems: 'top', // bottom, top, toggle, blink, null
				switchNonHoverOutElems: null, // bottom, top, toggle, blink, null
				stopOnHoverOut: true
			}, options);

			var getHoverElems = function(elems) {
				if (options.hoverSelector) {
					if (options.hoverSelectorDirectionUp) {
						return elems.closest(options.hoverSelector);
					} else {
						return elems.find(options.hoverSelector);
					}
				}
				return elems;
			};
			
			var stop = function() {
				if ($this.onHoverOver) {
					if (options.hoverSelector) {
						elems.each(function() {
							var elem = this;
							getHoverElems($(elem)).unbind('mouseenter', elem.onHoverOver).bind('mouseleave', elem.onHoverOut);
						});
					} else {
						elems.unbind('mouseenter', $this.onHoverOver).unbind('mouseleave', $this.onHoverOut);
					}
					$this.onHoverOver = null;
					$this.onHoverOut = null;
					return true;
				} else {
					return false;
				}
			};
			
			stop();
			
			if (options.stop) {
				return;
			}
			
			var transform = function(elems, action, callBack, startInstantly, stop) {
				if (action == 'top') {
					$this._transformToTop(elems, options, callBack, startInstantly);
				} else if (action == 'bottom') {
					$this._transformToBottom(elems, options, callBack, startInstantly);
				} else if (action == 'toggle') {
					$this._toggle(elems, options, callBack, startInstantly, stop);
				}	else if (action == 'blink') {
					$this._blink(elems, options, callBack, startInstantly, stop);
				}
			};
			
			this.onHoverOver = function(event) {
				var elem = this;
				$this.hoverOverCount++;
				$this.lastHoverElem = elem;
				
				var lastAction = $this.lastActions[$this._optionsQueue(options)];
				if (lastAction != 'hover') {
					$this.stop();
				}
				options.onStartHoverOver(elem);
				
				others = $.grep(elems, function(otherElem) {
					return elem != otherElem;
				});
				
				var callback = function() {
					options.onFinishHoverOver(elem);
				};
				
				transform($(this), options.switchHoverOverElem, callback, true, true);
				if (lastAction != 'hover' && lastAction != 'options') {
					transform($(others), options.switchNonHoverOverElems, null, true, true);
				}
				$this.lastActions[$this._optionsQueue(options)] = 'hover';
				
				lastAction = $this.lastActions[$this._optionsQueue(options)];
			};
			
			this.onHoverOut = function(event) {
				var elem = this;
				$this.hoverOverCount--;
				options.onStartHoverOut(elem);
				
				var callback = function() {
					options.onFinishHoverOut(elem);
					if ($this.hoverOverCount == 0 && $this.lastHoverElem == elem) {
						options.onAllFinishHoverOut();
					}
				};
				
				transform($(this), options.switchHoverOutElem, callback, options.stopOnHoverOut, options.stopOnHoverOut);
			};
	
			if (options.hoverSelector) {
				elems.each(function() {
					var elem = this;
					elem.onHoverOver = $.proxy($this.onHoverOver, elem);
					elem.onHoverOut = $.proxy($this.onHoverOut, elem);
					getHoverElems($(elem)).bind('mouseenter', elem.onHoverOver).bind('mouseleave', elem.onHoverOut);
				});
			} else {
				elems.bind('mouseenter', this.onHoverOver).bind('mouseleave', this.onHoverOut);
			}
		},
		
		stop: function(options) {
			var $this = this;
			var queue = this._optionsQueue(options);
			var animationQueue = this.animationQueues[queue] || [];
			
			this.elems.queue($.grep(this.elems.queue(queue), function(value) {
				return $.inArray(value, animationQueue) == -1;
			}));
			
			this.animationQueues[queue] = [];
			this.elems.dequeue(queue);
			
			this._stopSequelInterval(options);
			
			this._getImgsTop(this.elems).stop(true, false);
			
			return this;
		},
		
		toggle: function(options, callback) {
			if (typeof options == 'function') {
				return this.toggle(null, options);
			}
			$this = this;
			this._cycle(options, function(callback) {
				if ($this._sequence('toggle', $this.elems, options, 
					function(elem, options, callback) {
						$this._toggle(elem, options, callback, true, false);
					}, callback)) {
				} else {
					$this._toggle($this.elems, options, callback, false, false);
				}
			}, callback);
			
			return this;
		},
		
		_toggle: function(elems, options, callback, startInstantly, stop) {
			callback = callback || Incors.Util.emptyFunction;
			var $this = this;
			
			this._wait_for_animations_finished('toggle', elems, function(triggerNextAnimation) {
				var toBottomElems = Incors.ImageSwitch.topElems(elems);
				var toTopElems = Incors.ImageSwitch.bottomElems(elems);
				
				var doneCalls = 0;
				var done = function() {
					if (++doneCalls == 2) {
						callback();
						triggerNextAnimation();
					}
				};
				
				$this._transformToBottom(toBottomElems, options, done, stop);
				$this._transformToTop(toTopElems, options, done, stop);
			}, startInstantly, options);
		},
		
		_cycle: function(options, func, callback) {
			options = $.extend({}, {
				cycle: false,
				cyclePauseDuration: 2000,
				onStartCycle: Incors.Util.emptyFunction,
				onFinishCycle: Incors.Util.emptyFunction
			}, options || {});
			$this = this;
			if (options.cycle) {
				options.onStartCycle();
				func(function() {
					options.onFinishCycle();
					window.setTimeout(function() {
						$this._cycle(options, func);
					}, options.cyclePauseDuration);
				});
			} else {
				func(callback);
			}
		},
		
		/*
			Description: 
		
			.blink([callback])
			.blink([options][, callback])
		*/
		blink: function(options, callback) {
			if (typeof options == 'function') {
				return this.blink(null, options);
			}
			$this = this;
			this._cycle(options, function(callback) {
				$this._blink($this.elems, options, callback, false);
			}, callback);
			
			return this;
		},
		
		_blink: function(elems, options, callback, startInstantly, stop) {
			callback = callback || Incors.Util.emptyFunction;
			var $this = this;
			
			if (this._sequence('blink', elems, options, 
				function(elem, options, callback) {
					$this._blink(elem, options, callback, true);
				},callback)) {
				return;
			}
			
			this._wait_for_animations_finished('blink', elems, function(triggerNextAnimation) {
				options = $this._extendSwitchOptions(options);
				
				options = $.extend({}, {
					pauseDuration: 0
				}, options);
	
				var switch1Options = options.switch1Options ? $.extend({}, options, options.switch1Options) : options;
				var switch2Options = options.switch2Options ? $.extend({}, options, options.switch2Options) : options;
				
				$this._toggle(elems, switch1Options, null, true, stop);
				$this._delay(elems, options.pauseDuration);
				$this._toggle(elems, switch2Options, function() {
					callback();
					triggerNextAnimation();
				}, true, false);
			}, startInstantly, options);
		},
		
		top: function(options, callback) {
			if (typeof options == 'function') {
				return this.top(null, options);
			}
			var $this = this;
			if (this._sequence('top', this.elems, options,
				function(elem, options, callback) {
					$this._top(elem, options, callback, true);
				}, callback)) {
			} else {
				this._top($this.elems, options, callback, false);
			}
			return this;
		},
		
		_top: function(elems, options, callback, startInstantly) {
			callback = callback || Incors.Util.emptyFunction;
			var $this = this;
			this._wait_for_animations_finished('top', elems, function(triggerNextAnimation) {
				$this._transformToTop(elems, options, function() {
					triggerNextAnimation();
					callback();
				});
			}, startInstantly, options);
		},
		
		bottom: function(options, callback) {
			if (typeof options == 'function') {
				return this.bottom(null, options);
			}
			var $this = this;
			if (this._sequence('bottom', this.elems, options, 
				function(elem, options, callback) {
					$this._bottom(elem, options, callback, true);
				}, callback)) {
			} else {
				this._bottom(this.elems, options, callback, false);
			}
			return this;
		},
		
		_bottom: function(elems, options, callback, startInstantly) {
			callback = callback || Incors.Util.emptyFunction;
			var $this = this;
			this._wait_for_animations_finished('bottom', elems, function(triggerNextAnimation) {
				$this._transformToBottom(elems, options, function() {
					triggerNextAnimation();
					callback();
				});
			}, startInstantly, options);
		},
		
		_delay: function(elems, duration) {
			if (this.switchBottomImage) {
				this._getImgsBottom(elems).delay(duration);
			}
			this._getImgsTop(elems).delay(duration);
		},
		
		_sequence: function(action, elems, options, transformation, callback) {
			if (options && options.sequence) {
				var sequenceOptions = options.sequence;
				
				options = $.extend({}, options, { sequence: null });
				
				callback = callback || Incors.Util.emptyFunction;
				var $this = this;
				
				if (elems.length != 0) {
					this._wait_for_animations_finished(action, elems, function(triggerNextAnimation) {
						options = $this._extendSwitchOptions(options);
						
						sequenceOptions = $.extend({}, {
							interval: options.duration,
							onStartSequenceStep: Incors.Util.emptyFunction,
							onFinishSequenceStep: Incors.Util.emptyFunction,
							order: 'forward', // forward, reverse, random
						}, sequenceOptions || {});
						
						if (sequenceOptions == true || sequenceOptions.order == 'forward') {
							// nothing
						} else if (sequenceOptions.order == 'reverse') {
							elems = elems.slice(0);
							elems = $.makeArray(elems).reverse();
						} else if (sequenceOptions.order == 'random') {
							elems = Incors.Util.fisherYates(elems);
						} else {
							$.error('unknown sequence option order value: ' + sequenceOptions.order);
						}
								
						$this._startSequelInterval(elems, options, sequenceOptions, transformation, triggerNextAnimation, callback);
					}, false, options);
				}
				return true;
			} else {
				return false;
			}
		},
		
		_startSequelInterval: function(elems, options, sequenceOptions, transformation, triggerNextAnimation, callback) {
			var $this = this;
			
			var i = 0;
			var intervalFunction = function() {
				var elem = $(elems[i++]);
				sequenceOptions.onStartSequenceStep(elem);
				if (i == elems.length) {
					$this._stopSequelInterval(options);
				
					transformation(elem, options, function() {
						sequenceOptions.onFinishSequenceStep(elem);
						triggerNextAnimation();
						callback();
					});
				} else {
					transformation(elem, options, function() { sequenceOptions.onFinishSequenceStep(elem); });
				}
			}
				
			intervalFunction();
			this.sequenceIntervals[this._optionsQueue(options)] = window.setInterval(intervalFunction, sequenceOptions.interval);
		},
		
		_stopSequelInterval: function(options) {
			var queue = this._optionsQueue(options);
			window.clearInterval(this.sequenceIntervals[queue]);
			this.sequenceIntervals[queue] = null;	
		},
		
		_wait_for_animations_finished: function(action, elems, callback, startInstantly, options) {
			var queue = this._optionsQueue(options);
			if (!(this.animationQueues[queue])) {
				this.animationQueues[queue] = [];
			}
			var animationQueue = this.animationQueues[queue];
			var $this = this;
			var i = 0;
			if (startInstantly) {
				callback(function() {});
			} else {
				var queueFunction = function() {
					if (++i == elems.length) {
						$this.lastActions[queue] = action;
						callback(function() {
							elems.dequeue(queue);
							animationQueue.shift();
						});
					}
				};
				elems.queue(queue, queueFunction);
				animationQueue.push(queueFunction);
			}
		},
		
		_stop: function(elems) {
			if (this.switchBottomImage) { 
				this._getImgsBottom(elems).stop(true, false);
			}
			this._getImgsTop(elems).stop(true, false);
		},
		
		
		_transformToTop: function(elems, options, callback, stop) {
			this._transform(elems, options, true, stop, callback);
		},
		
		_transformToBottom: function(elems, options, callback, stop) {
			this._transform(elems, options, false, stop, callback);
		},
		
		_transform: function(elems, options, top, stop, callback) {
			var callback = callback || Incors.Util.emptyFunction;
			var $this = this;
			
			options = $this._extendSwitchOptions(options);
			
			if (stop) {
				this._stop(elems);
			}
			
			if (elems.length == 0) {
				callback();
				return;
			}
			
			var transformation = this._transformation(options.transformation);
			
			$.each(elems, function(i, elem) {
				elem._displayTopImg = top;
				if (options.transformation != elem._transformation) {
					if (elem._transformation) {
						$this._transformation(elem._transformation).reset($(elem), !(top));
					}
					transformation.init($(elem), !(top));
					elem._transformation = options.transformation;
				}	
			});
			
			transformation.transform(elems, options, top, stop, callback);
		},
		
		_transformation: function(transformationName) {
			var transformation = this.transformations[transformationName];
			if (!(transformation)) {
				transformation = new Incors.ImageSwitch.Transformations[transformationName](this);
				this.transformations[transformationName] = transformation;
			}
			return transformation;
		},
		
		_getImgsBottom: function(elems) {
			if (!(elems.imgsBottom)) {
				elems.imgsBottom = $(elems).find(this.selectors.imgBottom);
			}
			return elems.imgsBottom;
		},
		
		_getImgsTop: function(elems) {
			if (!(elems.imgsTop)) {
				elems.imgsTop = $(elems).find(this.selectors.imgTop);
			}
			return elems.imgsTop;
		},
		
		_extendSwitchOptions: function(options) {
			return $.extend({}, this.options, options || {});
		},
		
		_optionsQueue: function(options) {
			return options && options.queue ? options.queue : 'fx';
		}
	};
	
	Incors.ImageSwitch.Transformations = {
		fade: function(imageSwitcher) {
			this.imageSwitcher = imageSwitcher;
		},
		
		slide: function(imageSwitcher) {
			this.imageSwitcher = imageSwitcher;
			
			var height = null;
			var width = null;
			
			$.each(imageSwitcher.elems, function(i, elem) {
				elem._slideHeight = $(elem).height();
				elem._slideWidth = $(elem).width();
			});
		}
	};
	
	Incors.ImageSwitch.Transformations.slide.prototype = {
		transform: function(elems, options, top, stop, callback) {
			var options = $.extend({}, {
				slideFrom: 'bottom', // bottom, left
			}, options);
			
			var imageSwitcher = this.imageSwitcher;
			var easing = options.easing;
			
			var i = 0;
			var animationNum = 0;
			var done = function() {
				if (++i == animationNum) {
					callback();
				}
			};
			
			$.each(elems, function(i, elem) {
				if (imageSwitcher.switchBottomImage) {
					animationNum++;
					var imgBottom = imageSwitcher._getImgsBottom(elem);
					if (top) {
						imgBottom.animate({ height: elem._slideHeight + 'px' }, options.duration, easing, done);
					} else {
						imgBottom.animate({ height: '0px' }, options.duration, easing, done);
					}
				}
				animationNum++;
				var imgTop = imageSwitcher._getImgsTop(elem);
				if (top) {
					imgTop.animate({ height: elem._slideHeight + 'px' }, options.duration, easing, done);
				} else {
					imgTop.animate({ height: '0px' }, options.duration, easing, done);
				}
			});
		},
		
		init: function(elems, top) {
			var imageSwitcher = this.imageSwitcher;
			$.each(elems, function(i, elem) {
				var imgBottom = imageSwitcher._getImgsBottom(elem);
				var imgTop = imageSwitcher._getImgsTop(elem);
				if (top) {
					if (imageSwitcher.switchBottomImage) {
						imgBottom.height(0).show();
					}
				} else {
					imgTop.height(0).show();
				}
			});
		},
		
		reset: function(elems, top) {
			var imageSwitcher = this.imageSwitcher;
			$.each(elems, function(i, elem) {
				var imgBottom = imageSwitcher._getImgsBottom(elem);
				var imgTop = imageSwitcher._getImgsTop(elem);
				if (top) {
					imgTop.show().height(elem._slideHeight);
					if (imageSwitcher.switchBottomImage) {
						imgBottom.hide().height(elem._slideHeight);
					}
				} else {
					imgTop.hide().height(elem._slideHeight);
					if (imageSwitcher.switchBottomImage) {
						imgBottom.show().height(elem._slideHeight);
					}
				}
			});
		}
	};
	
	Incors.ImageSwitch.Transformations.fade.prototype = {
		transform: function(elems, options, top, stop, callback) {
			var imageSwitcher = this.imageSwitcher;
			
			var i = 0;
			var animationNum = elems.length;
			var done = function() {
				if (++i == animationNum) {
					callback();
				}
			};
			
			var easing = options.easing;
			if (imageSwitcher.switchBottomImage) {
				animationNum += elems.length;
				var fadeBottomTo = top ? 0 : 1;
				var imgBottom = imageSwitcher._getImgsBottom(elems);
				imgBottom.fadeTo(options.duration, fadeBottomTo, easing, done);
			}
			var fadeTopTo = top ? 1 : 0;
			var imgTop = imageSwitcher._getImgsTop(elems);
			imgTop.fadeTo(options.duration, fadeTopTo, easing, done);
		},
		
		init: function(elems, top) {
			var imageSwitcher = this.imageSwitcher;
			if (top) {
				if (imageSwitcher.switchBottomImage) {
					imageSwitcher._getImgsBottom(elems).css({ opacity: 0 }).show();
				}
			} else {
				imageSwitcher._getImgsTop(elems).css({ opacity: 0 }).show();
			}
		},
		
		reset: function(elems, top) {
			var imageSwitcher = this.imageSwitcher;
			if (top) {
				imageSwitcher._getImgsTop(elems).show().css({ opacity: 1 });
				if (imageSwitcher.switchBottomImage) {
					imageSwitcher._getImgsBottom(elems).hide().css({ opacity: 1 });
				}
			} else {
				imageSwitcher._getImgsTop(elems).hide().css({ opacity: 1 });
				if (imageSwitcher.switchBottomImage) {
					imageSwitcher._getImgsBottom(elems).show().css({ opacity: 1 });
				}
			}
		}
	};
	
	// static variables and methods
	
	$.extend(Incors.ImageSwitch, {
		options: {
			transformation: 'fade', // fade, slide
			duration: 1000, // time in milliseconds
			easing: 'linear'
		},
		
		methods: {
			init: true,
			stop: true,
			hover: true,
			top: true,
			bottom: true,
			toggle: true,
			blink: true
		},
	
		topElems: function(elems) {
			var topElems = [];
			$(elems).each(function(i, elem) {
				if (elem._displayTopImg) {
					//if (changeState) {
					//	elem._displayTopImg = false;
					//}
					topElems.push(elem);
				}
			});
			return topElems;
		},
		
		bottomElems: function(elems) {
			var bottomElems = [];
			$(elems).each(function(i, elem) {
				if (!(elem._displayTopImg)) {
					//if (changeState) {
					//	elem._displayTopImg = true;
					//}
					bottomElems.push(elem);
				}
			});
			return bottomElems;
		},
	});
	
	$.fn.imageSwitch = function(method) {
		// Method calling logic
		if ($.isPlainObject(method) || method == 'init') {
		  var args = method == 'init' ? Array.prototype.slice.call( arguments, 1) : arguments;
		  if (!(this._imageSwitcher)) {
				this._imageSwitcher = new Incors.ImageSwitch(this, args);
			} else {
				this._imageSwitcher.init(args);
			}			
		} else if (typeof method == 'string') {
			if (!(Incors.ImageSwitch.methods[method])) {
				$.error('Method "' + method + '" is not defined for plugin imageSwitcher');
				return;
			}
			if (!(this._imageSwitcher)) {
				this._imageSwitcher = new Incors.ImageSwitch(this);
			}
			this._imageSwitcher[method].apply(this._imageSwitcher, Array.prototype.slice.call( arguments, 1));
		} else {
			$.error( 'Method ' + method + ' does not exist for jQuery.imageSwitcher' );
		}
		return this;
	};
})(jQuery);