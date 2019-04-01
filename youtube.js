var request = require("request");

var checkIfChannelExists = (data, callback) => {
  var url = "https://www.googleapis.com/youtube/v3/search?part=snippet&q=" + data.channel + "&type=channel&key=" + process.env.youtubeKey;

  request(url, (error, response, html) => {
    if(error) console.log(error);
    var json = JSON.parse(html);

    if(json.pageInfo.totalResults > 0){
      callback(true, json);
    }else{
      callback(false, json);
    }
  });
};

var checkIfChannelInDatabase = (data, callback) => {
  var url = "https://api.mlab.com/api/1/databases/rodrigo/collections/channels?q={" + data.field + ":'" + data.channel + "'}&apiKey=" + process.env.databaseKey;

  request(url, (error, response, html) => {
    if(error) console.log(error);
    var json = JSON.parse(html);

    if(json.length > 0){
      callback(true, json[0]._id.$oid);
    }else{
      callback(false);
    }
  });
};

var checkIfNotificationExists = (data, callback) => {
  var url = "https://api.mlab.com/api/1/databases/rodrigo/collections/notifications?q={'video':'" + data.video + "'}&apiKey=" + process.env.databaseKey;

  request(url, (error, response, html) => {
    if(error) console.log(error);
    var json = JSON.parse(html);

    if(json.length > 0){
      callback(true);
    }else{
      callback(false);
    }
  });
};

var addNotification = (videoId) => {
    var url = "https://api.mlab.com/api/1/databases/rodrigo/collections/notifications?apiKey=" + process.env.databaseKey;

    var res = {"video": videoId};

    request.post({url, body: res, json: true}, (error, response, html) => {
      if(error) console.log(error);
    });
};

const getChannelsPlaylist = (data, callback) => {
  var url = "https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=" + data + "&maxResults=50&key=" + process.env.youtubeKey;

  request(url, (error, response, html) => {
    if(error) console.log(error);
    var json = JSON.parse(html);

    callback(json.items);
  });
};

exports.getYoutubeVideo = (data, callback) => {
  checkIfChannelExists(data, (exists, json) => {
    if(exists){
      getChannelsPlaylist(json.items[0].id.channelId, (items) => {
        var url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=" + items[0].contentDetails.relatedPlaylists.uploads + "&maxResults=5&key=" + process.env.youtubeKey;

        request(url, (error, response, html) => {
          if(error) console.log(error);
          var json = JSON.parse(html);

          callback("https://youtu.be/" + json.items[0].snippet.resourceId.videoId);
        });
      });
    }else{
      callback("Esse canal deve estar no xixo porque não o encontro");
    }
  });
};

exports.addYoutubeChannel = (data, callback) => {
  checkIfChannelExists(data, (exists, json) => {
    if(exists){
      checkIfChannelInDatabase({"field": "channel", "channel": json.items[0].id.channelId, "platform": "youtube"}, (exists) => {
        if(!exists){
          var url = "https://api.mlab.com/api/1/databases/rodrigo/collections/channels?apiKey=" + process.env.databaseKey;

          var res = {"name": json.items[0].snippet.title, "channel": json.items[0].id.channelId, "platform": "youtube"};

          request.post({url, body: res, json: true}, (error, response, html) => {
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
};

exports.removeYoutubeChannel = (data, callback) => {
  checkIfChannelExists(data, (exists, json) => {
    if(exists){
      checkIfChannelInDatabase({"field": "channel", "channel": json.items[0].id.channelId, platform: "youtube"}, (exists, id) => {
        if(exists){
          var url = "https://api.mlab.com/api/1/databases/rodrigo/collections/channels/" + id + "?apiKey=" + process.env.databaseKey;

          request.delete(url, (error, response, html) => {
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
};

exports.getYoutubeChannels = (callback) => {
  var url = "https://api.mlab.com/api/1/databases/rodrigo/collections/channels?q={'platform':'youtube'}&s={'name':1}&apiKey=" + process.env.databaseKey;

  request(url, (error, response, html) => {
    if(error) console.log(error);
    var json = JSON.parse(html);

    var res = "";

    for(var i = 0; i < json.length; i++){
      res += json[i].name + " | ";
    }

    callback(res);
  });
};

exports.getYoutubeNotifications = (callback) => {
  var url = "https://api.mlab.com/api/1/databases/rodrigo/collections/channels?q={'platform':'youtube'}&apiKey=" + process.env.databaseKey;

  request(url, (error, response, html) => {
    if(error) console.log(error);
    var json = JSON.parse(html);

    var channelsString = "";

    for(var i = 0; i < json.length; i++){
      channelsString += json[i].channel + ",";
    }

    getChannelsPlaylist(channelsString, (items) => {
      for(var i = 0; i < items.length; i++){
        var url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=" + items[i].contentDetails.relatedPlaylists.uploads + "&maxResults=1&key=" + process.env.youtubeKey;

        request(url, (error, response, html) => {
          if(error) console.log(error);
          var json = JSON.parse(html);

          var ONE_HOUR = 60 * 60 * 1000;
          if((new Date()) - (new Date(json.items[0].snippet.publishedAt)) < ONE_HOUR){
            checkIfNotificationExists({video: json.items[0].snippet.resourceId.videoId}, (exists) => {
              if(!exists){
                callback({notification: "**" + json.items[0].snippet.channelTitle + "** postou um novo video!", video: "https://youtu.be/" + json.items[0].snippet.resourceId.videoId});
                addNotification(json.items[0].snippet.resourceId.videoId);
              }
            });
          }
        });
      }
    });
  });
};
