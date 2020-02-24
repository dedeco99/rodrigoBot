const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BirthdaySchema = new Schema({
	person: { type: String, default: "" },
	date: { type: Date },
	room: { type: String },
}, { timestamps: { createdAt: "_created", updatedAt: "_modified" } });

const Birthday = mongoose.model("Birthday", BirthdaySchema);

module.exports = Birthday;
