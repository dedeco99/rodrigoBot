function createRedditEmbed(res) {
	const embed = {};

	if (res.contentVideo !== "") return res.contentVideo;

	embed.title = res.title;
	embed.url = res.url;
	embed.color = 0x00ae86;

	if (res.content !== "") {
		embed.thumbnail = { url: res.image };
		embed.fields = [{ name: "Content", value: res.content }];
	} else if (res.contentImage !== "") {
		embed.image = { url: res.contentImage };
	}

	embed.footer = { text: `From: ${res.subreddit} | Upvotes: ${res.score} | ` };

	return { embed };
}

function prettyNumber(number) {
	return String(parseFloat(number).toFixed(2)).replace(/(?!^)(?=(?:\d{3})+(?:\.|$))/gm, " ");
}

function createCryptoEmbed(res) {
	const embed = {};

	embed.title = `${res.rank}. ${res.name} (${res.symbol})`;
	embed.color = 0x00ae86;

	const marketcapEur = prettyNumber(res.marketcapEur);
	const availableSupply = prettyNumber(res.availableSupply);
	const totalSupply = prettyNumber(res.totalSupply);

	embed.fields = [
		{
			name: "Price (€)",
			value: `${res.priceEur.toFixed(2)} €`,
			inline: true,
		},
		{
			name: "Marketcap (€)",
			value: `${marketcapEur} €`,
			inline: true,
		},
		{
			name: "Available Supply",
			value: `${availableSupply} ${res.symbol}`,
			inline: true,
		},
		{
			name: "Total Supply",
			value: `${totalSupply} ${res.symbol}`,
			inline: true,
		},
	];

	embed.footer = {
		text: `1h: ${res.change1h.toFixed(2)}% | 24h: ${res.change24h.toFixed(2)}% | 7d: ${res.change7d.toFixed(2)}%`,
	};

	return { embed };
}

function createRadarEmbed(radars) {
	const embed = {};

	embed.title = radars.location;
	embed.color = 0x00ae86;

	embed.fields = [];
	for (const radar of radars.radars) embed.fields.push({ name: radar.date, value: radar.description });

	if (!radars.length) embed.description = "Não há radares";

	return { embed };
}

function createCoronaEmbed(res) {
	const embed = {};

	embed.title = res.country.country;
	embed.color = 0x00ae86;

	embed.fields = [
		{
			name: "Cases",
			value: res.country.totalCases || 0,
			inline: true,
		},
		{
			name: "New Cases",
			value: res.country.newCases || 0,
			inline: true,
		},
		{
			name: "Deaths",
			value: res.country.totalDeaths || 0,
			inline: true,
		},
		{
			name: "New Deaths",
			value: res.country.newDeaths || 0,
			inline: true,
		},
		{
			name: "Recovered",
			value: res.country.totalRecovered || 0,
			inline: true,
		},
		{
			name: "Active Cases",
			value: res.country.activeCases || 0,
			inline: true,
		},
		{
			name: "Serious Cases",
			value: res.country.seriousCases || 0,
			inline: true,
		},
		{
			name: "Cases per 1M",
			value: res.country.casesPer1M || 0,
			inline: true,
		},
		{
			name: "Deaths per 1M",
			value: res.country.deathsPer1M || 0,
			inline: true,
		},
	];

	embed.footer = {
		text: `World - Cases : ${res.total[0]} | Deaths: ${res.total[1]} | Recovered: ${res.total[2]} `,
	};

	return { embed };
}

function createWeatherEmbed(res) {
	const embed = {};

	embed.title = res.forecast;
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
			value: `${res.wind} km/h`,
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

	return { embed };
}

function createSearchEmbed(res) {
	const embed = {};

	embed.title = res[0].topic;
	embed.color = 0x00ae86;

	embed.fields = [];
	for (let i = 0; i < 3; i++) {
		embed.fields.push({ name: res[i].title, value: res[i].link });
		embed.fields.push({ name: "Description", value: res[i].description });
	}

	return { embed };
}

function createDefineEmbed(res) {
	const embed = {};

	embed.title = res.word;
	embed.color = 0x00ae86;
	embed.fields = [{ name: res.definition, value: res.example }];

	return { embed };
}

async function createPollEmbed(msg, res) {
	const embed = {};

	embed.title = res.title;
	embed.color = 0x00ae86;

	const reacts = ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬", "🇭", "🇮", "🇯", "🇰"];

	embed.fields = [];
	for (let i = 0; i < res.options.length; i++) {
		embed.fields.push({ name: "----------", value: `${reacts[i]} - ${res.options[i]}` });
	}

	const message = await msg.channel.send({ embed });

	const promises = [];
	for (let i = 0; i < res.options.length; i++) {
		promises.push(message.react(reacts[i]));
	}

	await Promise.all(promises);
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

	return { embed };
}

function createStockEmbed(products) {
	const embeds = [];

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

	return embeds;
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

	embed.footer = { text: `Posts: ${res.posts} | Followers: ${res.followers} | Follows: ${res.follows}` };

	return { embed };
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

	return embed;
}

module.exports = {
	createRedditEmbed,
	createCryptoEmbed,
	createSearchEmbed,
	createWeatherEmbed,
	createRadarEmbed,
	createCoronaEmbed,
	createDefineEmbed,
	createPollEmbed,
	createKeyboardEmbed,
	createStockEmbed,
	createInstaEmbed,
	createPriceEmbed,
};
