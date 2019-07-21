const request = require("request");

const secrets = require("./secrets");
const log = require("./log");

const checkIfChannelExists = (channel, callback) => {
	const url = `https://api.twitch.tv/helix/users?login=${channel}`;

	const headers = {
		"Accept": "application/vnd.twitchtv.v5+json",
		"Client-ID": secrets.twitchClientId
	};

	request({ headers, url }, (error, response, html) => {
		if (error) return log.error(error.stack);
		const json = JSON.parse(html);

		if (json.data.length > 0) {
			return callback(true, json);
		}

		return callback(false, json);
	});
};

const checkIfChannelInDatabase = (data, callback) => {
	const url = `https://api.mlab.com/api/1/databases/rodrigo/collections/channels
		?q={${data.field}:'${data.channel}','platform':'${data.platform}'}&apiKey=${secrets.databaseKey}`.replace(/\t/g, "").replace(/\n/g, "");

	request(url, (error, response, html) => {
		if (error) return log.error(error.stack);
		const json = JSON.parse(html);

		if (json.length > 0) {
			return callback(true, json[0]._id.$oid);
		}

		return callback(false);
	});
};

const checkIfNotificationExists = (data, callback) => {
	const url = `https://api.mlab.com/api/1/databases/rodrigo/collections/notifications
		?q={'video':'${data.video}','started':'${data.started}'}&apiKey=${secrets.databaseKey}`.replace(/\t/g, "").replace(/\n/g, "");

	request(url, (error, response, html) => {
		if (error) return log.error(error.stack);
		const json = JSON.parse(html);

		if (json.length > 0) {
			return callback(true);
		}

		return callback(false);
	});
};

const addNotification = (data) => {
	const url = `https://api.mlab.com/api/1/databases/rodrigo/collections/notifications?apiKey=${secrets.databaseKey}`;

	request.post({ url, body: data, json: true }, error => {
		if (error) return log.error(error.stack);
		return null;
	});
};

const getStream = (msg, callback, client) => {
	const channel = msg.content.split("twitch ")[1];
	const url = `https://www.twitch.tv/${channel}`;

	client.user.setActivity(channel, { url, type: "WATCHING" });

	return callback(url);
};

const addChannel = (msg, callback) => {
	const channel = msg.content.split("twitch add ")[1];

	checkIfChannelExists(channel, (exists, json) => {
		if (exists) {
			checkIfChannelInDatabase({ "field": "channel", "channel": json.data[0].login }, (exists) => {
				if (!exists) {
					const url = `https://api.mlab.com/api/1/databases/rodrigo/collections/channels?apiKey=${secrets.databaseKey}`;

					const res = { "name": json.data[0].login, "channel": json.data[0].login, "platform": "twitch" };

					request.post({ url, body: res, json: true }, error => {
						if (error) return log.error(error.stack);

						return callback("Canal adicionado com sucesso my dude");
					});
				}
			});
		}

		return callback("Esse canal deve estar no xixo porque não o encontro");
	});
};

const removeChannel = (msg, callback) => {
	const channel = msg.content.split("twitch remove ")[1];

	checkIfChannelInDatabase({ "field": "name", "channel": channel, "platform": "twitch" }, (exists, id) => {
		if (exists) {
			const url = `https://api.mlab.com/api/1/databases/rodrigo/collections/channels/${id}?apiKey=${secrets.databaseKey}`;

			request.delete(url, error => {
				if (error) return log.error(error.stack);

				return callback("Canal removido com sucesso my dude");
			});
		}

		return callback("Esse canal deve estar no xixo porque não o encontro");
	});
};

const getChannels = (msg, callback) => {
	const url = `https://api.mlab.com/api/1/databases/rodrigo/collections/channels
		?q={'platform':'twitch'}&s={'name':1}&apiKey=${secrets.databaseKey}`.replace(/\t/g, "").replace(/\n/g, "");

	request(url, (error, response, html) => {
		if (error) return log.error(error.stack);
		const json = JSON.parse(html);

		let res = "";

		for (let i = 0; i < json.length; i++) {
			res += `${json[i].name} | `;
		}

		return callback(res);
	});
};

exports.getNotifications = (callback) => {
	const url = `https://api.mlab.com/api/1/databases/rodrigo/collections/channels?q={'platform':'twitch'}&apiKey=${secrets.databaseKey}`;

	request(url, (error, response, html) => {
		if (error) return log.error(error.stack);
		const json = JSON.parse(html);

		let channels = "";

		for (let i = 0; i < json.length; i++) {
			channels += `user_login=${json[i].channel}&`;
		}

		channels = channels.slice(0, -1);

		const url = `https://api.twitch.tv/helix/streams?${channels}`;

		const headers = {
			"Accept": "application/vnd.twitchtv.v5+json",
			"Client-ID": secrets.twitchClientId
		};

		request({ headers, url }, (error, response, html) => {
			if (error) return log.error(error.stack);
			const json = JSON.parse(html);

			for (let i = 0; i < json.data.length; i++) {
				const ONE_HOUR = 60 * 60 * 1000;
				if (new Date() - new Date(json.data[i].started_at) < ONE_HOUR) {
					checkIfNotificationExists({ video: json.data[i].user_name, started: json.data[i].started_at }, (exists) => {
						if (!exists) {
							addNotification(json.items[0].snippet.resourceId.videoId);
							return callback(`**${json.data[i].user_name}** está live! | https://twitch.tv/${json.data[i].user_name}`);
						}

						return null;
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
			return callback(res);
		});
	} else {
		getStream(msg, (res) => {
			return callback(res);
		}, client);
	}
};
