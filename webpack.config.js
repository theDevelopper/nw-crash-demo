const packageJson = require('./package.json');
const path = require('path');
const webpack = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const GenerateJsonPlugin = require('generate-json-webpack-plugin');
const SymlinkWebpackPlugin = require('symlink-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const { resolve } = require('./webpack.resolver');
const os = require('os');

const buildDestinationDirectory = 'dist';
let entry = ['./src/app.js'];
const symlinks = [];

module.exports = (env = {}, argv = {}) => {
	// Set up all configs
	const { mode } = argv;
	const { channel } = env;

	const isTesting = env.test === 1;
	const isLocalBuild = channel === 'dev' || !channel;
	const isProduction = !isLocalBuild;
	const isDevelopment = isLocalBuild;
	const isDebugEnabled = env.debug === 1;

	const platform = os.platform() === 'darwin' ? 'osx' : 'win';
	const isWindows = platform === 'win';

	console.log(`Mode:       ${mode}`);
	console.log(`Debug:      ${isDebugEnabled ? 'enabled' : 'disabled'}`);
	console.log(`Tesing:     ${isTesting ? 'enabled' : 'disabled'}`);

	const appName = `${packageJson.window.title}${isLocalBuild ? '-dev' : ''}`;

	// extend build number
	const buildNumber = env.build || '';
	const commitHash = env.commit || '';
	const buildYear = (new Date()).getFullYear();
	const buildChannel = channel !== 'stable' ? channel : '';
	const buildInfo = `${buildChannel} ${buildNumber} ${commitHash}`.trim().replace(' ', '.');
	let logLevel = 'silly';

	if (channel === 'stable') {
		logLevel = 'info';
	}

	// create slimmed package.json for build
	const distPackage = {
		name: appName,
		version: packageJson.version,
		'chromium-args': packageJson['chromium-args'],
		build: {
			info: buildInfo,
			channel: channel,
			number: buildNumber,
		},
		main: packageJson.main,
		window: packageJson.window,
		dependencies: packageJson.dependencies
	};

	// setup unit and vue testing
	if (!isTesting && !isWindows) {
		symlinks.push({ origin: '../node_modules', symlink: 'node_modules' });
	}

	const copyRules = [

		{
			from: './migrations',
			to: './migrations',
			toType: 'dir',
		},
		{
			from: './package-lock.json',
			toType: 'file',
		},
	];

	return {
		entry,
		resolve,
		output: {
			path: path.resolve(__dirname, buildDestinationDirectory),
			filename: 'app.js',
		},
		module: {
			rules: [
				{
					test: /\.svg$/,
					loader: 'html-loader',
					options: {
						minimize: false
					}
				},
				{
					test: /\.vue$/,
					loader: 'vue-loader',
					options: {
						minimize: false
					}
				},
			],
		},
		devtool: isDebugEnabled ? 'inline-sourcemap' : false,
		watchOptions: {
			ignored: /node_modules/,
		},
		plugins: [
			// force in-memory execution to still write to fs for nw.js
			new WriteFilePlugin(),

			// write new package.json
			new GenerateJsonPlugin('package.json', distPackage),

			// copy static resources
			new CopyWebpackPlugin(copyRules),

			// enable VUE files
			new VueLoaderPlugin(),

			// compile HTML template
			new HtmlWebpackPlugin({
				filename: 'index.html',
				template: 'index.html',
				inject: false,
				templateParameters: {
					title: appName,
					DEBUG: isDebugEnabled,
				},
			}),

			// replace global constants
			new webpack.DefinePlugin({
				PRODUCTION: JSON.stringify(isProduction && channel !== 'nightly' && channel !== 'beta' && channel !== 'feature'),
				STAGING: JSON.stringify(isProduction && (channel === 'nightly' || channel === 'beta' || channel === 'feature')),
				DEVELOPMENT: JSON.stringify(isDevelopment),
				TEST: JSON.stringify(isTesting),
				DEBUG: JSON.stringify(isDebugEnabled),
				APP_NAME: JSON.stringify(appName),
				VERSION: JSON.stringify(packageJson.version),
				CHANNEL: JSON.stringify(channel.charAt(0).toUpperCase() + channel.slice(1)),
				BUILD: JSON.stringify(buildNumber),
				BUILD_YEAR: JSON.stringify(buildYear),
				LOG_LEVEL: JSON.stringify(logLevel),
			}),

			// symlink node_modules to not have to reinstall all modules during development
			new SymlinkWebpackPlugin(symlinks)
		],
	};
};
