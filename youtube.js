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

    /*if(error) console.log(error);
    var $=cheerio.load(html);

    var json=[];
    var first=true;

    $("#items").find("h3")
    .each(function(i, link){
      if(first){
        console.log($(link).text());
        first=false;
      }
    });
    console.log(json);

    callback(json);

    $("a[id='video-title']").find("a[id='video-title']")
    .each(function(index,element){
      var title=$(element).find("a[itemprop='name']").text();

      var date=$(element).find(".airdate").text().trim();
      months=["","Jan.","Feb.","Mar.","Apr.","May",
              "Jun.","Jul.","Aug.","Sep.","Oct.","Nov.","Dec."]
      date=date.split(" ");
      day=date[0];
      month=date[1];
      year=date[2];
      for(var i=0;i<months.length;i++){
        if(month==months[i]){
          month=i;
        }
      }
      if(month==null && year==null){
        year=day;
        day=month=1;
      }
      date=year+"-"+month+"-"+day;

      if($(element).find(".hover-over-image img").length>0){
        image=$(element).find(".hover-over-image img").attr("src");
      }else{
        var image="/assets/img/noimage.png";
      }

      var episodenum=$(element).find(".hover-over-image div").text().trim();
      episodenum=episodenum.split(", ");
      episodenum[0]=episodenum[0].replace("S","");
      episodenum[1]=episodenum[1].replace("Ep","");
      episodeseason=episodenum[0];
      episodenum=episodenum[1];

      episodes.push({
        series:data.id,
        title:title,
        date:date,
        image:image,
        season:episodeseason,
        number:episodenum
      });
    });*/
}

exports.addYoutubeChannel=function(data,callback){
  checkIfChannelExists(data,function(exists,json){
    if(exists){
      checkIfChannelInDatabase({"field":"channel","channel":json.items[0].id.channelId},function(exists){
        if(!exists){
          var url="https://api.mlab.com/api/1/databases/rodrigo/collections/channels?apiKey="+process.env.databaseKey;

          var res={"name":json.items[0].snippet.title,"channel":json.items[0].id.channelId};

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

exports.removeYoutubeChannel=function(data,callback){
  checkIfChannelExists(data,function(exists,json){
    if(exists){
      checkIfChannelInDatabase({"field":"name","channel":data.channel},function(exists,id){
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
      callback("Esse canal deve estar no xixo porque não o encontro");
    }
  });
}

exports.getYoutubeChannels=function(callback){
  var url="https://api.mlab.com/api/1/databases/rodrigo/collections/channels?s={'name':1}&apiKey="+process.env.databaseKey;

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
  var url="https://api.mlab.com/api/1/databases/rodrigo/collections/channels?apiKey="+process.env.databaseKey;

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
              callback("https://youtu.be/"+json.items[0].id.videoId);
              addNotification(json.items[0].id.videoId);
            }
          });
        }
      });
    }

    /*url="https://www.googleapis.com/youtube/v3/search?part=snippet&channelId="+data.channelId+"&order=date&maxResults=50&key="+process.env.youtubeKey;

    request(url,function(error,response,html){
      if(error) console.log(error);
      var json=JSON.parse(html);

      var res=[];
      for(var i=0;i<json.items.length;i++){
        var video={
          videoId:json.items[i].id.videoId,
          title:json.items[i].snippet.title,
          thumbnail:json.items[i].snippet.thumbnails.high.url,
          after:json.nextPageToken,
        };
        res.push(video);
      }
    });*/
  });
}
