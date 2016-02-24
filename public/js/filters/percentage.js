Vue.filter('percentage',
	/**
	 * returns the full percentage value of given float
	 * @param {number} value
	 * @returns {number}
	 */
	function (value) {
		"use strict";

		return value * 100;
	}
);