const { updateMetadata } = require("rodrigo");

function activity(options) {
	const type = options.type;
	const action = options.activity;

	global.client.user.setActivity(action, { type });

	updateMetadata({ action: { message: action, type } });

	return "Activity changed";
}

module.exports = {
	activity,
};
