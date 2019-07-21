const utils = require("./utils");
const memes = require("./memes");
const media = require("./media");
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
	{ command: "crypto", func: utils.crypto },
	{ command: "price", func: utils.amazon },
	{ command: "clever", func: utils.clever },
	{ command: "music", func: utils.music },

	{ command: "meme", func: memes.checkForMemes },

	{ command: "play", func: media.play },
	{ command: "watch", func: media.watch },
	{ command: "listen", func: media.listen },

	{ command: "insta", func: instagram.getPost },

	{ command: "reddit", func: reddit.checkForReddit },

	{ command: "youtube", func: youtube.checkForCommand },

	{ command: "twitch", func: twitch.checkForCommand }
];

const checkCommand = (msg) => {
	return msg.content.slice(-1) === "?" ? "responde" : msg.content.split(" ")[1];
};

exports.checkForCommand = (msg, callback, client) => {
	const command = checkCommand(msg);
	console.log(command);

	const feature = features.find(feat => feat.command === command);

	if (feature) {
		feature.func(msg, (res) => {
			return callback({ isCommand: true, msg: res });
		}, client);
	} else {
		insideJokes.checkForInsideJokes(msg, (checkForInsideJokes) => {
			if (checkForInsideJokes.isInsideJoke) {
				return callback({ isCommand: true, msg: checkForInsideJokes.msg });
			}

			return callback({ isCommand: false });
		});
	}
};
