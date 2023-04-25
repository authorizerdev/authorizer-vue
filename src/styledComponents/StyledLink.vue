<template>
	<span class="styled-link" :style="style">
		<slot></slot>
	</span>
</template>

<script lang="ts">
import type { CSSProperties } from 'vue';

export default {
	name: 'StyledLink',
	props: {
		marginBottom: {
			type: String,
			default: '0px'
		}
	},
	setup(props) {
		return {
			...props,
			style: {
				'margin-bottom': props.marginBottom
			} as CSSProperties
		};
	}
};
</script>

<style scoped>
@import '../styles/default.css';
</style>
