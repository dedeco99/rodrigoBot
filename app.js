const discord = require("discord.js");

const secrets = require("./secrets");
const database = require("./database");
const command = require("./command");
const youtube = require("./youtube");
const twitch = require("./twitch");

const handleMessage = async (msg, lastMsg, client, callback) => {
	const firstWord = msg.content.split(" ")[0].toLowerCase();
	const res = {};

	if (firstWord === "rodrigo") {
		command.checkForCommand(msg, (checkForCommand) => {
			if (checkForCommand.isCommand) {
				msg.channel.send(checkForCommand.msg);
			} else if (msg.content.includes("delete") && lastMsg) {
				lastMsg.delete();
				msg.delete();
			}
		}, client);
	} else if (msg.author.username === "RodrigoBot") {
		res.lastMsg = msg;
	} else if (msg.content.includes(":rodrigo:")) {
		msg.channel.send("Que carinha laroca!");
	} else if (msg.content.includes("rodrigo")) {
		const compliments = ["good", "nice", "best", "bom", "bem", "grande"];
		const insults = ["bad", "worst", "autistic", "mau", "mal", "lixo", "autista"];

		if (compliments.find(compliment => msg.content.includes(compliment))) {
			const metaInfo = await database.updateMeta({ likes: true });

			msg.channel.send(`Durante a minha existência já gostaram de mim ${metaInfo.likes} vezes.
							I can't handle it!!! *touches face violently*`.replace(/\t/g, "").replace(/\n/g, ""));
		} else if (insults.find(insult => msg.content.includes(insult))) {
			const metaInfo = await database.updateMeta({ dislikes: true });

			msg.channel.send(`Durante a minha existência já me deram bullying ${metaInfo.dislikes} vezes.
							Vou chamar os meus pais. *cries while getting hit with a laptop*`.replace(/\t/g, "").replace(/\n/g, ""));
		}
	}

	return callback(res);
};

const run = async () => {
	const client = new discord.Client();
	client.login(secrets.discordKey);

	const metaInfo = await database.getMeta();
	let lastMsg = null;

	client.on("ready", () => {
		console.log(`Logged in as ${client.user.tag}!`);
		client.user.setActivity(metaInfo.action, { type: "PLAYING" });

		setInterval(() => {
			youtube.getYoutubeNotifications((res) => {
				client.channels.get("525343734746054657").send(`${res.notification} | ${res.video}`);
			});
			twitch.getTwitchNotifications((res) => {
				client.channels.get("525343734746054657").send(`${res.notification} | ${res.video}`);
			});
			console.log("Checked");
		}, 60000 * 10); //check every 10 minutes
	});

	client.on("message", msg => handleMessage(msg, lastMsg, client, (res) => {
		lastMsg = res.lastMsg;
	}));
};

run();
