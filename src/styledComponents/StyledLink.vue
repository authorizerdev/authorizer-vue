<template>
	<span class="styled-link" :style="style">
		<slot></slot>
	</span>
</template>

<script>
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
.styled-link {
	color: var(--authorizer-primary-color);
	cursor: pointer;
}
</style>
