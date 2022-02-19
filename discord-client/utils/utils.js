const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

function formatDate(date, format, relative, originalFormat) {
	return relative ? dayjs(date).fromNow() : dayjs(date, originalFormat).format(format);
}

function simplifyNumber(num) {
	if (num) {
		let number = num;
		let prefix = "";
		if (number >= 1000000000000) {
			number /= 1000000000000;
			prefix = "T";
		} else if (number >= 1000000000) {
			number /= 1000000000;
			prefix = "B";
		} else if (number >= 1000000) {
			number /= 1000000;
			prefix = "M";
		} else if (number >= 10000) {
			number /= 10000;
			prefix = "k";
		}
		return `${number === num ? number : number.toFixed(2)}${prefix}`;
	}

	return "∞";
}

module.exports = { formatDate, simplifyNumber };
