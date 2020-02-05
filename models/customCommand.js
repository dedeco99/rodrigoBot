const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CustomCommandSchema = new Schema({
	word: { type: String, default: "" },
	message: { type: String, default: "" },
});

const CustomCommand = mongoose.model("CustomCommand", CustomCommandSchema);

module.exports = CustomCommand;
