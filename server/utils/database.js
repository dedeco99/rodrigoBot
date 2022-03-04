const { connect } = require("mongoose");

const Meta = require("../models/meta");

connect(process.env.databaseConnectionString, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

/* Meta */

function getMetadata() {
	return Meta.findOne();
}

async function updateMetadata(obj) {
	let body = obj;
	if (obj.likes) {
		body = { $inc: { likes: 1 } };
	} else if (obj.dislikes) {
		body = { $inc: { dislikes: 1 } };
	}

	const meta = await Meta.findOneAndUpdate({}, body, { new: true });

	return meta;
}

module.exports = {
	getMetadata,
	updateMetadata,
};
