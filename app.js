const discord = require("discord.js");
const moment = require("moment");

const secrets = require("./secrets");
const { getMeta, getBirthdays } = require("./database");
const command = require("./command");
const youtube = require("./youtube");
const twitch = require("./twitch");

let lastMsg = null;

async function handleMessage(msg, client) {
	const message = await command.checkForCommand(msg, client);

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

	const metaInfo = await getMeta();

	client.on("ready", () => {
		console.log(`Logged in as ${client.user.tag}!`);
		client.user.setActivity(metaInfo.action, { type: "PLAYING" });

		setInterval(async () => {
			let notification = await youtube.fetchNotifications();
			if (notification) client.channels.get("525343734746054657").send(`${notification.notification} | ${notification.video}`);

			notification = await twitch.fetchNotifications();
			if (notification) client.channels.get("525343734746054657").send(`${notification.notification} | ${notification.video}`);

			if (moment().format("H") === "8") {
				const birthdays = await getBirthdays({ $expr: { $eq: [{ $dayOfYear: "$date" }, { $dayOfYear: new Date() }] } });
				for (const birthday of birthdays) {
					client.channels.get("231537439926124545").send(`Parabéns ${birthday.person}`);
				}
			}

			console.log("Checked");
		}, 60000 * 10); // check every 10 minutes
	});

	client.on("message", async (msg) => {
		await handleMessage(msg, client);
	});
}

run();
