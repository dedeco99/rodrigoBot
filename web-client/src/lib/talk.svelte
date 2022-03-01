<script>
	export let data = {};
</script>

<div>
	<b>{data.prompt}</b>
	<pre>{data.response}</pre>
</div>

<style lang="scss">
	pre {
		white-space: pre-line;
		margin-left: 10px;
	}
</style>
