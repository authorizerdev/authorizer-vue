'use strict';

var vue = require('vue');
var authorizerJs = require('@authorizerdev/authorizer-js');

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
	is_twitter_login_enabled: false,
});

var script$q = {
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
		config.is_twitter_login_enabled.value =
			props?.config?.is_twitter_login_enabled || false;
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

script$q.__file = "src/components/AuthorizerProvider.vue";

var script$p = {
	name: 'StyledWrapper',
};

const _hoisted_1$k = { class: "styled-wrapper" };

function render$p(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", _hoisted_1$k, [
    vue.renderSlot(_ctx.$slots, "default")
  ]))
}

script$p.render = render$p;
script$p.__scopeId = "data-v-f5751c1a";
script$p.__file = "src/styledComponents/StyledWrapper.vue";

var script$o = {
	name: 'StyledButton',
	props: ['style', 'type', 'appearance', 'disabled'],
	setup(props) {
		return {
			...props,
			style: {
				width: '100%',
				'background-color': props.disabled
					? 'var(--authorizer-primary-disabled-color)'
					: props.appearance === ButtonAppearance.Primary
					? 'var(--authorizer-primary-color)'
					: 'var(--authorizer-white-color)',
				color:
					props.appearance === ButtonAppearance.Default
						? 'var(--authorizer-text-color)'
						: 'var(--authorizer-white-color)',
				border: props.appearance === ButtonAppearance.Primary ? '0px' : '1px',
			},
		};
	},
};

const _hoisted_1$j = ["type", "disabled"];

function render$o(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("button", {
    class: "styled-button",
    style: vue.normalizeStyle($setup.style),
    type: $props.type,
    disabled: $props.disabled
  }, [
    vue.renderSlot(_ctx.$slots, "default")
  ], 12 /* STYLE, PROPS */, _hoisted_1$j))
}

script$o.render = render$o;
script$o.__scopeId = "data-v-ed3ce8fc";
script$o.__file = "src/styledComponents/StyledButton.vue";

var script$n = {
	name: 'StyledLink',
	props: ['marginBottom'],
	setup(props) {
		return {
			...props,
			style: {
				'margin-bottom': props.marginBottom || '0px',
			},
		};
	},
};

function render$n(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("span", {
    class: "styled-link",
    style: vue.normalizeStyle($setup.style)
  }, [
    vue.renderSlot(_ctx.$slots, "default")
  ], 4 /* STYLE */))
}

script$n.render = render$n;
script$n.__scopeId = "data-v-4b70836c";
script$n.__file = "src/styledComponents/StyledLink.vue";

var script$m = {
	name: 'StyledSeparator',
};

const _hoisted_1$i = { class: "styled-separator" };

function render$m(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", _hoisted_1$i, [
    vue.renderSlot(_ctx.$slots, "default")
  ]))
}

script$m.render = render$m;
script$m.__scopeId = "data-v-13c93576";
script$m.__file = "src/styledComponents/StyledSeparator.vue";

var script$l = {
	name: 'StyledFooter',
};

const _hoisted_1$h = { class: "styled-footer" };

function render$l(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", _hoisted_1$h, [
    vue.renderSlot(_ctx.$slots, "default")
  ]))
}

script$l.render = render$l;
script$l.__scopeId = "data-v-6ea2852a";
script$l.__file = "src/styledComponents/StyledFooter.vue";

var script$k = {
	name: 'StyledMessageWrapper',
	props: ['type'],
	setup(props) {
		return {
			...props,
			style: {
				'background-color':
					props.type === MessageType.Error
						? 'var(--authorizer-danger-color)'
						: 'var(--authorizer-success-color)',
			},
		};
	},
};

function render$k(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", {
    class: "styled-message-wrapper",
    style: vue.normalizeStyle($setup.style)
  }, [
    vue.renderSlot(_ctx.$slots, "default")
  ], 4 /* STYLE */))
}

script$k.render = render$k;
script$k.__scopeId = "data-v-136945dc";
script$k.__file = "src/styledComponents/StyledMessageWrapper.vue";

var script$j = {
	name: 'StyledFlex',
	props: ['flexDirection', 'alignItems', 'justifyContent', 'wrap', 'width'],
	setup(props) {
		return {
			...props,
			style: {
				display: 'flex',
				'flex-direction': props.flexDirection || 'row',
				'align-items': props.alignItems || 'center',
				'justify-content': props.justifyContent || 'center',
				'flex-wrap': props.wrap || 'wrap',
				width: props.width || '100%',
			},
		};
	},
};

function render$j(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", {
    style: vue.normalizeStyle($setup.style)
  }, [
    vue.renderSlot(_ctx.$slots, "default")
  ], 4 /* STYLE */))
}

script$j.render = render$j;
script$j.__file = "src/styledComponents/StyledFlex.vue";

var script$i = {
	name: 'StyledPasswordStrength',
	props: ['strength'],
	setup(props) {
		const strength = props.strength || 'default';
		return {
			...props,
			style: {
				opacity: passwordStrengthIndicatorOpacity[strength],
			},
		};
	},
};

function render$i(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", {
    class: "styled-password-strength",
    style: vue.normalizeStyle($setup.style)
  }, [
    vue.renderSlot(_ctx.$slots, "default")
  ], 4 /* STYLE */))
}

script$i.render = render$i;
script$i.__scopeId = "data-v-b732e568";
script$i.__file = "src/styledComponents/StyledPasswordStrength.vue";

var script$h = {
	name: 'StyledPasswordStrengthWrapper',
};

const _hoisted_1$g = { class: "styled-password-strength-wrapper" };

function render$h(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", _hoisted_1$g, [
    vue.renderSlot(_ctx.$slots, "default")
  ]))
}

script$h.render = render$h;
script$h.__scopeId = "data-v-59a9d057";
script$h.__file = "src/styledComponents/StyledPasswordStrengthWrapper.vue";

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

const hasSpecialChar = (char) => {
	const re = /[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/;
	return re.test(char);
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
		} else if (hasSpecialChar(char) && !res.hasSpecialChar) {
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
	name: 'Close',
};

const _hoisted_1$f = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 1000 1000",
  width: "10px",
  height: "10px"
};
const _hoisted_2$e = /*#__PURE__*/vue.createElementVNode("g", null, [
  /*#__PURE__*/vue.createElementVNode("path", {
    fill: "#ffffff",
    d: "M617.2,495.8l349.1,350.9c31.7,31.8,31.7,83.5,0,115.3c-31.7,31.9-83.1,31.9-114.8,0L502.4,611.2L149.8,965.6c-32,32.2-83.8,32.2-115.8,0c-32-32.1-32-84.3,0-116.4l352.6-354.5L48.2,154.6c-31.7-31.9-31.7-83.5,0-115.4c31.7-31.9,83.1-31.9,114.7,0l338.4,340.2l343.3-345c32-32.1,83.8-32.1,115.8,0c32,32.2,32,84.3,0,116.4L617.2,495.8z"
  })
], -1 /* HOISTED */);
const _hoisted_3$d = [
  _hoisted_2$e
];

function render$g(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("svg", _hoisted_1$f, _hoisted_3$d))
}

script$g.render = render$g;
script$g.__file = "src/icons/Close.vue";

var script$f = {
	name: 'Message',
	props: ['type', 'text', 'onClose'],
	components: {
		'styled-message-wrapper': script$k,
		'styled-flex': script$j,
		close: script$g,
	},
	setup({ type, text, onClose }) {
		return {
			type,
			text: capitalizeFirstLetter(text),
			onClose,
		};
	},
};

const _hoisted_1$e = { style: { flex: 1 } };

function render$f(_ctx, _cache, $props, $setup, $data, $options) {
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
          vue.createElementVNode("div", _hoisted_1$e, vue.toDisplayString($setup.text), 1 /* TEXT */),
          ($setup.onClose)
            ? (vue.openBlock(), vue.createElementBlock("span", {
                key: 0,
                style: { cursor: 'pointer' },
                onClick: _cache[0] || (_cache[0] = (...args) => ($setup.onClose && $setup.onClose(...args)))
              }, [
                vue.createVNode(_component_close)
              ]))
            : vue.createCommentVNode("v-if", true)
        ]),
        _: 1 /* STABLE */
      })
    ]),
    _: 1 /* STABLE */
  }, 8 /* PROPS */, ["type"]))
}

script$f.render = render$f;
script$f.__file = "src/components/Message.vue";

var script$e = {
	name: 'PasswordStrengthIndicator',
	props: ['value', 'setDisableButton'],
	components: {
		'styled-password-strength-wrapper': script$h,
		'styled-password-strength': script$i,
		'styled-flex': script$j,
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
		const eventHandler = (e) => {
			e.preventDefault();
		};
		vue.watch(
			() => props.value,
			(newValue) => {
				const validationData = validatePassword(newValue);
				Object.assign(componentState, validationData);
				if (!validationData.isValid) {
					setDisableButton(true);
				} else {
					setDisableButton(false);
				}
			}
		);
		return {
			...vue.toRefs(componentState),
			eventHandler,
		};
	},
};

const _withScopeId$6 = n => (vue.pushScopeId("data-v-a739a81a"),n=n(),vue.popScopeId(),n);
const _hoisted_1$d = /*#__PURE__*/ _withScopeId$6(() => /*#__PURE__*/vue.createElementVNode("p", null, [
  /*#__PURE__*/vue.createElementVNode("b", null, "Criteria for a strong password:")
], -1 /* HOISTED */));
const _hoisted_2$d = ["checked"];
const _hoisted_3$c = /*#__PURE__*/ _withScopeId$6(() => /*#__PURE__*/vue.createElementVNode("div", { class: "styled-check-box-label" }, "At least 6 characters", -1 /* HOISTED */));
const _hoisted_4$7 = ["checked"];
const _hoisted_5$7 = /*#__PURE__*/ _withScopeId$6(() => /*#__PURE__*/vue.createElementVNode("div", { class: "styled-check-box-label" }, "At least 1 lowercase letter", -1 /* HOISTED */));
const _hoisted_6$7 = ["checked"];
const _hoisted_7$6 = /*#__PURE__*/ _withScopeId$6(() => /*#__PURE__*/vue.createElementVNode("div", { class: "styled-check-box-label" }, "At least 1 uppercase letter", -1 /* HOISTED */));
const _hoisted_8$6 = ["checked"];
const _hoisted_9$6 = /*#__PURE__*/ _withScopeId$6(() => /*#__PURE__*/vue.createElementVNode("div", { class: "styled-check-box-label" }, "At least 1 numeric character", -1 /* HOISTED */));
const _hoisted_10$5 = ["checked"];
const _hoisted_11$4 = /*#__PURE__*/ _withScopeId$6(() => /*#__PURE__*/vue.createElementVNode("div", { class: "styled-check-box-label" }, "At least 1 special character", -1 /* HOISTED */));
const _hoisted_12$4 = ["checked"];
const _hoisted_13$4 = /*#__PURE__*/ _withScopeId$6(() => /*#__PURE__*/vue.createElementVNode("div", { class: "styled-check-box-label" }, "Maximum 36 characters", -1 /* HOISTED */));

function render$e(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_styled_password_strength = vue.resolveComponent("styled-password-strength");
  const _component_styled_flex = vue.resolveComponent("styled-flex");
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
        _hoisted_1$d,
        vue.createVNode(_component_styled_flex, { flexDirection: "column" }, {
          default: vue.withCtx(() => [
            vue.createVNode(_component_styled_flex, {
              justifyContent: "flex-start",
              alignItems: "center"
            }, {
              default: vue.withCtx(() => [
                vue.createElementVNode("input", {
                  readOnly: "",
                  onClick: _cache[0] || (_cache[0] = (...args) => ($setup.eventHandler && $setup.eventHandler(...args))),
                  onKeydown: _cache[1] || (_cache[1] = (...args) => ($setup.eventHandler && $setup.eventHandler(...args))),
                  type: "checkbox",
                  checked: _ctx.hasSixChar
                }, null, 40 /* PROPS, HYDRATE_EVENTS */, _hoisted_2$d),
                _hoisted_3$c
              ]),
              _: 1 /* STABLE */
            }),
            vue.createVNode(_component_styled_flex, {
              justifyContent: "flex-start",
              alignItems: "center"
            }, {
              default: vue.withCtx(() => [
                vue.createElementVNode("input", {
                  readOnly: "",
                  onClick: _cache[2] || (_cache[2] = (...args) => ($setup.eventHandler && $setup.eventHandler(...args))),
                  onKeydown: _cache[3] || (_cache[3] = (...args) => ($setup.eventHandler && $setup.eventHandler(...args))),
                  type: "checkbox",
                  checked: _ctx.hasLowerCase
                }, null, 40 /* PROPS, HYDRATE_EVENTS */, _hoisted_4$7),
                _hoisted_5$7
              ]),
              _: 1 /* STABLE */
            }),
            vue.createVNode(_component_styled_flex, {
              justifyContent: "flex-start",
              alignItems: "center"
            }, {
              default: vue.withCtx(() => [
                vue.createElementVNode("input", {
                  readOnly: "",
                  onClick: _cache[4] || (_cache[4] = (...args) => ($setup.eventHandler && $setup.eventHandler(...args))),
                  onKeydown: _cache[5] || (_cache[5] = (...args) => ($setup.eventHandler && $setup.eventHandler(...args))),
                  type: "checkbox",
                  checked: _ctx.hasUpperCase
                }, null, 40 /* PROPS, HYDRATE_EVENTS */, _hoisted_6$7),
                _hoisted_7$6
              ]),
              _: 1 /* STABLE */
            }),
            vue.createVNode(_component_styled_flex, {
              justifyContent: "flex-start",
              alignItems: "center"
            }, {
              default: vue.withCtx(() => [
                vue.createElementVNode("input", {
                  readOnly: "",
                  onClick: _cache[6] || (_cache[6] = (...args) => ($setup.eventHandler && $setup.eventHandler(...args))),
                  onKeydown: _cache[7] || (_cache[7] = (...args) => ($setup.eventHandler && $setup.eventHandler(...args))),
                  type: "checkbox",
                  checked: _ctx.hasNumericChar
                }, null, 40 /* PROPS, HYDRATE_EVENTS */, _hoisted_8$6),
                _hoisted_9$6
              ]),
              _: 1 /* STABLE */
            }),
            vue.createVNode(_component_styled_flex, {
              justifyContent: "flex-start",
              alignItems: "center"
            }, {
              default: vue.withCtx(() => [
                vue.createElementVNode("input", {
                  readOnly: "",
                  onClick: _cache[8] || (_cache[8] = (...args) => ($setup.eventHandler && $setup.eventHandler(...args))),
                  onKeydown: _cache[9] || (_cache[9] = (...args) => ($setup.eventHandler && $setup.eventHandler(...args))),
                  type: "checkbox",
                  checked: _ctx.hasSpecialChar
                }, null, 40 /* PROPS, HYDRATE_EVENTS */, _hoisted_10$5),
                _hoisted_11$4
              ]),
              _: 1 /* STABLE */
            }),
            vue.createVNode(_component_styled_flex, {
              justifyContent: "flex-start",
              alignItems: "center"
            }, {
              default: vue.withCtx(() => [
                vue.createElementVNode("input", {
                  readOnly: "",
                  onClick: _cache[10] || (_cache[10] = (...args) => ($setup.eventHandler && $setup.eventHandler(...args))),
                  onKeydown: _cache[11] || (_cache[11] = (...args) => ($setup.eventHandler && $setup.eventHandler(...args))),
                  type: "checkbox",
                  checked: _ctx.maxThirtySixChar
                }, null, 40 /* PROPS, HYDRATE_EVENTS */, _hoisted_12$4),
                _hoisted_13$4
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

script$e.render = render$e;
script$e.__scopeId = "data-v-a739a81a";
script$e.__file = "src/components/PasswordStrengthIndicator.vue";

var script$d = {
	name: 'AuthorizerSignup',
	props: ['setView', 'onSignup', 'urlProps'],
	components: {
		'password-strength-indicator': script$e,
		'styled-button': script$o,
		'styled-footer': script$l,
		'styled-link': script$n,
		message: script$f,
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

const _withScopeId$5 = n => (vue.pushScopeId("data-v-4caebfd1"),n=n(),vue.popScopeId(),n);
const _hoisted_1$c = ["hasError"];
const _hoisted_2$c = /*#__PURE__*/ _withScopeId$5(() => /*#__PURE__*/vue.createElementVNode("label", {
  class: "form-input-label",
  for: ""
}, [
  /*#__PURE__*/vue.createElementVNode("span", null, "* "),
  /*#__PURE__*/vue.createTextVNode("Email")
], -1 /* HOISTED */));
const _hoisted_3$b = {
  key: 0,
  class: "form-input-error"
};
const _hoisted_4$6 = ["hasError"];
const _hoisted_5$6 = /*#__PURE__*/ _withScopeId$5(() => /*#__PURE__*/vue.createElementVNode("label", {
  class: "form-input-label",
  for: ""
}, [
  /*#__PURE__*/vue.createElementVNode("span", null, "* "),
  /*#__PURE__*/vue.createTextVNode("Password")
], -1 /* HOISTED */));
const _hoisted_6$6 = {
  key: 0,
  class: "form-input-error"
};
const _hoisted_7$5 = ["hasError"];
const _hoisted_8$5 = /*#__PURE__*/ _withScopeId$5(() => /*#__PURE__*/vue.createElementVNode("label", {
  class: "form-input-label",
  for: ""
}, [
  /*#__PURE__*/vue.createElementVNode("span", null, "* "),
  /*#__PURE__*/vue.createTextVNode("Confirm Password")
], -1 /* HOISTED */));
const _hoisted_9$5 = {
  key: 0,
  class: "form-input-error"
};
const _hoisted_10$4 = /*#__PURE__*/ _withScopeId$5(() => /*#__PURE__*/vue.createElementVNode("br", null, null, -1 /* HOISTED */));
const _hoisted_11$3 = /*#__PURE__*/vue.createTextVNode("Processing ...");
const _hoisted_12$3 = /*#__PURE__*/vue.createTextVNode("Sign Up");
const _hoisted_13$3 = /*#__PURE__*/vue.createTextVNode(" Already have an account? ");
const _hoisted_14$2 = /*#__PURE__*/vue.createTextVNode("Log In");

function render$d(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_message = vue.resolveComponent("message");
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
          vue.createElementVNode("div", {
            class: "styled-form-group",
            hasError: $setup.emailError
          }, [
            _hoisted_2$c,
            vue.withDirectives(vue.createElementVNode("input", {
              class: vue.normalizeClass(`form-input-field ${
						$setup.emailError ? 'input-error-content' : null
					}`),
              placeholder: "eg. foo@bar.com",
              type: "email",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => ((_ctx.email) = $event))
            }, null, 2 /* CLASS */), [
              [vue.vModelText, _ctx.email]
            ]),
            ($setup.emailError)
              ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_3$b, vue.toDisplayString($setup.emailError), 1 /* TEXT */))
              : vue.createCommentVNode("v-if", true)
          ], 8 /* PROPS */, _hoisted_1$c),
          vue.createCommentVNode(" password "),
          vue.createElementVNode("div", {
            class: "styled-form-group",
            hasError: $setup.passwordError
          }, [
            _hoisted_5$6,
            vue.withDirectives(vue.createElementVNode("input", {
              class: vue.normalizeClass(`form-input-field ${
						$setup.passwordError ? 'input-error-content' : null
					}`),
              placeholder: "********",
              type: "password",
              "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => ((_ctx.password) = $event))
            }, null, 2 /* CLASS */), [
              [vue.vModelText, _ctx.password]
            ]),
            ($setup.passwordError)
              ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_6$6, vue.toDisplayString($setup.passwordError), 1 /* TEXT */))
              : vue.createCommentVNode("v-if", true)
          ], 8 /* PROPS */, _hoisted_4$6),
          vue.createCommentVNode(" confirm password "),
          vue.createElementVNode("div", {
            class: "styled-form-group",
            hasError: $setup.confirmPasswordError
          }, [
            _hoisted_8$5,
            vue.withDirectives(vue.createElementVNode("input", {
              class: vue.normalizeClass(`form-input-field ${
						$setup.confirmPasswordError ? 'input-error-content' : null
					}`),
              placeholder: "********",
              type: "password",
              "onUpdate:modelValue": _cache[2] || (_cache[2] = $event => ((_ctx.confirmPassword) = $event))
            }, null, 2 /* CLASS */), [
              [vue.vModelText, _ctx.confirmPassword]
            ]),
            ($setup.confirmPasswordError)
              ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_9$5, vue.toDisplayString($setup.confirmPasswordError), 1 /* TEXT */))
              : vue.createCommentVNode("v-if", true)
          ], 8 /* PROPS */, _hoisted_7$5),
          ($setup.config.is_strong_password_enabled.value)
            ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 0 }, [
                vue.createVNode(_component_password_strength_indicator, {
                  value: _ctx.password,
                  setDisableButton: $setup.setDisableButton
                }, null, 8 /* PROPS */, ["value", "setDisableButton"]),
                _hoisted_10$4
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
                    _hoisted_11$3
                  ], 64 /* STABLE_FRAGMENT */))
                : (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 1 }, [
                    _hoisted_12$3
                  ], 64 /* STABLE_FRAGMENT */))
            ]),
            _: 1 /* STABLE */
          }, 8 /* PROPS */, ["appearance", "disabled"])
        ], 32 /* HYDRATE_EVENTS */),
        ($setup.setView)
          ? (vue.openBlock(), vue.createBlock(_component_styled_footer, { key: 1 }, {
              default: vue.withCtx(() => [
                vue.createElementVNode("div", null, [
                  _hoisted_13$3,
                  vue.createVNode(_component_styled_link, {
                    onClick: _cache[4] || (_cache[4] = () => $setup.setView($setup.Views.Login))
                  }, {
                    default: vue.withCtx(() => [
                      _hoisted_14$2
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

script$d.render = render$d;
script$d.__scopeId = "data-v-4caebfd1";
script$d.__file = "src/components/AuthorizerSignup.vue";

var script$c = {
	name: 'AuthorizerVerifyOtp',
	props: ['setView', 'onLogin', 'email'],
	components: {
		'styled-button': script$o,
		'styled-footer': script$l,
		'styled-link': script$n,
		message: script$f,
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

const _withScopeId$4 = n => (vue.pushScopeId("data-v-948d9c6e"),n=n(),vue.popScopeId(),n);
const _hoisted_1$b = /*#__PURE__*/ _withScopeId$4(() => /*#__PURE__*/vue.createElementVNode("p", { style: { textAlign: 'center', margin: '10px 0px' } }, " Please enter the OTP you received on your email address. ", -1 /* HOISTED */));
const _hoisted_2$b = /*#__PURE__*/ _withScopeId$4(() => /*#__PURE__*/vue.createElementVNode("br", null, null, -1 /* HOISTED */));
const _hoisted_3$a = ["hasError"];
const _hoisted_4$5 = /*#__PURE__*/ _withScopeId$4(() => /*#__PURE__*/vue.createElementVNode("label", {
  class: "form-input-label",
  for: ""
}, [
  /*#__PURE__*/vue.createElementVNode("span", null, "* "),
  /*#__PURE__*/vue.createTextVNode("OTP (One Time Password)")
], -1 /* HOISTED */));
const _hoisted_5$5 = {
  key: 0,
  class: "form-input-error"
};
const _hoisted_6$5 = /*#__PURE__*/ _withScopeId$4(() => /*#__PURE__*/vue.createElementVNode("br", null, null, -1 /* HOISTED */));
const _hoisted_7$4 = /*#__PURE__*/vue.createTextVNode("Processing ...");
const _hoisted_8$4 = /*#__PURE__*/vue.createTextVNode("Submit");
const _hoisted_9$4 = {
  key: 0,
  style: { marginBottom: '10px' }
};
const _hoisted_10$3 = /*#__PURE__*/vue.createTextVNode(" Resend OTP ");
const _hoisted_11$2 = { key: 2 };
const _hoisted_12$2 = /*#__PURE__*/vue.createTextVNode(" Don't have an account? ");
const _hoisted_13$2 = /*#__PURE__*/vue.createTextVNode("Sign Up");

function render$c(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_message = vue.resolveComponent("message");
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
    _hoisted_1$b,
    _hoisted_2$b,
    vue.createElementVNode("form", {
      onSubmit: _cache[1] || (_cache[1] = vue.withModifiers((...args) => ($setup.onSubmit && $setup.onSubmit(...args)), ["prevent"]))
    }, [
      vue.createCommentVNode(" OTP "),
      vue.createElementVNode("div", {
        class: "styled-form-group",
        hasError: $setup.otpError
      }, [
        _hoisted_4$5,
        vue.withDirectives(vue.createElementVNode("input", {
          class: vue.normalizeClass(`form-input-field ${$setup.otpError ? 'input-error-content' : null}`),
          placeholder: "eg. AB123C",
          type: "password",
          "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => ((_ctx.otp) = $event))
        }, null, 2 /* CLASS */), [
          [vue.vModelText, _ctx.otp]
        ]),
        ($setup.otpError)
          ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_5$5, vue.toDisplayString($setup.otpError), 1 /* TEXT */))
          : vue.createCommentVNode("v-if", true)
      ], 8 /* PROPS */, _hoisted_3$a),
      _hoisted_6$5,
      vue.createVNode(_component_styled_button, {
        appearance: $setup.ButtonAppearance.Primary,
        disabled: $setup.otpError || !_ctx.otp
      }, {
        default: vue.withCtx(() => [
          (_ctx.loading)
            ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 0 }, [
                _hoisted_7$4
              ], 64 /* STABLE_FRAGMENT */))
            : (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 1 }, [
                _hoisted_8$4
              ], 64 /* STABLE_FRAGMENT */))
        ]),
        _: 1 /* STABLE */
      }, 8 /* PROPS */, ["appearance", "disabled"])
    ], 32 /* HYDRATE_EVENTS */),
    ($setup.setView)
      ? (vue.openBlock(), vue.createBlock(_component_styled_footer, { key: 2 }, {
          default: vue.withCtx(() => [
            (_ctx.sendingOtp)
              ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_9$4, "Sending ..."))
              : (vue.openBlock(), vue.createBlock(_component_styled_link, {
                  key: 1,
                  onClick: $setup.resendOtp,
                  style: { marginBottom: '10px' }
                }, {
                  default: vue.withCtx(() => [
                    _hoisted_10$3
                  ]),
                  _: 1 /* STABLE */
                }, 8 /* PROPS */, ["onClick"])),
            ($setup.config.is_sign_up_enabled.value)
              ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_11$2, [
                  _hoisted_12$2,
                  vue.createVNode(_component_styled_link, {
                    onClick: _cache[2] || (_cache[2] = () => $setup.setView($setup.Views.Signup))
                  }, {
                    default: vue.withCtx(() => [
                      _hoisted_13$2
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

script$c.render = render$c;
script$c.__scopeId = "data-v-948d9c6e";
script$c.__file = "src/components/AuthorizerVerifyOtp.vue";

var script$b = {
	name: 'AuthorizerBasicAuthLogin',
	props: ['setView', 'onLogin', 'urlProps'],
	components: {
		'styled-button': script$o,
		'styled-footer': script$l,
		'styled-link': script$n,
		'authorizer-verify-otp': script$c,
		message: script$f,
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

const _withScopeId$3 = n => (vue.pushScopeId("data-v-e2239b68"),n=n(),vue.popScopeId(),n);
const _hoisted_1$a = { key: 1 };
const _hoisted_2$a = { class: "styled-form-group" };
const _hoisted_3$9 = /*#__PURE__*/ _withScopeId$3(() => /*#__PURE__*/vue.createElementVNode("label", {
  class: "form-input-label",
  for: ""
}, [
  /*#__PURE__*/vue.createElementVNode("span", null, "* "),
  /*#__PURE__*/vue.createTextVNode("Email")
], -1 /* HOISTED */));
const _hoisted_4$4 = {
  key: 0,
  class: "form-input-error"
};
const _hoisted_5$4 = { class: "styled-form-group" };
const _hoisted_6$4 = /*#__PURE__*/ _withScopeId$3(() => /*#__PURE__*/vue.createElementVNode("label", {
  class: "form-input-label",
  for: ""
}, [
  /*#__PURE__*/vue.createElementVNode("span", null, "* "),
  /*#__PURE__*/vue.createTextVNode("Password")
], -1 /* HOISTED */));
const _hoisted_7$3 = {
  key: 0,
  class: "form-input-error"
};
const _hoisted_8$3 = /*#__PURE__*/ _withScopeId$3(() => /*#__PURE__*/vue.createElementVNode("br", null, null, -1 /* HOISTED */));
const _hoisted_9$3 = /*#__PURE__*/vue.createTextVNode("Processing ...");
const _hoisted_10$2 = /*#__PURE__*/vue.createTextVNode("Log In");
const _hoisted_11$1 = /*#__PURE__*/vue.createTextVNode(" Forgot Password? ");
const _hoisted_12$1 = { key: 0 };
const _hoisted_13$1 = /*#__PURE__*/vue.createTextVNode(" Don't have an account? ");
const _hoisted_14$1 = /*#__PURE__*/vue.createTextVNode("Sign Up");

function render$b(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_authorizer_verify_otp = vue.resolveComponent("authorizer-verify-otp");
  const _component_message = vue.resolveComponent("message");
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
    : (vue.openBlock(), vue.createElementBlock("div", _hoisted_1$a, [
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
          vue.createElementVNode("div", _hoisted_2$a, [
            _hoisted_3$9,
            vue.withDirectives(vue.createElementVNode("input", {
              class: vue.normalizeClass(`form-input-field ${
							$setup.emailError ? 'input-error-content' : null
						}`),
              placeholder: "eg. foo@bar.com",
              type: "email",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => ((_ctx.email) = $event))
            }, null, 2 /* CLASS */), [
              [vue.vModelText, _ctx.email]
            ]),
            ($setup.emailError)
              ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_4$4, vue.toDisplayString($setup.emailError), 1 /* TEXT */))
              : vue.createCommentVNode("v-if", true)
          ]),
          vue.createCommentVNode(" password "),
          vue.createElementVNode("div", _hoisted_5$4, [
            _hoisted_6$4,
            vue.withDirectives(vue.createElementVNode("input", {
              class: vue.normalizeClass(`form-input-field ${
							$setup.passwordError ? 'input-error-content' : null
						}`),
              placeholder: "********",
              type: "password",
              "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => ((_ctx.password) = $event))
            }, null, 2 /* CLASS */), [
              [vue.vModelText, _ctx.password]
            ]),
            ($setup.passwordError)
              ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_7$3, vue.toDisplayString($setup.passwordError), 1 /* TEXT */))
              : vue.createCommentVNode("v-if", true)
          ]),
          _hoisted_8$3,
          vue.createVNode(_component_styled_button, {
            appearance: $setup.ButtonAppearance.Primary,
            disabled: $setup.emailError || $setup.passwordError || !_ctx.email || !_ctx.password
          }, {
            default: vue.withCtx(() => [
              (_ctx.loading)
                ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 0 }, [
                    _hoisted_9$3
                  ], 64 /* STABLE_FRAGMENT */))
                : (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 1 }, [
                    _hoisted_10$2
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
                    _hoisted_11$1
                  ]),
                  _: 1 /* STABLE */
                }),
                ($setup.config.is_sign_up_enabled.value)
                  ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_12$1, [
                      _hoisted_13$1,
                      vue.createVNode(_component_styled_link, {
                        onClick: _cache[4] || (_cache[4] = () => $setup.setView($setup.Views.Signup))
                      }, {
                        default: vue.withCtx(() => [
                          _hoisted_14$1
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

script$b.render = render$b;
script$b.__scopeId = "data-v-e2239b68";
script$b.__file = "src/components/AuthorizerBasicAuthLogin.vue";

var script$a = {
	name: 'AuthorizerMagicLinkLogin',
	props: ['onMagicLinkLogin', 'urlProps'],
	components: {
		'styled-button': script$o,
		message: script$f,
	},
	setup({ onMagicLinkLogin, urlProps }) {
		const { authorizerRef } = { ...vue.toRefs(globalState) };
		const componentState = vue.reactive({
			error: null,
			successMessage: null,
			loading: false,
		});
		const formData = vue.reactive({
			email: null,
		});
		const emailError = vue.computed(() => {
			if (formData.email === '') {
				return 'Email is required';
			}
			if (formData.email && !isValidEmail(formData.email)) {
				return 'Please enter valid email';
			}
		});
		const onErrorClose = () => {
			componentState.error = null;
		};
		const onSubmit = async () => {
			try {
				componentState.loading = true;
				const res = await authorizerRef.value.magicLinkLogin({
					email: formData.email,
					state: urlProps.state || '',
					redirect_uri: urlProps.redirect_uri || '',
				});
				componentState.loading = false;
				if (res) {
					componentState.error = null;
					componentState.successMessage = res.message || ``;
					if (onMagicLinkLogin) {
						onMagicLinkLogin(res);
					}
				}
				if (urlProps.redirect_uri) {
					setTimeout(() => {
						window.location.replace(urlProps.redirect_uri);
					}, 3000);
				}
			} catch (error) {
				componentState.loading = false;
				componentState.error = error.message;
			}
		};
		return {
			...vue.toRefs(componentState),
			...vue.toRefs(formData),
			emailError,
			MessageType,
			ButtonAppearance,
			onErrorClose,
			onSubmit,
		};
	},
};

const _withScopeId$2 = n => (vue.pushScopeId("data-v-9daba5ca"),n=n(),vue.popScopeId(),n);
const _hoisted_1$9 = { class: "styled-form-group" };
const _hoisted_2$9 = /*#__PURE__*/ _withScopeId$2(() => /*#__PURE__*/vue.createElementVNode("label", {
  class: "form-input-label",
  for: ""
}, [
  /*#__PURE__*/vue.createElementVNode("span", null, "* "),
  /*#__PURE__*/vue.createTextVNode("Email")
], -1 /* HOISTED */));
const _hoisted_3$8 = {
  key: 0,
  class: "form-input-error"
};
const _hoisted_4$3 = /*#__PURE__*/ _withScopeId$2(() => /*#__PURE__*/vue.createElementVNode("br", null, null, -1 /* HOISTED */));
const _hoisted_5$3 = /*#__PURE__*/vue.createTextVNode("Processing ...");
const _hoisted_6$3 = /*#__PURE__*/vue.createTextVNode("Send Email");

function render$a(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_message = vue.resolveComponent("message");
  const _component_styled_button = vue.resolveComponent("styled-button");

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
          onSubmit: _cache[1] || (_cache[1] = vue.withModifiers((...args) => ($setup.onSubmit && $setup.onSubmit(...args)), ["prevent"]))
        }, [
          vue.createCommentVNode(" Email "),
          vue.createElementVNode("div", _hoisted_1$9, [
            _hoisted_2$9,
            vue.withDirectives(vue.createElementVNode("input", {
              class: vue.normalizeClass(`form-input-field ${
						$setup.emailError ? 'input-error-content' : null
					}`),
              placeholder: "eg. foo@bar.com",
              type: "email",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => ((_ctx.email) = $event))
            }, null, 2 /* CLASS */), [
              [vue.vModelText, _ctx.email]
            ]),
            ($setup.emailError)
              ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_3$8, vue.toDisplayString($setup.emailError), 1 /* TEXT */))
              : vue.createCommentVNode("v-if", true)
          ]),
          _hoisted_4$3,
          vue.createVNode(_component_styled_button, {
            appearance: $setup.ButtonAppearance.Primary,
            disabled: !_ctx.email || $setup.emailError || _ctx.loading
          }, {
            default: vue.withCtx(() => [
              (_ctx.loading)
                ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 0 }, [
                    _hoisted_5$3
                  ], 64 /* STABLE_FRAGMENT */))
                : (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 1 }, [
                    _hoisted_6$3
                  ], 64 /* STABLE_FRAGMENT */))
            ]),
            _: 1 /* STABLE */
          }, 8 /* PROPS */, ["appearance", "disabled"])
        ], 32 /* HYDRATE_EVENTS */)
      ], 64 /* STABLE_FRAGMENT */))
}

script$a.render = render$a;
script$a.__scopeId = "data-v-9daba5ca";
script$a.__file = "src/components/AuthorizerMagicLinkLogin.vue";

var script$9 = {
	name: 'AuthorizerForgotPassword',
	props: ['setView', 'onForgotPassword', 'urlProps'],
	components: {
		'styled-button': script$o,
		'styled-footer': script$l,
		'styled-link': script$n,
		message: script$f,
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

const _withScopeId$1 = n => (vue.pushScopeId("data-v-70af7997"),n=n(),vue.popScopeId(),n);
const _hoisted_1$8 = /*#__PURE__*/ _withScopeId$1(() => /*#__PURE__*/vue.createElementVNode("p", { style: { textAlign: 'center', margin: '10px 0px' } }, [
  /*#__PURE__*/vue.createTextVNode(" Please enter your email address. "),
  /*#__PURE__*/vue.createElementVNode("br"),
  /*#__PURE__*/vue.createTextVNode(" We will send you an email to reset your password. ")
], -1 /* HOISTED */));
const _hoisted_2$8 = /*#__PURE__*/ _withScopeId$1(() => /*#__PURE__*/vue.createElementVNode("br", null, null, -1 /* HOISTED */));
const _hoisted_3$7 = { class: "styled-form-group" };
const _hoisted_4$2 = /*#__PURE__*/ _withScopeId$1(() => /*#__PURE__*/vue.createElementVNode("label", {
  class: "form-input-label",
  for: ""
}, [
  /*#__PURE__*/vue.createElementVNode("span", null, "* "),
  /*#__PURE__*/vue.createTextVNode("Email")
], -1 /* HOISTED */));
const _hoisted_5$2 = {
  key: 0,
  class: "form-input-error"
};
const _hoisted_6$2 = /*#__PURE__*/ _withScopeId$1(() => /*#__PURE__*/vue.createElementVNode("br", null, null, -1 /* HOISTED */));
const _hoisted_7$2 = /*#__PURE__*/vue.createTextVNode("Processing ...");
const _hoisted_8$2 = /*#__PURE__*/vue.createTextVNode("Send Email");
const _hoisted_9$2 = /*#__PURE__*/vue.createTextVNode(" Remember your password? ");
const _hoisted_10$1 = /*#__PURE__*/vue.createTextVNode("Log In");

function render$9(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_message = vue.resolveComponent("message");
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
        _hoisted_1$8,
        _hoisted_2$8,
        vue.createElementVNode("form", {
          onSubmit: _cache[1] || (_cache[1] = vue.withModifiers((...args) => ($setup.onSubmit && $setup.onSubmit(...args)), ["prevent"]))
        }, [
          vue.createCommentVNode(" Email "),
          vue.createElementVNode("div", _hoisted_3$7, [
            _hoisted_4$2,
            vue.withDirectives(vue.createElementVNode("input", {
              class: vue.normalizeClass(`form-input-field ${
						$setup.emailError ? 'input-error-content' : null
					}`),
              placeholder: "eg. foo@bar.com",
              type: "email",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => ((_ctx.email) = $event))
            }, null, 2 /* CLASS */), [
              [vue.vModelText, _ctx.email]
            ]),
            ($setup.emailError)
              ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_5$2, vue.toDisplayString($setup.emailError), 1 /* TEXT */))
              : vue.createCommentVNode("v-if", true)
          ]),
          _hoisted_6$2,
          vue.createVNode(_component_styled_button, {
            appearance: $setup.ButtonAppearance.Primary,
            disabled: $setup.emailError || !_ctx.email
          }, {
            default: vue.withCtx(() => [
              (_ctx.loading)
                ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 0 }, [
                    _hoisted_7$2
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
                vue.createElementVNode("div", null, [
                  _hoisted_9$2,
                  vue.createVNode(_component_styled_link, {
                    onClick: _cache[2] || (_cache[2] = () => $setup.setView($setup.Views.Login))
                  }, {
                    default: vue.withCtx(() => [
                      _hoisted_10$1
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

script$9.render = render$9;
script$9.__scopeId = "data-v-70af7997";
script$9.__file = "src/components/AuthorizerForgotPassword.vue";

var script$8 = {
	name: 'Google',
};

const _hoisted_1$7 = { style: {
			position: 'absolute',
			left: '10px',
			top: '12px',
			display: 'flex',
		} };
const _hoisted_2$7 = /*#__PURE__*/vue.createStaticVNode("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24px\" height=\"24px\"><g transform=\"matrix(1, 0, 0, 1, 27.009001, -39.238998)\"><path fill=\"#4285F4\" d=\"M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z\"></path><path fill=\"#34A853\" d=\"M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z\"></path><path fill=\"#FBBC05\" d=\"M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z\"></path><path fill=\"#EA4335\" d=\"M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z\"></path></g></svg>", 1);
const _hoisted_3$6 = [
  _hoisted_2$7
];

function render$8(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", _hoisted_1$7, _hoisted_3$6))
}

script$8.render = render$8;
script$8.__file = "src/icons/Google.vue";

var script$7 = {
	name: 'Facebook',
};

const _hoisted_1$6 = { style: {
			position: 'absolute',
			left: '10px',
			top: '12px',
			display: 'flex',
		} };
const _hoisted_2$6 = /*#__PURE__*/vue.createElementVNode("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 50 50",
  width: "24px",
  height: "24px",
  fill: "#1877f2"
}, [
  /*#__PURE__*/vue.createElementVNode("path", { d: "M41,4H9C6.24,4,4,6.24,4,9v32c0,2.76,2.24,5,5,5h32c2.76,0,5-2.24,5-5V9C46,6.24,43.76,4,41,4z M37,19h-2c-2.14,0-3,0.5-3,2 v3h5l-1,5h-4v15h-5V29h-4v-5h4v-3c0-4,2-7,6-7c2.9,0,4,1,4,1V19z" })
], -1 /* HOISTED */);
const _hoisted_3$5 = [
  _hoisted_2$6
];

function render$7(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", _hoisted_1$6, _hoisted_3$5))
}

script$7.render = render$7;
script$7.__file = "src/icons/Facebook.vue";

var script$6 = {
	name: 'Github',
};

const _hoisted_1$5 = { style: {
			position: 'absolute',
			left: '10px',
			top: '12px',
			display: 'flex',
		} };
const _hoisted_2$5 = /*#__PURE__*/vue.createElementVNode("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 291.32 291.32",
  width: "24px",
  height: "24px"
}, [
  /*#__PURE__*/vue.createElementVNode("path", {
    d: "M145.66 0C65.219 0 0 65.219 0 145.66c0 80.45 65.219 145.66 145.66 145.66s145.66-65.21 145.66-145.66C291.319 65.219 226.1 0 145.66 0zm40.802 256.625c-.838-11.398-1.775-25.518-1.83-31.235-.364-4.388-.838-15.549-11.434-22.677 42.068-3.523 62.087-26.774 63.526-57.499 1.202-17.497-5.754-32.883-18.107-45.3.628-13.282-.401-29.023-1.256-35.941-9.486-2.731-31.608 8.949-37.79 13.947-13.037-5.062-44.945-6.837-64.336 0-13.747-9.668-29.396-15.64-37.926-13.974-7.875 17.452-2.813 33.948-1.275 35.914-10.142 9.268-24.289 20.675-20.447 44.572 6.163 35.04 30.816 53.94 70.508 58.564-8.466 1.73-9.896 8.048-10.606 10.788-26.656 10.997-34.275-6.791-37.644-11.425-11.188-13.847-21.23-9.832-21.849-9.614-.601.218-1.056 1.092-.992 1.511.564 2.986 6.655 6.018 6.955 6.263 8.257 6.154 11.316 17.27 13.2 20.438 11.844 19.473 39.374 11.398 39.638 11.562.018 1.702-.191 16.032-.355 27.184C64.245 245.992 27.311 200.2 27.311 145.66c0-65.365 52.984-118.348 118.348-118.348S264.008 80.295 264.008 145.66c0 51.008-32.318 94.332-77.546 110.965z",
    fill: "#2b414d"
  })
], -1 /* HOISTED */);
const _hoisted_3$4 = [
  _hoisted_2$5
];

function render$6(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", _hoisted_1$5, _hoisted_3$4))
}

script$6.render = render$6;
script$6.__file = "src/icons/Github.vue";

var script$5 = {
	name: 'Linkedin',
};

const _hoisted_1$4 = /*#__PURE__*/vue.createElementVNode("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 48 48",
  width: "32px",
  height: "32px"
}, [
  /*#__PURE__*/vue.createElementVNode("path", {
    fill: "#0288D1",
    d: "M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z"
  }),
  /*#__PURE__*/vue.createElementVNode("path", {
    fill: "#FFF",
    d: "M12 19H17V36H12zM14.485 17h-.028C12.965 17 12 15.888 12 14.499 12 13.08 12.995 12 14.514 12c1.521 0 2.458 1.08 2.486 2.499C17 15.887 16.035 17 14.485 17zM36 36h-5v-9.099c0-2.198-1.225-3.698-3.192-3.698-1.501 0-2.313 1.012-2.707 1.99C24.957 25.543 25 26.511 25 27v9h-5V19h5v2.616C25.721 20.5 26.85 19 29.738 19c3.578 0 6.261 2.25 6.261 7.274L36 36 36 36z"
  })
], -1 /* HOISTED */);
const _hoisted_2$4 = [
  _hoisted_1$4
];

function render$5(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", {
    style: vue.normalizeStyle({
			position: 'absolute',
			left: '8px',
			top: '7.5px',
			display: 'flex',
		})
  }, _hoisted_2$4, 4 /* STYLE */))
}

script$5.render = render$5;
script$5.__file = "src/icons/Linkedin.vue";

var script$4 = {
	name: 'Apple',
};

const _hoisted_1$3 = { style: {
			position: 'absolute',
			left: '10px',
			top: '10px',
			display: 'flex',
		} };
const _hoisted_2$3 = /*#__PURE__*/vue.createElementVNode("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 256 315",
  width: "24px",
  height: "24px"
}, [
  /*#__PURE__*/vue.createElementVNode("path", { d: "M213.803 167.03c.442 47.58 41.74 63.413 42.197 63.615-.35 1.116-6.599 22.563-21.757 44.716-13.104 19.153-26.705 38.235-48.13 38.63-21.05.388-27.82-12.483-51.888-12.483-24.061 0-31.582 12.088-51.51 12.871-20.68.783-36.428-20.71-49.64-39.793-27-39.033-47.633-110.3-19.928-158.406 13.763-23.89 38.36-39.017 65.056-39.405 20.307-.387 39.475 13.662 51.889 13.662 12.406 0 35.699-16.895 60.186-14.414 10.25.427 39.026 4.14 57.503 31.186-1.49.923-34.335 20.044-33.978 59.822M174.24 50.199c10.98-13.29 18.369-31.79 16.353-50.199-15.826.636-34.962 10.546-46.314 23.828-10.173 11.763-19.082 30.589-16.678 48.633 17.64 1.365 35.66-8.964 46.64-22.262" })
], -1 /* HOISTED */);
const _hoisted_3$3 = [
  _hoisted_2$3
];

function render$4(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", _hoisted_1$3, _hoisted_3$3))
}

script$4.render = render$4;
script$4.__file = "src/icons/Apple.vue";

var script$3 = {
	name: 'Twitter',
};

const _hoisted_1$2 = { style: {
			position: 'absolute',
			left: '10px',
			top: '12px',
			display: 'flex',
		} };
const _hoisted_2$2 = /*#__PURE__*/vue.createElementVNode("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 48 48",
  width: "24px",
  height: "24px"
}, [
  /*#__PURE__*/vue.createElementVNode("path", {
    fill: "#03A9F4",
    d: "M42,12.429c-1.323,0.586-2.746,0.977-4.247,1.162c1.526-0.906,2.7-2.351,3.251-4.058c-1.428,0.837-3.01,1.452-4.693,1.776C34.967,9.884,33.05,9,30.926,9c-4.08,0-7.387,3.278-7.387,7.32c0,0.572,0.067,1.129,0.193,1.67c-6.138-0.308-11.582-3.226-15.224-7.654c-0.64,1.082-1,2.349-1,3.686c0,2.541,1.301,4.778,3.285,6.096c-1.211-0.037-2.351-0.374-3.349-0.914c0,0.022,0,0.055,0,0.086c0,3.551,2.547,6.508,5.923,7.181c-0.617,0.169-1.269,0.263-1.941,0.263c-0.477,0-0.942-0.054-1.392-0.135c0.94,2.902,3.667,5.023,6.898,5.086c-2.528,1.96-5.712,3.134-9.174,3.134c-0.598,0-1.183-0.034-1.761-0.104C9.268,36.786,13.152,38,17.321,38c13.585,0,21.017-11.156,21.017-20.834c0-0.317-0.01-0.633-0.025-0.945C39.763,15.197,41.013,13.905,42,12.429"
  })
], -1 /* HOISTED */);
const _hoisted_3$2 = [
  _hoisted_2$2
];

function render$3(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", _hoisted_1$2, _hoisted_3$2))
}

script$3.render = render$3;
script$3.__file = "src/icons/Twitter.vue";

var script$2 = {
	name: 'AuthorizerSocialLogin',
	props: ['urlProps'],
	components: {
		'styled-button': script$o,
		'styled-separator': script$m,
		google: script$8,
		github: script$6,
		facebook: script$7,
		linkedin: script$5,
		apple: script$4,
		twitter: script$3,
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
const _hoisted_8$1 = /*#__PURE__*/vue.createTextVNode(" Sign in with Facebook ");
const _hoisted_9$1 = /*#__PURE__*/vue.createElementVNode("br", null, null, -1 /* HOISTED */);
const _hoisted_10 = /*#__PURE__*/vue.createTextVNode(" Sign in with Linkedin ");
const _hoisted_11 = /*#__PURE__*/vue.createElementVNode("br", null, null, -1 /* HOISTED */);
const _hoisted_12 = /*#__PURE__*/vue.createTextVNode(" Sign in with Twitter ");
const _hoisted_13 = /*#__PURE__*/vue.createElementVNode("br", null, null, -1 /* HOISTED */);
const _hoisted_14 = /*#__PURE__*/vue.createTextVNode(" OR ");

function render$2(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_apple = vue.resolveComponent("apple");
  const _component_styled_button = vue.resolveComponent("styled-button");
  const _component_google = vue.resolveComponent("google");
  const _component_github = vue.resolveComponent("github");
  const _component_facebook = vue.resolveComponent("facebook");
  const _component_linkedin = vue.resolveComponent("linkedin");
  const _component_twitter = vue.resolveComponent("twitter");
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
              _hoisted_8$1
            ]),
            _: 1 /* STABLE */
          }, 8 /* PROPS */, ["appearance"]),
          _hoisted_9$1
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
    ($setup.config.is_twitter_login_enabled.value)
      ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 5 }, [
          vue.createVNode(_component_styled_button, {
            appearance: $setup.ButtonAppearance.Default,
            onClick: _cache[5] || (_cache[5] = 
					() => {
						$setup.window.location.href = `${$setup.config.authorizerURL.value}/oauth_login/twitter?${$setup.queryParams}`;
					}
				)
          }, {
            default: vue.withCtx(() => [
              vue.createVNode(_component_twitter),
              _hoisted_12
            ]),
            _: 1 /* STABLE */
          }, 8 /* PROPS */, ["appearance"]),
          _hoisted_13
        ], 64 /* STABLE_FRAGMENT */))
      : vue.createCommentVNode("v-if", true),
    (
				$setup.hasSocialLogin &&
				($setup.config.is_basic_authentication_enabled.value ||
					$setup.config.is_magic_link_login_enabled.value)
			)
      ? (vue.openBlock(), vue.createBlock(_component_styled_separator, { key: 6 }, {
          default: vue.withCtx(() => [
            _hoisted_14
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
		'styled-wrapper': script$p,
		'styled-button': script$o,
		'password-strength-indicator': script$e,
		message: script$f,
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

const _withScopeId = n => (vue.pushScopeId("data-v-92ad093e"),n=n(),vue.popScopeId(),n);
const _hoisted_1 = ["hasError"];
const _hoisted_2 = /*#__PURE__*/ _withScopeId(() => /*#__PURE__*/vue.createElementVNode("label", {
  class: "form-input-label",
  for: ""
}, [
  /*#__PURE__*/vue.createElementVNode("span", null, "* "),
  /*#__PURE__*/vue.createTextVNode("Password")
], -1 /* HOISTED */));
const _hoisted_3 = {
  key: 0,
  class: "form-input-error"
};
const _hoisted_4 = ["hasError"];
const _hoisted_5 = /*#__PURE__*/ _withScopeId(() => /*#__PURE__*/vue.createElementVNode("label", {
  class: "form-input-label",
  for: ""
}, [
  /*#__PURE__*/vue.createElementVNode("span", null, "* "),
  /*#__PURE__*/vue.createTextVNode("Confirm Password")
], -1 /* HOISTED */));
const _hoisted_6 = {
  key: 0,
  class: "form-input-error"
};
const _hoisted_7 = /*#__PURE__*/ _withScopeId(() => /*#__PURE__*/vue.createElementVNode("br", null, null, -1 /* HOISTED */));
const _hoisted_8 = /*#__PURE__*/vue.createTextVNode("Processing ...");
const _hoisted_9 = /*#__PURE__*/vue.createTextVNode("Continue");

function render$1(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_message = vue.resolveComponent("message");
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
            onClose: $setup.onErrorClose
          }, null, 8 /* PROPS */, ["type", "text", "onClose"]))
        : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("form", {
        onSubmit: _cache[2] || (_cache[2] = vue.withModifiers((...args) => ($setup.onSubmit && $setup.onSubmit(...args)), ["prevent"]))
      }, [
        vue.createCommentVNode(" password "),
        vue.createElementVNode("div", {
          class: "styled-form-group",
          hasError: $setup.passwordError
        }, [
          _hoisted_2,
          vue.withDirectives(vue.createElementVNode("input", {
            class: vue.normalizeClass(`form-input-field ${
						$setup.passwordError ? 'input-error-content' : null
					}`),
            placeholder: "********",
            type: "password",
            "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => ((_ctx.password) = $event))
          }, null, 2 /* CLASS */), [
            [vue.vModelText, _ctx.password]
          ]),
          ($setup.passwordError)
            ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_3, vue.toDisplayString($setup.passwordError), 1 /* TEXT */))
            : vue.createCommentVNode("v-if", true)
        ], 8 /* PROPS */, _hoisted_1),
        vue.createCommentVNode(" confirm password "),
        vue.createElementVNode("div", {
          class: "styled-form-group",
          hasError: $setup.confirmPasswordError
        }, [
          _hoisted_5,
          vue.withDirectives(vue.createElementVNode("input", {
            class: vue.normalizeClass(`form-input-field ${
						$setup.confirmPasswordError ? 'input-error-content' : null
					}`),
            placeholder: "********",
            type: "password",
            "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => ((_ctx.confirmPassword) = $event))
          }, null, 2 /* CLASS */), [
            [vue.vModelText, _ctx.confirmPassword]
          ]),
          ($setup.confirmPasswordError)
            ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_6, vue.toDisplayString($setup.confirmPasswordError), 1 /* TEXT */))
            : vue.createCommentVNode("v-if", true)
        ], 8 /* PROPS */, _hoisted_4),
        ($setup.config.is_strong_password_enabled.value)
          ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 0 }, [
              vue.createVNode(_component_password_strength_indicator, {
                value: _ctx.password,
                setDisableButton: $setup.setDisableButton
              }, null, 8 /* PROPS */, ["value", "setDisableButton"]),
              _hoisted_7
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
                  _hoisted_8
                ], 64 /* STABLE_FRAGMENT */))
              : (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 1 }, [
                  _hoisted_9
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
script$1.__scopeId = "data-v-92ad093e";
script$1.__file = "src/components/AuthorizerResetPassword.vue";

var script = {
	name: 'AuthorizerRoot',
	components: {
		'styled-wrapper': script$p,
		'authorizer-social-login': script$2,
		'authorizer-signup': script$d,
		'authorizer-magic-link-login': script$a,
		'authorizer-forgot-password': script$9,
		'authorizer-basic-auth-login': script$b,
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
	AuthorizerProvider: script$q,
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

module.exports = plugin;
