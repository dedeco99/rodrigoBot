const { get } = require("../utils/request");

// FIXME: Not working
async function getAmazonPrice() {
	/*
	let thing = msg.split("price ")[1];
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

async function getCryptoPrice(options) {
	const coinSelected = options.coin;
	let response = null;

	let url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/map";
	const headers = { "X-CMC_PRO_API_KEY": process.env.coinmarketcapKey };

	let res = await get(url, headers);
	let json = res.data;

	let coinId = null;
	for (const coin of json.data) {
		if (
			coinSelected.charAt(0).toUpperCase() + coinSelected.slice(1) === coin.name ||
			coinSelected.toUpperCase() === coin.symbol
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

		return response;
	}

	return "Essa moeda deve estar no xixo porque não a encontro";
}

module.exports = {
	getAmazonPrice,
	getCryptoPrice,
};
