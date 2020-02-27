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
	{ command: ":phrase?", func: utils.answer },
	{ command: "define :word", func: utils.define },
	{ command: "search :topic", func: utils.search },
	{ command: "sort :options", func: utils.sort },
	{ command: "convert :number :from to :to", func: utils.convert },
	{ command: "math :operation", func: utils.math },
	{ command: "vote :options", func: utils.vote },
	{ command: "price", func: utils.price },
	{ command: "music :command :link:", func: utils.music },

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

		if (message) return message;

		if (!customCommand.message.toLowerCase().includes("rodrigo")) return customCommand.message;
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

function commandTranslator(command) {
	const params = command.split(" ");
	let regex = "";

	for (const param of params) {
		if (param[0] === ":") {
			if (param[param.length - 1] === ":") {
				regex += escapeStringRegexp("(?: |\\Z)");
			} else {
				regex += " ";
			}

			regex += `(?<${param.replace(/:/g, "").replace(/\?/g, "")}>.*|$)`;

			if (param[param.length - 1] === ":") regex += "?";
		} else {
			regex += param;
		}
	}

	console.log("regex", regex);

	return new RegExp(regex, "g");
}

function checkForCommand(msg) {
	const triggerWord = "rodrigo";
	const firstWord = msg.content.split(" ")[0].toLowerCase();

	if (firstWord === triggerWord) {
		let params = null;
		const cleanMessage = msg.content.replace(`${triggerWord} `, "");

		const feature = features.find((feat) => {
			const regex = commandTranslator(feat.command);

			const match = regex.exec(cleanMessage);
			console.log(match);

			return false;
		});

		if (feature) {
			console.log("params", params);
			console.log(feature.command);

			try {
				return feature.func(msg, params);
			} catch (err) {
				log.error({ status: "command", data: err.stack });

				return null;
			}
		}
	}

	if (msg.content.toLowerCase().includes(triggerWord)) return checkForWord(msg);

	return null;
}

module.exports = {
	checkForCommand,
};
