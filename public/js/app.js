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
 * @param str
 * @returns {string}
 */
function b64EncodeUnicode(str) {
	"use strict";

	return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
		return String.fromCharCode('0x' + p1);
	}));
}

var projectStore = store.get('projects', []);
var userStore = store.get('users', []);

// Vue.config.debug = true;

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

Vue.filter('percentage', function (value) {
	"use strict";

	return value * 100;
});

Vue.filter('sum', function (value) {
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
});

Vue.filter('filterForProjectUser', function (value, p, u) {
	"use strict";

	var projectName = p.name;
	var userName = u.nickname;

	if (this.workload[projectName] === undefined)
		return;

	if (this.workload[projectName][userName] === undefined)
		return;

	return this.workload[projectName][userName];
});

var vm = new Vue({
	el: '#app',

	data: function () {
		return {
			projects: projectStore,
			newProject: {
				name: '',
				image: '',
				source: 'trac',
				url: '',
				auth: {
					type: 'basic',
					user: '',
					pass: ''
				},
				hourly_rate: 0,
				hours: 0
			},

			workload: {},
			start: moment().startOf('month'),
			end: moment().endOf('month'),
			hoursPerDay: 8,

			users: userStore,
			newUser: {
				nickname: '',
				name: '',
				avatar: null,
				monthly_presence: 1,
				hours: 0
			},

			total: {
				hours: 0,
				sales: 0
			},

			fetching: [],

			showSalesValues: false,
			refresh: {
				active: true,
				pauseBeforeRefresh: 5000,
				lastRun: null
			}
		}
	},

	ready: function () {
		this.fetchAllProjects();
	},

	created: function () {
	},

	methods: {
		resetValues: function () {
			"use strict";

			this.total.hours = 0;
			this.total.sales = 0;

			for (var u in this.users) {
				var user = this.users[u];
				user.hours = 0;
			}
		},

		fetchAllProjects: function () {
			"use strict";

			this.resetValues();

			for (var i in this.projects) {
				var project = this.projects[i];

				this.fetchProject(project);
			}

			this.refresh.lastRun = Date.now();
		},

		/**
		 * fetches data for one project
		 *
		 * @param project
		 */
		fetchProject: function (project) {
			"use strict";

			var proxyUrl = '/proxy.php?source=' + project.source
				+ '&auth.type=' + project.auth.type
				+ '&auth.credentials=' + b64EncodeUnicode(project.auth.user + ':' + project.auth.pass)
				+ '&url=' + encodeURIComponent(project.url);

			if (this.start !== null) {
				proxyUrl += '&start=' + this.start.format('x');
			}
			if (this.end !== null) {
				proxyUrl += '&end=' + this.end.format('x');
			}

			this.fetching.push(project.name);

			$.getJSON(proxyUrl, function (result) {

				var workingHours = {};

				for (var username in result) {
					if (!result.hasOwnProperty(username)) continue;

					var hours = parseFloat(result[username]);

					this.users.some(function (user) {
						if (user.nickname === username) {
							user.hours += hours;
						}
					});

					workingHours[username] = hours;

					this.total.hours += hours;
					this.total.sales += hours * project.hourly_rate;
				}

				Vue.set(this.workload, project.name, workingHours);

				this.fetching.$remove(project.name);
			}.bind(this));
		},

		/**
		 * add a project
		 */
		addProject: function () {
			"use strict";

			var p = {
				name: '',
				image: '',
				source: 'trac',
				url: '',
				auth: {
					type: 'basic',
					user: '',
					pass: ''
				},
				hourly_rate: 0,
				hours: 0
			};

			for (var k in this.newProject) {
				if (this.newProject.hasOwnProperty(k) && p.hasOwnProperty(k))
					p[k] = this.newProject[k];
			}

			this.projects.push(p);

			this.newProject.name = '';
			this.newProject.image = '';
			this.newProject.source = 'trac';
			this.newProject.url = '';
			this.newProject.auth = {type: 'basic', user: '', pass: ''};
			this.newProject.hourly_rate = 0;
			this.newProject.hours = 0;

			store.set('projects', this.projects);
			$('#addProject').modal('hide');
			this.fetchProject(p);
		},

		/**
		 * add a user
		 */
		addUser: function () {
			"use strict";

			var u = {
				nickname: '',
				name: '',
				avatar: '',
				monthly_presence: 1,
				hours: 0
			};

			for (var k in this.newUser) {
				if (this.newUser.hasOwnProperty(k) && u.hasOwnProperty(k))
					u[k] = this.newUser[k];
			}

			if (u.avatar == '') {
				u.avatar = false;
			}

			this.users.push(u);

			this.newUser.nickname = '';
			this.newUser.name = '';
			this.newUser.avatar = false;
			this.newUser.monthly_presence = 1;

			$('#addUser').modal('hide');
			store.set('users', this.users);
		},

		/**
		 * auto refresh data
		 */
		autoRefresh: function () {
			"use strict";

			if (this.canRefresh()) {
				this.fetchAllProjects();
			}
		},

		/**
		 * can we refresh
		 *
		 * @returns {boolean}
		 */
		canRefresh: function () {
			"use strict";

			if (!this.refresh.active) {
				return false;
			}

			var timeGap = Date.now() - this.refresh.lastRun;

			return timeGap > this.refresh.pauseBeforeRefresh;
		}
	},

	computed: {
		/**
		 * forecast for possible hours until the end of current month,
		 * based on the productivity of the selected date range
		 *
		 * @returns {number}
		 */
		forecast: function () {
			var start = moment().add(1, 'days');
			var end = moment().endOf('month');

			return this.productivity * this.hoursPerDay * workday_count(start, end) * this.users.length;
		},

		/**
		 * productivity per user
		 *
		 * @returns {number}
		 */
		productivity: function () {
			var end = this.end.clone();
			if (end.diff(moment()) > 0) {
				end = moment();
			}

			return this.total.hours / (workday_count(this.start, end) * this.hoursPerDay) / this.users.length;
		},

		/**
		 * calculated sales rate value for the current project sales sum
		 *
		 * @returns {number}
		 */
		calculatedSalesRate: function () {
			"use strict";

			return this.total.sales / this.total.hours;
		},

		/**
		 * loading progress number for current project count
		 *
		 * @returns {number}
		 */
		progress: function () {
			"use strict";

			if (this.fetching.length < 1) {
				return 0;
			}

			return 100 - ((this.fetching.length - 1) / this.projects.length * 100);
		}
	}
});

window.onfocus = vm.autoRefresh;
