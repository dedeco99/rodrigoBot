var request=require("request");

var checkIfChannelExists=function(data,callback){
	var url="https://api.twitch.tv/helix/users?login="+data.channel;

	var headers={
    "Accept":"application/vnd.twitchtv.v5+json",
    "Client-ID":process.env.twitchClientId
  };

  request({headers:headers,url:url},function(error,response,html){
    if(error) console.log(error);
    var json=JSON.parse(html);

    if(json.data.length>0){
      callback(true,json);
    }else{
      callback(false,json);
    }
  });
}

var checkIfChannelInDatabase=function(data,callback){
  var url="https://api.mlab.com/api/1/databases/rodrigo/collections/channels?q={"+data.field+":'"+data.channel+"','platform':'"+data.platform+"'}&apiKey="+process.env.databaseKey;

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
  var url="https://api.mlab.com/api/1/databases/rodrigo/collections/notifications?q={'video':'"+data.video+"','started':'"+data.started+"'}&apiKey="+process.env.databaseKey;

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

var addNotification=function(data){
    var url="https://api.mlab.com/api/1/databases/rodrigo/collections/notifications?apiKey="+process.env.databaseKey;

    request.post({url:url,body:data,json:true},function(error,response,html){
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

exports.addTwitchChannel=function(data,callback){
  checkIfChannelExists(data,function(exists,json){
    if(exists){
      checkIfChannelInDatabase({"field":"channel","channel":json.data[0].login},function(exists){
        if(!exists){
          var url="https://api.mlab.com/api/1/databases/rodrigo/collections/channels?apiKey="+process.env.databaseKey;

          var res={"name":json.data[0].login,"channel":json.data[0].login,"platform":"twitch"};

          request.post({url:url,body:res,json:true},function(error,response,html){
            if(error) console.log(error);

            callback("Canal adicionado com sucesso my dude");
          });
        }
      });
    }else{
      callback("Esse canal deve estar no xixo porque não o encontro");
    }
  });
}

exports.removeTwitchChannel=function(data,callback){
  checkIfChannelInDatabase({"field":"name","channel":data.channel,"platform":"twitch"},function(exists,id){
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
}

exports.getTwitchChannels=function(callback){
  var url="https://api.mlab.com/api/1/databases/rodrigo/collections/channels?q={'platform':'twitch'}&s={'name':1}&apiKey="+process.env.databaseKey;

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

exports.getTwitchNotifications=function(callback){
	var url="https://api.mlab.com/api/1/databases/rodrigo/collections/channels?q={'platform':'twitch'}&apiKey="+process.env.databaseKey;

	request(url,function(error,response,html){
    if(error) console.log(error);
    var json=JSON.parse(html);

		var channels="";

		for(var i=0;i<json.length;i++){
			channels+="user_login="+json[i].channel+"&";
		}

		channels=channels.slice(0, -1);

		var url="https://api.twitch.tv/helix/streams?"+channels;

		var headers={
	    "Accept":"application/vnd.twitchtv.v5+json",
	    "Client-ID":process.env.twitchClientId
	  };

	  request({headers:headers,url:url},function(error,response,html){
	    if(error) console.log(error);
	    var json=JSON.parse(html);

			console.log(json);

			for(var i=0;i<json.data.length;i++){
				var ONE_HOUR = 60 * 60 * 1000;
        if((new Date()) - (new Date(json.data[i].started_at)) < ONE_HOUR){
					var link={notification:"**"+json.data[i].user_name+"** está live!",video:"https://twitch.tv/"+json.data[i].user_name};
					var data={video:json.data[i].user_name,started:json.data[i].started_at};

          checkIfNotificationExists(data,function(exists){
            if(!exists){
              callback(link);
              addNotification(data);
            }
          });
        }
			}
	  });
	});
}
