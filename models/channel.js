const mongoose = require("mongoose");

const Schema = mongoose.Schema;

exports.Model = new Schema({
	name: { type: String, default: "" },
	channel: { type: String, default: "" },
	platform: { type: String, default: "" }
});
