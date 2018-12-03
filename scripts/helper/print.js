module.exports = function print(msg, ignore = false) {
	if (!ignore) {
		console.log(msg);  // eslint-disable-line
	}
};
