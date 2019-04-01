var youtube = require("./youtube");
var twitch = require("./twitch");
var instagram = require("./instagram");

exports.checkForMedia = (msg, client, callback) => {
	var isMedia = true;
	var order = null;

	if(msg.content.includes("vai brincar")){
		order = msg.content.split("vai brincar ")[1];
		client.user.setActivity(order, {type: "PLAYING"});
	}else if(msg.content.includes("vai jogar")){
		order = msg.content.split("vai jogar ")[1];
		client.user.setActivity(order, {type: "PLAYING"});
	}else if(msg.content.includes("vai ouvir")){
		order = msg.content.split("vai ouvir ")[1];
		client.user.setActivity(order, {type: "LISTENING"});
	}else if(msg.content.includes("vai ver")){
		order = msg.content.split("vai ver ")[1];
		client.user.setActivity(order, {type: "WATCHING"});
	}else if(msg.content.includes("youtube")){
		var channel;
		if(msg.content.includes("add")){
			channel = msg.content.split("youtube add ")[1];
			youtube.addYoutubeChannel({channel}, (res) => {
				callback({isMedia, msg: res});
			});
		}else if(msg.content.includes("remove")){
			channel = msg.content.split("youtube remove ")[1];
			youtube.removeYoutubeChannel({channel}, (res) => {
				callback({isMedia, msg: res});
			});
		}else if(msg.content.includes("check")){
			youtube.getYoutubeNotifications((res) => {
				callback({isMedia, msg: res.notification + " | " + res.video});
			});
		}else if(msg.content.includes("get")){
			youtube.getYoutubeChannels((res) => {
				callback({isMedia, msg: res});
			});
		}else{
			channel = msg.content.split("youtube ")[1];
			youtube.getYoutubeVideo({channel}, (res) => {
				callback({isMedia, msg: res});
			});
		}
	}else if(msg.content.includes("twitch")){
		var channel;

		if(msg.content.includes("add")){
			channel = msg.content.split("twitch add ")[1];
			twitch.addTwitchChannel({channel}, (res) => {
				callback({isMedia, msg: res});
			});
		}else if(msg.content.includes("remove")){
			channel = msg.content.split("twitch remove ")[1];
			twitch.removeTwitchChannel({channel}, (res) => {
				callback({isMedia, msg: res});
			});
		}else if(msg.content.includes("check")){
			twitch.getTwitchNotifications((res) => {
				callback({isMedia, msg: res.notification + " | " + res.video});
			});
		}else if(msg.content.includes("get")){
			twitch.getTwitchChannels((res) => {
				callback({isMedia, msg: res});
			});
		}else{
			channel = msg.content.split("twitch ")[1];
			var url = "https://www.twitch.tv/" + channel;
			callback({isMedia, msg: url});
			client.user.setActivity(channel, {url, type: "WATCHING"});
		}
	}else if(msg.content.includes("insta")){
		instagram.getPost(msg, (res) => {
			callback({isMedia, msg: res});
		});
	}else{
		callback({isMedia: false, msg});
	}
}
