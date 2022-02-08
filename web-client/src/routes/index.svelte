<script>
	import Define from "$lib/define.svelte";
	import Search from "$lib/search.svelte";
	import Sort from "$lib/sort.svelte";
	import Math from "$lib/math.svelte";
	import Weather from "$lib/weather.svelte";
	import Convert from "$lib/convert.svelte";
	import Crypto from "$lib/crypto.svelte";
	import Stock from "$lib/stock.svelte";
	import Instagram from "$lib/instagram.svelte";
	import Reddit from "$lib/reddit.svelte";
	import Youtube from "$lib/youtube.svelte";

	let prompt = "";
	let chat = [];

	const commands = {
		define: { regex: /(?<word>.+)/, options: ["word"], component: Define },
		search: { regex: /(?<word>.+)/, options: ["word"], component: Search },
		sort: { regex: /(?<values>.+)/, options: ["values"], component: Sort },
		math: { regex: /(?<expression>.+)/, options: ["expression"], component: Math },
		weather: { regex: /(?<location>.+)/, options: ["location"], component: Weather },

		convert: {
			regex: /(?<number>[0-9]+) (?<from>\w+) (?<to>\w+)/,
			options: ["number", "from", "to"],
			component: Convert,
		},
		crypto: { regex: /(?<symbol>.+)/, options: ["symbol"], component: Crypto },
		stock: { regex: /(?<symbol>.+)/, options: ["symbol"], component: Stock },

		instagram: { regex: /(?<handle>.+)/, options: ["handle"], component: Instagram },
		reddit: { regex: /(?<subreddit>.+)/, options: ["subreddit"], component: Reddit },
		youtube: { regex: /(?<channel>.+)/, options: ["channel"], component: Youtube },
	};

	async function sendCommand(e) {
		e.preventDefault();

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
				chat = [{ command, data: json.data }, ...chat];
			} else {
				// TODO: translate message
				chat = [json.message, ...chat];
			}

			prompt = "";
		}
	}
</script>

<div>
	<form on:submit={sendCommand}>
		<input class="prompt" type="text" bind:value={prompt} />
	</form>
	<div class="chat">
		{#each chat as message}
			<div class="message">
				<svelte:component this={commands[message.command].component} data={message.data} />
			</div>
		{/each}
	</div>
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
		height: calc(100% - 60px);
		background: #444;
		border-radius: 5px;
		padding: 10px;
		margin: 10px 0px;
		overflow-x: hidden;
		overflow-y: auto;
	}

	.message {
		background: #333;
		border-radius: 5px;
		padding: 10px;
		margin: 10px 0px;
		font-size: 0.85em;

		&:hover {
			background: #555;
		}
	}
</style>
