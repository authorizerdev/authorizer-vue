<template>
	<div class="styled-wrapper">
		<slot></slot>
	</div>
</template>

<script lang="ts">
export default {
	name: 'StyledWrapper',
};
</script>

<style scoped>
@import '../styles/default.css';
</style>
