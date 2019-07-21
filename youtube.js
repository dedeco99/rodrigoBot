const request = require("request");

const checkIfChannelExists = (channel, callback) => {
	var url = "https://www.googleapis.com/youtube/v3/search?part=snippet&q=" + channel + "&type=channel&key=" + process.env.youtubeKey;

	request(url, (error, response, html) => {
		if (error) console.log(error);
		var json = JSON.parse(html);

		if (json.pageInfo.totalResults > 0) {
			callback(true, json);
		} else {
			callback(false, json);
		}
	});
};

const checkIfChannelInDatabase = (data, callback) => {
	var url = "https://api.mlab.com/api/1/databases/rodrigo/collections/channels?q={" + data.field + ":'" + data.channel + "'}&apiKey=" + process.env.databaseKey;

	request(url, (error, response, html) => {
		if (error) console.log(error);
		var json = JSON.parse(html);

		if (json.length > 0) {
			callback(true, json[0]._id.$oid);
		} else {
			callback(false);
		}
	});
};

const checkIfNotificationExists = (data, callback) => {
	var url = "https://api.mlab.com/api/1/databases/rodrigo/collections/notifications?q={'video':'" + data.video + "'}&apiKey=" + process.env.databaseKey;

	request(url, (error, response, html) => {
		if (error) console.log(error);
		var json = JSON.parse(html);

		if (json.length > 0) {
			callback(true);
		} else {
			callback(false);
		}
	});
};

const addNotification = (videoId) => {
	var url = "https://api.mlab.com/api/1/databases/rodrigo/collections/notifications?apiKey=" + process.env.databaseKey;

	var res = { "video": videoId };

	request.post({ url, body: res, json: true }, (error, response, html) => {
		if (error) console.log(error);
	});
};

const getChannelsPlaylist = (data, callback) => {
	var url = "https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=" + data + "&maxResults=50&key=" + process.env.youtubeKey;

	request(url, (error, response, html) => {
		if (error) console.log(error);
		var json = JSON.parse(html);

		callback(json.items);
	});
};

const getVideo = (msg, callback) => {
	var channel = msg.content.split("youtube ")[1];

	checkIfChannelExists(channel, (exists, json) => {
		if (exists) {
			getChannelsPlaylist(json.items[0].id.channelId, (items) => {
				var url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=" + items[0].contentDetails.relatedPlaylists.uploads + "&maxResults=5&key=" + process.env.youtubeKey;

				request(url, (error, response, html) => {
					if (error) console.log(error);
					var json = JSON.parse(html);

					callback("https://youtu.be/" + json.items[0].snippet.resourceId.videoId);
				});
			});
		} else {
			callback("Esse canal deve estar no xixo porque não o encontro");
		}
	});
};

const addChannel = (msg, callback) => {
	const channel = msg.content.split("youtube add ")[1];

	checkIfChannelExists(channel, (exists, json) => {
		if (exists) {
			checkIfChannelInDatabase({ "field": "channel", "channel": json.items[0].id.channelId, "platform": "youtube" }, (exists) => {
				if (!exists) {
					var url = "https://api.mlab.com/api/1/databases/rodrigo/collections/channels?apiKey=" + process.env.databaseKey;

					var res = { "name": json.items[0].snippet.title, "channel": json.items[0].id.channelId, "platform": "youtube" };

					request.post({ url, body: res, json: true }, (error, response, html) => {
						if (error) console.log(error);

						callback("Canal adicionado com sucesso my dude");
					});
				} else {
					callback("Esse canal já existe seu lixo");
				}
			});
		} else {
			callback("Esse canal deve estar no xixo porque não o encontro");
		}
	});
};

const removeChannel = (msg, callback) => {
	const channel = msg.content.split("youtube remove ")[1];

	checkIfChannelExists(channel, (exists, json) => {
		if (exists) {
			checkIfChannelInDatabase({ "field": "channel", "channel": json.items[0].id.channelId, platform: "youtube" }, (exists, id) => {
				if (exists) {
					var url = "https://api.mlab.com/api/1/databases/rodrigo/collections/channels/" + id + "?apiKey=" + process.env.databaseKey;

					request.delete(url, (error, response, html) => {
						if (error) console.log(error);

						callback("Canal removido com sucesso my dude");
					});
				} else {
					callback("Esse canal deve estar no xixo porque não o encontro");
				}
			});
		} else {
			callback("Esse canal deve estar no xixo porque não o encontro");
		}
	});
};

const getChannels = (msg, callback) => {
	var url = "https://api.mlab.com/api/1/databases/rodrigo/collections/channels?q={'platform':'youtube'}&s={'name':1}&apiKey=" + process.env.databaseKey;

	request(url, (error, response, html) => {
		if (error) console.log(error);
		var json = JSON.parse(html);

		var res = "";

		for (var i = 0; i < json.length; i++) {
			res += json[i].name + " | ";
		}

		callback(res);
	});
};

exports.getNotifications = (callback) => {
	var url = "https://api.mlab.com/api/1/databases/rodrigo/collections/channels?q={'platform':'youtube'}&apiKey=" + process.env.databaseKey;

	request(url, (error, response, html) => {
		if (error) console.log(error);
		var json = JSON.parse(html);

		var channelsString = "";

		for (var i = 0; i < json.length; i++) {
			channelsString += json[i].channel + ",";
		}

		getChannelsPlaylist(channelsString, (items) => {
			for (var i = 0; i < items.length; i++) {
				var url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=" + items[i].contentDetails.relatedPlaylists.uploads + "&maxResults=1&key=" + process.env.youtubeKey;

				request(url, (error, response, html) => {
					if (error) console.log(error);
					var json = JSON.parse(html);

					var ONE_HOUR = 60 * 60 * 1000;
					if ((new Date()) - (new Date(json.items[0].snippet.publishedAt)) < ONE_HOUR) {
						checkIfNotificationExists({ video: json.items[0].snippet.resourceId.videoId }, (exists) => {
							if (!exists) {
								callback("**" + json.items[0].snippet.channelTitle + "** postou um novo video! | https://youtu.be/" + json.items[0].snippet.resourceId.videoId);
								addNotification(json.items[0].snippet.resourceId.videoId);
							}
						});
					}
				});
			}
		});
	});
};

exports.checkForCommand = (msg, callback, client) => {
	const features = [
		{ command: "add", func: addChannel },
		{ command: "remove", func: removeChannel },
		{ command: "get", func: getChannels }
	];

	const command = msg.content.split(" ")[2];
	const feature = features.find(feature => feature.command === command);

	if (feature) {
		feature.func(msg, (res) => {
			callback(res);
		});
	} else {
		getVideo(msg, (res) => {
			callback(res);
		});
	}
};