const { get } = require("./request");
const secrets = require("./secrets");
const embed = require("./embed");

function checkCoinName(searchCoin, coin) {
	if (
		searchCoin.charAt(0).toUpperCase() + searchCoin.slice(1) === coin.name ||
		searchCoin.toUpperCase() === coin.symbol
	) {
		return true;
	}
	return false;

}

async function getPrice(msg) {
	const data = msg.content.split("crypto ")[1];
	let response = null;

	let url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/map";
	const headers = { "X-CMC_PRO_API_KEY": secrets.coinmarketcapKey };

	const res = await get(url, headers);
	const json = res.data;

	let coinId = null;
	for (const coin of json.data) {
		if (checkCoinName(data, coin)) {
			coinId = coin.id;
			break;
		}
	}

	if (coinId) {
		url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=${coinId}&&convert=EUR`;

		const res = await get(url, headers);
		const json = res.data;

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
