const database = require("./utils/database");
const { handleCommand } = require("./utils/command");
const { handleCronjobs } = require("./functions/cronjobs");
const { getVideoSearch } = require("./functions/youtube");

module.exports = {
	handleCommand,
	handleCronjobs,
	getMetadata: database.getMetadata,
	updateMetadata: database.updateMetadata,
	getVideoSearch,
};
