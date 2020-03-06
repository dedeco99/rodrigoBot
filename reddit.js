const errors = require("./errors");
const { get, post } = require("./request");
const secrets = require("./secrets");
const embed = require("./embed");

const Subreddit = require("./models/subreddit");

function isFile(pathname) {
	return pathname.split("/").pop()
		.lastIndexOf(".") > -1;
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
		after: json.data.after,
		content,
		contentImage,
		contentVideo,
		created: json.data.children[num].data.created,
		image,
		score: json.data.children[num].data.score,
		subreddit: json.data.children[num].data.subreddit,
		title: json.data.children[num].data.title,
		url,
	};

	return res;
}

async function getRedditPosts(data, accessToken) {
	const url = `https://oauth.reddit.com/r/${data.subreddit}?limit=100&sort=hot`;
	const headers = {
		"User-Agent": "Entertainment-Hub by dedeco99",
		"Authorization": `bearer ${accessToken}`,
	};

	const res = await get(url, headers);

	if (res.status === 403) throw errors.redditForbidden;
	if (res.status === 404) throw errors.redditNotFound;

	const json = res.data;
	const response = formatResponse(json);

	if (response.title.toLowerCase().includes(/cock|dick|penis/g)) {
		getRedditPosts(data, accessToken);
		return "Este post tinha ganda penis, vou buscar outro";
	}

	return embed.createRedditEmbed(response);
}

async function getAccessToken(data) {
	const url = `https://www.reddit.com/api/v1/access_token?refresh_token=${secrets.redditRefreshToken}&grant_type=refresh_token`;

	const encryptedAuth = new Buffer.from(`${secrets.redditClientId}:${secrets.redditSecret}`).toString("base64"); /* eslint-disable-line no-undef */
	const auth = `Basic ${encryptedAuth}`;

	const headers = {
		"User-Agent": "RodrigoBot",
		"Authorization": auth,
	};

	const res = await post(url, null, headers);

	if (res.status === 400) throw errors.redditRefreshToken;

	const json = res.data;

	const response = await getRedditPosts(data, json.access_token);

	return response;
}

async function getRefreshToken() { /* eslint-disable-line no-unused-vars */
	const url = "https://www.reddit.com/api/v1/access_token?code=QFwvvqjN4yWyyQDFX_Hnpm5-aok&grant_type=authorization_code&redirect_uri=http://localhost:5000/lul";

	const encryptedAuth = new Buffer.from(`${secrets.redditClientId}:${secrets.redditSecret}`).toString("base64"); /* eslint-disable-line no-undef */
	const auth = `Basic ${encryptedAuth}`;

	const headers = {
		"User-Agent": "RodrigoBot",
		"Authorization": auth,
	};

	const res = await post(url, null, headers);
	const json = res.data;

	console.log(json);
}

async function checkForReddit(msg) {
	// await getRefreshToken();

	const subs = await Subreddit.find({}).lean();

	const searchedSub = msg.content.split(" ")[2];
	const sub = subs.find(s => s.name === searchedSub);

	try {
		return await getAccessToken({ subreddit: sub ? sub.name : searchedSub });
	} catch (err) {
		return err.message;
	}
}

module.exports = {
	checkForReddit,
};
