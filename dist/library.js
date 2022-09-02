'use strict';

var vue = require('vue');
var authorizerJs = require('@authorizerdev/authorizer-js');
var Styled = require('vue3-styled-components');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var Styled__default = /*#__PURE__*/_interopDefaultLegacy(Styled);

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

const ButtonAppearance = {
	Primary: 'Primary',
	Default: 'Default',
};

var globalState = vue.reactive({
	user: null,
	token: null,
	loading: false,
	setLoading: () => {},
	setToken: () => {},
	setUser: () => {},
	setAuthData: () => {},
	authorizerRef: null,
	logout: async () => {},
});

var globalConfig = vue.reactive({
	authorizerURL: '',
	redirectURL: '/',
	client_id: '',
	is_google_login_enabled: false,
	is_github_login_enabled: false,
	is_facebook_login_enabled: false,
	is_linkedin_login_enabled: false,
	is_apple_login_enabled: false,
	is_email_verification_enabled: false,
	is_basic_authentication_enabled: false,
	is_magic_link_login_enabled: false,
	is_sign_up_enabled: false,
	is_strong_password_enabled: true,
});

var script$8 = {
	name: 'AuthorizerProvider',
	props: ['config', 'onStateChangeCallback'],
	setup(props) {
		const config = { ...vue.toRefs(globalConfig) };
		const state = { ...vue.toRefs(globalState) };
		config.authorizerURL.value = props?.config?.authorizerURL || '';
		config.redirectURL.value = props?.config?.redirectURL
			? props.config.redirectURL
			: hasWindow()
			? window.location.origin
			: '/';
		config.client_id.value = props?.config?.client_id || '';
		config.is_google_login_enabled.value =
			props?.config?.is_google_login_enabled || false;
		config.is_github_login_enabled.value =
			props?.config?.is_github_login_enabled || false;
		config.is_facebook_login_enabled.value =
			props?.config?.is_facebook_login_enabled || false;
		config.is_linkedin_login_enabled.value =
			props?.config?.is_linkedin_login_enabled || false;
		config.is_apple_login_enabled.value =
			props?.config?.is_apple_login_enabled || false;
		config.is_email_verification_enabled.value =
			props?.config?.is_email_verification_enabled || false;
		config.is_basic_authentication_enabled.value =
			props?.config?.is_basic_authentication_enabled || false;
		config.is_magic_link_login_enabled.value =
			props?.config?.is_magic_link_login_enabled || false;
		config.is_sign_up_enabled.value =
			props?.config?.is_sign_up_enabled || false;
		config.is_strong_password_enabled.value =
			props?.config?.is_strong_password_enabled || true;
		state.authorizerRef.value = new authorizerJs.Authorizer({
			authorizerURL: props?.config?.authorizerURL || '',
			redirectURL: props?.config?.redirectURL
				? props.config.redirectURL
				: hasWindow()
				? window.location.origin
				: '/',
			clientID: props?.config?.client_id || '',
		});
		function dispatch({ type, payload }) {
			switch (type) {
				case AuthorizerProviderActionType.SET_USER:
					state.user.value = payload.user;
					break;
				case AuthorizerProviderActionType.SET_TOKEN:
					state.token.value = payload.token;
					break;
				case AuthorizerProviderActionType.SET_LOADING:
					state.loading.value = payload.loading;
					break;
				case AuthorizerProviderActionType.SET_CONFIG:
					Object.assign(globalConfig, payload.config);
					break;
				case AuthorizerProviderActionType.SET_AUTH_DATA:
					const { config, ...rest } = payload;
					Object.assign(globalConfig, { ...globalConfig, ...config });
					Object.assign(globalState, { ...globalState, ...rest });
					break;
				default:
					throw new Error();
			}
		}
		let intervalRef = null;
		const getToken = async () => {
			const metaRes = await state.authorizerRef.value.getMetaData();
			try {
				const res = await state.authorizerRef.value.getSession();
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
							token,
							user: res.user,
							config: metaRes,
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
							token: null,
							user: null,
							config: metaRes,
							loading: false,
						},
					});
				}
			} catch (err) {
				dispatch({
					type: AuthorizerProviderActionType.SET_AUTH_DATA,
					payload: {
						token: null,
						user: null,
						config: metaRes,
						loading: false,
					},
				});
			}
		};
		state.setToken.value = (token) => {
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
		state.setAuthData.value = (data) => {
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
		state.setUser.value = (user) => {
			dispatch({
				type: AuthorizerProviderActionType.SET_USER,
				payload: {
					user,
				},
			});
		};
		state.setLoading.value = (loading) => {
			dispatch({
				type: AuthorizerProviderActionType.SET_LOADING,
				payload: {
					loading,
				},
			});
		};
		state.logout.value = async () => {
			dispatch({
				type: AuthorizerProviderActionType.SET_LOADING,
				payload: {
					loading: true,
				},
			});
			await state.authorizerRef.value.logout();
			const loggedOutState = {
				user: null,
				token: null,
				loading: false,
				config: globalConfig,
			};
			dispatch({
				type: AuthorizerProviderActionType.SET_AUTH_DATA,
				payload: loggedOutState,
			});
		};
		vue.provide('useAuthorizer', () => {
			return vue.toRefs(globalState);
		});
		vue.onMounted(() => {
			getToken();
		});
		vue.onUnmounted(() => {
			if (intervalRef) {
				clearInterval(intervalRef);
			}
		});
		vue.watch([globalState, globalConfig], () => {
			if (props?.onStateChangeCallback) {
				props.onStateChangeCallback({ ...globalState, config: globalConfig });
			}
		});
		vue.watch(
			() => {
				return { ...props.config };
			},
			() => {
				const updatedConfig = {
					...globalConfig,
					...props.config,
					authorizerURL:
						props?.config?.authorizerURL || globalConfig.authorizerURL,
					redirectURL: props?.config?.redirectURL || globalConfig.redirectURL,
					clientID: props?.config?.client_id || globalConfig.client_id,
				};
				Object.assign(globalConfig, updatedConfig);
				state.authorizerRef.value = vue.computed(function () {
					return new authorizerJs.Authorizer({
						authorizerURL: config.authorizerURL.value,
						redirectURL: config.redirectURL.value,
						clientID: config.client_id.value,
					});
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
  return (vue.openBlock(), vue.createElementBlock("div", null, "Authorizer Signup Component"))
}

script$7.render = render$7;
script$7.__file = "src/components/AuthorizerSignup.vue";

var script$6 = {
	name: 'AuthorizerBasicAuthLogin',
	props: ['urlProps'],
};

function render$6(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", null, "Authorizer BasicAuthLogin Component"))
}

script$6.render = render$6;
script$6.__file = "src/components/AuthorizerBasicAuthLogin.vue";

var script$5 = {
	name: 'AuthorizerMagicLinkLogin',
};

function render$5(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", null, "Authorizer MagicLinkLogin Component"))
}

script$5.render = render$5;
script$5.__file = "src/components/AuthorizerMagicLinkLogin.vue";

var script$4 = {
	name: 'AuthorizerForgotPassword',
};

function render$4(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", null, "Authorizer ForgotPassword Component"))
}

script$4.render = render$4;
script$4.__file = "src/components/AuthorizerForgotPassword.vue";

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

const createQueryParams = (params) => {
	return Object.keys(params)
		.filter((k) => typeof params[k] !== 'undefined')
		.map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
		.join('&');
};

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
		Styled.css`
			@media (min-width: ${sizes[label] / 16}em) {
				${Styled.css(args)}
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

const StyledWrapper = Styled__default["default"]('div')`
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

Styled__default["default"]('span')`
  color: ${theme.colors.danger};
  padding-right: 3px;
`;

Styled__default["default"]('div')`
  color: ${theme.colors.danger};
  font-size: ${theme.fonts.smallText};
`;

Styled__default["default"]('div')`
  margin-bottom: 15px;
`;

Styled__default["default"]('label')`
  display: block;
  margin-bottom: 3px;
`;

Styled__default["default"]('input', props)`
  padding: 10px;
  border-radius: ${(props) => theme.radius.input};
  width: 100%;
  border-color: ${(props) =>
		props.hasError ? theme.colors.danger : theme.colors.primary};
  outline-color: ${(props) =>
		props.hasError ? theme.colors.danger : theme.colors.primary};
`;

const StyledButton = Styled__default["default"]('button', props)`
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

Styled__default["default"]('span')`
  color: ${theme.colors.primary};
  cursor: pointer;
`;

const StyledSeparator = Styled__default["default"]('div')`
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

Styled__default["default"]('div')`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
`;

Styled__default["default"]('div', props)`
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

Styled__default["default"]('div', props)`
  display: flex;
  flex-direction: ${({ flexDirection, isResponsive }) =>
		isResponsive && flexDirection !== 'column'
			? 'column'
			: flexDirection || 'row'};
  flex-wrap: ${({ wrap }) => wrap || 'wrap'};
  ${({ alignItems }) =>
		alignItems &&
		Styled.css`
			align-items: ${alignItems};
		`};
  ${({ justifyContent }) =>
		justifyContent &&
		Styled.css`
			justify-content: ${justifyContent};
		`};
  ${media.lg`
    flex-direction: ${({ flexDirection }) => flexDirection || 'row'}
  `}
`;

var script$3 = {
	name: 'AuthorizerSocialLogin',
	props: ['urlProps'],
	components: {
		'styled-button': StyledButton,
		'styled-separator': StyledSeparator,
	},
	setup({ urlProps }) {
		const config = { ...vue.toRefs(globalConfig) };
		const hasSocialLogin = vue.computed(function () {
			return (
				config.is_google_login_enabled.value ||
				config.is_github_login_enabled.value ||
				config.is_facebook_login_enabled.value ||
				config.is_linkedin_login_enabled.value ||
				config.is_apple_login_enabled.value
			);
		});
		const queryParams = createQueryParams({
			...urlProps,
			scope: urlProps.scope.join(' '),
		});
		const windowObject = hasWindow() ? window : null;
		return {
			config,
			hasSocialLogin,
			queryParams,
			ButtonAppearance,
			window: windowObject,
		};
	},
};

const _hoisted_1 = {
  key: 0,
  id: "appleid-signin"
};
const _hoisted_2 = /*#__PURE__*/vue.createTextVNode(" Sign in with Apple ");
const _hoisted_3 = /*#__PURE__*/vue.createElementVNode("br", null, null, -1 /* HOISTED */);
const _hoisted_4 = /*#__PURE__*/vue.createTextVNode(" Sign in with Google ");
const _hoisted_5 = /*#__PURE__*/vue.createTextVNode(" Sign in with Github ");
const _hoisted_6 = /*#__PURE__*/vue.createTextVNode(" Sign in with Facebook ");
const _hoisted_7 = /*#__PURE__*/vue.createTextVNode(" Sign in with Linkedin ");
const _hoisted_8 = /*#__PURE__*/vue.createTextVNode(" OR ");

function render$3(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_styled_button = vue.resolveComponent("styled-button");
  const _component_styled_separator = vue.resolveComponent("styled-separator");

  return (vue.openBlock(), vue.createElementBlock("div", null, [
    ($setup.config.is_apple_login_enabled.value)
      ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_1, [
          vue.createVNode(_component_styled_button, {
            appearance: $setup.ButtonAppearance.Primary,
            onClick: _cache[0] || (_cache[0] = 
					() => {
						$setup.window.location.href = `${$setup.config.authorizerURL.value}/oauth_login/apple?${$setup.queryParams}`;
					}
				)
          }, {
            default: vue.withCtx(() => [
              vue.createCommentVNode(" <Apple /> "),
              _hoisted_2
            ]),
            _: 1 /* STABLE */
          }, 8 /* PROPS */, ["appearance"]),
          _hoisted_3
        ]))
      : vue.createCommentVNode("v-if", true),
    ($setup.config.is_google_login_enabled.value)
      ? (vue.openBlock(), vue.createBlock(_component_styled_button, {
          key: 1,
          appearance: $setup.ButtonAppearance.Primary,
          onClick: _cache[1] || (_cache[1] = 
				() => {
					$setup.window.location.href = `${$setup.config.authorizerURL.value}/oauth_login/google?${$setup.queryParams}`;
				}
			)
        }, {
          default: vue.withCtx(() => [
            vue.createCommentVNode(" <Google /> "),
            _hoisted_4
          ]),
          _: 1 /* STABLE */
        }, 8 /* PROPS */, ["appearance"]))
      : vue.createCommentVNode("v-if", true),
    ($setup.config.is_github_login_enabled.value)
      ? (vue.openBlock(), vue.createBlock(_component_styled_button, {
          key: 2,
          appearance: $setup.ButtonAppearance.Primary,
          onClick: _cache[2] || (_cache[2] = 
				() => {
					$setup.window.location.href = `${$setup.config.authorizerURL.value}/oauth_login/github?${$setup.queryParams}`;
				}
			)
        }, {
          default: vue.withCtx(() => [
            vue.createCommentVNode(" <Github /> "),
            _hoisted_5
          ]),
          _: 1 /* STABLE */
        }, 8 /* PROPS */, ["appearance"]))
      : vue.createCommentVNode("v-if", true),
    ($setup.config.is_facebook_login_enabled.value)
      ? (vue.openBlock(), vue.createBlock(_component_styled_button, {
          key: 3,
          appearance: $setup.ButtonAppearance.Primary,
          onClick: _cache[3] || (_cache[3] = 
				() => {
					$setup.window.location.href = `${$setup.config.authorizerURL.value}/oauth_login/facebook?${$setup.queryParams}`;
				}
			)
        }, {
          default: vue.withCtx(() => [
            vue.createCommentVNode(" <Facebook /> "),
            _hoisted_6
          ]),
          _: 1 /* STABLE */
        }, 8 /* PROPS */, ["appearance"]))
      : vue.createCommentVNode("v-if", true),
    ($setup.config.is_linkedin_login_enabled.value)
      ? (vue.openBlock(), vue.createBlock(_component_styled_button, {
          key: 4,
          appearance: $setup.ButtonAppearance.Primary,
          onClick: _cache[4] || (_cache[4] = 
				() => {
					$setup.window.location.href = `${$setup.config.authorizerURL.value}/oauth_login/linkedin?${$setup.queryParams}`;
				}
			)
        }, {
          default: vue.withCtx(() => [
            vue.createCommentVNode(" <Linkedin /> "),
            _hoisted_7
          ]),
          _: 1 /* STABLE */
        }, 8 /* PROPS */, ["appearance"]))
      : vue.createCommentVNode("v-if", true),
    (
				$setup.hasSocialLogin &&
				($setup.config.is_basic_authentication_enabled.value ||
					$setup.config.is_magic_link_login_enabled.value)
			)
      ? (vue.openBlock(), vue.createBlock(_component_styled_separator, { key: 5 }, {
          default: vue.withCtx(() => [
            _hoisted_8
          ]),
          _: 1 /* STABLE */
        }))
      : vue.createCommentVNode("v-if", true)
  ]))
}

script$3.render = render$3;
script$3.__file = "src/components/AuthorizerSocialLogin.vue";

var script$2 = {
	name: 'AuthorizerResetPassword',
};

function render$2(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", null, "Authorizer ResetPassword Component"))
}

script$2.render = render$2;
script$2.__file = "src/components/AuthorizerResetPassword.vue";

var script$1 = {
	name: 'AuthorizerVerifyOtp',
};

function render$1(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", null, "Authorizer VerifyOtp Component"))
}

script$1.render = render$1;
script$1.__file = "src/components/AuthorizerVerifyOtp.vue";

var script = {
	name: 'AuthorizerRoot',
	components: {
		'styled-wrapper': StyledWrapper,
		'authorizer-social-login': script$3,
		'authorizer-signup': script$7,
		'authorizer-magic-link-login': script$5,
		'authorizer-forgot-password': script$4,
		'authorizer-basic-auth-login': script$6,
	},
	props: ['onLogin', 'onSignup', 'onMagicLinkLogin', 'onForgotPassword'],
	setup(props) {
		const state = vue.reactive({
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
			...vue.toRefs(state),
			config: { ...vue.toRefs(globalConfig) },
			setView,
			urlProps,
			Views,
		};
	},
};

function render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_authorizer_social_login = vue.resolveComponent("authorizer-social-login");
  const _component_authorizer_basic_auth_login = vue.resolveComponent("authorizer-basic-auth-login");
  const _component_authorizer_signup = vue.resolveComponent("authorizer-signup");
  const _component_authorizer_magic_link_login = vue.resolveComponent("authorizer-magic-link-login");
  const _component_authorizer_forgot_password = vue.resolveComponent("authorizer-forgot-password");
  const _component_styled_wrapper = vue.resolveComponent("styled-wrapper");

  return (vue.openBlock(), vue.createBlock(_component_styled_wrapper, null, {
    default: vue.withCtx(() => [
      vue.createVNode(_component_authorizer_social_login, { urlProps: $setup.urlProps }, null, 8 /* PROPS */, ["urlProps"]),
      (
				_ctx.view === $setup.Views.Login &&
				$setup.config.is_basic_authentication_enabled.value &&
				!$setup.config.is_magic_link_login_enabled.value
			)
        ? (vue.openBlock(), vue.createBlock(_component_authorizer_basic_auth_login, {
            key: 0,
            setView: $setup.setView,
            onLogin: $props.onLogin,
            urlProps: $setup.urlProps
          }, null, 8 /* PROPS */, ["setView", "onLogin", "urlProps"]))
        : vue.createCommentVNode("v-if", true),
      (
				_ctx.view === $setup.Views.Signup &&
				$setup.config.is_basic_authentication_enabled.value &&
				!$setup.config.is_magic_link_login_enabled.value &&
				$setup.config.is_sign_up_enabled.value
			)
        ? (vue.openBlock(), vue.createBlock(_component_authorizer_signup, {
            key: 1,
            setView: $setup.setView,
            onSignup: $props.onSignup,
            urlProps: $setup.urlProps
          }, null, 8 /* PROPS */, ["setView", "onSignup", "urlProps"]))
        : vue.createCommentVNode("v-if", true),
      (_ctx.view === $setup.Views.Login && $setup.config.is_magic_link_login_enabled.value)
        ? (vue.openBlock(), vue.createBlock(_component_authorizer_magic_link_login, {
            key: 2,
            onMagicLinkLogin: $props.onMagicLinkLogin,
            urlProps: $setup.urlProps
          }, null, 8 /* PROPS */, ["onMagicLinkLogin", "urlProps"]))
        : vue.createCommentVNode("v-if", true),
      (_ctx.view === $setup.Views.ForgotPassword)
        ? (vue.openBlock(), vue.createBlock(_component_authorizer_forgot_password, {
            key: 3,
            setView: $setup.setView,
            onForgotPassword: $props.onForgotPassword,
            urlProps: $setup.urlProps
          }, null, 8 /* PROPS */, ["setView", "onForgotPassword", "urlProps"]))
        : vue.createCommentVNode("v-if", true)
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

module.exports = plugin;
