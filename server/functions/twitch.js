function getStream(msg) {
	const channel = msg.split("twitch ")[1];
	const url = `https://www.twitch.tv/${channel}`;

	return url;
}

module.exports = { getStream };
