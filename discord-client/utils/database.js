const mongoose = require("mongoose");

const secrets = require("./secrets");

const Meta = require("../models/meta");

function initialize() {
	mongoose.connect(secrets.databaseConnectionString, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
}

/* Meta */

async function updateMeta(obj) {
	let body = obj;
	if (obj.likes) {
		body = { $inc: { likes: 1 } };
	} else if (obj.dislikes) {
		body = { $inc: { dislikes: 1 } };
	}

	const meta = await Meta.findOneAndUpdate({}, body, { new: true });

	return meta;
}

module.exports = {
	initialize,
	updateMeta,
};
