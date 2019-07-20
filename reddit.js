var request = require("request");
var embed = require("./embed");

var isFile = (pathname) => {
  return pathname.split("/").pop().lastIndexOf(".")>-1;
};

var getRedditPosts = (data, accessToken, callback) => {
  var url="https://oauth.reddit.com/r/" + data.subreddit + "?limit=100&sort=hot";
  var headers = {
    "User-Agent": "Entertainment-Hub by dedeco99",
    "Authorization": "bearer " + accessToken
  };

  request({url, headers}, (error, response, html) => {
    if(error) console.log(error);
    try{
      var json = JSON.parse(html);
      var num = Math.floor(Math.random() * json.data.children.length);

      var image = "";
      if(json.data.children[num].data.thumbnail === "self" || json.data.children[num].data.thumbnail === "default"){
        image = "";
      }else{
        image = json.data.children[num].data.thumbnail;
      }
      var content = "";
      var contentImage = "";
      var contentVideo = "";
      var url = json.data.children[num].data.url;
      var imgTypes = ["jpg", "jpeg", "png", "gif"];
      if(url.indexOf("reddit.com") !== -1){
        if(json.data.children[num].data.selftext.length < 1024){
					content = json.data.children[num].data.selftext;
				}else{
					content = "Click link to view";
				}
      }else if(url.includes(".gifv") || url.includes("youtu")){
        contentVideo = url;
      }else if(url.includes("imgur.com") !== -1){
        if(isFile(url)){
          contentImage = url;
        }else{
          contentVideo = url;
        }
      }else if(url.includes("gfycat.com")){
        contentVideo = url;
      }else if(imgTypes.includes(url.substr(url.lastIndexOf(".")+1)) !== -1){
        contentImage = url;
      }
      var res = {
        image,
        subreddit:json.data.children[num].data.subreddit,
        title:json.data.children[num].data.title,
        url,
        score:json.data.children[num].data.score,
        content,
        contentImage,
        contentVideo,
        created:json.data.children[num].data.created,
        after:json.data.after
      };

      callback(embed.createRedditEmbed(res));
    }catch(err){
      callback("Esse subreddit deve estar no xixo porque não o encontro");
    }
  });
};

var getAccessToken = (data, callback) => {
    var url = "https://www.reddit.com/api/v1/access_token"
            + "?refresh_token=" + process.env.redditRefreshToken
            + "&grant_type=refresh_token";

    var auth = "Basic " + new Buffer.from(process.env.redditClientId + ":" + process.env.redditSecret).toString("base64");

    var headers = {
      "User-Agent": "RodrigoBot",
      "Authorization": auth
    };

    request.post({url, headers}, (error, response, html) => {
      if(error) console.log(error);
      var json = JSON.parse(html);
      getRedditPosts(data, json.access_token, (res) => {
        callback(res);
      });
    });
};

const getRefreshToken = () => {
  var url = "https://www.reddit.com/api/v1/access_token"
          + "?code=EnnCAq3ndBzr0QYjBNCRgRxnzvg"
          + "&grant_type=authorization_code"
          + "&redirect_uri=http://localhost:5000/lul";

  var auth = "Basic " + new Buffer.from(process.env.redditClientId + ":" + process.env.redditSecret).toString("base64");

  var headers = {
    "User-Agent": "RodrigoBot",
    "Authorization": auth
  };

  request.post({url, headers}, (error, response, html) => {
    if(error) console.log(error);
    var json = JSON.parse(html);
    console.log(json);
  });
};

exports.checkForReddit = (msg, callback) => {
  //getRefreshToken();
  
	const subs=[
		{name: "piada", subreddit: "jokes"},
		{name: "gif", subreddit: "gif"},
		{name: "video", subreddit: "videos"},
		{name: "meme", subreddit: "2meirl4meirl+boottoobig+dankmemes+greentext+insanepeoplefacebook+oldpeoplefacebook+memes+meme+imgoingtohellforthis+prequelmemes"},
		{name: "pornstar", subreddit: "AvaAddams+Ava_Addams+RileyReid+Riley_Reid+RemyLaCroix+Remy_Lacroix+JadaStevens+BrandiLove+Melissamoore"},
		{name: "porn", subreddit: "pornvids+porninfifteenseconds+nsfwhardcore+lesbians+grool+quiver+porn_gifs"},
		{name: "tits", subreddit: "tessafowler+SexyFlowerWater+gonewild+NSFW_GIF+nsfw+BustyPetite+milf+OnOff+TittyDrop+LegalTeens+suicidegirls+boobbounce"},
		{name: "pussy", subreddit: "ass+pawg+gettingherselfoff+asstastic+thick+GodPussy+BonerAlert+StraightGirlsPlaying+workgonewild+rearpussy+gwcumsluts+pussy+facedownassup+cumonclothes+jilling"},
		{name: "soft", subreddit: "collegesluts+girlsinyogapants+FestivalSluts+tightdresses+randomsexiness+burstingout"}
  ];

  const searchedSub = msg.content.split(" ")[2];
  const sub = subs.find(sub => sub.name === searchedSub);

  getAccessToken({subreddit: sub ? sub.subreddit : searchedSub}, (res) => {
    callback(res);
  });
};
