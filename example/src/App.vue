<template>
	<parent />
</template>

<script>
import Parent from './components/Parent.vue';
export default {
	components: {
		parent: Parent,
	},
};
</script>

<style scoped>
header {
	line-height: 1.5;
}

.logo {
	display: block;
	margin: 0 auto 2rem;
}
</style>
