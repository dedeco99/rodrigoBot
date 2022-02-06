<script>
	import { listen } from "svelte/internal";

	export let data = {};
</script>

<div class="sort">
	{#each data.list as value, index}
		{#if index === data.list.length - 1}
			{value}
		{:else}
			{`${value} > `}
		{/if}
	{/each}
</div>

<style lang="scss">
	.sort {
		text-align: center;
	}
</style>
