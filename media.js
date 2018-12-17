var request=require("request");
var cheerio=require("cheerio");
var embed=require("./embed");
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
	}else if(msg.content.includes('insta')){
		instagram(msg);
		//msg.channel.send(url);
	}else{
		isMedia=false;
	}

	callback({isMedia:isMedia,msg:msg});
}

var instagram=function(msg){
	var person=msg.content.split('insta ')[1];
	var url="https://www.instagram.com/"+person+"/";

	request(url, function(error, response, html){
		var foto = html.substring(
			html.lastIndexOf("window._sharedData = ") + 21,
			html.lastIndexOf("</script>")
		);

		foto = foto.substring(0,foto.indexOf("</script>")-1);

		var json = JSON.parse(foto);

		var profilePic = json.entry_data.ProfilePage[0].graphql.user.profile_pic_url_hd;
		var bio = json.entry_data.ProfilePage[0].graphql.user.biography;
		var name = json.entry_data.ProfilePage[0].graphql.user.full_name;
		var followers = json.entry_data.ProfilePage[0].graphql.user.edge_followed_by.count;
		var follows = json.entry_data.ProfilePage[0].graphql.user.edge_follow.count;
		var posts = json.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.count;

		if(bio=="") bio = "No bio";

		var res = {
			bio:bio,
			name:name,
			followers:followers,
			follows:follows,
			image:null,
			posts:posts
		}

		if(!json.entry_data.ProfilePage[0].graphql.user.is_private){
			var images = json.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges;

			if(images.length>0){
				var num=Math.floor(Math.random()*images.length);
				var image = images[num].node.display_url;
				res.image = image;
			}else{
				res.image = profilePic;
			}
		}else{
			res.image = profilePic;

			msg.channel.send("Este xixo é privado :wink:");
		}

		embed.createInstaEmbed(msg,res);
	});
}
