<script>
	import { listen } from "svelte/internal";

	export let data = {};
</script>

<div class="sort">
	{data.list.join(" > ")}
</div>

<style lang="scss">
	.sort {
		text-align: center;
	}
</style>
