const axios = require("axios");
const https = require("https");

async function get(url, headers = {}) {
	const config = { headers, httpsAgent: new https.Agent({ rejectUnauthorized: false }) };

	try {
		const response = await axios.get(url, config);

		return {
			status: response.status,
			data: response.data,
		};
	} catch (error) {
		return {
			status: error.response.status,
			data: error.response.data,
		};
	}
}

async function post(url, body, headers = {}) {
	const config = { headers };

	try {
		const response = await axios.post(url, body, config);

		return {
			status: response.status,
			data: response.data,
		};
	} catch (error) {
		return {
			status: error.response.status,
			data: error.response.data,
		};
	}
}

module.exports = {
	get,
	post,
};
