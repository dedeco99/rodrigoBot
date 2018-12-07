var request=require("request");

exports.checkForReddit=function(msg,callback){
	var subs=[{name:"piada",subreddit:"jokes"},{name:"gif",subreddit:"gif"},{name:"video",subreddit:"videos"},{name:"meme",subreddit:"2meirl4meirl+boottoobig+dankmemes+greentext+insanepeoplefacebook+oldpeoplefacebook+memes+meme+imgoingtohellforthis+prequelmemes"},{name:"pornstar",subreddit:"AvaAddams+Ava_Addams+RileyReid+Riley_Reid+RemyLaCroix+Remy_Lacroix+JadaStevens+BrandiLove+Melissamoore"},{name:"porn",subreddit:"pornvids+porninfifteenseconds+nsfwhardcore+lesbians+grool+quiver+porn_gifs"},{name:"tits",subreddit:"tessafowler+SexyFlowerWater+gonewild+NSFW_GIF+nsfw+BustyPetite+milf+OnOff+TittyDrop+LegalTeens+suicidegirls+boobbounce"},{name:"pussy",subreddit:"ass+pawg+gettingherselfoff+asstastic+thick+GodPussy+BonerAlert+StraightGirlsPlaying+workgonewild+rearpussy+gwcumsluts+pussy+facedownassup+cumonclothes+jilling"},{name:"soft",subreddit:"collegesluts+girlsinyogapants+FestivalSluts+tightdresses+randomsexiness+burstingout"}];

	for(var i=0; i<subs.length; i++){
		if(msg.content.includes('reddit')){
	    var sub=msg.content.split('reddit ')[1];
	    getAccessToken({subreddit:sub},function(res){
				callback(res);
	    });
			break;
	  }else if(msg.content.includes(" "+subs[i].name)){
			getAccessToken(subs[i],function(res){
        callback(res);
      });
      break;
		}
    if(subs.length-1===i) callback({isReddit:false});
	}
}

var getAccessToken=function(data,callback){
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

  request({url:url,headers:headers},function(error,response,html){
    if(error) console.log(error);
    try{
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
      }else if(url.includes(".gifv") || url.includes("youtu")){
        contentVideo=url;
      }else if(imgTypes.includes(url.substr(url.lastIndexOf(".")+1))!=-1){
        contentImage=url;
      }else if(url.includes("imgur.com")!==-1){
        if(isFile(url)){
          contentImage=url;
        }else{
          contentVideo=url;
        }
      }else if(url.includes("gfycat.com")){
        url="https://gfycat.com/gifs/detail"+url.slice(url.lastIndexOf("/"),url.length);
        contentVideo=url;
      }
      var res={
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
      };
      callback({isReddit:true,msg:res});
    }catch(err){
      callback({isReddit:true,error:"Esse subreddit deve estar no xixo porque não o encontro"});
    }
  });
}
