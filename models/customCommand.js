const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CustomCommandSchema = new Schema({
	word: { type: String, default: "" },
	message: { type: String, default: "" },
}, { timestamps: { createdAt: "_created", updatedAt: "_modified" } });

const CustomCommand = mongoose.model("CustomCommand", CustomCommandSchema);

module.exports = CustomCommand;
