const request = require("request");

const secrets = require("./secrets");
const database = require("./database");
const log = require("./log");

const checkIfChannelExists = (channel, callback) => {
	const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${channel}&type=channel&key=${secrets.youtubeKey}`;

	request(url, (error, response, html) => {
		if (error) return log.error(error.stack);
		const json = JSON.parse(html);

		if (json.pageInfo.totalResults > 0) {
			return callback(true, json);
		}

		return callback(false, json);
	});
};

const getChannelsPlaylist = (data, callback) => {
	const url = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${data}&maxResults=50&key=${secrets.youtubeKey}`;

	request(url, (error, response, html) => {
		if (error) return log.error(error.stack);
		const json = JSON.parse(html);

		return callback(json.items);
	});
};

const getVideo = (msg, callback) => {
	const channel = msg.content.split("youtube ")[1];

	checkIfChannelExists(channel, (exists, json) => {
		if (exists) {
			getChannelsPlaylist(json.items[0].id.channelId, (items) => {
				const url = `https://www.googleapis.com/youtube/v3/playlistItems
					?part=snippet&playlistId=${items[0].contentDetails.relatedPlaylists.uploads}
					&maxResults=5&key=${secrets.youtubeKey}`.replace(/\t/g, "").replace(/\n/g, "");

				request(url, (error, response, html) => {
					if (error) return log.error(error.stack);
					const json = JSON.parse(html);

					return callback(`https://youtu.be/${json.items[0].snippet.resourceId.videoId}`);
				});
			});
		} else {
			return callback("Esse canal deve estar no xixo porque não o encontro");
		}
	});
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
	const channel = msg.content.split("youtube add ")[1];

	checkIfChannelExists(channel, async (exists, json) => {
		if (exists) {
			const { exists } = await checkIfChannelInDatabase({ "channel": json.items[0].id.channelId, "platform": "youtube" });
			if (exists) return callback("Esse canal já existe seu lixo");

			const channel = {
				"name": json.items[0].snippet.title,
				"channel": json.items[0].id.channelId,
				"platform": "youtube"
			};

			database.postChannel(channel);

			return callback("Canal adicionado com sucesso my dude");
		}

		return callback("Esse canal deve estar no xixo porque não o encontro");
	});
};

const removeChannel = (msg, callback) => {
	const channel = msg.content.split("youtube remove ")[1];

	checkIfChannelExists(channel, async (exists, json) => {
		if (exists) {
			const { exists, id } = await checkIfChannelInDatabase({ "channel": json.items[0].id.channelId, platform: "youtube" });

			if (exists) {
				database.deleteChannel(id);
				return callback("Canal removido com sucesso my dude");
			}
		}

		return callback("Esse canal deve estar no xixo porque não o encontro");
	});
};

const getChannels = async (msg, callback) => {
	let channels = await database.getChannels({ platform: "youtube" });

	channels = channels.map(channel => channel.name).join(" | ");

	return callback(channels);
};

const getNotifications = async (callback) => {
	let channels = await database.getChannels({ platform: "youtube" });

	channels = channels.map(channel => channel.name).join(",");

	getChannelsPlaylist(channels, (items) => {
		for (const item of items) {
			const url = `https://www.googleapis.com/youtube/v3/playlistItems
				?part=snippet&playlistId=${item.contentDetails.relatedPlaylists.uploads}
				&maxResults=1&key=${secrets.youtubeKey}`.replace(/\t/g, "").replace(/\n/g, "");

			request(url, async (error, response, html) => {
				if (error) return log.error(error.stack);
				const json = JSON.parse(html);

				const item = json.items[0];

				const ONE_HOUR = 60 * 60 * 1000;
				if (new Date() - new Date(item.snippet.publishedAt) < ONE_HOUR) {
					const exists = await checkIfNotificationExists({ video: item.snippet.resourceId.videoId });
					if (!exists) {
						database.addNotification({ "video": item.snippet.resourceId.videoId });

						return callback(`**${item.snippet.channelTitle}** postou um novo video! | 
							https://youtu.be/${item.snippet.resourceId.videoId}`.replace(/\t/g, "").replace(/\n/g, ""));
					}
				}
			});
		}
	});
};

const checkForCommand = (msg, callback) => {
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
		getVideo(msg, (res) => {
			return callback(res);
		});
	}
};

module.exports = {
	getNotifications,
	checkForCommand
};
