/**
 * count work days
 * @param {moment} start
 * @param {moment} end
 * @returns {number}
 */
function workday_count(start, end) {
	if (end.diff(start, 'days') === 0 || start.isSame(end)) {
		return (start.day() == 0 || start.day() == 6) ? 0 : 1;
	}

	var first = start.clone().endOf('week'); // end of first week
	var last = end.clone().startOf('week'); // start of last week
	var days = last.diff(first, 'days') * 5 / 7; // this will always multiply of 7
	var wfirst = first.day() - start.day(); // check first week
	if (start.day() == 0) --wfirst; // -1 if start with sunday
	var wlast = end.day() - last.day(); // check last week
	if (end.day() == 6) --wlast; // -1 if end with saturday
	return wfirst + days + wlast; // get the total
}

/**
 * encode base64 encoded string
 * @param {string} str
 * @returns {string}
 */
function b64EncodeUnicode(str) {
	"use strict";

	return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
		return String.fromCharCode('0x' + p1);
	}));
}