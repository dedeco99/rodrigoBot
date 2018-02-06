var request=require("request");
var cheerio=require("cheerio");

exports.getAccessToken=function(data,callback){
    var url="https://www.reddit.com/api/v1/access_token"
            +"?refresh_token="+process.env.redditRefreshToken
            +"&grant_type=refresh_token";

    var auth="Basic "+new Buffer(process.env.redditClientId+":"+process.env.redditSecret).toString("base64");

    var headers={
      "User-Agent":"Entertainment-Hub by dedeco99",
      "Authorization":auth
    };

    request.post({url:url,headers:headers},function(error,response,html){
      if(error) console.log(error);
      var json=JSON.parse(html);
      getRedditPosts(data,json.access_token,function(res){
        callback(res);
      });
    });
}

function isFile(pathname){
  return pathname.split('/').pop().lastIndexOf(".")>-1;
}

var getRedditPosts=function(data,accessToken,callback){
  var url="https://oauth.reddit.com/r/"+data.subreddit+"?limit=1000&sort=hot";
  var headers={
    "User-Agent":"Entertainment-Hub by dedeco99",
    "Authorization":"bearer "+accessToken
  };
  var res=[];

  request({url:url,headers:headers},function(error,response,html){
    if(error) console.log(error);
    var json=JSON.parse(html);
    var num=Math.floor(Math.random()*100);

    var image="";
    if(json.data.children[num].data.thumbnail=="self" || json.data.children[num].data.thumbnail=="default"){
      image="";
    }else{
      image=json.data.children[num].data.thumbnail;
    }
    var content="";
    var contentImage="";
    var contentVideo="";
    var url=json.data.children[num].data.url;
    var imgTypes=["jpg","jpeg","png","gif"];
    if(url.indexOf("reddit.com")!==-1){
      if(json.data.children[num].data.selftext.length<1024) content=json.data.children[num].data.selftext;
      else content="Click link to view";
    }else if(url.indexOf(".gifv")!==-1 || url.indexOf("youtu")!==-1){
      contentVideo=url;
    }else if(imgTypes.indexOf(url.substr(url.lastIndexOf(".")+1))!=-1){
      contentImage=url;
    }else if(url.indexOf("imgur.com")!==-1){
      if(isFile(url)){
        contentImage=url;
      }else{
        contentVideo=url;
      }
    }else if(url.indexOf("gfycat.com")!==-1){
      url="https://gfycat.com/gifs/detail"+url.slice(url.lastIndexOf("/"),url.length);
      contentVideo=url;
    }
    res.push({
      image:image,
      subreddit:json.data.children[num].data.subreddit,
      title:json.data.children[num].data.title,
      url:url,
      score:json.data.children[num].data.score,
      content:content,
      contentImage:contentImage,
      contentVideo:contentVideo,
      created:json.data.children[num].data.created,
      after:json.data.after
    });
    if(res!=null){
      callback(res);
    }else{
      callback("");
    }
  });
}
