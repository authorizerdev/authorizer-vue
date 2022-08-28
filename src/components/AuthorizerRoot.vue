<template>
	<styled-wrapper>
		<authorizer-social-login :urlProps="urlProps" />
		<authorizer-basic-auth-login
			v-if="
				view === Views.Login &&
				config.is_basic_authentication_enabled &&
				!config.is_magic_link_login_enabled
			"
			:setView="setView"
			:onLogin="onLogin"
			:urlProps="urlProps"
		/>
		<authorizer-signup
			v-if="
				view === Views.Signup &&
				config.is_basic_authentication_enabled &&
				!config.is_magic_link_login_enabled &&
				config.is_sign_up_enabled
			"
			:setView="setView"
			:onSignup="onSignup"
			:urlProps="urlProps"
		/>
		<authorizer-magic-link-login
			v-if="view === Views.Login && config.is_magic_link_login_enabled"
			:onMagicLinkLogin="onMagicLinkLogin"
			:urlProps="urlProps"
		/>
		<authorizer-forgot-password
			v-if="view === Views.ForgotPassword"
			:setView="setView"
			:onForgotPassword="onForgotPassword"
			:urlProps="urlProps"
		/>
	</styled-wrapper>
</template>

<script>
import { reactive, toRefs, inject } from 'vue';
import { StyledWrapper } from '../styles/index';
import { Views } from '../constants/index';
import { hasWindow } from '../utils/window';
import { createRandomString } from '../utils/common';
import AuthorizerSocialLogin from './AuthorizerSocialLogin.vue';
import AuthorizerSignup from './AuthorizerSignup.vue';
import AuthorizerMagicLinkLogin from './AuthorizerMagicLinkLogin.vue';
import AuthorizerForgotPassword from './AuthorizerForgotPassword.vue';
import AuthorizerBasicAuthLogin from './AuthorizerBasicAuthLogin.vue';
export default {
	name: 'AuthorizerRoot',
	components: {
		'styled-wrapper': StyledWrapper,
		'authorizer-social-login': AuthorizerSocialLogin,
		'authorizer-signup': AuthorizerSignup,
		'authorizer-magic-link-login': AuthorizerMagicLinkLogin,
		'authorizer-forgot-password': AuthorizerForgotPassword,
		'authorizer-basic-auth-login': AuthorizerBasicAuthLogin,
	},
	props: ['onLogin', 'onSignup', 'onMagicLinkLogin', 'onForgotPassword'],
	setup(props) {
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
		return {
			...props,
			...toRefs(state),
			config: config.value,
			setView,
			urlProps,
			Views,
		};
	},
};
</script>

<style scoped></style>
