#!/usr/bin/env node
const VERSION = '0.1.0';

const shell = require('./helper/shell');
const print = require('./helper/print');
const { build } = require('../package.json');
const { resolve } = require('path');

const util = require('util');

const DEFAULT_DIR = '.';

const argv = require('yargs') // eslint-disable-line
	.version(VERSION)
	.option('arch', {
		alias: 'a',
		choices: ['x64', 'ia32'],
		default: 'x64',
		description: 'architecture you want to build for',
		string: true,
	})
	.option('target', {
		alias: 't',
		description: 'target directory to run compilation. (Relative path)',
		default: DEFAULT_DIR,
		string: true,
	})
	.argv;

(async () => {
	try {
		if (!build || !build.nwVersion) {
			throw new Error('Could not find nw.js version.');
		}

		const targetDirectory = resolve(__dirname, '../', argv.target);
		print(`targeting directory ${targetDirectory}...`);

		print('running compilation on binary dependencies');
		await shell(`node-pre-gyp install --build-from-source --directory=./node_modules/sqlite3 --runtime=node-webkit --target_arch=${argv.arch} --target=${build.nwVersion}`, {
			cwd: targetDirectory,
			verbose: true,
		});
	}
	catch (e) {
		console.log(util.inspect(e));
		print(e.message || 'Failed with unknown error.');
		process.exit(1);
	}

	process.exit(0);
})();
