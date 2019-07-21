const mongoose = require("mongoose");

const Schema = mongoose.Schema;

exports.Model = new Schema({
	video: { type: String, default: "" }
});
