const rssParser = require("rss-converter");

const { api } = require("../utils/request");

async function checkIfChannelExists(channel) {
	const res = await api({
		method: "get",
		url: `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${channel}&type=channel&key=${process.env.youtubeKey}`,
	});

	if (res.status === 403) return { status: 403, body: { message: "YOUTUBE_FORBIDDEN" } };

	const json = res.data;

	return json.pageInfo.totalResults > 0 ? json.items[0] : null;
}

async function getVideo(options) {
	const { channel } = options;

	const channelFound = await checkIfChannelExists(channel);

	if (!channelFound) return { status: 404, body: { message: "YOUTUBE_CHANNEL_NOT_FOUND" } };

	const res = await rssParser.toJson(
		`https://www.youtube.com/feeds/videos.xml?channel_id=${channelFound.id.channelId}`,
	);

	return {
		status: 200,
		body: {
			message: "YOUTUBE_SUCCESS",
			data: {
				videoId: res.items[0].yt_videoId,
				videoTitle: res.items[0].title,
				thumbnail: res.items[0].media_group.media_thumbnail_url.replace("hqdefault", "mqdefault"),
				channelId: res.items[0].yt_channelId,
				channelName: res.items[0].author.name,
				published: res.items[0].published,
				views: res.items[0].media_group.media_community.media_statistics_views,
			},
		},
	};
}

async function getVideoSearch(options) {
	const { search } = options;

	const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${search}&type=video&maxResults=1&key=${process.env.youtubeKey}`;

	const res = await api({ method: "get", url });

	if (res.status === 403) return { status: 403, body: { message: "YOUTUBE_FORBIDDEN" } };

	const json = res.data;

	return {
		status: 200,
		body: {
			message: "YOUTUBE_SUCCESS",
			data: {
				videoId: json.items[0].id.videoId,
				videoTitle: json.items[0].snippet.title,
				thumbnail: json.items[0].snippet.thumbnails.medium.url,
				channelId: json.items[0].snippet.channelId,
				channelName: json.items[0].snippet.channelTitle,
				published: json.items[0].publishTime,
			},
		},
	};
}

module.exports = { getVideo, getVideoSearch };
