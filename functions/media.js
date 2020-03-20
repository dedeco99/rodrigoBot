/* global client */

const { updateMeta } = require("../utils/database");

function play(msg) {
	const action = msg.content.split("play")[1];
	client.user.setActivity(action, { type: "PLAYING" });

	updateMeta({ action: { message: action, type: "PLAYING" } });
}

function watch(msg) {
	const action = msg.content.split("watch")[1];
	client.user.setActivity(action, { type: "WATCHING" });

	updateMeta({ action: { message: action, type: "WATCHING" } });
}

function listen(msg) {
	const action = msg.content.split("listen")[1];
	client.user.setActivity(action, { type: "LISTENING" });

	updateMeta({ action: { message: action, type: "LISTENING" } });
}

module.exports = {
	play,
	watch,
	listen,
};
