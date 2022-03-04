const path = require("path");
const Jimp = require("jimp");

const memes = [
	{ name: "truth", options: [{ name: "phrase", x: 250, y: 750, max: 200 }] },
	{ name: "safe", options: [{ name: "phrase", x: 350, y: 100, max: 200 }] },
	{
		name: "drake",
		options: [
			{ name: "phrase", x: 400, y: 100, max: 200 },
			{ name: "phrase2", x: 400, y: 400, max: 200 },
		],
	},
	{ name: "facts", options: [{ name: "phrase", x: 20, y: 350, max: 200 }] },
	{ name: "button", options: [{ name: "phrase", x: 100, y: 220, max: 150 }] },
	{
		name: "choice",
		options: [
			{ name: "phrase", x: 100, y: 125, max: 100 },
			{ name: "phrase2", x: 300, y: 75, max: 100 },
		],
	},
	{
		name: "marioluigi",
		options: [
			{ name: "phrase", x: 375, y: 100, max: 100 },
			{ name: "phrase2", x: 175, y: 375, max: 200 },
			{ name: "phrase3", x: 400, y: 375, max: 200 },
		],
	},
	{
		name: "pikachu",
		options: [
			{ name: "phrase", x: 10, y: 10, max: 700 },
			{ name: "phrase2", x: 10, y: 100, max: 700 },
			{ name: "phrase3", x: 10, y: 200, max: 700 },
		],
	},
	{
		name: "headache",
		options: [{ name: "phrase", x: 375, y: 465, max: 275 }],
	},
	{
		name: "freerealestate",
		options: [
			{ name: "phrase", x: 10, y: 10, max: 700 },
			{ name: "phrase2", x: 10, y: 300, max: 700 },
		],
	},
];

async function createMeme(options) {
	const meme = memes.find(m => m.name === options.meme);

	if (!meme) return { status: 404, body: { message: "MEME_NOT_FOUND" } };

	const filePath = path.join(__dirname, `../img/memes`);
	const image = await Jimp.read(`${filePath}/${meme.name}.jpg`);
	const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

	for (const option of meme.options) {
		image.print(font, option.x, option.y, options[option.name], option.max);
	}

	await image.writeAsync(`${filePath}/temp/${meme.name}.jpg`);

	return {
		status: 200,
		body: { message: "MEME_SUCCESS", data: { files: [`${filePath}/temp/${meme.name}.jpg`] } },
	};
}

module.exports = { createMeme };
