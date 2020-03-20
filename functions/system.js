/* global lastMsgs */

const { updateMeta } = require("../utils/database");

function help() {
	return "https://dedeco99.github.io/rodrigoBot/";
}

function deleteLastMsg(msg) {
	if (lastMsgs.length) {
		const lastMessage = lastMsgs[lastMsgs.length - 1];
		if (lastMessage.channel.id === msg.channel.id) {
			lastMessage.delete();
			lastMsgs.pop();
			msg.delete();
		}
	}
}

async function compliment() {
	const metaInfo = await updateMeta({ likes: true });

	return `Durante a minha existência já gostaram de mim ${metaInfo.likes} vezes. I can't handle it!!! *touches face violently*`;
}

async function insult() {
	const metaInfo = await updateMeta({ dislikes: true });

	return `Durante a minha existência já me deram bullying ${metaInfo.dislikes} vezes. Vou chamar os meus pais. *cries while getting hit with a laptop*`;

}

module.exports = {
	help,
	deleteLastMsg,
	compliment,
	insult,
};
