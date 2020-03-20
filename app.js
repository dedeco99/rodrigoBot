/* global client */

const discord = require("discord.js");

const secrets = require("./utils/secrets");
const database = require("./utils/database");
const { checkForCommand } = require("./utils/command");

const { runCronjobs } = require("./functions/cronjobs");

const Meta = require("./models/meta");

async function handleMessage(msg) {
	const message = await checkForCommand(msg);

	if (message || message === 0) msg.channel.send(message);
}

async function run() {
	global.client = new discord.Client();
	global.lastMsgs = [];
	global.musicPlayers = {};

	client.login(secrets.discordKey);

	database.initialize();

	const meta = await Meta.findOne();

	client.on("ready", () => {
		console.log(`Logged in as ${client.user.tag}!`);
		client.user.setActivity(meta.action.message, { type: meta.action.type });
	});

	client.on("message", msg => handleMessage(msg));

	await runCronjobs();
}

run();
