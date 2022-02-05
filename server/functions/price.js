const yahooFinance = require("yahoo-finance2").default;
const dayjs = require("dayjs");

const { api } = require("../utils/request");
const { diff } = require("../utils/utils");

async function getExchangeRates(options) {
	const { base } = options;

	const url = `https://api.exchangerate.host/latest?base=${base || "EUR"}`;

	const res = await api({ method: "GET", url });

	return res.data.rates;
}

async function convert(options) {
	const { number, from, to } = options;

	const exchangeRates = await getExchangeRates({ base: from });

	return {
		status: 200,
		body: {
			message: "PRICE_CONVERT_SUCCESS",
			data: { number, from, to, convertedNumber: number * exchangeRates[to] },
		},
	};
}

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
}

async function getCryptoPrice(options) {
	const { symbol } = options;

	let useCache = true;
	let data = global.cache.crypto.data;

	//TODO: user currency should be changeable
	const cachedCoin = data.EUR ? data.EUR[symbol.toUpperCase()] : null;

	if (!cachedCoin || diff(cachedCoin.lastUpdate, "minutes") > 10) useCache = false;

	if (useCache) {
		data = data.EUR;
	} else {
		const headers = { "X-CMC_PRO_API_KEY": process.env.coinmarketcapKey };

		const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol.toUpperCase()}&convert=EUR`;

		const res = await api({ method: "get", url, headers });
		const json = res.data;

		if (res.status === 400) return { status: 404, body: { message: "GET_CRYPTO_PRICE_NOT_FOUND" } };
		if (res.status !== 200) return { status: 500, body: { message: "GET_CRYPTO_PRICE_DOWN" } };

		data = json.data;
	}

	const coin = data[symbol.toUpperCase()];

	coin.lastUpdate = Date.now();
	if (!global.cache.crypto.data.EUR) global.cache.crypto.data.EUR = {};
	global.cache.crypto.data.EUR[coin.symbol] = coin;

	return {
		status: 200,
		body: {
			message: "PRICE_CRYPTO_SUCCESS",
			data: {
				id: coin.id,
				name: coin.name,
				symbol: coin.symbol,
				image: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`,
				rank: coin.cmc_rank,
				dateAdded: coin.date_added,
				circulatingSupply: coin.circulating_supply,
				totalSupply: coin.total_supply,
				maxSupply: coin.max_supply,
				price: coin.quote.EUR.price,
				marketCap: coin.quote.EUR.market_cap,
				volume: coin.quote.EUR.volume_24h,
				change1h: coin.quote.EUR.percent_change_1h,
				change24h: coin.quote.EUR.percent_change_24h,
				change7d: coin.quote.EUR.percent_change_7d,
				change30d: coin.quote.EUR.percent_change_30d,
			},
		},
	};
}

async function getStockPrice(options) {
	const { symbol } = options;

	const quoteRes = await yahooFinance.quote(symbol);

	console.log(quoteRes);

	const exchangeRates = await getExchangeRates({ base: "EUR" });

	const historicalRes = await yahooFinance.historical(quoteRes.symbol, {
		period1: dayjs().subtract(1, "month").format("YYYY-MM-DD"),
	});

	const price =
		quoteRes.currency === "EUR"
			? quoteRes.regularMarketPrice
			: quoteRes.regularMarketPrice / exchangeRates[quoteRes.currency];

	const openPrice =
		quoteRes.currency === "EUR"
			? quoteRes.regularMarketOpen
			: quoteRes.regularMarketOpen / exchangeRates[quoteRes.currency];

	const weekPrice =
		quoteRes.currency === "EUR"
			? historicalRes[historicalRes.length - 7].close
			: historicalRes[historicalRes.length - 7].close / exchangeRates[quoteRes.currency];

	const monthPrice =
		quoteRes.currency === "EUR"
			? historicalRes[0].close
			: historicalRes[0].close / exchangeRates[quoteRes.currency];

	return {
		status: 200,
		body: {
			message: "PRICE_STOCK_SUCCESS",
			data: {
				id: quoteRes.symbol,
				name: quoteRes.shortName,
				symbol: quoteRes.symbol,
				image: `https://companiesmarketcap.com/img/company-logos/80/${quoteRes.symbol}.png`,
				price,
				marketCap: quoteRes.marketCap,
				volume: quoteRes.regularMarketVolume,
				change1h: ((price - openPrice) / openPrice) * 100,
				change24h: quoteRes.regularMarketChangePercent,
				change7d: ((price - weekPrice) / weekPrice) * 100,
				change30d: ((price - monthPrice) / monthPrice) * 100,
			},
		},
	};
}

module.exports = {
	convert,
	getAmazonPrice,
	getCryptoPrice,
	getStockPrice,
};
