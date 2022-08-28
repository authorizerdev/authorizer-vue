<script>
import { reactive, toRefs, onMounted, watch, onUnmounted, provide } from 'vue';
import { Authorizer } from '@authorizerdev/authorizer-js';
import { hasWindow } from '../utils/window';
import { AuthorizerProviderActionType } from '../constants/index';
export default {
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
					Object.assign(state, payload);
					break;
				default:
					throw new Error();
			}
		}
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
</script>
