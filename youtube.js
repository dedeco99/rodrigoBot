const request = require("request");

const secrets = require("./secrets");

const checkIfChannelExists = (channel, callback) => {
	const url = `https://www.googleapis.com/youtube/v3/search
		?part=snippet&q=${ channel}&type=channel&key=${secrets.youtubeKey}`;

	request(url, (error, response, html) => {
		if (error) console.log(error);
		const json = JSON.parse(html);

		if (json.pageInfo.totalResults > 0) {
			return callback(true, json);
		}

		return callback(false, json);
	});
};

const checkIfChannelInDatabase = (data, callback) => {
	const url = `https://api.mlab.com/api/1/databases/rodrigo/collections/channels
		?q={${ data.field}:'${data.channel}'}&apiKey=${secrets.databaseKey}`;

	request(url, (error, response, html) => {
		if (error) console.log(error);
		const json = JSON.parse(html);

		if (json.length > 0) {
			return callback(true, json[0]._id.$oid);
		}

		return callback(false);
	});
};

const checkIfNotificationExists = (data, callback) => {
	const url = `https://api.mlab.com/api/1/databases/rodrigo/collections/notifications
		?q={'video':'${data.video}'}&apiKey=${secrets.databaseKey}`;

	request(url, (error, response, html) => {
		if (error) console.log(error);
		const json = JSON.parse(html);

		if (json.length > 0) {
			return callback(true);
		}

		return callback(false);
	});
};

const addNotification = (videoId) => {
	const url = `https://api.mlab.com/api/1/databases/rodrigo/collections/notifications?apiKey=${secrets.databaseKey}`;

	const res = { "video": videoId };

	request.post({ url, body: res, json: true }, error => {
		if (error) console.log(error);
	});
};

const getChannelsPlaylist = (data, callback) => {
	const url = `https://www.googleapis.com/youtube/v3/channels
		?part=contentDetails&id=${data}&maxResults=50&key=${secrets.youtubeKey}`;

	request(url, (error, response, html) => {
		if (error) console.log(error);
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
					?part=snippet&playlistId=${items[0].contentDetails.relatedPlaylists.uploads}&maxResults=5&key=${secrets.youtubeKey}`;

				request(url, (error, response, html) => {
					if (error) console.log(error);
					const json = JSON.parse(html);

					return callback(`https://youtu.be/${json.items[0].snippet.resourceId.videoId}`);
				});
			});
		}

		return callback("Esse canal deve estar no xixo porque não o encontro");
	});
};

const addChannel = (msg, callback) => {
	const channel = msg.content.split("youtube add ")[1];

	checkIfChannelExists(channel, (exists, json) => {
		if (exists) {
			checkIfChannelInDatabase({ "field": "channel", "channel": json.items[0].id.channelId, "platform": "youtube" }, (exists) => {
				if (exists) return callback("Esse canal já existe seu lixo");

				const url = `https://api.mlab.com/api/1/databases/rodrigo/collections/channels?apiKey=${secrets.databaseKey}`;

				const res = { "name": json.items[0].snippet.title, "channel": json.items[0].id.channelId, "platform": "youtube" };

				request.post({ url, body: res, json: true }, error => {
					if (error) console.log(error);

					return callback("Canal adicionado com sucesso my dude");
				});

				return null;
			});
		}

		return callback("Esse canal deve estar no xixo porque não o encontro");
	});
};

const removeChannel = (msg, callback) => {
	const channel = msg.content.split("youtube remove ")[1];

	checkIfChannelExists(channel, (exists, json) => {
		if (exists) {
			checkIfChannelInDatabase({ "field": "channel", "channel": json.items[0].id.channelId, platform: "youtube" }, (exists, id) => {
				if (exists) {
					const url = `https://api.mlab.com/api/1/databases/rodrigo/collections/channels/${id}?apiKey=${secrets.databaseKey}`;

					request.delete(url, error => {
						if (error) console.log(error);

						return callback("Canal removido com sucesso my dude");
					});
				}

				return callback("Esse canal deve estar no xixo porque não o encontro");
			});
		}

		return callback("Esse canal deve estar no xixo porque não o encontro");
	});
};

const getChannels = (msg, callback) => {
	const url = `https://api.mlab.com/api/1/databases/rodrigo/collections/channels
		?q={'platform':'youtube'}&s={'name':1}&apiKey=${secrets.databaseKey}`;

	request(url, (error, response, html) => {
		if (error) console.log(error);
		const json = JSON.parse(html);

		let res = "";

		for (let i = 0; i < json.length; i++) {
			res += `${json[i].name} | `;
		}

		return callback(res);
	});
};

exports.getNotifications = (callback) => {
	const url = `https://api.mlab.com/api/1/databases/rodrigo/collections/channels
		?q={'platform':'youtube'}&apiKey=${secrets.databaseKey}`;

	request(url, (error, response, html) => {
		if (error) console.log(error);
		const json = JSON.parse(html);

		let channelsString = "";

		for (let i = 0; i < json.length; i++) {
			channelsString += `${json[i].channel},`;
		}

		getChannelsPlaylist(channelsString, (items) => {
			for (let i = 0; i < items.length; i++) {
				const url = `https://www.googleapis.com/youtube/v3/playlistItems
					?part=snippet&playlistId=${items[i].contentDetails.relatedPlaylists.uploads}&maxResults=1&key=${secrets.youtubeKey}`;

				request(url, (error, response, html) => {
					if (error) console.log(error);
					const json = JSON.parse(html);

					const ONE_HOUR = 60 * 60 * 1000;
					if (new Date() - new Date(json.items[0].snippet.publishedAt) < ONE_HOUR) {
						checkIfNotificationExists({ video: json.items[0].snippet.resourceId.videoId }, (exists) => {
							if (!exists) {
								addNotification(json.items[0].snippet.resourceId.videoId);

								return callback(`**${json.items[0].snippet.channelTitle}** postou um novo video! | 
									https://youtu.be/${json.items[0].snippet.resourceId.videoId}`);
							}

							return null;
						});
					}
				});
			}
		});
	});
};

exports.checkForCommand = (msg, callback) => {
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
