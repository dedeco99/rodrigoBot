const { get } = require("./request");
const secrets = require("./secrets");
const {
	getChannels,
	postChannel,
	deleteChannel,
	getNotifications,
	addNotification
} = require("./database");

const checkIfChannelExists = async (channel) => {
	const url = `https://api.twitch.tv/helix/users?login=${channel}`;

	const headers = {
		"Accept": "application/vnd.twitchtv.v5+json",
		"Client-ID": secrets.twitchClientId
	};

	const res = await get(url, headers);
	const json = JSON.parse(res);

	return json.data.length > 0 ? { "exists": true, "item": json } : { "exists": false };
};

const getStream = (msg, client) => {
	const channel = msg.content.split("twitch ")[1];
	const url = `https://www.twitch.tv/${channel}`;

	client.user.setActivity(channel, { url, type: "WATCHING" });

	return url;
};

const checkIfChannelInDatabase = async (query) => {
	const channels = await getChannels(query);

	return channels.length > 0 ? { exists: true, id: channels[0]._id } : false;
};

const checkIfNotificationExists = async (query) => {
	const notifications = await getNotifications(query);

	return notifications.length > 0;
};

const addChannel = async (msg) => {
	const channel = msg.content.split("twitch add ")[1];

	const { exists, item } = await checkIfChannelExists(channel);
	if (exists) {
		const { exists } = await checkIfChannelInDatabase({ "channel": item.data[0].login, "platform": "twitch" });
		if (exists) return "Esse canal já existe seu lixo";

		const channel = {
			"name": item.data[0].login,
			"channel": item.data[0].login,
			"platform": "twitch"
		};

		postChannel(channel);

		return "Canal adicionado com sucesso my dude";
	}

	return "Esse canal deve estar no xixo porque não o encontro";
};

const removeChannel = async (msg) => {
	const channel = msg.content.split("twitch remove ")[1];

	const { exists, id } = await checkIfChannelInDatabase({ "name": channel, "platform": "twitch" });

	if (exists) {
		deleteChannel(id);
		return "Canal removido com sucesso my dude";
	}

	return "Esse canal deve estar no xixo porque não o encontro";
};

const fetchChannels = async () => {
	let channels = await getChannels({ platform: "twitch" });

	channels = channels.map(channel => channel.name).join(" | ");

	return channels;
};

const fetchNotifications = async () => {
	const channels = await getChannels({ platform: "twitch" });

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

	const res = get(url, headers);
	const json = JSON.parse(res);

	for (let i = 0; i < json.data.length; i++) {
		const ONE_HOUR = 60 * 60 * 1000;
		if (new Date() - new Date(json.data[i].started_at) < ONE_HOUR) {
			const exists = await checkIfNotificationExists({ video: json.data[i].user_name, started: json.data[i].started_at });
			if (!exists) {
				addNotification({ "video": json.items[0].snippet.resourceId.videoId });

				return `**${json.data[i].user_name}** está live! | https://twitch.tv/${json.data[i].user_name}`;
			}
		}
	}
};

const checkForCommand = async (msg, client) => {
	const features = [
		{ command: "add", func: addChannel },
		{ command: "remove", func: removeChannel },
		{ command: "get", func: fetchChannels }
	];

	const command = msg.content.split(" ")[2];
	const feature = features.find(feature => feature.command === command);

	let res = null;
	if (feature) {
		res = await feature.func(msg);
	} else {
		res = await getStream(msg, client);
	}

	return res;
};

module.exports = {
	fetchNotifications,
	checkForCommand
};
