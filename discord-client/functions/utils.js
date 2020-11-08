const moment = require("moment");

const { get } = require("../utils/request");
const embed = require("../utils/embed");

const GroupBuy = require("../../discord-client/models/groupBuy");

function remindMe(msg) {
	const params = msg.content.split(" ");
	const remindVars = ["minutes", "hours", "days"];
	const remindVarsValues = {
		minutes: 60000,
		hours: 60000 * 60,
		days: 60000 * 60 * 24,
	};

	// Get reminder, remind time, and remind time unit
	const remindUnit = params.find(param => remindVars.includes(param));
	const remindTime = Number(params[params.indexOf(remindUnit) - 1] || 1);
	const reminder = params.filter(param => {
		return params.indexOf(param) > 2 && params.indexOf(param) < params.length - 3;
	});

	setTimeout(() => {
		msg.channel.send(reminder.join(" "));
	}, remindTime * remindVarsValues[remindUnit]);

	return "Ja te lembro";
}

async function vote(msg) {
	const message = msg.content.split(" ");

	if (message[2] === "results") {
		const poll = message[3];

		const voteMessage = await msg.channel.fetchMessage(poll);

		voteMessage.reactions.forEach(async reaction => {
			const users = await reaction.fetchUsers();
			const userRes = users.map(user => user.username).join(" | ");

			msg.channel.send(`${reaction._emoji.name}: ${reaction.count} votos (${userRes})`);
		});
	} else {
		const params = msg.content.split("vote ")[1];
		const options = params.split(";");
		const title = options[0];
		options.splice(0, 1);

		const res = {
			title,
			options,
		};

		return embed.createPollEmbed(msg, res);
	}

	return null;
}

async function pin(msg, isMessageToPin) {
	const pinChannelId = "716652868311973888";
	let message = msg;

	if (!isMessageToPin) {
		const id = msg.content.split("pin ")[1];

		message = await msg.channel.messages.fetch(id);
	}

	const channelMessages = await global.client.channels.cache.get(pinChannelId).messages.fetch();

	const duplicatedMessage = Array.from(channelMessages.values()).find(m => m.content.includes(message.id));

	if (!duplicatedMessage) {
		const permalink = `https://discordapp.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`;

		if (message.attachments.values().next().value) {
			const url = message.attachments.values().next().value.attachment;

			global.client.channels.cache.get(pinChannelId).send(`${permalink}\n`, { files: [url] });
		} else {
			global.client.channels.cache.get(pinChannelId).send(`${permalink}\n> ${message.content}`);
		}
	}

	return null;
}

async function keyboardGroupBuys() {
	const res = await get("https://mechgroupbuys.com/gb-data");
	const json = res.data;

	const liveGroupBuys = json
		.filter(i => {
			return (
				(i.type === "keyboards" || i.type === "keycaps" || i.type === "switches") &&
				i.startDate &&
				moment(i.startDate, "M/D/YY").diff(moment(), "days") <= 0 &&
				(!i.endDate || moment(i.endDate, "M/D/YY").diff(moment(), "days") >= 0)
			);
		})
		.map(i => ({
			name: i.name,
			type: i.type,
			image: i.mainImage,
			startDate: moment(i.startDate, "M/D/YY").format("DD/MM/YYYY"),
			endDate: moment(i.endDate, "M/D/YY").format("DD/MM/YYYY"),
			pricing: i.pricing,
			saleType: i.saleType,
			link: encodeURI(`https://mechgroupbuys.com/${i.type}/${i.name}`),
		}));

	for (const groupBuy of liveGroupBuys) {
		const groupBuyExists = await GroupBuy.findOne({ name: groupBuy.name });

		if (!groupBuyExists) {
			const newGroupBuy = new GroupBuy(groupBuy);

			await newGroupBuy.save();

			return groupBuy;
		}
	}

	return null;
}

module.exports = { remindMe, vote, pin, keyboardGroupBuys };
