var discord=require("discord.js");
var Cleverbot=require("cleverbot-api");
var fs=require("fs");
var secrets=require("./secrets");
var embed=require("./embed");
var utils=require("./utils");
var reddit=require("./reddit");
var crypto=require("./crypto");
var youtube=require("./youtube");

var meta={};

var client=new discord.Client();
var cleverbot=new Cleverbot(process.env.cleverBotKey);

client.on("ready",()=>{
  fs.readFile("meta.json","utf8",function(err,data){
    if(err) throw err;
    meta=JSON.parse(data);
    console.log("Logged in as "+client.user.tag+"!");
    client.user.setActivity(meta.order,{type:"PLAYING"});
  });
});

client.on("message",msg=>{
  if(msg.content.toLowerCase().includes("rodrigo")){
    var checkForInsideJokes=utils.checkForInsideJokes(msg,meta);
    if(checkForInsideJokes.isInsideJoke){
      msg.channel.send(checkForInsideJokes.msg);
    }else{
      utils.checkForMemes(msg,function(checkForMemes){
        if(checkForMemes.isMeme){
          msg.channel.send(checkForMemes.msg);
        }else{
          reddit.checkForReddit(msg,function(checkForReddit){
            if(checkForReddit.isReddit){
              if(checkForReddit.error) msg.channel.send(checkForReddit.error);
              else embed.createRedditEmbed(msg,checkForReddit.msg);
            }else{
              checkForKeyWords(msg,meta);
            }
          });
        }
      });
    }

    fs.writeFile("meta.json",JSON.stringify(meta),function(err){
      if(err) console.log(err);
    });
  }
});

client.login(process.env.discordKey);

var checkForKeyWords=function(msg,meta){
  if(msg.content.includes("vai brincar")){
    var order=msg.content.split('vai brincar ')[1];
    client.user.setActivity(order,{type:"PLAYING"});
  }else if(msg.content.toLowerCase().includes("gas")){
    const { GifFrame, GifUtil, GifCodec } = require('gifwrap');
    const width = 200, height = 100;
    const frames = [];

    let frame = new GifFrame(width, height, { delayCentisecs: 10 });
    // modify the pixels at frame.bitmap.data
    frames.push(frame);
    frame = new GifFrame(width, height, { delayCentisecs: 15 });
    // modify the pixels at frame.bitmap.data
    frames.push(frame);
    // add more frames as desired...

    // to write to a file...
    GifUtil.write("./assets/img/gascreate.gif", frames, { loops: 3 }).then(gif => {
        console.log("written");
        //msg.channel.send({"file":"./assets/img/gas.gif"});
    });
  }else if(msg.content.includes("vai jogar")){
    var order=msg.content.split('vai jogar ')[1];
    client.user.setActivity(order,{type:"PLAYING"});
  }else if(msg.content.includes("vai ouvir")){
    var order=msg.content.split('vai ouvir ')[1];
    client.user.setActivity(order,{type:"LISTENING"});
  }else if(msg.content.includes("vai ver")){
    var order=msg.content.split('vai ver ')[1];
    client.user.setActivity(order,{type:"WATCHING"});
  }else if(msg.content.includes("define")){
    utils.define(msg,function(res){
      embed.createDefineEmbed(msg,res);
    });
  }else if(msg.content.includes("procura")){
    utils.procura(msg,function(res){
      embed.createSearchEmbed(msg,res);
    });
  }else if(msg.content.includes("vote")){
    utils.vote(msg,function(res){
      embed.createPollEmbed(client,msg,res);
    });
  }else if(msg.content.includes("probabilidade")){
    var num=Math.floor(Math.random()*100);
    msg.channel.send("Cerca de "+num+"%");
  }else if(msg.content.includes("clever")){
    cleverbot.getReply({
        input: msg.content
    }, (error, response) => {
        if(error) throw error;
        msg.channel.send(response.output);
    });
  }else if(msg.content.includes("?")){
      utils.responde(msg);
  }else if(msg.content.includes("crypto")){
    var coin=msg.content.split('crypto ')[1];
    crypto.getPrice(coin,function(res){
      if(res.error) msg.channel.send(res.error);
      else embed.createCryptoEmbed(msg,res);
    });
  }else if(msg.content.includes('youtube')){
    var channel=msg.content.split('youtube ')[1];
    youtube.getYoutubeVideo({channel:channel},function(res){
      if(res==""){
        msg.channel.send("Esse canal deve estar no xixo porque não o encontro");
      }else{
        msg.channel.send(res);
      }
    });
  }else if(msg.content.includes('twitch')){
    var channel=msg.content.split('twitch ')[1];
    var url="https://www.twitch.tv/"+channel;
    msg.channel.send(url);
    client.user.setActivity(channel,{url:url,type:"WATCHING"});
  }else if(msg.content.includes(":rodrigo:")){
    msg.channel.send("Que carinha laroca!");
  }else if(msg.content.includes("good") || msg.content.includes("nice") || msg.content.includes("bem") || msg.content.includes("bom") || msg.content.includes("best") || msg.content.includes("grande")){
    meta.likes++;
    msg.channel.send("Durante a minha existência já gostaram de mim "+meta.likes+" vezes. I can't handle it!!! *touches face violently*");
  }else if(msg.content.includes("bad") || msg.content.includes("mal") || msg.content.includes("mau") || msg.content.includes("worst") || msg.content.includes("lixo")){
    meta.dislikes++;
    msg.channel.send("Durante a minha existência já me deram bullying "+meta.dislikes+" vezes. Vou chamar os meus pais. *cries while getting hit with a laptop*");
  }/*else{
    msg.channel.send("Xixo! Bebi demasiado tintinho e não compreendi essa frase.");
  }*/
}
