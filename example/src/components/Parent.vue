<script setup>
import Childern from './Children.vue';

function stateChangeCallback(state) {
	console.log('state changes from client ==>> ', state);
}
</script>

<template>
	<div class="greetings">
		--
		<AuthorizerProvider
			:config="{
				authorizerURL: 'http://localhost:8080',
				redirectURL: '/',
			}"
			:onStateChangeCallback="stateChangeCallback"
		>
			<Childern />
		</AuthorizerProvider>
		--
	</div>
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
