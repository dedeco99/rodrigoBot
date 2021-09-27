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
	// { command: "stock", func: utils.stock },
	{ command: "reminder", func: utils.reminder },

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

async function handleCommand(command, options) {
	/*
	let customCommands = room ? [] : await CustomCommand.find({ guild: msg.guild.id });

	customCommands = customCommands.map(customCommand => ({
		command: customCommand.word,
		func: () => customCommand.message,
	}));

	customCommands = customCommands.concat(
		discordFeatures.map(feat => ({ command: feat.command, includes: feat.includes, func: () => null })),
	);
	*/

	const feature = features.find(feat => feat.command === command);

	if (!feature) return null;

	console.log(command, options);

	try {
		return { command, message: await feature.func(options) };
	} catch (err) {
		log.error({ status: "command", data: err.stack });

		return null;
	}
}

module.exports = { handleCommand };
