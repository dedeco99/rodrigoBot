<script>
	import "../styles/global.css";

	import Title from "$lib/title.svelte";
</script>

<header><Title title="RodrigoBot" /></header>

<main><slot /></main>

<footer>
	<p>Copyright 2022 RabbitSoftware</p>
</footer>

<style>
	header {
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 20px;
	}

	main {
		height: 100%;
		display: flex;
		justify-content: center;
	}

	footer {
		text-align: center;
	}
</style>
