<template>
	<span class="styled-link" :style="style">
		<slot></slot>
	</span>
</template>

<script lang="ts">
export default {
	name: 'StyledLink',
	props: ['marginBottom'],
	setup(props) {
		return {
			...props,
			style: {
				'margin-bottom': props.marginBottom || '0px',
			},
		};
	},
};
</script>

<style scoped>
@import '../styles/default.css';
</style>
