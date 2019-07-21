const database = require("./database");

exports.play = (msg, client) => {
	const action = msg.content.split("play")[1];
	client.user.setActivity(action, { type: "PLAYING" });

	database.updateMeta({ action });
};

exports.watch = (msg, client) => {
	const action = msg.content.split("watch")[1];
	client.user.setActivity(action, { type: "WATCHING" });

	database.updateMeta({ action });
};

exports.listen = (msg, client) => {
	const action = msg.content.split("listen")[1];
	client.user.setActivity(action, { type: "LISTENING" });

	database.updateMeta({ action });
};
