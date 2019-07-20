var meta = require("./meta");
var youtube = require("./youtube");
var twitch = require("./twitch");
var instagram = require("./instagram");

exports.play = (msg, callback, client) => {
	var action = msg.content.split("play")[1];
	client.user.setActivity(action, {type: "PLAYING"});

	meta.updateMeta({ action });
};

exports.watch = (msg, callback, client) => {
	var action = msg.content.split("watch")[1];
	client.user.setActivity(action, {type: "WATCHING"});

	meta.updateMeta({ action });
};

exports.listen = (msg, callback, client) => {
	var action = msg.content.split("listen")[1];
	client.user.setActivity(action, {type: "LISTENING"});

	meta.updateMeta({ action });
};

exports.youtubeAdd = (msg, callback) => {
	var channel = msg.content.split("youtube add ")[1];
	youtube.addYoutubeChannel({channel}, (res) => {
		callback(res);
	});
};

exports.youtubeRemove = (msg, callback) => {
	var channel = msg.content.split("youtube remove ")[1];
	youtube.removeYoutubeChannel({channel}, (res) => {
		callback(res);
	});
};

exports.youtubeGet = (msg, callback) => {
	youtube.getYoutubeChannels((res) => {
		callback(res);
	});
};

exports.youtubeCheck = (msg, callback) => {
	youtube.getYoutubeNotifications((res) => {
		callback(res.notification + " | " + res.video);
	});
};

exports.youtubeElse = (msg, callback) => {
	var channel = msg.content.split("youtube ")[1];
	youtube.getYoutubeVideo({channel}, (res) => {
		callback(res);
	});
};

exports.twitchAdd = (msg, callback) => {
	var channel = msg.content.split("twitch add ")[1];
	twitch.addTwitchChannel({channel}, (res) => {
		callback(res);
	});
};

exports.twitchRemove = (msg, callback) => {
	var channel = msg.content.split("twitch remove ")[1];
	twitch.removeTwitchChannel({channel}, (res) => {
		callback(res);
	});
};

exports.twitchGet = (msg, callback) => {
	twitch.getTwitchChannels((res) => {
		callback(res);
	});
};

exports.twitchCheck = (msg, callback) => {
	twitch.getTwitchNotifications((res) => {
		callback(res.notification + " | " + res.video);
	});
};

exports.twitchElse = (msg, callback, client) => {
	var channel = msg.content.split("twitch ")[1];
	var url = "https://www.twitch.tv/" + channel;
	callback(url);
	client.user.setActivity(channel, {url, type: "WATCHING"});
};

exports.insta = (msg, callback) => {
	instagram.getPost(msg, (res) => {
		callback(res);
	});
};
