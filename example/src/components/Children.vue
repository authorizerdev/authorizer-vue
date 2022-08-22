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
		const { user } = useAuthorizer();
		console.log('client user ==>> ', user.value);
	},
};
</script>

<style scoped></style>
