// .eslintrc.js
module.exports = {
	parser: 'vue-eslint-parser',
	parserOptions: {
		parser: '@typescript-eslint/parser',
		ecmaVersion: 2020,
		sourceType: 'module'
	},
	extends: [
		'plugin:vue/recommended',
		'plugin:prettier-vue/recommended',
		'plugin:@typescript-eslint/recommended'
	],
	settings: {
		'prettier-vue': {
			// Settings for how to process Vue SFC Blocks
			SFCBlocks: {
				template: true,
				script: true,
				style: true,
				customBlocks: {
					docs: { lang: 'markdown' },
					config: { lang: 'json' },
					module: { lang: 'js' },
					comments: false
				}
			},
			usePrettierrc: true,
			fileInfoOptions: {
				ignorePath: '.testignore',
				withNodeModules: false
			}
		}
	},
	rules: {
		'prettier-vue/prettier': [
			'error',
			{
				useTabs: true,
				printWidth: 100,
				singleQuote: true,
				trailingComma: 'none'
			}
		],
		'@typescript-eslint/no-unused-vars': [
			'error',
			{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
		]
	},
	overrides: [
		{
			files: ['*.ts', '*.tsx'],
			rules: {
				'no-undef': 'off'
			}
		}
	]
};
