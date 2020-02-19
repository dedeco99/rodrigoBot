const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SubredditSchema = new Schema({
	guild: { type: String, required: true },
	name: { type: String, default: "" },
	subreddits: { type: String, default: "" },
}, { timestamps: { createdAt: "_created", updatedAt: "_modified" } });

const Subreddit = mongoose.model("Channel", SubredditSchema);

module.exports = Subreddit;
