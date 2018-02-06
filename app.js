var Discord=require("discord.js");
var ytdl=require('ytdl-core');
var reddit=require("./secrets");
var reddit=require("./reddit");
var crypto=require("./crypto");
var youtube=require("./youtube");
var client=new Discord.Client();
var first=true;
var request=require("request");

const CleverbotAPI = require('cleverbot-api');
const cleverbot = new CleverbotAPI(process.env.cleverBotKey);

client.on('ready', () => {
  client.user.setActivity('with your mind');
  console.log(`Logged in as ${client.user.tag}!`);
});
var dispatcher=null;
client.on('message', msg => {
  if (msg.content.includes('rodrigo') || msg.content.includes('Rodrigo')) {
    if(msg.content.includes('voice youtube')){
      var youtubeLink=msg.content.split('youtube ')[1];
      if(msg.member.voiceChannel){
        msg.member.voiceChannel.join().then(connection=>{
          const stream=ytdl(youtubeLink,{filter:'audioonly'});
          const streamOptions={seek:0,volume:0.5};
          dispatcher=connection.playStream(stream,streamOptions);

          dispatcher.on('end', () => {
            msg.member.voiceChannel.leave();
          });
        }).catch(console.log);
      }else{
        msg.reply('Vai para um canal de voz primeiro sua xixada!');
      }
    }else if(msg.content.includes('voice pause')){
      dispatcher.pause();
    }else if(msg.content.includes('voice resume')){
      dispatcher.resume();
    }else if(msg.content.includes('voice end')){
      dispatcher.end();
    }else if(msg.content.includes('o que gostas de fazer') || msg.content.includes('carne')){
      msg.channel.send({
        file: "./assets/img/cuttingmeat.jpg"
      });
    }else if(msg.content.includes("procura")){
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
        createSearchEmbed(msg,res);
      });
    }else if(msg.content.includes("probabilidade")){
      var num=Math.floor(Math.random()*100);
      msg.channel.send("Cerca de "+num+"%");
    }else if(msg.content.includes("clever")){
      cleverbot.getReply({
          input: msg.content
      }, (error, response) => {
          if(error) throw error;
          //console.log(response.input);
          msg.channel.send(response.output);
      });
    }else if(msg.content.includes("?")){
      var num=Math.floor(Math.random()>=0.5);
      if(num){
        msg.channel.send("Sim");
      }else{
        msg.channel.send("Não");
      }
    }else if(msg.content.includes('piada')){
      reddit.getAccessToken({subreddit:"jokes"},function(res){
        createEmbed(msg,res);
      });
    }else if(msg.content.includes("crypto")){
      var coin=msg.content.split('crypto ')[1];
      crypto.getPrice({coin:coin},function(res){
        if(res==""){
          msg.channel.send("Essa moeda deve estar no xixo porque não a encontro");
        }else{
          createCryptoEmbed(msg,res);
        }
      });
    }else if(msg.content.includes('reddit')){
      var sub=msg.content.split('reddit ')[1];
      reddit.getAccessToken({subreddit:sub},function(res){
        if(res==""){
          msg.channel.send("Esse subreddit deve estar no xixo porque não o encontro");
        }else{
          createEmbed(msg,res);
        }
      });
    }else if(msg.content.includes('gif')){
      reddit.getAccessToken({subreddit:"gif"},function(res){
        createEmbed(msg,res);
      });
    }else if(msg.content.includes('video')){
      reddit.getAccessToken({subreddit:"videos"},function(res){
        createEmbed(msg,res);
      });
    }else if(msg.content.includes('meme')){
      reddit.getAccessToken({subreddit:"2meirl4meirl+boottoobig+dankmemes+greentext+insanepeoplefacebook+oldpeoplefacebook+memes+meme+imgoingtohellforthis+prequelmemes"},function(res){
        createEmbed(msg,res);
      });
    }else if(msg.content.includes("porn") || msg.content.includes("porno")){
      reddit.getAccessToken({subreddit:"pornvids"},function(res){
        createEmbed(msg,res);
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
      msg.channel.send("https://www.twitch.tv/"+channel);
    }else if(msg.content.includes(":rodrigo:")){
      msg.channel.send("Que carinha laroca!");
    }
  }
});

client.login(process.env.discordKey);

var createEmbed=function(msg,res){
  var embed=new Discord.RichEmbed();
  if(res[0].contentVideo!=""){
    msg.channel.send(res[0].contentVideo);
  }else{
    embed.setTitle(res[0].title);
    embed.setURL(res[0].url);
    embed.setColor(0x00AE86);
    if(res[0].content!=""){
      embed.setThumbnail(res[0].image);
      embed.addField("Content",res[0].content);
    }else if(res[0].contentImage!=""){
      embed.setImage(res[0].contentImage);
    }
    embed.setFooter("From: "+res[0].subreddit+" | "+"Upvotes: "+res[0].score+" | ");
    msg.channel.send(embed);
  }
}

var createCryptoEmbed=function(msg,res){
  var embed=new Discord.RichEmbed();
  embed.setTitle(res[0].rank+". "+res[0].name+" ("+res[0].symbol+")");
  embed.setColor(0x00AE86);
  embed.addField("Price (€)",parseFloat(res[0].priceEur).toFixed(2)+" €",true);
  embed.addField("Price ($)",parseFloat(res[0].priceUsd).toFixed(2)+" $",true);
  var marketcapEur=String(parseFloat(res[0].marketcapEur).toFixed(2)).replace(/(?!^)(?=(?:\d{3})+(?:\.|$))/gm, ' ');
  embed.addField("Marketcap (€)",marketcapEur+" €",true);
  var marketcapUsd=String(parseFloat(res[0].marketcapUsd).toFixed(2)).replace(/(?!^)(?=(?:\d{3})+(?:\.|$))/gm, ' ');
  embed.addField("Marketcap ($)",marketcapUsd+" $",true);
  var availableSupply=String(parseFloat(res[0].availableSupply).toFixed(2)).replace(/(?!^)(?=(?:\d{3})+(?:\.|$))/gm, ' ');
  embed.addField("Available Supply",availableSupply+" "+res[0].symbol,true);
  var totalSupply=String(parseFloat(res[0].totalSupply).toFixed(2)).replace(/(?!^)(?=(?:\d{3})+(?:\.|$))/gm, ' ');
  embed.addField("Total Supply",totalSupply+" "+res[0].symbol,true);
  embed.setFooter("1h: "+res[0].change1h+"% | "+"24h: "+res[0].change24h+"% | "+"7d: "+res[0].change7d+"%");
  msg.channel.send(embed);
}

var createSearchEmbed=function(msg,res){
  var embed=new Discord.RichEmbed();
  embed.setTitle(res[0].topic);
  embed.setColor(0x00AE86);
  for(var i=0;i<3;i++){
    embed.addField(res[i].title,res[i].link);
    embed.addField("Description",res[i].description);
  }
  msg.channel.send(embed);
}
