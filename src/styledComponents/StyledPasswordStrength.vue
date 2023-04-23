<template>
	<div class="styled-password-strength" :style="style">
		<slot></slot>
	</div>
</template>

<script lang="ts">
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
@import '../styles/default.css';
</style>
