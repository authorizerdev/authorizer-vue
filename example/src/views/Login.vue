<template>
	<div>
		<h1 :style="{ textAlign: 'center' }">Welcome to Authorizer</h1>
		<br />
		<authorizer-root :onLogin="onLogin" />
	</div>
</template>

<script>
import { inject, watch } from 'vue';
export default {
	name: 'Login',
	setup() {
		const useAuthorizer = inject('useAuthorizer');
		const { user } = useAuthorizer();
		console.log('client user ==>> ', user.value);
		function onLogin() {
			console.log('test login');
		}
		watch(user, function (newvalue, oldvalue) {
			console.log('old value from client ==>> ', oldvalue);
			console.log('new value from client ==>> ', newvalue);
		});
		return {
			onLogin,
		};
	},
};
</script>

<style scoped></style>
