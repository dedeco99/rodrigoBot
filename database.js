const mongoose = require("mongoose");

const secrets = require("./secrets");

const Meta = require("./models/meta");
const Channel = require("./models/channel");

function initialize() {
	mongoose.set("useFindAndModify", false);
	mongoose.connect(secrets.databaseConnectionString, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
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

/* Channel */

async function getChannels(query) {
	const channels = await Channel.find(query).collation({ "locale": "en" }).sort({ name: 1 });

	return channels;
}

module.exports = {
	initialize,
	updateMeta,
	getChannels,
};
