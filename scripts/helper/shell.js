const { exec } = require('child_process');
const print = require('./print');

module.exports = async function shell(cmd, options = { verbose: false }) {
	return new Promise((resolve, reject) => {
		const shellProcess = exec(cmd, options, (error, stdout, stderr) => {
			if (error) {
				reject(stderr);
			}

			resolve(true);
		});

		if (options.verbose) {
			shellProcess.stdout.on('data', data => print(data));
		}
	});
};
