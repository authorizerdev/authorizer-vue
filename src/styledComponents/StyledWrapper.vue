<template>
	<div class="styled-wrapper">
		<slot></slot>
	</div>
</template>

<script>
export default {
	name: 'StyledWrapper',
};
</script>

<style scoped>
.styled-wrapper {
	font-family: var(--authorizer-fonts-font-stack);
	color: var(--authorizer-text-color);
	font-size: var(--authorizer-fonts-medium-text);
	box-sizing: border-box;
	width: 100%;
}
.styled-wrapper *,
*:before,
*:after {
	box-sizing: inherit;
}
</style>
