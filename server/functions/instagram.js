const { api } = require("../utils/request");

function scrap(data) {
	const dirtyJSON = JSON.parse(data.match(/window\._sharedData\s?=\s?(?<a>{.+);<\/script>/)[1]);

	if (!dirtyJSON.entry_data.ProfilePage) return null;

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

	return { user, medias };
}

async function getPost(options) {
	const { handle, number } = options;
	const num = number ? number : 0;

	const url = `https://www.instagram.com/${handle}/`;

	try {
		const res = await api({ method: "get", url });

		const json = scrap(res.data);

		if (!json) return { status: 500, body: { message: "INSTAGRAM_DOWN" } };

		const user = {
			isPrivate: json.user.is_private,
			bio: json.user.biography ? json.user.biography : "",
			followers: json.user.edge_followed_by.count,
			follows: json.user.edge_follow.count,
			image: null,
			name: json.user.full_name,
			posts: json.user.edge_owner_to_timeline_media.count,
			profilePic: json.user.profile_pic_url_hd,
			url,
		};

		const images = json.medias;

		if (images.length > 0) {
			let finalNum = num;
			if (finalNum === "random") {
				finalNum = Math.floor(Math.random() * images.length);
			} else if (isNaN(num) || num > images.length || num < 0) {
				finalNum = 0;
			}

			const image = images[finalNum].displayUrl;
			user.image = image;
		} else {
			user.image = null;
		}

		return { status: 200, body: { message: "INSTAGRAM_SUCCESS", data: user } };
	} catch (err) {
		return { status: 404, body: { message: "INSTAGRAM_NOT_FOUND" } };
	}
}

module.exports = {
	getPost,
};
