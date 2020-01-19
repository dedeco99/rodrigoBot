const utils = require("./utils");
const memes = require("./memes");
const media = require("./media");
const crypto = require("./crypto");
const reddit = require("./reddit");
const youtube = require("./youtube");
const twitch = require("./twitch");
const instagram = require("./instagram");
const insideJokes = require("./insideJokes");
const { updateMeta } = require("./database");
const log = require("./log");

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

	{ command: "joke", func: insideJokes.checkForCommand },
];

function checkCommand(msg) {
	return msg.content.slice(-1) === "?" ? "responde" : msg.content.split(" ")[1];
}

async function checkForWord(msg) {
	const insideJoke = await insideJokes.checkForCommand(msg);
	if (insideJoke) return insideJoke;

	const compliments = ["good", "nice", "best", "bom", "bem", "grande"];
	const insults = ["bad", "worst", "autistic", "mau", "mal", "lixo", "autista"];
	if (compliments.find(compliment => msg.content.includes(compliment))) {
		const metaInfo = await updateMeta({ likes: true });

		return `Durante a minha existência já gostaram de mim ${metaInfo.likes} vezes.
						I can't handle it!!! *touches face violently*`.replace(/\t/g, "").replace(/\n/g, "");
	} else if (insults.find(insult => msg.content.includes(insult))) {
		const metaInfo = await updateMeta({ dislikes: true });

		return `Durante a minha existência já me deram bullying ${metaInfo.dislikes} vezes.
						Vou chamar os meus pais. *cries while getting hit with a laptop*`.replace(/\t/g, "").replace(/\n/g, "");
	}

	return null;
}

async function checkForCommand(msg, client) {
	const triggerWord = "rodrigo";
	const firstWord = msg.content.split(" ")[0].toLowerCase();

	if (msg.content.toLowerCase().includes(triggerWord)) {
		if (firstWord === triggerWord) {
			const command = checkCommand(msg);
			console.log(command);

			const feature = features.find(feat => feat.command === command);

			if (feature) {
				try {
					return await feature.func(msg, client);
				} catch (err) {
					log.error({ status: "command", data: err.stack });
				}
			}
		}

		return checkForWord(msg);
	}

	return null;
}

module.exports = {
	checkForCommand,
};
