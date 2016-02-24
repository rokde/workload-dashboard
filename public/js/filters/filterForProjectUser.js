Vue.filter('filterForProjectUser',
	/**
	 * returns workload for project and user
	 * @param {object} value
	 * @param {object} p
	 * @param {object} u
	 * @returns {number}
	 */
	function (value, p, u) {
		"use strict";

		var projectName = p.name;
		var userName = u.nickname;

		if (this.workload[projectName] === undefined)
			return;

		if (this.workload[projectName][userName] === undefined)
			return;

		return this.workload[projectName][userName];
	}
);
