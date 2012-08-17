/**
 * Initialize BACKGROUND namespace
 */
var BACKGROUND = {};

BACKGROUND.Handler = {

	/**
	 * hold tab ids of all travians tabs
	 * @var	array<integer>
	 */
	_tabIDs: [],

	/**
	 * initialize background functions
	 */
	init: function() {
		// check if we need to hold a list of all travians list
		if(localStorage.getItem('acousticNotifications') == 'true') {
			this.holdTabList();
		}
	},

	/**
	 * Adds listener to hold an actual list of all travians tabs. Checks also if all apis are available
	 */
	holdTabList: function() {
		chrome.permissions.contains({permissions:['tabs']}, $.proxy(function(result) {
			if(!result) return;

			// add listener for update and remove tabs
			chrome.tabs.onRemoved.addListener($.proxy(function(tabID) {
				this._onRemovedListener(tabID);
			}, this));
			chrome.tabs.onUpdated.addListener($.proxy(function(tabID, changeInfo, tab) {
				this._onUpdatedListener(tabID, changeInfo, tab);
			}, this));

			// search travians tabs on init (needed when holding not starting with browser)
			chrome.windows.getAll({}, $.proxy(function(windows) {
				for(var i in windows) {
					if(windows[i].type == 'normal') {
						chrome.tabs.getAllInWindow(windows[i].id, $.proxy(function(tabs) {
							for(var index in tabs) {
								if(CORE.traviansTab(tabs[index])) {
									this._tabIDs.push(tabs[index].id);
									this._startPeriodicalExecuter();
								}
							}
						}, this));
					}
				}
			}, this));
		}, this));
	},

	/**
	 * fired when a tab is closed
	 * remove tabID from list and stop Periodical executer if needed
	 * @param	tabID		integer
	 */
	_onRemovedListener: function(tabID) {
		console.log(this._tabIDs);
		$.grep(this._tabIDs, function(value) {
			return value != tabID;
		});
	},

	/**
	 * fired when a tab is updated
	 * if travians tab updated and travians closed by this remove tabID
	 * if travians open in tab add tabID
	 * @param	tabID		integer
	 * @param	changeInfo	object
	 * @param	tab		Tab
	 * 
	 * @todo	Use changeInfo instead of always check the tab url
	 */
	_onUpdatedListener: function(tabID, changeInfo, tab) {
		console.log(this._tabIDs);
		if(CORE.traviansTab(tab) && !CORE.inArray(tabID, this._tabIDs)) {
			this._tabIDs.push(tabID);
		} else if(CORE.inArray(tabID, this._tabIDs)) {
			this._onRemovedListener(tabID);
		}
	},

}

// initialize background functions
BACKGROUND.Handler.init();