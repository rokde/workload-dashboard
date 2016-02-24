Vue.filter('fixed',
	/**
	 * transforms value to accuracy
	 * <code>
	 *     <span>{{ pi | fixed }}</span>
	 *     <span>{{ pi | fixed 2 }}</span>
	 *     <span>{{ pi | fixed 2 de-DE }}</span>
	 * </code>
	 *
	 * @param {number} value
	 * @param {number} accuracy, optional, default: 2
	 * @param {string} locale, optional, default: de-DE
	 * @returns {*}
	 */
	function (value, accuracy, locale) {
		"use strict";

		if (typeof value !== 'number') {
			return value;
		}

		var acc = accuracy || 2;
		var loc = locale || 'de-DE';

		return value != undefined
			? new Intl.NumberFormat(loc, {minimumFractionDigits: acc, maximumFractionDigits: acc}).format(value)
			: value;
	}
);