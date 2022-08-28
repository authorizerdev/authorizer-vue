import { reactive, provide, toRefs, onMounted, onUnmounted, watch, openBlock, createElementBlock, inject, resolveComponent, createBlock, withCtx, createVNode, createCommentVNode } from 'vue';
import { Authorizer } from '@authorizerdev/authorizer-js';
import Styled, { css as css$1 } from 'vue3-styled-components';

const hasWindow = () => typeof window !== 'undefined';

const AuthorizerProviderActionType = {
	SET_USER: 'SET_USER',
	SET_TOKEN: 'SET_TOKEN',
	SET_LOADING: 'SET_LOADING',
	SET_AUTH_DATA: 'SET_AUTH_DATA',
	SET_CONFIG: 'SET_CONFIG',
};

const Views = {
	Login: 'Login',
	Signup: 'Signup',
	ForgotPassword: 'ForgotPassword',
};

var script$8 = {
	name: 'AuthorizerProvider',
	props: ['config', 'onStateChangeCallback'],
	setup(props) {
		const config = {
			authorizerURL: props?.config?.authorizerURL || '',
			redirectURL: props?.config?.redirectURL
				? props.config.redirectURL
				: hasWindow()
				? window.location.origin
				: '/',
			client_id: props?.config?.client_id || '',
			is_google_login_enabled: props?.config?.is_google_login_enabled || false,
			is_github_login_enabled: props?.config?.is_github_login_enabled || false,
			is_facebook_login_enabled:
				props?.config?.is_facebook_login_enabled || false,
			is_linkedin_login_enabled:
				props?.config?.is_linkedin_login_enabled || false,
			is_apple_login_enabled: props?.config?.is_apple_login_enabled || false,
			is_email_verification_enabled:
				props?.config?.is_email_verification_enabled || false,
			is_basic_authentication_enabled:
				props?.config?.is_basic_authentication_enabled || false,
			is_magic_link_login_enabled:
				props?.config?.is_magic_link_login_enabled || false,
			is_sign_up_enabled: props?.config?.is_sign_up_enabled || false,
			is_strong_password_enabled:
				props?.config?.is_strong_password_enabled || true,
		};
		const state = reactive({
			config,
			user: null,
			token: null,
			loading: false,
			setLoading: () => {},
			setToken: () => {},
			setUser: () => {},
			setAuthData: () => {},
			authorizerRef: new Authorizer({
				authorizerURL: config.authorizerURL,
				redirectURL: config.redirectURL,
				clientID: config.client_id,
			}),
			logout: async () => {},
		});
		const dispatch = ({ type, payload }) => {
			switch (type) {
				case AuthorizerProviderActionType.SET_USER:
					state.user = payload.user;
					break;
				case AuthorizerProviderActionType.SET_TOKEN:
					state.token = payload.token;
					break;
				case AuthorizerProviderActionType.SET_LOADING:
					state.loading = payload.loading;
					break;
				case AuthorizerProviderActionType.SET_CONFIG:
					state.config = payload.config;
					break;
				case AuthorizerProviderActionType.SET_AUTH_DATA:
					state.value = payload;
					break;
				default:
					throw new Error();
			}
		};
		let intervalRef = null;
		const getToken = async () => {
			const metaRes = await state.authorizerRef.getMetaData();
			try {
				const res = await state.authorizerRef.getSession();
				if (res.access_token && res.user) {
					const token = {
						access_token: res.access_token,
						expires_in: res.expires_in,
						id_token: res.id_token,
						refresh_token: res.refresh_token || '',
					};
					dispatch({
						type: AuthorizerProviderActionType.SET_AUTH_DATA,
						payload: {
							...state,
							token,
							user: res.user,
							config: {
								...state.config,
								...metaRes,
							},
							loading: false,
						},
					});
					if (intervalRef) clearInterval(intervalRef);
					intervalRef = setInterval(() => {
						getToken();
					}, res.expires_in * 1000);
				} else {
					dispatch({
						type: AuthorizerProviderActionType.SET_AUTH_DATA,
						payload: {
							...state,
							token: null,
							user: null,
							config: {
								...state.config,
								...metaRes,
							},
							loading: false,
						},
					});
				}
			} catch (err) {
				dispatch({
					type: AuthorizerProviderActionType.SET_AUTH_DATA,
					payload: {
						...state,
						token: null,
						user: null,
						config: {
							...state.config,
							...metaRes,
						},
						loading: false,
					},
				});
			}
		};
		state.setToken = (token) => {
			dispatch({
				type: AuthorizerProviderActionType.SET_TOKEN,
				payload: {
					token,
				},
			});
			if (token?.access_token) {
				if (intervalRef) clearInterval(intervalRef);
				intervalRef = setInterval(() => {
					getToken();
				}, token.expires_in * 1000);
			}
		};
		state.setAuthData = (data) => {
			dispatch({
				type: AuthorizerProviderActionType.SET_AUTH_DATA,
				payload: data,
			});
			if (data.token?.access_token) {
				if (intervalRef) clearInterval(intervalRef);
				intervalRef = setInterval(() => {
					getToken();
				}, data.token.expires_in * 1000);
			}
		};
		state.setUser = (user) => {
			dispatch({
				type: AuthorizerProviderActionType.SET_USER,
				payload: {
					user,
				},
			});
		};
		state.setLoading = (loading) => {
			dispatch({
				type: AuthorizerProviderActionType.SET_LOADING,
				payload: {
					loading,
				},
			});
		};
		state.logout = async () => {
			dispatch({
				type: AuthorizerProviderActionType.SET_LOADING,
				payload: {
					loading: true,
				},
			});
			await state.authorizerRef.logout();
			const loggedOutState = {
				user: null,
				token: null,
				loading: false,
				config: state.config,
			};
			dispatch({
				type: AuthorizerProviderActionType.SET_AUTH_DATA,
				payload: loggedOutState,
			});
		};
		provide('useAuthorizer', () => {
			return toRefs(state);
		});
		onMounted(() => {
			getToken();
		});
		onUnmounted(() => {
			if (intervalRef) {
				clearInterval(intervalRef);
			}
		});
		watch(state, () => {
			if (props?.onStateChangeCallback) {
				props.onStateChangeCallback(state);
			}
		});
		watch(
			() => props.config,
			() => {
				state.config = {
					...state.config,
					...props.config,
					authorizerURL:
						props?.config?.authorizerURL || state.config.authorizerURL,
					redirectURL: props?.config?.redirectURL || state.config.redirectURL,
					clientID: props?.config?.client_id || state.config.client_id,
				};
				state.authorizerRef = new Authorizer({
					authorizerURL: state.config.authorizerURL,
					redirectURL: state.config.redirectURL,
					clientID: state.config.client_id,
				});
			}
		);
	},
	render() {
		return this.$slots.default();
	},
};

script$8.__file = "src/components/AuthorizerProvider.vue";

var script$7 = {
	name: 'AuthorizerSignup',
};

function render$7(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", null, "Authorizer Signup Component"))
}

script$7.render = render$7;
script$7.__file = "src/components/AuthorizerSignup.vue";

var script$6 = {
	name: 'AuthorizerBasicAuthLogin',
};

function render$6(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", null, "Authorizer BasicAuthLogin Component"))
}

script$6.render = render$6;
script$6.__file = "src/components/AuthorizerBasicAuthLogin.vue";

var script$5 = {
	name: 'AuthorizerMagicLinkLogin',
};

function render$5(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", null, "Authorizer MagicLinkLogin Component"))
}

script$5.render = render$5;
script$5.__file = "src/components/AuthorizerMagicLinkLogin.vue";

var script$4 = {
	name: 'AuthorizerForgotPassword',
};

function render$4(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", null, "Authorizer ForgotPassword Component"))
}

script$4.render = render$4;
script$4.__file = "src/components/AuthorizerForgotPassword.vue";

var script$3 = {
	name: 'AuthorizerSocialLogin',
};

function render$3(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", null, "Authorizer SocialLogin Component"))
}

script$3.render = render$3;
script$3.__file = "src/components/AuthorizerSocialLogin.vue";

var script$2 = {
	name: 'AuthorizerResetPassword',
};

function render$2(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", null, "Authorizer ResetPassword Component"))
}

script$2.render = render$2;
script$2.__file = "src/components/AuthorizerResetPassword.vue";

var script$1 = {
	name: 'AuthorizerVerifyOtp',
};

function render$1(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", null, "Authorizer VerifyOtp Component"))
}

script$1.render = render$1;
script$1.__file = "src/components/AuthorizerVerifyOtp.vue";

const sizes = {
	sm: 576,
	md: 768,
	lg: 992,
};

({
	maxWidth: sizes.sm - 1,
});

({
	minWidth: sizes.sm,
	maxWidth: sizes.md - 1,
});

({
	minWidth: sizes.md,
	maxWidth: sizes.lg - 1,
});

({
	minWidth: sizes.lg,
});

const media = Object.keys(sizes).reduce((acc, label) => {
	acc[label] = (args) =>
		css$1`
			@media (min-width: ${sizes[label] / 16}em) {
				${css$1(args)}
			}
		`;
	return acc;
}, {});

// colors: https://tailwindcss.com/docs/customizing-colors

const theme = {
	colors: {
		primary: '#3B82F6',
		primaryDisabled: '#60A5FA',
		gray: '#D1D5DB',
		danger: '#DC2626',
		success: '#10B981',
		textColor: '#374151',
	},
	fonts: {
		// typography
		fontStack: '-apple-system, system-ui, sans-serif',

		// font sizes
		largeText: '18px',
		mediumText: '14px',
		smallText: '12px',
		tinyText: '10px',
	},

	radius: {
		card: '5px',
		button: '5px',
		input: '5px',
	},
};

const props = [];

const Wrapper = Styled('div')`
	font-family: ${theme.fonts.fontStack};
	color: ${theme.colors.textColor};
	font-size: ${theme.fonts.mediumText};
	box-sizing: border-box;

	*,
	*:before,
	*:after {
		box-sizing: inherit;
	};
`;

Styled('span')`
  color: ${theme.colors.danger};
  padding-right: 3px;
`;

Styled('div')`
  color: ${theme.colors.danger};
  font-size: ${theme.fonts.smallText};
`;

Styled('div')`
  margin-bottom: 15px;
`;

Styled('label')`
  display: block;
  margin-bottom: 3px;
`;

Styled('input', props)`
  padding: 10px;
  border-radius: ${(props) => theme.radius.input};
  width: 100%;
  border-color: ${(props) =>
		props.hasError ? theme.colors.danger : theme.colors.primary};
  outline-color: ${(props) =>
		props.hasError ? theme.colors.danger : theme.colors.primary};
`;

Styled('button', props)`
  padding: 15px 10px;
  width: ${(props) => (props.style?.width ? props.style.width : '100%')};
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 375;
  max-height: 64px;
  background-color: ${(props) =>
		props.appearance === 'Primary' ? theme.colors.primary : '#ffffff'};
  color: ${(props) =>
		props.appearance === 'Default' ? theme.colors.textColor : '#ffffff'};
  border-radius: ${theme.radius.button};
  border-color: ${theme.colors.textColor};
  border: ${(props) => (props.appearance === 'Primary' ? '0px' : '1px')};
  border-style: solid;
  cursor: pointer;
  position: relative;

  &:disabled {
    cursor: not-allowed;
    background-color: ${theme.colors.primaryDisabled};
  }

  svg {
    position: absolute;
    left: 10px;
  }
`;

Styled('span')`
  color: ${theme.colors.primary};
  cursor: pointer;
`;

Styled('div')`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 10px 0px;

  ::before {
    content: '';
    flex: 1;
    border-bottom: 1px solid ${theme.colors.gray};
  }

  ::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid ${theme.colors.gray};
  }

  :not(:empty)::before {
    margin-right: 0.25em;
  }

  :not(:empty)::after {
    margin-left: 0.25em;
  }
`;

Styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
`;

Styled('div', props)`
  padding: 10px;
  color: white;
  border-radius: ${theme.radius.card};
  margin: 10px 0px;
  font-size: ${theme.fonts.smallText};
  ${(props) =>
		props.type === 'Error' &&
		`
    background-color: ${theme.colors.danger};
  `}
  ${(props) =>
		props.type === 'Success' &&
		`
    background-color: ${theme.colors.success};
  `};
`;

Styled('div', props)`
  display: flex;
  flex-direction: ${({ flexDirection, isResponsive }) =>
		isResponsive && flexDirection !== 'column'
			? 'column'
			: flexDirection || 'row'};
  flex-wrap: ${({ wrap }) => wrap || 'wrap'};
  ${({ alignItems }) =>
		alignItems &&
		css`
			align-items: ${alignItems};
		`};
  ${({ justifyContent }) =>
		justifyContent &&
		css`
			justify-content: ${justifyContent};
		`};
  ${media.lg`
    flex-direction: ${({ flexDirection }) => flexDirection || 'row'}
  `}
`;

const getCrypto = () => {
	//ie 11.x uses msCrypto
	return hasWindow() ? window.crypto || window.msCrypto : null;
};

const createRandomString = () => {
	const charset =
		'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_~.';
	let random = '';
	const crypto = getCrypto();
	if (crypto) {
		const randomValues = Array.from(crypto.getRandomValues(new Uint8Array(43)));
		randomValues.forEach((v) => (random += charset[v % charset.length]));
	}
	return random;
};

var script = {
	name: 'AuthorizerRoot',
	components: [
		Wrapper,
		script$3,
		script$7,
		script$5,
		script$4,
		script$6,
	],
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

function render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_AuthorizerSocialLogin = resolveComponent("AuthorizerSocialLogin");
  const _component_AuthorizerBasicAuthLogin = resolveComponent("AuthorizerBasicAuthLogin");
  const _component_AuthorizerSignup = resolveComponent("AuthorizerSignup");
  const _component_AuthorizerMagicLinkLogin = resolveComponent("AuthorizerMagicLinkLogin");
  const _component_AuthorizerForgotPassword = resolveComponent("AuthorizerForgotPassword");
  const _component_Wrapper = resolveComponent("Wrapper");

  return (openBlock(), createBlock(_component_Wrapper, null, {
    default: withCtx(() => [
      createVNode(_component_AuthorizerSocialLogin, { urlProps: $setup.urlProps }, null, 8 /* PROPS */, ["urlProps"]),
      (
				_ctx.view === $setup.Views.Login &&
				$setup.config.is_basic_authentication_enabled &&
				!$setup.config.is_magic_link_login_enabled
			)
        ? (openBlock(), createBlock(_component_AuthorizerBasicAuthLogin, {
            key: 0,
            setView: $setup.setView,
            onLogin: $props.onLogin,
            urlProps: $setup.urlProps
          }, null, 8 /* PROPS */, ["setView", "onLogin", "urlProps"]))
        : createCommentVNode("v-if", true),
      (
				_ctx.view === $setup.Views.Signup &&
				$setup.config.is_basic_authentication_enabled &&
				!$setup.config.is_magic_link_login_enabled &&
				$setup.config.is_sign_up_enabled
			)
        ? (openBlock(), createBlock(_component_AuthorizerSignup, {
            key: 1,
            setView: $setup.setView,
            onSignup: $props.onSignup,
            urlProps: $setup.urlProps
          }, null, 8 /* PROPS */, ["setView", "onSignup", "urlProps"]))
        : createCommentVNode("v-if", true),
      (_ctx.view === $setup.Views.Login && $setup.config.is_magic_link_login_enabled)
        ? (openBlock(), createBlock(_component_AuthorizerMagicLinkLogin, {
            key: 2,
            onMagicLinkLogin: $props.onMagicLinkLogin,
            urlProps: $setup.urlProps
          }, null, 8 /* PROPS */, ["onMagicLinkLogin", "urlProps"]))
        : createCommentVNode("v-if", true),
      (_ctx.view === $setup.Views.ForgotPassword)
        ? (openBlock(), createBlock(_component_AuthorizerForgotPassword, {
            key: 3,
            setView: $setup.setView,
            onForgotPassword: $props.onForgotPassword,
            urlProps: $setup.urlProps
          }, null, 8 /* PROPS */, ["setView", "onForgotPassword", "urlProps"]))
        : createCommentVNode("v-if", true)
    ]),
    _: 1 /* STABLE */
  }))
}

script.render = render;
script.__file = "src/components/AuthorizerRoot.vue";

var components = {
	AuthorizerProvider: script$8,
	AuthorizerSignup: script$7,
	AuthorizerBasicAuthLogin: script$6,
	AuthorizerMagicLinkLogin: script$5,
	AuthorizerForgotPassword: script$4,
	AuthorizerSocialLogin: script$3,
	AuthorizerResetPassword: script$2,
	AuthorizerVerifyOtp: script$1,
	AuthorizerRoot: script,
};

const plugin = {
	install(Vue) {
		for (const prop in components) {
			if (components.hasOwnProperty(prop)) {
				const component = components[prop];
				Vue.component(component.name, component);
			}
		}
	},
};

export { plugin as default };
