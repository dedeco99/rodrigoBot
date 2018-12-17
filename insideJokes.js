exports.checkForInsideJokes=function(msg,meta,callback){
	var insideJoke=null;

	for(var i=0; i<meta.insidejokes.length; i++){
		if(msg.content.includes(meta.insidejokes[i].word)){
			insideJoke=meta.insidejokes[i];
			break;
		}
	}

	if(insideJoke){
		var msg;
		if(insideJoke.message.includes("./assets/")) msg={"file":insideJoke.message};
		else msg=insideJoke.message;

		callback({isInsideJoke:true,msg:msg});
	}else{
		callback({isInsideJoke:false});
	}
}
