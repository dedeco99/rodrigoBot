var youtube = require("./youtube");
var twitch = require("./twitch");
var instagram = require("./instagram");

var play = (msg, callback, client) => {
	var order = msg.content.split("vai jogar ")[1];
	client.user.setActivity(order, {type: "PLAYING"});
};

var watch = (msg, callback, client) => {
	var order = msg.content.split("vai ver ")[1];
	client.user.setActivity(order, {type: "WATCHING"});
};

var listen = (msg, callback, client) => {
	var order = msg.content.split("vai ouvir ")[1];
	client.user.setActivity(order, {type: "LISTENING"});
};

var youtubeAdd = (msg, callback) => {
	var channel = msg.content.split("youtube add ")[1];
	youtube.addYoutubeChannel({channel}, (res) => {
		callback(res);
	});
};

var youtubeRemove = (msg, callback) => {
	var channel = msg.content.split("youtube remove ")[1];
	youtube.removeYoutubeChannel({channel}, (res) => {
		callback(res);
	});
};

var youtubeGet = (msg, callback) => {
	youtube.getYoutubeChannels((res) => {
		callback(res);
	});
};

var youtubeCheck = (msg, callback) => {
	youtube.getYoutubeNotifications((res) => {
		callback(res.notification + " | " + res.video);
	});
};

var youtubeElse = (msg, callback) => {
	var channel = msg.content.split("youtube ")[1];
	youtube.getYoutubeVideo({channel}, (res) => {
		callback(res);
	});
};

var twitchAdd = (msg, callback) => {
	var channel = msg.content.split("twitch add ")[1];
	twitch.addTwitchChannel({channel}, (res) => {
		callback(res);
	});
};

var twitchRemove = (msg, callback) => {
	var channel = msg.content.split("twitch remove ")[1];
	twitch.removeTwitchChannel({channel}, (res) => {
		callback(res);
	});
};

var twitchGet = (msg, callback) => {
	twitch.getTwitchChannels((res) => {
		callback(res);
	});
};

var twitchCheck = (msg, callback) => {
	twitch.getTwitchNotifications((res) => {
		callback(res.notification + " | " + res.video);
	});
};

var twitchElse = (msg, callback, client) => {
	var channel = msg.content.split("twitch ")[1];
	var url = "https://www.twitch.tv/" + channel;
	callback(url);
	client.user.setActivity(channel, {url, type: "WATCHING"});
};

var insta = (msg, callback) => {
	instagram.getPost(msg, (res) => {
		callback(res);
	});
};

var functions = [
	{command: "vai jogar", func: play},
	{command: "vai ver", func: watch},
	{command: "vai ouvir", func: listen},
	{command: "youtube add", func: youtubeAdd},
	{command: "youtube remove", func: youtubeRemove},
	{command: "youtube get", func: youtubeGet},
	{command: "youtube check", func: youtubeCheck},
	{command: "youtube", func: youtubeElse},
	{command: "twitch add", func: twitchAdd},
	{command: "twitch remove", func: twitchRemove},
	{command: "twitch get", func: twitchGet},
	{command: "twitch check", func: twitchCheck},
	{command: "twitch", func: twitchElse},
	{command: "insta", func: insta}
];

exports.checkForMedia = (msg, client, callback) => {
	var command = msg.content.split(" ")[1];
	var response = null;

	for(var i = 0; i < functions.length; i++){
		if(functions[i].command === command){
			functions[i].func(msg, (res) => {
				console.log(res);
				callback({isMedia: true, msg: res});
			}, client);
			break;
		}else if(i === functions.length-1){
			callback({isMedia: false});
		}
	}
};
