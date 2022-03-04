<script>
	import { formatDate, simplifyNumber } from "../utils/utils";

	export let data = {};
</script>

<a href={data.url} target="_blank" class="title">{data.videoTitle}</a>
<iframe
	class="video"
	title={data.videoTitle}
	src={`https://www.youtube.com/embed/${data.videoId}`}
	frameBorder={0}
	allowFullScreen
/>
<div class="info">
	<div class="chip">{data.channelName}</div>
	<div class="chip">👁 {simplifyNumber(data.views)}</div>
	<div class="chip">{formatDate(data.published, null, true)}</div>
</div>

<style lang="scss">
	.title {
		font-size: 1.1em;
		color: #ffc800;
	}

	.video {
		width: 100%;
		height: 230px;
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
