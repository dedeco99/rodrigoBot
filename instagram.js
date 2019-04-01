var request = require("request");
var embed = require("./embed");

exports.getPost = (msg, callback) => {
	var sentence = msg.content.split("insta ")[1];
	var person = sentence.split(" ")[0];
	var num = sentence.split(" ").pop();
	var url = "https://www.instagram.com/" + person + "/";

	request(url, (error, response, html) => {
		var foto = html.substring(
			html.lastIndexOf("window._sharedData = ") + 21,
			html.lastIndexOf("</script>")
		);

		foto = foto.substring(0, foto.indexOf("</script>")-1);

		var json = JSON.parse(foto);

		if(json.entry_data.ProfilePage){
			var profilePic = json.entry_data.ProfilePage[0].graphql.user.profile_pic_url_hd;
			var bio = json.entry_data.ProfilePage[0].graphql.user.biography;
			var name = json.entry_data.ProfilePage[0].graphql.user.full_name;
			var followers = json.entry_data.ProfilePage[0].graphql.user.edge_followed_by.count;
			var follows = json.entry_data.ProfilePage[0].graphql.user.edge_follow.count;
			var posts = json.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.count;

			if(bio === "") bio = "No bio";

			var res = {
				url,
				profilePic,
				bio,
				name,
				followers,
				follows,
				image:null,
				error:null,
				posts
			};

			if(!json.entry_data.ProfilePage[0].graphql.user.is_private){
				var images = json.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges;

				if(images.length > 0){
					if(isNaN(num) || num > images.length || num < 0){
						num = Math.floor(Math.random() * images.length);
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
};
