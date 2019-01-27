var request=require("request");
var cheerio=require("cheerio");
var embed=require("./embed");
var youtube=require("./youtube");
var twitch=require("./twitch");

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
		if(msg.content.includes('add')){
			var channel=msg.content.split('youtube add ')[1];
			youtube.addYoutubeChannel({channel:channel},function(res){
				callback({isMedia:isMedia,msg:res});
			});
		}else if(msg.content.includes('remove')){
			var channel=msg.content.split('youtube remove ')[1];
			youtube.removeYoutubeChannel({channel:channel},function(res){
				msg.channel.send(res);
				callback({isMedia:isMedia,msg:res});
			});
		}else if(msg.content.includes('check')){
			youtube.getYoutubeNotifications(function(res){
				callback({isMedia:isMedia,msg:res.notification+" | "+res.video});
			});
		}else if(msg.content.includes('get')){
			youtube.getYoutubeChannels(function(res){
				callback({isMedia:isMedia,msg:res});
			});
		}else{
			var channel=msg.content.split('youtube ')[1];
			youtube.getYoutubeVideo({channel:channel},function(res){
				callback({isMedia:isMedia,msg:res});
			});
		}
	}else if(msg.content.includes('twitch')){
		if(msg.content.includes('add')){
			var channel=msg.content.split('twitch add ')[1];
			twitch.addTwitchChannel({channel:channel},function(res){
				callback({isMedia:isMedia,msg:res});
			});
		}else if(msg.content.includes('remove')){
			var channel=msg.content.split('twitch remove ')[1];
			twitch.removeTwitchChannel({channel:channel},function(res){
				callback({isMedia:isMedia,msg:res});
			});
		}else if(msg.content.includes('check')){
			twitch.getTwitchNotifications(function(res){
				callback({isMedia:isMedia,msg:res.notification+" | "+res.video});
			});
		}else if(msg.content.includes('get')){
			twitch.getTwitchChannels(function(res){
				callback({isMedia:isMedia,msg:res});
			});
		}else{
			var channel=msg.content.split('twitch ')[1];
			var url="https://www.twitch.tv/"+channel;
			callback({isMedia:isMedia,msg:url});
			client.user.setActivity(channel,{url:url,type:"WATCHING"});
		}
	}else if(msg.content.includes('insta')){
		instagram(msg,function(res){
			callback({isMedia:isMedia,msg:res});
		});
	}else{
		callback({isMedia:false,msg:msg});
	}
}

var instagram=function(msg,callback){
	var sentence=msg.content.split('insta ')[1];
	var person=sentence.split(' ')[0];
	var num = sentence.split(' ').pop();
	var url="https://www.instagram.com/"+person+"/";

	request(url, function(error, response, html){
		var foto = html.substring(
			html.lastIndexOf("window._sharedData = ") + 21,
			html.lastIndexOf("</script>")
		);

		foto = foto.substring(0,foto.indexOf("</script>")-1);

		var json = JSON.parse(foto);

		if(json.entry_data.ProfilePage){
			var profilePic = json.entry_data.ProfilePage[0].graphql.user.profile_pic_url_hd;
			var bio = json.entry_data.ProfilePage[0].graphql.user.biography;
			var name = json.entry_data.ProfilePage[0].graphql.user.full_name;
			var followers = json.entry_data.ProfilePage[0].graphql.user.edge_followed_by.count;
			var follows = json.entry_data.ProfilePage[0].graphql.user.edge_follow.count;
			var posts = json.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.count;

			if(bio=="") bio = "No bio";

			var res = {
				url:url,
				profilePic:profilePic,
				bio:bio,
				name:name,
				followers:followers,
				follows:follows,
				image:null,
				error:null,
				posts:posts
			}

			if(!json.entry_data.ProfilePage[0].graphql.user.is_private){
				var images = json.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges;

				if(images.length>0){
					if(isNaN(num) || num>images.length || num<0){
						num = Math.floor(Math.random()*images.length);
					}

					var image = images[num].node.display_url;
					res.image = image;
				}else{
					res.error = "Este perfil não tem fotos";
				}
			}else{
				res.error = "Este xixo é privado :wink:";
			}

			callback(embed.createInstaEmbed(res));
		}else{
			callback("Claramente esse xixo não existe");
		}
	});
}
