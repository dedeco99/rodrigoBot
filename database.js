const mongoose = require("mongoose");

const secrets = require("./secrets");

mongoose.set("useFindAndModify", false);
mongoose.connect(secrets.databaseConnectionString, { useNewUrlParser: true });

const Meta = require("./models/meta");
const Channel = require("./models/channel");
const Notification = require("./models/notification");
const InsideJoke = require("./models/insideJoke");
const Birthday = require("./models/birthday");

/* Meta */

function getMeta() {
	return Meta.findOne();
}

function updateMeta(obj) {
	let body = obj;
	if (obj.likes) {
		body = { $inc: { likes: 1 } };
	} else if (obj.dislikes) {
		body = { $inc: { dislikes: 1 } };
	}

	return Meta.findOneAndUpdate({}, body, { new: true });
}

/* Channel */

function getChannels(query) {
	return Channel.find(query).collation({ "locale": "en" }).sort({ name: 1 });
}

async function postChannel(channel) {
	const newChannel = new Channel(channel);

	await newChannel.save();
}

async function deleteChannel(channel) {
	await Channel.deleteOne({ _id: channel });
}

/* Notification */

async function postNotification(notification) {
	const newNotification = new Notification(notification);

	await newNotification.save();
}

/* InsideJoke */

function getInsideJokes(query) {
	return InsideJoke.find(query);
}

async function postInsideJoke(insideJoke) {
	const newInsideJoke = new InsideJoke(insideJoke);

	await newInsideJoke.save();
}

async function putInsideJoke(id, insideJoke) {
	await InsideJoke.updateOne({ _id: id }, insideJoke);
}

async function deleteInsideJoke(insideJoke) {
	await InsideJoke.deleteOne({ _id: insideJoke });
}

/* Birthdays */

function getBirthdays(query) {
	return Birthday.find(query);
}

module.exports = {
	getMeta,
	updateMeta,
	getChannels,
	postChannel,
	deleteChannel,
	postNotification,
	getInsideJokes,
	postInsideJoke,
	putInsideJoke,
	deleteInsideJoke,
	getBirthdays,
};
