const moment = require("moment");

const Birthday = require("./models/birthday");

async function addBirthday(msg) {
	const person = msg.content.split(" ")[3];
	const date = msg.content.split(" ")[4];

	const birthday = await Birthday.findOne({ person, room: msg.channel.id });

	if (birthday) return "Esse aniversário já existe seu lixo";

	const newBirthday = new Birthday({
		person,
		date: moment(date, "DD-MM-YYYY"),
		room: msg.channel.id,
	});

	await newBirthday.save();

	return "Aniversário adicionado com sucesso";
}

async function removeBirthday(msg) {
	const person = msg.content.split(" ")[3];

	await Birthday.deleteOne({ person });

	return "Aniversário removido com sucesso";
}

async function getBirthdays(msg) {
	let birthdays = await Birthday.find({ room: msg.channel.id }).sort({ name: 1 });

	birthdays = birthdays.map((birthday) => {
		return `${birthday.person} (${moment(birthday.date).format("DD-MM-YYYY")})`;
	}).join(" | ");

	return birthdays;
}

function checkForBirthday(msg) {
	const features = [
		{ command: "add", func: addBirthday },
		{ command: "remove", func: removeBirthday },
		{ command: "get", func: getBirthdays },
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
	checkForBirthday,
};
