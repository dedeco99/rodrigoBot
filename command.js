var utils = require("./utils");
var memes = require("./memes");
var media = require("./media");
var reddit = require("./reddit");
var youtube = require("./youtube");
var twitch = require("./twitch");
var insideJokes = require("./insideJokes");

var features = [
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

	{ command: "insta", func: media.insta },

	{ command: "reddit", func: reddit.checkForReddit },

	{ command: "youtube", func: youtube.checkForCommand },

	{ command: "twitch", func: twitch.checkForCommand },
];

var checkCommand = (msg) => {
	return msg.content.slice(-1) === "?" ? "responde" : msg.content.split(" ")[1];
};

exports.checkForCommand = (msg, callback, client) => {
	var command = checkCommand(msg);
	console.log(command);

	let feature = features.find(feature => feature.command === command);

	if (feature) {
		feature.func(msg, (res) => {
			callback({ isCommand: true, msg: res });
		}, client);
	} else {
		insideJokes.checkForInsideJokes(msg, (checkForInsideJokes) => {
			if (checkForInsideJokes.isInsideJoke) {
				callback({ isCommand: true, msg: checkForInsideJokes.msg });
			} else {
				callback({ isCommand: false });
			}
		});
	}
};
