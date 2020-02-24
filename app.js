const discord = require("discord.js");
const schedule = require("node-schedule");

const secrets = require("./secrets");
const { initialize } = require("./database");
const { checkForCommand } = require("./command");
const twitch = require("./twitch");
const youtube = require("./youtube");

const Meta = require("./models/meta");
const Birthday = require("./models/birthday");

let lastMsg = null;

global.musicPlayers = {};

async function handleMessage(msg, client) {
	const message = await checkForCommand(msg, client);

	console.log(msg.guild.id, new Date(msg.guild.joinedTimestamp));

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
	const client = new discord.Client();
	client.login(secrets.discordKey);

	// Initialize DB
	initialize();

	const meta = await Meta.findOne();

	client.on("ready", () => {
		console.log(`Logged in as ${client.user.tag}!`);
		client.user.setActivity(meta.action.message, { type: meta.action.type });
	});

	client.on("message", msg => handleMessage(msg, client));

	schedule.scheduleJob("0 8 * * *", async () => {
		const birthdays = await Birthday.find({
			$expr: { $eq: [{ $dayOfYear: "$date" }, { $dayOfYear: new Date() }] },
		});

		for (const birthday of birthdays) {
			client.channels.get(birthday.room).send(`Parabéns ${birthday.person}`);
		}
	});

	schedule.scheduleJob("15 17 * * 1-5", () => {
		client.channels.get("666686273343193139").send("would you look at the time <@176055432010399744>");
	});

	schedule.scheduleJob("35 17 * * 1-5", () => {
		client.channels.get("666686273343193139").send("would you look at the time <@200415342093271040>");
	});

	schedule.scheduleJob("0 18 * * 1-5", () => {
		client.channels.get("666686273343193139").send("would you look at the time @everyone");
	});

	schedule.scheduleJob("0/20 * * * *", async () => {
		const notification = await youtube.fetchNotifications();
		if (notification) client.channels.get("525343734746054657").send(notification);

		/*
		notification = await twitch.fetchNotifications();
		if (notification) client.channels.get("525343734746054657").send(notification);
		*/
	});
}

run();
