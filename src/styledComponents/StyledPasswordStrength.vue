<template>
	<div
		class="styled-password-strength"
		:style="{ opacity: passwordStrengthIndicatorOpacity[strength] }"
	>
		<slot></slot>
	</div>
</template>

<script lang="ts">
import { passwordStrengthIndicatorOpacity } from '../constants/index';

export default {
	name: 'StyledPasswordStrength',
	props: {
		strength: {
			type: String,
			default: 'default'
		}
	},
	setup(props) {
		return {
			...props,
			passwordStrengthIndicatorOpacity
		};
	}
};
</script>

<style scoped>
@import '../styles/default.css';
</style>
