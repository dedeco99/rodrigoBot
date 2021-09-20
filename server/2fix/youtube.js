const errors = require("../utils/errors");
const { get } = require("../utils/request");
const secrets = require("../utils/secrets");

const Channel = require("../models/channel");
const Notification = require("../models/notification");

async function checkIfChannelExists(channel) {
	const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${channel}&type=channel&key=${secrets.youtubeKey}`;

	const res = await get(url);

	if (res.status === 403) throw errors.youtubeLimit;

	const json = res.data;

	return json.pageInfo.totalResults > 0 ? json.items[0] : null;
}

async function getChannelsPlaylist(channel) {
	const url = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channel}&maxResults=50&key=${secrets.youtubeKey}`;

	const res = await get(url);

	if (res.status === 403) throw errors.youtubeLimit;

	const json = res.data;

	return json.items;
}

async function addChannel(msg) {
	const channelName = msg.content.split("youtube add ")[1];

	const channelFound = await checkIfChannelExists(channelName);
	if (channelFound) {
		const channel = await Channel.findOne({
			guild: msg.guild.id,
			channel: channelFound.id.channelId,
			platform: "youtube",
		});

		if (channel) return "Esse canal já existe seu lixo";

		const newChannel = new Channel({
			guild: msg.guild.id,
			name: channelFound.snippet.title,
			channel: channelFound.id.channelId,
			platform: "youtube",
		});

		await newChannel.save();

		return "Canal adicionado com sucesso my dude";
	}

	return "Esse canal deve estar no xixo porque não o encontro";
}

async function removeChannel(msg) {
	const channelName = msg.content.split("youtube remove ")[1];

	const channelFound = await checkIfChannelExists(channelName);

	if (channelFound) {
		const channel = await Channel.findOne({
			guild: msg.guild.id,
			channel: channelFound.id.channelId,
			platform: "youtube",
		});

		if (channel) {
			await Channel.deleteOne({ _id: channel._id });

			return "Canal removido com sucesso my dude";
		}
	}

	return "Esse canal deve estar no xixo porque não o encontro";
}

async function fetchChannels(msg) {
	let channels = await Channel.find({
		guild: msg.guild.id,
		platform: "youtube",
	})
		.collation({ locale: "en" })
		.sort({ name: 1 });

	channels = channels.map(channel => channel.name).join(" | ");

	return channels;
}

async function fetchNotifications() {
	let channels = await Channel.find({ platform: "youtube" });

	channels = channels.map(channel => channel.channel).join(",");

	const playlists = await getChannelsPlaylist(channels);

	for (const playlist of playlists) {
		const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlist.contentDetails.relatedPlaylists.uploads}&maxResults=1&key=${secrets.youtubeKey}`;

		const res = await get(url);

		const json = res.data;

		const item = json.items[0];

		const ONE_HOUR = 60000 * 60;
		if (new Date() - new Date(item.snippet.publishedAt) < ONE_HOUR) {
			const exists = await Notification.findOne({ video: item.snippet.resourceId.videoId });

			if (!exists) {
				const notification = new Notification({
					video: item.snippet.resourceId.videoId,
				});

				notification.save();

				return `**${item.snippet.channelTitle}** postou um novo video! | https://youtu.be/${item.snippet.resourceId.videoId}`;
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
