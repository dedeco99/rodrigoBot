var request=require("request");
var cheerio=require("cheerio");
var ytdl = require("ytdl-core");
var crypto=require("./crypto");
var embed=require("./embed");

exports.checkForUtils=function(msg,callback){
	var isUtil=true;

	if(msg.content.includes("define")){
    define(msg,function(res){
      embed.createDefineEmbed(msg,res);
    });
  }else if(msg.content.includes("procura")){
    procura(msg,function(res){
      embed.createSearchEmbed(msg,res);
    });
  }else if(msg.content.includes("getvote")){
    getvote(msg);
  }else if(msg.content.includes("vote")){
    vote(msg,function(res){
      embed.createPollEmbed(msg,res);
    });
  }else if(msg.content.includes("music")){
    music(msg);
  }else if(msg.content.includes("price")){
		amazon(msg);
	}else if(msg.content.includes("probabilidade")){
    var num=Math.floor(Math.random()*100);
    msg.channel.send("Cerca de "+num+"%");
  }else if(msg.content.includes("math")){
		var expression=msg.content.split("math ")[1];
		var result=eval(expression);
    msg.channel.send("Resultado: "+result);
	}else if(msg.content.includes("clever")){
    cleverbot.getReply({
        input: msg.content
    }, (error, response) => {
        if(error) throw error;
        msg.channel.send(response.output);
    });
  }else if(msg.content.includes("?")){
      responde(msg);
  }else if(msg.content.includes("crypto")){
    var coin=msg.content.split('crypto ')[1];
    crypto.getPrice(coin,function(res){
      if(res.error) msg.channel.send(res.error);
      else embed.createCryptoEmbed(msg,res);
    });
  }else{
		isUtil=false;
	}

	callback({isUtil:isUtil,msg:msg});
}

var define=function(msg,callback){
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

var procura=function(msg,callback){
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

var responde=function(msg){
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

var vote=function(msg,callback){
	var message=msg.content.split('vote ')[1];
	var options=message.split(";");
	var title=options[0];
	options.splice(0, 1);

	var res={
		title: title,
		options: options
	};

	callback(res);
}

var getvote=function(msg,callback){
	var poll=msg.content.split('getvote ')[1];

	msg.channel.fetchMessage(poll)
	  .then(function(message){
			var i=0;
			message.reactions.forEach(function(reaction) {
				reaction.fetchUsers().then(function(users){
					var userRes="";
					users.forEach(function(user) {
						userRes+=user.username+" | ";
					});
					msg.channel.send(reaction._emoji.name+": "+reaction.count+" votos"+"("+userRes+")");
					i++;
				});
			});
		})
	  .catch(console.error);

	//callback(res);
}

var music=function(msg){
	var params=msg.content.split('music ')[1];

	if(params.includes('pause')){
		dispatcher.pause();
	}else if(params.includes('resume')){
		dispatcher.resume();
	}else if(params.includes('end')){
		dispatcher.end();
	}else{
		if(msg.member.voiceChannel){
			msg.member.voiceChannel.join().then(connection=>{
				const stream=ytdl(params,{filter:'audioonly'});
				const streamOptions={seek:0,volume:0.5};
				dispatcher=connection.playStream(stream,streamOptions);

				dispatcher.on('end', () => {
					msg.member.voiceChannel.leave();
				});
			}).catch(console.log);
		}else{
			msg.reply('Vai para um canal de voz primeiro sua xixada!');
		}
	}
}

var amazon=function(msg){
	var thing=msg.content.split('price ')[1];
	thing=thing.replace(/ /g,"%20");
	var url="https://www.amazon.es/s?field-keywords="+thing;

	request(url, function(error, response, html){
		var $ = cheerio.load(html);
    var res = [];
		thing=thing.replace(/%20/g," ");

    $("html").find('.a-link-normal.s-access-detail-page.s-color-twister-title-link.a-text-normal').each(function (index, element) {
			if(index!=0 && index!=1 && index<7){
	      var productUrl = $(this)[0].attribs.href;
				var product = $(this)[0].attribs.title.substring(0,50)+"...";
				res.push({search:thing,url:url,productUrl:productUrl,product:product});
			}
    });

		$("html").find('.a-size-base.a-color-price.a-text-bold').each(function (index, element) {
			if(index<5){
	      var price = $(this)[0].children[0].data;
				if(res[index]) res[index].price = price;
			}
    });

		if(res.length>0){
			embed.createPriceEmbed(msg,res);
		}else{
			msg.channel.send("Não existe esse produto do xixo");
		}
	});
}
