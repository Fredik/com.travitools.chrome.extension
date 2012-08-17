/**
 * contentscript.js provides functions which run in the context of a travians page.
 * Note that chrome execute content scripts in an isolated world. That mean this script has no
 * access to any JavaScript variables or functions created by the page. We have only access to the DOM!
 * @see	http://developer.chrome.com/extensions/content_scripts.html#execution-environment
 */
document.write('<script src="jquery.js"></script>');

/**
 * Initialize CONTENTSCRIPT namespace
 */
var CONTENTSCRIPT = {};

/**
 * provides functions to get all bather in current room
 */
CONTENTSCRIPT.Attendance = function(roomID) {this._init(roomID)}
CONTENTSCRIPT.Attendance.prototype = {

	_roomID: 0,

	/**
	 * @param	roomID		integer
	 */
	_init: function(roomID) {
		this._roomID = roomID;
	}

}