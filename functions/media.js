/* global client musicPlayers */

const ytdl = require("ytdl-core-discord");

const { updateMeta } = require("../utils/database");

async function music(msg) {
	const playMusic = async (musicPlayer, connection) => {
		const stream = await ytdl(musicPlayer.queue[0]);
		const streamOptions = { seek: 0, volume: 0.5, type: "opus" };
		musicPlayer.dispatcher = connection.play(stream, streamOptions);

		musicPlayer.dispatcher.on("finish", () => {
			musicPlayer.queue.shift();
			if (musicPlayer.queue.length) {
				playMusic(musicPlayer, connection);
			} else {
				connection.disconnect();
			}
		});
	};

	const params = msg.content.split(" ");
	const command = params[2].toLowerCase();

	if (!musicPlayers[msg.channel.guild.id]) musicPlayers[msg.channel.guild.id] = { queue: [] };

	const musicPlayer = musicPlayers[msg.channel.guild.id];

	if (command === "play") {
		const userVoiceState = msg.channel.guild.voiceStates.cache.get(msg.author.id);

		if (!userVoiceState) return "Vai para um canal de voz primeiro sua xixada!";

		musicPlayer.queue.push(params[3]);

		const userVoiceChannel = msg.channel.guild.channels.cache.get(userVoiceState.channelID);

		if (musicPlayer.userVoiceChannel !== userVoiceChannel || !musicPlayer.dispatcher) {
			musicPlayer.queue = [];
			musicPlayer.userVoiceChannel = userVoiceChannel;
			musicPlayer.connection = await musicPlayer.userVoiceChannel.join();

			playMusic(musicPlayer, musicPlayer.connection);
		}
	} else if (musicPlayer && command === "skip") {
		musicPlayer.dispatcher.end();
	} else if (musicPlayer && command === "pause") {
		musicPlayer.dispatcher.pause(true);
	} else if (musicPlayer && command === "resume") {
		musicPlayer.dispatcher.resume();
	} else if (musicPlayer && (command === "end" || command === "stop")) {
		musicPlayer.dispatcher.end();

		delete musicPlayers[msg.member.guild.id];
	}

	return null;
}

function play(msg) {
	const action = msg.content.split("play")[1];
	client.user.setActivity(action, { type: "PLAYING" });

	updateMeta({ action: { message: action, type: "PLAYING" } });
}

function watch(msg) {
	const action = msg.content.split("watch")[1];
	client.user.setActivity(action, { type: "WATCHING" });

	updateMeta({ action: { message: action, type: "WATCHING" } });
}

function listen(msg) {
	const action = msg.content.split("listen")[1];
	client.user.setActivity(action, { type: "LISTENING" });

	updateMeta({ action: { message: action, type: "LISTENING" } });
}

module.exports = {
	music,
	play,
	watch,
	listen,
};
