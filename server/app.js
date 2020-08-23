const { checkForCommand } = require("./utils/command");

async function handleMessage(msg, customCommands) {
	const response = await checkForCommand(msg, customCommands);

	return response;
}

module.exports = { handleMessage };
