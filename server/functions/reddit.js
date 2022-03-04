const { api } = require("../utils/request");

async function getRefreshToken() {
	/* eslint-disable-line no-unused-vars */
	const url =
		"https://www.reddit.com/api/v1/access_token?code=QFwvvqjN4yWyyQDFX_Hnpm5-aok&grant_type=authorization_code&redirect_uri=http://localhost:5000/lul";

	const encryptedAuth = new Buffer.from(`${process.env.redditClientId}:${process.env.redditSecret}`).toString(
		"base64",
	); /* eslint-disable-line no-undef */
	const auth = `Basic ${encryptedAuth}`;

	const headers = {
		"User-Agent": "RodrigoBot",
		Authorization: auth,
	};

	const res = await api({ method: "post", url, headers });
	const json = res.data;

	console.log(json);
}

async function getAccessToken() {
	const url = `https://www.reddit.com/api/v1/access_token?refresh_token=${process.env.redditRefreshToken}&grant_type=refresh_token`;

	const encryptedAuth = new Buffer.from(`${process.env.redditClientId}:${process.env.redditSecret}`).toString(
		"base64",
	); /* eslint-disable-line no-undef */
	const auth = `Basic ${encryptedAuth}`;

	const headers = {
		"User-Agent": "RodrigoBot",
		Authorization: auth,
	};

	const res = await api({ method: "post", url, headers });

	if (res.status === 400) return { status: 400, body: { message: "REDDIT_REFRESH_TOKEN" } };

	const json = res.data;

	return json.access_token;
}

function isFile(pathname) {
	return pathname.split("/").pop().lastIndexOf(".") > -1;
}

function formatResponse(json) {
	const num = Math.floor(Math.random() * json.data.children.length);

	let image = "";
	if (json.data.children[num].data.thumbnail === "self" || json.data.children[num].data.thumbnail === "default") {
		image = "";
	} else {
		image = json.data.children[num].data.thumbnail;
	}

	let content = "";
	let contentImage = "";
	let contentVideo = "";
	const url = json.data.children[num].data.url;
	const imgTypes = ["jpg", "jpeg", "png", "gif"];
	if (url.indexOf("reddit.com") !== -1) {
		if (json.data.children[num].data.selftext.length < 1024) {
			content = json.data.children[num].data.selftext;
		} else {
			content = "Click link to view";
		}
	} else if (url.includes(".gifv") || url.includes("youtu")) {
		contentVideo = url;
	} else if (url.includes("imgur.com") !== -1) {
		if (isFile(url)) {
			contentImage = url;
		} else {
			contentVideo = url;
		}
	} else if (url.includes("gfycat.com")) {
		contentVideo = url;
	} else if (imgTypes.includes(url.substr(url.lastIndexOf(".") + 1)) !== -1) {
		contentImage = url;
	}

	const res = {
		id: json.data.children[num].data.id,
		after: json.data.after,
		content,
		contentImage,
		contentVideo,
		created: json.data.children[num].data.created,
		image,
		score: json.data.children[num].data.score,
		comments: json.data.children[num].data.num_comments,
		subreddit: json.data.children[num].data.subreddit,
		title: json.data.children[num].data.title,
		url,
		permalink: `https://reddit.com${json.data.children[num].data.permalink}`,
	};

	return res;
}

async function getPost(options, retries = 0) {
	const { subreddit } = options;

	const accessToken = await getAccessToken();

	const res = await api({
		url: `https://oauth.reddit.com/r/${subreddit}?limit=100&sort=hot`,
		headers: {
			"User-Agent": "Entertainment-Hub by dedeco99",
			Authorization: `bearer ${accessToken}`,
		},
	});

	const json = res.data;

	if (res.status === 403) return { status: 403, body: { message: "REDDIT_FORBIDDEN" } };
	if (res.status === 404 || !json.data.children.length) {
		return { status: 404, body: { message: "REDDIT_NOT_FOUND" } };
	}

	const response = formatResponse(json);

	if (retries < 5 && global.cache.reddit.posts.includes(response.id)) {
		retries++;
		return getPost(options, retries);
	}

	global.cache.reddit.posts.push(response.id);
	if (global.cache.reddit.posts.length > 10) global.cache.reddit.posts.shift();

	return { status: 200, body: { message: "REDDIT_SUCCESS", data: response } };
}

module.exports = { getPost };
