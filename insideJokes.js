const checkIfFile = (insideJoke) => {
	if (insideJoke.message.includes("./assets/")) {
		return { "file": insideJoke.message };
	}

	return insideJoke.message;
};

const meta = {
	insideJokes: [
		{
			"word": "carne",
			"message": "./assets/img/cuttingmeat.jpg"
		},
		{
			"word": "portatil",
			"message": "*appears to have extreme PTSD and starts convulsing on the floor*"
		},
		{
			"word": "guilherme",
			"message": "O guilherme é o melhor admin deste regime fascista ao qual chamamos discord"
		},
		{
			"word": "autista",
			"message": "*touches face until it starts to bleed*"
		},
		{
			"word": "retardado",
			"message": "*face twitches and begins to form a crooked smile*"
		},
		{
			"word": "remember pedro",
			"message": "./assets/img/memoria.png"
		},
		{
			"word": "amigos",
			"message": "Eu tenho bastantes amigos a quem eu dou a mão"
		},
		{
			"word": "hack",
			"message": "Não compreendo. As pessoas que hackeiam chamam-se hackers?"
		},
		{
			"word": "teclado",
			"message": "*starts screaming and hitting his head on the wall*"
		}
	]
};

exports.checkForInsideJokes = (msg, callback) => {
	let isInsideJoke = false;
	let insideJoke = null, message = null;

	for (let i = 0; i < meta.insidejokes.length; i++) {
		if (msg.content.includes(meta.insidejokes[i].word)) {
			isInsideJoke = true;
			insideJoke = meta.insidejokes[i];
			break;
		}
	}

	if (insideJoke) {
		message = checkIfFile(insideJoke);
	} else {
		isInsideJoke = false;
	}

	return callback({ isInsideJoke, msg: message });
};
