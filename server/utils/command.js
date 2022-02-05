const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const utils = require("../functions/utils");
const price = require("../functions/price");
const instagram = require("../functions/instagram");
/*const specific = require("../functions/specific");
const memes = require("../functions/memes");
const reddit = require("../functions/reddit");
const youtube = require("../functions/youtube");
const twitch = require("../functions/twitch");
const personality = require("../functions/personality");
*/

const log = require("../utils/log");

const features = [
	// Utils
	{ command: "answer", func: utils.answer },
	{ command: "define", func: utils.define },
	{ command: "search", func: utils.search },
	{ command: "sort", func: utils.sort },
	{ command: "convert", func: utils.convert },
	{ command: "math", func: utils.math },
	{ command: "weather", func: utils.weather },

	// { command: "price", func: utils.getAmazonPrice },
	{ command: "crypto", func: price.getCryptoPrice },
	/*
	{ command: "radar", func: specific.radars },
	{ command: "corona", func: specific.corona },
	{ command: "keyboards", func: specific.keyboards },
	// { command: "stock", func: specific.stock },
	{ command: "reminder", func: specific.reminder },
	{ command: "birthday", func: specific.birthday },

	// Memes
	{ command: "meme", func: memes.createMeme },

	// Social Media
	{ command: "reddit", func: reddit.getPost },
	{ command: "youtube", func: youtube.getVideo },
	{ command: "twitch", func: twitch.getStream },
	{ command: "insta", func: instagram.getPost },

	// Personality
	{ command: "compliment", func: personality.compliment },
	{ command: "insult", func: personality.insult },
	*/
];

async function handleCommand(command, options) {
	/*
	let customCommands = room ? [] : await CustomCommand.find({ guild: msg.guild.id });

	customCommands = customCommands.map(customCommand => ({
		command: customCommand.word,
		func: () => customCommand.message,
	}));

	customCommands = customCommands.concat(
		discordFeatures.map(feat => ({ command: feat.command, includes: feat.includes, func: () => null })),
	);
	*/

	const feature = features.find(feat => feat.command === command);

	if (!feature) return null;

	console.log(command, options);

	try {
		return { command, message: await feature.func(options) };
	} catch (err) {
		log.error({ status: "command", data: err.stack });

		return null;
	}
}

function setupCommandApi() {
	const commands = [
		{ name: "answer", func: utils.answer },
		{ name: "define", func: utils.define },
		{ name: "search", func: utils.search },
		{ name: "sort", func: utils.sort },
		{ name: "math", func: utils.math },
		{ name: "weather", func: utils.weather },

		{ name: "convert", func: price.convert },
		{ name: "crypto", func: price.getCryptoPrice },
		{ name: "stock", func: price.getStockPrice },

		{ name: "instagram", func: instagram.getPost },
	];

	const app = express();

	app.set("port", process.env.PORT || 5000);

	app.use(morgan(":date :status :method :url :response-time ms"));

	app.use(express.json());

	app.use(cors());

	for (const command of commands) {
		app.post(`/api/commands/${command.name}`, async (req, res) => {
			const response = await command.func(req.body);

			return res.status(response.status).send(response.body);
		});
	}

	app.listen(app.get("port"), () => {
		console.log("Listening on port", app.get("port"));
	});
}

module.exports = { handleCommand, setupCommandApi };
