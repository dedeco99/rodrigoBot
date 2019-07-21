var request = require("request");

var checkIfChannelExists = (channel, callback) => {
	var url = "https://api.twitch.tv/helix/users?login=" + channel;

	var headers = {
		"Accept": "application/vnd.twitchtv.v5+json",
		"Client-ID": process.env.twitchClientId
	};

	request({ headers, url }, (error, response, html) => {
		if (error) console.log(error);
		var json = JSON.parse(html);

		if (json.data.length > 0) {
			callback(true, json);
		} else {
			callback(false, json);
		}
	});
};

var checkIfChannelInDatabase = (data, callback) => {
	var url = "https://api.mlab.com/api/1/databases/rodrigo/collections/channels?q={" + data.field + ":'" + data.channel + "','platform':'" + data.platform + "'}&apiKey=" + process.env.databaseKey;

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

var checkIfNotificationExists = (data, callback) => {
	var url = "https://api.mlab.com/api/1/databases/rodrigo/collections/notifications?q={'video':'" + data.video + "','started':'" + data.started + "'}&apiKey=" + process.env.databaseKey;

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

var addNotification = (data) => {
	var url = "https://api.mlab.com/api/1/databases/rodrigo/collections/notifications?apiKey=" + process.env.databaseKey;

	request.post({ url, body: data, json: true }, (error, response, html) => {
		if (error) console.log(error);
	});
};

const getStream = (msg, callback, client) => {
	var channel = msg.content.split("twitch ")[1];
	var url = "https://www.twitch.tv/" + channel;

	client.user.setActivity(channel, { url, type: "WATCHING" });

	callback(url);
};

const addChannel = (msg, callback) => {
	var channel = msg.content.split("twitch add ")[1];

	checkIfChannelExists(channel, (exists, json) => {
		if (exists) {
			checkIfChannelInDatabase({ "field": "channel", "channel": json.data[0].login }, (exists) => {
				if (!exists) {
					var url = "https://api.mlab.com/api/1/databases/rodrigo/collections/channels?apiKey=" + process.env.databaseKey;

					var res = { "name": json.data[0].login, "channel": json.data[0].login, "platform": "twitch" };

					request.post({ url, body: res, json: true }, (error, response, html) => {
						if (error) console.log(error);

						callback("Canal adicionado com sucesso my dude");
					});
				}
			});
		} else {
			callback("Esse canal deve estar no xixo porque não o encontro");
		}
	});
};

const removeChannel = (msg, callback) => {
	var channel = msg.content.split("twitch remove ")[1];

	checkIfChannelInDatabase({ "field": "name", "channel": channel, "platform": "twitch" }, (exists, id) => {
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
};

const getChannels = (msg, callback) => {
	var url = "https://api.mlab.com/api/1/databases/rodrigo/collections/channels?q={'platform':'twitch'}&s={'name':1}&apiKey=" + process.env.databaseKey;

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
	var url = "https://api.mlab.com/api/1/databases/rodrigo/collections/channels?q={'platform':'twitch'}&apiKey=" + process.env.databaseKey;

	request(url, (error, response, html) => {
		if (error) console.log(error);
		var json = JSON.parse(html);

		var channels = "";

		for (var i = 0; i < json.length; i++) {
			channels += "user_login=" + json[i].channel + "&";
		}

		channels = channels.slice(0, -1);

		var url = "https://api.twitch.tv/helix/streams?" + channels;

		var headers = {
			"Accept": "application/vnd.twitchtv.v5+json",
			"Client-ID": process.env.twitchClientId
		};

		request({ headers, url }, (error, response, html) => {
			if (error) console.log(error);
			var json = JSON.parse(html);

			for (var i = 0; i < json.data.length; i++) {
				var ONE_HOUR = 60 * 60 * 1000;
				if ((new Date()) - (new Date(json.data[i].started_at)) < ONE_HOUR) {
					checkIfNotificationExists({ video: json.data[i].user_name, started: json.data[i].started_at }, (exists) => {
						if (!exists) {
							callback("**" + json.data[i].user_name + "** está live! | https://twitch.tv/" + json.data[i].user_name);
							addNotification(json.items[0].snippet.resourceId.videoId);
						}
					});
				}
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
		getStream(msg, (res) => {
			callback(res);
		}, client);
	}
};