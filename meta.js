var request = require("request");

exports.getMeta = () => {
    const url = "https://api.mlab.com/api/1/databases/rodrigo/collections/meta?apiKey=" + process.env.databaseKey;

    request(url, (error, response, html) => {
        if(error) console.log(error);
        const json = JSON.parse(html);
        
        process.env.meta = JSON.stringify(json[0]);
    });
};

exports.updateMeta = (obj) => {
    let meta = JSON.parse(process.env.meta);
    const url = "https://api.mlab.com/api/1/databases/rodrigo/collections/meta/" + meta._id.$oid + "?apiKey=" + process.env.databaseKey;

    const body = {
        "action": obj.action ? obj.action : meta.action,
        "likes": obj.likes ? obj.likes : meta.likes,
        "dislikes": obj.dislikes ? obj.dislikes : meta.dislikes
    };

    request.put({url, body, json: true}, (error, response, html) => {
        if(error) console.log(error);
        const json = html;

        process.env.meta = JSON.stringify(json);
    });
};