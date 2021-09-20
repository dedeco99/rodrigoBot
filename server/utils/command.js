const log = require("../utils/log");

const utils = require("../functions/utils");
const memes = require("../functions/memes");
const reddit = require("../functions/reddit");
const youtube = require("../functions/youtube");
const twitch = require("../functions/twitch");
const instagram = require("../functions/instagram");
const crypto = require("../functions/crypto");
const personality = require("../functions/personality");

let features = [
	// Utils
	{ command: "answer", func: utils.answer },
	{ command: "define", func: utils.define },
	{ command: "search", func: utils.search },
	{ command: "sort", func: utils.sort },
	{ command: "convert", func: utils.convert },
	{ command: "math", func: utils.math },
	// { command: "price", func: utils.price },
	{ command: "crypto", func: crypto.getPrice },
	{ command: "weather", func: utils.weather },
	{ command: "radar", func: utils.radars },
	{ command: "corona", func: utils.corona },
	{ command: "keyboards", func: utils.keyboards },
	{ command: "stock", func: utils.stock },

	// Memes
	{ command: "meme", func: memes.createMeme },

	// Social Media
	{ command: "reddit", func: reddit.getPost },
	{ command: "youtube", func: youtube.getVideo },
	{ command: "twitch", func: twitch.getStream },
	{ command: "insta", func: instagram.getPost },

	// Personality
	{ command: "compliment", func: personality.compliment },
	{ command: "insult", func: personality.insult },
];

async function handleMessage(msg, customCommands) {
	const triggerWord = "rodrigo";
	const firstWord = msg.split(" ")[0].toLowerCase();

	if (!msg.toLowerCase().includes(triggerWord)) return null;

	const detectedCommand = msg.slice(-1) === "?" ? "answer" : msg.split(" ")[1];

	if (customCommands) features = features.concat(customCommands);

	const feature = features.find(feat => {
		if (!feat.includes && firstWord === triggerWord) {
			if (Array.isArray(feat.command)) return feat.command.includes(detectedCommand);
			return feat.command === detectedCommand;
		} else if (feat.includes) {
			if (Array.isArray(feat.command)) {
				return feat.command.some(c => msg.includes(c));
			}
			return msg.includes(feat.command);
		}

		return false;
	});

	if (feature) {
		const command = Array.isArray(feature.command) ? feature.command[0] : feature.command;
		console.log(command);

		try {
			return { command, message: await feature.func(msg) };
		} catch (err) {
			log.error({ status: "command", data: err.stack });

			return null;
		}
	}

	return null;
}

async function handleCommand(command, options) {
	const feature = features.find(feat => feat.command === command);

	if (!feature) return null;

	console.log(command);

	try {
		return { command, message: await feature.func(options) };
	} catch (err) {
		log.error({ status: "command", data: err.stack });

		return null;
	}
}

module.exports = { handleMessage, handleCommand };
