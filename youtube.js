var request=require("request");
var cheerio=require("cheerio");

exports.getYoutubeVideo=function(data,callback){
  var url="https://www.googleapis.com/youtube/v3/search?part=snippet&q="+data.channel+"&type=channel&key="+process.env.youtubeKey
  var channelId="";
  request(url,function(error,response,html){
    if(error) console.log(error);
    var json=JSON.parse(html);
    channelId=json.items[0].id.channelId;
    console.log(channelId);
    if(channelId!=undefined){
      url="https://www.googleapis.com/youtube/v3/search?order=date&part=snippet&channelId="+channelId+"&maxResults=5&key="+process.env.youtubeKey;

      request(url,function(error,response,html){
        if(error) console.log(error);
        var json=JSON.parse(html);
        callback("https://youtu.be/"+json.items[0].id.videoId);
      });
    }else{
      callback("");
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
