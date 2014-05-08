Write scripts in style
======================
Add the css.js script to your page and you can begin to write JavaScript/jQuery in your CSS rules. All your scripts are localized to each selector's element's scope. All major browsers on all devices supported!

How it works
============
It can be described in one word. "content". Since CSS2 we've had a CSS property with a very simple life. The "content" property. It's sole existence is to support the :before and :after pseudo classes and nothing more. Although all elements have and recognize the "content" property, it has no other purpos in life. Until now.

With css.js, the "content" property's new best friend is JavaScript. Previously JavaScript would have nothing to do do with the "content" property as JavaScript couldn't access the :before and :after pseudo classes. Now they are brought together and wow do they get along.

So... How it works...
Well, we all know JavaScript doesn't become useful until after HTML and CSS are finished doing there jobs. Then JavaScript comes in an adds some intelligence to the equation. At this point, css.js goes through all CSS selected elements that have a "content" property (other than :before and :after), and it stores all the info it memory. Then it uses the eval() method to run it as real JavaScript code. If you understand what I mean by all this, then You can put 2 & 2 together figure out the rest. Simply put, css.js evaluates the CSS "content" property as JavaScript. Yippee.

History & How we got to this point
==================================

Years ago on browsers we don't use anymore, there was a propery called "behavior". This property's only existence was JavaScript, and it actually performed a decent job. Unfortunatly for "behavior", none of the other browsers would recognize it, and it became only used to help it catch up with modern browsers. BTW, Internet Explorer, you know who I'm talking about.




http://css.js.box.biz/
