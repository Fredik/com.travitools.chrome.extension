/**
 * Initialize POPUP namespace
 */
var POPUP = {};

POPUP.Handler = {

	init: function() {
		CORE.Collapsible.init();
		$('*[data-required-options]').each(function(index, element) {
			required = $(element).data('requiredOptions').split(' ');
			$.each(required, function(index, option) {
				if(!localStorage.getItem(option) || localStorage.getItem(option) == 'false') {
					$(element).remove();
					return false;
				}
			});
		});

		this._bindEvents();
		if(localStorage.getItem('attendance') == 'true') {
			new POPUP.Attendance();
		}
		if(localStorage.getItem('marketplace') == 'true') {
			new POPUP.Marketplace();
		}
		if(localStorage.getItem('search') == 'true') {
			new POPUP.Search();
		}
	},

	changeContainer: function changeContent(target, direction) {
		if(direction == undefined) direction = 'right';
		var current = $('body > *:visible');

		current.hide();target.show();
		var height = $('body').outerHeight() - 16;
		current.show();target.hide();

		$('body').height($('body').outerHeight());
		target.show().css({
			position: 'absolute',
			left: (direction == 'left') ? -260 : 260,
			opacity: 0
		});
		current.css('position', 'absolute');
		current.animate({
			left: (direction == 'left') ? 260 : -260,
			opacity: 0
		}, 300);
		target.animate({
			left: 0,
			opacity: 1
		}, 300);
		$('body').animate({height: height}, 400, function() {
			target.removeAttr('style');
			current.removeAttr('style').hide();
			$('body').removeAttr('style');
		});
	},

	/**
	 * @param	status		string
	 * @param	comment		string
	 * @param	callback	function
	 */
	updateTimeline: function(status, comment, callback) {
		if(comment == undefined) comment = '';
		$.ajax({
			url: 'http://travitools.com/'+ chrome.i18n.getMessage('@@ui_locale') +'/UserTimelineCreateEntry/',
			data: {
				userID: localStorage.getItem('userID'),
				password: localStorage.getItem('password'),
				status: status,
				comment: comment
			},
			type: 'POST',
			success: callback
		});
	},

	_bindEvents: function() {
		$('.backward').click($.proxy(function() {
			this.changeContainer($('#mainmenu'), 'left');
		}, this));
		$('#timelineContainer li').click($.proxy(this._timelineEntryClick, this));
		$('#settings').click(function() {
			chrome.tabs.create({url:chrome.extension.getURL('settings/index.html')});
		});
	},

	/**
	 * handle click upon an timeline entry add link (don't support comments)
	 */
	_timelineEntryClick: function(event) {
		$element = $(event.currentTarget);
		this.updateTimeline($element.data('timelineStatus'));
	}

}

/**
 * Provides attendance control related functions
 */
POPUP.Attendance = function() {this._init()}
POPUP.Attendance.prototype = {

	/**
	 * @var	jquery
	 */
	_container: null,

	/**
	 * loading state
	 * @var	boolean
	 */
	_loaded: false,

	_init: function() {
		this._container = $('#attendanceContainer ul');
		$('#attendance').click($.proxy(this._load, this));
	},

	_bindEvents: function() {
		this._container.children('li').click($.proxy(this._handleBathhouseClick, this));
	},

	/**
	 * executed when user click upon an bathhouse
	 * @param	event		object
	 */
	_handleBathhouseClick: function(event) {
		var $row = $(event.currentTarget);

		// check if current tab is a travians tab
		chrome.permissions.contains({permissions:['tabs']}, $.proxy(function(result) {
			if(!result) this._open($row.data('bathhouseId'));
			chrome.tabs.query({active:true,currentWindow:true,status:'complete'}, $.proxy(function(tabs) {
				var tab = tabs.pop();
				if(CORE.traviansTab(tab)) {
					// load rooms here
				} else {
					this._open($row.data('bathhouseId'));
				}
			}, this));
		}, this));
	},

	/**
	 * load controlable bathhouses from server
	 */
	_load: function() {
		if(this._loaded) {
			POPUP.Handler.changeContainer($('#attendanceContainer'));
			return;
		}
		$.ajax({
			url: 'http://travitools.com/de/AttendanceGetControllableBathhouses/',
			data: {
				userID: localStorage.getItem('userID'),
				password: localStorage.getItem('password')
			},
			type: 'POST',
			success: $.proxy(this._success, this)
		});
	},

	/**
	 * open bathhouse control in new tab (e.g. because we have no access to tabs api)
	 * @param	bathhouseID	integer
	 */
	_open: function(bathhouseID) {
		chrome.tabs.create({url:'http://travitools.com/'+ chrome.i18n.getMessage('@@ui_locale') +'/attendance/control/'+ bathhouseID +'/'});
	},

	/**
	 * @param	data		object
	 */
	_success: function(data) {
		this._loaded = true;
		$.each(data, $.proxy(function(index, bathhouse) {
			$li = $('<li class="cpointer" data-bathhouse-id="'+ bathhouse.bathhouseID +'"></li>');
			$li.append('<img src="'+ bathhouse['avatar'] +'" alt="" class="left" />');
			$li.append('<span>'+ bathhouse['username'] +'</span>');
			$li.appendTo(this._container);
		}, this));

		// change container
		POPUP.Handler.changeContainer($('#attendanceContainer'));
		this._bindEvents();
	}

}

POPUP.Marketplace = function() {this._init()}
POPUP.Marketplace.prototype = {

	/**
	 * marketplace container
	 * @var	jquery
	 */
	_container: null,

	/**
	 * initialize marketplace market system
	 */
	_init: function() {
		this._container = $('#npc');
		if(!localStorage.getItem('marketplace_timestamp') || localStorage.getItem('marketplace_timestamp') < (new Date().getTime() - 3600000)) {
			this._loadPrices();
		}

		this._insert({
			wood: [localStorage.getItem('marketplace_wood_min'), localStorage.getItem('marketplace_wood_max')],
			clay: [localStorage.getItem('marketplace_clay_min'), localStorage.getItem('marketplace_clay_max')],
			ore: [localStorage.getItem('marketplace_ore_min'), localStorage.getItem('marketplace_ore_max')],
			grain: [localStorage.getItem('marketplace_grain_min'), localStorage.getItem('marketplace_grain_max')],
			flour: [localStorage.getItem('marketplace_flour_min'), localStorage.getItem('marketplace_flour_max')],
			coal: [localStorage.getItem('marketplace_coal_min'), localStorage.getItem('marketplace_coal_max')],
			boards: [localStorage.getItem('marketplace_boards_min'), localStorage.getItem('marketplace_boards_max')],
			bricks: [localStorage.getItem('marketplace_bricks_min'), localStorage.getItem('marketplace_bricks_max')],
			iron: [localStorage.getItem('marketplace_iron_min'), localStorage.getItem('marketplace_iron_max')],
			bread: [localStorage.getItem('marketplace_bread_min'), localStorage.getItem('marketplace_bread_max')]
		});
	},

	/**
	 * load marketplace prices from travitools.com marketplace api
	 */
	_loadPrices: function() {
		$.ajax({
			url: 'http://travitools.com/'+ chrome.i18n.getMessage('@@ui_locale') +'/MarketplaceNPCPrices/',
			success: $.proxy(function(data) {
				var complete = true;
				$.each(data, function(index, value) {
					if(value.min == 0 || value.min == null) {
						complete = false;
						return false;
					}
				});

				// display message if marketplace prices not complete
				if(!complete) {
					this._container.after('<div style="text-align:center;height:50px;line-height:50px">'+ chrome.i18n.getMessage('marketplace_outdated') +'</div>');
					this._container.remove();
					return;
				}

				// save prices in local storage (unfortunately local storage only support strings)
				localStorage.setItem('marketplace_timestamp', new Date().getTime());
				$.each(data, function(index, value) {
					if(index == 'timestamp') return;
					localStorage.setItem('marketplace_'+ index +'_min', value.min);
					localStorage.setItem('marketplace_'+ index +'_max', value.max);
				});
			}, this)
		});
	},

	/**
	 * insert marketplace prices
	 * @param	prices		object
	 */
	_insert: function(prices) {
		$.each(prices, $.proxy(function(index, value) {
			this._container.find('p[data-res="'+ index +'"]').text(value[0] +' / '+ value[1]);
		}, this));
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