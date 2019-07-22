const discord = require("discord.js");

const secrets = require("./secrets");
const { getMeta } = require("./database");
const command = require("./command");
const youtube = require("./youtube");
const twitch = require("./twitch");

const handleMessage = async (msg, lastMsg, client, callback) => {
	let retLastMsg = lastMsg;

	const res = await command.checkForCommand(msg, client);

	if (res) {
		msg.channel.send(res);
	} else if (msg.content.includes("delete") && lastMsg) {
		lastMsg.delete();
		msg.delete();
	} else if (msg.author.username === "RodrigoBot") {
		retLastMsg = msg;
	}

	callback(retLastMsg);
};

const run = async () => {
	const client = new discord.Client();
	client.login(secrets.discordKey);

	const metaInfo = await getMeta();
	let lastMsg = null;

	client.on("ready", () => {
		console.log(`Logged in as ${client.user.tag}!`);
		client.user.setActivity(metaInfo.action, { type: "PLAYING" });

		setInterval(async () => {
			let res = await youtube.fetchNotifications();
			if (res) client.channels.get("525343734746054657").send(`${res.notification} | ${res.video}`);

			res = await twitch.fetchNotifications();
			if (res) client.channels.get("525343734746054657").send(`${res.notification} | ${res.video}`);

			console.log("Checked");
		}, 60000 * 10); //check every 10 minutes
	});

	client.on("message", msg => handleMessage(msg, lastMsg, client, res => {
		lastMsg = res;
	}));
};

run();
