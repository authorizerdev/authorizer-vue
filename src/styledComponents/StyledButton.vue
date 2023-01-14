<template>
	<button
		class="styled-button"
		:style="style"
		:type="type"
		:disabled="disabled"
		:onClick="onClick"
	>
		<slot></slot>
	</button>
</template>

<script>
import { ButtonAppearance } from '../constants/index';

export default {
	name: 'StyledButton',
	props: ['style', 'type', 'appearance', 'disabled', 'onClick'],
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
