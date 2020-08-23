const log = require("../utils/log");

const utils = require("../functions/utils");
const reddit = require("../functions/reddit");
const youtube = require("../functions/youtube");
const twitch = require("../functions/twitch");
const instagram = require("../functions/instagram");
const crypto = require("../functions/crypto");

let features = [
	// Utils
	{ command: "answer", func: utils.answer },
	{ command: "define", func: utils.define },
	{ command: ["search", "procura"], func: utils.search },
	{ command: ["sort", "ordena"], func: utils.sort },
	{ command: ["convert", "converte"], func: utils.convert },
	{ command: "math", func: utils.math },
	// { command: "price", func: utils.price },
	{ command: "weather", func: utils.weather },
	{ command: "radar", func: utils.radars },
	{ command: "corona", func: utils.corona },
	{ command: "help", func: utils.help },

	// Social Media
	{ command: "reddit", func: reddit.checkForReddit },
	{ command: "youtube", func: youtube.getVideo },
	{ command: "twitch", func: twitch.getStream },
	{ command: "insta", func: instagram.getPost },
	{ command: "crypto", func: crypto.getPrice },
];

async function checkForCommand(msg, customCommands) {
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

module.exports = { checkForCommand };
