const request = require("request");

const secrets = require("./secrets");

exports.getMeta = () => {
	const url = `https://api.mlab.com/api/1/databases/rodrigo/collections/meta?apiKey=${secrets.databaseKey}`;

	request(url, (error, response, html) => {
		if (error) console.log(error);
		const json = JSON.parse(html);

		secrets.meta = JSON.stringify(json[0]);
	});
};

exports.updateMeta = (obj) => {
	const meta = JSON.parse(secrets.meta);
	const url = `https://api.mlab.com/api/1/databases/rodrigo/collections/meta/${meta._id.$oid}?apiKey=${secrets.databaseKey}`;

	const body = {
		"action": obj.action ? obj.action : meta.action,
		"likes": obj.likes ? obj.likes : meta.likes,
		"dislikes": obj.dislikes ? obj.dislikes : meta.dislikes
	};

	request.put({ url, body, json: true }, (error, response, html) => {
		if (error) console.log(error);
		const json = html;

		secrets.meta = JSON.stringify(json);
	});
};
