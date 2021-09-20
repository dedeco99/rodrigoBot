const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const LogSchema = new Schema({
	status: { type: String, default: "" },
	data: { type: Object, default: null },
}, { timestamps: { createdAt: "_created", updatedAt: "_modified" } });

const Log = mongoose.model("Log", LogSchema);

module.exports = Log;
