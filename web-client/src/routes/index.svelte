<script>
	let prompt = "";
	let chat = [];

	function sendCommand(e) {
		e.preventDefault();

		chat = [...chat, prompt];

		prompt = "";
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

		&:hover {
			background: #555;
		}
	}
</style>
