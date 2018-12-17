var youtube=require("./youtube");

exports.checkForMedia=function(msg,client,callback){
	var isMedia=true;

	if(msg.content.includes("vai brincar")){
		var order=msg.content.split('vai brincar ')[1];
		client.user.setActivity(order,{type:"PLAYING"});
	}else if(msg.content.includes("vai jogar")){
		var order=msg.content.split('vai jogar ')[1];
		client.user.setActivity(order,{type:"PLAYING"});
	}else if(msg.content.includes("vai ouvir")){
		var order=msg.content.split('vai ouvir ')[1];
		client.user.setActivity(order,{type:"LISTENING"});
	}else if(msg.content.includes("vai ver")){
		var order=msg.content.split('vai ver ')[1];
		client.user.setActivity(order,{type:"WATCHING"});
	}else if(msg.content.includes('youtube')){
		var channel=msg.content.split('youtube ')[1];
		youtube.getYoutubeVideo({channel:channel},function(res){
			if(res==""){
				msg.channel.send("Esse canal deve estar no xixo porque não o encontro");
			}else{
				msg.channel.send(res);
			}
		});
	}else if(msg.content.includes('twitch')){
		var channel=msg.content.split('twitch ')[1];
		var url="https://www.twitch.tv/"+channel;
		msg.channel.send(url);
		client.user.setActivity(channel,{url:url,type:"WATCHING"});
	}else{
		isMedia=false;
	}

	callback({isMedia:isMedia,msg:msg});
}
