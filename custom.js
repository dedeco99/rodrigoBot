const CustomCommand = require("./models/customCommand");

async function checkIfCommandInDatabase(query) {
	const customCommands = await CustomCommand.find(query);

	return customCommands.length > 0 ? { "exists": true, "id": customCommands[0]._id } : false;
}

async function addCustomCommand(msg) {
	const params = msg.content.split("add ")[1];
	const word = params.split(";")[0].trim();
	const message = params.split(";")[1].trim();

	const { exists, id } = await checkIfCommandInDatabase({ word });

	if (exists) {
		await CustomCommand.updateOne({ _id: id }, { message });
	} else {
		const newCustomCommand = new CustomCommand({ word, message });

		await newCustomCommand.save();
	}

	return "Comando adicionado com sucesso my dude";
}

async function removeCustomCommand(msg) {
	const word = msg.content.split("remove ")[1];

	const { exists, id } = await checkIfCommandInDatabase({ word });

	if (exists) {
		await CustomCommand.deleteOne({ _id: id });
		return "Comando removido com sucesso my dude";
	}

	return "Esse comando deve estar no xixo porque não o encontro";
}

function checkIfFile(command) {
	if (command.message.includes("./assets/")) {
		return { "file": command.message };
	}

	return command.message;
}

async function checkForCustomCommands(msg) {
	const customCommands = await CustomCommand.find();

	for (const customCommand of customCommands) {
		if (msg.content.includes(customCommand.word)) {
			return checkIfFile(customCommand);
		}
	}

	return null;
}

function checkForCommand(msg) {
	const features = [
		{ command: "add", func: addCustomCommand },
		{ command: "remove", func: removeCustomCommand },
	];

	const command = msg.content.split(" ")[2];

	const feature = features.find(feature => feature.command === command);

	if (feature) return feature.func(msg);

	return checkForCustomCommands(msg);
}

module.exports = {
	checkForCommand,
};
