<script>
import Children from './Children.vue';
export default {
	components: {
		childern: Children,
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
		<childern />
	</authorizer-provider>
</template>

<style scoped>
h1 {
	font-weight: 500;
	font-size: 2.6rem;
	top: -10px;
}

h3 {
	font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
	text-align: center;
}

@media (min-width: 1024px) {
	.greetings h1,
	.greetings h3 {
		text-align: left;
	}
}
</style>
