<template>
	<styled-wrapper>
		<authorizer-social-login :url-props="urlProps" :roles="roles" />
		<authorizer-basic-auth-login
			v-if="
				view === Views.Login &&
				config.is_basic_authentication_enabled.value &&
				!config.is_magic_link_login_enabled.value
			"
			:set-view="setView"
			:on-login="onLogin"
			:url-props="urlProps"
			:roles="roles"
		/>
		<authorizer-signup
			v-if="
				view === Views.Signup &&
				config.is_basic_authentication_enabled.value &&
				!config.is_magic_link_login_enabled.value &&
				config.is_sign_up_enabled.value
			"
			:set-view="setView"
			:on-signup="onSignup"
			:url-props="urlProps"
			:roles="roles"
		/>
		<authorizer-magic-link-login
			v-if="view === Views.Login && config.is_magic_link_login_enabled.value"
			:on-magic-link-login="onMagicLinkLogin"
			:url-props="urlProps"
			:roles="roles"
		/>
		<authorizer-forgot-password
			v-if="view === Views.ForgotPassword"
			:set-view="setView"
			:on-forgot-password="onForgotPassword"
			:url-props="urlProps"
		/>
	</styled-wrapper>
</template>

<script lang="ts">
import { reactive, toRefs, type PropType } from 'vue';
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
import type { URLPropsType } from '../types';
export default {
	name: 'AuthorizerRoot',
	components: {
		'styled-wrapper': StyledWrapper,
		'authorizer-social-login': AuthorizerSocialLogin,
		'authorizer-signup': AuthorizerSignup,
		'authorizer-magic-link-login': AuthorizerMagicLinkLogin,
		'authorizer-forgot-password': AuthorizerForgotPassword,
		'authorizer-basic-auth-login': AuthorizerBasicAuthLogin
	},
	props: {
		onLogin: {
			type: Function as PropType<(arg: AuthToken | void) => void>,
			default: undefined
		},
		onSignup: {
			type: Function as PropType<(arg: AuthToken | void) => void>,
			default: undefined
		},
		onMagicLinkLogin: {
			type: Function as PropType<(arg: unknown) => void>,
			default: undefined
		},
		onForgotPassword: {
			type: Function as PropType<(arg: unknown) => void>,
			default: undefined
		},
		roles: {
			type: Object as PropType<string[]>,
			default: undefined
		}
	},
	setup() {
		const state: {
			view: Views;
		} = reactive({
			view: Views.Login
		});
		const setView = (viewType: Views) => {
			if (viewType) state.view = viewType;
		};
		const searchParams = new URLSearchParams(hasWindow() ? window.location.search : ``);
		const paramsState = searchParams.get('state') || createRandomString();
		const scope = searchParams.get('scope')
			? searchParams.get('scope')?.toString().split(' ')
			: ['openid', 'profile', 'email'];
		const urlProps: URLPropsType = {
			state: paramsState,
			scope
		};
		const redirectURL = searchParams.get('redirect_uri') || searchParams.get('redirectURL');
		if (redirectURL) {
			urlProps.redirectURL = redirectURL;
		} else {
			urlProps.redirectURL = hasWindow() ? window.location.origin : undefined;
		}
		urlProps.redirect_uri = urlProps.redirectURL;
		return {
			...toRefs(state),
			config: toRefs(globalConfig),
			setView,
			urlProps,
			Views
		};
	}
};
</script>
