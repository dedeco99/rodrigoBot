const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const utils = require("../functions/utils");
const price = require("../functions/price");
const instagram = require("../functions/instagram");
const reddit = require("../functions/reddit");
const youtube = require("../functions/youtube");
const memes = require("../functions/memes");
const specific = require("../functions/specific");
/*

const personality = require("../functions/personality");
*/

const log = require("../utils/log");

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
	{ name: "reddit", func: reddit.getPost },
	{ name: "youtube", func: youtube.getVideo },
	{ name: "youtube/search", func: youtube.getVideoSearch },

	{ name: "meme", func: memes.createMeme },

	{ name: "radars", func: specific.radars },
	{ name: "corona", func: specific.corona },
	{ name: "keyboards", func: specific.keyboards },
	{ name: "reminder", func: specific.reminder },
	{ name: "birthday", func: specific.birthday },
];

/*
const features = [
	// { command: "price", func: utils.getAmazonPrice },

	// { command: "stock", func: specific.stock },
	
	// Personality
	{ command: "compliment", func: personality.compliment },
	{ command: "insult", func: personality.insult },
];
*/

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

	const feature = commands.find(feat => feat.name === command);

	if (!feature) return { command, data: { status: 404, body: { message: "COMMAND_NOT_FOUND" } } };

	console.log(command, options);

	try {
		return { command, data: await feature.func(options) };
	} catch (err) {
		log.error({ status: "command", data: err.stack });

		return { command, data: { status: 500, body: { message: "COMMAND_INTERNAL_ERROR" } } };
	}
}

function setupCommandApi() {
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
