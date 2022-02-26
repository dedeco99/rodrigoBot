<script>
	import { onMount } from "svelte";

	import "../styles/global.css";

	import Title from "$lib/title.svelte";
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

	import { translate } from "../utils/utils";

	let loading = false;
	let prompt = "";
	let autocompleteCommands = [];
	let selectedAutocompleteIndex = 0;
	let command = null;
	let options = {};
	let chat = [];
	let error = null;

	const commands = {
		define: { name: "define", options: ["word"], component: Define },
		search: { name: "search", options: ["topic"], component: Search },
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

	function handleInput(e) {
		if (["ArrowDown", "ArrowUp"].includes(e.key) && autocompleteCommands.length) {
			selectedAutocompleteIndex =
				e.key === "ArrowDown" && selectedAutocompleteIndex < autocompleteCommands.length - 1
					? selectedAutocompleteIndex + 1
					: e.key === "ArrowUp" && selectedAutocompleteIndex > 0
					? selectedAutocompleteIndex - 1
					: selectedAutocompleteIndex;
		} else if (e.key === "Enter" && autocompleteCommands[selectedAutocompleteIndex]) {
			prompt = `/${autocompleteCommands[selectedAutocompleteIndex].name}`;

			handleInput({ key: null });
		} else {
			const regex = /(?<isCommand>\/)(?<command>\w+)/;

			const match = prompt.match(regex);

			if (match && commands[match.groups.command]) {
				command = commands[match.groups.command];
			} else {
				command = null;
				options = {};
				error = "";
			}

			autocompleteCommands = [];
			if (match) {
				for (const name in commands) {
					if (name.includes(match.groups.command)) autocompleteCommands.push(commands[name]);
				}
			} else if (prompt === "/") {
				autocompleteCommands = Object.values(commands);
			}
		}
	}

	function autocompleteCommand(command) {
		prompt = `/${command}`;

		handleInput({ key: null });
	}

	async function sendCommand() {
		if (!command) return;

		loading = true;

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

			prompt = "";
			command = null;
			options = {};
			autocompleteCommands = [];
			selectedAutocompleteIndex = 0;
			error = "";

			focusOnPrompt();
		} else {
			error = translate(json.message);
		}

		loading = false;
	}

	function focusOnPrompt() {
		document.getElementById("prompt").focus();
	}

	function preventDefault(e) {
		e.preventDefault();
	}

	function handleKeypress(e) {
		preventDefault(e);

		if (e.key === "Enter" && command) {
			sendCommand();
		} else {
			handleInput(e);
		}
	}

	onMount(async () => {
		focusOnPrompt();
	});
</script>

<div>
	<header><Title title="RodrigoBot" {loading} /></header>
	<main>
		<div class="promptContainer">
			<div class="error" style="--opacity: {error ? 1 : 0};--top: {error ? '-42px' : '10px'}">{error}</div>
			<form autocomplete="off" on:submit={preventDefault} on:keyup={handleKeypress}>
				<input
					id="prompt"
					class="prompt"
					type="text"
					bind:value={prompt}
					style="--width: {prompt.length ? `${prompt.length + 0.5}ch` : '100%'}"
				/>
				{#if command}
					{#each command.options as option}
						<label class="option" for={option}>{option}:</label>
						<input class="optionInput" id={option} bind:value={options[option]} />
					{/each}
				{/if}
			</form>
			{#if autocompleteCommands.length}
				<div class="autocomplete">
					{#each autocompleteCommands as command, index}
						<div
							class={`command ${index === selectedAutocompleteIndex ? "selected" : ""}`}
							on:click={() => autocompleteCommand(command.name)}
						>
							/{command.name}{#each command.options as option}<span class="option">{option}</span>{/each}
						</div>
					{/each}
				</div>
			{/if}
		</div>
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
	</main>
</div>

<style lang="scss">
	@mixin containerBox {
		width: 600px;
		background: #444;
		border-radius: 5px;
		margin: 5px 0px;

		.option {
			background: #222;
			padding: 2px 10px;
			border-radius: 5px;
		}
	}

	header {
		height: 325px;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	main {
		height: calc(100vh - 325px - 20px);
		min-height: 455px;
		margin-bottom: 20px;
	}

	.error {
		@include containerBox;

		opacity: var(--opacity);
		width: fit-content;
		top: var(--top);
		position: absolute;
		background: #b00020;
		padding: 5px;
		text-align: center;
		transition: opacity 250ms ease-in-out, top 250ms ease-in-out;
	}

	.promptContainer {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;

		form {
			@include containerBox;

			display: flex;
			align-items: center;

			input {
				height: 30px;
				background: none;
				color: white;
				border: none;
				outline: none;
				font-size: 1.25em;
				font-family: "Source Code Pro", monospace;
				margin: 10px;
			}

			.prompt {
				width: var(--width);
			}

			.optionInput {
				width: 100%;
			}
		}

		.autocomplete {
			@include containerBox;

			width: 700px;
			display: flex;
			flex-direction: column;
			background: #333;
			max-height: 300px;
			overflow: auto;
			margin: 0px;
			position: absolute;
			top: 65px;
			z-index: 1;
			box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;

			.command {
				display: flex;
				gap: 10px;
				padding: 10px;
				margin: 5px;
				border-radius: 5px;

				&:hover {
					background: #555;
					cursor: pointer;
				}
			}

			.selected {
				background: #888;
			}
		}
	}

	.chat {
		@include containerBox;

		height: calc(100% - 60px);
		padding: 0px 10px;
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
