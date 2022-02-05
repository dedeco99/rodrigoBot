const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

function formatDate(date, format, relative, originalFormat) {
	return relative ? dayjs(date).fromNow() : dayjs(date, originalFormat).format(format);
}

function diff(date, unit) {
	return dayjs().diff(dayjs(date), unit);
}

module.exports = {
	formatDate,
	diff,
};
