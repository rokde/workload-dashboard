/**
 * returns business days [past, upcoming]
 * @returns {*[]}
 */
function businessDays() {
	"use strict";

	var date = new Date();

	// Copy date
	var t = new Date(date);
	// Remember the month number
	var m = date.getMonth();
	var d = date.getDate();
	var daysPast = 0, daysToGo = 0;
	var day;

	// Count past days
	while (t.getMonth() == m) {
		day = t.getDay();
		daysPast += (day == 0 || day == 6) ? 0 : 1;
		t.setDate(--d);
	}

	// Reset and count days to come
	t = new Date(date);
	t.setDate(t.getDate() + 1);
	d = t.getDate();

	while (t.getMonth() == m) {
		day = t.getDay();
		daysToGo += (day == 0 || day == 6) ? 0 : 1;
		t.setDate(++d);
	}
	return [daysPast, daysToGo];
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

Vue.filter('fixed', function (value) {
	"use strict";

	return value != undefined
		? new Intl.NumberFormat("de-DE", {minimumFractionDigits: 2}).format(value)
		: null;
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
				proxyUrl += '&start=' + this.start;
			}
			if (this.end !== null) {
				proxyUrl += '&end=' + this.end;
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
					}.bind(username, hours));

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

		autoRefresh: function () {
			"use strict";

			if (this.canRefresh()) {
				this.fetchAllProjects();
			}
		},

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
		businessDays: function () {
			return businessDays();
		}
	}
});

window.onfocus = vm.autoRefresh;
