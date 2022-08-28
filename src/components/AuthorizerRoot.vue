<template>
	<Wrapper>
		Authorizer Root Component
		<div>
			{{ view }}
		</div>
		<button @click="setView('Signup')">change view</button>
	</Wrapper>
</template>

<script>
import { reactive, toRefs, inject } from 'vue';
import { Wrapper } from '../styles/index';
import { Views } from '../constants/index';
import { hasWindow } from '../utils/window';
import { createRandomString } from '../utils/common';
export default {
	name: 'AuthorizerRoot',
	components: [Wrapper],
	props: ['onLogin', 'onSignup', 'onMagicLinkLogin', 'onForgotPassword'],
	setup({ onLogin, onSignup, onMagicLinkLogin, onForgotPassword }) {
		const useAuthorizer = inject('useAuthorizer');
		const { config } = useAuthorizer();
		const state = reactive({
			view: Views.Login,
		});
		const setView = (viewType) => {
			if (viewType) state.view = viewType;
		};
		const searchParams = new URLSearchParams(
			hasWindow() ? window.location.search : ``
		);
		const paramsState = searchParams.get('state') || createRandomString();
		const scope = searchParams.get('scope')
			? searchParams.get('scope')?.toString().split(' ')
			: ['openid', 'profile', 'email'];

		const urlProps = {
			state: paramsState,
			scope,
		};

		const redirectURL =
			searchParams.get('redirect_uri') || searchParams.get('redirectURL');
		if (redirectURL) {
			urlProps.redirectURL = redirectURL;
		} else {
			urlProps.redirectURL = hasWindow() ? window.location.origin : redirectURL;
		}

		urlProps.redirect_uri = urlProps.redirectURL;
		return { ...toRefs(state), setView, urlProps };
	},
};
</script>

<style scoped></style>
