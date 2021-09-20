const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CustomCommandSchema = new Schema({
	guild: { type: String, required: true },
	word: { type: String, default: "" },
	message: { type: String, default: "" },
}, { timestamps: { createdAt: "_created", updatedAt: "_modified" } });

const CustomCommand = mongoose.model("CustomCommand", CustomCommandSchema);

module.exports = CustomCommand;
