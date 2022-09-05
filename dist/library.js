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

const MessageType = {
	Error: 'Error',
	Success: 'Success',
};

// TODO use based on theme primary color
const passwordStrengthIndicatorOpacity = {
	default: 0.15,
	weak: 0.4,
	good: 0.6,
	strong: 0.8,
	veryStrong: 1,
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

var script$h = {
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
			return { ...vue.toRefs(globalState), config: { ...vue.toRefs(globalConfig) } };
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

script$h.__file = "src/components/AuthorizerProvider.vue";

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

const StyledLink = Styled__default["default"]('span')`
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

const StyledFooter = Styled__default["default"]('div')`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
`;

const StyledMessageWrapper = Styled__default["default"]('div', props)`
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

const StyledFlex = Styled__default["default"]('div', props)`
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

const StyledFormGroup = Styled__default["default"]('div', props)`
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

const StyledCheckBoxLabel = Styled__default["default"]('div')`
  margin-left: 5px
`;

const StyledPasswordStrengthWrapper = Styled__default["default"]('div')`
  margin: 2% 0 0;
`;

const StyledPasswordStrength = Styled__default["default"]('div')`
  width: 100%;
  height: 10px;
  flex: 0.75;
  border-radius: 5px;
  margin-right: 5px;
  background-color: ${theme.colors.primary};
  opacity: ${(props) => passwordStrengthIndicatorOpacity[props.strength]};
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

const isValidEmail = (email) => {
	return String(email)
		.toLowerCase()
		.match(
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		);
};

const capitalizeFirstLetter = (data) => {
	return data ? data.charAt(0).toUpperCase() + data.slice(1) : null;
};

const isValidOtp = (otp) => {
	const re = /^([A-Z0-9]{6})$/;
	return otp && re.test(String(otp.trim()));
};

const validatePassword = (value = '') => {
	const res = {
		score: 0,
		strength: '',
		hasSixChar: false,
		hasLowerCase: false,
		hasUpperCase: false,
		hasNumericChar: false,
		hasSpecialChar: false,
		maxThirtySixChar: false,
	};

	if (value.length >= 6) {
		res.score = res.score + 1;
		res.hasSixChar = true;
	}

	if (value.length > 0 && value.length <= 36) {
		res.score = res.score + 1;
		res.maxThirtySixChar = true;
	}

	Array.from(value).forEach((char) => {
		if (char >= 'A' && char <= 'Z' && !res.hasUpperCase) {
			res.score = res.score + 1;
			res.hasUpperCase = true;
		} else if (char >= 'a' && char <= 'z' && !res.hasLowerCase) {
			res.score = res.score + 1;
			res.hasLowerCase = true;
		} else if (char >= '0' && char <= '9' && !res.hasNumericChar) {
			res.score = res.score + 1;
			res.hasNumericChar = true;
		} else if (!res.hasSpecialChar) {
			res.score = res.score + 1;
			res.hasSpecialChar = true;
		}
	});

	if (res.score <= 2) {
		res.strength = 'Weak';
	} else if (res.score <= 4) {
		res.strength = 'Good';
	} else if (res.score <= 5) {
		res.strength = 'Strong';
	} else {
		res.strength = 'Very Strong';
	}

	const isValid = Object.values(res).every((i) => Boolean(i));
	return { ...res, isValid };
};

var script$g = {
	name: 'IconRoot',
	props: ['height', 'width', 'viewBox', 'style'],
	setup(props) {
		const rootStyle = { userSelect: 'none' };
		const composedStyle = vue.computed(function () {
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

const _hoisted_1$e = ["viewBox", "width", "height"];

function render$g(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("svg", {
    viewBox: $setup.viewBox,
    width: $setup.width,
    height: $setup.height,
    style: vue.normalizeStyle($setup.style)
  }, [
    vue.renderSlot(_ctx.$slots, "default")
  ], 12 /* STYLE, PROPS */, _hoisted_1$e))
}

script$g.render = render$g;
script$g.__file = "src/components/IconRoot.vue";

var script$f = {
	name: 'Close',
	props: ['height', 'width'],
	components: {
		'icon-root': script$g,
	},
	setup(props) {
		return {
			height: props.height,
			width: props.width,
		};
	},
};

const _hoisted_1$d = /*#__PURE__*/vue.createElementVNode("g", null, [
  /*#__PURE__*/vue.createElementVNode("path", {
    fill: "#ffffff",
    d: "M617.2,495.8l349.1,350.9c31.7,31.8,31.7,83.5,0,115.3c-31.7,31.9-83.1,31.9-114.8,0L502.4,611.2L149.8,965.6c-32,32.2-83.8,32.2-115.8,0c-32-32.1-32-84.3,0-116.4l352.6-354.5L48.2,154.6c-31.7-31.9-31.7-83.5,0-115.4c31.7-31.9,83.1-31.9,114.7,0l338.4,340.2l343.3-345c32-32.1,83.8-32.1,115.8,0c32,32.2,32,84.3,0,116.4L617.2,495.8z"
  })
], -1 /* HOISTED */);

function render$f(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_icon_root = vue.resolveComponent("icon-root");

  return (vue.openBlock(), vue.createBlock(_component_icon_root, {
    width: $setup.width,
    height: $setup.height,
    viewBox: '0 0 1000 1000'
  }, {
    default: vue.withCtx(() => [
      _hoisted_1$d
    ]),
    _: 1 /* STABLE */
  }, 8 /* PROPS */, ["width", "height"]))
}

script$f.render = render$f;
script$f.__file = "src/icons/Close.vue";

var script$e = {
	name: 'Message',
	props: ['type', 'text', 'onClose'],
	components: {
		'styled-message-wrapper': StyledMessageWrapper,
		'styled-flex': StyledFlex,
		close: script$f,
	},
	setup({ type, text, onClose }) {
		return {
			type,
			text: capitalizeFirstLetter(text),
			onClose,
		};
	},
};

const _hoisted_1$c = { style: { flex: 1 } };

function render$e(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_close = vue.resolveComponent("close");
  const _component_styled_flex = vue.resolveComponent("styled-flex");
  const _component_styled_message_wrapper = vue.resolveComponent("styled-message-wrapper");

  return (vue.openBlock(), vue.createBlock(_component_styled_message_wrapper, { type: $setup.type }, {
    default: vue.withCtx(() => [
      vue.createVNode(_component_styled_flex, {
        alignItems: "center",
        justifyContent: "space-between"
      }, {
        default: vue.withCtx(() => [
          vue.createElementVNode("div", _hoisted_1$c, vue.toDisplayString($setup.text), 1 /* TEXT */),
          ($setup.onClose)
            ? (vue.openBlock(), vue.createElementBlock("span", {
                key: 0,
                style: { cursor: 'pointer' },
                onClick: _cache[0] || (_cache[0] = (...args) => ($setup.onClose && $setup.onClose(...args)))
              }, [
                vue.createVNode(_component_close, {
                  height: "10px",
                  width: "10px"
                })
              ]))
            : vue.createCommentVNode("v-if", true)
        ]),
        _: 1 /* STABLE */
      })
    ]),
    _: 1 /* STABLE */
  }, 8 /* PROPS */, ["type"]))
}

script$e.render = render$e;
script$e.__file = "src/components/Message.vue";

var script$d = {
	name: 'PasswordStrengthIndicator',
	props: ['value', 'setDisableButton'],
	components: {
		'styled-check-box-label': StyledCheckBoxLabel,
		'styled-password-strength-wrapper': StyledPasswordStrengthWrapper,
		'styled-password-strength': StyledPasswordStrength,
		'styled-flex': StyledFlex,
	},
	setup(props) {
		const { setDisableButton } = props;
		const componentState = vue.reactive({
			strength: '',
			score: 0,
			hasSixChar: false,
			hasLowerCase: false,
			hasNumericChar: false,
			hasSpecialChar: false,
			hasUpperCase: false,
			maxThirtySixChar: false,
		});
		vue.watch(
			() => props.value,
			(newValue) => {
				const validationData = validatePassword(newValue);
				Object.assign(componentState, validationData);
				if (
					Object.values(validationData).some((isValid) => isValid === false)
				) {
					setDisableButton(true);
				} else {
					setDisableButton(false);
				}
			}
		);
		return {
			...vue.toRefs(componentState),
		};
	},
};

const _hoisted_1$b = /*#__PURE__*/vue.createElementVNode("p", null, [
  /*#__PURE__*/vue.createElementVNode("b", null, "Criteria for a strong password:")
], -1 /* HOISTED */);
const _hoisted_2$7 = ["checked"];
const _hoisted_3$6 = /*#__PURE__*/vue.createTextVNode("At least 6 characters");
const _hoisted_4$6 = ["checked"];
const _hoisted_5$6 = /*#__PURE__*/vue.createTextVNode("At least 1 lowercase letter");
const _hoisted_6$6 = ["checked"];
const _hoisted_7$6 = /*#__PURE__*/vue.createTextVNode("At least 1 uppercase letter");
const _hoisted_8$5 = ["checked"];
const _hoisted_9$5 = /*#__PURE__*/vue.createTextVNode("At least 1 numeric character");
const _hoisted_10$4 = ["checked"];
const _hoisted_11$4 = /*#__PURE__*/vue.createTextVNode("At least 1 special character");
const _hoisted_12$3 = ["checked"];
const _hoisted_13 = /*#__PURE__*/vue.createTextVNode("Maximum 36 characters");

function render$d(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_styled_password_strength = vue.resolveComponent("styled-password-strength");
  const _component_styled_flex = vue.resolveComponent("styled-flex");
  const _component_styled_check_box_label = vue.resolveComponent("styled-check-box-label");
  const _component_styled_password_strength_wrapper = vue.resolveComponent("styled-password-strength-wrapper");

  return (vue.openBlock(), vue.createElementBlock("div", null, [
    vue.createVNode(_component_styled_password_strength_wrapper, null, {
      default: vue.withCtx(() => [
        vue.createVNode(_component_styled_flex, {
          alignItems: "center",
          justifyContent: "center",
          wrap: "nowrap"
        }, {
          default: vue.withCtx(() => [
            vue.createVNode(_component_styled_password_strength, {
              strength: _ctx.score > 2 ? 'weak' : 'default'
            }, null, 8 /* PROPS */, ["strength"]),
            vue.createVNode(_component_styled_password_strength, {
              strength: _ctx.score > 3 ? 'good' : 'default'
            }, null, 8 /* PROPS */, ["strength"]),
            vue.createVNode(_component_styled_password_strength, {
              strength: _ctx.score > 4 ? 'strong' : 'default'
            }, null, 8 /* PROPS */, ["strength"]),
            vue.createVNode(_component_styled_password_strength, {
              strength: _ctx.score > 5 ? 'veryStrong' : 'default'
            }, null, 8 /* PROPS */, ["strength"]),
            vue.createElementVNode("div", null, vue.toDisplayString(_ctx.strength), 1 /* TEXT */)
          ]),
          _: 1 /* STABLE */
        }),
        _hoisted_1$b,
        vue.createVNode(_component_styled_flex, { flexDirection: "column" }, {
          default: vue.withCtx(() => [
            vue.createVNode(_component_styled_flex, {
              justifyContent: "start",
              alignItems: "center"
            }, {
              default: vue.withCtx(() => [
                vue.createElementVNode("input", {
                  readOnly: "",
                  type: "checkbox",
                  checked: _ctx.hasSixChar
                }, null, 8 /* PROPS */, _hoisted_2$7),
                vue.createVNode(_component_styled_check_box_label, null, {
                  default: vue.withCtx(() => [
                    _hoisted_3$6
                  ]),
                  _: 1 /* STABLE */
                })
              ]),
              _: 1 /* STABLE */
            }),
            vue.createVNode(_component_styled_flex, {
              justifyContent: "start",
              alignItems: "center"
            }, {
              default: vue.withCtx(() => [
                vue.createElementVNode("input", {
                  readOnly: "",
                  type: "checkbox",
                  checked: _ctx.hasLowerCase
                }, null, 8 /* PROPS */, _hoisted_4$6),
                vue.createVNode(_component_styled_check_box_label, null, {
                  default: vue.withCtx(() => [
                    _hoisted_5$6
                  ]),
                  _: 1 /* STABLE */
                })
              ]),
              _: 1 /* STABLE */
            }),
            vue.createVNode(_component_styled_flex, {
              justifyContent: "start",
              alignItems: "center"
            }, {
              default: vue.withCtx(() => [
                vue.createElementVNode("input", {
                  readOnly: "",
                  type: "checkbox",
                  checked: _ctx.hasUpperCase
                }, null, 8 /* PROPS */, _hoisted_6$6),
                vue.createVNode(_component_styled_check_box_label, null, {
                  default: vue.withCtx(() => [
                    _hoisted_7$6
                  ]),
                  _: 1 /* STABLE */
                })
              ]),
              _: 1 /* STABLE */
            }),
            vue.createVNode(_component_styled_flex, {
              justifyContent: "start",
              alignItems: "center"
            }, {
              default: vue.withCtx(() => [
                vue.createElementVNode("input", {
                  readOnly: "",
                  type: "checkbox",
                  checked: _ctx.hasNumericChar
                }, null, 8 /* PROPS */, _hoisted_8$5),
                vue.createVNode(_component_styled_check_box_label, null, {
                  default: vue.withCtx(() => [
                    _hoisted_9$5
                  ]),
                  _: 1 /* STABLE */
                })
              ]),
              _: 1 /* STABLE */
            }),
            vue.createVNode(_component_styled_flex, {
              justifyContent: "start",
              alignItems: "center"
            }, {
              default: vue.withCtx(() => [
                vue.createElementVNode("input", {
                  readOnly: "",
                  type: "checkbox",
                  checked: _ctx.hasSpecialChar
                }, null, 8 /* PROPS */, _hoisted_10$4),
                vue.createVNode(_component_styled_check_box_label, null, {
                  default: vue.withCtx(() => [
                    _hoisted_11$4
                  ]),
                  _: 1 /* STABLE */
                })
              ]),
              _: 1 /* STABLE */
            }),
            vue.createVNode(_component_styled_flex, {
              justifyContent: "start",
              alignItems: "center"
            }, {
              default: vue.withCtx(() => [
                vue.createElementVNode("input", {
                  readOnly: "",
                  type: "checkbox",
                  checked: _ctx.maxThirtySixChar
                }, null, 8 /* PROPS */, _hoisted_12$3),
                vue.createVNode(_component_styled_check_box_label, null, {
                  default: vue.withCtx(() => [
                    _hoisted_13
                  ]),
                  _: 1 /* STABLE */
                })
              ]),
              _: 1 /* STABLE */
            })
          ]),
          _: 1 /* STABLE */
        })
      ]),
      _: 1 /* STABLE */
    })
  ]))
}

script$d.render = render$d;
script$d.__file = "src/components/PasswordStrengthIndicator.vue";

var script$c = {
	name: 'AuthorizerSignup',
	props: ['setView', 'onSignup', 'urlProps'],
	components: {
		'password-strength-indicator': script$d,
		'styled-button': StyledButton,
		'styled-form-group': StyledFormGroup,
		'styled-footer': StyledFooter,
		'styled-link': StyledLink,
		message: script$e,
	},
	setup({ setView, onSignup, urlProps }) {
		const config = { ...vue.toRefs(globalConfig) };
		const { setAuthData, authorizerRef } = { ...vue.toRefs(globalState) };
		const componentState = vue.reactive({
			error: null,
			successMessage: null,
			loading: false,
			disableSignupButton: false,
		});
		const formData = vue.reactive({
			email: null,
			password: null,
			confirmPassword: null,
		});
		const emailError = vue.computed(() => {
			if (formData.email === '') {
				return 'Email is required';
			}
			if (formData.email && !isValidEmail(formData.email)) {
				return 'Please enter valid email';
			}
		});
		const passwordError = vue.computed(() => {
			if (formData.password === '') {
				return 'Password is required';
			}
			if (
				formData.password &&
				formData.confirmPassword &&
				formData.confirmPassword !== formData.password
			) {
				return `Password and confirm passwords don't match`;
			}
		});
		const confirmPasswordError = vue.computed(() => {
			if (formData.confirmPassword === '') {
				return 'Confirm password is required';
			}
			if (
				formData.password &&
				formData.confirmPassword &&
				formData.confirmPassword !== formData.password
			) {
				return `Password and confirm passwords don't match`;
			}
		});
		const onSubmit = async () => {
			try {
				componentState.loading = true;
				const data = {
					email: formData.email,
					password: formData.password,
					confirm_password: formData.confirmPassword,
				};
				if (urlProps.scope) {
					data.scope = urlProps.scope;
				}
				if (urlProps.redirect_uri) {
					data.redirect_uri = urlProps.redirect_uri;
				}
				const res = await authorizerRef.value.signup(data);
				if (res) {
					componentState.error = null;
					if (res.access_token) {
						componentState.error = null;
						setAuthData.value({
							user: res.user || null,
							token: {
								access_token: res.access_token,
								expires_in: res.expires_in,
								refresh_token: res.refresh_token,
								id_token: res.id_token,
							},
							config: globalConfig,
							loading: false,
						});
					} else {
						componentState.error = null;
						componentState.successMessage = res?.message ? res.message : null;
					}
					if (onSignup) {
						onSignup(res);
					}
				}
			} catch (error) {
				componentState.loading = false;
				componentState.error = error.message;
			}
		};
		const onErrorClose = () => {
			componentState.error = null;
		};
		const setDisableButton = (value) => {
			componentState.disableSignupButton = value;
		};
		return {
			...vue.toRefs(componentState),
			...vue.toRefs(formData),
			config,
			onSubmit,
			onErrorClose,
			MessageType,
			ButtonAppearance,
			Views,
			emailError,
			passwordError,
			confirmPasswordError,
			setDisableButton,
			setView,
		};
	},
};

const _hoisted_1$a = /*#__PURE__*/vue.createElementVNode("label", {
  class: "form-input-label",
  for: ""
}, [
  /*#__PURE__*/vue.createElementVNode("span", null, "* "),
  /*#__PURE__*/vue.createTextVNode("Email")
], -1 /* HOISTED */);
const _hoisted_2$6 = {
  key: 0,
  class: "form-input-error"
};
const _hoisted_3$5 = /*#__PURE__*/vue.createElementVNode("label", {
  class: "form-input-label",
  for: ""
}, [
  /*#__PURE__*/vue.createElementVNode("span", null, "* "),
  /*#__PURE__*/vue.createTextVNode("Password")
], -1 /* HOISTED */);
const _hoisted_4$5 = {
  key: 0,
  class: "form-input-error"
};
const _hoisted_5$5 = /*#__PURE__*/vue.createElementVNode("label", {
  class: "form-input-label",
  for: ""
}, [
  /*#__PURE__*/vue.createElementVNode("span", null, "* "),
  /*#__PURE__*/vue.createTextVNode("Confirm Password")
], -1 /* HOISTED */);
const _hoisted_6$5 = {
  key: 0,
  class: "form-input-error"
};
const _hoisted_7$5 = /*#__PURE__*/vue.createElementVNode("br", null, null, -1 /* HOISTED */);
const _hoisted_8$4 = /*#__PURE__*/vue.createTextVNode("Processing ...");
const _hoisted_9$4 = /*#__PURE__*/vue.createTextVNode("Sign Up");
const _hoisted_10$3 = /*#__PURE__*/vue.createTextVNode(" Already have an account? ");
const _hoisted_11$3 = /*#__PURE__*/vue.createTextVNode("Log In");

function render$c(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_message = vue.resolveComponent("message");
  const _component_styled_form_group = vue.resolveComponent("styled-form-group");
  const _component_password_strength_indicator = vue.resolveComponent("password-strength-indicator");
  const _component_styled_button = vue.resolveComponent("styled-button");
  const _component_styled_link = vue.resolveComponent("styled-link");
  const _component_styled_footer = vue.resolveComponent("styled-footer");

  return (_ctx.successMessage)
    ? (vue.openBlock(), vue.createBlock(_component_message, {
        key: 0,
        type: $setup.MessageType.Success,
        text: _ctx.successMessage
      }, null, 8 /* PROPS */, ["type", "text"]))
    : (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 1 }, [
        (_ctx.error)
          ? (vue.openBlock(), vue.createBlock(_component_message, {
              key: 0,
              type: $setup.MessageType.Error,
              text: _ctx.error,
              onClose: $setup.onErrorClose
            }, null, 8 /* PROPS */, ["type", "text", "onClose"]))
          : vue.createCommentVNode("v-if", true),
        vue.createElementVNode("form", {
          onSubmit: _cache[3] || (_cache[3] = vue.withModifiers((...args) => ($setup.onSubmit && $setup.onSubmit(...args)), ["prevent"]))
        }, [
          vue.createCommentVNode(" Email "),
          vue.createVNode(_component_styled_form_group, { hasError: $setup.emailError }, {
            default: vue.withCtx(() => [
              _hoisted_1$a,
              vue.withDirectives(vue.createElementVNode("input", {
                class: "form-input-field",
                placeholder: "eg. foo@bar.com",
                type: "email",
                "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => ((_ctx.email) = $event))
              }, null, 512 /* NEED_PATCH */), [
                [vue.vModelText, _ctx.email]
              ]),
              ($setup.emailError)
                ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_2$6, vue.toDisplayString($setup.emailError), 1 /* TEXT */))
                : vue.createCommentVNode("v-if", true)
            ]),
            _: 1 /* STABLE */
          }, 8 /* PROPS */, ["hasError"]),
          vue.createCommentVNode(" password "),
          vue.createVNode(_component_styled_form_group, { hasError: $setup.passwordError }, {
            default: vue.withCtx(() => [
              _hoisted_3$5,
              vue.withDirectives(vue.createElementVNode("input", {
                class: "form-input-field",
                placeholder: "********",
                type: "password",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => ((_ctx.password) = $event))
              }, null, 512 /* NEED_PATCH */), [
                [vue.vModelText, _ctx.password]
              ]),
              ($setup.passwordError)
                ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_4$5, vue.toDisplayString($setup.passwordError), 1 /* TEXT */))
                : vue.createCommentVNode("v-if", true)
            ]),
            _: 1 /* STABLE */
          }, 8 /* PROPS */, ["hasError"]),
          vue.createCommentVNode(" confirm password "),
          vue.createVNode(_component_styled_form_group, { hasError: $setup.confirmPasswordError }, {
            default: vue.withCtx(() => [
              _hoisted_5$5,
              vue.withDirectives(vue.createElementVNode("input", {
                class: "form-input-field",
                placeholder: "********",
                type: "password",
                "onUpdate:modelValue": _cache[2] || (_cache[2] = $event => ((_ctx.confirmPassword) = $event))
              }, null, 512 /* NEED_PATCH */), [
                [vue.vModelText, _ctx.confirmPassword]
              ]),
              ($setup.confirmPasswordError)
                ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_6$5, vue.toDisplayString($setup.confirmPasswordError), 1 /* TEXT */))
                : vue.createCommentVNode("v-if", true)
            ]),
            _: 1 /* STABLE */
          }, 8 /* PROPS */, ["hasError"]),
          ($setup.config.is_strong_password_enabled.value)
            ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 0 }, [
                vue.createVNode(_component_password_strength_indicator, {
                  value: _ctx.password,
                  setDisableButton: $setup.setDisableButton
                }, null, 8 /* PROPS */, ["value", "setDisableButton"]),
                _hoisted_7$5
              ], 64 /* STABLE_FRAGMENT */))
            : vue.createCommentVNode("v-if", true),
          vue.createVNode(_component_styled_button, {
            appearance: $setup.ButtonAppearance.Primary,
            disabled: 
					$setup.emailError ||
					$setup.passwordError ||
					$setup.confirmPasswordError ||
					!_ctx.email ||
					!_ctx.password ||
					!_ctx.confirmPassword ||
					_ctx.loading ||
					_ctx.disableSignupButton
				
          }, {
            default: vue.withCtx(() => [
              (_ctx.loading)
                ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 0 }, [
                    _hoisted_8$4
                  ], 64 /* STABLE_FRAGMENT */))
                : (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 1 }, [
                    _hoisted_9$4
                  ], 64 /* STABLE_FRAGMENT */))
            ]),
            _: 1 /* STABLE */
          }, 8 /* PROPS */, ["appearance", "disabled"])
        ], 32 /* HYDRATE_EVENTS */),
        ($props.setView)
          ? (vue.openBlock(), vue.createBlock(_component_styled_footer, { key: 1 }, {
              default: vue.withCtx(() => [
                vue.createElementVNode("div", null, [
                  _hoisted_10$3,
                  vue.createVNode(_component_styled_link, {
                    onClick: _cache[4] || (_cache[4] = () => $props.setView($setup.Views.Login))
                  }, {
                    default: vue.withCtx(() => [
                      _hoisted_11$3
                    ]),
                    _: 1 /* STABLE */
                  })
                ])
              ]),
              _: 1 /* STABLE */
            }))
          : vue.createCommentVNode("v-if", true)
      ], 64 /* STABLE_FRAGMENT */))
}

script$c.render = render$c;
script$c.__file = "src/components/AuthorizerSignup.vue";

var script$b = {
	name: 'AuthorizerVerifyOtp',
	props: ['setView', 'onLogin', 'email'],
	components: {
		'styled-button': StyledButton,
		'styled-form-group': StyledFormGroup,
		'styled-footer': StyledFooter,
		'styled-link': StyledLink,
		message: script$e,
	},
	setup({ setView, onLogin, email }) {
		const config = { ...vue.toRefs(globalConfig) };
		const { setAuthData, authorizerRef } = { ...vue.toRefs(globalState) };
		const componentState = vue.reactive({
			error: null,
			successMessage: null,
			loading: false,
			sendingOtp: false,
			otp: null,
		});
		const otpError = vue.computed(() => {
			if (componentState.otp === '') {
				return 'OTP is required';
			}
			if (componentState.otp && !isValidOtp(componentState.otp)) {
				return 'Please enter valid OTP';
			}
		});
		const onSubmit = async () => {
			componentState.successMessage = null;
			try {
				componentState.loading = true;
				const res = await authorizerRef.value.verifyOtp({
					email,
					otp: componentState.otp,
				});
				componentState.loading = false;
				if (res) {
					componentState.error = null;
					setAuthData.value({
						user: res.user || null,
						token: {
							access_token: res.access_token,
							expires_in: res.expires_in,
							refresh_token: res.refresh_token,
							id_token: res.id_token,
						},
						config: globalConfig,
						loading: false,
					});
				}
				if (onLogin) {
					onLogin(res);
				}
			} catch (error) {
				componentState.loading = false;
				componentState.error = error.message;
			}
		};
		const onSuccessClose = () => {
			componentState.successMessage = null;
		};
		const onErrorClose = () => {
			componentState.error = null;
		};
		const resendOtp = async () => {
			componentState.successMessage = null;
			try {
				componentState.sendingOtp = true;
				const res = await authorizerRef.value.resendOtp({
					email,
				});
				componentState.sendingOtp = false;
				if (res && res?.message) {
					componentState.error = null;
					componentState.successMessage = res.message;
				}
				if (onLogin) {
					onLogin(res);
				}
			} catch (error) {
				componentState.loading = false;
				componentState.error = error.message;
			}
		};
		return {
			...vue.toRefs(componentState),
			config,
			otpError,
			onSubmit,
			MessageType,
			onSuccessClose,
			onErrorClose,
			ButtonAppearance,
			resendOtp,
			Views,
			setView,
		};
	},
};

const _hoisted_1$9 = /*#__PURE__*/vue.createElementVNode("p", { style: { textAlign: 'center', margin: '10px 0px' } }, " Please enter the OTP you received on your email address. ", -1 /* HOISTED */);
const _hoisted_2$5 = /*#__PURE__*/vue.createElementVNode("br", null, null, -1 /* HOISTED */);
const _hoisted_3$4 = /*#__PURE__*/vue.createElementVNode("label", {
  class: "form-input-label",
  for: ""
}, [
  /*#__PURE__*/vue.createElementVNode("span", null, "* "),
  /*#__PURE__*/vue.createTextVNode("OTP (One Time Password)")
], -1 /* HOISTED */);
const _hoisted_4$4 = {
  key: 0,
  class: "form-input-error"
};
const _hoisted_5$4 = /*#__PURE__*/vue.createElementVNode("br", null, null, -1 /* HOISTED */);
const _hoisted_6$4 = /*#__PURE__*/vue.createTextVNode("Processing ...");
const _hoisted_7$4 = /*#__PURE__*/vue.createTextVNode("Submit");
const _hoisted_8$3 = {
  key: 0,
  style: { marginBottom: '10px' }
};
const _hoisted_9$3 = /*#__PURE__*/vue.createTextVNode(" Resend OTP ");
const _hoisted_10$2 = { key: 2 };
const _hoisted_11$2 = /*#__PURE__*/vue.createTextVNode(" Don't have an account? ");
const _hoisted_12$2 = /*#__PURE__*/vue.createTextVNode("Sign Up");

function render$b(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_message = vue.resolveComponent("message");
  const _component_styled_form_group = vue.resolveComponent("styled-form-group");
  const _component_styled_button = vue.resolveComponent("styled-button");
  const _component_styled_link = vue.resolveComponent("styled-link");
  const _component_styled_footer = vue.resolveComponent("styled-footer");

  return (vue.openBlock(), vue.createElementBlock(vue.Fragment, null, [
    (_ctx.successMessage)
      ? (vue.openBlock(), vue.createBlock(_component_message, {
          key: 0,
          type: $setup.MessageType.Success,
          text: _ctx.successMessage,
          onClose: $setup.onSuccessClose
        }, null, 8 /* PROPS */, ["type", "text", "onClose"]))
      : vue.createCommentVNode("v-if", true),
    (_ctx.error)
      ? (vue.openBlock(), vue.createBlock(_component_message, {
          key: 1,
          type: $setup.MessageType.Error,
          text: _ctx.error,
          onClose: $setup.onErrorClose
        }, null, 8 /* PROPS */, ["type", "text", "onClose"]))
      : vue.createCommentVNode("v-if", true),
    _hoisted_1$9,
    _hoisted_2$5,
    vue.createElementVNode("form", {
      onSubmit: _cache[1] || (_cache[1] = vue.withModifiers((...args) => ($setup.onSubmit && $setup.onSubmit(...args)), ["prevent"]))
    }, [
      vue.createCommentVNode(" OTP "),
      vue.createVNode(_component_styled_form_group, { hasError: $setup.otpError }, {
        default: vue.withCtx(() => [
          _hoisted_3$4,
          vue.withDirectives(vue.createElementVNode("input", {
            class: "form-input-field",
            placeholder: "eg. AB123C",
            type: "password",
            "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => ((_ctx.otp) = $event))
          }, null, 512 /* NEED_PATCH */), [
            [vue.vModelText, _ctx.otp]
          ]),
          ($setup.otpError)
            ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_4$4, vue.toDisplayString($setup.otpError), 1 /* TEXT */))
            : vue.createCommentVNode("v-if", true)
        ]),
        _: 1 /* STABLE */
      }, 8 /* PROPS */, ["hasError"]),
      _hoisted_5$4,
      vue.createVNode(_component_styled_button, {
        appearance: $setup.ButtonAppearance.Primary,
        disabled: $setup.otpError || !_ctx.otp
      }, {
        default: vue.withCtx(() => [
          (_ctx.loading)
            ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 0 }, [
                _hoisted_6$4
              ], 64 /* STABLE_FRAGMENT */))
            : (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 1 }, [
                _hoisted_7$4
              ], 64 /* STABLE_FRAGMENT */))
        ]),
        _: 1 /* STABLE */
      }, 8 /* PROPS */, ["appearance", "disabled"])
    ], 32 /* HYDRATE_EVENTS */),
    ($setup.setView)
      ? (vue.openBlock(), vue.createBlock(_component_styled_footer, { key: 2 }, {
          default: vue.withCtx(() => [
            (_ctx.sendingOtp)
              ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_8$3, "Sending ..."))
              : (vue.openBlock(), vue.createBlock(_component_styled_link, {
                  key: 1,
                  onClick: $setup.resendOtp,
                  style: { marginBottom: '10px' }
                }, {
                  default: vue.withCtx(() => [
                    _hoisted_9$3
                  ]),
                  _: 1 /* STABLE */
                }, 8 /* PROPS */, ["onClick"])),
            ($setup.config.is_sign_up_enabled.value)
              ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_10$2, [
                  _hoisted_11$2,
                  vue.createVNode(_component_styled_link, {
                    onClick: _cache[2] || (_cache[2] = () => $setup.setView($setup.Views.Signup))
                  }, {
                    default: vue.withCtx(() => [
                      _hoisted_12$2
                    ]),
                    _: 1 /* STABLE */
                  })
                ]))
              : vue.createCommentVNode("v-if", true)
          ]),
          _: 1 /* STABLE */
        }))
      : vue.createCommentVNode("v-if", true)
  ], 64 /* STABLE_FRAGMENT */))
}

script$b.render = render$b;
script$b.__file = "src/components/AuthorizerVerifyOtp.vue";

var script$a = {
	name: 'AuthorizerBasicAuthLogin',
	props: ['setView', 'onLogin', 'urlProps'],
	components: {
		'styled-button': StyledButton,
		'styled-form-group': StyledFormGroup,
		'styled-footer': StyledFooter,
		'styled-link': StyledLink,
		'authorizer-verify-otp': script$b,
		message: script$e,
	},
	setup({ setView, onLogin, urlProps }) {
		const config = { ...vue.toRefs(globalConfig) };
		const { setAuthData, authorizerRef } = { ...vue.toRefs(globalState) };
		const componentState = vue.reactive({
			loading: false,
			error: null,
		});
		const otpData = vue.reactive({
			isScreenVisible: false,
			email: null,
		});
		const formData = vue.reactive({
			email: null,
			password: null,
		});
		const emailError = vue.computed(() => {
			if (formData.email === '') {
				return 'Email is required';
			}
			if (formData.email && !isValidEmail(formData.email)) {
				return 'Please enter valid email';
			}
		});
		const passwordError = vue.computed(() => {
			if (formData.password === '') {
				return 'Password is required';
			}
		});
		const onErrorClose = () => {
			componentState.error = null;
		};
		const onSubmit = async () => {
			componentState.loading = true;
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
					componentState.error = null;
					setAuthData.value({
						user: res.user || null,
						token: {
							access_token: res.access_token,
							expires_in: res.expires_in,
							refresh_token: res.refresh_token,
							id_token: res.id_token,
						},
						config: globalConfig,
						loading: false,
					});
				}
				if (onLogin) {
					onLogin(res);
				}
			} catch (error) {
				componentState.loading = false;
				componentState.error = error.message;
			}
		};
		return {
			...vue.toRefs(formData),
			...vue.toRefs(componentState),
			otpData: { ...vue.toRefs(otpData) },
			emailError,
			passwordError,
			onSubmit,
			ButtonAppearance,
			setView,
			Views,
			config,
			MessageType,
			onErrorClose,
		};
	},
};

const _hoisted_1$8 = { key: 1 };
const _hoisted_2$4 = /*#__PURE__*/vue.createElementVNode("label", {
  class: "form-input-label",
  for: ""
}, [
  /*#__PURE__*/vue.createElementVNode("span", null, "* "),
  /*#__PURE__*/vue.createTextVNode("Email")
], -1 /* HOISTED */);
const _hoisted_3$3 = {
  key: 0,
  class: "form-input-error"
};
const _hoisted_4$3 = /*#__PURE__*/vue.createElementVNode("label", {
  class: "form-input-label",
  for: ""
}, [
  /*#__PURE__*/vue.createElementVNode("span", null, "* "),
  /*#__PURE__*/vue.createTextVNode("Password")
], -1 /* HOISTED */);
const _hoisted_5$3 = {
  key: 0,
  class: "form-input-error"
};
const _hoisted_6$3 = /*#__PURE__*/vue.createElementVNode("br", null, null, -1 /* HOISTED */);
const _hoisted_7$3 = /*#__PURE__*/vue.createTextVNode("Processing ...");
const _hoisted_8$2 = /*#__PURE__*/vue.createTextVNode("Log In");
const _hoisted_9$2 = /*#__PURE__*/vue.createTextVNode(" Forgot Password? ");
const _hoisted_10$1 = { key: 0 };
const _hoisted_11$1 = /*#__PURE__*/vue.createTextVNode(" Don't have an account? ");
const _hoisted_12$1 = /*#__PURE__*/vue.createTextVNode("Sign Up");

function render$a(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_authorizer_verify_otp = vue.resolveComponent("authorizer-verify-otp");
  const _component_message = vue.resolveComponent("message");
  const _component_styled_form_group = vue.resolveComponent("styled-form-group");
  const _component_styled_button = vue.resolveComponent("styled-button");
  const _component_styled_link = vue.resolveComponent("styled-link");
  const _component_styled_footer = vue.resolveComponent("styled-footer");

  return ($setup.otpData.isScreenVisible.value)
    ? (vue.openBlock(), vue.createBlock(_component_authorizer_verify_otp, {
        key: 0,
        setView: $setup.setView,
        onLogin: $props.onLogin,
        email: $setup.otpData.email.value
      }, null, 8 /* PROPS */, ["setView", "onLogin", "email"]))
    : (vue.openBlock(), vue.createElementBlock("div", _hoisted_1$8, [
        (_ctx.error)
          ? (vue.openBlock(), vue.createBlock(_component_message, {
              key: 0,
              type: $setup.MessageType.Error,
              text: _ctx.error,
              onClose: $setup.onErrorClose
            }, null, 8 /* PROPS */, ["type", "text", "onClose"]))
          : vue.createCommentVNode("v-if", true),
        vue.createElementVNode("form", {
          onSubmit: _cache[2] || (_cache[2] = vue.withModifiers((...args) => ($setup.onSubmit && $setup.onSubmit(...args)), ["prevent"]))
        }, [
          vue.createCommentVNode(" Email "),
          vue.createVNode(_component_styled_form_group, { hasError: $setup.emailError }, {
            default: vue.withCtx(() => [
              _hoisted_2$4,
              vue.withDirectives(vue.createElementVNode("input", {
                class: "form-input-field",
                placeholder: "eg. foo@bar.com",
                type: "email",
                "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => ((_ctx.email) = $event))
              }, null, 512 /* NEED_PATCH */), [
                [vue.vModelText, _ctx.email]
              ]),
              ($setup.emailError)
                ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_3$3, vue.toDisplayString($setup.emailError), 1 /* TEXT */))
                : vue.createCommentVNode("v-if", true)
            ]),
            _: 1 /* STABLE */
          }, 8 /* PROPS */, ["hasError"]),
          vue.createCommentVNode(" password "),
          vue.createVNode(_component_styled_form_group, { hasError: $setup.passwordError }, {
            default: vue.withCtx(() => [
              _hoisted_4$3,
              vue.withDirectives(vue.createElementVNode("input", {
                class: "form-input-field",
                placeholder: "********",
                type: "password",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => ((_ctx.password) = $event))
              }, null, 512 /* NEED_PATCH */), [
                [vue.vModelText, _ctx.password]
              ]),
              ($setup.passwordError)
                ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_5$3, vue.toDisplayString($setup.passwordError), 1 /* TEXT */))
                : vue.createCommentVNode("v-if", true)
            ]),
            _: 1 /* STABLE */
          }, 8 /* PROPS */, ["hasError"]),
          _hoisted_6$3,
          vue.createVNode(_component_styled_button, {
            appearance: $setup.ButtonAppearance.Primary,
            disabled: $setup.emailError || $setup.passwordError || !_ctx.email || !_ctx.password
          }, {
            default: vue.withCtx(() => [
              (_ctx.loading)
                ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 0 }, [
                    _hoisted_7$3
                  ], 64 /* STABLE_FRAGMENT */))
                : (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 1 }, [
                    _hoisted_8$2
                  ], 64 /* STABLE_FRAGMENT */))
            ]),
            _: 1 /* STABLE */
          }, 8 /* PROPS */, ["appearance", "disabled"])
        ], 32 /* HYDRATE_EVENTS */),
        ($setup.setView)
          ? (vue.openBlock(), vue.createBlock(_component_styled_footer, { key: 1 }, {
              default: vue.withCtx(() => [
                vue.createVNode(_component_styled_link, {
                  onClick: _cache[3] || (_cache[3] = () => $setup.setView($setup.Views.ForgotPassword)),
                  style: { marginBottom: '10px' }
                }, {
                  default: vue.withCtx(() => [
                    _hoisted_9$2
                  ]),
                  _: 1 /* STABLE */
                }),
                ($setup.config.is_sign_up_enabled.value)
                  ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_10$1, [
                      _hoisted_11$1,
                      vue.createVNode(_component_styled_link, {
                        onClick: _cache[4] || (_cache[4] = () => $setup.setView($setup.Views.Signup))
                      }, {
                        default: vue.withCtx(() => [
                          _hoisted_12$1
                        ]),
                        _: 1 /* STABLE */
                      })
                    ]))
                  : vue.createCommentVNode("v-if", true)
              ]),
              _: 1 /* STABLE */
            }))
          : vue.createCommentVNode("v-if", true)
      ]))
}

script$a.render = render$a;
script$a.__file = "src/components/AuthorizerBasicAuthLogin.vue";

var script$9 = {
	name: 'AuthorizerMagicLinkLogin',
};

function render$9(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", null, "Authorizer MagicLinkLogin Component"))
}

script$9.render = render$9;
script$9.__file = "src/components/AuthorizerMagicLinkLogin.vue";

var script$8 = {
	name: 'AuthorizerForgotPassword',
	props: ['setView', 'onForgotPassword', 'urlProps'],
	components: {
		'styled-button': StyledButton,
		'styled-form-group': StyledFormGroup,
		'styled-footer': StyledFooter,
		'styled-link': StyledLink,
		message: script$e,
	},
	setup({ setView, onForgotPassword, urlProps }) {
		const config = { ...vue.toRefs(globalConfig) };
		const { authorizerRef } = { ...vue.toRefs(globalState) };
		const componentState = vue.reactive({
			error: null,
			successMessage: null,
			loading: false,
			email: null,
		});
		const emailError = vue.computed(() => {
			if (componentState.email === '') {
				return 'Email is required';
			}
			if (componentState.email && !isValidEmail(componentState.email)) {
				return 'Please enter valid email';
			}
		});
		const onSubmit = async () => {
			try {
				componentState.loading = true;
				const res = await authorizerRef.value.forgotPassword({
					email: componentState.email,
					state: urlProps.state || '',
					redirect_uri:
						urlProps.redirect_uri ||
						config.redirectURL.value ||
						window.location.origin,
				});
				componentState.loading = false;
				if (res && res.message) {
					componentState.error = null;
					componentState.successMessage = res.message;
				}
				if (onForgotPassword) {
					onForgotPassword(res);
				}
			} catch (error) {
				componentState.loading = false;
				componentState.error = error.message;
			}
		};
		const onErrorClose = () => {
			componentState.error = null;
		};
		return {
			...vue.toRefs(componentState),
			onSubmit,
			onErrorClose,
			MessageType,
			ButtonAppearance,
			Views,
			setView,
			emailError,
		};
	},
};

const _hoisted_1$7 = /*#__PURE__*/vue.createElementVNode("p", { style: { textAlign: 'center', margin: '10px 0px' } }, [
  /*#__PURE__*/vue.createTextVNode(" Please enter your email address. "),
  /*#__PURE__*/vue.createElementVNode("br"),
  /*#__PURE__*/vue.createTextVNode(" We will send you an email to reset your password. ")
], -1 /* HOISTED */);
const _hoisted_2$3 = /*#__PURE__*/vue.createElementVNode("br", null, null, -1 /* HOISTED */);
const _hoisted_3$2 = /*#__PURE__*/vue.createElementVNode("label", {
  class: "form-input-label",
  for: ""
}, [
  /*#__PURE__*/vue.createElementVNode("span", null, "* "),
  /*#__PURE__*/vue.createTextVNode("Email")
], -1 /* HOISTED */);
const _hoisted_4$2 = {
  key: 0,
  class: "form-input-error"
};
const _hoisted_5$2 = /*#__PURE__*/vue.createElementVNode("br", null, null, -1 /* HOISTED */);
const _hoisted_6$2 = /*#__PURE__*/vue.createTextVNode("Processing ...");
const _hoisted_7$2 = /*#__PURE__*/vue.createTextVNode("Send Email");
const _hoisted_8$1 = /*#__PURE__*/vue.createTextVNode(" Remember your password? ");
const _hoisted_9$1 = /*#__PURE__*/vue.createTextVNode("Log In");

function render$8(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_message = vue.resolveComponent("message");
  const _component_styled_form_group = vue.resolveComponent("styled-form-group");
  const _component_styled_button = vue.resolveComponent("styled-button");
  const _component_styled_link = vue.resolveComponent("styled-link");
  const _component_styled_footer = vue.resolveComponent("styled-footer");

  return (_ctx.successMessage)
    ? (vue.openBlock(), vue.createBlock(_component_message, {
        key: 0,
        type: $setup.MessageType.Success,
        text: _ctx.successMessage
      }, null, 8 /* PROPS */, ["type", "text"]))
    : (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 1 }, [
        (_ctx.error)
          ? (vue.openBlock(), vue.createBlock(_component_message, {
              key: 0,
              type: $setup.MessageType.Error,
              text: _ctx.error,
              onClose: $setup.onErrorClose
            }, null, 8 /* PROPS */, ["type", "text", "onClose"]))
          : vue.createCommentVNode("v-if", true),
        _hoisted_1$7,
        _hoisted_2$3,
        vue.createElementVNode("form", {
          onSubmit: _cache[1] || (_cache[1] = vue.withModifiers((...args) => ($setup.onSubmit && $setup.onSubmit(...args)), ["prevent"]))
        }, [
          vue.createCommentVNode(" Email "),
          vue.createVNode(_component_styled_form_group, { hasError: $setup.emailError }, {
            default: vue.withCtx(() => [
              _hoisted_3$2,
              vue.withDirectives(vue.createElementVNode("input", {
                class: "form-input-field",
                placeholder: "eg. foo@bar.com",
                type: "email",
                "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => ((_ctx.email) = $event))
              }, null, 512 /* NEED_PATCH */), [
                [vue.vModelText, _ctx.email]
              ]),
              ($setup.emailError)
                ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_4$2, vue.toDisplayString($setup.emailError), 1 /* TEXT */))
                : vue.createCommentVNode("v-if", true)
            ]),
            _: 1 /* STABLE */
          }, 8 /* PROPS */, ["hasError"]),
          _hoisted_5$2,
          vue.createVNode(_component_styled_button, {
            appearance: $setup.ButtonAppearance.Primary,
            disabled: $setup.emailError || !_ctx.email
          }, {
            default: vue.withCtx(() => [
              (_ctx.loading)
                ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 0 }, [
                    _hoisted_6$2
                  ], 64 /* STABLE_FRAGMENT */))
                : (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 1 }, [
                    _hoisted_7$2
                  ], 64 /* STABLE_FRAGMENT */))
            ]),
            _: 1 /* STABLE */
          }, 8 /* PROPS */, ["appearance", "disabled"])
        ], 32 /* HYDRATE_EVENTS */),
        ($props.setView)
          ? (vue.openBlock(), vue.createBlock(_component_styled_footer, { key: 1 }, {
              default: vue.withCtx(() => [
                vue.createElementVNode("div", null, [
                  _hoisted_8$1,
                  vue.createVNode(_component_styled_link, {
                    onClick: _cache[2] || (_cache[2] = () => $props.setView($setup.Views.Login))
                  }, {
                    default: vue.withCtx(() => [
                      _hoisted_9$1
                    ]),
                    _: 1 /* STABLE */
                  })
                ])
              ]),
              _: 1 /* STABLE */
            }))
          : vue.createCommentVNode("v-if", true)
      ], 64 /* STABLE_FRAGMENT */))
}

script$8.render = render$8;
script$8.__file = "src/components/AuthorizerForgotPassword.vue";

var script$7 = {
	name: 'Google',
	components: {
		'icon-root': script$g,
	},
};

const _hoisted_1$6 = /*#__PURE__*/vue.createElementVNode("g", { transform: "matrix(1, 0, 0, 1, 27.009001, -39.238998)" }, [
  /*#__PURE__*/vue.createElementVNode("path", {
    fill: "#4285F4",
    d: "M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
  }),
  /*#__PURE__*/vue.createElementVNode("path", {
    fill: "#34A853",
    d: "M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
  }),
  /*#__PURE__*/vue.createElementVNode("path", {
    fill: "#FBBC05",
    d: "M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
  }),
  /*#__PURE__*/vue.createElementVNode("path", {
    fill: "#EA4335",
    d: "M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
  })
], -1 /* HOISTED */);

function render$7(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_icon_root = vue.resolveComponent("icon-root");

  return (vue.openBlock(), vue.createBlock(_component_icon_root, {
    width: 24,
    height: 24
  }, {
    default: vue.withCtx(() => [
      _hoisted_1$6
    ]),
    _: 1 /* STABLE */
  }))
}

script$7.render = render$7;
script$7.__file = "src/icons/Google.vue";

var script$6 = {
	name: 'Facebook',
	components: {
		'icon-root': script$g,
	},
};

const _hoisted_1$5 = /*#__PURE__*/vue.createElementVNode("path", { d: "M41,4H9C6.24,4,4,6.24,4,9v32c0,2.76,2.24,5,5,5h32c2.76,0,5-2.24,5-5V9C46,6.24,43.76,4,41,4z M37,19h-2c-2.14,0-3,0.5-3,2 v3h5l-1,5h-4v15h-5V29h-4v-5h4v-3c0-4,2-7,6-7c2.9,0,4,1,4,1V19z" }, null, -1 /* HOISTED */);

function render$6(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_icon_root = vue.resolveComponent("icon-root");

  return (vue.openBlock(), vue.createBlock(_component_icon_root, {
    width: 24,
    height: 24,
    viewBox: '0 0 50 50',
    fill: '#1877f2'
  }, {
    default: vue.withCtx(() => [
      _hoisted_1$5
    ]),
    _: 1 /* STABLE */
  }))
}

script$6.render = render$6;
script$6.__file = "src/icons/Facebook.vue";

var script$5 = {
	name: 'Github',
	components: {
		'icon-root': script$g,
	},
};

const _hoisted_1$4 = /*#__PURE__*/vue.createElementVNode("path", {
  d: "M145.66 0C65.219 0 0 65.219 0 145.66c0 80.45 65.219 145.66 145.66 145.66s145.66-65.21 145.66-145.66C291.319 65.219 226.1 0 145.66 0zm40.802 256.625c-.838-11.398-1.775-25.518-1.83-31.235-.364-4.388-.838-15.549-11.434-22.677 42.068-3.523 62.087-26.774 63.526-57.499 1.202-17.497-5.754-32.883-18.107-45.3.628-13.282-.401-29.023-1.256-35.941-9.486-2.731-31.608 8.949-37.79 13.947-13.037-5.062-44.945-6.837-64.336 0-13.747-9.668-29.396-15.64-37.926-13.974-7.875 17.452-2.813 33.948-1.275 35.914-10.142 9.268-24.289 20.675-20.447 44.572 6.163 35.04 30.816 53.94 70.508 58.564-8.466 1.73-9.896 8.048-10.606 10.788-26.656 10.997-34.275-6.791-37.644-11.425-11.188-13.847-21.23-9.832-21.849-9.614-.601.218-1.056 1.092-.992 1.511.564 2.986 6.655 6.018 6.955 6.263 8.257 6.154 11.316 17.27 13.2 20.438 11.844 19.473 39.374 11.398 39.638 11.562.018 1.702-.191 16.032-.355 27.184C64.245 245.992 27.311 200.2 27.311 145.66c0-65.365 52.984-118.348 118.348-118.348S264.008 80.295 264.008 145.66c0 51.008-32.318 94.332-77.546 110.965z",
  fill: "#2b414d"
}, null, -1 /* HOISTED */);

function render$5(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_icon_root = vue.resolveComponent("icon-root");

  return (vue.openBlock(), vue.createBlock(_component_icon_root, {
    width: 24,
    height: 24,
    viewBox: '0 0 291.32 291.32'
  }, {
    default: vue.withCtx(() => [
      _hoisted_1$4
    ]),
    _: 1 /* STABLE */
  }, 8 /* PROPS */, ["viewBox"]))
}

script$5.render = render$5;
script$5.__file = "src/icons/Github.vue";

var script$4 = {
	name: 'Linkedin',
	components: {
		'icon-root': script$g,
	},
};

const _hoisted_1$3 = /*#__PURE__*/vue.createElementVNode("path", {
  fill: "#0288D1",
  d: "M42 37a5 5 0 0 1-5 5H11a5 5 0 0 1-5-5V11a5 5 0 0 1 5-5h26a5 5 0 0 1 5 5v26z"
}, null, -1 /* HOISTED */);
const _hoisted_2$2 = /*#__PURE__*/vue.createElementVNode("path", {
  fill: "#FFF",
  d: "M12 19h5v17h-5zm2.485-2h-.028C12.965 17 12 15.888 12 14.499 12 13.08 12.995 12 14.514 12c1.521 0 2.458 1.08 2.486 2.499C17 15.887 16.035 17 14.485 17zM36 36h-5v-9.099c0-2.198-1.225-3.698-3.192-3.698-1.501 0-2.313 1.012-2.707 1.99-.144.35-.101 1.318-.101 1.807v9h-5V19h5v2.616C25.721 20.5 26.85 19 29.738 19c3.578 0 6.261 2.25 6.261 7.274L36 36z"
}, null, -1 /* HOISTED */);

function render$4(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_icon_root = vue.resolveComponent("icon-root");

  return (vue.openBlock(), vue.createBlock(_component_icon_root, {
    width: 24,
    height: 24,
    viewBox: '0 0 48 48',
    fill: '#1877f2'
  }, {
    default: vue.withCtx(() => [
      _hoisted_1$3,
      _hoisted_2$2
    ]),
    _: 1 /* STABLE */
  }))
}

script$4.render = render$4;
script$4.__file = "src/icons/Linkedin.vue";

var script$3 = {
	name: 'Apple',
	components: {
		'icon-root': script$g,
	},
};

const _hoisted_1$2 = /*#__PURE__*/vue.createElementVNode("path", { d: "M213.803 167.03c.442 47.58 41.74 63.413 42.197 63.615-.35 1.116-6.599 22.563-21.757 44.716-13.104 19.153-26.705 38.235-48.13 38.63-21.05.388-27.82-12.483-51.888-12.483-24.061 0-31.582 12.088-51.51 12.871-20.68.783-36.428-20.71-49.64-39.793-27-39.033-47.633-110.3-19.928-158.406 13.763-23.89 38.36-39.017 65.056-39.405 20.307-.387 39.475 13.662 51.889 13.662 12.406 0 35.699-16.895 60.186-14.414 10.25.427 39.026 4.14 57.503 31.186-1.49.923-34.335 20.044-33.978 59.822M174.24 50.199c10.98-13.29 18.369-31.79 16.353-50.199-15.826.636-34.962 10.546-46.314 23.828-10.173 11.763-19.082 30.589-16.678 48.633 17.64 1.365 35.66-8.964 46.64-22.262" }, null, -1 /* HOISTED */);

function render$3(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_icon_root = vue.resolveComponent("icon-root");

  return (vue.openBlock(), vue.createBlock(_component_icon_root, {
    width: 24,
    height: 24,
    viewBox: '0 0 256 315',
    fill: '#000000'
  }, {
    default: vue.withCtx(() => [
      _hoisted_1$2
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

const _hoisted_1$1 = {
  key: 0,
  id: "appleid-signin"
};
const _hoisted_2$1 = /*#__PURE__*/vue.createTextVNode(" Sign in with Apple ");
const _hoisted_3$1 = /*#__PURE__*/vue.createElementVNode("br", null, null, -1 /* HOISTED */);
const _hoisted_4$1 = /*#__PURE__*/vue.createTextVNode(" Sign in with Google ");
const _hoisted_5$1 = /*#__PURE__*/vue.createElementVNode("br", null, null, -1 /* HOISTED */);
const _hoisted_6$1 = /*#__PURE__*/vue.createTextVNode(" Sign in with Github ");
const _hoisted_7$1 = /*#__PURE__*/vue.createElementVNode("br", null, null, -1 /* HOISTED */);
const _hoisted_8 = /*#__PURE__*/vue.createTextVNode(" Sign in with Facebook ");
const _hoisted_9 = /*#__PURE__*/vue.createElementVNode("br", null, null, -1 /* HOISTED */);
const _hoisted_10 = /*#__PURE__*/vue.createTextVNode(" Sign in with Linkedin ");
const _hoisted_11 = /*#__PURE__*/vue.createElementVNode("br", null, null, -1 /* HOISTED */);
const _hoisted_12 = /*#__PURE__*/vue.createTextVNode(" OR ");

function render$2(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_apple = vue.resolveComponent("apple");
  const _component_styled_button = vue.resolveComponent("styled-button");
  const _component_google = vue.resolveComponent("google");
  const _component_github = vue.resolveComponent("github");
  const _component_facebook = vue.resolveComponent("facebook");
  const _component_linkedin = vue.resolveComponent("linkedin");
  const _component_styled_separator = vue.resolveComponent("styled-separator");

  return (vue.openBlock(), vue.createElementBlock("div", null, [
    ($setup.config.is_apple_login_enabled.value)
      ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_1$1, [
          vue.createVNode(_component_styled_button, {
            appearance: $setup.ButtonAppearance.Default,
            onClick: _cache[0] || (_cache[0] = 
					() => {
						$setup.window.location.href = `${$setup.config.authorizerURL.value}/oauth_login/apple?${$setup.queryParams}`;
					}
				)
          }, {
            default: vue.withCtx(() => [
              vue.createVNode(_component_apple),
              _hoisted_2$1
            ]),
            _: 1 /* STABLE */
          }, 8 /* PROPS */, ["appearance"]),
          _hoisted_3$1
        ]))
      : vue.createCommentVNode("v-if", true),
    ($setup.config.is_google_login_enabled.value)
      ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 1 }, [
          vue.createVNode(_component_styled_button, {
            appearance: $setup.ButtonAppearance.Default,
            onClick: _cache[1] || (_cache[1] = 
					() => {
						$setup.window.location.href = `${$setup.config.authorizerURL.value}/oauth_login/google?${$setup.queryParams}`;
					}
				)
          }, {
            default: vue.withCtx(() => [
              vue.createVNode(_component_google),
              _hoisted_4$1
            ]),
            _: 1 /* STABLE */
          }, 8 /* PROPS */, ["appearance"]),
          _hoisted_5$1
        ], 64 /* STABLE_FRAGMENT */))
      : vue.createCommentVNode("v-if", true),
    ($setup.config.is_github_login_enabled.value)
      ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 2 }, [
          vue.createVNode(_component_styled_button, {
            appearance: $setup.ButtonAppearance.Default,
            onClick: _cache[2] || (_cache[2] = 
					() => {
						$setup.window.location.href = `${$setup.config.authorizerURL.value}/oauth_login/github?${$setup.queryParams}`;
					}
				)
          }, {
            default: vue.withCtx(() => [
              vue.createVNode(_component_github),
              _hoisted_6$1
            ]),
            _: 1 /* STABLE */
          }, 8 /* PROPS */, ["appearance"]),
          _hoisted_7$1
        ], 64 /* STABLE_FRAGMENT */))
      : vue.createCommentVNode("v-if", true),
    ($setup.config.is_facebook_login_enabled.value)
      ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 3 }, [
          vue.createVNode(_component_styled_button, {
            appearance: $setup.ButtonAppearance.Default,
            onClick: _cache[3] || (_cache[3] = 
					() => {
						$setup.window.location.href = `${$setup.config.authorizerURL.value}/oauth_login/facebook?${$setup.queryParams}`;
					}
				)
          }, {
            default: vue.withCtx(() => [
              vue.createVNode(_component_facebook),
              _hoisted_8
            ]),
            _: 1 /* STABLE */
          }, 8 /* PROPS */, ["appearance"]),
          _hoisted_9
        ], 64 /* STABLE_FRAGMENT */))
      : vue.createCommentVNode("v-if", true),
    ($setup.config.is_linkedin_login_enabled.value)
      ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 4 }, [
          vue.createVNode(_component_styled_button, {
            appearance: $setup.ButtonAppearance.Default,
            onClick: _cache[4] || (_cache[4] = 
					() => {
						$setup.window.location.href = `${$setup.config.authorizerURL.value}/oauth_login/linkedin?${$setup.queryParams}`;
					}
				)
          }, {
            default: vue.withCtx(() => [
              vue.createVNode(_component_linkedin),
              _hoisted_10
            ]),
            _: 1 /* STABLE */
          }, 8 /* PROPS */, ["appearance"]),
          _hoisted_11
        ], 64 /* STABLE_FRAGMENT */))
      : vue.createCommentVNode("v-if", true),
    (
				$setup.hasSocialLogin &&
				($setup.config.is_basic_authentication_enabled.value ||
					$setup.config.is_magic_link_login_enabled.value)
			)
      ? (vue.openBlock(), vue.createBlock(_component_styled_separator, { key: 5 }, {
          default: vue.withCtx(() => [
            _hoisted_12
          ]),
          _: 1 /* STABLE */
        }))
      : vue.createCommentVNode("v-if", true)
  ]))
}

script$2.render = render$2;
script$2.__file = "src/components/AuthorizerSocialLogin.vue";

const getSearchParams = (search = '') => {
	let searchPrams = search;
	if (!searchPrams && hasWindow()) {
		searchPrams = window.location.search;
	}
	const urlSearchParams = new URLSearchParams(`${searchPrams}`);
	const params = Object.fromEntries(urlSearchParams.entries());
	return params;
};

var script$1 = {
	name: 'AuthorizerResetPassword',
	props: ['onReset'],
	components: {
		'styled-wrapper': StyledWrapper,
		'styled-button': StyledButton,
		'styled-form-group': StyledFormGroup,
		'password-strength-indicator': script$d,
		message: script$e,
	},
	setup({ onReset }) {
		const { token, redirect_uri } = getSearchParams();
		const config = { ...vue.toRefs(globalConfig) };
		const { authorizerRef } = { ...vue.toRefs(globalState) };
		const componentState = vue.reactive({
			error: !token ? 'Invalid token' : null,
			loading: false,
			disableContinueButton: false,
		});
		const formData = vue.reactive({
			password: null,
			confirmPassword: null,
		});
		const passwordError = vue.computed(() => {
			if (formData.password === '') {
				return 'Password is required';
			}
			if (
				formData.password &&
				formData.confirmPassword &&
				formData.confirmPassword !== formData.password
			) {
				return `Password and confirm passwords don't match`;
			}
		});
		const confirmPasswordError = vue.computed(() => {
			if (formData.confirmPassword === '') {
				return 'Confirm password is required';
			}
			if (
				formData.password &&
				formData.confirmPassword &&
				formData.confirmPassword !== formData.password
			) {
				return `Password and confirm passwords don't match`;
			}
		});
		const onSubmit = async () => {
			componentState.loading = true;
			try {
				const res = await authorizerRef.value.resetPassword({
					token,
					password: formData.password,
					confirm_password: formData.confirmPassword,
				});
				componentState.loading = false;
				componentState.error = null;
				if (onReset) {
					onReset(res);
				} else {
					window.location.href =
						redirect_uri || config.redirectURL.value || window.location.origin;
				}
			} catch (error) {
				componentState.loading = false;
				componentState.error = error.message;
			}
		};
		const setDisableButton = (value) => {
			componentState.disableContinueButton = value;
		};
		const onErrorClose = () => {
			componentState.error = null;
		};
		return {
			...vue.toRefs(componentState),
			...vue.toRefs(formData),
			config,
			passwordError,
			confirmPasswordError,
			onSubmit,
			MessageType,
			ButtonAppearance,
			setDisableButton,
			onErrorClose,
		};
	},
};

const _hoisted_1 = /*#__PURE__*/vue.createElementVNode("label", {
  class: "form-input-label",
  for: ""
}, [
  /*#__PURE__*/vue.createElementVNode("span", null, "* "),
  /*#__PURE__*/vue.createTextVNode("Password")
], -1 /* HOISTED */);
const _hoisted_2 = {
  key: 0,
  class: "form-input-error"
};
const _hoisted_3 = /*#__PURE__*/vue.createElementVNode("label", {
  class: "form-input-label",
  for: ""
}, [
  /*#__PURE__*/vue.createElementVNode("span", null, "* "),
  /*#__PURE__*/vue.createTextVNode("Confirm Password")
], -1 /* HOISTED */);
const _hoisted_4 = {
  key: 0,
  class: "form-input-error"
};
const _hoisted_5 = /*#__PURE__*/vue.createElementVNode("br", null, null, -1 /* HOISTED */);
const _hoisted_6 = /*#__PURE__*/vue.createTextVNode("Processing ...");
const _hoisted_7 = /*#__PURE__*/vue.createTextVNode("Continue");

function render$1(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_message = vue.resolveComponent("message");
  const _component_styled_form_group = vue.resolveComponent("styled-form-group");
  const _component_password_strength_indicator = vue.resolveComponent("password-strength-indicator");
  const _component_styled_button = vue.resolveComponent("styled-button");
  const _component_styled_wrapper = vue.resolveComponent("styled-wrapper");

  return (vue.openBlock(), vue.createBlock(_component_styled_wrapper, null, {
    default: vue.withCtx(() => [
      (_ctx.error)
        ? (vue.openBlock(), vue.createBlock(_component_message, {
            key: 0,
            type: $setup.MessageType.Error,
            text: _ctx.error,
            onClose: _ctx.onErrorClose
          }, null, 8 /* PROPS */, ["type", "text", "onClose"]))
        : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("form", {
        onSubmit: _cache[2] || (_cache[2] = vue.withModifiers((...args) => ($setup.onSubmit && $setup.onSubmit(...args)), ["prevent"]))
      }, [
        vue.createCommentVNode(" password "),
        vue.createVNode(_component_styled_form_group, { hasError: $setup.passwordError }, {
          default: vue.withCtx(() => [
            _hoisted_1,
            vue.withDirectives(vue.createElementVNode("input", {
              class: "form-input-field",
              placeholder: "********",
              type: "password",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => ((_ctx.password) = $event))
            }, null, 512 /* NEED_PATCH */), [
              [vue.vModelText, _ctx.password]
            ]),
            ($setup.passwordError)
              ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_2, vue.toDisplayString($setup.passwordError), 1 /* TEXT */))
              : vue.createCommentVNode("v-if", true)
          ]),
          _: 1 /* STABLE */
        }, 8 /* PROPS */, ["hasError"]),
        vue.createCommentVNode(" confirm password "),
        vue.createVNode(_component_styled_form_group, { hasError: $setup.confirmPasswordError }, {
          default: vue.withCtx(() => [
            _hoisted_3,
            vue.withDirectives(vue.createElementVNode("input", {
              class: "form-input-field",
              placeholder: "********",
              type: "password",
              "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => ((_ctx.confirmPassword) = $event))
            }, null, 512 /* NEED_PATCH */), [
              [vue.vModelText, _ctx.confirmPassword]
            ]),
            ($setup.confirmPasswordError)
              ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_4, vue.toDisplayString($setup.confirmPasswordError), 1 /* TEXT */))
              : vue.createCommentVNode("v-if", true)
          ]),
          _: 1 /* STABLE */
        }, 8 /* PROPS */, ["hasError"]),
        ($setup.config.is_strong_password_enabled.value)
          ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 0 }, [
              vue.createVNode(_component_password_strength_indicator, {
                value: _ctx.password,
                setDisableButton: $setup.setDisableButton
              }, null, 8 /* PROPS */, ["value", "setDisableButton"]),
              _hoisted_5
            ], 64 /* STABLE_FRAGMENT */))
          : vue.createCommentVNode("v-if", true),
        vue.createVNode(_component_styled_button, {
          appearance: $setup.ButtonAppearance.Primary,
          disabled: 
					$setup.passwordError ||
					$setup.confirmPasswordError ||
					!_ctx.password ||
					!_ctx.confirmPassword ||
					_ctx.loading ||
					_ctx.disableContinueButton
				
        }, {
          default: vue.withCtx(() => [
            (_ctx.loading)
              ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 0 }, [
                  _hoisted_6
                ], 64 /* STABLE_FRAGMENT */))
              : (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 1 }, [
                  _hoisted_7
                ], 64 /* STABLE_FRAGMENT */))
          ]),
          _: 1 /* STABLE */
        }, 8 /* PROPS */, ["appearance", "disabled"])
      ], 32 /* HYDRATE_EVENTS */)
    ]),
    _: 1 /* STABLE */
  }))
}

script$1.render = render$1;
script$1.__file = "src/components/AuthorizerResetPassword.vue";

var script = {
	name: 'AuthorizerRoot',
	components: {
		'styled-wrapper': StyledWrapper,
		'authorizer-social-login': script$2,
		'authorizer-signup': script$c,
		'authorizer-magic-link-login': script$9,
		'authorizer-forgot-password': script$8,
		'authorizer-basic-auth-login': script$a,
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
	AuthorizerProvider: script$h,
	AuthorizerSignup: script$c,
	AuthorizerBasicAuthLogin: script$a,
	AuthorizerMagicLinkLogin: script$9,
	AuthorizerForgotPassword: script$8,
	AuthorizerSocialLogin: script$2,
	AuthorizerResetPassword: script$1,
	AuthorizerVerifyOtp: script$b,
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
