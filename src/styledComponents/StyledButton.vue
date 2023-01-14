<template>
	<button
		class="styled-button"
		:style="style"
		:type="type"
		:disabled="disabled"
	>
		<slot></slot>
	</button>
</template>

<script>
import { ButtonAppearance } from '../constants/index';

export default {
	name: 'StyledButton',
	props: ['style', 'type', 'appearance', 'disabled'],
	setup(props) {
		return {
			...props,
			style: {
				width: '100%',
				backgroundColor: props.disabled
					? 'var(--authorizer-primary-disabled-color)'
					: props.appearance === ButtonAppearance.Primary
					? 'var(--authorizer-primary-color)'
					: 'var(--authorizer-white-color)',
				color:
					props.appearance === ButtonAppearance.Default
						? 'var(--authorizer-text-color)'
						: 'var(--authorizer-white-color)',
				border: props.appearance === ButtonAppearance.Primary ? '0px' : '1px',
			},
		};
	},
};
</script>

<style>
.styled-button {
	padding: 15px 10px !important;
	display: flex;
	justify-content: center;
	align-items: center;
	min-width: 375px;
	max-height: 64px;
	border-radius: var(--authorizer-radius-button);
	border-color: var(--authorizer-text-color) !important;
	border-style: solid !important;
	cursor: pointer;
	position: relative;
}
.styled-button:disabled {
	cursor: not-allowed;
	background-color: var(--authorizer-primary-disabled-color);
}
</style>
