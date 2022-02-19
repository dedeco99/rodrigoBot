<script>
	import { formatDate } from "../utils/utils";

	export let data = {};
</script>

<a href={data.permalink} target="_blank" class="title">{data.title}</a>
{#if data.contentImage}
	<img class="image" src={data.contentImage} alt={data.title} />
{:else}
	<pre>{data.content}</pre>
{/if}
<div class="info">
	<div class="chip">r/{data.subreddit}</div>
	<div class="chip">⤊ {data.score}</div>
	<div class="chip">💻 {data.comments}</div>
	<div class="chip">{formatDate(data.created * 1000, null, true)}</div>
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

	pre {
		white-space: pre-line;
		margin: 10px;
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
