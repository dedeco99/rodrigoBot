const discord = require("discord.js");
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
};

const discordFeatures = [
	// Utils
	{ command: "remindme", func: utils.remindMe },
	{ command: "vote", func: utils.vote },

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

async function run() {
	global.client = new discord.Client();
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

	global.client.on("message", async msg => {
		if (msg.author && msg.author.username === "RodrigoBot") {
			global.lastMsgs.push(msg);
			if (global.lastMsgs.length > 10) global.lastMsgs.shift();

			return null;
		}

		let customCommands = await CustomCommand.find({ guild: msg.guild.id });

		customCommands = customCommands.map(customCommand => ({
			command: customCommand.word,
			func: () => customCommand.message,
		}));

		customCommands = customCommands.concat(
			discordFeatures.map(feat => ({ command: feat.command, includes: feat.includes, func: () => null })),
		);

		let response = await rodrigo.handleMessage(msg.content, customCommands);

		if (!response) return null;

		const discordFeature = discordFeatures.find(
			feat => (feat.command.length ? feat.command[0] : feat.command) === response.command,
		);

		if (discordFeature) {
			response = { command: discordFeature.command, message: await discordFeature.func(msg) };
		}

		if (response.message) {
			msg.channel.send(embeds[response.command] ? embeds[response.command](response.message) : response.message);
		}
	});

	global.client.on("messageReactionAdd", reaction => {
		if (reaction.message.channel.guild.id === "651025812312555551") {
			if (reaction._emoji.name === "📌" || reaction._emoji.name === "📍") {
				utils.pin(reaction.message, true);
			}
		}
	});
}

run();
