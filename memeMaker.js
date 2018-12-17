var Jimp = require("jimp");

exports.checkForMemes=function(msg,callback){
	var memes=[{name:"truth",position0:{x:250,y:750,max:200}},{name:"safe",position0:{x:350,y:100,max:200}},{name:"drake",position0:{x:400,y:100,max:200},position1:{x:400,y:400,max:200}},{name:"facts",position0:{x:20,y:350,max:200}},{name:"button",position0:{x:100,y:220,max:150}},{name:"choice",position0:{x:100,y:125,max:100},position1:{x:300,y:75,max:100}},{name:"marioluigi",position0:{x:375,y:100,max:100},position1:{x:175,y:375,max:200},position2:{x:400,y:375,max:200}},{name:"pikachu",position0:{x:10,y:10,max:700}}];

	for(var i=0; i<memes.length; i++){
		if(msg.content.includes(" "+memes[i].name+" ")){
			makeMeme(msg,memes[i],function(meme){
				callback({isMeme:true,msg:meme});
			});
			break;
		}
		if(memes.length-1===i) callback({isMeme:false});
	}
}

var makeMeme=function(msg,meme,callback){
	var message=msg.content.split(meme.name)[1];
	message=message.split(";");

	var fileName = "./assets/img/memes/templates/"+meme.name+".jpg";
	var loadedImage;

	Jimp.read(fileName)
	.then(function (image) {
		loadedImage = image;
		return Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
	})
	.then(function (font) {
		if(meme.name=="pikachu"){
			var sum=0;
			for(var i=0;i<message.length;i++){
				loadedImage.print(font, meme.position0.x,meme.position0.y+sum, message[i], meme.position0.max)
				.write("./assets/img/memes/"+meme.name+".jpg");
				sum+=50;
			}
		}else{
			for(var i=0;i<message.length;i++){
					loadedImage.print(font, meme["position"+i].x,meme["position"+i].y, message[i], meme["position"+i].max)
					.write("./assets/img/memes/"+meme.name+".jpg");
			}
		}
	})
	.then(function () {
		callback({"file":"./assets/img/memes/"+meme.name+".jpg"});
	})
	.catch(function (err) {
		console.error(err);
	});
}
