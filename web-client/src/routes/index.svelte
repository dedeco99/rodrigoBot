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
	let command = null;
	let options = {};
	let chat = [];

	const commands = {
		define: { name: "define", options: ["word"], component: Define },
		search: { name: "search", options: ["word"], component: Search },
		sort: { name: "sort", options: ["values"], component: Sort },
		math: { name: "math", options: ["expression"], component: Math },
		weather: { name: "weather", options: ["location"], component: Weather },

		convert: { name: "convert", options: ["number", "from", "to"], component: Convert },
		crypto: { name: "crypto", options: ["symbol"], component: Crypto },
		stock: { name: "stock", options: ["symbol"], component: Stock },

		instagram: { name: "instagram", options: ["handle"], component: Instagram },
		reddit: { name: "reddit", options: ["subreddit"], component: Reddit },
		youtube: { name: "youtube", options: ["channel"], component: Youtube },
	};

	function handleInput() {
		const regex = /(?<isCommand>\/)(?<command>\w+)/;

		const match = prompt.match(regex);

		if (match && commands[match.groups.command]) {
			command = commands[match.groups.command];
		} else {
			command = null;
			options = {};
		}
	}

	async function sendCommand(e) {
		if (!command) return;

		for (let i = 0; i < command.options.length; i++) {
			if (!options[command.options[i]]) return alert("400 Bad Request");
		}

		const res = await fetch(`http://localhost:5000/api/commands/${command.name}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(options),
		});

		const json = await res.json();

		if (res.status === 200) {
			chat = [{ command: command.name, data: json.data }, ...chat];
		} else {
			// TODO: translate message
			chat = [json.message, ...chat];
		}

		prompt = "";
		command = null;
		options = {};
	}

	function preventDefault(e) {
		e.preventDefault();
	}

	function handleKeypress(e) {
		preventDefault(e);

		if (e.key === "Enter") {
			sendCommand(e);
		} else {
			handleInput();
		}
	}
</script>

<div>
	<form on:submit={preventDefault} on:keyup={handleKeypress}>
		<input
			class="prompt"
			type="text"
			bind:value={prompt}
			style="--width: {prompt.length ? `${prompt.length + 0.5}ch` : '100%'}"
		/>
		{#if command}
			{#each command.options as option}
				<label for={option}>{option}:</label>
				<input class="option" id={option} bind:value={options[option]} />
			{/each}
		{/if}
	</form>
	<div class="chat">
		{#each chat as message}
			<div class="message">
				{#if typeof message === "string"}
					{message}
				{:else}
					<svelte:component this={commands[message.command].component} data={message.data} />
				{/if}
			</div>
		{/each}
	</div>
	<br />
</div>

<style lang="scss">
	form {
		width: 600px;
		display: flex;
		align-items: center;
		background: #444;
		border-radius: 5px;

		input {
			height: 30px;
			background: none;
			color: white;
			border: none;
			font-size: 1.25em;
			font-family: "Source Code Pro", monospace;
			margin: 10px;
		}

		.prompt {
			width: var(--width);
		}

		label {
			background: #222;
			padding: 2px 10px;
			border-radius: 5px;
		}

		.option {
			width: 100%;
		}
	}

	.chat {
		width: 600px;
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
