const errors = require("../utils/errors");
const { get } = require("../utils/request");
const secrets = require("../utils/secrets");

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

async function getVideo(msg) {
	const channelName = msg.split(" ")[2];

	const channelFound = await checkIfChannelExists(channelName);

	if (channelFound) {
		const playlist = await getChannelsPlaylist(channelFound.id.channelId);

		const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlist[0].contentDetails.relatedPlaylists.uploads}&maxResults=5&key=${secrets.youtubeKey}`;

		const res = await get(url);

		if (res.status === 403) throw errors.youtubeLimit;

		const json = res.data;

		return `https://youtu.be/${json.items[0].snippet.resourceId.videoId}`;
	}

	return "Esse canal deve estar no xixo porque não o encontro";
}

module.exports = { getVideo };
