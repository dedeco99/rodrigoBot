const mongoose = require("mongoose");

const Schema = mongoose.Schema;

exports.Model = new Schema({
	action: { type: String, default: "" },
	likes: { type: Number, default: 0 },
	dislikes: { type: Number, default: 0 }
});
