const { updateMetadata } = require("rodrigo");

function activity(options) {
	const type = options.type;
	const action = options.activity;

	global.client.user.setActivity(action, { type });

	updateMetadata({ action: { message: action, type } });

	return "Activity changed";
}

function deleteLastMsg(msg) {
	if (global.lastMsgs.length) {
		const lastMessage = global.lastMsgs[global.lastMsgs.length - 1];
		if (lastMessage.channel.id === msg.channel.id) {
			lastMessage.delete();
			global.lastMsgs.pop();
			msg.delete();
		}
	}
}

module.exports = {
	activity,
	deleteLastMsg,
};
