module.exports = {
	"env": {
		"browser": true,
		"commonjs": true,
		"es6": true
	},
	"extends": "eslint:recommended",
	"globals": {
		"Atomics": "readonly",
		"SharedArrayBuffer": "readonly"
	},
	"parserOptions": {
		"ecmaVersion": 2018
	},
	"rules": {
		"indent": [
			"error",
			"tab"
		],
		"quotes": [
			"error",
			"double"
		],
		"semi": [
			"error",
			"always"
		],

		//possible errors
		"no-extra-parens": "error",
		"no-template-curly-in-string": "error",

		//best practices
		"array-callback-return": "error",
		"block-scoped-var": "error",
		"complexity": ["warn", 15],
		"default-case": "error",
		"dot-notation": "error",
		"eqeqeq": "error",
		"no-else-return": "error",
		"no-empty-function": "error",
		"no-eq-null": "error",
		"no-lone-blocks": "error",
		"no-loop-func": "error",
		"no-multi-spaces": "error",
		"no-multi-str": "error",
		"no-param-reassign": "error",
		"no-return-assign": "error",
		"no-self-compare": "error",
		"no-unmodified-loop-condition": "error",
		"no-unused-expressions": "error",
		"no-useless-return": "error",
		"no-useless-concat": "error",
		"no-useless-return": "error",
		"require-await": "error",
		"yoda": "error",

		//variables
		"init-declarations": ["error", "always"],
		"no-undef-init": "error",
		"no-undefined": "error",
		"no-use-before-define": "error",

		//node.js
		"callback-return": "error",
		"global-require": "error",
		"handle-callback-err": "error",
		"no-buffer-constructor": "error",
		"no-mixed-requires": "error",
		"no-process-env": "error",
		"no-sync": "error",

		//style
		"array-bracket-spacing": "error",
		"block-spacing": "error",
		"brace-style": "error",
		"camelcase": "error",
		"comma-dangle": "error",
		"comma-spacing": "error",
		"comma-style": "error",
		"consistent-this": "error",
		"eol-last": "error",
		"func-call-spacing": "error",
		"func-name-matching": "error",
		"func-names": "error",
		"func-style": "error",
		"id-length": ["error", { "min": 2, "max": 25, "exceptions": ["i", "j", "k", "l", "x", "y", "$"] }],
		"implicit-arrow-linebreak": "error",
		"key-spacing": "error",
		"keyword-spacing": "error",
		"max-depth": "error",
		"max-len": ["error", { "code": 150 }],
		"max-lines": "error",
		"max-lines-per-function": "error",
		"max-nested-callbacks": ["error", { "max": 4 }],
		"max-params": ["error", { "max": 5 }],
		"max-statements": ["error", 25],
		"max-statements-per-line": "error",
		"multiline-ternary": ["error", "never"],
		"newline-per-chained-call": ["error", { "ignoreChainWithDepth": 4 }],
		"no-lonely-if": "error",
		"no-mixed-operators": "error",
		"no-multiple-empty-lines": "error",
		"no-negated-condition": "error",
		"no-nested-ternary": "error",
		"no-trailing-spaces": "error",
		"no-unneeded-ternary": "error",
		"no-whitespace-before-property": "error",
		"nonblock-statement-body-position": "error",
		"object-curly-spacing": ["error", "always"],
		"operator-assignment": "error",
		"padding-line-between-statements": "error",
		"prefer-object-spread": "error",
		"semi-spacing": "error",
		"semi-style": "error",
		"sort-vars": "warn",
		"space-before-blocks": "error",
		"space-before-function-paren": "error",
		"space-in-parens": "error",
		"space-infix-ops": "error",
		"space-unary-ops": "error",

		//ecmascript
		"arrow-spacing": "error",
		"no-duplicate-imports": "error",
		"no-var": "error",
		"prefer-arrow-callback": "warn",
		"prefer-const": "error",
		"prefer-destructuring": ["warn", { "array": false }],
		"prefer-template": "error",
		"sort-imports": "error"
	}
};