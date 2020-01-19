const Jimp = require("jimp");

async function makeMeme(msg, meme) {
	let message = msg.content.split(meme.name)[1];
	message = message.split(";");

	const fileName = `./assets/img/memes/templates/${meme.name}.jpg`;
	const image = await Jimp.read(fileName);
	const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

	let currentMsg = null;
	let i = 0;
	if (meme.name === "pikachu") {
		let sum = 0;
		for (i = 0; i < message.length; i++) {
			currentMsg = message[i];
			image.print(
				font,
				meme.position0.x,
				meme.position0.y + sum,
				currentMsg,
				meme.position0.max,
			).write(`./assets/img/memes/${meme.name}.jpg`);
			sum += 50;
		}
	} else {
		for (i = 0; i < message.length; i++) {
			currentMsg = message[i];
			image.print(font, meme[`position${i}`].x, meme[`position${i}`].y, currentMsg, meme[`position${i}`].max)
				.write(`./assets/img/memes/${meme.name}.jpg`);
		}
	}

	return { "file": `./assets/img/memes/${meme.name}.jpg` };
}

function checkForMemes(msg) {
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

	const searchedMeme = msg.content.split(" ")[2];
	const meme = memes.find(meme => meme.name === searchedMeme);

	if (meme) {
		return makeMeme(msg, meme);
	}

	return "Esse meme não existe";
}

module.exports = {
	checkForMemes,
};
