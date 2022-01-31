const utils = require("./utils");

describe("Utils", () => {
	describe("Define", () => {
		describe("Word that exists", () => {
			let response = null;

			beforeAll(async () => {
				response = await utils.define({ word: "test" });
			});

			it("returns the word provided", () => {
				expect(response).toHaveProperty("word", "test");
			});

			it("returns the definition of the word provided", () => {
				expect(response).toHaveProperty("definition");
			});

			it("returns an example of how to use the word provided", () => {
				expect(response).toHaveProperty("example");
			});
		});

		describe("Word that doesn't exist", () => {
			let response = null;

			beforeAll(async () => {
				response = await utils.define({ word: "this nigga eating beans homie" });
			});

			it("returns the word provided", () => {
				console.log(response);
				expect(response).toHaveProperty("word", "test");
			});

			it("returns the definition of the word provided", () => {
				expect(response).toHaveProperty("definition");
			});
		});
	});
});
