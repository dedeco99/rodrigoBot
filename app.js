const discord = require("discord.js");

const secrets = require("./secrets");
const { initialize } = require("./database");
const { checkForCommand } = require("./command");
const twitch = require("./twitch");
const youtube = require("./youtube");

const Meta = require("./models/meta");

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

	setInterval(async () => {
		const notification = await youtube.fetchNotifications();
		if (notification) client.channels.get("525343734746054657").send(notification);

		/*
		notification = await twitch.fetchNotifications();
		if (notification) client.channels.get("525343734746054657").send(notification);
		*/

		/*
		if (moment().format("H") === "8") {
			const birthdays = await Birthday.find({
				$expr: { $eq: [{ $dayOfYear: "$date" }, { $dayOfYear: new Date() }] },
			});
			for (const birthday of birthdays) {
				client.channels.get("231537439926124545").send(`Parabéns ${birthday.person}`);
			}
		}
		*/

		console.log("Checked");
	}, 60000 * 60); // check every hour
}

run();
