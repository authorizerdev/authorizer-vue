<template>
	<div>
		<AuthorizerSignup />
		<AuthorizerBasicAuthLogin />
		<AuthorizerMagicLinkLogin />
		<AuthorizerForgotPassword />
		<AuthorizerSocialLogin />
		<AuthorizerResetPassword />
		<AuthorizerVerifyOtp />
		<AuthorizerRoot />
	</div>
</template>

<script>
import { inject } from 'vue';
export default {
	name: 'Children',
	setup() {
		const useAuthorizer = inject('useAuthorizer');
		const { user, logout } = useAuthorizer();
		console.log('client user ==>> ', user, logout);
	},
};
</script>

<style scoped></style>
