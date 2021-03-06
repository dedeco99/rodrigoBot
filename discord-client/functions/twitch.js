const { get } = require("../utils/request");
const secrets = require("../utils/secrets");

const Channel = require("../../discord-client/models/channel");
const Notification = require("../../discord-client/models/notification");

async function checkIfChannelExists(channel) {
	const url = `https://api.twitch.tv/helix/users?login=${channel}`;

	const headers = {
		Accept: "application/vnd.twitchtv.v5+json",
		"Client-ID": secrets.twitchClientId,
	};

	const res = await get(url, headers);
	const json = res.data;

	return json.data.length > 0 ? json : null;
}

async function addChannel(msg) {
	const channelName = msg.content.split("twitch add ")[1];

	const channelFound = await checkIfChannelExists(channelName);
	if (channelFound) {
		const channel = await Channel.findOne({
			guild: msg.guild.id,
			channel: channelFound.data[0].login,
			platform: "twitch",
		});

		if (channel) return "Esse canal já existe seu lixo";

		const newChannel = new Channel({
			guild: msg.guild.id,
			name: channelFound.data[0].login,
			channel: channelFound.data[0].login,
			platform: "twitch",
		});

		await newChannel.save();

		return "Canal adicionado com sucesso my dude";
	}

	return "Esse canal deve estar no xixo porque não o encontro";
}

async function removeChannel(msg) {
	const channelName = msg.content.split("twitch remove ")[1];

	const channel = await Channel.findOne({
		guild: msg.guild.id,
		name: channelName,
		platform: "twitch",
	});

	if (channel) {
		await Channel.deleteOne({ _id: channel._id });

		return "Canal removido com sucesso my dude";
	}

	return "Esse canal deve estar no xixo porque não o encontro";
}

async function fetchChannels(msg) {
	let channels = await Channel.find({
		guild: msg.guild.id,
		platform: "twitch",
	})
		.collation({ locale: "en" })
		.sort({ name: 1 });

	channels = channels.map(channel => channel.name).join(" | ");

	return channels;
}

async function fetchNotifications() {
	const channels = await Channel.find({ platform: "twitch" });

	let channelsString = channels.map(channel => channel.name).join(",");

	channelsString += `user_login=${channelsString}`;

	const url = `https://api.twitch.tv/helix/streams?${channelsString}`;

	const headers = {
		Accept: "application/vnd.twitchtv.v5+json",
		"Client-ID": secrets.twitchClientId,
	};

	const res = await get(url, headers);
	const json = res.data;

	for (let i = 0; i < json.data.length; i++) {
		const ONE_HOUR = 60000 * 60;
		if (new Date() - new Date(json.data[i].started_at) < ONE_HOUR) {
			const exists = await Notification.findOne({
				video: json.data[i].user_name,
				startedAt: json.data[i].started_at,
			});

			if (!exists) {
				const notification = new Notification({
					video: json.data[i].user_name,
					startedAt: json.data[i].started_at,
				});

				notification.save();

				return `**${json.data[i].user_name}** está live! | https://twitch.tv/${json.data[i].user_name}`;
			}
		}
	}

	return null;
}

async function checkForCommand(msg) {
	const features = [
		{ command: "add", func: addChannel },
		{ command: "remove", func: removeChannel },
		{ command: "get", func: fetchChannels },
	];

	const command = msg.content.split(" ")[2];
	const feature = features.find(f => f.command === command);

	try {
		if (feature) return await feature.func(msg);
	} catch (err) {
		return err.message;
	}

	return null;
}

module.exports = {
	fetchNotifications,
	checkForCommand,
};
