const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ChannelSchema = new Schema({
	name: { type: String, default: "" },
	channel: { type: String, default: "" },
	platform: { type: String, default: "" },
}, { timestamps: { createdAt: "_created", updatedAt: "_modified" } });

const Channel = mongoose.model("Channel", ChannelSchema);

module.exports = Channel;
