<template>
	<div>
		<!-- <AuthorizerSignup />
		<AuthorizerBasicAuthLogin />
		<AuthorizerMagicLinkLogin />
		<AuthorizerForgotPassword />
		<AuthorizerSocialLogin />
		<AuthorizerResetPassword /> -->
		<!-- <AuthorizerVerifyOtp /> -->
		<authorizer-root :onLogin="onLogin" />
	</div>
</template>

<script>
import { inject, watch } from 'vue';
export default {
	name: 'Children',
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
