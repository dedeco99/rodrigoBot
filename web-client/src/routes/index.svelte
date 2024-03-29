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
	import Talk from "$lib/talk.svelte";

	import { translate } from "../utils/utils";

	let animate = false;
	let loading = false;
	let prompt = "";
	let autocompleteCommands = [];
	let selectedAutocompleteIndex = 0;
	let command = null;
	let options = {};
	let chat = [];
	let error = null;
	let conversation = [];

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

		talk: { hidden: true, name: "talk", options: ["prompt", "conversation"], component: Talk },
	};

	function handleInput(e) {
		if (["ArrowDown", "ArrowUp"].includes(e.key) && autocompleteCommands.length) {
			selectedAutocompleteIndex += e.key === "ArrowDown" ? 1 : -1;
		} else if (["Enter", "Tab"].includes(e.key) && autocompleteCommands[selectedAutocompleteIndex]) {
			prompt = `/${autocompleteCommands[selectedAutocompleteIndex].name}`;

			if (e.key === "Enter" || (e.key === "Tab" && !command)) {
				setTimeout(() => document.getElementById(command.options[0]).focus(), 1);
			}

			handleInput({ key: null });
		} else {
			const regex = /(?<isCommand>\/)(?<command>\w+)/;

			const match = prompt.match(regex);

			if (match && commands[match.groups.command] && !commands[match.groups.command].hidden) {
				command = commands[match.groups.command];
			} else {
				command = null;
				options = {};
				error = "";
			}

			autocompleteCommands = [];
			if (match) {
				for (const name in commands) {
					if (name.includes(match.groups.command) && !commands[name].hidden) {
						autocompleteCommands.push(commands[name]);
					}
				}
			} else if (prompt === "/") {
				autocompleteCommands = Object.values(commands);
			}
		}

		selectedAutocompleteIndex =
			selectedAutocompleteIndex > autocompleteCommands.length - 1
				? autocompleteCommands.length - 1
				: selectedAutocompleteIndex < 0
				? 0
				: selectedAutocompleteIndex;
	}

	function autocompleteCommand(command) {
		prompt = `/${command}`;

		handleInput({ key: null });
	}

	async function sendCommand() {
		loading = true;

		let commandFound = command;
		if (!commandFound) {
			commandFound = commands.talk;

			options = { prompt, conversation };
		}

		for (let i = 0; i < commandFound.options.length; i++) {
			if (!options[commandFound.options[i]]) {
				error = translate("REQUIRED_FIELDS_MISSING");
				loading = false;
				return;
			}
		}

		const res = await fetch(`https://rodrigo.rabbitsoftware.dev/api/commands/${commandFound.name}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(options),
		});

		const json = await res.json();

		if (res.status === 200) {
			chat = [{ command: commandFound.name, data: json.data }, ...chat];

			if (commandFound.name === "talk") conversation.push(prompt, json.data.response);

			prompt = "";
			command = null;
			options = {};
			autocompleteCommands = [];
			selectedAutocompleteIndex = 0;
			error = "";

			focusOnPrompt();

			animate = false;
			setTimeout(() => (animate = true), 100);
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

		if (e.key === "Enter" && (command || prompt[0] !== "/")) {
			sendCommand();
		} else {
			handleInput(e);
		}
	}

	function handleTab(e) {
		if (e.key === "Tab" && !command) preventDefault(e);
	}

	onMount(focusOnPrompt);
</script>

<div>
	<header><Title title="RodrigoBot" {loading} /></header>
	<main>
		<div class="promptContainer">
			<div class="error" style="--opacity: {error ? 1 : 0};--top: {error ? '-42px' : '10px'}">{error}</div>
			<form autocomplete="off" on:submit={preventDefault} on:keyup={handleKeypress} on:keydown={handleTab}>
				<input
					id="prompt"
					class="prompt"
					type="text"
					placeholder={translate("PROMPT_PLACEHOLDER")}
					bind:value={prompt}
					style="--width: {prompt.length ? `${prompt.length + 0.5}ch` : '100%'}"
				/>
				{#if command}
					{#each command.options as option}
						<label class="option animate" for={option}>{option}:</label>
						<input class="optionInput" id={option} bind:value={options[option]} />
					{/each}
				{/if}
			</form>
			<div
				class="autocomplete"
				style="--opacity: {autocompleteCommands.length ? 1 : 0}; --height: {autocompleteCommands.length * 57}px"
			>
				{#each autocompleteCommands as command, index}
					<div
						class={`command ${index === selectedAutocompleteIndex ? "selected" : ""}`}
						on:click={() => autocompleteCommand(command.name)}
					>
						/{command.name}{#each command.options as option}<span class="option">{option}</span>{/each}
					</div>
				{/each}
			</div>
		</div>
		<div class="chat">
			{#each chat as message, index}
				<div class="message {index === 0 && animate ? 'animate' : ''}">
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

			.option {
				opacity: 0;
				&.animate {
					animation: fadeIn 500ms ease-in-out forwards;

					&:nth-child(4) {
						animation-delay: 150ms;
					}

					&:nth-child(6) {
						animation-delay: 300ms;
					}
				}
			}

			.optionInput {
				width: 100%;
			}
		}

		.autocomplete {
			@include containerBox;

			opacity: var(--opacity);
			width: 700px;
			display: flex;
			flex-direction: column;
			background: #333;
			height: var(--height);
			max-height: 300px;
			overflow: auto;
			margin: 0px;
			position: absolute;
			top: 65px;
			z-index: 1;
			box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
			transition: opacity 250ms ease-in-out, height 500ms ease-in-out;

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
		opacity: 0;
		background: #333;
		border-radius: 5px;
		padding: 10px;
		margin: 10px 0px;
		font-size: 0.85em;
		transition: background 250ms ease-in-out;

		&.animate {
			opacity: 1;
			animation: drop 1s ease-in-out forwards, fadeIn 500ms ease-in;
		}

		&:not(:first-child) {
			opacity: 1;
		}

		&:hover {
			background: #555;
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes drop {
		0% {
			transform: translateY(-100%);
		}
		50% {
			transform: translateY(5%);
		}
		100% {
			transform: translateY(0%);
		}
	}
</style>
