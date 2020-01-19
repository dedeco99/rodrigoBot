const { get } = require("./request");
const secrets = require("./secrets");
const {
	getChannels,
	getNotifications,
	addNotification,
} = require("./database");

const Channel = require("./models/channel");

async function checkIfChannelExists(channel) {
	const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${channel}&type=channel&key=${secrets.youtubeKey}`;

	const res = await get(url);
	const json = res.data;

	return json.pageInfo.totalResults > 0 ? { "exists": true, "item": json.items[0] } : { "exists": false };
}

async function getChannelsPlaylist(channel) {
	const url = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channel}&maxResults=50&key=${secrets.youtubeKey}`;

	const res = await get(url);
	const json = res.data;

	return json.items;
}

async function getVideo(msg) {
	const channel = msg.content.split("youtube ")[1];

	const { exists, item } = await checkIfChannelExists(channel);

	if (exists) {
		const playlist = await getChannelsPlaylist(item.id.channelId);
		const url = `https://www.googleapis.com/youtube/v3/playlistItems
				?part=snippet&playlistId=${playlist[0].contentDetails.relatedPlaylists.uploads}
				&maxResults=5&key=${secrets.youtubeKey}`.replace(/\t/g, "").replace(/\n/g, "");

		const res = await get(url);
		const json = res.data;

		return `https://youtu.be/${json.items[0].snippet.resourceId.videoId}`;
	}

	return "Esse canal deve estar no xixo porque não o encontro";
}

async function checkIfChannelInDatabase(query) {
	const channels = await getChannels(query);

	return channels.length > 0 ? { "exists": true, "id": channels[0]._id } : false;
}

async function checkIfNotificationExists(query) {
	const notifications = await getNotifications(query);

	return notifications.length > 0;
}

async function addChannel(msg) {
	const channel = msg.content.split("youtube add ")[1];

	const { exists, item } = await checkIfChannelExists(channel);
	if (exists) {
		const { exists } = await checkIfChannelInDatabase({ "channel": item.id.channelId, "platform": "youtube" });
		if (exists) return "Esse canal já existe seu lixo";

		const channel = {
			"name": item.snippet.title,
			"channel": item.id.channelId,
			"platform": "youtube",
		};

		const newChannel = new Channel(channel);

		await newChannel.save();

		return "Canal adicionado com sucesso my dude";
	}

	return "Esse canal deve estar no xixo porque não o encontro";
}

async function removeChannel(msg) {
	const channel = msg.content.split("youtube remove ")[1];

	const { exists, item } = await checkIfChannelExists(channel);
	if (exists) {
		const { exists, id } = await checkIfChannelInDatabase({ "channel": item.id.channelId, "platform": "youtube" });

		if (exists) {
			await Channel.deleteOne({ _id: id });
			return "Canal removido com sucesso my dude";
		}
	}

	return "Esse canal deve estar no xixo porque não o encontro";
}

async function fetchChannels() {
	let channels = await getChannels({ platform: "youtube" });

	channels = channels.map(channel => channel.name).join(" | ");

	return channels;
}

async function fetchNotifications() {
	let channels = await getChannels({ platform: "youtube" });

	channels = channels.map(channel => channel.channel).join(",");

	const playlists = await getChannelsPlaylist(channels);

	for (const playlist of playlists) {
		const url = `https://www.googleapis.com/youtube/v3/playlistItems
			?part=snippet&playlistId=${playlist.contentDetails.relatedPlaylists.uploads}
			&maxResults=1&key=${secrets.youtubeKey}`.replace(/\t/g, "").replace(/\n/g, "");

		const res = await get(url);
		const json = res.data;

		const item = json.items[0];

		const ONE_HOUR = 60000 * 60;
		if (new Date() - new Date(item.snippet.publishedAt) < ONE_HOUR) {
			const exists = await checkIfNotificationExists({
				video: item.snippet.resourceId.videoId,
			});
			if (!exists) {
				addNotification({ "video": item.snippet.resourceId.videoId });

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
	const feature = features.find(feature => feature.command === command);

	let res = null;
	if (feature) {
		res = await feature.func(msg);
	} else {
		res = await getVideo(msg);
	}

	return res;
}

module.exports = {
	fetchNotifications,
	checkForCommand,
};
