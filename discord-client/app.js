/* eslint-disable max-lines */
const { Intents, Client } = require("discord.js");
const rodrigo = require("rodrigo");

const embed = require("./utils/embed");

const utils = require("./functions/utils");
const media = require("./functions/media");
const system = require("./functions/system");

const { translate } = require("./utils/utils");

const embeds = {
	define: embed.createDefineEmbed,
	search: embed.createSearchEmbed,
	sort: embed.createSortMessage,
	math: embed.createMathMessage,
	weather: embed.createWeatherEmbed,

	convert: embed.createConvertMessage,
	crypto: embed.createCryptoEmbed,
	stock: embed.createCryptoEmbed,

	instagram: embed.createInstaEmbed,
	reddit: embed.createRedditEmbed,
	youtube: embed.createYoutubeMessage,

	radars: embed.createRadarEmbed,
	corona: embed.createCoronaEmbed,
	keyboards: embed.createKeyboardEmbed,
	reminder: embed.createReminderMessage,
	birthday: embed.createReminderMessage,

	vote: embed.createPollEmbed,
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
	// Price
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
		name: "crypto",
		description: "Returns information about a coin",
		options: [
			{
				name: "symbol",
				type: "STRING",
				description: "The symbol of a coin",
				required: true,
			},
		],
	},
	{
		name: "stock",
		description: "Returns information about a stock",
		options: [
			{
				name: "symbol",
				type: "STRING",
				description: "The symbol of a stock",
				required: true,
			},
		],
	},
	// Social Media
	{
		name: "instagram",
		description: "Returns a post from the specified user",
		options: [
			{
				name: "handle",
				type: "STRING",
				description: "The handle of the user you want the post from",
				required: true,
			},
			{
				name: "number",
				type: "NUMBER",
				description: "The number of the post (the latest one is 0)",
			},
		],
	},
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
			{
				name: "headache",
				type: "SUB_COMMAND",
				description: "Headache meme",
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
				name: "freerealestate",
				type: "SUB_COMMAND",
				description: "Free Real Estate meme",
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
						description: "Phrase",
						required: true,
					},
				],
			},
		],
	},
	// Specific
	{
		name: "radars",
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
	/* Discord */
	// Utils
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
	/*
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
	*/
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

	const discordFeature = discordFeatures.find(feat => feat.command === interaction.commandName);

	if (discordFeature) {
		const message = await discordFeature.func(options);

		const msg = await interaction.followUp(message);

		if (discordFeature && discordFeature.afterFunc) await discordFeature.afterFunc(msg, options);
	} else {
		const response = await rodrigo.handleCommand(interaction.commandName, options);

		if (response.data.status === 200) {
			const message = embeds[response.command]
				? embeds[response.command](response.data.body.data)
				: response.data.body.data;

			if (message) await interaction.followUp(message);
		} else {
			interaction.followUp(translate(response.data.body.message));
		}
	}
}

async function handleCronjob(room, message) {
	if (typeof message === "string") {
		global.client.channels.cache.get(room).send(message);
	} else {
		const response = await rodrigo.handleCommand(message.command, message.options);

		if (response.data.status === 200) {
			const msg = embeds[response.command]
				? embeds[response.command](response.data.body.data)
				: response.data.body.data;

			if (msg) global.client.channels.cache.get(room).send(msg);
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
