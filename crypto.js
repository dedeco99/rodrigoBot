var request=require("request");
var cheerio=require("cheerio");

exports.getPrice=function(data,callback){
  if(data.coin=="bat" || data.coin=="BAT") data.coin="basic-attention-token";
  var url="https://api.coinmarketcap.com/v1/ticker/"+data.coin+"/?convert=EUR";

  request(url,function(error,response,html){
    if(error) console.log(error);
    var json=JSON.parse(html);

    if(json.error){
      res=null;
    }else{
      var res=[];
      var volumeEur=(json[0]["24h_volume_usd"]*json[0].price_eur)/json[0].price_usd;
      var marketcapEur=(json[0].market_cap_usd*json[0].price_eur)/json[0].price_usd;
      res.push({
        symbol:json[0].symbol,
        rank:json[0].rank,
        name:json[0].name,
        priceEur:json[0].price_eur,
        priceUsd:json[0].price_usd,
        marketcapEur:marketcapEur,
        marketcapUsd:json[0].market_cap_usd,
        volumeEur:volumeEur,
        volumeUsd:json[0]["24h_volume_usd"],
        availableSupply:json[0].available_supply,
        totalSupply:json[0].total_supply,
        change1h:json[0].percent_change_1h,
        change24h:json[0].percent_change_24h,
        change7d:json[0].percent_change_7d
      });
    }
    if(res!=null){
      callback(res);
    }else{
      callback("");
    }
  });
}
