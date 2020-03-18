const Cronjob = require("./models/cronjob");

async function addCronjob(msg) {
	const message = msg.content.split("add ")[1];
	const [name, cron, command] = message.split(";");

	// TODO: validate cron string (cron.validate(cron);)

	const cronjob = await Cronjob.findOne({ name, cron, message: command, room: msg.channel.id });

	if (cronjob) return "Esse cronjob já existe seu lixo";

	const newCronjob = new Cronjob({
		name,
		cron,
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
	checkForCronjob,
};
