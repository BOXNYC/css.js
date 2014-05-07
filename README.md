<img src="http://css.js.box.biz/images/css.js.2.png" />

Write scripts in style
======================

Add this script to your page and you can beginto write JavaScript/jQuery in your CSS file localized to each rule. All major browsers and devices supported!

How it works
============
It can be described in one word. "content". Since CSS2 we've had a CSS property with a very simple life. The "content" property. It's sole existence is to support it's parents, the :before and :after pseudo classes and nothing more. And although all elements actually have and recognize the "content" property, it has no other purpos in life. Until now!

The "content" property's new best friend is JavaScript. Previously JavaScript would have nothing to do do with the "content" property as JavaScript couldn't access it's reason to live, the :before and :after pseudo classes. Now they are brought together and wow do they get along.

Years ago on browsers we don't use anymore, there was a propery called "behavior". This property's only existence was JavaScript, and it actually performed a decent job. Unfortunatly for "behavior", none of the other browsers would recognize it, and it became only used to help it catch up with modern browsers. BTW, Internet Explorer, you know who I'm talking about.

So... How it works...
Well, we all know JavaScript doesn't become useful until after HTML and CSS are finished doing there job. Then JavaScript comes in an adds some intelligence to the equation. At this point, css.js goes through all CSS selected elements that have a "content" property (other than :before and :after), and it stores all the info it memory. Then it uses the eval() method to run it as real JavaScript code. If you understand what I mean by all this, then You can put 2 & 2 together figure out the rest. Quite simple really, css.js evaluates the CSS "content" property. Yippee.



http://css.js.box.biz/
