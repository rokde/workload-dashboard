Vue.filter('sum',
	/**
	 * returns workload based sum over all projects for given name
	 * @param {object} value
	 * @returns {number}
	 */
	function (value) {
		"use strict";

		var project = value.name;
		var sum = 0;

		if (this.workload[project] !== undefined) {
			for (var user in this.workload[project]) {
				if (this.workload[project].hasOwnProperty(user)) {
					sum += parseFloat(this.workload[project][user]);
				}
			}
		}

		return sum;
	}
);
