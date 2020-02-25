const discord = require("discord.js");
const schedule = require("node-schedule");

const secrets = require("./secrets");
const { initialize } = require("./database");
const { checkForCommand } = require("./command");
const twitch = require("./twitch");
const youtube = require("./youtube");

const Meta = require("./models/meta");
const Birthday = require("./models/birthday");
const Cronjob = require("./models/cronjob");

global.lastMsg = null;
global.client = new discord.Client();
global.musicPlayers = {};

async function setActivity() {
	const meta = await Meta.findOne({}).lean();

	console.log(`Logged in as ${client.user.tag}!`);
	client.user.setActivity(meta.action.message, { type: meta.action.type });
}

async function handleMessage(msg, client) {
	const message = await checkForCommand(msg, client);

	if (message) {
		msg.channel.send(message);
	} else if (msg.content.includes("delete") && lastMsg) {
		lastMsg.delete();
		msg.delete();
	} else if (msg.author.username === "RodrigoBot") {
		lastMsg = msg;
	}
}

async function run() {
	client.login(secrets.discordKey);

	// Initialize DB
	initialize();

	client.on("ready", () => setActivity());

	client.on("message", msg => handleMessage(msg));

	// Cronjobs
	schedule.scheduleJob("0 8 * * *", async () => {
		const birthdays = await Birthday.find({
			$expr: { $eq: [{ $dayOfYear: "$date" }, { $dayOfYear: new Date() }] },
		});

		for (const birthday of birthdays) {
			client.channels.get(birthday.room).send(`Parabéns ${birthday.person}`);
		}
	});

	schedule.scheduleJob("0/20 * * * *", async () => {
		const notification = await youtube.fetchNotifications();
		if (notification) client.channels.get("525343734746054657").send(notification);

		/*
		notification = await twitch.fetchNotifications();
		if (notification) client.channels.get("525343734746054657").send(notification);
		*/
	});

	const cronjobs = await Cronjob.find({}).lean();

	for (const cronjob of cronjobs) {
		schedule.scheduleJob(cronjob.cron, () => {
			client.channels.get(cronjob.room).send(cronjob.message);
		});
	}
}

run();
