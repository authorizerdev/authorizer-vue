<template>
	<button class="styled-button" :style="style" :disabled="disabled">
		<slot></slot>
	</button>
</template>

<script lang="ts">
import type { CSSProperties } from 'vue';
import { ButtonAppearance } from '../constants/index';

export default {
	name: 'StyledButton',
	props: {
		appearance: {
			type: String,
			default: ButtonAppearance.Primary
		},
		disabled: Boolean
	},
	setup(props) {
		return {
			...props,
			style: {
				width: '100%',
				'background-color': props.disabled
					? 'var(--authorizer-primary-disabled-color)'
					: props.appearance === ButtonAppearance.Primary
					? 'var(--authorizer-primary-color)'
					: 'var(--authorizer-white-color)',
				color:
					props.appearance === ButtonAppearance.Default
						? 'var(--authorizer-text-color)'
						: 'var(--authorizer-white-color)',
				border: props.appearance === ButtonAppearance.Primary ? '0px' : '1px'
			} as CSSProperties
		};
	}
};
</script>

<style scoped>
@import '../styles/default.css';
</style>
