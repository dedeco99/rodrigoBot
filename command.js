const utils = require("./utils");
const memes = require("./memes");
const media = require("./media");
const crypto = require("./crypto");
const reddit = require("./reddit");
const youtube = require("./youtube");
const twitch = require("./twitch");
const instagram = require("./instagram");
const insideJokes = require("./insideJokes");

const features = [
	{ command: "define", func: utils.define },
	{ command: "procura", func: utils.procura },
	{ command: "responde", func: utils.responde },
	{ command: "math", func: utils.math },
	{ command: "ordena", func: utils.ordena },
	{ command: "converte", func: utils.converte },
	{ command: "vote", func: utils.vote },
	{ command: "getvote", func: utils.getvote },
	{ command: "price", func: utils.amazon },
	{ command: "clever", func: utils.clever },
	{ command: "music", func: utils.music },

	{ command: "meme", func: memes.checkForMemes },

	{ command: "play", func: media.play },
	{ command: "watch", func: media.watch },
	{ command: "listen", func: media.listen },

	{ command: "crypto", func: crypto.getPrice },

	{ command: "insta", func: instagram.getPost },

	{ command: "reddit", func: reddit.checkForReddit },

	{ command: "youtube", func: youtube.checkForCommand },

	{ command: "twitch", func: twitch.checkForCommand }
];

const checkCommand = (msg) => {
	return msg.content.slice(-1) === "?" ? "responde" : msg.content.split(" ")[1];
};

exports.checkForCommand = async (msg, client) => {
	const command = checkCommand(msg);
	console.log(command);

	const feature = features.find(feat => feat.command === command);

	let response = null;
	if (feature) {
		const res = await feature.func(msg, client);
		response = { isCommand: true, response: res };
	} else {
		const { isInsideJoke, res } = insideJokes.checkForInsideJokes(msg);

		if (isInsideJoke) {
			response = { isCommand: true, response: res };
		} else {
			response = { isCommand: false };
		}
	}

	return response;
};
