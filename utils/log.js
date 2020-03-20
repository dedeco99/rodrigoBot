const Log = require("../models/log");

exports.error = function error(err) {
	const log = new Log(err);

	log.save();

	console.log("Error has been logged");
};
