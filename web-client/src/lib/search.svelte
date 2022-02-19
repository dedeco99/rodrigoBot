<script>
	export let data = {};
</script>

<div>
	<h3>{data.topic}</h3>
	{#each data.results as result}
		<div class="result">
			<a href={result.link} target="_blank"><b>{result.title}</b></a>
			<br />
			<div class="description">{result.description}</div>
		</div>
	{/each}
</div>

<style lang="scss">
	h3 {
		text-align: center;
	}

	a {
		color: #ffc800;
	}

	.result {
		background: #222;
		border-radius: 5px;
		padding: 10px;
		margin: 5px 0px;

		.description {
			font-size: 0.75em;
		}
	}
</style>
