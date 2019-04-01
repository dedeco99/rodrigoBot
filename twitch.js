var request = require("request");

var checkIfChannelExists = (data, callback) => {
	var url = "https://api.twitch.tv/helix/users?login=" + data.channel;

	var headers = {
    "Accept":"application/vnd.twitchtv.v5+json",
    "Client-ID": process.env.twitchClientId
  };

  request({headers, url}, (error, response, html) => {
    if(error) console.log(error);
    var json = JSON.parse(html);

    if(json.data.length > 0){
      callback(true, json);
    }else{
      callback(false, json);
    }
  });
}

var checkIfChannelInDatabase = (data, callback) => {
  var url = "https://api.mlab.com/api/1/databases/rodrigo/collections/channels?q={" + data.field + ":'" + data.channel + "','platform':'" + data.platform + "'}&apiKey=" + process.env.databaseKey;

  request(url, (error, response, html) => {
    if(error) console.log(error);
    var json = JSON.parse(html);

    if(json.length > 0){
      callback(true, json[0]._id.$oid);
    }else{
      callback(false);
    }
  });
}

var checkIfNotificationExists = (data, callback) => {
  var url = "https://api.mlab.com/api/1/databases/rodrigo/collections/notifications?q={'video':'" + data.video + "','started':'" + data.started + "'}&apiKey=" + process.env.databaseKey;

  request(url, (error, response, html) => {
    if(error) console.log(error);
    var json = JSON.parse(html);

    if(json.length > 0){
      callback(true);
    }else{
      callback(false);
    }
  });
}

var addNotification = (data) => {
    var url = "https://api.mlab.com/api/1/databases/rodrigo/collections/notifications?apiKey=" + process.env.databaseKey;

    request.post({url, body: data, json: true}, (error, response, html) => {
      if(error) console.log(error);
    });
}

exports.addTwitchChannel = (data, callback) => {
  checkIfChannelExists(data, (exists, json) => {
    if(exists){
      checkIfChannelInDatabase({"field": "channel", "channel": json.data[0].login}, (exists) => {
        if(!exists){
          var url = "https://api.mlab.com/api/1/databases/rodrigo/collections/channels?apiKey=" + process.env.databaseKey;

          var res={"name": json.data[0].login, "channel": json.data[0].login, "platform": "twitch"};

          request.post({url, body: res, json: true}, (error, response, html) => {
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

exports.removeTwitchChannel = (data, callback) => {
  checkIfChannelInDatabase({"field": "name", "channel": data.channel, "platform": "twitch"}, (exists, id) => {
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
}

exports.getTwitchChannels = (callback) => {
  var url = "https://api.mlab.com/api/1/databases/rodrigo/collections/channels?q={'platform':'twitch'}&s={'name':1}&apiKey=" + process.env.databaseKey;

  request(url, (error, response, html){
    if(error) console.log(error);
    var json = JSON.parse(html);

    var res = "";

    for(var i = 0; i < json.length; i++){
      res += json[i].name + " | ";
    }

    callback(res);
  });
}

exports.getTwitchNotifications = (callback) => {
	var url = "https://api.mlab.com/api/1/databases/rodrigo/collections/channels?q={'platform':'twitch'}&apiKey=" + process.env.databaseKey;

	request(url, (error, response, html) => {
    if(error) console.log(error);
    var json = JSON.parse(html);

		var channels = "";

		for(var i = 0; i < json.length; i++){
			channels += "user_login=" + json[i].channel + "&";
		}

		channels = channels.slice(0, -1);

		var url = "https://api.twitch.tv/helix/streams?" + channels;

		var headers = {
	    "Accept": "application/vnd.twitchtv.v5+json",
	    "Client-ID": process.env.twitchClientId
	  };

	  request({headers, url}, (error, response, html) => {
	    if(error) console.log(error);
	    var json = JSON.parse(html);

			console.log(json);

			for(var i = 0; i < json.data.length; i++){
				var ONE_HOUR = 60 * 60 * 1000;
        if((new Date()) - (new Date(json.data[i].started_at)) < ONE_HOUR){
					var link={notification: "**" + json.data[i].user_name + "** está live!", video: "https://twitch.tv/" + json.data[i].user_name};
					var data={video: json.data[i].user_name, started: json.data[i].started_at};

          checkIfNotificationExists(data, (exists) => {
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
