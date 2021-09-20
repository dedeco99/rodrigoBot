const { checkForCommand, processCommand } = require("./utils/command");

async function handleMessage(msg, customCommands) {
	const response = await checkForCommand(msg, customCommands);

	return response;
}

async function handleCommand(command, options) {
	const response = await processCommand(command, options);

	return response;
}

module.exports = { handleMessage, handleCommand };
