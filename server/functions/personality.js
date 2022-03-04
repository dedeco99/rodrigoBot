const cleverbot = require("cleverbot-free");

const { updateMetadata } = require("../utils/database");

async function compliment() {
	const metaInfo = await updateMetadata({ likes: true });

	return `Durante a minha existência já gostaram de mim ${metaInfo.likes} vezes. I can't handle it!!! *touches face violently*`;
}

async function insult() {
	const metaInfo = await updateMetadata({ dislikes: true });

	return `Durante a minha existência já me deram bullying ${metaInfo.dislikes} vezes. Vou chamar os meus pais. *cries while getting hit with a laptop*`;
}

async function talk(options) {
	const { prompt, conversation } = options;

	const response = await cleverbot(prompt, conversation);

	console.log(prompt, conversation, response);

	return {
		status: 200,
		body: {
			message: "TALK_SUCCESS",
			data: { prompt, response },
		},
	};
}

module.exports = { compliment, insult, talk };
