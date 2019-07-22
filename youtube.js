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
	const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${channel}&type=channel&key=${secrets.youtubeKey}`;

	const res = await get(url);
	const json = JSON.parse(res);

	return json.pageInfo.totalResults > 0 ? { "exists": true, "item": json.items[0] } : { "exists": false };
};

const getChannelsPlaylist = async (channel) => {
	const url = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channel}&maxResults=50&key=${secrets.youtubeKey}`;

	const res = await get(url);
	const json = JSON.parse(res);

	return json.items;
};

const getVideo = async (msg) => {
	const channel = msg.content.split("youtube ")[1];

	const { exists, item } = await checkIfChannelExists(channel);

	if (exists) {
		const playlist = await getChannelsPlaylist(item.id.channelId);
		const url = `https://www.googleapis.com/youtube/v3/playlistItems
				?part=snippet&playlistId=${playlist[0].contentDetails.relatedPlaylists.uploads}
				&maxResults=5&key=${secrets.youtubeKey}`.replace(/\t/g, "").replace(/\n/g, "");

		const res = await get(url);
		const json = JSON.parse(res);

		return `https://youtu.be/${json.items[0].snippet.resourceId.videoId}`;
	}

	return "Esse canal deve estar no xixo porque não o encontro";
};

const checkIfChannelInDatabase = async (query) => {
	const channels = await getChannels(query);

	return channels.length > 0 ? { "exists": true, "id": channels[0]._id } : false;
};

const checkIfNotificationExists = async (query) => {
	const notifications = await getNotifications(query);

	return notifications.length > 0;
};

const addChannel = async (msg) => {
	const channel = msg.content.split("youtube add ")[1];

	const { exists, item } = await checkIfChannelExists(channel);
	if (exists) {
		const { exists } = await checkIfChannelInDatabase({ "channel": item.id.channelId, "platform": "youtube" });
		if (exists) return "Esse canal já existe seu lixo";

		const channel = {
			"name": item.snippet.title,
			"channel": item.id.channelId,
			"platform": "youtube"
		};

		postChannel(channel);

		return "Canal adicionado com sucesso my dude";
	}

	return "Esse canal deve estar no xixo porque não o encontro";
};

const removeChannel = async (msg) => {
	const channel = msg.content.split("youtube remove ")[1];

	const { exists, item } = await checkIfChannelExists(channel);
	if (exists) {
		const { exists, id } = await checkIfChannelInDatabase({ "channel": item.id.channelId, "platform": "youtube" });

		if (exists) {
			deleteChannel(id);
			return "Canal removido com sucesso my dude";
		}
	}

	return "Esse canal deve estar no xixo porque não o encontro";
};

const fetchChannels = async () => {
	let channels = await getChannels({ platform: "youtube" });

	channels = channels.map(channel => channel.name).join(" | ");

	return channels;
};

const fetchNotifications = async () => {
	let channels = await getChannels({ platform: "youtube" });

	channels = channels.map(channel => channel.channel).join(",");

	const playlists = await getChannelsPlaylist(channels);

	for (const playlist of playlists) {
		const url = `https://www.googleapis.com/youtube/v3/playlistItems
			?part=snippet&playlistId=${playlist.contentDetails.relatedPlaylists.uploads}
			&maxResults=1&key=${secrets.youtubeKey}`.replace(/\t/g, "").replace(/\n/g, "");

		const res = await get(url);
		const json = JSON.parse(res);

		const item = json.items[0];

		const ONE_HOUR = 60 * 60 * 1000;
		if (new Date() - new Date(item.snippet.publishedAt) < ONE_HOUR) {
			const exists = await checkIfNotificationExists({ video: item.snippet.resourceId.videoId });
			if (!exists) {
				addNotification({ "video": item.snippet.resourceId.videoId });

				return `**${item.snippet.channelTitle}** postou um novo video! | 
					https://youtu.be/${item.snippet.resourceId.videoId}`.replace(/\t/g, "").replace(/\n/g, "");
			}
		}
	}
};

const checkForCommand = async (msg) => {
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
		res = await getVideo(msg);
	}

	return res;
};

module.exports = {
	fetchNotifications,
	checkForCommand
};
