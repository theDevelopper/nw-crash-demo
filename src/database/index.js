/** @module database */

import * as logger from 'lib/logger';

const SQLite = nw.require('sqlite');
const fs = nw.require('fs-extra');

let databasePromise;

const config = {
	database: ':memory:'
};

function sillyLogging(db) {
	// if (LOG_LEVEL === 'silly') {
	// 	db.on('trace', (sql) => {
	// 		silly('about to execute SQL:');
	// 		silly(sql);
	// 	});

	// 	db.on('profile', (sql, ms) => {
	// 		silly(`SQL executed within ${ms}ms:`);
	// 		silly(sql);
	//
	// 		if (ms > 200) {
	// 			warning('potential slow query detected!');
	// 		}
	// 	});
	//
	// 	db.on('error', (error) => {
	// 		console.warn(error);
	// 	});
	// }
}

/**
 * @async
 */
export async function hasDatabaseFile() {
	return fs.pathExists(config.database);
}

/**
 * @async
 */
export async function createDatabase() {
	return fs.ensureFile(config.database);
}

/**
 * open the SQL Database if not yet done and return the Database wrapped in a Promise
 * @async
 * @param [migrate=true] should new migrations been applied
 * @returns {Promise<Database>}
 */
export async function openDatabase(migrate = true) {
	logger.silly('opening DB');
	if (databasePromise) {
		logger.silly('taking old instance');

		return databasePromise;
	}

	logger.silly('opening new DB instance');
	databasePromise = await SQLite.open(config.database);
	sillyLogging(databasePromise);

	logger.info(`SQLite opened from ${config.database}`);

	if (migrate) {
		await databasePromise.migrate();
	}

	return databasePromise;
}

/**
 * return the Database connection wrapped in a Promise, opens a new database connection if none exists yet
 * @async
 * @returns {Promise<Database>}
 */
export async function getDatabase() {
	if (!databasePromise) {
		await openDatabase();
	}

	return databasePromise;
}

/**
 * close an existing Database connection
 * @async
 */
export async function closeDatabase() {
	if (databasePromise) {
		await databasePromise.close();
	}

	databasePromise = undefined;
}
