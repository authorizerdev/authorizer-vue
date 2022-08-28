<template>
	<Wrapper>Authorizer Root Component</Wrapper>
</template>

<script>
import { Wrapper } from '../styles/styledComponents';
export default {
	name: 'AuthorizerRoot',
	components: [Wrapper],
	props: ['onLogin', 'onSignup', 'onMagicLinkLogin', 'onForgotPassword'],
	setup({ onLogin, onSignup, onMagicLinkLogin, onForgotPassword }) {
		return {};
	},
};
</script>

<style scoped></style>
