

var projectStore = store.get('projects', []);
var userStore = store.get('users', []);

// Vue.config.debug = true;

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
