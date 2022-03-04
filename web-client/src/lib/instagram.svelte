<script>
	import { simplifyNumber } from "../utils/utils";

	export let data = {};
</script>

<a href={data.url} target="_blank" class="title">{data.name}</a>
{#if data.isPrivate}
	PRIVATE
{:else}
	<img class="image" src={data.image} alt={data.name} />
{/if}
<div class="info">
	<div class="chip">🪧 {simplifyNumber(data.posts)}</div>
	<div class="chip">👁 {simplifyNumber(data.followers)}</div>
	<div class="chip">⤊ {simplifyNumber(data.follows)}</div>
</div>

<style lang="scss">
	.title {
		font-size: 1.1em;
		color: #ffc800;
	}

	.image {
		width: 100%;
		padding: 5px 0px;
	}

	.info {
		display: flex;
		gap: 10px;

		.chip {
			width: fit-content;
			font-size: 0.75em;
			background: #555;
			border-radius: 10px;
			padding: 2px 10px;
		}
	}
</style>
