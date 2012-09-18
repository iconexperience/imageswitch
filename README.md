jQuery ImageSwitch Plugin
=========================

***

DESCRIPTION
-----------

The plugin is used to perform switch animations between two overlapping images.
The plugin was originally developed to switch between two icons in different style as can be seen here. 


FEATURES
--------

 + different switch animation effects
 + switch on mouse hover
 + sequential switch on multiple images
 + switching between two semi-transparent images


FILE STRUCTURE
--------------

/examples                 -> folder with fully working examples
  /imgs                   -> images used for examples
    ...
  animations.html         -> 
  hover.html              -> mouse hover example
/imageswitch              
  jquery.imageswitch.js   -> the ImageSwitch javascript jQuery plugin file
  
README.md                 -> this file


MINIMAL EXAMPLE
---------------

This is a minimal example of an HTML page with 3 overlapping Images which crossfade from one image to the other when the mouse hovers over the images.

    <!DOCTYPE html>
    <html>
	    <head>
		    <script src="jquery.js" type="text/javascript"></script>
	    	<script src="jquery.imageswitch.js" type="text/javascript"></script>
    
		    <script>
			    $(document).ready(function() {
			    	$('.image_switch').imageSwitch('hover');
	    		});
    		</script>
		
		    <style>
		        .image_switch {
		            position: relative;
		            width: 128px;
		            height: 128px;
		        }
		    	.image_switch img {
		    		position: absolute;
			    	top: 0;
			    	left: 0;
		    	}
		    </style>
	    </head>
	    <body>
		    <div class="image_switch">
			    <img src="example_bottom_image_1.png" />
			    <img src="example_top_image_1.png" />
		    </div>
		
		    <div class="image_switch">
			    <img src="example_bottom_image_2.png" />
			    <img src="imgs/example_top_image_2.png" />
		    </div>
		    
		    <div class="image_switch">
			    <img src="example_bottom_image_3.png" />
			    <img src="example_top_image_3.png" />
		    </div>
	    </body>
    </html> 


SETUP
-----

### Script

To setup the ImageSwitch plugin simply include the javascript file in the <head> of your document
    <script type="text/javascript" src="jquery.imageSwitch.js"></script>

You will also need to include jQuery

    <script type="text/javscript" src=""jquery.js"></script>

### Markup

Place the top and bottom image in a surrounding div.

    <div class="switch_image">
      <img src="imgs/bottom_image.png" />
      <img src="imgs/top_image.png" />  
    </div>

You can also nest the images inside this structure, e.g. by surrounding anchor tags.

    <div class="switch_image">
      <a href="#"><img src="imgs/bottom_image.png" /></a>
      <a href="#"><img src="imgs/top_image.png" /></a>
    </div>

If you would like to use background images instead you must declare classes 'imageBottom' and 'imageTop' for the top and bottom images.

    <div class="switch_image">
      <div class="imageBottom" style="background: url('imgs/bottom_image.png')"></div>
      <div class="imageTop" style="background: url('imgs/bottom_image.png')"></div>
    </div>

### Style

The two top and bottom image must completely overlap. A basic way to achieve this is 

    <style>
      .switch_image {
        position: relative;
      }
      .switch_image img:first-child {
        position: absolute;
        top: 0;
      }
    </style>


BASIC USAGE
-----------

To switch from the top image to the bottom image you can simply call:

    $(selector).imageSwitch('bottom'); 

To switch back to the top image call:

    $(selector).imageSwitch('top');

There are a couple of options to customize the animation which you can pass as a map:

    $(selector).imageSwitch('bottom', {
      transformation: 'slide'
      duration: 500
    })
    
To switch from either bottom or top state to the other state use the toggle action:

    $(selector).imageSwitch('toggle');
    
It is possible to queue the animations. The following will toggle from one state to the other and back:

    $(selector).imageSwitch('toggle').imageSwitch('toggle');
    
The same behavior can be achieved by the blink action (toggles twice):

    $(selector).imageSwitch('blink');

To animate a blink (works also for toTop, toBottom, toggle) action on multiple images one by one in a sequence order you may set the sequence option:

    $(selector).imageSwitch('blink', { sequence: true }); 

To animate to the bottom image when the mouse hovers over and back to the top image when the mouse hovers out do:

    $(selector).imageSwitch('hover');
    
All methods can be customized by a couple of options. To set all calls on the same jQuery object with the same options you can apply the init action:

    $(selector).imageSwitch('init', {
      transformation: 'fade',      
      duration: 2000,
      easing: '',
      queue: 'my own queue'
    });
    
The init function can be queued just like any other action:

    $(selector)
      .imageSwitch('bottom') // switch to bottom in 1000 milliseconds default time 
      .imageSwitch('init', { duration: 500 }) // init animation time for all future calls
      .imageSwitch('top') // switch to top in 500 milliseconds
    
This is just a small overview of what's possible with this plugin. See the API reference below to get the complete picture.



API
---

### .imageSwitch('init'), .imageSwitch()

Description: Init the ImageSwitch Object with. 

#### .imageSwitch('init'[, callBack]), .imageSwitch([callBack]) - Returns: jQuery

callback - A function to call once the animation is complete.

#### .imageSwitch('init'[, options][, callBack]), .imageSwitch([options][, callBack]) - Returns: jQuery

callback - A function to call once the animation is complete.

options - A map of additional options to pass to the method. Supported Keys:
 + transformation: A string indicating which transformation animation to use ('fade', 'slide')
                   defaults to: 'fade'                        
 + duration: Time in milliseconds
             defaults to: 1000
 + easing: A string indicating the easing function to use (see jQuery easing documentation)
           defaults to: 'linear'
 + queue: A string indicating what queue to use for the animation (see jQuery queue documentation)
          defaults to: 'fx'
 + selectors: A map with keys imgBottom and imgTop to specify specific selectors for the bottom and top image
              Can only be set on a 
              defaults to: { imgBottom: ':first-child', imgTop: ':nth-child(2)' }
 + switchBottomImage: A boolean indicating if the bottom image should also be animated. This is useful for
                      semi transparent images where bottom image would be visible underneath the top image. 
                      defaults to: false
                      
                      
### .imageSwitch('top')

Description: Animate to top image.

#### .imageSwitch('top'[, callBack]) - Returns: jQuery

callback - A function to call once the animation is complete.

#### .imageSwitch('top'[, options][, callBack]) - Returns: jQuery

callback - A function to call once the animation is complete.

options - A map of additional options to pass to the method. Supported Keys:
 + transformation: A string indicating which transformation animation to use ('fade', 'slide')
                   defaults to: 'fade'      
 + duration: Time in milliseconds
             defaults to: 1000
 + easing: A string indicating the easing function to use (see jQuery easing documentation)
           defaults to: 'linear'
 + queue: A string indicating what queue to use for the animation (see jQuery queue documentation)
          defaults to: 'fx'
 + onStart: Callback function when animation starts
            defaults to: #empty function#
 + onFinish: Callback function when animation finishes
             defaults to: #empty function#
 + cycle: Set to true to run animation in an repeating cycle
          defaults to: false
 + cyclePauseDuration: Time in milliseconds to pause between cycles
                       defaults to: 2000
 + onStartCycle: Callback function when cycle starts
                 defaults to: #empty function#
 + onFinishCycle: Callback function when cycle ends
                  defaults to: #empty function#
 + sequence: Animate all images one by one in a sequence order.
             You can set this option to true or false. If you want more control pass a map of additional options:
               + order: set to 'forward' | 'reverse' | 'random'
                        defaults to: 'forward'
               + interval: time in milliseconds
                           defaults to: #duration of animation#
               + onStartSequenceStep: Callback function when each animation in the sequence starts.
                                      defaults to: #empty function#
               + onFinishSequenceStep: Callback function when each animation in the sequence finishes.
                                       defaults to: #empty function#
             setting the sequence option to true is equivalent to { order: 'forward', interval: #duration of animation# }}
             defaults to: false


### .imageSwitch('bottom')

Description: Animate to bottom image.

#### .imageSwitch('bottom'[, callBack]) - Returns: jQuery

callback - A function to call once the animation is complete.

#### .imageSwitch('bottom'[, options][, callBack]) - Returns: jQuery

callback - A function to call once the animation is complete.

options - A map of additional options to pass to the method. Supported Keys:
 + transformation: A string indicating which transformation animation to use ('fade', 'slide')
                   defaults to: 'fade'      
 + duration: Time in milliseconds
             defaults to: 1000
 + easing: A string indicating the easing function to use (see jQuery easing documentation)
           defaults to: 'linear'
 + queue: A string indicating what queue to use for the animation (see jQuery queue documentation)
          defaults to: 'fx'
 + onStart: Callback function when animation starts
            defaults to: #empty function#
 + onFinish: Callback function when animation finishes
             defaults to: #empty function#
 + cycle: Set to true to run animation in an repeating cycle
          defaults to: false
 + cyclePauseDuration: Time in milliseconds to pause between cycles
                       defaults to: 2000
 + onStartCycle: Callback function when cycle starts
                 defaults to: #empty function#
 + onFinishCycle: Callback function when cycle ends
                  defaults to: #empty function#
 + sequence: Animate all images one by one in a sequence order.
             You can set this option to true or false. If you want more control pass a map of additional options:
               + order: set to 'forward' | 'reverse' | 'random'
                        defaults to: 'forward'
               + interval: time in milliseconds
                           defaults to: #duration of animation#
               + onStartSequenceStep: Callback function when each animation in the sequence starts.
                                      defaults to: #empty function#
               + onFinishSequenceStep: Callback function when each animation in the sequence finishes.
                                       defaults to: #empty function#
             setting the sequence option to true is equivalent to { order: 'forward', interval: #duration of animation# }}
             defaults to: false


### .imageSwitch('toggle')

Description: Animate to other image.

#### .imageSwitch('toggle'[, callBack]) - Returns: jQuery

callback - A function to call once the animation is complete.

#### .imageSwitch('toggle'[, options][, callBack]) - Returns: jQuery

callback - A function to call once the animation is complete.

options - A map of additional options to pass to the method. Supported Keys:
 + transformation: A string indicating which transformation animation to use ('fade', 'slide')
                   defaults to: 'fade'      
 + duration: Time in milliseconds
             defaults to: 1000
 + easing: A string indicating the easing function to use (see jQuery easing documentation)
           defaults to: 'linear'
 + queue: A string indicating what queue to use for the animation (see jQuery queue documentation)
          defaults to: 'fx'
 + onStart: Callback function when animation starts
            defaults to: #empty function#
 + onFinish: Callback function when animation finishes
             defaults to: #empty function#
 + cycle: Set to true to run animation in an repeating cycle
          defaults to: false
 + cyclePauseDuration: Time in milliseconds to pause between cycles
                       defaults to: 2000
 + onStartCycle: Callback function when cycle starts
                 defaults to: #empty function#
 + onFinishCycle: Callback function when cycle ends
                  defaults to: #empty function#
 + sequence: Animate all images one by one in a sequence order.
             You can set this option to true or false. If you want more control pass a map of additional options:
               + order: set to 'forward' | 'reverse' | 'random'
                        defaults to: 'forward'
               + interval: time in milliseconds
                           defaults to: #duration of animation#
               + onStartSequenceStep: Callback function when each animation in the sequence starts.
                                      defaults to: #empty function#
               + onFinishSequenceStep: Callback function when each animation in the sequence finishes.
                                       defaults to: #empty function#
             setting the sequence option to true is equivalent to { order: 'forward', interval: #duration of animation# }}
             defaults to: false


### .imageSwitch('blink')

Description: Animate to other image and back. This is equivalent to calling toggle twice.

#### .imageSwitch('blink'[, callBack]) - Returns: jQuery

callback - A function to call once the animation is complete.

#### .imageSwitch('blink'[, options][, callBack]) - Returns: jQuery

callback - A function to call once the animation is complete.

options - A map of additional options to pass to the method. Supported Keys:
 + transformation: A string indicating which transformation animation to use ('fade', 'slide')
                   defaults to: 'fade'      
 + duration: Time in milliseconds
             defaults to: 1000
 + easing: A string indicating the easing function to use (see jQuery easing documentation)
           defaults to: 'linear'
 + queue: A string indicating what queue to use for the animation (see jQuery queue documentation)
          defaults to: 'fx'
 + onStart: Callback function when animation starts
            defaults to: #empty function#
 + onFinish: Callback function when animation finishes
             defaults to: #empty function#
 + cycle: Set to true to run animation in an repeating cycle
          defaults to: false
 + cyclePauseDuration: Time in milliseconds to pause between cycles
                       defaults to: 2000
 + onStartCycle: Callback function when cycle starts
                 defaults to: #empty function#
 + onFinishCycle: Callback function when cycle ends
                  defaults to: #empty function#
 + sequence: Animate all images one by one in a sequence order.
             
             You can set this option to true or false. If you want more control pass a map of additional options:
               + order: set to 'forward' | 'reverse' | 'random'
                        defaults to: 'forward'
             
               + interval: time in milliseconds
                           defaults to: #duration of animation#
             
               + onStartSequenceStep: Callback function when each animation in the sequence starts.
                                      defaults to: #empty function#
             
               + onFinishSequenceStep: Callback function when each animation in the sequence finishes.
                                       defaults to: #empty function#
             
             setting the sequence option to true is equivalent to { order: 'forward', interval: #duration of animation# }}
             defaults to: false
 
 + pauseDuration: Time in milliseconds
                  defaults to: 0
 + switch1Options: options for first toggle animation. 
                   defaults to: {}
 + switch2Options: options for second toggle animation.
                   defaults to: {}

### .imageSwitch('hover')

Description: Apply switch image animation when mouse hovers over element.

#### .imageSwitch('hover'[, options]) - Returns: jQuery

options - A map of additional options to pass to the method. Supported Keys:
 + transformation: A string indicating which transformation animation to use ('fade', 'slide')
                   defaults to: 'fade'                         
 + duration: Time in milliseconds
             defaults to: 1000
 + easing: A string indicating the easing function to use (see jQuery easing documentation)
           defaults to: 'linear'
 + queue: A string indicating what queue to use for the animation (see jQuery queue documentation)
          defaults to: 'fx'
 + onStartHoverOver: Callback function when mouse moves over and animation starts.
                     defaults to: #empty function#
 + onFinishHoverOver: Callback function when mouse moves over and animation finishes.
                      defaults to: #empty function#
 + onStartHoverOut: Callback function when mouse moves out and animation starts.
                    defaults to: #empty function#
 + onFinishHoverOut: Callback function when mouse moves out and animation finishes.
                     defaults to: #empty function#
 + onAllFinishHoverOut: Incors.Util.emptyFunction,
                        defaults to: #empty function#
 + hoverSelector: Specific selector to trigger mouse hover. By default the image switch element is used. 
                  defaults to: null
 + hoverSelectorDirectionUp: Direction for the hover selector (up, down). This makes it possible to specify a trigger for the mouse hover
                             which is either inside or outside the actual switch switch element.
                             defaults to: true
 + switchHoverOverElem: Animation to use on the hover target when mouse moves over (bottom, top, toggle, blink, null).
                        default to: 'bottom'
 + switchHoverOutElem: Animation to use on the hover target when mouse moves over (bottom, top, toggle, blink, null).
                       default to: 'top'
 + switchNonHoverOverElems: Animation to use on the hover target when mouse moves over (bottom, top, toggle, blink, null).
                            default to: 'top'
 + switchNonHoverOutElems: Animation to use on the hover target when mouse moves over (bottom, top, toggle, blink, null).
                           default to: null
 + stopOnHoverOut: If true stops the animation (if still running) specified for option switchHoverOverElem immediately.
                   defaults to: true
          
          
### .imageSwitch('stop')

Description: Stops animations.

#### .imageSwitch('stop'[, options]) - Returns: jQuery

options - A map of additional options to pass to the method. Supported Keys:
 + queue: A string indicating what queue to use for the animation (see jQuery queue documentation)
          defaults to