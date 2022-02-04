const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);
const { evaluate } = require("mathjs");

const { get } = require("../utils/request");

function answer(options) {
	const question = options.question;
	const phrase = question.substring(0, question.length - 1);
	let num = Math.floor(Math.random() >= 0.5);

	if (!phrase) {
		return "Sim, estou vivo";
	} else if (phrase.includes(" ou ")) {
		const option1 = phrase.split(" ou ")[0];
		const option2 = phrase.split(" ou ")[1];

		return num ? option1 : option2;
	} else if (phrase.includes(" probabilidade ")) {
		num = Math.floor(Math.random() * 100);

		return `Cerca de ${num}%`;
	} else if (phrase.includes(" nota ")) {
		num = Math.floor(Math.random() * 20);

		return num;
	}

	return num ? "Sim" : "Não";
}

async function define(options) {
	const word = options.word;
	const url = `http://api.urbandictionary.com/v0/define?term=${word}`;

	const res = await get(url);
	const json = res.data;

	let response = null;
	if (json.list.length === 0) {
		response = {
			word,
			definition: "Não há definição para esta palavra",
			example: "Não há exemplo",
		};
	} else {
		const cleanString = string => {
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

	return response;
}

async function search(options) {
	const topic = options.topic;
	const url = `https://www.googleapis.com/customsearch/v1?q=${topic}&cx=007153606045358422053:uw-koc4dhb8&key=${process.env.youtubeKey}`;

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

	return response;
}

function sort(options) {
	let values = options.values;
	values = values.split(";");
	const randomized = [];
	const times = values.length;

	for (let i = 0; i < times; i++) {
		const num = Math.floor(Math.random() * values.length);
		randomized.push(values[num]);
		values.splice(num, 1);
	}

	return randomized.join(" > ");
}

// FIXME: Change api
async function convert(options) {
	const url = `https://api.exchangerate.host/latest?base=${options.from}`;

	const res = await get(url);
	const json = res.data;

	return `${options.number} ${options.from} = ${(options.number * json.rates[options.to]).toFixed(2)} ${
		options.to
	}`;
}

function math(options) {
	const expression = options.expression;
	const result = evaluate(expression);

	return result.toString();
}

async function weather(options) {
	const location = options.location;

	const url = `http://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${process.env.openWeatherMapKey}`;

	const res = await get(url);

	if (res.status === 404) return "City Not Found";

	const weatherInfo = {
		forecast: res.data.weather[0].main,
		temp: res.data.main.temp,
		feelsLike: res.data.main.feels_like,
		minTemp: res.data.main.temp_min.toFixed(0).toString(),
		maxTemp: res.data.main.temp_max.toFixed(0).toString(),
		wind: res.data.wind.speed,
		sunrise: dayjs(res.data.sys.sunrise * 1000).format("HH:mm"),
		sunset: dayjs(res.data.sys.sunset * 1000).format("HH:mm"),
	};

	return weatherInfo;
}

module.exports = {
	answer,
	define,
	search,
	sort,
	convert,
	math,
	weather,
};
