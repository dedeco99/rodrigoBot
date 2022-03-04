<script>
	export let data = {};
</script>

<div class="row first">
	<div>
		<div class="location">{data.location}, {data.country}</div>
		<div class="forecast">{data.forecast.description}</div>
	</div>
	<div>
		<div class="temp">{Math.round(data.temp)}°</div>
		<div class="minMaxTemps">▲ {data.maxTemp}° ▼ {data.minTemp}°</div>
	</div>
</div>
<div class="row">
	<div>
		<div>🌧 {data.clouds}%</div>
		<div class="wind">
			<div class="windDirection" style="--windDirection: {data.windDirection}deg">⤊</div>
			{Math.round(data.windSpeed)} m/s
		</div>
	</div>
	<img src={data.forecast.image} alt={data.forecast.description} />
	<div>
		<div>🌅 {data.sunrise}</div>
		<div>🌇 {data.sunset}</div>
	</div>
</div>

<style lang="scss">
	.row {
		display: flex;
		justify-content: space-evenly;
		align-items: center;

		&.first {
			justify-content: space-between;
		}

		.location {
			font-size: 2em;
		}

		.forecast {
			text-transform: capitalize;
			font-size: 1.25em;
		}

		.temp {
			font-size: 2.35em;
			text-align: right;
		}

		.minMaxTemps {
			font-size: 0.85em;
		}

		.wind {
			display: flex;
			gap: 10px;

			.windDirection {
				transform: rotate(var(--windDirection));
				font-size: 1.25em;
			}
		}
	}
</style>
