const discord = require("discord.js");

const secrets = require("./secrets");
const Meta = require("./meta");
const command = require("./command");
const youtube = require("./youtube");
const twitch = require("./twitch");

const client = new discord.Client();

client.login(secrets.discordKey);

Meta.getMeta();
let lastMsg = null;

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
	const meta = JSON.parse(secrets.meta);
	client.user.setActivity(meta.action, { type: "PLAYING" });

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

//TODO: lower complexity
/* eslint-disable complexity */
client.on("message", (msg) => {
	const firstWord = msg.content.split(" ")[0].toLowerCase();
	const meta = JSON.parse(secrets.meta);

	if (firstWord === "rodrigo") {
		command.checkForCommand(msg, (checkForCommand) => {
			if (checkForCommand.isCommand) {
				msg.channel.send(checkForCommand.msg);
			} else if (msg.content.includes("delete")) {
				if (lastMsg !== null) {
					lastMsg.delete();
					msg.delete();
				}
			}
		}, client);
	} else if (msg.author.username === "RodrigoBot") {
		lastMsg = msg;
	} else if (msg.content.includes(":rodrigo:")) {
		msg.channel.send("Que carinha laroca!");
	} else if (msg.content.includes("rodrigo")) {
		const compliments = ["good", "nice", "best", "bom", "bem", "grande"];
		const insults = ["bad", "worst", "autistic", "mau", "mal", "lixo", "autista"];

		if (compliments.find(compliment => msg.content.includes(compliment))) {
			meta.likes++;
			msg.channel.send(`Durante a minha existência já gostaram de mim ${meta.likes} vezes.
							I can't handle it!!! *touches face violently*`);

			Meta.updateMeta({ likes: meta.likes });
		} else if (insults.find(insult => msg.content.includes(insult))) {
			meta.dislikes++;
			msg.channel.send(`Durante a minha existência já me deram bullying ${meta.dislikes} vezes.
							Vou chamar os meus pais. *cries while getting hit with a laptop*`);

			Meta.updateMeta({ dislikes: meta.dislikes });
		}
	}
});
