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
		height: 325px;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	main {
		height: calc(100vh - 325px - 50px);
		display: flex;
		justify-content: center;
	}

	footer {
		height: 50px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
