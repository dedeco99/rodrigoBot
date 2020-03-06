/* global lastMsgs */

const utils = require("./utils");
const memes = require("./memes");
const media = require("./media");
const crypto = require("./crypto");
const reddit = require("./reddit");
const youtube = require("./youtube");
const twitch = require("./twitch");
const instagram = require("./instagram");
const custom = require("./custom");
const log = require("./log");

const CustomCommand = require("./models/customCommand");

const features = [
	{ command: ["apaga", "delete"], func: utils.deleteLastMsg },
	{ command: "define", func: utils.define },
	{ command: "procura", func: utils.search },
	{ command: "responde", func: utils.answer },
	{ command: "math", func: utils.math },
	{ command: "ordena", func: utils.sort },
	{ command: "converte", func: utils.convert },
	{ command: "vote", func: utils.vote },
	{ command: "price", func: utils.price },
	{ command: "music", func: utils.music },
	{ command: "remindme", func: utils.remindMe },

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

	{ command: ["good", "nice", "best", "bom", "bem", "grande"], func: utils.compliment },
	{ command: ["bad", "worst", "autistic", "mau", "mal", "lixo", "autista"], func: utils.insult },
];

async function checkForCommand(msg) {
	const triggerWord = "rodrigo";
	const firstWord = msg.content.split(" ")[0].toLowerCase();

	if (msg.author && msg.author.username === "RodrigoBot") {
		lastMsgs.push(msg);
		if (lastMsgs.length > 10) lastMsgs.shift();
	}

	if (firstWord === triggerWord) {
		const command = msg.content.slice(-1) === "?" ? "responde" : msg.content.split(" ")[1];
		console.log(command);

		const feature = features.find((feat) => {
			if (Array.isArray(feat.command)) return feat.command.includes(command);
			return feat.command === command;
		});

		if (feature) {
			try {
				return feature.func(msg);
			} catch (err) {
				log.error({ status: "command", data: err.stack });

				return null;
			}
		}
	}

	if (msg.content.toLowerCase().includes(triggerWord)) {
		const customCommands = await CustomCommand.find({ guild: msg.guild.id });

		const customCommand = customCommands.find(c => msg.content.includes(c.word));

		if (customCommand) {
			if (customCommand.message.toLowerCase().includes(triggerWord)) {
				const message = await checkForCommand({ ...msg, content: customCommand.message });

				if (message) return message;
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
