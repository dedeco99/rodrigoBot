const { formatDate, simplifyNumber } = require("../utils/utils");

function createDefineEmbed(res) {
	const embed = {};

	embed.title = res.word;
	embed.color = 0x00ae86;
	embed.fields = [{ name: res.definition, value: res.example }];

	return { embeds: [embed] };
}

function createSearchEmbed(res) {
	const embed = {};

	embed.title = res.topic;
	embed.color = 0x00ae86;

	embed.fields = [];
	for (const result of res.results) {
		embed.fields.push({ name: result.title, value: result.link });
		embed.fields.push({ name: "Description", value: result.description });
	}

	return { embeds: [embed] };
}

function createSortMessage(res) {
	return res.list.join(" > ");
}

function createMathMessage(res) {
	return `${res.expression} = **${res.result}**`;
}

function createWeatherEmbed(res) {
	const embed = {};

	embed.title = res.forecast.description.replace(/\b\w/g, m => m.toUpperCase());
	embed.thumbnail = { url: res.forecast.image };
	embed.color = 0x00ae86;

	embed.fields = [
		{
			name: "Temperatura atual",
			value: `${res.temp} (${res.feelsLike}) °C`,
			inline: true,
		},
		{
			name: "Temperatura máxima",
			value: `${res.maxTemp} °C`,
			inline: true,
		},
		{
			name: "Temperatura mínima",
			value: `${res.minTemp} °C`,
			inline: true,
		},
		{
			name: "Vento",
			value: `${res.windSpeed} km/h`,
			inline: true,
		},
		{
			name: "Nascer do sol",
			value: res.sunrise,
			inline: true,
		},
		{
			name: "Pôr do sol",
			value: res.sunset,
			inline: true,
		},
	];

	return { embeds: [embed] };
}

function createConvertMessage(res) {
	return `${res.number} ${res.from} = **${res.convertedNumber.toFixed(2)} ${res.to}**`;
}

function createCryptoEmbed(res) {
	const embed = {};

	embed.title = `${res.rank ? `${res.rank}.` : ""} ${res.name} (${res.symbol})`;
	embed.thumbnail = { url: res.image };
	embed.color = 0x00ae86;

	embed.fields = [
		{
			name: "Price (€)",
			value: res.price.toFixed(res.price.toFixed(2) === "0.00" ? 10 : 2),
			inline: true,
		},
		{
			name: "Marketcap (€)",
			value: simplifyNumber(res.marketCap),
			inline: true,
		},
		{
			name: "Volume (€)",
			value: simplifyNumber(res.volume),
			inline: true,
		},
	];

	if ("rank" in res) {
		embed.fields.push(
			{
				name: `Available Supply (${res.symbol})`,
				value: simplifyNumber(res.circulatingSupply),
				inline: true,
			},
			{
				name: `Max Supply (${res.symbol})`,
				value: simplifyNumber(res.maxSupply),
				inline: true,
			},
		);
	}

	let footer = "";

	if (res.change1h) footer += `1h: ${res.change1h.toFixed(2)}%`;
	if (res.change24h) footer += ` | 24h: ${res.change24h.toFixed(2)}%`;
	if (res.change7d) footer += ` | 7d: ${res.change7d.toFixed(2)}%`;
	if (res.change30d) footer += ` | 30d: ${res.change30d.toFixed(2)}%`;

	embed.footer = { text: footer };

	return { embeds: [embed] };
}

function createPriceEmbed(res) {
	const embed = {};

	embed.title = res[0].search;
	embed.color = 0xff9900;
	embed.url = res[0].url;

	embed.fields = [];
	for (let i = 0; i < res.length; i++) {
		embed.fields.push({ name: res[i].price, value: `[${res[i].product}](${res[i].productUrl})` });
	}

	return { embeds: [embed] };
}

function createInstaEmbed(res) {
	const embed = {};

	embed.title = res.name;
	embed.color = 0xbc2a8d;
	embed.thumbnail = { url: res.profilePic };
	embed.url = res.url;
	embed.fields = [{ name: "Bio", value: res.bio }];

	if (res.image === null) {
		embed.fields.push({ name: "Erro", value: res.error });
	} else {
		embed.image = { url: res.image };
	}

	embed.footer = {
		text: `Posts: ${simplifyNumber(res.posts)} | Followers: ${simplifyNumber(
			res.followers,
		)} | Follows: ${simplifyNumber(res.follows)}`,
	};

	return { embeds: [embed] };
}

function createRedditEmbed(res) {
	const embed = {};

	if (res.contentVideo !== "") return res.contentVideo;

	embed.title = res.title;
	embed.url = res.permalink;
	embed.color = 0x00ae86;

	if (res.content !== "") {
		embed.thumbnail = { url: res.image };
		embed.fields = [{ name: "Content", value: res.content }];
	} else if (res.contentImage !== "") {
		embed.image = { url: res.contentImage };
	}

	embed.footer = {
		text: `From: r/${res.subreddit} | Upvotes: ${res.score} | Comments: ${res.comments} | Posted: ${formatDate(
			res.created * 1000,
			null,
			true,
		)}`,
	};

	return { embeds: [embed] };
}

function createYoutubeMessage(res) {
	return `https://youtu.be/${res.videoId}`;
}

function createRadarEmbed(res) {
	const embed = {};

	embed.title = res.location;
	embed.color = 0x00ae86;

	embed.fields = [];

	if (res.radars.length) {
		for (const radar of res.radars) {
			embed.fields.push({ name: radar.date, value: radar.description });
		}
	} else {
		embed.description = "Não há radares";
	}

	return { embeds: [embed] };
}

function createCoronaEmbed(res) {
	const embed = {};

	embed.title = res.country.country;
	embed.color = 0x00ae86;

	embed.fields = [
		{
			name: "Cases",
			value: res.country.totalCases,
			inline: true,
		},
		{
			name: "New Cases",
			value: res.country.newCases,
			inline: true,
		},
		{
			name: "Deaths",
			value: res.country.totalDeaths,
			inline: true,
		},
		{
			name: "New Deaths",
			value: res.country.newDeaths,
			inline: true,
		},
		{
			name: "Recovered",
			value: res.country.totalRecovered,
			inline: true,
		},
		{
			name: "Active Cases",
			value: res.country.activeCases,
			inline: true,
		},
		{
			name: "Serious Cases",
			value: res.country.seriousCases,
			inline: true,
		},
		{
			name: "Cases per 1M",
			value: res.country.casesPer1M,
			inline: true,
		},
		{
			name: "Deaths per 1M",
			value: res.country.deathsPer1M,
			inline: true,
		},
	];

	embed.footer = {
		text: `World - Cases : ${res.total[0]} | Deaths: ${res.total[1]} | Recovered: ${res.total[2]} `,
	};

	return { embeds: [embed] };
}

function createKeyboardEmbed(res) {
	const embed = {};

	embed.title = res.name;
	embed.color = 0x00ae86;
	embed.url = res.link;
	embed.fields = [
		{ name: "Pricing", value: res.pricing ? res.pricing : "?", inline: true },
		{ name: "Sale Type", value: res.saleType ? res.saleType : "?", inline: true },
	];

	embed.image = { url: res.image };

	embed.footer = {
		text: `Start date: ${res.startDate === "Invalid date" ? "?" : res.startDate} | End date: ${
			res.endDate === "Invalid date" ? "?" : res.endDate
		}`,
	};

	return { embeds: [embed] };
}

function createStockEmbed(products) {
	const embeds = ["<@&788132015160426496>"];

	for (const res of products) {
		const embed = {};

		embed.title = res.title;
		embed.color = 0x00ae86;
		embed.thumbnail = { url: res.image };
		embed.url = res.url;
		embed.fields = [
			{ name: "Loja", value: res.shop, inline: true },
			{ name: "Stock", value: res.stockMessage, inline: true },
		];

		embeds.push({ embed });
	}

	return { embeds };
}

function createReminderMessage(res) {
	return res;
}

function createPollEmbed(res) {
	const embed = {};

	embed.title = res.title;
	embed.color = 0x00ae86;

	const reacts = ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬", "🇭", "🇮", "🇯", "🇰"];

	embed.fields = [];
	for (let i = 0; i < res.options.length; i++) {
		embed.fields.push({ name: "----------", value: `${reacts[i]} - ${res.options[i]}` });
	}

	return { embeds: [embed] };
}

module.exports = {
	createDefineEmbed,
	createSearchEmbed,
	createSortMessage,
	createMathMessage,
	createWeatherEmbed,

	createConvertMessage,
	createCryptoEmbed,
	createStockEmbed,
	createPriceEmbed,

	createInstaEmbed,
	createRedditEmbed,
	createYoutubeMessage,

	createRadarEmbed,
	createCoronaEmbed,
	createKeyboardEmbed,
	createReminderMessage,

	createPollEmbed,
};
