/**
 * Initialize POPUP namespace
 */
var POPUP = {};

POPUP.Handler = {

	init: function() {
		this._bindEvents();
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

POPUP.Search = function() {this._init()}
POPUP.Search.prototype = {

	_init: function() {
		
	}

}

// initialize popup javascript
$(function() {
	CORE.initPage();
	POPUP.Handler.init();
});