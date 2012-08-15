/**
 * Initialize SETTINGS namespace
 */
var SETTINGS = {};

SETTINGS.Handler = {

	/**
	 * @var	integer
	 */
	_timeout: null,

	init: function() {
		this._bindEvents();
		this._setDefaultValues();

		window.setInterval(function() {
			var current = parseInt($('#successMessage p:last-child span').text());
			$('#successMessage span').text(current + 1);
		}, 1000);
	},

	_bindEvents: function() {
		$('#modules input[data-container-id]').change($.proxy(function(event) {
			$checkbox = $(event.currentTarget);
			this.toggleContainer($checkbox.data('container-id'), $checkbox.is(':checked'));
		}, this));
		$('#main input').change($.proxy(this._change, this));
	},

	_change: function(event) {
		var $input = $(event.currentTarget);
		var inputType = $input.attr('type');

		// check of userID and password
		if($input.attr('name') == 'userID' || $input.attr('name') == 'password') {
			new SETTINGS.AccountHandler($('input[name="userID"]').val(), $('input[name="password"]').val());
			return;
		}

		if(inputType == 'checkbox') {
			if($input.is(':checked')) localStorage.setItem($input.attr('name'), 'true');
			else localStorage.setItem($input.attr('name'), 'false');
		} else {
			localStorage.setItem($input.attr('name'), $input.val());
		}

		// inform user
		$('#successMessage span').text(0);
		this.toggleContainer('successMessage', true);
		clearTimeout(this._timeout);
		this._timeout = window.setTimeout(function() {
			$('#successMessage').slideUp('fast');
		}, 5000);
	},

	_setDefaultValues: function() {
		$('#main input').each(function() {
			var $input = $(this);
			var name = $input.attr('name');

			if($input.attr('type') == 'password') {
				$input.attr('placeholder', chrome.i18n.getMessage('login_confirmed'));
				retrun;
			}

			// set default value
			if(localStorage.getItem(name) && localStorage.getItem(name) != 'false') {
				if($input.is(':checkbox')) {
					$input.attr('checked', 'checked');
				} else {
					$input.val(localStorage.getItem(name));
				}
			}
		});
	},

	/**
	 * @param	containerID	integer
	 * @param	display		boolean
	 */
	toggleContainer: function(containerID, display) {
		if(display == undefined) $('#'+containerID).toggleSlide('normal');
		else {
			if(display) {
				$('#'+containerID).slideDown('fast');
			} else {
				$('#'+containerID).slideUp('normal');
			}
		}
	}

}

SETTINGS.AccountHandler = function(userID, password) {this._init(userID, password)}
SETTINGS.AccountHandler.prototype = {

	/**
	 * not hashed password
	 * @var	string
	 */
	_password: '',

	/**
	 * @var	integer
	 */
	_userID: 0,

	_init: function(userID, password) {
		this._password = password;
		this._userID = userID;

		$('#checkPassword').show();

		this._checkPassword();
	},

	_checkPassword: function() {
		if(this._password == '' || this._userID == 0) return;
		$.ajax({
			url: 'http://travitools.com/de/APILogin/',
			data: {
				userID: this._userID,
				password: this._password
			},
			type: 'POST',
			success: $.proxy(this._success, this)
		});
	},

	/**
	 * will be executing when api successfully loaded
	 */
	_success: function(data) {
		$('#checkPassword').fadeOut(200);

		if(data == 'missing parameter "userID" or "password') return; /* should prevent before calling server anyway */
		if(data == 'invalid userID given') {
			alert(chrome.i18n.getMessage('login_user_not_found'));
			return;
		}
		if(data == 'login failed') {
			alert(chrome.i18n.getMessage('login_failed'));
			return;
		}

		localStorage.setItem('userID', this._userID);
		localStorage.setItem('password', data);
	}

}

// initialize settings javascript
$(function() {
	CORE.initPage();
	SETTINGS.Handler.init();
});