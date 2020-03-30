/* global client musicPlayers */

const { getVoiceStream } = require("discord-tts");

async function speak(msg) {
	if (msg.content.length > 200) return "Isso é muito texto";

	const userVoiceState = msg.channel.guild.voiceStates.cache.get(msg.author.id);
	if (!userVoiceState) return "Vai para um canal de voz primeiro sua xixada!";

	if (musicPlayers[msg.channel.guild.id]) return "Está a tocar música palhaço";

	const paramsArray = msg.content.split(" ");
	const text = paramsArray.splice(2, paramsArray.length - 1).join(" ");

	const channel = client.channels.cache.get(userVoiceState.channelID);

	const connection = await channel.join();

	const dispatcher = connection.play(getVoiceStream(text, "en-GB"));

	dispatcher.on("finish", () => connection.disconnect());

	return null;
}

module.exports = {
	speak,
};
