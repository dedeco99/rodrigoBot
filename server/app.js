if (!process.env.ENV) require("./utils/secrets");

const { getMetadata, updateMetadata } = require("./utils/database");
const { handleCommand, setupCommandApi } = require("./utils/command");
const { handleCronjobs } = require("./functions/cronjobs");
const { getVideoSearch } = require("./functions/youtube");

global.cache = {
	crypto: {
		data: {},
		coins: [],
		lastUpdate: Date.now(),
	},
	reddit: { posts: [] },
};

if (process.env.API) setupCommandApi();

module.exports = {
	handleCommand,
	handleCronjobs,
	getMetadata,
	updateMetadata,
	getVideoSearch,
};
