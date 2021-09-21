const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CronjobSchema = new Schema(
	{
		name: { type: String },
		cron: { type: String },
		message: { type: String },
		command: { type: String },
		options: { type: Object },
		room: { type: String },
	},
	{ timestamps: { createdAt: "_created", updatedAt: "_modified" } },
);

const Cronjob = mongoose.model("Cronjob", CronjobSchema);

module.exports = Cronjob;
