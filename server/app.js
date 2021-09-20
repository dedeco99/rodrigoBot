const database = require("./utils/database");
const { handleMessage, handleCommand } = require("./utils/command");
const { getVideoSearch } = require("./functions/youtube");

module.exports = {
	handleMessage,
	handleCommand,
	getMetadata: database.getMetadata,
	updateMetadata: database.updateMetadata,
	getVideoSearch,
};
