const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const LogSchema = new Schema({
	status: { type: String, default: "" },
	data: { type: Object, default: null },
});

const Log = mongoose.model("Log", LogSchema);

module.exports = Log;
