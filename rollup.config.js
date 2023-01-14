import vue from 'rollup-plugin-vue';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import css from 'rollup-plugin-import-css';

export default [
	{
		input: 'src/index.js',
		output: [
			{
				format: 'esm',
				file: 'dist/library.mjs',
			},
			{
				format: 'cjs',
				file: 'dist/library.js',
				exports: 'auto',
			},
		],
		plugins: [vue(), peerDepsExternal(), css()],
		watch: {
			include: './src/**',
			clearScreen: false,
		},
		external: ['vue', '@authorizerdev/authorizer-js', 'vue3-styled-components'],
	},
];
