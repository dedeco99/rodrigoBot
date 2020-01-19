const { updateMeta } = require("./database");

function play(msg, client) {
	const action = msg.content.split("play")[1];
	client.user.setActivity(action, { type: "PLAYING" });

	updateMeta({ action: { message: action, type: "PLAYING" } });
}

function watch(msg, client) {
	const action = msg.content.split("watch")[1];
	client.user.setActivity(action, { type: "WATCHING" });

	updateMeta({ action: { message: action, type: "WATCHING" } });
}

function listen(msg, client) {
	const action = msg.content.split("listen")[1];
	client.user.setActivity(action, { type: "LISTENING" });

	updateMeta({ action: { message: action, type: "LISTENING" } });
}

module.exports = {
	play,
	watch,
	listen,
};
