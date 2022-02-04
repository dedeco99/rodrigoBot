/* eslint-disable max-lines */
const { Intents, Client } = require("discord.js");
const rodrigo = require("rodrigo");

if (!process.env.ENV) require("../server/utils/secrets");

const embed = require("./utils/embed");

const utils = require("./functions/utils");
const media = require("./functions/media");
const system = require("./functions/system");

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
	keyboards: embed.createKeyboardEmbed,
	stock: embed.createStockEmbed,
};

const discordFeatures = [
	// Utils
	{ command: "vote", func: utils.vote, afterFunc: utils.voteReactions },

	// System
	{ command: "activity", func: system.activity },
];

const commands = [
	// Utils
	{
		name: "answer",
		description: "Answers a question",
		options: [
			{
				name: "question",
				type: "STRING",
				description: "The question you want to ask",
				required: true,
			},
		],
	},
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
	{
		name: "keyboards",
		description: "Returns information about a keyboard group buy",
	},
	/*
	{
		name: "stock",
		description: "Returns information about stock of added products",
		options: [
			{
				name: "link",
				type: "STRING",
				description: "The link for the product you want to track",
			},
		],
	},
	*/
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
	// Memes
	{
		name: "meme",
		description: "Create a meme",
		options: [
			{
				name: "truth",
				type: "SUB_COMMAND",
				description: "Truth meme",
				options: [
					{
						name: "phrase",
						type: "STRING",
						description: "Phrase",
						required: true,
					},
				],
			},
			{
				name: "safe",
				type: "SUB_COMMAND",
				description: "Safe meme",
				options: [
					{
						name: "phrase",
						type: "STRING",
						description: "Phrase",
						required: true,
					},
				],
			},
			{
				name: "drake",
				type: "SUB_COMMAND",
				description: "Drake meme",
				options: [
					{
						name: "phrase",
						type: "STRING",
						description: "First phrase",
						required: true,
					},
					{
						name: "phrase2",
						type: "STRING",
						description: "Second phrase",
						required: true,
					},
				],
			},
			{
				name: "facts",
				type: "SUB_COMMAND",
				description: "Facts meme",
				options: [
					{
						name: "phrase",
						type: "STRING",
						description: "Phrase",
						required: true,
					},
				],
			},
			{
				name: "button",
				type: "SUB_COMMAND",
				description: "Button meme",
				options: [
					{
						name: "phrase",
						type: "STRING",
						description: "Phrase",
						required: true,
					},
				],
			},
			{
				name: "choice",
				type: "SUB_COMMAND",
				description: "Choice meme",
				options: [
					{
						name: "phrase",
						type: "STRING",
						description: "Phrase",
						required: true,
					},
					{
						name: "phrase2",
						type: "STRING",
						description: "Second phrase",
						required: true,
					},
				],
			},
			{
				name: "marioluigi",
				type: "SUB_COMMAND",
				description: "Mario Luigi meme",
				options: [
					{
						name: "phrase",
						type: "STRING",
						description: "Phrase",
						required: true,
					},
					{
						name: "phrase2",
						type: "STRING",
						description: "Second phrase",
						required: true,
					},
					{
						name: "phrase3",
						type: "STRING",
						description: "Third phrase",
						required: true,
					},
				],
			},
			{
				name: "pikachu",
				type: "SUB_COMMAND",
				description: "Pikachu meme",
				options: [
					{
						name: "phrase",
						type: "STRING",
						description: "Phrase",
						required: true,
					},
					{
						name: "phrase2",
						type: "STRING",
						description: "Second phrase",
						required: true,
					},
					{
						name: "phrase3",
						type: "STRING",
						description: "Third phrase",
						required: true,
					},
				],
			},
		],
	},
	/* Discord */
	// Utils
	{
		name: "reminder",
		description: "Creates a reminder for a specific date and time",
		options: [
			{
				name: "reminder",
				type: "STRING",
				description: "What you want to be reminded of",
				required: true,
			},
			{
				name: "date",
				type: "STRING",
				description: "The date to be reminded at (DD-MM-YYYY)",
				required: true,
			},
			{
				name: "time",
				type: "STRING",
				description: "The time to be reminded at (HH:mm)",
				required: true,
			},
		],
	},
	{
		name: "birthday",
		description: "Creates a birthday reminder for a specific user",
		options: [
			{
				name: "user",
				type: "USER",
				description: "The user to whom the birthday concerns",
				required: true,
			},
			{
				name: "date",
				type: "STRING",
				description: "The date to be reminded at (DD-MM)",
				required: true,
			},
		],
	},
	{
		name: "vote",
		description: "Returns a poll with the specified options",
		options: [
			{
				name: "title",
				type: "STRING",
				description: "The title of the poll",
				required: true,
			},
			{
				name: "options",
				type: "STRING",
				description: "The options for the poll separated by ;",
				required: true,
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
	// System
	{
		name: "activity",
		description: "Change the current activity of the bot",
		options: [
			{
				name: "type",
				type: "STRING",
				description: "The type of activity",
				required: true,
				choices: [
					{ name: "Playing", value: "PLAYING" },
					{ name: "Watching", value: "WATCHING" },
					{ name: "Listening", value: "LISTENING" },
					{ name: "Streaming", value: "STREAMING" },
					{ name: "Competing", value: "COMPETING" },
					{ name: "Custom", value: "CUSTOM" },
				],
			},
			{
				name: "activity",
				type: "STRING",
				description: "The  activity",
				required: true,
			},
		],
	},
];

async function handleMessage(msg) {
	if (msg.content.toLowerCase() === "rodrigo commands") {
		await msg.guild.commands.set(commands);

		await msg.reply("Deployed!");
	}

	return null;
}

// eslint-disable-next-line complexity
async function handleInteraction(interaction) {
	if (!interaction.isCommand() || !interaction.guildId) return;

	await interaction.deferReply();

	if (["play", "pause", "resume", "skip", "queue", "stop"].includes(interaction.commandName)) {
		await media.music(interaction);
		return;
	}

	const command = commands.find(c => c.name === interaction.commandName);

	let subCommand = null;
	try {
		subCommand = interaction.options.getSubcommand();
		// eslint-disable-next-line no-empty
	} catch (err) {}

	const options = { room: interaction.channelId, user: interaction.user.id };
	if (command.options) {
		for (const option of command.options.map(o => o.name)) {
			if (subCommand) {
				options[interaction.commandName] = subCommand;

				const subCommandOptions = command.options.find(o => o.name === subCommand).options;

				for (const subOption of subCommandOptions.map(o => o.name)) {
					options[subOption] = interaction.options.get(subOption)
						? interaction.options.get(subOption).value
						: null;
				}
			} else {
				options[option] = interaction.options.get(option) ? interaction.options.get(option).value : null;
			}
		}
	}

	let response = await rodrigo.handleCommand(interaction.commandName, options);

	let discordFeature = null;
	if (!response) {
		discordFeature = discordFeatures.find(feat => feat.command === interaction.commandName);

		if (discordFeature) {
			response = { command: discordFeature.command, message: await discordFeature.func(options) };
		}

		if (!response || !response.message) return interaction.followUp("Either you or I did something wrong");
	}

	if (!discordFeature && embeds[response.command] && typeof response.message !== "string") {
		response.message = embeds[response.command](response.message);
	}

	if (response.message) {
		const msg = await interaction.followUp(response.message);

		if (discordFeature && discordFeature.afterFunc) await discordFeature.afterFunc(msg, options);
	}
}

async function handleCronjob(room, message) {
	if (typeof message === "string") {
		global.client.channels.cache.get(room).send(message);
	} else {
		let response = await rodrigo.handleCommand(message.command, message.options);

		if (embeds[response.command]) {
			response = embeds[response.command](response.message);

			if (response) global.client.channels.cache.get(room).send(response);
		}
	}
}

async function run() {
	const intents = new Intents(["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "GUILD_VOICE_STATES"]);

	global.client = new Client({ intents });
	global.callback = null;
	global.cronjobs = [];
	global.redditPosts = [];

	global.client.login(process.env.discordKey);

	const meta = await rodrigo.getMetadata();

	global.client.on("ready", () => {
		console.log(`Logged in as ${global.client.user.tag}!`);

		system.activity({ type: meta.action.type, activity: meta.action.message });
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

	rodrigo.handleCronjobs(handleCronjob);
}

run();
