<template>
	<div class="styled-footer">
		<slot></slot>
	</div>
</template>

<script>
export default {
	name: 'StyledFooter',
};
</script>

<style scoped>
.styled-footer {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	margin-top: 15px;
}
</style>
