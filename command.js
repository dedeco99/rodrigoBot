var utils = require("./utils");
var memes = require("./memes");
var media = require("./media");
var reddit = require("./reddit");
var insideJokes = require("./insideJokes");

var features = [
	{command: "define", func: utils.define},
	{command: "procura", func: utils.procura},
	{command: "responde", func: utils.responde},
	{command: "math", func: utils.math},
	{command: "ordena", func: utils.ordena},
	{command: "converte", func: utils.converte},
	{command: "vote", func: utils.vote},
	{command: "getvote", func: utils.getvote},
	{command: "crypto", func: utils.crypto},
	{command: "price", func: utils.amazon},
	{command: "clever", func: utils.clever},
	{command: "music", func: utils.music},

	{command: "meme", func: memes.checkForMemes},

	{command: "play", func: media.play},
	{command: "watch", func: media.watch},
	{command: "listen", func: media.listen},
	{command: "youtube add", func: media.youtubeAdd},
	{command: "youtube remove", func: media.youtubeRemove},
	{command: "youtube get", func: media.youtubeGet},
	{command: "youtube check", func: media.youtubeCheck},
	{command: "youtube", func: media.youtubeElse},
	{command: "twitch add", func: media.twitchAdd},
	{command: "twitch remove", func: media.twitchRemove},
	{command: "twitch get", func: media.twitchGet},
	{command: "twitch check", func: media.twitchCheck},
	{command: "twitch", func: media.twitchElse},
	{command: "insta", func: media.insta},

	{command: "reddit", func: reddit.checkForReddit},
];

var checkCommand = (msg) => {
	return msg.content.slice(-1) === "?" ? "responde" : msg.content.split(" ")[1];
};

var twoWordCommand = (msg) => {
	return msg.content.split(" ")[1] + " " + msg.content.split(" ")[2];
};

exports.checkForCommand = (msg, callback, client) => {
	var command = checkCommand(msg);
	console.log(command);

	let feature = features.find(feature => feature.command === command);

	if(feature){
		feature.func(msg, (res) => {
			callback({isCommand: true, msg: res});
		}, client);
	}else{
		//TODO: Find better way to handle two word commands
		feature = features.find(feature => feature.command === twoWordCommand(msg));

		if(feature){
			feature.func(msg, (res) => {
				callback({isCommand: true, msg: res});
			}, client);
		}else{
			insideJokes.checkForInsideJokes(msg, (checkForInsideJokes) => {
				if(checkForInsideJokes.isInsideJoke){
					callback({isCommand: true, msg: checkForInsideJokes.msg});
				}else{
					callback({isCommand: false});
				}
			});
		}
	}
};
