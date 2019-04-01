var request = require("request");

exports.getPrice = (data, callback) => {
  var url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/map";
  var headers = {"X-CMC_PRO_API_KEY": process.env.coinmarketcapKey};

  request({url, headers}, (error, response, html) => {
    if(error) console.log(error);
    var json = JSON.parse(html);

    var res;

    if(json.error){
      res = {error: "Este Market Cap tá na xixada (down)"};
    }else{
      var coinId;
      var checkCoinName = (searchCoin, coin) => {
        if(searchCoin.charAt(0).toUpperCase() + searchCoin.slice(1) === coin.name
        || searchCoin.toUpperCase() === coin.symbol){
          return true;
        }else{
          return false;
        }
      };

      for(var i = 0; i < json.data.length; i++){
        var coin = json.data[i];
        if(checkCoinName(data, coin)){
          coinId = coin.id;
          break;
        }
      }

      if(!coinId){
        res = {error: "Essa moeda deve estar no xixo porque não a encontro"};
        callback(res);
      }else{
        url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=" + coinId + "&&convert=EUR";

        request({url, headers}, (error, response, html) => {
          if(error) console.log(error);
          var json = JSON.parse(html);

          if(json.error){
            res= {error: "Este Market Cap tá na xixada (down)"};
          }else{
            res = {
              symbol: json.data[coinId].symbol,
              rank: json.data[coinId].cmc_rank,
              name: json.data[coinId].name,
              priceEur: json.data[coinId].quote.EUR.price,
              marketcapEur: json.data[coinId].quote.EUR.market_cap,
              volumeEur: json.data[coinId].quote.EUR.volume_24h,
              availableSupply: json.data[coinId].total_supply,
              totalSupply: json.data[coinId].max_supply,
              change1h: json.data[coinId].quote.EUR.percent_change_1h,
              change24h: json.data[coinId].quote.EUR.percent_change_24h,
              change7d: json.data[coinId].quote.EUR.percent_change_7d
            };
          }

          callback(res);
        });
      }
    }
  });
};
