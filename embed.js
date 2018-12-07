var discord=require("discord.js");

exports.createRedditEmbed=function(msg,res){
  var embed=new discord.RichEmbed();
  if(res.contentVideo!=""){
    msg.channel.send(res.contentVideo);
  }else{
    embed.setTitle(res.title);
    embed.setURL(res.url);
    embed.setColor(0x00AE86);
    if(res.content!=""){
      embed.setThumbnail(res.image);
      embed.addField("Content",res.content);
    }else if(res.contentImage!=""){
      embed.setImage(res.contentImage);
    }
    embed.setFooter("From: "+res.subreddit+" | "+"Upvotes: "+res.score+" | ");
    msg.channel.send(embed);
  }
}

exports.createCryptoEmbed=function(msg,res){
  var embed=new discord.RichEmbed();

  embed.setTitle(res.rank+". "+res.name+" ("+res.symbol+")");
  embed.setColor(0x00AE86);

  embed.addField("Price (€)",res.priceEur.toFixed(2)+" €",true);

  var marketcapEur=prettyNumber(res.marketcapEur);
  embed.addField("Marketcap (€)",marketcapEur+" €",true);

  var availableSupply=prettyNumber(res.availableSupply);
  embed.addField("Available Supply",availableSupply+" "+res.symbol,true);

  var totalSupply=prettyNumber(res.totalSupply);
  embed.addField("Total Supply",totalSupply+" "+res.symbol,true);

  embed.setFooter("1h: "+res.change1h.toFixed(2)+"% | "+"24h: "+res.change24h.toFixed(2)+"% | "+"7d: "+res.change7d.toFixed(2)+"%");

  msg.channel.send(embed);
}

var prettyNumber=function(number){
  return String(parseFloat(number).toFixed(2)).replace(/(?!^)(?=(?:\d{3})+(?:\.|$))/gm, ' ');
}

exports.createSearchEmbed=function(msg,res){
  var embed=new discord.RichEmbed();
  embed.setTitle(res[0].topic);
  embed.setColor(0x00AE86);
  for(var i=0;i<3;i++){
    embed.addField(res[i].title,res[i].link);
    embed.addField("Description",res[i].description);
  }
  msg.channel.send(embed);
}

exports.createDefineEmbed=function(msg,res){
  var embed=new discord.RichEmbed();
  embed.setTitle(res.word);
  embed.setColor(0x00AE86);
  embed.addField(res.definition,res.example);
  msg.channel.send(embed);
}

exports.createImageEmbed=function(msg,res){
  var embed=new discord.RichEmbed();
  embed.setColor(0x00AE86);
  embed.setImage(res);
  msg.channel.send(embed);
}

exports.createTextEmbed=function(msg,res){
  var embed=new discord.RichEmbed();
  embed.setColor(0x00AE86);
  embed.addField("Commands",res.example);
  msg.channel.send(embed);
}
