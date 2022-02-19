const nodeCron = require("node-cron");

const Cronjob = require("../models/cronjob");

async function cronjobScheduler(toSchedule) {
	let scheduledCronjobs = toSchedule;
	if (!scheduledCronjobs) {
		global.cronjobs = [];

		scheduledCronjobs = await Cronjob.find({ active: true }).lean();
	}

	for (const cronjob of scheduledCronjobs) {
		const task = nodeCron.schedule(cronjob.cron, async () => {
			global.callback(
				cronjob.room,
				cronjob.command
					? { command: cronjob.command, options: cronjob.options }
					: ["reminder", "birthday"].includes(cronjob.type)
					? `<@${cronjob.user}> ${cronjob.message}`
					: cronjob.message,
			);

			if (cronjob.type === "reminder") {
				await Cronjob.updateOne({ _id: cronjob._id }, { active: false });

				task.stop();
			}
		});

		global.cronjobs.push({ _id: cronjob._id, task });
	}
}

async function addCronjob(options) {
	const { type, cron, message, room, user } = options;

	if (!nodeCron.validate(cron)) return false;

	const cronjob = await Cronjob.findOne({
		type,
		cron,
		message,
		room,
		user,
	});

	if (cronjob) return false;

	const newCronjob = new Cronjob({
		type,
		cron,
		message,
		room,
		user,
	});

	await newCronjob.save();

	await cronjobScheduler([newCronjob]);

	return true;
}

async function removeCronjob(msg) {
	const name = msg.content.split(" ")[3];

	await Cronjob.deleteOne({ name });

	return true;
}

async function getCronjobs(msg) {
	let cronjobs = await Cronjob.find({ room: msg.channel.id }).sort({ name: 1 });

	cronjobs = cronjobs.map(cronjob => cronjob.name).join(" | ");

	return cronjobs;
}

async function handleCronjobs(callback) {
	global.callback = callback;

	// TODO: notifications
	/*
	nodeCron.schedule("0/20 * * * *", async () => {
		const notification = await youtube.fetchNotifications();
		if (notification) return global.callback("525343734746054657", notification);

		notification = await twitch.fetchNotifications();
		if (notification) client.channels.cache.get("525343734746054657").send(notification);
	});
	*/

	await cronjobScheduler();
}

module.exports = {
	addCronjob,
	handleCronjobs,
};
