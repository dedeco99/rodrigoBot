const request = require("request");

const secrets = require("./secrets");
const log = require("./log");
const embed = require("./embed");

const isFile = (pathname) => {
	return pathname.split("/").pop()
		.lastIndexOf(".") > -1;
};

const formatResponse = (json) => {
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
		url
	};

	return res;
};

const getRedditPosts = (data, accessToken, callback) => {
	const url = `https://oauth.reddit.com/r/${data.subreddit}?limit=100&sort=hot`;
	const headers = {
		"User-Agent": "Entertainment-Hub by dedeco99",
		"Authorization": `bearer ${accessToken}`
	};

	request({ url, headers }, (error, response, html) => {
		if (error) return log.error(error.stack);

		try {
			const json = JSON.parse(html);
			const res = formatResponse(json);

			return callback(embed.createRedditEmbed(res));
		} catch (err) {
			return callback("Esse subreddit deve estar no xixo porque não o encontro");
		}
	});
};

const getAccessToken = (data, callback) => {
	const url = `https://www.reddit.com/api/v1/access_token
		?refresh_token=${secrets.redditRefreshToken}&grant_type=refresh_token`.replace(/\t/g, "").replace(/\n/g, "");

	const encryptedAuth = new Buffer.from(`${secrets.redditClientId}:${secrets.redditSecret}`).toString("base64"); /* eslint-disable-line no-undef */
	const auth = `Basic ${encryptedAuth}`;

	const headers = {
		"User-Agent": "RodrigoBot",
		"Authorization": auth
	};

	request.post({ url, headers }, (error, response, html) => {
		if (error) return log.error(error.stack);
		const json = JSON.parse(html);

		getRedditPosts(data, json.access_token, (res) => {
			return callback(res);
		});
	});
};

const getRefreshToken = () => { /* eslint-disable-line no-unused-vars */
	const url = `https://www.reddit.com/api/v1/access_token
		?code=EnnCAq3ndBzr0QYjBNCRgRxnzvg&grant_type=authorization_code&redirect_uri=http://localhost:5000/lul`.replace(/\t/g, "").replace(/\n/g, "");

	const encryptedAuth = new Buffer.from(`${secrets.redditClientId}:${secrets.redditSecret}`).toString("base64"); /* eslint-disable-line no-undef */
	const auth = `Basic ${encryptedAuth}`;

	const headers = {
		"User-Agent": "RodrigoBot",
		"Authorization": auth
	};

	request.post({ url, headers }, (error, response, html) => {
		if (error) return log.error(error.stack);
		const json = JSON.parse(html);
		console.log(json);
	});
};

exports.checkForReddit = (msg, callback) => {
	//getRefreshToken();

	//TODO: get subreddits from database
	/* eslint-disable max-len */
	const subs = [
		{ name: "piada", subreddit: "jokes" },
		{ name: "gif", subreddit: "gif" },
		{ name: "video", subreddit: "videos" },
		{ name: "meme", subreddit: "2meirl4meirl+boottoobig+dankmemes+greentext+insanepeoplefacebook+oldpeoplefacebook+memes+meme+imgoingtohellforthis+prequelmemes" },
		{ name: "pornstar", subreddit: "AvaAddams+Ava_Addams+RileyReid+Riley_Reid+RemyLaCroix+Remy_Lacroix+JadaStevens+BrandiLove+Melissamoore" },
		{ name: "porn", subreddit: "pornvids+porninfifteenseconds+nsfwhardcore+lesbians+grool+quiver+porn_gifs" },
		{ name: "tits", subreddit: "tessafowler+SexyFlowerWater+gonewild+NSFW_GIF+nsfw+BustyPetite+milf+OnOff+TittyDrop+LegalTeens+suicidegirls+boobbounce" },
		{ name: "pussy", subreddit: "ass+pawg+gettingherselfoff+asstastic+thick+GodPussy+BonerAlert+StraightGirlsPlaying+workgonewild+rearpussy+gwcumsluts+pussy+facedownassup+cumonclothes+jilling" },
		{ name: "soft", subreddit: "collegesluts+girlsinyogapants+FestivalSluts+tightdresses+randomsexiness+burstingout" }
	];

	const searchedSub = msg.content.split(" ")[2];
	const sub = subs.find(sub => sub.name === searchedSub);

	getAccessToken({ subreddit: sub ? sub.subreddit : searchedSub }, (res) => {
		return callback(res);
	});
};
