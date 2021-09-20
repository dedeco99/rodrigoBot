const path = require("path");
const Jimp = require("jimp");

const memes = [
	{ name: "truth", position0: { x: 250, y: 750, max: 200 } },
	{ name: "safe", position0: { x: 350, y: 100, max: 200 } },
	{ name: "drake", position0: { x: 400, y: 100, max: 200 }, position1: { x: 400, y: 400, max: 200 } },
	{ name: "facts", position0: { x: 20, y: 350, max: 200 } },
	{ name: "button", position0: { x: 100, y: 220, max: 150 } },
	{ name: "choice", position0: { x: 100, y: 125, max: 100 }, position1: { x: 300, y: 75, max: 100 } },
	{
		name: "marioluigi",
		position0: { x: 375, y: 100, max: 100 },
		position1: { x: 175, y: 375, max: 200 },
		position2: { x: 400, y: 375, max: 200 },
	},
	{ name: "pikachu", position0: { x: 10, y: 10, max: 700 } },
];

async function createMeme(options) {
	const meme = memes.find(m => m.name === options.meme);
	const message = [...Object.values(options).filter(o => o !== options.meme)];

	const fileName = path.join(__dirname, `../img/memes/templates/${meme.name}.jpg`);
	const image = await Jimp.read(fileName);
	const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

	let currentMsg = null;
	let i = 0;
	if (meme.name === "pikachu") {
		let sum = 0;
		for (i = 0; i < message.length; i++) {
			currentMsg = message[i];
			image.print(font, meme.position0.x, meme.position0.y + sum, currentMsg, meme.position0.max).write(fileName);
			sum += 50;
		}
	} else {
		for (i = 0; i < message.length; i++) {
			currentMsg = message[i];
			image
				.print(font, meme[`position${i}`].x, meme[`position${i}`].y, currentMsg, meme[`position${i}`].max)
				.write(fileName);
		}
	}

	return { files: [fileName] };
}

module.exports = { createMeme };
