<script>
	let prompt = "";
	let chat = [];

	async function sendCommand(e) {
		e.preventDefault();

		const commands = {
			define: { regex: /(?<word>.+)/, options: ["word"] },
			search: { regex: /(?<word>.+)/, options: ["word"] },
			sort: { regex: /(?<values>.+)/, options: ["values"] },
			math: { regex: /(?<expression>.+)/, options: ["expression"] },
			weather: { regex: /(?<location>.+)/, options: ["location"] },

			convert: { regex: /(?<number>[0-9]+) (?<from>\w+) (?<to>\w+)/, options: ["number", "from", "to"] },
			crypto: { regex: /(?<symbol>.+)/, options: ["symbol"] },
			stock: { regex: /(?<symbol>.+)/, options: ["symbol"] },

			instagram: { regex: /(?<handle>.+)/, options: ["handle"] },
			reddit: { regex: /(?<subreddit>.+)/, options: ["subreddit"] },
			youtube: { regex: /(?<channel>.+)/, options: ["channel"] },
		};

		const regex = /(?<isCommand>\/)(?<command>\w+) (?<options>.+)/;

		const match = prompt.match(regex);

		if (match) {
			const command = match.groups.command;
			const options = match.groups.options.match(commands[command].regex);

			const validatedOptions = {};
			for (let i = 0; i < commands[command].options.length; i++) {
				validatedOptions[commands[command].options[i]] = options.groups[commands[command].options[i]];
			}

			const res = await fetch(`http://localhost:5000/api/commands/${command}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(validatedOptions),
			});

			const json = await res.json();

			if (res.status === 200) {
				chat = [...chat, JSON.stringify(json.data)];
			} else {
				// TODO: translate message
				chat = [...chat, json.message];
			}

			prompt = "";
		}
	}
</script>

<div>
	<form on:submit={sendCommand}>
		<input class="prompt" type="text" bind:value={prompt} />
	</form>
	{#if chat.length}
		<div class="chat">
			{#each chat as message}
				<div class="message">{message}</div>
			{/each}
		</div>
	{/if}
	<br />
</div>

<style lang="scss">
	.prompt {
		width: 500px;
		height: 50px;
		background: #444;
		border-radius: 5px;
		border: 0px;
		color: white;
		font-size: 2em;
	}

	.chat {
		width: 500px;
		background: #444;
		border-radius: 5px;
		padding: 10px;
		margin: 10px 0px;
	}

	.message {
		background: #333;
		border-radius: 5px;
		padding: 10px;
		margin: 10px 0px;
		word-wrap: break-word;

		&:hover {
			background: #555;
		}
	}
</style>
