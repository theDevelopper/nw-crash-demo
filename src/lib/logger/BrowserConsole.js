const Transport = nw.require('winston-transport');

/**
 * @class BrowserConsole
 * @extends Transport
 */
export default class BrowserConsole extends Transport {
	/** @constructor */
	constructor(options = {}) {
		super(options);

		this.name = 'BrowserConsole';

		this.levels = {
			error: 0,
			warn: 1,
			warning: 1,
			info: 2,
			verbose: 3,
			debug: 4,
			silly: 5,
			log: 5,
		};

		this.mapping = {
			error: 'error',
			warn: 'warn',
			warning: 'warn',
			info: 'info',
			verbose: 'log',
			log: 'log',
			debug: 'log',
			silly: 'log',
		};

		this.maxLevel = options.level && this.levels.hasOwnProperty(options.level) ? options.level : 'warn';
	}

	/**
	 * @method log
	 * @param {Object} data
	 * @param {string} data.level
	 * @param {string} data.message
	 * @param {Function} callback
	 */
	log({ level, message }, callback) {
		setImmediate(() => {
			this.emit('logged', level);
		});

		if (this.levels[level] <= this.levels[this.maxLevel]) {
			const mappedMethod = this.mapping[level];

			const prefix = `${(new Date()).toISOString()} ${level}:`;

			console[mappedMethod](`${prefix} ${message}`); // eslint-disable-line no-console
		}

		callback();
	}
}
