/* eslint-disable */
// bridge between TypeScript and Vue, providing type definitions and declarations
// that help TypeScript understand Vue's components and syntax
declare module '*.vue' {
	import Vue from 'vue';
	export default Vue;
}
