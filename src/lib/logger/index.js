/** @module lib/logger */

import BrowserConsole from 'lib/logger/BrowserConsole';

const { homedir, platform } = nw.require('os');
const { join } = nw.require('path');
const fs = nw.require('fs-extra');
const { createLogger, format } = nw.require('winston');
const DailyRotateFile = nw.require('winston-daily-rotate-file');

let uncaughtTypeErrors = 0;

function getLogPath(appName) {
	const p = platform() === 'darwin' ? 'osx' : 'win';
	let logPath = '';

	switch (p) {
		case 'osx':
			logPath = join(homedir(), `Library/Logs/${appName}/`);
			break;

		case 'win':
			logPath = join(homedir(), `AppData\\Local\\${appName}\\Logs\\`);
			break;

		default:
			throw new Error('unsupported paltform');
	}

	return logPath;
}

const logPath = getLogPath(nw.App.manifest.name);

fs.ensureDirSync(logPath);

const logger = createLogger({
	transports: [
		new DailyRotateFile({
			level: LOG_LEVEL,
			filename: 'application-%DATE%.log',
			datePattern: 'YYYY-MM-DD',
			dirname: logPath,
			maxFiles: '7d',
			format: format.combine(
				format.timestamp(),
				format.align(),
				format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
			),
		}),
	],
});

if (DEVELOPMENT) {
	logger.add(new BrowserConsole({ level: 'silly' }));
}

logger.info(`Logging output directory: ${logPath}`);

export default logger;

/**
 * @method log
 * @param {string} level log level
 * @param {string} message log message
 */
export const log = (level, message) => logger.log(level, message);

/**
 * @method info
 * @param {string} message log message
 */
export const info = message => logger.log('info', message);

/**
 * @method error
 * @param {string} message log message
 */
export const error = message => logger.log('error', message);

/**
 * @method warn
 * @param {string} message log message
 */
export const warn = message => logger.log('warn', message);

/**
 * @method warning
 * @param {string} message log message
 */
export const warning = message => logger.log('warn', message);

/**
 * @method debug
 * @param {string} message log message
 */
export const debug = message => logger.log('debug', message);

/**
 * @method silly
 * @param {string} message log message
 */
export const silly = message => logger.log('silly', message);

/**
 * @method verbose
 * @param {string} message log message
 */
export const verbose = message => logger.log('verbose', message);


function handleUncaughtErrors(error) {
	if (error.message.startsWith('Uncaught TypeError')) {
		uncaughtTypeErrors += 1;
		logger.info(`uncaught type errors since start: ${uncaughtTypeErrors}`);
	}
	logger.error(`"${error.message}" in "${error.filename}" (${error.lineno}:${error.colno})`);
}

if (window) {
	window.addEventListener('error', handleUncaughtErrors);
}

if (process) {
	process.on('uncaughtException', handleUncaughtErrors);
}
