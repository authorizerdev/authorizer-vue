<template>
	<styled-wrapper>
		<authorizer-social-login :urlProps="urlProps" :roles="roles" />
		<authorizer-basic-auth-login
			v-if="
				view === Views.Login &&
				config.is_basic_authentication_enabled.value &&
				!config.is_magic_link_login_enabled.value
			"
			:setView="setView"
			:onLogin="onLogin"
			:urlProps="urlProps"
			:roles="roles"
		/>
		<authorizer-signup
			v-if="
				view === Views.Signup &&
				config.is_basic_authentication_enabled.value &&
				!config.is_magic_link_login_enabled.value &&
				config.is_sign_up_enabled.value
			"
			:setView="setView"
			:onSignup="onSignup"
			:urlProps="urlProps"
			:roles="roles"
		/>
		<authorizer-magic-link-login
			v-if="view === Views.Login && config.is_magic_link_login_enabled.value"
			:onMagicLinkLogin="onMagicLinkLogin"
			:urlProps="urlProps"
			:roles="roles"
		/>
		<authorizer-forgot-password
			v-if="view === Views.ForgotPassword"
			:setView="setView"
			:onForgotPassword="onForgotPassword"
			:urlProps="urlProps"
		/>
	</styled-wrapper>
</template>

<script lang="ts">
import { reactive, toRefs } from 'vue';
import type { AuthToken } from '@authorizerdev/authorizer-js';
import { StyledWrapper } from '../styledComponents/index';
import { Views } from '../constants/index';
import { hasWindow } from '../utils/window';
import { createRandomString } from '../utils/common';
import AuthorizerSocialLogin from './AuthorizerSocialLogin.vue';
import AuthorizerSignup from './AuthorizerSignup.vue';
import AuthorizerMagicLinkLogin from './AuthorizerMagicLinkLogin.vue';
import AuthorizerForgotPassword from './AuthorizerForgotPassword.vue';
import AuthorizerBasicAuthLogin from './AuthorizerBasicAuthLogin.vue';
import globalConfig from '../state/globalConfig';
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
	props: [
		'onLogin',
		'onSignup',
		'onMagicLinkLogin',
		'onForgotPassword',
		'roles',
	],
	setup({
		onLogin,
		onSignup,
		onMagicLinkLogin,
		onForgotPassword,
		roles,
	}: {
		onLogin?: (data: AuthToken | void) => void;
		onSignup?: (data: AuthToken | void) => void;
		onMagicLinkLogin?: (data: any) => void;
		onForgotPassword?: (data: any) => void;
		roles?: string[];
	}) {
		const state: {
			view: Views;
		} = reactive({
			view: Views.Login,
		});
		const setView = (viewType: Views) => {
			if (viewType) state.view = viewType;
		};
		const searchParams = new URLSearchParams(
			hasWindow() ? window.location.search : ``
		);
		const paramsState = searchParams.get('state') || createRandomString();
		const scope = searchParams.get('scope')
			? searchParams.get('scope')?.toString().split(' ')
			: ['openid', 'profile', 'email'];
		const urlProps: Record<string, any> = {
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
			onLogin,
			onSignup,
			onMagicLinkLogin,
			onForgotPassword,
			roles,
			...toRefs(state),
			config: toRefs(globalConfig),
			setView,
			urlProps,
			Views,
		};
	},
};
</script>
