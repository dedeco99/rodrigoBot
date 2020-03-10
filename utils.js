/* global lastMsgs musicPlayers */

const cheerio = require("cheerio");
const ytdl = require("ytdl-core");
const moment = require("moment");
const { evaluate } = require("mathjs");

const { get } = require("./request");
const secrets = require("./secrets");
const embed = require("./embed");
const { updateMeta } = require("./database");

function deleteLastMsg(msg) {
	if (lastMsgs.length) {
		const lastMessage = lastMsgs[lastMsgs.length - 1];
		if (lastMessage.channel.id === msg.channel.id) {
			lastMessage.delete();
			lastMsgs.pop();
			msg.delete();
		}
	}
}

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

async function weather(msg) {
	const params = msg.content.split(" ");
	const location = params[2];

	const url = `http://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${secrets.openWeatherMapKey}`;

	const res = await get(url);

	const weatherInfo = {
		forecast: res.data.weather[0].main,
		temp: res.data.main.temp,
		feelsLike: res.data.main.feels_like,
		minTemp: res.data.main.temp_min.toFixed(0).toString(),
		maxTemp: res.data.main.temp_max.toFixed(0).toString(),
		wind: res.data.wind.speed,
		sunrise: moment(res.data.sys.sunrise * 1000).format("HH:mm"),
		sunset: moment(res.data.sys.sunset * 1000).format("HH:mm"),
	};

	return embed.createWeatherEmbed(weatherInfo);
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
	const expression = msg.content.split("math ")[1];
	const result = evaluate(expression);

	return result;
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
function price() {
	/*
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
	*/

	return "Função em manutenção";
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

function remindMe(msg) {
	const params = msg.content.split(" ");
	const remindVars = ["minutes", "hours", "days"];
	const remindVarsValues = {
		minutes: 60000,
		hours: 60000 * 60,
		days: 60000 * 60 * 24,
	};

	// Get reminder, remind time, and remind time unit
	const remindUnit = params.find(param => remindVars.includes(param));
	const remindTime = Number(params[params.indexOf(remindUnit) - 1] || 1);
	const reminder = params.filter((param) => {
		return params.indexOf(param) > 2 && params.indexOf(param) < params.length - 3;
	});

	setTimeout(() => {
		msg.channel.send(reminder.join(" "));
	}, remindTime * remindVarsValues[remindUnit]);

	return "Ja te lembro";
}

function sanitizeString(str) {
	const newStr = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	return newStr.trim();
}

async function getRadar(msg, page = 0, data = []) {
	const params = msg.content.split(" ");
	const location = params[2];

	const url = `https://temporeal.radaresdeportugal.pt/extras/paginator.php?page=${page}`;

	const res = await get(url);
	const $ = cheerio.load(res.data);

	const response = data.concat($(".panel").toArray().map((elem) => {
		return {
			date: $(elem).find(".panel-heading p").text().trim(),
			location: $(elem).find(".panel-body h4").text(),
			description: $(elem).find(".panel-body .lead").text(),
		};
	}));

	if (moment(response[response.length - 1].date, "DD/MM/YYYY").diff(moment(), "days") === 0) {
		return getRadar(msg, page + 1, response);
	}

	const radarsByLocation = response.filter((radar) => {
		return moment(radar.date, "DD/MM/YYYY").diff(moment(), "days") === 0 &&
			sanitizeString(radar.location).toLowerCase() === sanitizeString(location).toLowerCase();
	});

	const title = radarsByLocation[0].location.charAt(0).toUpperCase() +
		radarsByLocation[0].location.slice(1).toLowerCase();

	return embed.createRadarEmbed(title, radarsByLocation);

}

async function compliment() {
	const metaInfo = await updateMeta({ likes: true });

	return `Durante a minha existência já gostaram de mim ${metaInfo.likes} vezes. I can't handle it!!! *touches face violently*`;
}

async function insult() {
	const metaInfo = await updateMeta({ dislikes: true });

	return `Durante a minha existência já me deram bullying ${metaInfo.dislikes} vezes. Vou chamar os meus pais. *cries while getting hit with a laptop*`;

}

module.exports = {
	deleteLastMsg,
	answer,
	define,
	search,
	sort,
	convert,
	math,
	vote,
	price,
	music,
	remindMe,
	weather,
	getRadar,
	compliment,
	insult,
};
