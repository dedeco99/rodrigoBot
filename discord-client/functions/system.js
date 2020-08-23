const { updateMeta } = require("../utils/database");

function deleteLastMsg(msg) {
	if (global.lastMsgs.length) {
		const lastMessage = global.lastMsgs[global.lastMsgs.length - 1];
		if (lastMessage.channel.id === msg.channel.id) {
			lastMessage.delete();
			global.lastMsgs.pop();
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
	deleteLastMsg,
	compliment,
	insult,
};
