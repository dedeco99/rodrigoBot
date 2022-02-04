const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);
const { evaluate } = require("mathjs");

const { get } = require("../utils/request");

function answer(options) {
	const { question } = options;

	const phrase = question.substring(0, question.length - 1);
	let num = Math.floor(Math.random() >= 0.5);

	let data = num ? "ANSWER_YES" : "ANSWER_NO";
	if (!phrase) {
		return "ANSWER_ALIVE";
	} else if (phrase.includes(" or ")) {
		const option1 = phrase.split(" or ")[0];
		const option2 = phrase.split(" or ")[1];

		data = num ? option1 : option2;
	} else if (phrase.includes(" probability ")) {
		num = Math.floor(Math.random() * 100);

		data = `${num}%`;
	} else if (phrase.includes(" grade ")) {
		num = Math.floor(Math.random() * 20);

		data = num.toString();
	}

	return { status: 200, body: { message: "ANSWER_SUCCESS", data: { answer: data } } };
}

async function define(options) {
	const { word } = options;

	const res = await get(`http://api.urbandictionary.com/v0/define?term=${word}`);
	const json = res.data;

	if (!json.list.length) return { status: 404, body: { message: "DEFINE_NOT_FOUND" } };

	const cleanString = string => {
		return string.substring(0, 255).replace(/\[/g, "").replace(/\]/g, "");
	};

	return {
		status: 200,
		body: {
			message: "DEFINE_SUCCESS",
			data: {
				word,
				definition: cleanString(json.list[0].definition),
				example: json.list[0].example ? cleanString(json.list[0].example) : "NO_EXAMPLE",
			},
		},
	};
}

async function search(options) {
	const { word } = options;
	const url = `https://www.googleapis.com/customsearch/v1?q=${word}&cx=007153606045358422053:uw-koc4dhb8&key=${process.env.youtubeKey}`;

	const res = await get(url);
	const json = res.data;

	const data = { word, results: [] };
	for (let i = 0; i < 3; i++) {
		data.results.push({
			title: json.items[i].title,
			link: json.items[i].link,
			description: json.items[i].snippet,
		});
	}

	return { status: 200, body: { message: "SEARCH_SUCCESS", data } };
}

function sort(options) {
	const { values } = options;

	const splitValues = Array.isArray(values) ? values : values.split(";");
	const length = splitValues.length;

	const randomized = [];
	for (let i = 0; i < length; i++) {
		const num = Math.floor(Math.random() * splitValues.length);
		randomized.push(splitValues[num]);
		splitValues.splice(num, 1);
	}

	return { status: 200, body: { message: "SORT_SUCCESS", data: { list: randomized } } };
}

async function convert(options) {
	const { number, from, to } = options;

	const url = `https://api.exchangerate.host/latest?base=${from}`;

	const res = await get(url);
	const json = res.data;

	return {
		status: 200,
		body: {
			message: "CONVERT_SUCCESS",
			data: { number, from, to, convertedNumber: number * json.rates[to] },
		},
	};
}

function math(options) {
	const { expression } = options;

	const result = evaluate(expression);

	return { status: 200, body: { message: "MATH_SUCCESS", data: { result } } };
}

async function weather(options) {
	const { location } = options;

	const url = `http://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${process.env.openWeatherMapKey}`;

	const res = await get(url);

	if (res.status === 404) return { status: 200, body: { message: "WEATHER_CITY_NOT_FOUND" } };

	return {
		status: 200,
		body: {
			message: "WEATHER_SUCCESS",
			data: {
				forecast: res.data.weather[0].main,
				temp: res.data.main.temp,
				feelsLike: res.data.main.feels_like,
				minTemp: res.data.main.temp_min.toFixed(0).toString(),
				maxTemp: res.data.main.temp_max.toFixed(0).toString(),
				wind: res.data.wind.speed,
				sunrise: dayjs(res.data.sys.sunrise * 1000).format("HH:mm"),
				sunset: dayjs(res.data.sys.sunset * 1000).format("HH:mm"),
			},
		},
	};
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
