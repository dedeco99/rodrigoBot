var discord = require("discord.js");
var Cleverbot = require("cleverbot-api");
var fs = require("fs");
var secrets = require("./secrets");
var utils = require("./utils");
var memeMaker = require("./memeMaker");
var reddit = require("./reddit");
var youtube = require("./youtube");
var twitch = require("./twitch");
var media = require("./media");
var insideJokes = require("./insideJokes");

var meta = {};
var lastMsg = null;

var client = new discord.Client();

client.on("ready", () => {
  fs.readFile("meta.json", "utf8", (err, data) => {
    if(err) throw err;
    meta = JSON.parse(data);
    console.log("Logged in as " + client.user.tag + "!");
    client.user.setActivity(meta.order, { type: "PLAYING" });
  });

  setInterval(() => {
    youtube.getYoutubeNotifications((res) => {
      client.channels.get("525343734746054657").send(res.notification + " | " + res.video);
    });
    twitch.getTwitchNotifications((res) => {
      client.channels.get("525343734746054657").send(res.notification + " | " + res.video);
    });
    console.log("Checked");
  }, 60000*10);
});

client.on("message", (msg) => {
  var firstWord = msg.content.split(" ")[0].toLowerCase();

  if(firstWord === "rodrigo"){
    utils.checkForUtils(msg, (checkForUtils) => {
      if(checkForUtils.isUtil){
        msg.channel.send(checkForUtils.msg);
      }else{
        memeMaker.checkForMemes(msg, (checkForMemes) => {
          if(checkForMemes.isMeme){
            msg.channel.send(checkForMemes.msg);
          }else{
            media.checkForMedia(msg, client, (checkForMedia) => {
              if(checkForMedia.isMedia){
                msg.channel.send(checkForMedia.msg);
              }else{
                reddit.checkForReddit(msg, (checkForReddit) => {
                  if(checkForReddit.isReddit){
                    msg.channel.send(checkForReddit.msg);
                  }else{
                    insideJokes.checkForInsideJokes(msg, meta, (checkForInsideJokes) => {
                      if(checkForInsideJokes.isInsideJoke){
                        msg.channel.send(checkForInsideJokes.msg);
                      }else if(msg.content.includes("delete")){
                        if(lastMsg != null){
                          lastMsg.delete();
                          msg.delete();
                        }
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });

    fs.writeFile("meta.json", JSON.stringify(meta), (err) => {
      if(err) console.log(err);
    });
  }else if(msg.author.username === "RodrigoBot"){
    lastMsg = msg;
  }else{
    if(msg.content.includes(":rodrigo:")){
      msg.channel.send("Que carinha laroca!");
    }else if(msg.content.includes("good") || msg.content.includes("nice") || msg.content.includes("bem") || msg.content.includes("bom") || msg.content.includes("best") || msg.content.includes("grande")){
      meta.likes++;
      msg.channel.send("Durante a minha existência já gostaram de mim " + meta.likes + " vezes. I can't handle it!!! *touches face violently*");
    }else if(msg.content.includes("bad") || msg.content.includes("mal") || msg.content.includes("mau") || msg.content.includes("worst") || msg.content.includes("lixo")){
      meta.dislikes++;
      msg.channel.send("Durante a minha existência já me deram bullying " + meta.dislikes + " vezes. Vou chamar os meus pais. *cries while getting hit with a laptop*");
    }
  }
});

client.login(process.env.discordKey);
