var discord = require("discord.js");
var secrets = require("./secrets");
var Meta = require("./meta");
var command = require("./command");
var youtube = require("./youtube");
var twitch = require("./twitch");

var client = new discord.Client();

client.login(process.env.discordKey);

Meta.getMeta();
var lastMsg = null;

client.on("ready", () => {
  console.log("Logged in as " + client.user.tag + "!");
  client.user.setActivity(process.env.meta.action, { type: "PLAYING" });

  setInterval(() => {
    youtube.getYoutubeNotifications((res) => {
      client.channels.get("525343734746054657").send(res.notification + " | " + res.video);
    });
    /*twitch.getTwitchNotifications((res) => {
      client.channels.get("525343734746054657").send(res.notification + " | " + res.video);
    });*/
    console.log("Checked");
  }, 60000*10);
});

client.on("message", (msg) => {
  var firstWord = msg.content.split(" ")[0].toLowerCase();
  let meta = JSON.parse(process.env.meta);

  if(firstWord === "rodrigo"){
    command.checkForCommand(msg, (checkForCommand) => {
      if(checkForCommand.isCommand){
        msg.channel.send(checkForCommand.msg);
      }else if(msg.content.includes("delete")){
        if(lastMsg != null){
          lastMsg.delete();
          msg.delete();
        }
      }
    }, client);
  }else if(msg.author.username === "RodrigoBot"){
    lastMsg = msg;
  }else{
    if(msg.content.includes(":rodrigo:")){
      msg.channel.send("Que carinha laroca!");
    }else{
      if(msg.content.includes("rodrigo")){
        if(msg.content.includes("good") || msg.content.includes("nice") || msg.content.includes("bem") || msg.content.includes("bom") || msg.content.includes("best") || msg.content.includes("grande")){
          meta.likes++;
          msg.channel.send("Durante a minha existência já gostaram de mim " + meta.likes + " vezes. I can't handle it!!! *touches face violently*");

          Meta.updateMeta({ likes: meta.likes });
        }else if(msg.content.includes("bad") || msg.content.includes("mal") || msg.content.includes("mau") || msg.content.includes("worst") || msg.content.includes("lixo")){
          meta.dislikes++;
          msg.channel.send("Durante a minha existência já me deram bullying " + meta.dislikes + " vezes. Vou chamar os meus pais. *cries while getting hit with a laptop*");
          
          Meta.updateMeta({ dislikes: meta.dislikes });
        }
      }
    }
  }
});