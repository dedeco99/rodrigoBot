/* global lastMsgs */

const utils = require("./functions/utils");
const memes = require("./functions//memes");
const media = require("./functions//media");
const crypto = require("./functions//crypto");
const reddit = require("./functions//reddit");
const youtube = require("./functions//youtube");
const twitch = require("./functions//twitch");
const instagram = require("./functions//instagram");
const custom = require("./functions//custom");
const birthday = require("./functions//birthday");
const cronjob = require("./functions//cronjob");
const log = require("./utils/log");

const CustomCommand = require("./models/customCommand");

const features = [
	{ command: ["delete", "apaga"], func: utils.deleteLastMsg },
	{ command: "define", func: utils.define },
	{ command: ["search", "procura"], func: utils.search },
	{ command: "answer", func: utils.answer },
	{ command: "math", func: utils.math },
	{ command: ["sort", "ordena"], func: utils.sort },
	{ command: ["convert", "converte"], func: utils.convert },
	{ command: "vote", func: utils.vote },
	{ command: "price", func: utils.price },
	{ command: "music", func: utils.music },
	{ command: "remindme", func: utils.remindMe },
	{ command: "radar", func: utils.getRadar },
	{ command: "weather", func: utils.weather },
	{ command: "help", func: utils.help },

	{ command: "meme", func: memes.checkForMemes },

	{ command: "play", func: media.play },
	{ command: "watch", func: media.watch },
	{ command: "listen", func: media.listen },

	{ command: "crypto", func: crypto.getPrice },

	{ command: "insta", func: instagram.getPost },

	{ command: "reddit", func: reddit.checkForReddit },

	{ command: "youtube", func: youtube.checkForCommand },

	{ command: "twitch", func: twitch.checkForCommand },

	{ command: "custom", func: custom.checkForCommand },

	{ command: "birthday", func: birthday.checkForBirthday },

	{ command: "cronjob", func: cronjob.checkForCronjob },

	{
		command: ["good", "nice", "best", "bom", "bem", "grande"],
		includes: true,
		func: utils.compliment,
	},
	{
		command: ["bad", "worst", "autistic", "mau", "mal", "lixo", "autista"],
		includes: true,
		func: utils.insult,
	},
];

async function checkForCommand(msg) {
	const triggerWord = "rodrigo";
	const firstWord = msg.content.split(" ")[0].toLowerCase();

	if (msg.author && msg.author.username === "RodrigoBot") {
		lastMsgs.push(msg);
		if (lastMsgs.length > 10) lastMsgs.shift();
	}

	if (msg.content.toLowerCase().includes(triggerWord)) {
		const command = msg.content.slice(-1) === "?" ? "answer" : msg.content.split(" ")[1];
		console.log(command);

		const feature = features.find((feat) => {
			if (!feat.includes && firstWord === triggerWord) {
				if (Array.isArray(feat.command)) return feat.command.includes(command);
				return feat.command === command;
			} else if (feat.includes) {
				if (Array.isArray(feat.command)) {
					return feat.command.some(c => msg.content.includes(c));
				}
				return msg.content.includes(feat.command);
			}

			return false;
		});

		if (feature) {
			try {
				return feature.func(msg);
			} catch (err) {
				log.error({ status: "command", data: err.stack });

				return null;
			}
		}

		const customCommands = await CustomCommand.find({ guild: msg.guild.id });

		const customCommand = customCommands.find(c => msg.content.includes(c.word));

		if (customCommand) {
			if (customCommand.message.toLowerCase().includes(triggerWord)) {
				const message = await checkForCommand({ ...msg, content: customCommand.message });

				if (message !== null) return message;
			} else {
				return customCommand.message;
			}
		}
	}

	return null;
}

module.exports = {
	checkForCommand,
};
