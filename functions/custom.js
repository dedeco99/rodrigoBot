const CustomCommand = require("../models/customCommand");

async function addCustomCommand(msg) {
	const params = msg.content.split("add ")[1];
	const word = params.split(";")[0].trim();
	const message = params.split(";")[1].trim();

	const customCommand = await CustomCommand.findOne({ guild: msg.guild.id, word });

	if (customCommand) {
		await CustomCommand.updateOne({ _id: customCommand._id }, { message });
	} else {
		const newCustomCommand = new CustomCommand({ guild: msg.guild.id, word, message });

		await newCustomCommand.save();
	}

	return "Comando adicionado com sucesso my dude";
}

async function removeCustomCommand(msg) {
	const word = msg.content.split("remove ")[1];

	const customCommand = await CustomCommand.findOne({ guild: msg.guild.id, word });

	if (customCommand) {
		await CustomCommand.deleteOne({ _id: customCommand._id });
		return "Comando removido com sucesso my dude";
	}

	return "Esse comando deve estar no xixo porque não o encontro";
}

function checkForCommand(msg) {
	const features = [
		{ command: "add", func: addCustomCommand },
		{ command: "remove", func: removeCustomCommand },
	];

	const customCommand = msg.content.split(" ")[2];

	const feature = features.find(f => f.command === customCommand);

	if (feature) return feature.func(msg);

	return null;
}

module.exports = {
	checkForCommand,
};
