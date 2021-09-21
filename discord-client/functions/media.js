const { GuildMember } = require("discord.js");
const { AudioPlayerStatus, entersState, joinVoiceChannel, VoiceConnectionStatus } = require("@discordjs/voice");
const { getVideoSearch } = require("rodrigo");

const { Track } = require("./music/track");
const { MusicSubscription } = require("./music/subscription");

const subscriptions = new Map();

// eslint-disable-next-line max-lines-per-function,complexity
async function music(interaction) {
	let subscription = subscriptions.get(interaction.guildId);

	if (interaction.commandName === "play") {
		const song = interaction.options.get("song").value;

		const url =
			song.includes("https://www.youtube.com") || song.includes("https://youtu.be")
				? song
				: await getVideoSearch(interaction.options.get("song").value);

		if (!subscription && interaction.member instanceof GuildMember && interaction.member.voice.channel) {
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

		if (!subscription) {
			await interaction.followUp("Join a voice channel and then try that again");
			return;
		}

		try {
			await entersState(subscription.voiceConnection, VoiceConnectionStatus.Ready, 20e3);
		} catch (error) {
			console.warn(error);

			await interaction.followUp("Failed to join voice channel within 20 seconds gg");

			return;
		}

		try {
			const track = await Track.from(url, {
				async onStart() {
					await interaction.followUp(":notes: Playing :arrow_up_small:");
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

			await interaction.followUp(`Added **${track.title}** to the queue`);
		} catch (error) {
			console.warn(error);

			await interaction.followUp("Failed to play track. Please leave google");
		}

		return;
	}

	if (!subscription) {
		await interaction.followUp("Not playing in this server");
		return;
	}

	if (interaction.commandName === "skip") {
		subscription.audioPlayer.stop();

		await interaction.followUp("Get skipped lmao");
	} else if (interaction.commandName === "queue") {
		const current =
			subscription.audioPlayer.state.status === AudioPlayerStatus.Idle
				? "Nothing is currently playing!"
				: `Playing **${subscription.audioPlayer.state.resource.metadata.title}**`;

		const queue = subscription.queue
			.slice(0, 5)
			.map((track, index) => `${index + 1}) ${track.title}`)
			.join("\n");

		await interaction.followUp(`${current}\n\n${queue}`);
	} else if (interaction.commandName === "pause") {
		subscription.audioPlayer.pause();

		await interaction.followUp(":pause_button: Paused!");
	} else if (interaction.commandName === "resume") {
		subscription.audioPlayer.unpause();

		await interaction.followUp(":arrow_forward: Unpaused!");
	} else if (interaction.commandName === "stop") {
		subscription.voiceConnection.destroy();

		subscriptions.delete(interaction.guildId);

		await interaction.followUp("Left channel :wave:");
	} else {
		await interaction.followUp("Unknown command");
	}
}

module.exports = {
	music,
};
