<script>
	export let title = "";
	export let loading = false;
</script>

<div>
	<h1>{title}</h1>
	<div class="logoContainer">
		<img class="logo" src="/logo.png" width="200px" alt="Logo" />
		<img class="loading" src="/loading.gif" alt="Loading" style="--opacity: {loading ? 1 : 0}" />
	</div>
</div>

<style lang="scss">
	.logoContainer {
		position: relative;
	}

	.logo {
		margin-top: 15px;
	}

	.loading {
		opacity: var(--opacity);
		width: 150px;
		top: -15px;
		left: 185px;
		position: absolute;
		transition: opacity 500ms ease-in-out;
	}
</style>
