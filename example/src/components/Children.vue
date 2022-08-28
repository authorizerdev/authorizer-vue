<template>
	<div>
		<!-- <AuthorizerSignup />
		<AuthorizerBasicAuthLogin />
		<AuthorizerMagicLinkLogin />
		<AuthorizerForgotPassword />
		<AuthorizerSocialLogin />
		<AuthorizerResetPassword />
		<AuthorizerVerifyOtp /> -->
		<AuthorizerRoot :onLogin="onLogin" />
	</div>
</template>

<script>
import { inject } from 'vue';
export default {
	name: 'Children',
	setup() {
		const useAuthorizer = inject('useAuthorizer');
		const { user } = useAuthorizer();
		console.log('client user ==>> ', user.value);
		function onLogin() {
			console.log('test login');
		}
		return {
			onLogin,
		};
	},
};
</script>

<style scoped></style>
