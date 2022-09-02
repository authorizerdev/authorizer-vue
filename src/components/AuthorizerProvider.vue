<script>
import { toRefs, onMounted, watch, onUnmounted, provide } from 'vue';
import { Authorizer } from '@authorizerdev/authorizer-js';
import { hasWindow } from '../utils/window';
import { AuthorizerProviderActionType } from '../constants/index';
import globalState from '../state/globalState';
import globalConfig from '../state/globalConfig';
export default {
	name: 'AuthorizerProvider',
	props: ['config', 'onStateChangeCallback'],
	setup(props) {
		globalConfig.authorizerURL = props?.config?.authorizerURL || '';
		globalConfig.redirectURL = props?.config?.redirectURL
			? props.config.redirectURL
			: hasWindow()
			? window.location.origin
			: '/';
		globalConfig.client_id = props?.config?.client_id || '';
		globalConfig.is_google_login_enabled =
			props?.config?.is_google_login_enabled || false;
		globalConfig.is_github_login_enabled =
			props?.config?.is_github_login_enabled || false;
		globalConfig.is_facebook_login_enabled =
			props?.config?.is_facebook_login_enabled || false;
		globalConfig.is_linkedin_login_enabled =
			props?.config?.is_linkedin_login_enabled || false;
		globalConfig.is_apple_login_enabled =
			props?.config?.is_apple_login_enabled || false;
		globalConfig.is_email_verification_enabled =
			props?.config?.is_email_verification_enabled || false;
		globalConfig.is_basic_authentication_enabled =
			props?.config?.is_basic_authentication_enabled || false;
		globalConfig.is_magic_link_login_enabled =
			props?.config?.is_magic_link_login_enabled || false;
		globalConfig.is_sign_up_enabled =
			props?.config?.is_sign_up_enabled || false;
		globalConfig.is_strong_password_enabled =
			props?.config?.is_strong_password_enabled || true;
		globalState.authorizerRef = new Authorizer({
			authorizerURL: globalConfig.authorizerURL,
			redirectURL: globalConfig.redirectURL,
			clientID: globalConfig.client_id,
		});
		function dispatch({ type, payload }) {
			switch (type) {
				case AuthorizerProviderActionType.SET_USER:
					globalState.user = payload.user;
					break;
				case AuthorizerProviderActionType.SET_TOKEN:
					globalState.token = payload.token;
					break;
				case AuthorizerProviderActionType.SET_LOADING:
					globalState.loading = payload.loading;
					break;
				case AuthorizerProviderActionType.SET_CONFIG:
					Object.assign(globalConfig, payload.config);
					break;
				case AuthorizerProviderActionType.SET_AUTH_DATA:
					const { config, ...rest } = payload;
					Object.assign(globalConfig, config);
					Object.assign(globalState, rest);
					break;
				default:
					throw new Error();
			}
		}
		let intervalRef = null;
		const getToken = async () => {
			const metaRes = await globalState.authorizerRef.getMetaData();
			try {
				const res = await globalState.authorizerRef.getSession();
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
							...globalState,
							token,
							user: res.user,
							config: {
								...globalConfig,
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
							...globalState,
							token: null,
							user: null,
							config: {
								...globalConfig,
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
						...globalState,
						token: null,
						user: null,
						config: {
							...globalConfig,
							...metaRes,
						},
						loading: false,
					},
				});
			}
		};
		globalState.setToken = (token) => {
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
		globalState.setAuthData = (data) => {
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
		globalState.setUser = (user) => {
			dispatch({
				type: AuthorizerProviderActionType.SET_USER,
				payload: {
					user,
				},
			});
		};
		globalState.setLoading = (loading) => {
			dispatch({
				type: AuthorizerProviderActionType.SET_LOADING,
				payload: {
					loading,
				},
			});
		};
		globalState.logout = async () => {
			dispatch({
				type: AuthorizerProviderActionType.SET_LOADING,
				payload: {
					loading: true,
				},
			});
			await globalState.authorizerRef.logout();
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
			return toRefs(globalState);
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
				props.onStateChangeCallback({ ...globalState, ...globalConfig });
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
				globalState.authorizerRef = new Authorizer({
					authorizerURL: globalConfig.authorizerURL,
					redirectURL: globalConfig.redirectURL,
					clientID: globalConfig.client_id,
				});
			}
		);
	},
	render() {
		return this.$slots.default();
	},
};
</script>
