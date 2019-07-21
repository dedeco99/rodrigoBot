const meta = require("./meta");

exports.play = (msg, callback, client) => {
	const action = msg.content.split("play")[1];
	client.user.setActivity(action, { type: "PLAYING" });

	meta.updateMeta({ action });
};

exports.watch = (msg, callback, client) => {
	const action = msg.content.split("watch")[1];
	client.user.setActivity(action, { type: "WATCHING" });

	meta.updateMeta({ action });
};

exports.listen = (msg, callback, client) => {
	const action = msg.content.split("listen")[1];
	client.user.setActivity(action, { type: "LISTENING" });

	meta.updateMeta({ action });
};
