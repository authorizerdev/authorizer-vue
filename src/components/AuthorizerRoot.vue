<template>
	<Wrapper>
		Authorizer Root Component
		<div>
			{{ view }}
		</div>
	</Wrapper>
</template>

<script>
import { reactive, toRefs } from 'vue';
import { Wrapper } from '../styles/styledComponents';
import { Views } from '../constants/index';
export default {
	name: 'AuthorizerRoot',
	components: [Wrapper],
	props: ['onLogin', 'onSignup', 'onMagicLinkLogin', 'onForgotPassword'],
	setup({ onLogin, onSignup, onMagicLinkLogin, onForgotPassword }) {
		const state = reactive({
			view: Views.Login,
		});
		return toRefs(state);
	},
};
</script>

<style scoped></style>
