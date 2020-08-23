const { get } = require("../utils/request");

function scrap(data) {
	const dirtyJSON = JSON.parse(data.match(/window\._sharedData\s?=\s?(?<a>{.+);<\/script>/)[1]);

	const user = dirtyJSON.entry_data.ProfilePage[0].graphql.user;
	const medias = user.edge_owner_to_timeline_media.edges.map(post => {
		return {
			mediaId: post.node.id,
			shortcode: post.node.shortcode,
			text: post.node.edge_media_to_caption.edges[0].node.text || "",
			commentCount: post.node.edge_media_to_comment.count,
			likeCount: post.node.edge_liked_by.count,
			displayUrl: post.node.display_url,
			ownerId: post.node.owner.id,
			date: post.node.taken_at_timestamp,
			thumbnail: post.node.thumbnail_src,
			thumbnailResource: post.node.thumbnail_resources,
			isVideo: post.node.is_video,
		};
	});

	const json = {
		user,
		medias,
	};

	return json;
}

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

		if (images.length > 0) {
			let finalNum = num;
			if (finalNum === "random") {
				finalNum = Math.floor(Math.random() * images.length);
			} else if (isNaN(num) || num > images.length || num < 0) {
				finalNum = 0;
			}

			const image = images[finalNum].displayUrl;
			res.image = image;
		} else {
			res.error = "Este perfil não tem fotos";
		}
	}

	return res;
}

async function getPost(msg) {
	const person = msg.split(" ")[2];
	const num = msg.split(" ").pop();
	const url = `https://www.instagram.com/${person}/`;

	try {
		const res = await get(url);

		const json = scrap(res.data);
		const post = formatResponse(url, num, json);

		return post;
	} catch (err) {
		console.log(err);
		return "Claramente esse xixo não existe";
	}
}

module.exports = {
	getPost,
};
