const { getInsideJokes, postInsideJoke, putInsideJoke, deleteInsideJoke } = require("./database");

const checkIfJokeInDatabase = async (query) => {
	const insideJokes = await getInsideJokes(query);

	return insideJokes.length > 0 ? { "exists": true, "id": insideJokes[0]._id } : false;
};

const addInsideJoke = async (msg) => {
	const params = msg.content.split("add ")[1];
	const word = params.split(";")[0];
	const message = params.split(";")[1];
	console.log(word, message);

	const { exists, id } = await checkIfJokeInDatabase({ word });
	if (exists) {
		putInsideJoke(id, { message });
	} else {
		postInsideJoke({ word, message });
	}

	return "Piada adicionada com sucesso my dude";
};

const removeInsideJoke = async (msg) => {
	const word = msg.content.split("remove ")[1];

	const { exists, id } = await checkIfJokeInDatabase({ word });

	if (exists) {
		deleteInsideJoke(id);
		return "Piada removido com sucesso my dude";
	}

	return "Essa piada deve estar no xixo porque não o encontro";
};

const checkIfFile = (insideJoke) => {
	if (insideJoke.message.includes("./assets/")) {
		return { "file": insideJoke.message };
	}

	return insideJoke.message;
};

const checkForInsideJokes = async (msg) => {
	const insideJokes = await getInsideJokes();

	for (const insideJoke of insideJokes) {
		if (msg.content.includes(insideJoke.word)) {
			return checkIfFile(insideJoke);
		}
	}
};

exports.checkForCommand = async (msg) => {
	const features = [
		{ command: "add", func: addInsideJoke },
		{ command: "remove", func: removeInsideJoke }
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
};
