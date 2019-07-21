const request = require("request");

const secrets = require("./secrets");
const log = require("./log");

const checkCoinName = (searchCoin, coin) => {
	if (searchCoin.charAt(0).toUpperCase() + searchCoin.slice(1) === coin.name
		|| searchCoin.toUpperCase() === coin.symbol) {
		return true;
	}
	return false;

};

exports.getPrice = (data, callback) => {
	let url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/map";
	const headers = { "X-CMC_PRO_API_KEY": secrets.coinmarketcapKey };

	request({ headers }, (error, _response, html) => {
		if (error) return log.error(error.stack);
		const json = JSON.parse(html);

		if (json.error) return { error: "Este Market Cap tá na xixada (down)" };

		let coinId = null;
		for (let i = 0; i < json.data.length; i++) {
			const coin = json.data[i];
			if (checkCoinName(data, coin)) {
				coinId = coin.id;
				break;
			}
		}

		if (coinId) {
			url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=${coinId}&&convert=EUR`;

			request({ headers, url }, (error, _response, html) => {
				if (error) return log.error(error.stack);
				const json = JSON.parse(html);

				if (json.error) return callback({ error: "Este Market Cap tá na xixada (down)" });


				const res = {
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
					volumeEur: json.data[coinId].quote.EUR.volume_24h
				};

				return callback(res);
			});
		}

		return callback({ error: "Essa moeda deve estar no xixo porque não a encontro" });
	});
};
