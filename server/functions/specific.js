const cheerio = require("cheerio");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

const { addCronjob } = require("./cronjobs");

const { api } = require("../utils/request");

const GroupBuy = require("../models/groupBuy");
const Stock = require("../models/stock");

async function radars(options, page = 0, data = []) {
	const { location } = options;

	const url = `https://temporeal.radaresdeportugal.pt/extras/paginator.php?page=${page}`;

	const res = await api({ method: "get", url });
	const $ = cheerio.load(res.data);

	const response = data.concat(
		$(".panel")
			.toArray()
			.map(elem => {
				return {
					date: $(elem).find(".panel-heading p").text().trim(),
					location: $(elem).find(".panel-body h4").text(),
					description: $(elem).find(".panel-body .lead").text(),
				};
			}),
	);

	if (dayjs(response[response.length - 1].date, "DD/MM/YYYY").diff(dayjs(), "days") === 0) {
		return radars(options, page + 1, response);
	}

	function sanitizeString(str) {
		const newStr = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
		return newStr.trim();
	}

	const radarsByLocation = response.filter(radar => {
		return (
			dayjs(radar.date, "DD/MM/YYYY").diff(dayjs(), "days") === 0 &&
			sanitizeString(radar.location).toLowerCase() === sanitizeString(location).toLowerCase()
		);
	});

	const title = radarsByLocation.length
		? radarsByLocation[0].location.charAt(0).toUpperCase() + radarsByLocation[0].location.slice(1).toLowerCase()
		: location.charAt(0).toUpperCase() + location.slice(1).toLowerCase();

	return { status: 200, body: { message: "RADARS_SUCCESS", data: { location: title, radars: radarsByLocation } } };
}

async function corona(options) {
	const { country } = options;

	const url = "https://www.worldometers.info/coronavirus/";

	const res = await api({ method: "get", url });
	const $ = cheerio.load(res.data);

	const total = $(".maincounter-number")
		.toArray()
		.map(elem => $(elem).find("span").text());

	const countries = $("tr")
		.toArray()
		.map(elem => {
			return {
				country: $(elem).children().eq(1).text().trim(),
				totalCases: $(elem).children().eq(2).text().trim() || "0",
				newCases: $(elem).children().eq(3).text().trim() || "0",
				totalDeaths: $(elem).children().eq(4).text().trim() || "0",
				newDeaths: $(elem).children().eq(5).text().trim() || "0",
				totalRecovered: $(elem).children().eq(6).text().trim() || "0",
				activeCases: $(elem).children().eq(7).text().trim() || "0",
				seriousCases: $(elem).children().eq(8).text().trim() || "0",
				casesPer1M: $(elem).children().eq(9).text().trim() || "0",
				deathsPer1M: $(elem).children().eq(10).text().trim() || "0",
			};
		});

	const countryData = countries.find(e => e.country.toLowerCase() === country.toLowerCase());

	if (!countryData) return { status: 404, body: { message: "CORONA_COUNTRY_NOT_FOUND" } };

	return { status: 200, body: { message: "CORONA_SUCCESS", data: { total, country: countryData } } };
}

async function keyboards() {
	const res = await api({ method: "get", url: "https://mechgroupbuys.com/gb-data" });
	const json = res.data;

	const liveGroupBuys = json
		.filter(i => {
			return (
				(i.type === "keyboards" || i.type === "keycaps" || i.type === "switches") &&
				i.startDate &&
				dayjs(i.startDate, "M/D/YY").diff(dayjs(), "days") <= 0 &&
				(!i.endDate || dayjs(i.endDate, "M/D/YY").diff(dayjs(), "days") >= 0)
			);
		})
		.map(i => ({
			name: i.name,
			type: i.type,
			image: i.mainImage,
			startDate: dayjs(i.startDate, "M/D/YY").format("DD/MM/YYYY"),
			endDate: dayjs(i.endDate, "M/D/YY").format("DD/MM/YYYY"),
			pricing: i.pricing,
			saleType: i.saleType,
			link: encodeURI(`https://mechgroupbuys.com/${i.type}/${i.name}`),
		}));

	for (const groupBuy of []) {
		const groupBuyExists = await GroupBuy.findOne({ name: groupBuy.name });

		if (!groupBuyExists) {
			const newGroupBuy = new GroupBuy(groupBuy);

			//await newGroupBuy.save();

			return { status: 200, body: { message: "KEYBOARDS_SUCCESS", data: groupBuy } };
		}
	}

	return { status: 404, body: { message: "KEYBOARDS_NOT_FOUND" } };
}

// FIXME: Not working
// eslint-disable-next-line max-lines-per-function
async function stock(options) {
	const link = options.link;

	if (link) {
		if (link.includes("globaldata") || link.includes("chiptec") || link.includes("pcdiga")) {
			const stockExists = await Stock.findOne({ link }).lean();

			if (stockExists) return "Já existe";

			const stock = new Stock({ link });

			await stock.save();

			return "Link adicionado com sucesso";
		}

		return "Loja não é válida";
	}

	const stocks = await Stock.find({}).lean();

	const products = [];
	for (const stock of stocks) {
		const url = stock.link;

		const res = await api({ method: "get", url });
		const $ = cheerio.load(res.data);

		let shop = null;
		let title = null;
		let image = null;
		let stockMessage = null;
		let inStock = null;
		if (url.includes("globaldata")) {
			shop = "Globaldata";
			title = $(".page-title")
				.toArray()
				.map(elem => $(elem).find("span").text());
			title = title[0];
			image = $("#mtImageContainer")
				.toArray()
				.map(elem => $(elem).find("img").attr("src"));
			image = image[0];

			stockMessage = $(".stock-shops")
				.toArray()
				.map(elem => $(elem).find("span").first().text());
			stockMessage = stockMessage[0].trim();
			inStock = stockMessage !== "Esgotado";
		} else if (url.includes("chiptec")) {
			shop = "Chiptec";
			title = $(".prod_tit")
				.toArray()
				.map(elem => $(elem).find("h1").text());
			title = title[0];
			image = $(".product-image")
				.toArray()
				.map(elem => $(elem).find("img").attr("src"));
			image = image[0];

			stockMessage = $(".amstockstatus")
				.toArray()
				.map(elem => $(elem).text());
			stockMessage = stockMessage[0].trim();
			inStock = stockMessage === "Disponível";
		} else if (url.includes("pcdiga")) {
			shop = "PCDiga";
			title = $(".item.product")
				.toArray()
				.map(elem => $(elem).find("strong").text());
			title = title[0];
			image = $(".gallery-placeholder__image")
				.toArray()
				.map(elem => $(elem).attr("src"));
			image = image[0];

			const index = res.data.indexOf("'is_in_stock': ");
			stockMessage = res.data.substring(index + 15, index + 16);
			inStock = stockMessage === "1";
			stockMessage = inStock ? "Em Stock" : "Esgotado";
		}

		if (stock.stock !== stockMessage) {
			await Stock.updateOne({ _id: stock._id }, { stock: stockMessage });

			if (inStock) products.push({ shop, title, url, image, stockMessage });
		}
	}

	return products.length ? products : null;
}

async function reminder(options) {
	const { reminder, room, user } = options;
	const date = dayjs(`${options.date} ${options.time}`, "DD-MM-YYYY HH:mm");

	if (!date.isValid()) return { status: 400, body: { message: "REMINDER_INVALID_DATE" } };
	if (date.diff(dayjs(), "minutes") < 0) return { status: 400, body: { message: "REMINDER_IN_PAST" } };

	const cron = `${date.minute()} ${date.hour()} ${date.date()} ${date.month() + 1} *`;

	const response = await addCronjob({ type: "reminder", cron, message: reminder, room, user });

	if (!response) return { status: 400, body: { message: "REMINDER_EXISTS" } };

	return { status: 200, body: { message: "REMINDER_SUCCESS", data: "REMINDER_SUCCESS" } };
}

async function birthday(options) {
	const { user, room } = options;
	const date = dayjs(`${options.date} 08:00`, "DD-MM HH:mm");

	if (!date.isValid()) return { status: 400, body: { message: "REMINDER_INVALID_DATE" } };

	const cron = `${date.minute()} ${date.hour()} ${date.date()} ${date.month() + 1} *`;

	const response = await addCronjob({ type: "birthday", cron, message: "Parabéns :partying_face:", room, user });

	if (!response) return { status: 400, body: { message: "REMINDER_EXISTS" } };

	return { status: 200, body: { message: "REMINDER_SUCCESS", data: "REMINDER_SUCCESS" } };
}

module.exports = {
	radars,
	corona,
	keyboards,
	stock,
	reminder,
	birthday,
};
