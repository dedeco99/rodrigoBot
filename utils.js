var request = require("request");
var cheerio = require("cheerio");
var ytdl = require("ytdl-core");
var Cleverbot = require("cleverbot-api");
var Crypto = require("./crypto");
var embed = require("./embed");

var cleverbot = new Cleverbot(process.env.cleverBotKey);

exports.define = (msg, callback) => {
	var word = msg.content.split("define ")[1];
	var url = "http://api.urbandictionary.com/v0/define?term=" + word;

	request(url, (error, response, html) => {
		if (error) console.log(error);
		var json = JSON.parse(html);

		var res = null;

		if (json.list.length === 0) {
			res = {
				word,
				definition: "Não há definição para esta palavra",
				example: "Não há exemplo"
			};
		} else {
			var cleanString = (string) => {
				return string.substring(0, 255).replace(/\[/g, "").replace(/\]/g, "");
			};

			var example = cleanString(json.list[0].example);
			if (json.list[0].example === "") example = "Não há exemplo";

			res = {
				word,
				definition: cleanString(json.list[0].definition),
				example
			};
		}
		callback(embed.createDefineEmbed(res));
	});
};

exports.procura = (msg, callback) => {
	var topic = msg.content.split("procura ")[1];
	var res = [];
	var url = "https://www.googleapis.com/customsearch/v1?q=" + topic + "&cx=007153606045358422053:uw-koc4dhb8&key=" + process.env.youtubeKey;

	request(url, (error, response, html) => {
		if (error) console.log(error);
		var json = JSON.parse(html);
		for (var i = 0; i < 3; i++) {
			res.push({
				topic,
				title: json.items[i].title,
				link: json.items[i].link,
				description: json.items[i].snippet
			});
		}
		callback(embed.createSearchEmbed(res));
	});
};

exports.responde = (msg, callback) => {
	var num = Math.floor(Math.random() >= 0.5);
	if (msg.content.includes(" ou ")) {
		var option1 = msg.content.split(" ou ")[0].slice(8);
		var option2 = msg.content.split(" ou ")[1].slice(0, -1);

		num ? callback(option1) : callback(option2);
	} else if (msg.content.includes(" probabilidade ")) {
		num = Math.floor(Math.random() * 100);
		callback("Cerca de " + num + "%");
	} else if (msg.content.includes(" nota ")) {
		num = Math.floor(Math.random() * 20);
		callback(num);
	} else {
		num ? callback("Sim") : callback("Não");
	}
};

exports.math = (msg, callback) => {
	var expression = msg.content.split("math ")[1];
	var result = eval(expression);
	callback("Resultado: " + result);
};

exports.ordena = (msg, callback) => {
	var options = msg.content.split("ordena")[1];
	options = options.split(";");
	var randomized = [];
	var times = options.length;

	for (var i = 0; i < times; i++) {
		var num = Math.floor(Math.random() * options.length);
		randomized.push(options[num]);
		options.splice(num, 1);
	}

	callback(randomized.join(" > "));
};

exports.converte = (msg, callback) => {
	var numberToConvert = msg.content.split(" ")[2];
	var currencyToConvert = msg.content.split(" ")[3].toUpperCase();
	var currencyConverted = msg.content.split(" ")[5].toUpperCase();
	var url = "https://api.exchangeratesapi.io/latest";

	request(url, (error, response, html) => {
		if (error) console.log(error);
		var json = JSON.parse(html);

		var converted = 0;

		if (currencyToConvert === "EUR") {
			converted = (numberToConvert * json.rates[currencyConverted]).toFixed(2);
		} else {
			converted = (numberToConvert / json.rates[currencyToConvert]).toFixed(2);
		}

		callback(converted);
	});
};

exports.vote = (msg, callback) => {
	var message = msg.content.split("vote ")[1];
	var options = message.split(";");
	var title = options[0];
	options.splice(0, 1);

	var res = {
		title,
		options
	};

	callback(embed.createPollEmbed(msg, res));
};

exports.getvote = (msg, callback) => {
	var poll = msg.content.split("getvote ")[1];

	msg.channel.fetchMessage(poll)
		.then((message) => {
			var i = 0;
			message.reactions.forEach((reaction) => {
				reaction.fetchUsers().then((users) => {
					var userRes = "";
					users.forEach((user) => {
						userRes += user.username + " | ";
					});
					callback(reaction._emoji.name + ": " + reaction.count + " votos" + "(" + userRes + ")");
					i++;
				});
			});
		})
		.catch(console.error);
};

exports.crypto = (msg, callback) => {
	var coin = msg.content.split("crypto ")[1];
	Crypto.getPrice(coin, (res) => {
		if (res.error) {
			callback(res.error);
		} else {
			callback(embed.createCryptoEmbed(res));
		}
	});
};

exports.amazon = (msg, callback) => {
	var thing = msg.content.split("price ")[1];
	thing = thing.replace(/ /g, "%20");
	var url = "https://www.amazon.es/s?field-keywords=" + thing;

	request(url, (error, response, html) => {
		var $ = cheerio.load(html);
		var res = [];
		thing = thing.replace(/%20/g, " ");

		$("html").find(".a-link-normal.s-access-detail-page.s-color-twister-title-link.a-text-normal").each((index, element) => {
			if (index !== 0 && index !== 1 && index < 7) {
				var productUrl = $(this)[0].attribs.href;
				var product = $(this)[0].attribs.title.substring(0, 50) + "...";
				res.push({ search: thing, url, productUrl, product });
			}
		});

		$("html").find(".a-size-base.a-color-price.a-text-bold").each((index, element) => {
			if (index < 5) {
				var price = $(this)[0].children[0].data;
				if (res[index]) res[index].price = price;
			}
		});

		if (res.length > 0) {
			callback(embed.createPriceEmbed(res));
		} else {
			callback("Não existe esse produto do xixo");
		}
	});
};

exports.clever = (msg, callback) => {
	cleverbot.getReply({
		input: msg.content
	}, (error, response) => {
		if (error) throw error;
		callback(response.output);
	});
};

var checkIfInVoiceChannel = (msg, params, dispatcher) => {
	if (msg.member.voiceChannel) {
		msg.member.voiceChannel.join().then((connection) => {
			const stream = ytdl(params, { filter: "audioonly" });
			const streamOptions = { seek: 0, volume: 0.5 };
			dispatcher = connection.playStream(stream, streamOptions);

			dispatcher.on("end", () => {
				msg.member.voiceChannel.leave();
			});
		}).catch(console.log);
	} else {
		msg.reply("Vai para um canal de voz primeiro sua xixada!");
	}
};

exports.music = (msg, callback) => {
	var params = msg.content.split("music ")[1];
	var dispatcher = null;

	if (params.includes("pause")) {
		dispatcher.pause();
	} else if (params.includes("resume")) {
		dispatcher.resume();
	} else if (params.includes("end")) {
		dispatcher.end();
	} else {
		checkIfInVoiceChannel(msg, params, dispatcher);
	}
};
