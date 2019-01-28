var request=require("request");

var checkIfChannelExists=function(data,callback){
  var url="https://www.googleapis.com/youtube/v3/search?part=snippet&q="+data.channel+"&type=channel&key="+process.env.youtubeKey;

  request(url,function(error,response,html){
    if(error) console.log(error);
    var json=JSON.parse(html);

    if(json.pageInfo.totalResults>0){
      callback(true,json);
    }else{
      callback(false,json);
    }
  });
}

var checkIfChannelInDatabase=function(data,callback){
  var url="https://api.mlab.com/api/1/databases/rodrigo/collections/channels?q={"+data.field+":'"+data.channel+"'}&apiKey="+process.env.databaseKey;

  request(url,function(error,response,html){
    if(error) console.log(error);
    var json=JSON.parse(html);

    if(json.length>0){
      callback(true,json[0]._id.$oid);
    }else{
      callback(false);
    }
  });
}

var checkIfNotificationExists=function(data,callback){
  var url="https://api.mlab.com/api/1/databases/rodrigo/collections/notifications?q={'video':'"+data.video+"'}&apiKey="+process.env.databaseKey;

  request(url,function(error,response,html){
    if(error) console.log(error);
    var json=JSON.parse(html);

    if(json.length>0){
      callback(true);
    }else{
      callback(false);
    }
  });
}

var addNotification=function(videoId){
    var url="https://api.mlab.com/api/1/databases/rodrigo/collections/notifications?apiKey="+process.env.databaseKey;

    var res={"video":videoId};

    request.post({url:url,body:res,json:true},function(error,response,html){
      if(error) console.log(error);
    });
}

exports.getYoutubeVideo=function(data,callback){
  checkIfChannelExists(data,function(exists,json){
    if(exists){
      var url="https://www.googleapis.com/youtube/v3/search?order=date&part=snippet&channelId="+json.items[0].id.channelId+"&maxResults=5&key="+process.env.youtubeKey;

      request(url,function(error,response,html){
        if(error) console.log(error);
        var json=JSON.parse(html);

        callback("https://youtu.be/"+json.items[0].id.videoId);
      });
    }else{
      callback("Esse canal deve estar no xixo porque não o encontro");
    }
  });
}

exports.addYoutubeChannel=function(data,callback){
  checkIfChannelExists(data,function(exists,json){
    if(exists){
      checkIfChannelInDatabase({"field":"channel","channel":json.items[0].id.channelId,"platform":"youtube"},function(exists){
        if(!exists){
          var url="https://api.mlab.com/api/1/databases/rodrigo/collections/channels?apiKey="+process.env.databaseKey;

          var res={"name":json.items[0].snippet.title,"channel":json.items[0].id.channelId,"platform":"youtube"};

          request.post({url:url,body:res,json:true},function(error,response,html){
            if(error) console.log(error);

            callback("Canal adicionado com sucesso my dude");
          });
        }else{
          callback("Esse canal já existe seu lixo");
        }
      });
    }else{
      callback("Esse canal deve estar no xixo porque não o encontro");
    }
  });
}

exports.removeYoutubeChannel=function(data,callback){
  checkIfChannelExists(data,function(exists,json){
    if(exists){
      checkIfChannelInDatabase({"field":"channel","channel":json.items[0].id.channelId,platform:"youtube"},function(exists,id){
        if(exists){
          var url="https://api.mlab.com/api/1/databases/rodrigo/collections/channels/"+id+"?apiKey="+process.env.databaseKey;

          request.delete(url,function(error,response,html){
            if(error) console.log(error);

            callback("Canal removido com sucesso my dude");
          });
        }else{
          callback("Esse canal deve estar no xixo porque não o encontro");
        }
      });
    }else{
      callback("Esse canal deve estar no xixo porque não o encontroyt");
    }
  });
}

exports.getYoutubeChannels=function(callback){
  var url="https://api.mlab.com/api/1/databases/rodrigo/collections/channels?q={'platform':'youtube'}&s={'name':1}&apiKey="+process.env.databaseKey;

  request(url,function(error,response,html){
    if(error) console.log(error);
    var json=JSON.parse(html);

    var res="";

    for(var i=0;i<json.length;i++){
      res+=json[i].name+" | ";
    }

    callback(res);
  });
}

exports.getYoutubeNotifications=function(callback){
  var url="https://api.mlab.com/api/1/databases/rodrigo/collections/channels?q={'platform':'youtube'}&apiKey="+process.env.databaseKey;

  request(url,function(error,response,html){
    if(error) console.log(error);
    var json=JSON.parse(html);

    for(var i=0;i<json.length;i++){
      var url="https://www.googleapis.com/youtube/v3/search?order=date&part=snippet&channelId="+json[i].channel+"&maxResults=5&key="+process.env.youtubeKey;

      request(url,function(error,response,html){
        if(error) console.log(error);
        var json=JSON.parse(html);

        var ONE_HOUR = 60 * 60 * 1000;
        if((new Date()) - (new Date(json.items[0].snippet.publishedAt)) < ONE_HOUR){
          checkIfNotificationExists({video:json.items[0].id.videoId},function(exists){
            if(!exists){
              callback({notification:"**"+json.items[0].snippet.channelTitle+"** postou um novo video!",video:"https://youtu.be/"+json.items[0].id.videoId});
              addNotification(json.items[0].id.videoId);
            }
          });
        }
      });
    }
  });
}
