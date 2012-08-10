/**
 * Class and function collection based upon WoltLab Community Framework
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 */
var versions = new Array('travianer.de/game.php', 'travians.com/game.php', 'traviani.it/game.php', 'travianer.fr/game.php', 'travianer.net/game.php');
var defaultSettings = {}

/**
 * extend local storage to load default settings
 */
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
 * core methods
 */
$.extend(CORE, {

	/**
	 * Counter for dynamic element id's
	 * @var	integer
	 */
	_idCounter: 0,

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
		$('[data-required-storage]').each(function() {
			var itemName = $(this).data('requiredStorage');
			
		});
	},

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
			$target.stop().slideUp('fast', $.proxy(function() {
				this._toggleImage($button, 'arrowRight');
			}, this));
			$isOpen = false;
		} else {
			$target.stop().slideDown('fast', $.proxy(function() {
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
		button.removeAttr('class').addClass('icon jsCollapsible').addClass(image);
	}

}