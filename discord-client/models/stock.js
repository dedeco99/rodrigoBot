const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const StockSchema = new Schema(
	{
		link: { type: String },
		stock: { type: String },
	},
	{ timestamps: { createdAt: "_created", updatedAt: "_modified" } },
);

const Stock = mongoose.model("Stock", StockSchema);

module.exports = Stock;
