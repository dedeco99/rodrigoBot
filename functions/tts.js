var { getVoiceStream } = require("discord-tts");

var connection;

async function speak(msg){
    if(msg.content.length>200) return msg.channel.send("Isso e muito texto");
    
    const channelId = msg.member.voice.channelID;
    const broadcast = global.client.voice.createBroadcast();
    var channel = global.client.channels.cache.get(channelId);
    var paramsArray=msg.content.split(" ");
    var text = paramsArray.splice(2,paramsArray.length-1).join(" ");
    console.log(text);
    try{
        //Create connection and add event for diconnecting
        if(!isConnected()){
            connection=await channel.join();
            connection.on("disconnect",()=>{connection=undefined;});
        }
        broadcast.play(getVoiceStream(text,"en-GB"));
        const dispatcher=connection.play(broadcast);
    }catch(err){
        console.log(err);
    }
}

function isConnected(){
    return connection!==undefined;
}

module.exports = {
    speak
};
