const InsideJoke = require("./models/insideJoke");

async function checkIfJokeInDatabase(query) {
	const insideJokes = await InsideJoke.find(query);

	return insideJokes.length > 0 ? { "exists": true, "id": insideJokes[0]._id } : false;
}

async function addInsideJoke(msg) {
	const params = msg.content.split("add ")[1];
	const word = params.split(";")[0];
	const message = params.split(";")[1];

	const { exists, id } = await checkIfJokeInDatabase({ word });
	if (exists) {
		await InsideJoke.updateOne({ _id: id }, { message });
	} else {
		const newInsideJoke = new InsideJoke({ word, message });

		await newInsideJoke.save();
	}

	return "Piada adicionada com sucesso my dude";
}

async function removeInsideJoke(msg) {
	const word = msg.content.split("remove ")[1];

	const { exists, id } = await checkIfJokeInDatabase({ word });

	if (exists) {
		await InsideJoke.deleteOne({ _id: id });
		return "Piada removido com sucesso my dude";
	}

	return "Essa piada deve estar no xixo porque não o encontro";
}

function checkIfFile(insideJoke) {
	if (insideJoke.message.includes("./assets/")) {
		return { "file": insideJoke.message };
	}

	return insideJoke.message;
}

async function checkForInsideJokes(msg) {
	const insideJokes = await InsideJoke.find();

	for (const insideJoke of insideJokes) {
		if (msg.content.includes(insideJoke.word)) {
			return checkIfFile(insideJoke);
		}
	}

	return null;
}

async function checkForCommand(msg) {
	const features = [
		{ command: "add", func: addInsideJoke },
		{ command: "remove", func: removeInsideJoke },
	];

	const command = msg.content.split(" ")[2];
	const feature = features.find(feature => feature.command === command);

	let res = null;
	if (feature) {
		res = await feature.func(msg);
	} else {
		res = await checkForInsideJokes(msg);
	}

	return res;
}

module.exports = {
	checkForCommand,
};
