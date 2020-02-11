/* global musicPlayers */

const { get } = require("./request");

const cheerio = require("cheerio");
const ytdl = require("ytdl-core");

const secrets = require("./secrets");
const embed = require("./embed");

function answer(msg) {
	let num = Math.floor(Math.random() >= 0.5);
	if (msg.content.includes(" ou ")) {
		const option1 = msg.content.split(" ou ")[0].slice(8);
		const option2 = msg.content.split(" ou ")[1].slice(0, -1);

		return num ? option1 : option2;
	} else if (msg.content.includes(" probabilidade ")) {
		num = Math.floor(Math.random() * 100);

		return `Cerca de ${num}%`;
	} else if (msg.content.includes(" nota ")) {
		num = Math.floor(Math.random() * 20);

		return num;
	}

	return num ? "Sim" : "Não";
}

async function define(msg) {
	const word = msg.content.split("define ")[1];
	const url = `http://api.urbandictionary.com/v0/define?term=${word}`;

	const res = await get(url);
	const json = res.data;

	let response = null;
	if (json.list.length === 0) {
		response = {
			word,
			"definition": "Não há definição para esta palavra",
			"example": "Não há exemplo",
		};
	} else {
		const cleanString = (string) => {
			return string.substring(0, 255).replace(/\[/g, "").replace(/\]/g, "");
		};

		let example = cleanString(json.list[0].example);
		if (json.list[0].example === "") example = "Não há exemplo";

		response = {
			word,
			definition: cleanString(json.list[0].definition),
			example,
		};
	}

	return embed.createDefineEmbed(response);
}

async function search(msg) {
	const topic = msg.content.split("procura ")[1];
	const url = `https://www.googleapis.com/customsearch/v1?q=${topic}&cx=007153606045358422053:uw-koc4dhb8&key=${secrets.youtubeKey}`;

	const res = await get(url);
	const json = res.data;

	const response = [];
	for (let i = 0; i < 3; i++) {
		response.push({
			topic,
			title: json.items[i].title,
			link: json.items[i].link,
			description: json.items[i].snippet,
		});
	}

	return embed.createSearchEmbed(response);
}

function sort(msg) {
	let options = msg.content.split("ordena")[1];
	options = options.split(";");
	const randomized = [];
	const times = options.length;

	for (let i = 0; i < times; i++) {
		const num = Math.floor(Math.random() * options.length);
		randomized.push(options[num]);
		options.splice(num, 1);
	}

	return randomized.join(" > ");
}

async function convert(msg) {
	const numberToConvert = msg.content.split(" ")[2];
	const currencyToConvert = msg.content.split(" ")[3].toUpperCase();
	const currencyConverted = msg.content.split(" ")[5].toUpperCase();
	const url = "https://api.exchangeratesapi.io/latest";

	const res = await get(url);
	const json = res.data;

	let converted = 0;

	if (currencyToConvert === "EUR") {
		converted = (numberToConvert * json.rates[currencyConverted]).toFixed(2);
	} else {
		converted = (numberToConvert / json.rates[currencyToConvert]).toFixed(2);
	}

	return converted;
}

function math(msg) {
	// eslint-disable-next-line no-unused-vars
	const expression = msg.content.split("math ")[1];
	// const result = eval(expression);

	return "Esta função foi tão violada no rabinho que foi descontinuada";
}

async function vote(msg) {
	const message = msg.content.split(" ");

	if (message[2] === "results") {
		const poll = message[3];

		const vote = await msg.channel.fetchMessage(poll);

		vote.reactions.forEach(async (reaction) => {
			const users = await reaction.fetchUsers();
			const userRes = users.map(user => user.username).join(" | ");

			msg.channel.send(`${reaction._emoji.name}: ${reaction.count} votos (${userRes})`);
		});
	} else {
		const message = msg.content.split("vote ")[1];
		const options = message.split(";");
		const title = options[0];
		options.splice(0, 1);

		const res = {
			title,
			options,
		};

		return embed.createPollEmbed(msg, res);
	}

	return null;
}

// FIXME: Not working
async function price(msg) {
	let thing = msg.content.split("price ")[1];
	thing = thing.replace(/ /g, "%20");
	const url = `https://www.amazon.es/s?field-keywords=${thing}`;

	const res = await get(url);
	const $ = cheerio.load(res.data);
	const response = [];
	thing = thing.replace(/%20/g, " ");

	$("html").find(".a-link-normal.s-access-detail-page.s-color-twister-title-link.a-text-normal")
		.each((index) => {
			if (index !== 0 && index !== 1 && index < 7) {
				const productUrl = $(this)[0].attribs.href;
				const product = `${$(this)[0].attribs.title.substring(0, 50)}...`;
				response.push({ search: thing, url, productUrl, product });
			}
		});

	$("html").find(".a-size-base.a-color-price.a-text-bold")
		.each((index) => {
			if (index < 5) {
				const price = $(this)[0].children[0].data;
				if (response[index]) response[index].price = price;
			}
		});

	if (response.length > 0) {
		return embed.createPriceEmbed(response);
	}

	return "Não existe esse produto do xixo";
}

async function music(msg) {
	const play = (musicPlayer, connection) => {
		const stream = ytdl(musicPlayer.queue[0], { filter: "audioonly" });
		const streamOptions = { seek: 0, volume: 0.5 };
		musicPlayer.dispatcher = connection.playStream(stream, streamOptions);

		musicPlayer.dispatcher.on("end", () => {
			musicPlayer.queue.shift();
			if (musicPlayer.queue.length) {
				play(musicPlayer, connection);
			} else {
				connection.disconnect();
			}
		});
	};

	const params = msg.content.split(" ");
	const command = params[2].toLowerCase();

	if (!musicPlayers[msg.member.guild.id]) musicPlayers[msg.member.guild.id] = { queue: [] };

	const musicPlayer = musicPlayers[msg.member.guild.id];

	if (command === "play") {
		if (!msg.member.voiceChannel) return "Vai para um canal de voz primeiro sua xixada!";

		musicPlayer.queue.push(params[3]);

		if (!msg.member.guild.voiceConnection) {
			const connection = await msg.member.voiceChannel.join();

			play(musicPlayer, connection);
		}
	} else if (musicPlayer && command === "skip") {
		musicPlayer.dispatcher.end();
	} else if (musicPlayer && command === "pause") {
		musicPlayer.dispatcher.pause();
	} else if (musicPlayer && command === "resume") {
		musicPlayer.dispatcher.resume();
	} else if (musicPlayer && command === "end") {
		musicPlayer.dispatcher.end();

		delete musicPlayers[msg.member.guild.id];
	}

	return null;
}

module.exports = {
	answer,
	define,
	search,
	sort,
	convert,
	math,
	vote,
	price,
	music,
};
