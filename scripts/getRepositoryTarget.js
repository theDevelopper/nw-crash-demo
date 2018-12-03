#!/usr/bin/env node
const VERSION = '0.1.0';

const { build } = require('../package.json');

const argv = require('yargs') // eslint-disable-line
	.version(VERSION)
	.option('repository', {
		alias: 'r',
		description: 'repository to check for target',
		string: true,
		choices: ['trackingcore', 'installer', 'starter'],
		required: true,
	})
	.option('platform', {
		alias: 'p',
		description: 'platform to check repository for',
		string: true,
		choices: ['mac', 'win'],
		required: true,
	})
	.argv;

let target = 'master';

try {
	target = build[argv.platform].git[argv.repository] || target;
}
catch (e) {}

console.log(target);
