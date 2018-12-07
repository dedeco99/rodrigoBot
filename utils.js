var request=require("request");
var Jimp = require("jimp");

exports.checkForInsideJokes=function(msg,meta){
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

		return {isInsideJoke:true,msg:msg};
	}else{
		return {isInsideJoke:false};
	}
}

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

exports.define=function(msg,callback){
	var word=msg.content.split('define ')[1];
	var url="http://api.urbandictionary.com/v0/define?term="+word;

	request(url,function(error,response,html){
		if(error) console.log(error);
		var json=JSON.parse(html);

		if(json.list.length==0){
			var res={
				word:word,
				definition:"Não há definição para esta palavra",
				example:"Não há exemplo"
			};
		}else{
			var cleanString=function(string){
				return string.substring(0,255).replace(/\[/g,'').replace(/\]/g,'');
			}

			var example=cleanString(json.list[0].example);
			if(json.list[0].example=="") example="Não há exemplo";

			var res={
				word:word,
				definition:cleanString(json.list[0].definition),
				example:example
			};
		}
		callback(res);
	});
}

exports.procura=function(msg,callback){
	var topic=msg.content.split('procura ')[1];
	var res=[];
	var url="https://www.googleapis.com/customsearch/v1?q="+topic+"&cx=007153606045358422053:uw-koc4dhb8&key="+process.env.youtubeKey;

	request(url,function(error,response,html){
		if(error) console.log(error);
		var json=JSON.parse(html);
		for(var i=0;i<3;i++){
			res.push({
				topic:topic,
				title:json.items[i].title,
				link:json.items[i].link,
				description:json.items[i].snippet,
			});
		}
		callback(res);
	});
}

exports.responde=function(msg){
	if(msg.content.includes(" ou ")){
			var option1=msg.content.split(' ou ')[0].slice(8);
			var option2=msg.content.split(' ou ')[1].slice(0, -1);

			var num=Math.floor(Math.random()>=0.5);
			if(num){
					msg.channel.send(option1);
			}else{
					msg.channel.send(option2);
			}
	}else{
			var num=Math.floor(Math.random()>=0.5);
			if(num){
					msg.channel.send("Sim");
			}else{
					msg.channel.send("Não");
			}
	}
}
