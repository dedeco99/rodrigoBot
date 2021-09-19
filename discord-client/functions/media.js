const { GuildMember } = require("discord.js");
const { AudioPlayerStatus, entersState, joinVoiceChannel, VoiceConnectionStatus } = require("@discordjs/voice");

const { Track } = require("./music/track");
const { MusicSubscription } = require("./music/subscription");

const { updateMeta } = require("../utils/database");

const subscriptions = new Map();

// eslint-disable-next-line max-lines-per-function
async function music(interaction) {
	let subscription = subscriptions.get(interaction.guildId);

	if (interaction.commandName === "play") {
		await interaction.defer();

		const url = interaction.options.get("song").value;

		if (!subscription) {
			if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
				const channel = interaction.member.voice.channel;
				subscription = new MusicSubscription(
					joinVoiceChannel({
						channelId: channel.id,
						guildId: channel.guild.id,
						adapterCreator: channel.guild.voiceAdapterCreator,
					}),
				);
				subscription.voiceConnection.on("error", console.warn);
				subscriptions.set(interaction.guildId, subscription);
			}
		}

		if (!subscription) {
			await interaction.reply("Join a voice channel and then try that again!");
			return;
		}

		try {
			await entersState(subscription.voiceConnection, VoiceConnectionStatus.Ready, 20e3);
		} catch (error) {
			console.warn("teste", error);
			await interaction.followUp("Failed to join voice channel within 20 seconds, please try again later!");
			return;
		}

		try {
			const track = await Track.from(url, {
				onStart() {
					interaction.followUp("Now playing!").catch(console.warn);
				},
				onFinish() {
					// interaction.followUp("Now finished!").catch(console.warn);
				},
				onError(error) {
					console.warn(error);
					// interaction.followUp({ content: `Error: ${error.message}`, ephemeral: true }).catch(console.warn);
				},
			});

			subscription.enqueue(track);

			await interaction.reply(`Added **${track.title}** to the queue`);
		} catch (error) {
			console.warn(error);

			await interaction.reply("Failed to play track, please try again later!");
		}

		return;
	}

	if (!subscription) {
		await interaction.reply("Not playing in this server!");
		return;
	}

	if (interaction.commandName === "skip") {
		subscription.audioPlayer.stop();

		await interaction.reply("Skipped song!");
	} else if (interaction.commandName === "queue") {
		const current =
			subscription.audioPlayer.state.status === AudioPlayerStatus.Idle
				? "Nothing is currently playing!"
				: `Playing **${subscription.audioPlayer.state.resource.metadata.title}**`;

		const queue = subscription.queue
			.slice(0, 5)
			.map((track, index) => `${index + 1}) ${track.title}`)
			.join("\n");

		await interaction.reply(`${current}\n\n${queue}`);
	} else if (interaction.commandName === "pause") {
		subscription.audioPlayer.pause();

		await interaction.reply({ content: "Paused!", ephemeral: true });
	} else if (interaction.commandName === "resume") {
		subscription.audioPlayer.unpause();

		await interaction.reply({ content: "Unpaused!", ephemeral: true });
	} else if (interaction.commandName === "leave") {
		subscription.voiceConnection.destroy();

		subscriptions.delete(interaction.guildId);

		await interaction.reply({ content: "Left channel!", ephemeral: true });
	} else {
		await interaction.reply("Unknown command");
	}
}

function play(msg) {
	const action = msg.content.split("play")[1];
	global.client.user.setActivity(action, { type: "PLAYING" });

	updateMeta({ action: { message: action, type: "PLAYING" } });
}

function watch(msg) {
	const action = msg.content.split("watch")[1];
	global.client.user.setActivity(action, { type: "WATCHING" });

	updateMeta({ action: { message: action, type: "WATCHING" } });
}

function listen(msg) {
	const action = msg.content.split("listen")[1];
	global.client.user.setActivity(action, { type: "LISTENING" });

	updateMeta({ action: { message: action, type: "LISTENING" } });
}

module.exports = {
	music,
	play,
	watch,
	listen,
};
