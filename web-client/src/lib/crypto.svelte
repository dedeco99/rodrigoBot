<script>
	import { simplifyNumber } from "../utils/utils";

	export let data = {};

	function getColor(percentage) {
		return percentage >= 0 ? "green" : "red";
	}
</script>

<div class="row first">
	<div class="info">
		<img class="logo" src={data.image} alt={data.symbol} />
		<div class="name">
			<div>{data.name}</div>
			<div>{data.symbol} <span class="rank">{data.rank}</span></div>
		</div>
	</div>
	<div>
		<div class="price">{data.price.toFixed(2)}€</div>
	</div>
</div>
<div class="row">
	<div class="totals">
		<div class="value">
			Market Cap
			<span>€ {simplifyNumber(data.marketCap)}</span>
		</div>
		<div class="value">
			Volume
			<span>€ {simplifyNumber(data.volume)}</span>
		</div>
		<div class="value">
			Circulating Supply
			<span>{data.symbol} {simplifyNumber(data.circulatingSupply)}</span>
		</div>
		<div class="value">
			Max Supply
			<span>{data.symbol} {simplifyNumber(data.maxSupply)}</span>
		</div>
	</div>
	<div class="changes">
		<div class="value">
			1h
			<span class="percent" style="color: {getColor(data.change1h)}">{data.change1h.toFixed(1)}%</span>
		</div>
		<div class="value">
			24h
			<span class="percent" style="color: {getColor(data.change24h)}">{data.change24h.toFixed(1)}%</span>
		</div>
		<div class="value">
			7d
			<span class="percent" style="color: {getColor(data.change7d)}">{data.change7d.toFixed(1)}%</span>
		</div>
		<div class="value">
			30d
			<span class="percent" style="color: {getColor(data.change30d)}">{data.change30d.toFixed(1)}%</span>
		</div>
	</div>
</div>

<style lang="scss">
	.row {
		display: flex;
		justify-content: space-between;
		align-items: center;

		.info {
			display: flex;
			align-items: center;
			gap: 10px;

			.logo {
				width: 42px;
				height: 42px;
				margin: 5px;
			}

			.name {
				display: flex;
				flex-direction: column;

				:first-child {
					font-size: 1.5em;
				}

				.rank {
					font-size: 0.75em;
					background: #555;
					border-radius: 10px;
					padding: 1px 10px;
					top: -1px;
					position: relative;
				}
			}
		}

		.price {
			font-size: 2em;
			text-align: right;
		}

		@mixin insideBox {
			background: #222;
			border-radius: 5px;
			padding: 10px;
			margin-top: 10px;

			.value {
				display: flex;
				flex-direction: row;
				justify-content: space-between;
			}
		}

		.totals {
			@include insideBox;

			width: 300px;
		}

		.changes {
			@include insideBox;

			width: 125px;
		}
	}
</style>
