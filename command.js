const utils = require("./utils");
const memes = require("./memes");
const media = require("./media");
const crypto = require("./crypto");
const reddit = require("./reddit");
const youtube = require("./youtube");
const twitch = require("./twitch");
const instagram = require("./instagram");
const custom = require("./custom");
const { updateMeta } = require("./database");
const log = require("./log");

const CustomCommand = require("./models/customCommand");

const features = [
	{ command: "define", func: utils.define },
	{ command: "procura", func: utils.search },
	{ command: "responde", func: utils.answer },
	{ command: "math", func: utils.math },
	{ command: "ordena", func: utils.sort },
	{ command: "converte", func: utils.convert },
	{ command: "vote", func: utils.vote },
	{ command: "price", func: utils.price },
	{ command: "music", func: utils.music },

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
];

async function checkForCustomCommands(msg, client) {
	const customCommands = await CustomCommand.find({ guild: msg.guild.id });

	const customCommand = customCommands.find(c => msg.content.includes(c.word));

	if (customCommand) {
		// eslint-disable-next-line no-use-before-define
		const message = await checkForCommand({ ...msg, content: customCommand.message }, client);
		console.log("message", message);

		if (message) return message;

		return customCommand.message;
	}

	return null;
}

async function checkForWord(msg, client) {
	const customCommand = await checkForCustomCommands(msg, client);
	if (customCommand) return customCommand;

	const compliments = ["good", "nice", "best", "bom", "bem", "grande"];
	const insults = ["bad", "worst", "autistic", "mau", "mal", "lixo", "autista"];
	if (compliments.find(compliment => msg.content.includes(compliment))) {
		const metaInfo = await updateMeta({ likes: true });

		return `Durante a minha existência já gostaram de mim ${metaInfo.likes} vezes. I can't handle it!!! *touches face violently*`;
	} else if (insults.find(insult => msg.content.includes(insult))) {
		const metaInfo = await updateMeta({ dislikes: true });

		return `Durante a minha existência já me deram bullying ${metaInfo.dislikes} vezes. Vou chamar os meus pais. *cries while getting hit with a laptop*`;
	}

	return null;
}

function checkForCommand(msg, client) {
	const triggerWord = "rodrigo";
	const firstWord = msg.content.split(" ")[0].toLowerCase();

	if (firstWord === triggerWord) {
		const command = msg.content.slice(-1) === "?" ? "responde" : msg.content.split(" ")[1];
		console.log(command);

		const feature = features.find(feat => feat.command === command);
		console.log("feature", feature);

		if (feature) {
			try {
				return feature.func(msg, client);
			} catch (err) {
				log.error({ status: "command", data: err.stack });

				return null;
			}
		}
	}

	if (msg.content.toLowerCase().includes(triggerWord)) return checkForWord(msg, client);

	return null;
}

module.exports = {
	checkForCommand,
};
