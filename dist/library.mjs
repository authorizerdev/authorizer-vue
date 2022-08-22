import { reactive, ref, provide, toRefs, onMounted, onUnmounted, watch, openBlock, createElementBlock } from 'vue';
import { Authorizer } from '@authorizerdev/authorizer-js';

const hasWindow = () => typeof window !== 'undefined';

const AuthorizerProviderActionType = {
	SET_USER: 'SET_USER',
	SET_TOKEN: 'SET_TOKEN',
	SET_LOADING: 'SET_LOADING',
	SET_AUTH_DATA: 'SET_AUTH_DATA',
	SET_CONFIG: 'SET_CONFIG',
};

var script$8 = {
	name: 'AuthorizerProvider',
	props: ['config', 'onStateChangeCallback'],
	setup(props) {
		const state = reactive({
			config: {
				authorizerURL: props?.config?.authorizerURL || '',
				redirectURL: props?.config?.redirectURL
					? props.config.redirectURL
					: hasWindow()
					? window.location.origin
					: '/',
				client_id: props?.config?.client_id || '',
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
			},
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
		function dispatch({ type, payload }) {
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
		}
		const authorizerRef = ref(
			new Authorizer({
				authorizerURL: state.config.authorizerURL,
				redirectURL: state.config.redirectURL,
				clientID: state.config.client_id,
			})
		);
		let intervalRef = null;
		const getToken = async () => {
			const metaRes = await authorizerRef.value.getMetaData();
			try {
				const res = await authorizerRef.value.getSession();
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
			await authorizerRef.value.logout();
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
			return Object.entries(toRefs(state)).reduce((acc, item) => {
				return { ...acc, [item[0]]: item[1].value };
			}, {});
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
				authorizerRef.value = new Authorizer({
					authorizerURL:
						props?.config?.authorizerURL || state.config.authorizerURL,
					redirectURL: props?.config?.redirectURL || state.config.redirectURL,
					clientID: props?.config?.client_id || state.config.client_id,
					...props.config,
				});
				console.log('config changed authorizerRef ==>> ', authorizerRef.value);
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

var script = {
	name: 'AuthorizerRoot',
};

function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", null, "Authorizer Root Component"))
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
