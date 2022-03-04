const axios = require("axios");
const https = require("https");

async function api({ method, url, data, headers = {} }) {
	try {
		const res = await axios.request({
			method,
			url,
			data,
			headers,
			httpsAgent: new https.Agent({ rejectUnauthorized: false }),
		});

		return {
			status: res.status,
			data: res.data,
		};
	} catch (e) {
		return {
			status: e.response.status,
			data: e.response.data,
		};
	}
}

module.exports = { api };
