<script>
import Children from './Children.vue';
export default {
	components: {
		children: Children,
	},
	setup() {
		const stateChangeCallback = (state) => {
			console.log('state changes from client ==>> ', state);
		};
		return {
			stateChangeCallback,
		};
	},
};
</script>

<template>
	<authorizer-provider
		:config="{
			authorizerURL: 'http://localhost:8080',
			redirectURL: '/',
		}"
		:onStateChangeCallback="stateChangeCallback"
	>
		<children />
	</authorizer-provider>
</template>

<style scoped></style>
