const discord = require("discord.js");

exports.createRedditEmbed = (res) => {
	const embed = new discord.RichEmbed();

	if (res.contentVideo !== "") return res.contentVideo;

	embed.setTitle(res.title);
	embed.setURL(res.url);
	embed.setColor("0x00AE86");

	if (res.content !== "") {
		embed.setThumbnail(res.image);
		embed.addField("Content", res.content);
	} else if (res.contentImage !== "") {
		embed.setImage(res.contentImage);
	}

	embed.setFooter(`From: ${res.subreddit} | Upvotes: ${res.score} | `);

	return embed;

};

const prettyNumber = (number) => {
	return String(parseFloat(number).toFixed(2)).replace(/(?!^)(?=(?:\d{3})+(?:\.|$))/gm, " ");
};

exports.createCryptoEmbed = (res) => {
	const embed = new discord.RichEmbed();

	embed.setTitle(`${res.rank}. ${res.name} (${res.symbol})`);
	embed.setColor("0x00AE86");

	embed.addField("Price (€)", `${res.priceEur.toFixed(2)} €`, true);

	const marketcapEur = prettyNumber(res.marketcapEur);
	embed.addField("Marketcap (€)", `${marketcapEur} €`, true);

	const availableSupply = prettyNumber(res.availableSupply);
	embed.addField("Available Supply", `${availableSupply} ${res.symbol}`, true);

	const totalSupply = prettyNumber(res.totalSupply);
	embed.addField("Total Supply", `${totalSupply} ${res.symbol}`, true);

	embed.setFooter(`1h: ${res.change1h.toFixed(2)}% | 24h: ${res.change24h.toFixed(2)}% | 7d: ${res.change7d.toFixed(2)}%`);

	return embed;
};

exports.createSearchEmbed = (res) => {
	const embed = new discord.RichEmbed();

	embed.setTitle(res[0].topic);
	embed.setColor("0x00AE86");

	for (let i = 0; i < 3; i++) {
		embed.addField(res[i].title, res[i].link);
		embed.addField("Description", res[i].description);
	}

	return embed;
};

exports.createDefineEmbed = (res) => {
	const embed = new discord.RichEmbed();

	embed.setTitle(res.word);
	embed.setColor("0x00AE86");
	embed.addField(res.definition, res.example);

	return embed;
};

exports.createImageEmbed = (msg, res) => {
	const embed = new discord.RichEmbed();

	embed.setColor("0x00AE86");
	embed.setImage(res);

	msg.channel.send(embed);
};

exports.createTextEmbed = (msg, res) => {
	const embed = new discord.RichEmbed();

	embed.setColor("0x00AE86");
	embed.addField("Commands", res.example);

	msg.channel.send(embed);
};

exports.createPollEmbed = (msg, res) => {
	const embed = new discord.RichEmbed();

	embed.setColor("0x00AE86");
	embed.setTitle(res.title);

	const reacts = ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬", "🇭", "🇮", "🇯", "🇰"];

	for (let i = 0; i < res.options.length; i++) {
		embed.addField("----------", `${reacts[i]} - ${res.options[i]}`);
	}

	msg.channel.send(embed)
		.then(async (message) => {
			for (let i = 0; i < res.options.length; i++) {
				await message.react(reacts[i]);
			}
		});
};

exports.createInstaEmbed = (res) => {
	const embed = new discord.RichEmbed();

	embed.setColor("0xbc2a8d");
	embed.setThumbnail(res.profilePic);
	embed.setTitle(res.name);
	embed.setURL(res.url);
	embed.addField("Bio", res.bio);

	if (res.image === null) {
		embed.addField("Erro", res.error);
	} else {
		embed.setImage(res.image);
	}

	embed.setFooter(`Posts: ${res.posts} | Followers: ${res.followers} | Follows: ${res.follows}`);

	return embed;
};

exports.createPriceEmbed = (res) => {
	const embed = new discord.RichEmbed();

	embed.setColor("0xff9900");
	embed.setTitle(res[0].search);
	embed.setURL(res[0].url);

	for (let i = 0; i < res.length; i++) {
		embed.addField(res[i].price, `[${res[i].product}](${res[i].productUrl})`);
	}

	return embed;
};
