const request = require("request");
const cheerio = require("cheerio");
const ytdl = require("ytdl-core");
const Cleverbot = require("cleverbot-api");

const secrets = require("./secrets");
const log = require("./log");
const Crypto = require("./crypto");
const embed = require("./embed");

const cleverbot = new Cleverbot(secrets.cleverBotKey);

exports.define = (msg, callback) => {
	const word = msg.content.split("define ")[1];
	const url = `http://api.urbandictionary.com/v0/define?term=${word}`;

	request(url, (error, response, html) => {
		if (error) return log.error(error.stack);
		const json = JSON.parse(html);

		let res = null;

		if (json.list.length === 0) {
			res = {
				word,
				definition: "Não há definição para esta palavra",
				example: "Não há exemplo"
			};
		} else {
			const cleanString = (string) => {
				return string.substring(0, 255).replace(/\[/g, "")
					.replace(/\]/g, "");
			};

			let example = cleanString(json.list[0].example);
			if (json.list[0].example === "") example = "Não há exemplo";

			res = {
				word,
				definition: cleanString(json.list[0].definition),
				example
			};
		}

		return callback(embed.createDefineEmbed(res));
	});
};

exports.procura = (msg, callback) => {
	const topic = msg.content.split("procura ")[1];
	const res = [];
	const url = `https://www.googleapis.com/customsearch/v1?q=${topic}&cx=007153606045358422053:uw-koc4dhb8&key=${secrets.youtubeKey}`;

	request(url, (error, response, html) => {
		if (error) return log.error(error.stack);
		const json = JSON.parse(html);

		for (let i = 0; i < 3; i++) {
			res.push({
				topic,
				title: json.items[i].title,
				link: json.items[i].link,
				description: json.items[i].snippet
			});
		}

		return callback(embed.createSearchEmbed(res));
	});
};

exports.responde = (msg, callback) => {
	let num = Math.floor(Math.random() >= 0.5);
	if (msg.content.includes(" ou ")) {
		const option1 = msg.content.split(" ou ")[0].slice(8);
		const option2 = msg.content.split(" ou ")[1].slice(0, -1);

		return num ? callback(option1) : callback(option2);
	} else if (msg.content.includes(" probabilidade ")) {
		num = Math.floor(Math.random() * 100);

		return callback(`Cerca de ${num}%`);
	} else if (msg.content.includes(" nota ")) {
		num = Math.floor(Math.random() * 20);

		return callback(num);
	}

	return num ? callback("Sim") : callback("Não");
};

exports.math = (msg, callback) => {
	const expression = msg.content.split("math ")[1];
	const result = eval(expression);

	return callback(`Resultado: ${result}`);
};

exports.ordena = (msg, callback) => {
	let options = msg.content.split("ordena")[1];
	options = options.split(";");
	const randomized = [];
	const times = options.length;

	for (let i = 0; i < times; i++) {
		const num = Math.floor(Math.random() * options.length);
		randomized.push(options[num]);
		options.splice(num, 1);
	}

	return callback(randomized.join(" > "));
};

exports.converte = (msg, callback) => {
	const numberToConvert = msg.content.split(" ")[2];
	const currencyToConvert = msg.content.split(" ")[3].toUpperCase();
	const currencyConverted = msg.content.split(" ")[5].toUpperCase();
	const url = "https://api.exchangeratesapi.io/latest";

	request(url, (error, response, html) => {
		if (error) return log.error(error.stack);
		const json = JSON.parse(html);

		let converted = 0;

		if (currencyToConvert === "EUR") {
			converted = (numberToConvert * json.rates[currencyConverted]).toFixed(2);
		} else {
			converted = (numberToConvert / json.rates[currencyToConvert]).toFixed(2);
		}

		return callback(converted);
	});
};

exports.vote = (msg, callback) => {
	const message = msg.content.split("vote ")[1];
	const options = message.split(";");
	const title = options[0];
	options.splice(0, 1);

	const res = {
		title,
		options
	};

	return callback(embed.createPollEmbed(msg, res));
};

exports.getvote = (msg, callback) => {
	const poll = msg.content.split("getvote ")[1];

	msg.channel.fetchMessage(poll)
		.then((message) => {
			message.reactions.forEach((reaction) => {
				reaction.fetchUsers().then((users) => {
					let userRes = "";

					users.forEach(user => {
						userRes += `${user.username} | `;
					});

					return callback(`${reaction._emoji.name}: ${reaction.count} votos (${userRes})`);
				});
			});
		})
		.catch(console.error);
};

exports.crypto = (msg, callback) => {
	const coin = msg.content.split("crypto ")[1];

	Crypto.getPrice(coin, (res) => {
		if (res.error) return callback(res.error);

		return callback(embed.createCryptoEmbed(res));
	});
};

exports.amazon = (msg, callback) => {
	let thing = msg.content.split("price ")[1];
	thing = thing.replace(/ /g, "%20");
	const url = `https://www.amazon.es/s?field-keywords=${thing}`;

	request(url, (error, response, html) => {
		if (error) return log.error(error.stack);
		const $ = cheerio.load(html);
		const res = [];
		thing = thing.replace(/%20/g, " ");

		$("html").find(".a-link-normal.s-access-detail-page.s-color-twister-title-link.a-text-normal")
			.each((index) => {
				if (index !== 0 && index !== 1 && index < 7) {
					const productUrl = $(this)[0].attribs.href;
					const product = `${$(this)[0].attribs.title.substring(0, 50)}...`;
					res.push({ search: thing, url, productUrl, product });
				}
			});

		$("html").find(".a-size-base.a-color-price.a-text-bold")
			.each((index) => {
				if (index < 5) {
					const price = $(this)[0].children[0].data;
					if (res[index]) res[index].price = price;
				}
			});

		if (res.length > 0) {
			return callback(embed.createPriceEmbed(res));
		}

		return callback("Não existe esse produto do xixo");
	});
};

exports.clever = (msg, callback) => {
	cleverbot.getReply({
		input: msg.content
	}, (error, response) => {
		if (error) return log.error(error.stack);

		return callback(response.output);
	});
};

const checkIfInVoiceChannel = (msg, params) => {
	let dispatcher = null;

	if (msg.member.voiceChannel) {
		msg.member.voiceChannel.join()
			.then((connection) => {
				const stream = ytdl(params, { filter: "audioonly" });
				const streamOptions = { seek: 0, volume: 0.5 };
				dispatcher = connection.playStream(stream, streamOptions);

				dispatcher.on("end", () => {
					msg.member.voiceChannel.leave();
				});
			})
			.catch(console.log);
	} else {
		msg.reply("Vai para um canal de voz primeiro sua xixada!");
	}

	return dispatcher;
};

exports.music = (msg) => {
	const params = msg.content.split("music ")[1];
	let dispatcher = null;

	if (params.includes("pause")) {
		dispatcher.pause();
	} else if (params.includes("resume")) {
		dispatcher.resume();
	} else if (params.includes("end")) {
		dispatcher.end();
	} else {
		dispatcher = checkIfInVoiceChannel(msg, params, dispatcher);
	}
};
