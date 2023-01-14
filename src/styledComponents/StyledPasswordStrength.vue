<template>
	<div class="styled-password-strength" :style="style">
		<slot></slot>
	</div>
</template>

<script>
import { passwordStrengthIndicatorOpacity } from '../constants/index';

export default {
	name: 'StyledPasswordStrength',
	props: ['strength'],
	setup(props) {
		const strength = props.strength || 'default';
		return {
			...props,
			style: {
				opacity: passwordStrengthIndicatorOpacity[strength],
			},
		};
	},
};
</script>

<style scoped>
.styled-password-strength {
	width: 100%;
	height: 10px;
	flex: 0.75;
	border-radius: 5px;
	margin-right: 5px;
	background-color: var(--authorizer-primary-color);
}
</style>
