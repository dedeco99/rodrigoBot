const fs = require("fs");

exports.error = (err) => {
	fs.appendFile("logs.txt", `${err}\n`, () => console.log("Error has been logged"));
};
