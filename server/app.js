const database = require("./utils/database");
const { checkForCommand, processCommand } = require("./utils/command");
const { getVideoSearch } = require("./functions/youtube");

const Meta = require("./models/meta");

async function handleMessage(msg, customCommands) {
	const response = await checkForCommand(msg, customCommands);

	return response;
}

async function handleCommand(command, options) {
	const response = await processCommand(command, options);

	return response;
}

function getMetadata() {
	return Meta.findOne();
}

function run() {
	database.initialize();
}

run();

module.exports = {
	handleMessage,
	handleCommand,
	getMetadata,
	updateMetadata: database.updateMetadata,
	getVideoSearch,
};
