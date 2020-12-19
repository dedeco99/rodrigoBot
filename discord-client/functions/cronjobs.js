const cron = require("node-cron");

const youtube = require("./youtube");
// const twitch = require("./twitch");

const Birthday = require("../models/birthday");
const Cronjob = require("../models/cronjob");

async function addCronjob(msg) {
	const message = msg.content.split("add ")[1];
	const [name, cronString, command] = message.split(";");

	// TODO: validate cron string (cron.validate(cron);)

	const cronjob = await Cronjob.findOne({
		name,
		cron: cronString,
		message: command,
		room: msg.channel.id,
	});

	if (cronjob) return "Esse cronjob já existe seu lixo";

	const newCronjob = new Cronjob({
		name,
		cron: cronString,
		message: command,
		room: msg.channel.id,
	});

	await newCronjob.save();

	// TODO: start cronjob

	return "Cronjob adicionado com sucesso";
}

async function removeCronjob(msg) {
	const name = msg.content.split(" ")[3];

	await Cronjob.deleteOne({ name });

	return "Cronjob removido com sucesso";
}

async function getCronjobs(msg) {
	let cronjobs = await Cronjob.find({ room: msg.channel.id }).sort({ name: 1 });

	cronjobs = cronjobs.map(cronjob => cronjob.name).join(" | ");

	return cronjobs;
}

async function runCronjobs(checkForCommand, customCommands) {
	cron.schedule("0 8 * * *", async () => {
		const birthdays = await Birthday.find({
			$expr: {
				$and: [
					{ $eq: [{ $dayOfMonth: "$date" }, { $dayOfMonth: new Date() }] },
					{ $eq: [{ $month: "$date" }, { $month: new Date() }] },
				],
			},
		});

		for (const birthday of birthdays) {
			global.client.channels.cache.get(birthday.room).send(`Parabéns ${birthday.person}`);
		}
	});

	cron.schedule("0/20 * * * *", async () => {
		const notification = await youtube.fetchNotifications();
		if (notification) global.client.channels.cache.get("525343734746054657").send(notification);

		/*
		notification = await twitch.fetchNotifications();
		if (notification) client.channels.cache.get("525343734746054657").send(notification);
		*/
	});

	const cronjobs = await Cronjob.find({}).lean();

	for (const cronjob of cronjobs) {
		cron.schedule(cronjob.cron, async () => {
			if (cronjob.message.toLowerCase().includes("rodrigo")) {
				await checkForCommand({ content: cronjob.message }, cronjob.room);
			} else {
				global.client.channels.cache.get(cronjob.room).send(cronjob.message);
			}
		});
	}
}

function checkForCronjob(msg) {
	const features = [
		{ command: "add", func: addCronjob },
		{ command: "remove", func: removeCronjob },
		{ command: "get", func: getCronjobs },
	];

	const command = msg.content.split(" ")[2];
	const feature = features.find(f => f.command === command);

	try {
		if (feature) return feature.func(msg);
	} catch (err) {
		return err.message;
	}

	return null;
}

module.exports = {
	runCronjobs,
	checkForCronjob,
};
