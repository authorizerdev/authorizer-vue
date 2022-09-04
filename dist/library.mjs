import { reactive, toRefs, provide, onMounted, onUnmounted, watch, computed, openBlock, createElementBlock, ref, resolveComponent, createBlock, Fragment, createElementVNode, withModifiers, createCommentVNode, createVNode, withCtx, withDirectives, vModelText, toDisplayString, createTextVNode, normalizeStyle, renderSlot } from 'vue';
import { Authorizer } from '@authorizerdev/authorizer-js';
import Styled, { css } from 'vue3-styled-components';

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

var globalState = reactive({
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

var globalConfig = reactive({
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

var script$e = {
	name: 'AuthorizerProvider',
	props: ['config', 'onStateChangeCallback'],
	setup(props) {
		const config = { ...toRefs(globalConfig) };
		const state = { ...toRefs(globalState) };
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
		state.authorizerRef.value = new Authorizer({
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
		provide('useAuthorizer', () => {
			return { ...toRefs(globalState), config: { ...toRefs(globalConfig) } };
		});
		onMounted(() => {
			getToken();
		});
		onUnmounted(() => {
			if (intervalRef) {
				clearInterval(intervalRef);
			}
		});
		watch([globalState, globalConfig], () => {
			if (props?.onStateChangeCallback) {
				props.onStateChangeCallback({ ...globalState, config: globalConfig });
			}
		});
		watch(
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
				state.authorizerRef.value = computed(function () {
					return new Authorizer({
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

script$e.__file = "src/components/AuthorizerProvider.vue";

var script$d = {
	name: 'AuthorizerSignup',
};

function render$d(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", null, "Authorizer Signup Component"))
}

script$d.render = render$d;
script$d.__file = "src/components/AuthorizerSignup.vue";

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
		css`
			@media (min-width: ${sizes[label] / 16}em) {
				${css(args)}
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

const StyledWrapper = Styled('div')`
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

const StyledButton = Styled('button', props)`
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

const StyledLink = Styled('span')`
  color: ${theme.colors.primary};
  cursor: pointer;
`;

const StyledSeparator = Styled('div')`
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

const StyledFooter = Styled('div')`
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

const StyledFormGroup = Styled('div', props)`
  width: 100%;
  border: 0px;
  background-color: #ffffff;
  padding: 0 0 15px;
  .form-input-label{
    padding: 2.5px;
    span {
      color: red;
    }
  }
  .form-input-field{
    width: 100%;
    margin-top: 5px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: ${theme.radius.input};
    border: 1px;
    border-style: solid;
    border-color: ${(props) =>
			props.hasError ? theme.colors.danger : theme.colors.textColor};
    :focus {
      ${(props) => props.hasError && `outline-color: ${theme.colors.danger}`};
    }
  }
  .form-input-error {
    font-size: 12px;
    font-weight: 400;
    color: red;
  }
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

const createQueryParams = (params) => {
	return Object.keys(params)
		.filter((k) => typeof params[k] !== 'undefined')
		.map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
		.join('&');
};

const validateEmail = (email) => {
	return String(email)
		.toLowerCase()
		.match(
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		);
};

var script$c = {
	name: 'AuthorizerVerifyOtp',
};

function render$c(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", null, "Authorizer VerifyOtp Component"))
}

script$c.render = render$c;
script$c.__file = "src/components/AuthorizerVerifyOtp.vue";

var script$b = {
	name: 'AuthorizerBasicAuthLogin',
	props: ['setView', 'onLogin', 'urlProps'],
	components: {
		'styled-button': StyledButton,
		'styled-form-group': StyledFormGroup,
		'styled-footer': StyledFooter,
		'styled-link': StyledLink,
		'authorizer-verify-otp': script$c,
	},
	setup({ setView, onLogin, urlProps }) {
		const config = { ...toRefs(globalConfig) };
		const { setAuthData, authorizerRef } = { ...toRefs(globalState) };
		const loading = ref(false);
		const error = ref(null);
		const otpData = reactive({
			isScreenVisible: false,
			email: null,
		});
		const formData = reactive({
			email: null,
			password: null,
		});
		const emailError = computed(() => {
			if (formData.email === '') {
				return 'Email is required';
			}
			if (formData.email && !validateEmail(formData.email)) {
				return 'Please enter valid email';
			}
		});
		const passwordError = computed(() => {
			if (formData.password === '') {
				return 'Password is required';
			}
		});
		const onSubmit = async () => {
			loading.value = true;
			try {
				const data = {
					email: formData.email,
					password: formData.password,
				};
				if (urlProps.scope) {
					data.scope = urlProps.scope;
				}
				const res = await authorizerRef.value.login(data);
				if (res && res?.should_show_otp_screen) {
					Object.assign(otpData, {
						isScreenVisible: true,
						email: data.email,
					});
					return;
				}
				if (res) {
					error.value = null;
					setAuthData.value({
						user: res.user || null,
						token: {
							access_token: res.access_token,
							expires_in: res.expires_in,
							refresh_token: res.refresh_token,
							id_token: res.id_token,
						},
						config,
						loading: false,
					});
				}
				if (onLogin) {
					onLogin(res);
				}
			} catch (error) {
				loading.value = false;
				error.value = error.message;
			}
		};
		return {
			...toRefs(formData),
			emailError,
			passwordError,
			onSubmit,
			ButtonAppearance,
			setView,
			Views,
			config,
			error,
			loading,
			otpData: { ...toRefs(otpData) },
		};
	},
};

const _hoisted_1$7 = /*#__PURE__*/createElementVNode("label", {
  class: "form-input-label",
  for: ""
}, [
  /*#__PURE__*/createElementVNode("span", null, "* "),
  /*#__PURE__*/createTextVNode("Email")
], -1 /* HOISTED */);
const _hoisted_2$2 = {
  key: 0,
  class: "form-input-error"
};
const _hoisted_3$1 = /*#__PURE__*/createElementVNode("label", {
  class: "form-input-label",
  for: ""
}, [
  /*#__PURE__*/createElementVNode("span", null, "* "),
  /*#__PURE__*/createTextVNode("Password")
], -1 /* HOISTED */);
const _hoisted_4$1 = {
  key: 0,
  class: "form-input-error"
};
const _hoisted_5$1 = /*#__PURE__*/createElementVNode("br", null, null, -1 /* HOISTED */);
const _hoisted_6$1 = /*#__PURE__*/createTextVNode("Processing ...");
const _hoisted_7$1 = /*#__PURE__*/createTextVNode("Log In");
const _hoisted_8$1 = /*#__PURE__*/createTextVNode(" Forgot Password? ");
const _hoisted_9$1 = { key: 0 };
const _hoisted_10$1 = /*#__PURE__*/createTextVNode(" Don't have an account? ");
const _hoisted_11$1 = /*#__PURE__*/createTextVNode("Sign Up");

function render$b(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_authorizer_verify_otp = resolveComponent("authorizer-verify-otp");
  const _component_styled_form_group = resolveComponent("styled-form-group");
  const _component_styled_button = resolveComponent("styled-button");
  const _component_styled_link = resolveComponent("styled-link");
  const _component_styled_footer = resolveComponent("styled-footer");

  return ($setup.otpData.isScreenVisible.value)
    ? (openBlock(), createBlock(_component_authorizer_verify_otp, {
        key: 0,
        setView: $setup.setView,
        onLogin: $props.onLogin,
        email: $setup.otpData.email.value
      }, null, 8 /* PROPS */, ["setView", "onLogin", "email"]))
    : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
        createElementVNode("form", {
          onSubmit: _cache[2] || (_cache[2] = withModifiers((...args) => ($setup.onSubmit && $setup.onSubmit(...args)), ["prevent"]))
        }, [
          createCommentVNode(" Email "),
          createVNode(_component_styled_form_group, { hasError: $setup.emailError }, {
            default: withCtx(() => [
              _hoisted_1$7,
              withDirectives(createElementVNode("input", {
                class: "form-input-field",
                placeholder: "eg. foo@bar.com",
                type: "email",
                "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => ((_ctx.email) = $event))
              }, null, 512 /* NEED_PATCH */), [
                [vModelText, _ctx.email]
              ]),
              ($setup.emailError)
                ? (openBlock(), createElementBlock("div", _hoisted_2$2, toDisplayString($setup.emailError), 1 /* TEXT */))
                : createCommentVNode("v-if", true)
            ]),
            _: 1 /* STABLE */
          }, 8 /* PROPS */, ["hasError"]),
          createCommentVNode(" password "),
          createVNode(_component_styled_form_group, { hasError: $setup.passwordError }, {
            default: withCtx(() => [
              _hoisted_3$1,
              withDirectives(createElementVNode("input", {
                class: "form-input-field",
                placeholder: "********",
                type: "password",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => ((_ctx.password) = $event))
              }, null, 512 /* NEED_PATCH */), [
                [vModelText, _ctx.password]
              ]),
              ($setup.passwordError)
                ? (openBlock(), createElementBlock("div", _hoisted_4$1, toDisplayString($setup.passwordError), 1 /* TEXT */))
                : createCommentVNode("v-if", true)
            ]),
            _: 1 /* STABLE */
          }, 8 /* PROPS */, ["hasError"]),
          _hoisted_5$1,
          createVNode(_component_styled_button, {
            appearance: $setup.ButtonAppearance.Primary,
            disabled: $setup.emailError || $setup.passwordError || !_ctx.email || !_ctx.password
          }, {
            default: withCtx(() => [
              ($setup.loading)
                ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                    _hoisted_6$1
                  ], 64 /* STABLE_FRAGMENT */))
                : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                    _hoisted_7$1
                  ], 64 /* STABLE_FRAGMENT */))
            ]),
            _: 1 /* STABLE */
          }, 8 /* PROPS */, ["appearance", "disabled"])
        ], 32 /* HYDRATE_EVENTS */),
        ($setup.setView)
          ? (openBlock(), createBlock(_component_styled_footer, { key: 0 }, {
              default: withCtx(() => [
                createVNode(_component_styled_link, {
                  onClick: _cache[3] || (_cache[3] = () => $setup.setView($setup.Views.ForgotPassword)),
                  style: { marginBottom: '10px' }
                }, {
                  default: withCtx(() => [
                    _hoisted_8$1
                  ]),
                  _: 1 /* STABLE */
                }),
                ($setup.config.is_sign_up_enabled.value)
                  ? (openBlock(), createElementBlock("div", _hoisted_9$1, [
                      _hoisted_10$1,
                      createVNode(_component_styled_link, {
                        onClick: _cache[4] || (_cache[4] = () => $setup.setView($setup.Views.Signup))
                      }, {
                        default: withCtx(() => [
                          _hoisted_11$1
                        ]),
                        _: 1 /* STABLE */
                      })
                    ]))
                  : createCommentVNode("v-if", true)
              ]),
              _: 1 /* STABLE */
            }))
          : createCommentVNode("v-if", true)
      ], 64 /* STABLE_FRAGMENT */))
}

script$b.render = render$b;
script$b.__file = "src/components/AuthorizerBasicAuthLogin.vue";

var script$a = {
	name: 'AuthorizerMagicLinkLogin',
};

function render$a(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", null, "Authorizer MagicLinkLogin Component"))
}

script$a.render = render$a;
script$a.__file = "src/components/AuthorizerMagicLinkLogin.vue";

var script$9 = {
	name: 'AuthorizerForgotPassword',
};

function render$9(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", null, "Authorizer ForgotPassword Component"))
}

script$9.render = render$9;
script$9.__file = "src/components/AuthorizerForgotPassword.vue";

var script$8 = {
	name: 'IconRoot',
	props: ['height', 'width', 'viewBox', 'style'],
	setup(props) {
		const rootStyle = { userSelect: 'none' };
		const composedStyle = computed(function () {
			return { ...rootStyle, ...props.style };
		});
		return {
			height: props?.height || 16,
			width: props?.width || 16,
			viewBox: props.viewBox,
			style: composedStyle,
		};
	},
};

const _hoisted_1$6 = ["viewBox", "width", "height"];

function render$8(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("svg", {
    viewBox: $setup.viewBox,
    width: $setup.width,
    height: $setup.height,
    style: normalizeStyle($setup.style)
  }, [
    renderSlot(_ctx.$slots, "default")
  ], 12 /* STYLE, PROPS */, _hoisted_1$6))
}

script$8.render = render$8;
script$8.__file = "src/components/IconRoot.vue";

var script$7 = {
	name: 'Google',
	components: {
		'icon-root': script$8,
	},
};

const _hoisted_1$5 = /*#__PURE__*/createElementVNode("g", { transform: "matrix(1, 0, 0, 1, 27.009001, -39.238998)" }, [
  /*#__PURE__*/createElementVNode("path", {
    fill: "#4285F4",
    d: "M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
  }),
  /*#__PURE__*/createElementVNode("path", {
    fill: "#34A853",
    d: "M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
  }),
  /*#__PURE__*/createElementVNode("path", {
    fill: "#FBBC05",
    d: "M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
  }),
  /*#__PURE__*/createElementVNode("path", {
    fill: "#EA4335",
    d: "M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
  })
], -1 /* HOISTED */);

function render$7(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_icon_root = resolveComponent("icon-root");

  return (openBlock(), createBlock(_component_icon_root, {
    width: 24,
    height: 24
  }, {
    default: withCtx(() => [
      _hoisted_1$5
    ]),
    _: 1 /* STABLE */
  }))
}

script$7.render = render$7;
script$7.__file = "src/icons/Google.vue";

var script$6 = {
	name: 'Facebook',
	components: {
		'icon-root': script$8,
	},
};

const _hoisted_1$4 = /*#__PURE__*/createElementVNode("path", { d: "M41,4H9C6.24,4,4,6.24,4,9v32c0,2.76,2.24,5,5,5h32c2.76,0,5-2.24,5-5V9C46,6.24,43.76,4,41,4z M37,19h-2c-2.14,0-3,0.5-3,2 v3h5l-1,5h-4v15h-5V29h-4v-5h4v-3c0-4,2-7,6-7c2.9,0,4,1,4,1V19z" }, null, -1 /* HOISTED */);

function render$6(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_icon_root = resolveComponent("icon-root");

  return (openBlock(), createBlock(_component_icon_root, {
    width: 24,
    height: 24,
    viewBox: '0 0 50 50',
    fill: '#1877f2'
  }, {
    default: withCtx(() => [
      _hoisted_1$4
    ]),
    _: 1 /* STABLE */
  }))
}

script$6.render = render$6;
script$6.__file = "src/icons/Facebook.vue";

var script$5 = {
	name: 'Github',
	components: {
		'icon-root': script$8,
	},
};

const _hoisted_1$3 = /*#__PURE__*/createElementVNode("path", {
  d: "M145.66 0C65.219 0 0 65.219 0 145.66c0 80.45 65.219 145.66 145.66 145.66s145.66-65.21 145.66-145.66C291.319 65.219 226.1 0 145.66 0zm40.802 256.625c-.838-11.398-1.775-25.518-1.83-31.235-.364-4.388-.838-15.549-11.434-22.677 42.068-3.523 62.087-26.774 63.526-57.499 1.202-17.497-5.754-32.883-18.107-45.3.628-13.282-.401-29.023-1.256-35.941-9.486-2.731-31.608 8.949-37.79 13.947-13.037-5.062-44.945-6.837-64.336 0-13.747-9.668-29.396-15.64-37.926-13.974-7.875 17.452-2.813 33.948-1.275 35.914-10.142 9.268-24.289 20.675-20.447 44.572 6.163 35.04 30.816 53.94 70.508 58.564-8.466 1.73-9.896 8.048-10.606 10.788-26.656 10.997-34.275-6.791-37.644-11.425-11.188-13.847-21.23-9.832-21.849-9.614-.601.218-1.056 1.092-.992 1.511.564 2.986 6.655 6.018 6.955 6.263 8.257 6.154 11.316 17.27 13.2 20.438 11.844 19.473 39.374 11.398 39.638 11.562.018 1.702-.191 16.032-.355 27.184C64.245 245.992 27.311 200.2 27.311 145.66c0-65.365 52.984-118.348 118.348-118.348S264.008 80.295 264.008 145.66c0 51.008-32.318 94.332-77.546 110.965z",
  fill: "#2b414d"
}, null, -1 /* HOISTED */);

function render$5(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_icon_root = resolveComponent("icon-root");

  return (openBlock(), createBlock(_component_icon_root, {
    width: 24,
    height: 24,
    viewBox: '0 0 291.32 291.32'
  }, {
    default: withCtx(() => [
      _hoisted_1$3
    ]),
    _: 1 /* STABLE */
  }, 8 /* PROPS */, ["viewBox"]))
}

script$5.render = render$5;
script$5.__file = "src/icons/Github.vue";

var script$4 = {
	name: 'Linkedin',
	components: {
		'icon-root': script$8,
	},
};

const _hoisted_1$2 = /*#__PURE__*/createElementVNode("path", {
  fill: "#0288D1",
  d: "M42 37a5 5 0 0 1-5 5H11a5 5 0 0 1-5-5V11a5 5 0 0 1 5-5h26a5 5 0 0 1 5 5v26z"
}, null, -1 /* HOISTED */);
const _hoisted_2$1 = /*#__PURE__*/createElementVNode("path", {
  fill: "#FFF",
  d: "M12 19h5v17h-5zm2.485-2h-.028C12.965 17 12 15.888 12 14.499 12 13.08 12.995 12 14.514 12c1.521 0 2.458 1.08 2.486 2.499C17 15.887 16.035 17 14.485 17zM36 36h-5v-9.099c0-2.198-1.225-3.698-3.192-3.698-1.501 0-2.313 1.012-2.707 1.99-.144.35-.101 1.318-.101 1.807v9h-5V19h5v2.616C25.721 20.5 26.85 19 29.738 19c3.578 0 6.261 2.25 6.261 7.274L36 36z"
}, null, -1 /* HOISTED */);

function render$4(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_icon_root = resolveComponent("icon-root");

  return (openBlock(), createBlock(_component_icon_root, {
    width: 24,
    height: 24,
    viewBox: '0 0 48 48',
    fill: '#1877f2'
  }, {
    default: withCtx(() => [
      _hoisted_1$2,
      _hoisted_2$1
    ]),
    _: 1 /* STABLE */
  }))
}

script$4.render = render$4;
script$4.__file = "src/icons/Linkedin.vue";

var script$3 = {
	name: 'Apple',
	components: {
		'icon-root': script$8,
	},
};

const _hoisted_1$1 = /*#__PURE__*/createElementVNode("path", { d: "M213.803 167.03c.442 47.58 41.74 63.413 42.197 63.615-.35 1.116-6.599 22.563-21.757 44.716-13.104 19.153-26.705 38.235-48.13 38.63-21.05.388-27.82-12.483-51.888-12.483-24.061 0-31.582 12.088-51.51 12.871-20.68.783-36.428-20.71-49.64-39.793-27-39.033-47.633-110.3-19.928-158.406 13.763-23.89 38.36-39.017 65.056-39.405 20.307-.387 39.475 13.662 51.889 13.662 12.406 0 35.699-16.895 60.186-14.414 10.25.427 39.026 4.14 57.503 31.186-1.49.923-34.335 20.044-33.978 59.822M174.24 50.199c10.98-13.29 18.369-31.79 16.353-50.199-15.826.636-34.962 10.546-46.314 23.828-10.173 11.763-19.082 30.589-16.678 48.633 17.64 1.365 35.66-8.964 46.64-22.262" }, null, -1 /* HOISTED */);

function render$3(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_icon_root = resolveComponent("icon-root");

  return (openBlock(), createBlock(_component_icon_root, {
    width: 24,
    height: 24,
    viewBox: '0 0 256 315',
    fill: '#000000'
  }, {
    default: withCtx(() => [
      _hoisted_1$1
    ]),
    _: 1 /* STABLE */
  }))
}

script$3.render = render$3;
script$3.__file = "src/icons/Apple.vue";

var script$2 = {
	name: 'AuthorizerSocialLogin',
	props: ['urlProps'],
	components: {
		'styled-button': StyledButton,
		'styled-separator': StyledSeparator,
		google: script$7,
		github: script$5,
		facebook: script$6,
		linkedin: script$4,
		apple: script$3,
	},
	setup({ urlProps }) {
		const config = { ...toRefs(globalConfig) };
		const hasSocialLogin = computed(function () {
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
const _hoisted_2 = /*#__PURE__*/createTextVNode(" Sign in with Apple ");
const _hoisted_3 = /*#__PURE__*/createElementVNode("br", null, null, -1 /* HOISTED */);
const _hoisted_4 = /*#__PURE__*/createTextVNode(" Sign in with Google ");
const _hoisted_5 = /*#__PURE__*/createElementVNode("br", null, null, -1 /* HOISTED */);
const _hoisted_6 = /*#__PURE__*/createTextVNode(" Sign in with Github ");
const _hoisted_7 = /*#__PURE__*/createElementVNode("br", null, null, -1 /* HOISTED */);
const _hoisted_8 = /*#__PURE__*/createTextVNode(" Sign in with Facebook ");
const _hoisted_9 = /*#__PURE__*/createElementVNode("br", null, null, -1 /* HOISTED */);
const _hoisted_10 = /*#__PURE__*/createTextVNode(" Sign in with Linkedin ");
const _hoisted_11 = /*#__PURE__*/createElementVNode("br", null, null, -1 /* HOISTED */);
const _hoisted_12 = /*#__PURE__*/createTextVNode(" OR ");

function render$2(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_apple = resolveComponent("apple");
  const _component_styled_button = resolveComponent("styled-button");
  const _component_google = resolveComponent("google");
  const _component_github = resolveComponent("github");
  const _component_facebook = resolveComponent("facebook");
  const _component_linkedin = resolveComponent("linkedin");
  const _component_styled_separator = resolveComponent("styled-separator");

  return (openBlock(), createElementBlock("div", null, [
    ($setup.config.is_apple_login_enabled.value)
      ? (openBlock(), createElementBlock("div", _hoisted_1, [
          createVNode(_component_styled_button, {
            appearance: $setup.ButtonAppearance.Default,
            onClick: _cache[0] || (_cache[0] = 
					() => {
						$setup.window.location.href = `${$setup.config.authorizerURL.value}/oauth_login/apple?${$setup.queryParams}`;
					}
				)
          }, {
            default: withCtx(() => [
              createVNode(_component_apple),
              _hoisted_2
            ]),
            _: 1 /* STABLE */
          }, 8 /* PROPS */, ["appearance"]),
          _hoisted_3
        ]))
      : createCommentVNode("v-if", true),
    ($setup.config.is_google_login_enabled.value)
      ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
          createVNode(_component_styled_button, {
            appearance: $setup.ButtonAppearance.Default,
            onClick: _cache[1] || (_cache[1] = 
					() => {
						$setup.window.location.href = `${$setup.config.authorizerURL.value}/oauth_login/google?${$setup.queryParams}`;
					}
				)
          }, {
            default: withCtx(() => [
              createVNode(_component_google),
              _hoisted_4
            ]),
            _: 1 /* STABLE */
          }, 8 /* PROPS */, ["appearance"]),
          _hoisted_5
        ], 64 /* STABLE_FRAGMENT */))
      : createCommentVNode("v-if", true),
    ($setup.config.is_github_login_enabled.value)
      ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [
          createVNode(_component_styled_button, {
            appearance: $setup.ButtonAppearance.Default,
            onClick: _cache[2] || (_cache[2] = 
					() => {
						$setup.window.location.href = `${$setup.config.authorizerURL.value}/oauth_login/github?${$setup.queryParams}`;
					}
				)
          }, {
            default: withCtx(() => [
              createVNode(_component_github),
              _hoisted_6
            ]),
            _: 1 /* STABLE */
          }, 8 /* PROPS */, ["appearance"]),
          _hoisted_7
        ], 64 /* STABLE_FRAGMENT */))
      : createCommentVNode("v-if", true),
    ($setup.config.is_facebook_login_enabled.value)
      ? (openBlock(), createElementBlock(Fragment, { key: 3 }, [
          createVNode(_component_styled_button, {
            appearance: $setup.ButtonAppearance.Default,
            onClick: _cache[3] || (_cache[3] = 
					() => {
						$setup.window.location.href = `${$setup.config.authorizerURL.value}/oauth_login/facebook?${$setup.queryParams}`;
					}
				)
          }, {
            default: withCtx(() => [
              createVNode(_component_facebook),
              _hoisted_8
            ]),
            _: 1 /* STABLE */
          }, 8 /* PROPS */, ["appearance"]),
          _hoisted_9
        ], 64 /* STABLE_FRAGMENT */))
      : createCommentVNode("v-if", true),
    ($setup.config.is_linkedin_login_enabled.value)
      ? (openBlock(), createElementBlock(Fragment, { key: 4 }, [
          createVNode(_component_styled_button, {
            appearance: $setup.ButtonAppearance.Default,
            onClick: _cache[4] || (_cache[4] = 
					() => {
						$setup.window.location.href = `${$setup.config.authorizerURL.value}/oauth_login/linkedin?${$setup.queryParams}`;
					}
				)
          }, {
            default: withCtx(() => [
              createVNode(_component_linkedin),
              _hoisted_10
            ]),
            _: 1 /* STABLE */
          }, 8 /* PROPS */, ["appearance"]),
          _hoisted_11
        ], 64 /* STABLE_FRAGMENT */))
      : createCommentVNode("v-if", true),
    (
				$setup.hasSocialLogin &&
				($setup.config.is_basic_authentication_enabled.value ||
					$setup.config.is_magic_link_login_enabled.value)
			)
      ? (openBlock(), createBlock(_component_styled_separator, { key: 5 }, {
          default: withCtx(() => [
            _hoisted_12
          ]),
          _: 1 /* STABLE */
        }))
      : createCommentVNode("v-if", true)
  ]))
}

script$2.render = render$2;
script$2.__file = "src/components/AuthorizerSocialLogin.vue";

var script$1 = {
	name: 'AuthorizerResetPassword',
};

function render$1(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", null, "Authorizer ResetPassword Component"))
}

script$1.render = render$1;
script$1.__file = "src/components/AuthorizerResetPassword.vue";

var script = {
	name: 'AuthorizerRoot',
	components: {
		'styled-wrapper': StyledWrapper,
		'authorizer-social-login': script$2,
		'authorizer-signup': script$d,
		'authorizer-magic-link-login': script$a,
		'authorizer-forgot-password': script$9,
		'authorizer-basic-auth-login': script$b,
	},
	props: ['onLogin', 'onSignup', 'onMagicLinkLogin', 'onForgotPassword'],
	setup(props) {
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
			config: { ...toRefs(globalConfig) },
			setView,
			urlProps,
			Views,
		};
	},
};

function render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_authorizer_social_login = resolveComponent("authorizer-social-login");
  const _component_authorizer_basic_auth_login = resolveComponent("authorizer-basic-auth-login");
  const _component_authorizer_signup = resolveComponent("authorizer-signup");
  const _component_authorizer_magic_link_login = resolveComponent("authorizer-magic-link-login");
  const _component_authorizer_forgot_password = resolveComponent("authorizer-forgot-password");
  const _component_styled_wrapper = resolveComponent("styled-wrapper");

  return (openBlock(), createBlock(_component_styled_wrapper, null, {
    default: withCtx(() => [
      createVNode(_component_authorizer_social_login, { urlProps: $setup.urlProps }, null, 8 /* PROPS */, ["urlProps"]),
      (
				_ctx.view === $setup.Views.Login &&
				$setup.config.is_basic_authentication_enabled.value &&
				!$setup.config.is_magic_link_login_enabled.value
			)
        ? (openBlock(), createBlock(_component_authorizer_basic_auth_login, {
            key: 0,
            setView: $setup.setView,
            onLogin: $props.onLogin,
            urlProps: $setup.urlProps
          }, null, 8 /* PROPS */, ["setView", "onLogin", "urlProps"]))
        : createCommentVNode("v-if", true),
      (
				_ctx.view === $setup.Views.Signup &&
				$setup.config.is_basic_authentication_enabled.value &&
				!$setup.config.is_magic_link_login_enabled.value &&
				$setup.config.is_sign_up_enabled.value
			)
        ? (openBlock(), createBlock(_component_authorizer_signup, {
            key: 1,
            setView: $setup.setView,
            onSignup: $props.onSignup,
            urlProps: $setup.urlProps
          }, null, 8 /* PROPS */, ["setView", "onSignup", "urlProps"]))
        : createCommentVNode("v-if", true),
      (_ctx.view === $setup.Views.Login && $setup.config.is_magic_link_login_enabled.value)
        ? (openBlock(), createBlock(_component_authorizer_magic_link_login, {
            key: 2,
            onMagicLinkLogin: $props.onMagicLinkLogin,
            urlProps: $setup.urlProps
          }, null, 8 /* PROPS */, ["onMagicLinkLogin", "urlProps"]))
        : createCommentVNode("v-if", true),
      (_ctx.view === $setup.Views.ForgotPassword)
        ? (openBlock(), createBlock(_component_authorizer_forgot_password, {
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
	AuthorizerProvider: script$e,
	AuthorizerSignup: script$d,
	AuthorizerBasicAuthLogin: script$b,
	AuthorizerMagicLinkLogin: script$a,
	AuthorizerForgotPassword: script$9,
	AuthorizerSocialLogin: script$2,
	AuthorizerResetPassword: script$1,
	AuthorizerVerifyOtp: script$c,
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
