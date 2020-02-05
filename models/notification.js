const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
	video: { type: String, default: "" },
	startedAt: { type: Date, default: "" },
}, { timestamps: { createdAt: "_created", updatedAt: "_modified" } });

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = Notification;
