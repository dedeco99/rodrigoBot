exports.checkForInsideJokes = (msg, meta, callback) => {
	var insideJoke = null;

	for(var i = 0; i < meta.insidejokes.length; i++){
		if(msg.content.includes(meta.insidejokes[i].word)){
			insideJoke = meta.insidejokes[i];
			break;
		}
	}

	if(insideJoke){
		var message;

		if(insideJoke.message.includes("./assets/")){
			message = {"file": insideJoke.message};
		}else{
			message = insideJoke.message;
		}

		callback({isInsideJoke: true, msg: message});
	}else{
		callback({isInsideJoke: false});
	}
};
