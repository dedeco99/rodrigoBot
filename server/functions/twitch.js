function getStream(options) {
	const channel = options.channel;

	const url = `https://www.twitch.tv/${channel}`;

	return url;
}

module.exports = { getStream };
