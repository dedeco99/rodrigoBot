const discord = require("discord.js");
const { AudioPlayerStatus, entersState, joinVoiceChannel, VoiceConnectionStatus } = require("@discordjs/voice");
const rodrigo = require("rodrigo");

const secrets = require("./utils/secrets");
const database = require("./utils/database");
const embed = require("./utils/embed");

const utils = require("./functions/utils");
const memes = require("./functions/memes");
const media = require("./functions/media");
const tts = require("./functions/tts");
const custom = require("./functions/custom");
const birthday = require("./functions/birthdays");
const cronjob = require("./functions/cronjobs");
const system = require("./functions/system");
const { Track } = require("./functions/music/track");
const { MusicSubscription } = require("./functions/music/subscription");

const Meta = require("./models/meta");
const CustomCommand = require("./models/customCommand");

const embeds = {
	define: embed.createDefineEmbed,
	search: embed.createSearchEmbed,
	weather: embed.createWeatherEmbed,
	radar: embed.createRadarEmbed,
	corona: embed.createCoronaEmbed,
	reddit: embed.createRedditEmbed,
	insta: embed.createInstaEmbed,
	crypto: embed.createCryptoEmbed,
	vote: embed.createPollEmbed,
	keyboardGroupBuys: embed.createKeyboardEmbed,
	stockTracker: embed.createStockEmbed,
};

const discordFeatures = [
	// Utils
	{ command: "remindme", func: utils.remindMe },
	{ command: "vote", func: utils.vote },
	{ command: "keyboardGroupBuys", func: utils.keyboardGroupBuys },
	{ command: "stockTracker", func: utils.stockTracker },

	// Meme Creation
	{ command: "meme", func: memes.checkForMemes },

	// Media
	{ command: "music", func: media.music },
	{ command: "play", func: media.play },
	{ command: "watch", func: media.watch },
	{ command: "listen", func: media.listen },

	// TTS
	{ command: "tts", func: tts.speak },

	// Custom
	{ command: "custom", func: custom.checkForCommand },
	{ command: "birthday", func: birthday.checkForBirthday },
	{ command: "cronjob", func: cronjob.checkForCronjob },

	// System
	{ command: ["delete", "apaga"], func: system.deleteLastMsg },
	{ command: ["good", "nice", "best", "bom", "bem", "grande"], includes: true, func: system.compliment },
	{ command: ["bad", "worst", "autistic", "mau", "mal", "lixo", "autista"], includes: true, func: system.insult },
];

const commands = [
	{
		name: "play",
		description: "Plays a song",
		options: [
			{
				name: "song",
				type: "STRING",
				description: "The URL of the song to play",
				required: true,
			},
		],
	},
	{
		name: "skip",
		description: "Skip to the next song in the queue",
	},
	{
		name: "queue",
		description: "See the music queue",
	},
	{
		name: "pause",
		description: "Pauses the song that is currently playing",
	},
	{
		name: "resume",
		description: "Resume playback of the current song",
	},
	{
		name: "leave",
		description: "Leave the voice channel",
	},
];

// eslint-disable-next-line complexity
async function handleMessage(msg, room) {
	if (msg.content.toLowerCase() === "!deploy") {
		await msg.guild.commands.set(commands);

		await msg.reply("Deployed!");
	}

	if (msg.author && msg.author.username === "RodrigoBot") {
		global.lastMsgs.push(msg);
		if (global.lastMsgs.length > 10) global.lastMsgs.shift();

		return null;
	}

	let customCommands = room ? [] : await CustomCommand.find({ guild: msg.guild.id });

	customCommands = customCommands.map(customCommand => ({
		command: customCommand.word,
		func: () => customCommand.message,
	}));

	customCommands = customCommands.concat(
		discordFeatures.map(feat => ({ command: feat.command, includes: feat.includes, func: () => null })),
	);

	let response = await rodrigo.handleMessage(msg.content, customCommands);

	if (!response || !response.command) return null;

	const discordFeature = discordFeatures.find(
		feat => (Array.isArray(feat.command) ? feat.command[0] : feat.command) === response.command,
	);

	if (discordFeature) {
		response = { command: discordFeature.command, message: await discordFeature.func(msg) };
	}

	if (!response.message) return null;

	if (embeds[response.command] && typeof response.message !== "string") {
		response.message = embeds[response.command](response.message);
	}

	const messages = Array.isArray(response.message) ? response.message : [response.message];

	for (const message of messages) {
		if (message) {
			if (room) {
				global.client.channels.cache.get(room).send(message);
			} else {
				msg.channel.send(message);
			}
		}
	}

	return null;
}

/**
 * Maps guild IDs to music subscriptions, which exist if the bot has an active VoiceConnection to the guild.
 */
const subscriptions = new Map();

// eslint-disable-next-line complexity,max-lines-per-function
async function handleInteraction(interaction) {
	if (!interaction.isCommand() || !interaction.guildId) return;
	let subscription = subscriptions.get(interaction.guildId);

	if (interaction.commandName === "play") {
		await interaction.defer();
		// Extract the video URL from the command
		const url = interaction.options.get("song").value;

		// If a connection to the guild doesn't already exist and the user is in a voice channel, join that channel and create a subscription.
		if (!subscription) {
			if (interaction.member instanceof discord.GuildMember && interaction.member.voice.channel) {
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

		// If there is no subscription, tell the user they need to join a channel.
		if (!subscription) {
			await interaction.reply("Join a voice channel and then try that again!");
			return;
		}

		// Make sure the connection is ready before processing the user's request
		try {
			await entersState(subscription.voiceConnection, VoiceConnectionStatus.Ready, 20e3);
		} catch (error) {
			console.warn("teste", error);
			await interaction.followUp("Failed to join voice channel within 20 seconds, please try again later!");
			return;
		}

		try {
			// Attempt to create a Track from the user's video URL
			const track = await Track.from(url, {
				onStart() {
					interaction.followUp({ content: "Now playing!", ephemeral: true }).catch(console.warn);
				},
				onFinish() {
					interaction.followUp({ content: "Now finished!", ephemeral: true }).catch(console.warn);
				},
				onError(error) {
					console.warn(error);
					interaction.followUp({ content: `Error: ${error.message}`, ephemeral: true }).catch(console.warn);
				},
			});
			// Enqueue the track and reply a success message to the user
			subscription.enqueue(track);
			await interaction.reply(`Enqueued **${track.title}**`);
		} catch (error) {
			console.warn(error);
			await interaction.reply("Failed to play track, please try again later!");
		}
	} else if (interaction.commandName === "skip") {
		if (subscription) {
			subscription.audioPlayer.stop();
			await interaction.reply("Skipped song!");
		} else {
			await interaction.reply("Not playing in this server!");
		}
	} else if (interaction.commandName === "queue") {
		// Print out the current queue, including up to the next 5 tracks to be played.
		if (subscription) {
			const current =
				subscription.audioPlayer.state.status === AudioPlayerStatus.Idle
					? "Nothing is currently playing!"
					: `Playing **${subscription.audioPlayer.state.resource.metadata.title}**`;

			const queue = subscription.queue
				.slice(0, 5)
				.map((track, index) => `${index + 1}) ${track.title}`)
				.join("\n");

			await interaction.reply(`${current}\n\n${queue}`);
		} else {
			await interaction.reply("Not playing in this server!");
		}
	} else if (interaction.commandName === "pause") {
		if (subscription) {
			subscription.audioPlayer.pause();
			await interaction.reply({ content: "Paused!", ephemeral: true });
		} else {
			await interaction.reply("Not playing in this server!");
		}
	} else if (interaction.commandName === "resume") {
		if (subscription) {
			subscription.audioPlayer.unpause();
			await interaction.reply({ content: "Unpaused!", ephemeral: true });
		} else {
			await interaction.reply("Not playing in this server!");
		}
	} else if (interaction.commandName === "leave") {
		if (subscription) {
			subscription.voiceConnection.destroy();
			subscriptions.delete(interaction.guildId);
			await interaction.reply({ content: "Left channel!", ephemeral: true });
		} else {
			await interaction.reply("Not playing in this server!");
		}
	} else {
		await interaction.reply("Unknown command");
	}
}

async function run() {
	const intents = new discord.Intents([
		"GUILDS",
		"GUILD_MESSAGES",
		"GUILD_MESSAGE_REACTIONS",
		"GUILD_VOICE_STATES",
	]);

	global.client = new discord.Client({ intents });
	global.lastMsgs = [];
	global.musicPlayers = {};
	global.redditPosts = [];

	global.client.login(secrets.discordKey);

	database.initialize();

	const meta = await Meta.findOne();

	global.client.on("ready", () => {
		console.log(`Logged in as ${global.client.user.tag}!`);
		global.client.user.setActivity(meta.action.message, { type: meta.action.type });
	});

	global.client.on("messageCreate", handleMessage);

	global.client.on("interactionCreate", handleInteraction);

	global.client.on("messageReactionAdd", reaction => {
		if (reaction.message.channel.guild.id === "651025812312555551") {
			if (reaction._emoji.name === "📌" || reaction._emoji.name === "📍") {
				utils.pin(reaction.message, true);
			}
		}
	});

	await cronjob.runCronjobs(handleMessage);
}

run();
