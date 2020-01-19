const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const InsideJokeSchema = new Schema({
	word: { type: String, default: "" },
	message: { type: String, default: "" },
});

const InsideJoke = mongoose.model("InsideJoke", InsideJokeSchema);

module.exports = InsideJoke;
