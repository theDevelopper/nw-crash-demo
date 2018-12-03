const path = require('path');

module.exports = {
	resolve: {
		extensions: ['.js', '.vue', '.json'],
		modules: [
			path.resolve(__dirname, 'src'),
			'node_modules'
		],
		alias: {
			'vue$': 'vue/dist/vue.esm.js',
		}
	},
};
