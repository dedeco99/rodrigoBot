const request = require("request");

const secrets = require("./secrets");
const log = require("./log");

const getMeta = () => {
	return new Promise(res => {
		const url = `https://api.mlab.com/api/1/databases/rodrigo/collections/meta?apiKey=${secrets.databaseKey}`;

		request(url, (error, response, html) => {
			if (error) return log.error(error.stack);
			const json = JSON.parse(html);

			return res(json[0]);
		});
	});
};

const updateMeta = async (obj) => {
	const meta = await getMeta();

	return new Promise(res => {
		const url = `https://api.mlab.com/api/1/databases/rodrigo/collections/meta?apiKey=${secrets.databaseKey}`;

		const body = {
			action: obj.action ? obj.action : meta.action,
			likes: obj.likes ? meta.likes + 1 : meta.likes,
			dislikes: obj.dislikes ? meta.dislikes + 1 : meta.dislikes
		};

		request.put({ url, body, json: true }, error => {
			if (error) return log.error(error.stack);

			return res(meta);
		});
	});
};

module.exports = {
	getMeta,
	updateMeta
};
