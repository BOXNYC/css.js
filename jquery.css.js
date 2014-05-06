/**
 * css.js
 * jquery.css.js v0.1.1
 * Copyright 2014 BOX Creative, LLC
 * Code licensed under MIT:
 * https://github.com/twbs/bootstrap/blob/master/LICENSE
 *
 * jQuery Version of css.js
 * ------------------------
 * Acts on HTML elements with content attributes with JavaScript
 * inside. Doesn't effect :before or :after element pseudo classes
 * and can can use jQuery $ syntax for each parse.
 * CSS.JS uses eval() to perform the code evaluations, so bad syntax will
 * create errors or script failure, so be careful when writing.
 *
 * TODOs:
 * 1) on() listeners
 * 2) Pass all rules to CSS.JS on -events- as well as .selectors.
 *    This could be great to access via a set var like $css or $rules.
 * 3) Handle attaching events more than once. AKA $.hasBinding()
 * 4) Create the ability to pass arguments to defined CSS.JS -functions-.
 *    EX: -sayANumber- { content: "alert('How about the number '+args[0])"; }
 *        .nav a { content: "!click(sayANumber:7)"; }
 * 5) Plugins
 * 6) Pseudo Class defaults. Ex: a:hover { content:"$this.css('opacity', 0.5)"; }
 *
 * Documentation:
 * --------------
 * each(key, event): $this, key, event
 * [jQueryEvent](event): $this, event
 * 
 *
 * Basic Useage:
 * -------
 * -on-document-ready {
 *     content: "console.log('Ready, woo hoo!')";
 * }
 *
 * document {
 *     content: "ready(on-document-ready)";
 * }
 *
 * #my-element {
 *     content: "console.log($this)";
 * }
 *
 * -remove-active-nav- {
 *     content: "$('.nav a.active').removeClass('active')";
 * }
 *
 * -on-nav-click- {
 *     content: "$this.addClass('active')";
 * }
 *
 * .nav a {
 *     content: click(remove-active-nav, on-nav-click);
 * }
 * 
 *
 * Known Issues:
 * -------------
 * - Safari: content:"" attribute on image (.svg in this case) cause it to be invisible
 * - Safari: Makes all selectors lowercase inside teh Rules JS Object CSSStyleRule.selectorText.
 *    We are checking a match after it returns UND, then attempt to lookup via
 *    CSSStyleRule.selectorText.toLowerCase() transformation to match.
 *
 *
 *
 **/

// Privateize code...
(function($){
	
		
	/**
	 * CssJs()
	 * - CssJs Constructor.
	 */
	function CssJs() {
		
		/**
		 * PUBLIC PROPERTIES
		 * >>-------------->
		 */
		
		/**
		 * Local variables.
		 */
		this.firstRun = true;
		this.data = {/* For saving data via CSS. */};
		
		/**
		 * PRIVATE PROPERTIES
		 * >>--------------->
		 */
		
		/**
		 * Locally-global variables.
		 */
		var Dict = { selectors:{}, evals:{}, customEachCount:0 };
		var tokens = {
			'timeout({': 'setTimeout(func(){',
			'.scroll({': '.scroll(func(){',
			'.each({': '.scroll(func(){',
			'func(': 'function('
		};
		
		/**
		 * PUBLIC METHODS
		 * >>----------->
		 */
		
		/**
		 * .init()
		 * - Initiates a basic parse and bind
		 */
		this.init = function(){
			parseStyleSheets();
			this.bind(true);
		};
		
		/**
		 * .update()
		 * - Can be called again. Good for reparsing AJAX content.
		 */
		this.update = function(){
			this.bind(false);
		};
		
		/**
		 * .addToken(mixed find[, str replace])
		 *  - Can be called again. Good for reparsing AJAX content. !untested 
		 */
		this.addToken = function(find, replace){
			// Add tokens in object
			if(typeof find === 'object' && typeof replace === UND) {
				tokens = $.extend(tokens, find);
				return;
			// Make sure we have both values
			} else if(typeof replace === UND || typeof replace === UND) {
				return;
			};
			// Force to string if not
			if(typeof find !== 'string')
				find = find.toString();
			if(typeof replace !== 'string')
				replace = replace.toString();
			// Add to tokens
			tokens[find] =replace;
		};
		
		/**
		 * :bind()
		 * Binds all CSS.JS rules as jQuery events
		 */
		this.bind = function() {
			// Add some variables to be used in CSS in this scope
			var self = this, CSSJS = self, returned;
			var $document = $(document), $window = $(window);
			// Get CSS.JS variables -VARS NAMESPACE- { content:"..." }
			for(var _eval in Dict.evals) {
				if(_eval.toLowerCase().indexOf('-vars')===0){
					eval(syntax(Dict.evals[_eval], true, true));
				};
			};
			// Loop through the selectors with proper content attributes
			$.each(Dict.selectors, function(selector, events){
				// Get our jQuery DOM selector
				var $selector = false;
				switch(selector) {
					case 'document' : $selector = $document; break;
					case 'window' : $selector = $window; break;
					default : $selector = $(selector);
				};
				if(!$selector || !$selector.length)
					return true;
				var fns = parseCode(events);
				for(var f in fns) {
					var fn = fns[f];
					$.each(fn.args, function(i, funcName) {
						var eventBinding = fn.name+'.'+funcName;
						// TODO: Check if $selector has event
						// Bind all methods other than jQuery.each
						if(fn.name != 'each') {
							$selector.data('CssJs', {preventDefault:fn.preventDefault});
							$selector.bind(eventBinding, function(event){
								var $this = $(this);
								var data = $this.data('CssJs');
								if(data.preventDefault) event.preventDefault();
								var code = Dict.evals['-'+funcName+'-'];
								if(typeof code === 'undefined')
									code = Dict.evals['-'+funcName.toLowerCase()+'-'];
								code = 'var response = (function(event){'+code+'}(event));';
								code = syntax(code);
								eval(code);
								if(typeof response !== 'undefined') returned = response;
								if(data.preventDefault) return false;
							});
						// Evaluate each each method right away
						} else if(fn.name == 'each') {
							$selector.each(function(key, event){
								var $this = $(this);
								var code = Dict.evals['-'+funcName+'-'];
								// Safari makes the selector lowercase for some reason.
								// In case, well see if it matches in lowercase
								if(typeof code == 'undefined')
									code = Dict.evals['-'+funcName.toLowerCase()+'-'];
								eval(code);
							});
						};
						// Trigger/evaluate each jQuery document.ready right away on first run
						if(self.firstRun && fn.name == 'ready' && $selector == $document) {
							$selector.trigger(fn.name+'.'+funcName);
						};
					});
				};
			});
			// Set firstRun so document ready only happends once
			self.firstRun = true;
		};		
		
		/**
		 * PRIVATE METHODS
		 * >>------------>
		 */
		
		/**
		 * parseStyleSheets();
		 * Gets #selector { content: "code"; } rules, and saves to Dictionary
		 */
		function parseStyleSheets() {
			$.each(document.styleSheets, function(ss, styleSheet){
				$.each(styleSheet.cssRules, function(r, rule){
					if(rule instanceof CSSStyleRule) {
						// Get content attribute
						var content = rule.style.content;
						// Safari has an opening and closing single quote on content string.
						if(content.indexOf("'") === 0 || content.indexOf('"') === 0)
							content = content.replace(/^\'|\'$|^\"|\"$|\\/g, '');
						// Make sure its code
						if(content.length < 3) return true;
						// Get it's selector and make sure its not a before or after psedudo class
						var selectorText = rule.selectorText;
						if(selectorText.search(/\:(before|after)$/) > -1) return true;
						// Check the type of rule this is...
						var event = selectorText.search(/^\-.*\-$/g) > -1;
						content = parseTokens(content);
						// Save the rule.
						Dict[event?'evals':'selectors'][selectorText] = content;
					}
				});
			});
		};
		
		/**
		 * syntax()
		 * Syntax completion and fixes
		 */
		function syntax(code, openWithVar, closeWidthColon) {
			openWithVar = typeof openWithVar == 'undefined' ? false : openWithVar;
			closeWidthColon = typeof closeWidthColon == 'undefined' ? false : closeWidthColon;
			// Trim
			code = code.replace(/^\s*|\s*$/g, '');
			// Code completions
			if(openWithVar && code.search(/^var\s{1,}/g) === -1) code = 'var '+code;
			if(closeWidthColon && code.search(/\;$/g) === -1) code += ';';
			return code;
		};		
		
		/**
		 * parseCode(str str)
		 * Helper function to parse function(arguments...) to object
		 */
		function parseCode(str) {
			// Extract referenced functions
			var refFuncs = str.match(/\!*[\w]{1,}\([\w\s\,]{1,}\)/g);
			if(refFuncs == null) refFuncs = [];
			// Remove referenced function to show loose code to be used as and each
			var code = str;
			for(var refFunc in refFuncs)
				code = code.split(refFuncs[refFunc]).join('');
			code = code.replace(/^\s*|\s*$/g, '');
			// Add loose code as an each reference
			if(code) {
				var evalEvent = 'INLINE-EACH-EVENT-'+Dict.customEachCount;
				Dict.evals['-'+evalEvent+'-'] = code;
				Dict.customEachCount++;
				refFuncs.push('each('+evalEvent+')');
			};
			// Generate fn objects array
			var array = [];
			for(var r in refFuncs) {
				var parts = refFuncs[r].replace(/\)$/g, '').split('(');
				var fn = {
					name: parts[0],
					args: parts[1].split(/\,\s*/g),
					preventDefault: false
				};
				var preventDefault = fn.name.indexOf('!')===0;
				if(preventDefault) {
					fn.name = fn.name.replace(/^\!/g, '');
					fn.preventDefault = true;
				};
				array.push(fn);
			};
			// Return array
			return array;
		};
		
		/**
		 * parseTokens(str content)
		 * Helper function to parse code with tokens allowing smaller code in css
		 */
		function parseTokens(content){
			for(var find in tokens)
				content = content.split(find).join(tokens[find]);
			return content;
		};
		
		/**
		 * End CssJs Class.
		 */
	};	
	
	/**
	 * Initiate CssJs Object
	 * on $document.ready()
	 */
	$(function(){
		var CSSJS = new CssJs();
		CSSJS.init();
	});

/**
 * End privitive code
 */
}(jQuery));
