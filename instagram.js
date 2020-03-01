const instagram = require("instagram-scraping");

const { get } = require("./request");
const embed = require("./embed");

function formatResponse(url, num, json) {
	const profilePic = json.user.profile_pic_url_hd;
	let bio = json.user.biography;
	const name = json.user.full_name;
	const followers = json.user.edge_followed_by.count;
	const follows = json.user.edge_follow.count;
	const posts = json.user.edge_owner_to_timeline_media.count;

	if (bio === "") bio = "No bio";

	const res = {
		bio,
		error: null,
		followers,
		follows,
		image: null,
		name,
		posts,
		profilePic,
		url,
	};

	if (json.user.is_private) {
		res.error = "Este xixo é privado :wink:";
	} else {
		const images = json.medias;
		console.log(images.length);

		if (images.length > 0) {
			let finalNum = num;
			if (finalNum === "random") {
				finalNum = Math.floor(Math.random() * images.length);
			} else if (isNaN(num) || num > images.length || num < 0) {
				finalNum = 0;
			}

			const image = images[finalNum].display_url;
			res.image = image;
		} else {
			res.error = "Este perfil não tem fotos";
		}
	}

	return res;
}

async function getPost(msg) {
	const person = msg.content.split(" ")[2];
	const num = msg.content.split(" ").pop();
	const url = `https://www.instagram.com/${person}/`;

	try {
		const json = await instagram.scrapeUserPage(person);

		const res = formatResponse(url, num, json);

		return embed.createInstaEmbed(res);
	} catch (err) {
		console.log(err);
		return "Claramente esse xixo não existe";
	}
}

/*
async function getPost(msg) {
	const person = msg.content.split(" ")[2];
	const num = msg.content.split(" ").pop();
	const url = `https://www.instagram.com/${person}/`;

	const res = await get(url);
	let foto = res.data.substring(
		res.lastIndexOf("window._sharedData = ") + 21,
		res.lastIndexOf("</script>"),
	);

	foto = foto.substring(0, foto.indexOf("</script>") - 1);

	const json = JSON.parse(foto);

	if (json.entry_data.ProfilePage) {
		const res = formatResponse(url, num, json.entry_data.ProfilePage[0]);

		return embed.createInstaEmbed(res);
	}

	return "Claramente esse xixo não existe";
}
*/

module.exports = {
	getPost,
};
