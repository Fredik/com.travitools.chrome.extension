/**
 * Initialize POPUP namespace
 */
var POPUP = {};

POPUP.Handler = {

	init: function() {
		CORE.Collapsible.init();
		this._bindEvents();

		new POPUP.Search();
	},

	_bindEvents: function() {
		$('#settings').click(function() {
			chrome.tabs.create({url:chrome.extension.getURL('settings/index.html')});
		});
	}

}

POPUP.Marketplace = function() {this._init()}
POPUP.Marketplace.prototype = {

	_container: null,

	_init: function() {
		this._container = $('#npc');
	}

}

/**
 * Provides search related functions
 */
POPUP.Search = function() {this._init()}
POPUP.Search.prototype = {

	/**
	 * list of all containers which was hidden
	 * @var	array
	 */
	_container: new Array(),

	/**
	 * form element
	 * @var	jquery
	 */
	_form: null,

	/**
	 * input element
	 * @var	jquery
	 */
	_input: null,

	/**
	 * initialize search system
	 */
	_init: function() {
		this._form = $('#searchContainer form');
		this._input = $('#searchContainer input');
		this._bindEvents();
	},

	/**
	 * bind events
	 */
	_bindEvents: function() {
		this._form.submit($.proxy(function(event) {
			event.preventDefault();
			chrome.tabs.create({url: 'http://travianerwiki.de/index.php?title=Spezial:Suche&search='+ this._input.val()});
		}, this));
		this._input.keyup($.proxy(this._getSearchSuggestions, this));
	},

	/**
	 * get search suggestions via travianer wiki api
	 */
	_getSearchSuggestions: function() {
		this._removeSuggestions();
		var value = this._input.val();
		if(value) {
			this._form.find('button').removeAttr('disabled');
			this._hideContainer();
			$.ajax({
				url: 'http://travianerwiki.de/api.php',
				cache: true,
				data: {
					format: 'json',
					action: 'opensearch',
					search: value,
					namespace: 0
				},
				dataType: 'json',
				success: $.proxy(this._success, this)
			});
		} else {
			$('.sResults').hide();
			this._form.find('button').attr('disabled', 'disabled');
			this._showContainer();
		}
	},

	_hideContainer: function() {
		this._container = new Array();
		$('#mainmenu .jsCollapsible[src="../images/arrowDown.svg"]:not([data-collapsible-container="searchContainer"])').each($.proxy(function(index, button) {
			var $button = $(button);
			this._container.push($button.data('collapsibleContainer'));
			$button.click();
		}, this));
	},

	_showContainer: function() {
		$.each(this._container, function(index, value) {
			$('.jsCollapsible[data-collapsible-container="'+ value +'"]').click();
		});
	},

	/**
	 * insert search suggestions and bind events
	 * @param	data		object
	 */
	_success: function(data) {
		if(data[1].length) {
			this._removeSuggestions();
			$('.sResults').show();
			for(var k = 0; k < data[1].length; k++) {
				$('<li class="cpointer"><span>'+ data[1][k] +'</span></li>').appendTo('.sResults .updates').click($.proxy(function(event) {
					this._input.val($(event.currentTarget).children().text());
					this._form.submit();
				}, this));
			}
		} else {
			$('.sResults').hide();
			this._showContainer();
		}
	},

	/**
	 * remove search suggestions
	 */
	_removeSuggestions: function() {
		$('.sResults .updates > li').remove();
	}

}

// initialize popup javascript
$(function() {
	CORE.initPage();
	POPUP.Handler.init();
});