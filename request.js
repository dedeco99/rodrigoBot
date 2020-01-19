const request = require("request");

const log = require("./log");

function get(url, headers) {
	return new Promise((res) => {
		const send = { url };

		if (headers) send.headers = headers;

		request(send, (error, response, html) => {
			if (error) return log.error(error.stack);

			return res(html);
		});
	});
}

function post(url, headers, body) {
	return new Promise((res) => {
		const send = { url };

		if (headers) send.headers = headers;
		if (body) send.body = body;

		request.post(send, (error, response, html) => {
			if (error) return log.error(error.stack);

			return res(html);
		});
	});
}

module.exports = {
	get,
	post,
};
