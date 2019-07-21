var fs = require("fs");

var checkIfFile = (insideJoke) => {
	if (insideJoke.message.includes("./assets/")) {
		return { "file": insideJoke.message };
	} else {
		return insideJoke.message;
	}
};

var meta = {};

fs.readFile("meta.json", "utf8", (err, data) => {
	if (err) throw err;
	meta = JSON.parse(data);
});

exports.checkForInsideJokes = (msg, callback) => {
	var isInsideJoke = false;
	var insideJoke, message;

	for (var i = 0; i < meta.insidejokes.length; i++) {
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

	callback({ isInsideJoke, msg: message });
};
