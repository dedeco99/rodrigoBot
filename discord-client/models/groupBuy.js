const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const GroupBuySchema = new Schema(
	{
		name: { type: String },
		type: { type: String },
		image: { type: String },
		startDate: { type: String },
		endDate: { type: String },
		pricing: { type: String },
		saleType: { type: String },
		link: { type: String },
	},
	{ timestamps: { createdAt: "_created", updatedAt: "_modified" } },
);

const GroupBuy = mongoose.model("GroupBuy", GroupBuySchema);

module.exports = GroupBuy;
