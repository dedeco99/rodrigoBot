const mongoose = require("mongoose");

const secrets = require("./secrets");

mongoose.set("useFindAndModify", false);
mongoose.connect(secrets.databaseConnectionString, { useNewUrlParser: true });

const MetaSchema = require("./models/meta").Model;
const Meta = mongoose.model("Meta", MetaSchema);
const ChannelSchema = require("./models/channel").Model;
const Channel = mongoose.model("Channel", ChannelSchema);
const NotificationSchema = require("./models/notification").Model;
const Notification = mongoose.model("Notification", NotificationSchema);

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

const postNotification = async (notification) => {
	const newNotification = new Notification(notification);

	await newNotification.save();
};

/* eslint-disable sort-keys */
module.exports = {
	getMeta,
	updateMeta,
	getChannels,
	postChannel,
	deleteChannel,
	postNotification
};
