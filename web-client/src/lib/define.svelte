<script>
	export let data = {};
</script>

<div>
	<h3>{data.word}</h3>
	<div>
		<b>Definition</b>
		<pre>{data.definition}</pre>
	</div>
	<div>
		<b>Example</b>
		<pre>{data.example}</pre>
	</div>
</div>

<style lang="scss">
	h3 {
		text-align: center;
	}

	pre {
		white-space: pre-line;
		margin-left: 10px;
	}
</style>
