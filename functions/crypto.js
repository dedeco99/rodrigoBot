const { get } = require("../utils/request");
const secrets = require("../utils/secrets");
const embed = require("../utils/embed");

async function getPrice(msg) {
	const data = msg.content.split("crypto ")[1];
	let response = null;

	let url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/map";
	const headers = { "X-CMC_PRO_API_KEY": secrets.coinmarketcapKey };

	let res = await get(url, headers);
	let json = res.data;

	let coinId = null;
	for (const coin of json.data) {
		if (
			data.charAt(0).toUpperCase() + data.slice(1) === coin.name ||
			data.toUpperCase() === coin.symbol
		) {
			coinId = coin.id;
			break;
		}
	}

	if (coinId) {
		url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=${coinId}&&convert=EUR`;

		res = await get(url, headers);
		json = res.data;

		if (json.error) return "Este Market Cap tá na xixada (down)";

		response = {
			availableSupply: json.data[coinId].total_supply,
			change1h: json.data[coinId].quote.EUR.percent_change_1h,
			change24h: json.data[coinId].quote.EUR.percent_change_24h,
			change7d: json.data[coinId].quote.EUR.percent_change_7d,
			marketcapEur: json.data[coinId].quote.EUR.market_cap,
			name: json.data[coinId].name,
			priceEur: json.data[coinId].quote.EUR.price,
			rank: json.data[coinId].cmc_rank,
			symbol: json.data[coinId].symbol,
			totalSupply: json.data[coinId].max_supply,
			volumeEur: json.data[coinId].quote.EUR.volume_24h,
		};

		return embed.createCryptoEmbed(response);
	}

	return "Essa moeda deve estar no xixo porque não a encontro";
}

module.exports = {
	getPrice,
};
