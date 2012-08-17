/**
 * Class and function collection based upon WoltLab Community Framework
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 */

/**
 * extend local storage to load default settings
 */
var defaultSettings = {}
Storage.prototype.getItem = function(key) {
	var value = this[key];
	if(value == undefined) {
		return defaultSettings[key];
	}
	return value;
}

/**
 * Initialize CORE namespace
 */
var CORE = {};

/**
 * Extends jQuery's chainable methods.
 */
$.fn.extend({

	slideFadeIn: function(duration, callback) {
		var height = this.show().css({height:'auto'}).height();
		this.css({height:0}).animate({
			height: height,
			opacity: 1
		}, duration, callback);
	},

	slideFadeOut: function(duration, callback) {
		if(this.is(':hidden')) return;
		this.animate({
			height: 0,
			opacity: 0
		}, duration, function() {
			$(this).hide();
			callback();
		});
	}

});

/**
 * core methods
 */
$.extend(CORE, {

	/**
	 * Counter for dynamic element id's
	 * @var	integer
	 */
	_idCounter: 0,

	_versions: new Array('travianer.de/game.php', 'travians.com/game.php', 'traviani.it/game.php', 'travianer.fr/game.php', 'travianer.net/game.php'),

	/**
	 * Returns a dynamically created id.
	 * @see		https://github.com/sstephenson/prototype/blob/master/src/prototype/dom/dom.js#L1789
	 * @return	string
	 */
	getRandomID: function() {
		var $elementID = '';

		do {
			$elementID = 'travitools' + this._idCounter++;
		} while($.wcfIsset($elementID));

		return $elementID;
	},

	/**
	 * Wrapper for $.inArray which returns boolean value instead of index value, similar to PHP's in_array().
	 * @param	mixed		needle
	 * @param	array		haystack
	 * @return	boolean
	 */
	inArray: function(needle, haystack) {
		return ($.inArray(needle, haystack) != -1);
	},

	/**
	 * initializes language system and hide all elements witch need specific options
	 */
	initPage: function() {
		$('[data-i18n]:not(.i18n-replaced)').each(function() {
			$(this).html(chrome.i18n.getMessage($(this).data('i18n')));
		});
		$('[data-i18n-value]:not(.i18n-replaced)').each(function() {
			$(this).val(chrome.i18n.getMessage($(this).data('i18n-value')));
		});
		$('[data-i18n-title]:not(.i18n-replaced)').each(function() {
			$(this).attr('title', chrome.i18n.getMessage($(this).data('i18n-title')));
		});
	},

	/**
	 * inject content script (e.g. for attendance control)
	 * @param	tabID		integer		defaults to the active tab of the current window
	 */
	injectContentScript: function(tabID) {
		if(tabID == undefined) tabID = null;
		chrome.tabs.executeScript(tabID, {file:'contentscript.js'});
	},

	/**
	 * check if given tab match versions pattern
	 */
	traviansTab: function(tab) {
		if(tab.url == undefined) return false;
		for(index in this._versions) {
			if(tab.url.indexOf(this._versions[index]) != -1) return true;
		}
		return false;
	}

});

/**
 * Simple implementation for collapsible content.
 */
CORE.Collapsible = {

	/**
	 * Initializes collapsibles.
	 */
	init: function() {
		$('.jsCollapsible').each($.proxy(function(index, button) {
			this._initButton(button);
		}, this));
	},

	/**
	 * Binds an event listener on all buttons triggering the collapsible.
	 * @param	object		button
	 */
	_initButton: function(button) {
		var $button = $(button);
		var $isOpen = $button.data('isOpen');
		if(!$isOpen) {
			$('#' + $button.data('collapsibleContainer')).hide();
		}
		$button.click($.proxy(this._toggle, this));
	},

	/**
	 * Toggles collapsible containers on click.
	 * @param	object		event
	 */
	_toggle: function(event) {
		var $button = $(event.currentTarget);
		var $isOpen = $button.data('isOpen');
		var $target = $('#' + $button.data('collapsibleContainer').replace(/(:|\.)/g, '\\$1'));

		if($isOpen) {
			$target.stop().slideFadeOut(200, $.proxy(function() {
				this._toggleImage($button, 'arrowRight');
			}, this));
			$isOpen = false;
		} else {
			$target.stop().slideFadeIn(200, $.proxy(function() {
				this._toggleImage($button, 'arrowDown');
			}, this));
			$isOpen = true;
		}

		$button.data('isOpen', $isOpen);

		// suppress event
		event.stopPropagation();
		return false;
	},

	/**
	 * Toggles image of target button.
	 * @param	jQuery		button
	 * @param	string		image
	 */
	_toggleImage: function(button, image) {
		button.attr('src', '../images/'+ image +'.svg');
	}

}