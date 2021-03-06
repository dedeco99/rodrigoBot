const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MetaSchema = new Schema({
	action: {
		type: { type: String, default: "PLAYING" },
		message: { type: String, default: "" },
	},
	likes: { type: Number, default: 0 },
	dislikes: { type: Number, default: 0 },
}, { timestamps: { createdAt: "_created", updatedAt: "_modified" } });

const Meta = mongoose.model("Meta", MetaSchema);

module.exports = Meta;
