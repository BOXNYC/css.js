/**
 * css.js
 * jquery.css.js v0.1.3
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
 * 5) Plugins
 * 6) Pseudo Class defaults. Ex: a:hover { content:"$this.css('opacity', 0.5)"; }
 *
 * Documentation:
 * --------------
 * each(key, event): $this, key, event
 * [jQueryEvent](event): $this, event
 * 
 * Known Issues:
 * -------------
 * - Safari: content:"" attribute on image (.svg in this case) cause it to be invisible
 * - Safari: Makes all selectors lowercase inside teh Rules JS Object CSSStyleRule.selectorText.
 *    We are checking a match after it returns UND, then attempt to lookup via
 *    CSSStyleRule.selectorText.toLowerCase() transformation to match.
 *
 **/

// Privateize code...
(function($){
	
		
	/**
	 * CssJs()
	 * - CssJs Constructor.
	 */
	function CssJs(settingsKey, settingsValue) {
		
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
		var UND = 'undefined',
				Dict = {
					settings: {
						functionsFirst: false,
						funcPrefix: '-',
						funcSuffix: '-'
					},
					selectors:{},
					evals:{},
					customEachCount:0
				},
				prefix = Dict.settings.funcPrefix,
				suffix = Dict.settings.funcSuffix,
				tokens = {
					'Data.': 'CSSJS.data.',
					'timeout({': 'setTimeout(func(){',
					'.scroll({': '.scroll(func(){',
					'.each({': '.scroll(func(){',
					'func(': 'function('
				},
				variablesCode = 'var self = this, CSSJS = self, $document = $(document), $window = $(window); '
					+'for(var _eval in Dict.evals) if(_eval.toLowerCase().indexOf(\''+prefix+'vars\')===0) '
					+'eval(syntax(Dict.evals[_eval], true, true));';
		
		/**
		 * Handle init settings
		 */
		_settings(settingsKey, settingsValue);
		
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
		 * .settings(mixed key[, mixed val])
		 *  - Can be called again. Good for reparsing AJAX content. !untested 
		 */
		// Private method
		function _settings(key, val) {
			// Add tokens in object
			if(typeof key === 'object' && typeof val === UND) {
				Dict.settings = $.extend(Dict.settings, key);
				return;
			// Make sure we have both values
			} else if(typeof key === UND || typeof val === UND) {
				return;
			};
			// Force to string if not
			if(typeof key !== 'string')
				key = key.toString();
			// Add to tokens
			Dict.settings[key] = val;
		};
		// Public method
		this.settings = function(key, val){
			_settings(key, val);
		};
		
		/**
		 * .dispatch(str funcName[, $ $this])
		 * - Dispatches an event
		 */
		this.dispatch = function(funcName, $this){
			// Add all variables to be used in CSS in this scope
			eval(variablesCode);
			// Dispatch the event
			var code = Dict.evals[prefix+funcName+suffix];
			if(typeof code == UND)
				code = Dict.evals[prefix+funcName.toLowerCase()+suffix];
			eval(code);
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
			tokens[find] = replace;
		};
		
		/**
		 * :bind()
		 * Binds all CSS.JS rules as jQuery events
		 */
		this.bind = function() {
			// Add all variables to be used in CSS in this scope
			eval(variablesCode);
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
							$selector.unbind(eventBinding);
							$selector.bind(eventBinding, function(event){
								var $this = $(this);
								var data = $this.data('CssJs');
								if(data.preventDefault) event.preventDefault();
								var code = Dict.evals[prefix+funcName+suffix];
								if(typeof code === UND)
									code = Dict.evals[prefix+funcName.toLowerCase()+suffix];
								code = 'var response = (function(event){'+code+'}(event));';
								code = syntax(code);
								eval(code);
								if(typeof response !== UND) returned = response;
								if(data.preventDefault) return false;
							});
						// Evaluate each each method right away
						} else if(fn.name == 'each') {
							$selector.each(function(key, event){
								var $this = $(this);
								var code = Dict.evals[prefix+funcName+suffix];
								// Safari makes the selector lowercase for some reason.
								// In case, well see if it matches in lowercase
								if(typeof code == UND)
									code = Dict.evals[prefix+funcName.toLowerCase()+suffix];
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
			self.firstRun = false;
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
						// Check syntax and parse tokens
						content = syntax(content, false, false);
						content = parseTokens(content);
						// Check the type of rule this is...
						var evals = (selectorText.indexOf(prefix)===0 && selectorText.split(suffix).pop()=='');
						// Save the rule.
						Dict[evals?'evals':'selectors'][selectorText] = content;
					}
				});
			});
		};
		
		/**
		 * syntax()
		 * Syntax completion and fixes
		 */
		function syntax(code, openWithVar, closeWidthColon) {
			openWithVar = typeof openWithVar == UND ? false : openWithVar;
			closeWidthColon = typeof closeWidthColon == UND ? false : closeWidthColon;
			// Trim
			code = code.replace(/^\s*|\s*$/g, '');
			// Hanging commas
			code = code.replace(/\,\s*\)/g, ')');
			code = code.replace(/\,\s*\}/g, '}');
			// Comments /*...*/
			code = code.replace(/\/\*.*\*\/$/g, '');
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
				refFuncs[Dict.settings.functionsFirst?'push':'unshift']('each('+evalEvent+')');
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
			// We can call other CSS functions from content code, like this:
			// CSSJS.dispatch('funcName', $this);
			// But its a lot to write, so lets parse to that from this format:
			// -funcName($this)
			var dispatches = content.match(/[\w\-]{1,}\([\w\$]*\)/g);
			if(dispatches != null) dispatches = dispatches.filter(function(e){return e.indexOf(prefix)===0;});
			if(dispatches != null && dispatches.length > 0) {
				for(var _d in dispatches) {
					var disp = dispatches[_d];
					var funcName = disp.substring(disp.lastIndexOf(prefix)+1, disp.lastIndexOf('('));
					var arg = disp.substring(disp.lastIndexOf('(')+1, disp.lastIndexOf(')'));
					var replace = 'CSSJS.dispatch(\''+funcName+'\'';
					replace += (arg.length ? (', '+arg+')') : ')');
					content = content.split(disp).join(replace);
				}
			};
			// Find and replace all simple tokens
			for(var find in tokens)
				content = content.split(find).join(tokens[find]);
			// Return tokenized content code
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
		window.CSSJS = new CssJs().init();
	});

/**
 * End privitive code
 */
}(jQuery));
