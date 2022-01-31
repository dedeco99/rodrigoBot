const embed = require("../utils/embed");

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

function vote(options) {
	/*
	if (message[2] === "results") {
		const poll = message[3];

		const voteMessage = await msg.channel.fetchMessage(poll);

		voteMessage.reactions.forEach(async reaction => {
			const users = await reaction.fetchUsers();
			const userRes = users.map(user => user.username).join(" | ");

			msg.channel.send(`${reaction._emoji.name}: ${reaction.count} votos (${userRes})`);
		});
	}
	*/

	return embed.createPollEmbed({ title: options.title, options: options.options.split(";") });
}

async function voteReactions(msg, options) {
	const reacts = ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬", "🇭", "🇮", "🇯", "🇰"];

	const promises = [];
	for (let i = 0; i < options.options.split(";").length; i++) {
		promises.push(msg.react(reacts[i]));
	}

	await Promise.all(promises);
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

module.exports = { remindMe, vote, voteReactions, pin };
