const mongoose = require("mongoose");

const secrets = require("./secrets");

mongoose.set("useFindAndModify", false);
mongoose.connect(secrets.databaseConnectionString, { useNewUrlParser: true });

const Meta = require("./models/meta");
const Channel = require("./models/channel");
const Notification = require("./models/notification");
const InsideJoke = require("./models/insideJoke");

/* Meta */

const getMeta = async () => {
	return await Meta.findOne();
};

const updateMeta = async (obj) => {
	let body = obj;
	if (obj.likes) {
		body = { $inc: { likes: 1 } };
	} else if (obj.dislikes) {
		body = { $inc: { dislikes: 1 } };
	}

	return await Meta.findOneAndUpdate({}, body, { new: true });
};

/* Channel */

const getChannels = async (query) => {
	return await Channel.find(query).collation({ "locale": "en" }).sort({ name: 1 });
};

const postChannel = async (channel) => {
	const newChannel = new Channel(channel);

	await newChannel.save();
};

const deleteChannel = async (channel) => {
	await Channel.deleteOne({ _id: channel });
};

/* Notification */

const postNotification = async (notification) => {
	const newNotification = new Notification(notification);

	await newNotification.save();
};

/* InsideJoke */

const getInsideJokes = async (query) => {
	return await InsideJoke.find(query);
};

const postInsideJoke = async (insideJoke) => {
	const newInsideJoke = new InsideJoke(insideJoke);

	await newInsideJoke.save();
};

const putInsideJoke = async (id, insideJoke) => {
	await InsideJoke.updateOne({ _id: id }, insideJoke);
};

const deleteInsideJoke = async (insideJoke) => {
	await InsideJoke.deleteOne({ _id: insideJoke });
};

/* eslint-disable sort-keys */
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
	deleteInsideJoke
};
