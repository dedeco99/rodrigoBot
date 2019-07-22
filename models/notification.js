const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
	video: { type: String, default: "" }
});

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = Notification;
