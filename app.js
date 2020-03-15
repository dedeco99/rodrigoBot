/* global client */

const discord = require("discord.js");
const schedule = require("node-schedule");

const secrets = require("./secrets");
const { initialize } = require("./database");
const { checkForCommand } = require("./command");
// const twitch = require("./twitch");
const youtube = require("./youtube");

const Meta = require("./models/meta");
const Birthday = require("./models/birthday");
const Cronjob = require("./models/cronjob");

async function handleMessage(msg) {
	const message = await checkForCommand(msg);

	// eslint-disable-next-line no-undefined
	if (message !== null || message !== undefined) msg.channel.send(message);
}

async function run() {
	global.client = new discord.Client();
	global.lastMsgs = [];
	global.musicPlayers = {};

	client.login(secrets.discordKey);

	// Initialize DB
	initialize();

	const meta = await Meta.findOne();

	client.on("ready", () => {
		console.log(`Logged in as ${client.user.tag}!`);
		client.user.setActivity(meta.action.message, { type: meta.action.type });
	});

	client.on("message", msg => handleMessage(msg));

	schedule.scheduleJob("0 8 * * *", async () => {
		const birthdays = await Birthday.find({
			$expr: {
				$and: [
					{ $eq: [{ $dayOfMonth: "$date" }, { $dayOfMonth: new Date() }] },
					{ $eq: [{ $month: "$date" }, { $month: new Date() }] },
				],
			},
		});

		for (const birthday of birthdays) {
			client.channels.cache.get(birthday.room).send(`Parabéns ${birthday.person}`);
		}
	});

	schedule.scheduleJob("0/20 * * * *", async () => {
		const notification = await youtube.fetchNotifications();
		if (notification) client.channels.cache.get("525343734746054657").send(notification);

		/*
		notification = await twitch.fetchNotifications();
		if (notification) client.channels.cache.get("525343734746054657").send(notification);
		*/
	});

	const cronjobs = await Cronjob.find({}).lean();

	for (const cronjob of cronjobs) {
		schedule.scheduleJob(cronjob.cron, async () => {
			if (cronjob.message.toLowerCase().includes("rodrigo")) {
				const message = await checkForCommand({ content: cronjob.message });

				if (message) client.channels.cache.get(cronjob.room).send(message);
			} else {
				client.channels.cache.get(cronjob.room).send(cronjob.message);
			}
		});
	}
}

run();
