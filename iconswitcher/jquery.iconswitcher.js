// ImageSwitcher v1.0 - jQuery Plugin for effects to switch from one image to another
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

	Incors.ImageSwitcher = function(elems, options) {
		this.elems = elems;
		
		this.animationQueue = [];
		this.isOver = false; 
		this.animation = null;
		this.transformations = {};
		
		this._init(this.elems, options, null, false);
	};
	
	Incors.ImageSwitcher.prototype = {
		init: function(options, callback) {
		  this._init(this.elems, options, callback, false)
			return this;
		},
		
		_init: function(elems, options, callback, startInstantly) {
			callback = callback || Incors.Util.emptyFunction;
			var $this = this;
			this._wait_for_animations_finished(elems, function(triggerNextAnimation) {
				if (typeof $this.options == 'undefined') {
					$this.options = $.extend({}, Incors.ImageSwitcher.options, options || {});
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
			}, startInstantly);
		},
		
		hover: function(options) {
			this._hover(this.elems, options);
			return this;
		},
		
		_hover: function(elems, options) {
			var $this = this;
			
			options = $.extend({
				action: 'start', // start, stop
				onStartSwitchToTop: Incors.Util.emptyFunction,
				onEndSwitchToTop: Incors.Util.emptyFunction,
				onStartSwitchToBottom: Incors.Util.emptyFunction,
				onEndSwitchToBottom: Incors.Util.emptyFunction,
				hoverSelector: null,
				hoverSelectorDirectionUp: true, // up/down
			}, options);

			var getHoverElems = function(elems) {
				if (options.hoverSelector) {
					if (this.options.hoverSelectorDirectionUp) {
						return elems.closest(this.options.hoverSelector);
					} else {
						return elems.find(this.options.hoverSelector);
					}
				}
				return elems;
			};
			
			var onHoverOver = function(event) {
				var elem = $(this);
				$this.isOver = true;
				options.onStartSwitchToBottom();
				$this._transformToBottom(elem, options, options.onEndSwitchToBottom, true);
			};
			
			var onHoverOut = function(event) {
				var elem = $(this);
				$this.isOver = false;
				options.onStartSwitchToTop();
				$this._transformToTop(elem, options, options.onEndSwitchToTop, true);
			};
	
			if (options.action == 'start') {
				if (options.hoverSelector) {
					elems.each(function() {
						var elem = $(this);
						this._onHoverOver = $.proxy(onHoverOver, elem);
						this._onHoverOut = $.proxy(onHoverOut, elem);
						getHoverElems(elem).bind('mouseenter', this._onHoverOver).bind('mouseleave', this._onHoverOut);
					});
				} else {
					getHoverElems(elems).bind('mouseenter', onHoverOver).bind('mouseleave', onHoverOut);
				}
			} else if (options.action == 'stop') {
				if (options.hoverSelector) {
					elems.each(function() {
						var elem = $(this);
						getHoverElems(elem).unbind('mouseenter', this._onHoverOver).bind('mouseleave', this._onHoverOut);
					});
				} else {
					getHoverElems(elems).unbind('mouseenter', onHoverOver).unbind('mouseleave', onHoverOut);
				}
			} else {
				$.error('Unknow action ' + options.action + ' in Incors.ImageSwitcher.hover');
			}
		},
		
		stop: function(options) {
			var $this = this;
			
			this.elems.queue($.grep(this.elems.queue(), function(value) {
				return $.inArray(value, $this.animationQueue) == -1;
			}));
			
			this.animationQueue = [];
			this.elems.dequeue();
			
			this._stopSequelInterval();
			
			this._getImgsTop(this.elems).stop(true, false);
			
			this._transformToTop(this.elems, options, null, true);
			
			return this;
		},
		
		toggle: function(options, callback) {
			$this = this;
			this._cycle(options, function(callback) {
				if ($this._sequence($this.elems, options, 
					function(elem, options, callback) {
						$this._toggle(elem, options, callback, true);
					}, callback)) {
				} else {
					$this._toggle($this.elems, options, callback, false);
				}
			}, callback);
			
			return this;
		},
		
		_toggle: function(elems, options, callback, startInstantly) {
			callback = callback || Incors.Util.emptyFunction;
			var $this = this;
			
			this._wait_for_animations_finished(elems, function(triggerNextAnimation) {
				var toBottomElems = Incors.ImageSwitcher.topElems(elems);
				var toTopElems = Incors.ImageSwitcher.bottomElems(elems);
				
				var doneCalls = 0;
				var done = function() {
					if (++doneCalls == 2) {
						callback();
						triggerNextAnimation();
					}
				};
				
				$this._toBottom(toBottomElems, options, done, true);
				$this._toTop(toTopElems, options, done, true);
		
				/*if ($this.displayTopImg) {
					$this._toBottom(elems, duration, function() { callback(); triggerNextAnimation(); }, true);
				} else {
					$this._toTop(elems, duration, function() { callback(); triggerNextAnimation(); }, true);
				}*/
			}, startInstantly);
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
		
		_blink: function(elems, options, callback, startInstantly) {
			callback = callback || Incors.Util.emptyFunction;
			var $this = this;
			
			if (this._sequence(elems, options, 
				function(elem, options, callback) {
					$this._blink(elem, options, callback, true);
				},callback)) {
				return;
			}
			
			this._wait_for_animations_finished(elems, function(triggerNextAnimation) {
				options = $this._extendSwitchOptions(options);
				
				options = $.extend({}, {
					switch1Duration: options.duration,
					switch2Duration: options.duration,
					pauseDuration: 0
				}, options || {});
	
				$this._toggle(elems, $.extend({}, options, { duration: options.switch1Duration }), null, true);
				$this._delay(elems, options.pauseDuration);
				$this._toggle(elems, $.extend({}, options, { duration: options.switch2Duration }), function() {
					callback();
					triggerNextAnimation();
				}, true);
			}, startInstantly);
		},
		
		toTop: function(options, callback) {
			var $this = this;
			if (this._sequence(this.elems, options, 
				function(elem, options, callback) {
					$this._toTop(elem, options, callback, true);
				}, callback)) {
			} else {
				this._toTop($this.elems, options, callback, false);
			}
			return this;
		},
		
		_toTop: function(elems, options, callback, startInstantly) {
			callback = callback || Incors.Util.emptyFunction;
			var $this = this;
			this._wait_for_animations_finished(elems, function(triggerNextAnimation) {
				$this._transformToTop(elems, options, function() {
					triggerNextAnimation();
					callback();
				});
			}, startInstantly);
		},
		
		toBottom: function(options, callback) {
			var $this = this;
			if (this._sequence(this.elems, options, 
				function(elem, options, callback) {
					$this._toBottom(elem, options, callback, true);
				}, callback)) {
			} else {
				this._toBottom(this.elems, options, callback, false);
			}
			return this;
		},
		
		_toBottom: function(elems, options, callback, startInstantly) {
			callback = callback || Incors.Util.emptyFunction;
			var $this = this;
			this._wait_for_animations_finished(elems, function(triggerNextAnimation) {
				$this._transformToBottom(elems, options, function() {
					triggerNextAnimation();
					callback();
				});
			}, startInstantly);
		},
		
		_delay: function(elems, duration) {
			if (this.options.switchBottomImage) {
				this._getImgsBottom(elems).delay(duration);
			}
			this._getImgsTop(elems).delay(duration);
		},
		
		/*_orderedToggle: function(options, sequenceOptions, callback) {
			return this._sequenceToggle(this.elems, options, sequenceOptions, callback);
		},
		
		_randomToggle: function(options, sequenceOptions, callback) {
			return this._sequenceToggle(Incors.Util.fisherYates(this.elems), options, sequenceOptions, callback);
		},
		
		_sequenceToggle: function(elems, options, sequenceOptions, callback) {
			var $this = this;
			this._sequence(elems, options, sequenceOptions, function(elem, options, callback) {
				$this._toggle(elem, options, callback, true);
			}, callback);
			return this;
		},
		
		_orderedBlink: function(elems, options, sequenceOptions, callback) {
			return this._sequenceBlink(elems, options, sequenceOptions, callback);
		},
		
		_randomBlink: function(elems, options, sequenceOptions, callback) {
			return this._sequenceBlink(Incors.Util.fisherYates(elems), options, sequenceOptions, callback);
		},
		
		_sequenceBlink: function(elems, options, sequenceOptions, callback) {
			var $this = this;
			
			this._sequence(
				elems,
				options,
				sequenceOptions, 
				function(elem, options, callback) {
					$this._blink(elem, options, callback, true);
				},
				callback
			);
			return this;
		},*/
		
		_sequence: function(elems, options, transformation, callback) {
			if (options.sequence) {
				var sequenceOptions = options.sequence;
				
				options = $.extend({}, options, { sequence: null });
				
				callback = callback || Incors.Util.emptyFunction;
				var $this = this;
				
				if (elems.length != 0) {
					this._wait_for_animations_finished(elems, function(triggerNextAnimation) {
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
					}, false);
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
					$this._stopSequelInterval();
				
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
			this.sequenceInterval = window.setInterval(intervalFunction, sequenceOptions.interval);
		},
		
		_stopSequelInterval: function() {
			window.clearInterval(this.sequenceInterval);
			this.sequenceInterval = null;	
		},
		
		_wait_for_animations_finished: function(elems, callback, startInstantly) {
			var $this = this;
			var i = 0;
			if (startInstantly) {
				callback(function() {});
				return null;
			} else {
				var queueFunction = function() {
					if (++i == elems.length) {
						this.animation = true;
						callback(function() {
							elems.dequeue();
							$this.animationQueue.shift();
						});
					}
				}; 
				elems.queue(queueFunction);
				this.animationQueue.push(queueFunction);
				return queueFunction;
			}
		},
		
		_stop: function(elems) {
			if (this.options.switchBottomImage) { 
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
		
		_transform: function(elems, options, toTop, stop, callback) {
			var callback = callback || Incors.Util.emptyFunction;
			var $this = this;
			
			options = $this._extendSwitchOptions(options);
			
			if (stop) {
				this._stop(elems);
			} else {
				elems = toTop ? Incors.ImageSwitcher.bottomElems(elems, true) : Incors.ImageSwitcher.topElems(elems, true);
			}
			
			if (elems.length == 0) {
				callback();
				return;
			}
			
			var transformation = this._transformation(options.transformation);
			
			$.each(elems, function(i, elem) {
				if (options.transformation != elem._transformation) {
					if (elem._transformation) {
						$this._transformation(elem._transformation).reset($(elem), !(toTop));
					}
					transformation.init($(elem), !(toTop));
					elem._transformation = options.transformation;
				}	
			});
			
			transformation.transform(elems, options, toTop, stop, callback);
		},
		
		_transformation: function(transformationName) {
			var transformation = this.transformations[transformationName];
			if (!(transformation)) {
				transformation = new Incors.ImageSwitcher.Transformations[transformationName](this);
				this.transformations[transformationName] = transformation;
			}
			return transformation;
		},
		
		_getImgsBottom: function(elems) {
			if (!(elems.imgsBottom)) {
				elems.imgsBottom = $(elems).find(this.options.selectors.imgBottom);
			}
			return elems.imgsBottom;
		},
		
		_getImgsTop: function(elems) {
			if (!(elems.imgsTop)) {
				elems.imgsTop = $(elems).find(this.options.selectors.imgTop);
			}
			return elems.imgsTop;
		},
		
		_extendSwitchOptions: function(options) {
			return $.extend({}, this.options, options || {});
		}
	};
	
	Incors.ImageSwitcher.Transformations = {
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
	
	Incors.ImageSwitcher.Transformations.slide.prototype = {
		transform: function(elems, options, toTop, stop, callback) {
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
				if (options.switchBottomImage) {
					animationNum++;
					var imgBottom = imageSwitcher._getImgsBottom(elem);
					if (toTop) {
						imgBottom.animate({ height: elem._slideHeight + 'px' }, options.duration, easing, done);
					} else {
						imgBottom.animate({ height: '0px' }, options.duration, easing, done);
					}
				}
				animationNum++;
				var imgTop = imageSwitcher._getImgsTop(elem);
				if (toTop) {
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
					if (imageSwitcher.options.switchBottomImage) {
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
					if (imageSwitcher.options.switchBottomImage) {
						imgBottom.hide().height(elem._slideHeight);
					}
				} else {
					imgTop.hide().height(elem._slideHeight);
					if (imageSwitcher.options.switchBottomImage) {
						imgBottom.show().height(elem._slideHeight);
					}
				}
			});
		}/*,
		
		stop: function() {
			var imageSwitcher = this.imageSwitcher;
			
			imageSwitcher._getImgsTop(imageSwitcher.elems).stop().show().css({ opacity: 1 });
			imageSwitcher._getImgsBottom(imageSwitcher.elems).stop(true, true).hide();
		}*/
	};
	
	Incors.ImageSwitcher.Transformations.fade.prototype = {
		transform: function(elems, options, toTop, stop, callback) {
			var imageSwitcher = this.imageSwitcher;
			
			var i = 0;
			var animationNum = elems.length;
			var done = function() {
				if (++i == animationNum) {
					callback();
				}
			};
			
			var easing = options.easing;
			if (options.switchBottomImage) {
				animationNum += elems.length;
				var fadeBottomTo = toTop ? 0 : 1;
				var imgBottom = imageSwitcher._getImgsBottom(elems);
				imgBottom.fadeTo(options.duration, fadeBottomTo, easing, done);
			}
			var fadeTopTo = toTop ? 1 : 0;
			var imgTop = imageSwitcher._getImgsTop(elems);
			imgTop.fadeTo(options.duration, fadeTopTo, easing, done);
		},
		
		init: function(elems, top) {
			var imageSwitcher = this.imageSwitcher;
			if (top) {
				if (imageSwitcher.options.switchBottomImage) {
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
				if (imageSwitcher.options.switchBottomImage) {
					imageSwitcher._getImgsBottom(elems).hide().css({ opacity: 1 });
				}
			} else {
				imageSwitcher._getImgsTop(elems).hide().css({ opacity: 1 });
				if (imageSwitcher.options.switchBottomImage) {
					imageSwitcher._getImgsBottom(elems).show().css({ opacity: 1 });
				}
			}
		}/*,
		
		stop: function() {
			var imageSwitcher = this.imageSwitcher;
		
			imageSwitcher._getImgsTop(imageSwitcher.elems).stop(true, true).show().css({ opacity: 1 });
			if (imageSwitcher.options.switchBottomImage) { 
				imageSwitcher._getImgsBottom(imageSwitcher.elems).stop(true, true).hide();
			}
		}*/
	};
	
	// static variables and methods
	
	$.extend(Incors.ImageSwitcher, {
		options: {
			selectors: {
				imgBottom: ":first-child",
				imgTop: ":nth-child(2)"
			},
			switchBottomImage: false,
			
			transformation: 'fade', // fade, slide
			duration: 1000, // time in milliseconds
			easing: 'linear'
		},
		
		methods: {
			init: true,
			stop: true,
			hover: true,
			toTop: true,
			toBottom: true,
			toggle: true,
			randomToggle: true,
			orderedToggle: true,
			sequenceToggle: true,
			blink: true,
			randomBlink: true,
			orderedBlink: true,
			sequenceBlink: true
		},
	
		topElems: function(elems, changeState) {
			var topElems = [];
			$(elems).each(function(i, elem) {
				if (elem._displayTopImg) {
					if (changeState) {
						elem._displayTopImg = false;
					}
					topElems.push(elem);
				}
			});
			return topElems;
		},
		
		bottomElems: function(elems, changeState) {
			var bottomElems = [];
			$(elems).each(function(i, elem) {
				if (!(elem._displayTopImg)) {
					if (changeState) {
						elem._displayTopImg = true;
					}
					bottomElems.push(elem);
				}
			});
			return bottomElems;
		},
	});
	
	$.fn.imageSwitcher = function(method) {
		// Method calling logic
		if (typeof method == 'string') {
			if (!(Incors.ImageSwitcher.methods[method])) {
				$.error('Method "' + method + '" is not defined for plugin imageSwitcher');
				return;
			}
			if (!(this._imageSwitcher)) {
				this._imageSwitcher = new Incors.ImageSwitcher(this);
			}
			this._imageSwitcher[method].apply(this._imageSwitcher, Array.prototype.slice.call( arguments, 1));
		} else if ($.isPlainObject(method)) {
			if (!(this._imageSwitcher)) {
				this._imageSwitcher = new Incors.ImageSwitcher(this, method);
			} else {
				this._imageSwitcher.init(method);
			}
		} else {
			$.error( 'Method ' + method + ' does not exist for jQuery.imageSwitcher' );
		}
		return this;
	};
	
	$.fn.iexCrossfadeColor = function(options) {
		function rgb2hex(rgb){
			rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
			return "#" +
			 ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
			 ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
			 ("0" + parseInt(rgb[3],10).toString(16)).slice(-2);
		}
	
		var options = $.extend({
			duration: 1000, // time in milliseconds
			colorMap: {}
		}, options || {});

		return this.hover(
			function() {
				var $$ = $(this);
				var hoverColor = $$.data('hoverColor');
				if (!hoverColor) {
					var oldColor = rgb2hex($$.css('background-color'));
					var hoverColor = options.colorMap[oldColor];
					if (hoverColor) {
						$$.data('hoverColor', hoverColor);
						$$.data('oldColor', oldColor);
					} else {
						return;
					}
				}
				$$.stop().animate({ backgroundColor: hoverColor }, options.duration);
			},
			function() {
				$$ = $(this);
				var oldColor = $$.data('oldColor');
				if (oldColor) {
					$$.stop().animate({ backgroundColor: oldColor }, options.duration);
				}
			}
		);
	};

	$.fn.switchIcons = function(options) {
		var options = $.extend({
			switchOnSelector: '.switch_on',
			switchOffSelector: '.switch_off',
			onSwitchOn: function() {},
			onSwitchOff: function() {},
		}, options || {});
		
		$(this).each(function() {
			var $$ = $(this);
		
			var switchOn = $$.find(options.switchOnSelector);
			var switchOff = $$.find(options.switchOffSelector);
		
			switchOn.click(function() {
				switchOn.hide();
				switchOff.show();
				options.onSwitchOn();
			});
		
			switchOff.click(function() {
				switchOff.hide();
				switchOn.show();
				options.onSwitchOff();
			});
		});
	};
})(jQuery);