const request = require("request");

const secrets = require("./secrets");
const database = require("./database");
const log = require("./log");

const checkIfChannelExists = (channel, callback) => {
	const url = `https://api.twitch.tv/helix/users?login=${channel}`;

	const headers = {
		"Accept": "application/vnd.twitchtv.v5+json",
		"Client-ID": secrets.twitchClientId
	};

	request({ headers, url }, (error, response, html) => {
		if (error) return log.error(error.stack);
		const json = JSON.parse(html);

		if (json.data.length > 0) {
			return callback(true, json);
		}

		return callback(false, json);
	});
};

const getStream = (msg, callback, client) => {
	const channel = msg.content.split("twitch ")[1];
	const url = `https://www.twitch.tv/${channel}`;

	client.user.setActivity(channel, { url, type: "WATCHING" });

	return callback(url);
};

const checkIfChannelInDatabase = async (query) => {
	const channels = await database.getChannels(query);

	return channels.length > 0 ? { exists: true, id: channels[0]._id } : false;
};

const checkIfNotificationExists = async (query) => {
	const notifications = await database.getNotifications(query);

	return notifications.length > 0;
};

const addChannel = (msg, callback) => {
	const channel = msg.content.split("twitch add ")[1];

	checkIfChannelExists(channel, async (exists, json) => {
		if (exists) {
			const { exists } = await checkIfChannelInDatabase({ "channel": json.data[0].login, "platform": "twitch" });
			if (exists) return callback("Esse canal já existe seu lixo");

			const channel = {
				"name": json.data[0].login,
				"channel": json.data[0].login,
				"platform": "twitch"
			};

			database.postChannel(channel);

			return callback("Canal adicionado com sucesso my dude");
		}

		return callback("Esse canal deve estar no xixo porque não o encontro");
	});
};

const removeChannel = async (msg, callback) => {
	const channel = msg.content.split("twitch remove ")[1];

	const { exists, id } = await checkIfChannelInDatabase({ "name": channel, "platform": "twitch" });

	if (exists) {
		database.deleteChannel(id);
		return callback("Canal removido com sucesso my dude");
	}

	return callback("Esse canal deve estar no xixo porque não o encontro");
};

const getChannels = async (msg, callback) => {
	let channels = await database.getChannels({ platform: "twitch" });

	channels = channels.map(channel => channel.name).join(" | ");

	return callback(channels);
};

const getNotifications = async (callback) => {
	const channels = await database.getChannels({ platform: "twitch" });

	let channelsString = channels.map(channel => channel.name).join(",");

	for (const channel of channels) {
		channelsString += `user_login=${channel.channel}&`;
	}

	channelsString = channelsString.slice(0, -1);

	const url = `https://api.twitch.tv/helix/streams?${channelsString}`;

	const headers = {
		"Accept": "application/vnd.twitchtv.v5+json",
		"Client-ID": secrets.twitchClientId
	};

	request({ headers, url }, async (error, response, html) => {
		if (error) return log.error(error.stack);
		const json = JSON.parse(html);

		for (let i = 0; i < json.data.length; i++) {
			const ONE_HOUR = 60 * 60 * 1000;
			if (new Date() - new Date(json.data[i].started_at) < ONE_HOUR) {
				const exists = await checkIfNotificationExists({ video: json.data[i].user_name, started: json.data[i].started_at });
				if (!exists) {
					database.addNotification({ "video": json.items[0].snippet.resourceId.videoId });

					return callback(`**${json.data[i].user_name}** está live! | https://twitch.tv/${json.data[i].user_name}`);
				}
			}
		}
	});
};

const checkForCommand = (msg, callback, client) => {
	const features = [
		{ command: "add", func: addChannel },
		{ command: "remove", func: removeChannel },
		{ command: "get", func: getChannels }
	];

	const command = msg.content.split(" ")[2];
	const feature = features.find(feature => feature.command === command);

	if (feature) {
		feature.func(msg, (res) => {
			return callback(res);
		});
	} else {
		getStream(msg, (res) => {
			return callback(res);
		}, client);
	}
};

module.exports = {
	getNotifications,
	checkForCommand
};
