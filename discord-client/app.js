const { Intents, Client } = require("discord.js");
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
	// Utils
	{
		name: "define",
		description: "Returns the urban definition of a word",
		options: [
			{
				name: "word",
				type: "STRING",
				description: "The word you want to define",
				required: true,
			},
		],
	},
	{
		name: "search",
		description: "Returns the first results of a google search",
		options: [
			{
				name: "topic",
				type: "STRING",
				description: "The topic you want to search",
				required: true,
			},
		],
	},
	{
		name: "sort",
		description: "Randomly sorts the values provided",
		options: [
			{
				name: "values",
				type: "STRING",
				description: "The values you want to randomly sort separated by ;",
				required: true,
			},
		],
	},
	{
		name: "convert",
		description: "Converts one currency to another",
		options: [
			{
				name: "number",
				type: "NUMBER",
				description: "The number you want to convert",
				required: true,
			},
			{
				name: "from",
				type: "STRING",
				description: "The currency you want to convert",
				required: true,
			},
			{
				name: "to",
				type: "STRING",
				description: "The currency you want to convert to",
				required: true,
			},
		],
	},
	{
		name: "math",
		description: "Returns the result for the provided mathematical expression",
		options: [
			{
				name: "expression",
				type: "STRING",
				description: "The expression you want to resolve",
				required: true,
			},
		],
	},
	{
		name: "crypto",
		description: "Returns information about a coin",
		options: [
			{
				name: "coin",
				type: "STRING",
				description: "The name or symbol of a coin",
				required: true,
			},
		],
	},
	{
		name: "weather",
		description: "Returns the weather for a specified location",
		options: [
			{
				name: "location",
				type: "STRING",
				description: "The location you want the weather from",
				required: true,
			},
		],
	},
	{
		name: "radar",
		description: "Returns radars for a specified location",
		options: [
			{
				name: "location",
				type: "STRING",
				description: "The location you want the radars from",
				required: true,
			},
		],
	},
	{
		name: "corona",
		description: "Returns information about corona",
		options: [
			{
				name: "country",
				type: "STRING",
				description: "The country you want the information from",
				required: true,
			},
		],
	},
	// Social Media
	{
		name: "reddit",
		description: "Returns a random post from the specified subreddit",
		options: [
			{
				name: "subreddit",
				type: "STRING",
				description: "The subreddit you want a post from",
				required: true,
			},
		],
	},
	{
		name: "youtube",
		description: "Returns the latest video from the specified channel",
		options: [
			{
				name: "channel",
				type: "STRING",
				description: "The channel you want a video from",
				required: true,
			},
		],
	},
	{
		name: "twitch",
		description: "Returns the stream from the specified channel",
		options: [
			{
				name: "channel",
				type: "STRING",
				description: "The channel you want the stream from",
				required: true,
			},
		],
	},
	{
		name: "insta",
		description: "Returns a post from the specified user",
		options: [
			{
				name: "user",
				type: "STRING",
				description: "The user you want the post from",
				required: true,
			},
			{
				name: "number",
				type: "NUMBER",
				description: "The number of the post (the latest one is 0)",
			},
		],
	},
	// Music
	{
		name: "play",
		description: "Plays a song",
		options: [
			{
				name: "song",
				type: "STRING",
				description: "The name/URL of the song to play",
				required: true,
			},
		],
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
		name: "skip",
		description: "Skip to the next song in the queue",
	},
	{
		name: "queue",
		description: "See the music queue",
	},
	{
		name: "stop",
		description: "Leave the voice channel",
	},
];

// eslint-disable-next-line complexity
async function handleMessage(msg, room) {
	if (msg.content.toLowerCase() === "rodrigo commands") {
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

async function handleInteraction(interaction) {
	if (!interaction.isCommand() || !interaction.guildId) return;

	await interaction.deferReply();

	if (["play", "pause", "resume", "skip", "queue", "stop"].includes(interaction.commandName)) {
		await media.music(interaction);
		return;
	}

	const command = commands.find(c => c.name === interaction.commandName);

	const options = {};
	for (const option of command.options.map(o => o.name)) {
		options[option] = interaction.options.get(option) ? interaction.options.get(option).value : null;
	}

	const response = await rodrigo.handleCommand(interaction.commandName, options);

	if (!response || !response.command) {
		await interaction.followUp("Either you or I did something wrong");
		return;
	}

	if (embeds[response.command] && typeof response.message !== "string") {
		response.message = embeds[response.command](response.message);
	}

	const messages = Array.isArray(response.message) ? response.message : [response.message];

	for (const message of messages) {
		if (message) await interaction.followUp(message);
	}
}

async function run() {
	const intents = new Intents(["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "GUILD_VOICE_STATES"]);

	global.client = new Client({ intents });
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
