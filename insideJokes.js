var checkIfFile = (insideJoke) => {
	if(insideJoke.message.includes("./assets/")){
		return {"file": insideJoke.message};
	}else{
		return insideJoke.message;
	}
};

exports.checkForInsideJokes = (msg, meta, callback) => {
	var isInsideJoke = false;
	var insideJoke, message;

	for(var i = 0; i < meta.insidejokes.length; i++){
		if(msg.content.includes(meta.insidejokes[i].word)){
			isInsideJoke = true;
			insideJoke = meta.insidejokes[i];
			break;
		}
	}

	if(insideJoke){
		message = checkIfFile(insideJoke);
	}else{
		isInsideJoke = false;
	}

	callback({isInsideJoke, msg: message});
};
