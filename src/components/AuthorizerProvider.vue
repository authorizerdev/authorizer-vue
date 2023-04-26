<script lang="ts">
import { toRefs, onMounted, watch, onUnmounted, provide, type PropType } from 'vue';
import { Authorizer, type AuthToken, type User } from '@authorizerdev/authorizer-js';
import { hasWindow } from '../utils/window';
import { AuthorizerProviderActionType } from '../constants/index';
import globalContext from '../state/globalContext';
import globalConfig from '../state/globalConfig';
import type { AuthorizerConfigInput, AuthorizerState } from '../types';
import type { AuthorizerProviderAction } from '../types';
export default {
	name: 'AuthorizerProvider',
	props: {
		config: {
			type: Object as PropType<AuthorizerConfigInput>,
			default: undefined
		},
		onStateChangeCallback: {
			type: Function as PropType<(arg: AuthorizerState) => void>,
			default: undefined
		}
	},
	setup(props) {
		let intervalRef: ReturnType<typeof setInterval> | undefined;
		const config = toRefs(globalConfig);
		const context = toRefs(globalContext);
		config.authorizerURL.value = props?.config?.authorizerURL || '';
		config.redirectURL.value = props?.config?.redirectURL
			? props.config.redirectURL
			: hasWindow()
			? window.location.origin
			: '/';
		config.client_id.value = props?.config?.clientID || '';
		context.authorizerRef.value = new Authorizer({
			authorizerURL: props?.config?.authorizerURL || '',
			redirectURL: props?.config?.redirectURL
				? props.config.redirectURL
				: hasWindow()
				? window.location.origin
				: '/',
			clientID: props?.config?.clientID || ''
		});
		const dispatch = ({ type, payload }: AuthorizerProviderAction) => {
			switch (type) {
				case AuthorizerProviderActionType.SET_USER:
					context.user.value = payload.user;
					break;
				case AuthorizerProviderActionType.SET_TOKEN:
					context.token.value = payload.token;
					break;
				case AuthorizerProviderActionType.SET_LOADING:
					context.loading.value = payload.loading;
					break;
				case AuthorizerProviderActionType.SET_CONFIG:
					Object.assign(globalConfig, payload.config);
					break;
				case AuthorizerProviderActionType.SET_AUTH_DATA:
					const { config, ...rest } = payload;
					Object.assign(globalConfig, { ...globalConfig, ...config });
					Object.assign(globalContext, { ...globalContext, ...rest });
					break;
				default:
					throw new Error();
			}
		};
		const getToken = async () => {
			const metaRes = await context.authorizerRef.value.getMetaData();
			try {
				const res = await context.authorizerRef.value.getSession();
				if (res.access_token && res.user) {
					const token = {
						access_token: res.access_token,
						expires_in: res.expires_in,
						id_token: res.id_token,
						refresh_token: res.refresh_token || ''
					};
					dispatch({
						type: AuthorizerProviderActionType.SET_AUTH_DATA,
						payload: {
							token,
							user: res.user,
							config: metaRes,
							loading: false
						}
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
							loading: false
						}
					});
				}
			} catch (err) {
				dispatch({
					type: AuthorizerProviderActionType.SET_AUTH_DATA,
					payload: {
						token: null,
						user: null,
						config: metaRes,
						loading: false
					}
				});
			}
		};
		context.setToken.value = (token: AuthToken | null) => {
			dispatch({
				type: AuthorizerProviderActionType.SET_TOKEN,
				payload: {
					token
				}
			});
			if (token?.access_token) {
				if (intervalRef) clearInterval(intervalRef);
				intervalRef = setInterval(() => {
					getToken();
				}, token.expires_in * 1000);
			}
		};
		context.setAuthData.value = (data: AuthorizerState) => {
			dispatch({
				type: AuthorizerProviderActionType.SET_AUTH_DATA,
				payload: data
			});
			if (data.token?.access_token) {
				if (intervalRef) clearInterval(intervalRef);
				intervalRef = setInterval(() => {
					getToken();
				}, data.token.expires_in * 1000);
			}
		};
		context.setUser.value = (user: User | null) => {
			dispatch({
				type: AuthorizerProviderActionType.SET_USER,
				payload: {
					user
				}
			});
		};
		context.setLoading.value = (loading: boolean) => {
			dispatch({
				type: AuthorizerProviderActionType.SET_LOADING,
				payload: {
					loading
				}
			});
		};
		context.logout.value = async () => {
			dispatch({
				type: AuthorizerProviderActionType.SET_LOADING,
				payload: {
					loading: true
				}
			});
			await context.authorizerRef.value.logout();
			const loggedOutState = {
				user: null,
				token: null,
				loading: false,
				config: globalConfig
			};
			dispatch({
				type: AuthorizerProviderActionType.SET_AUTH_DATA,
				payload: loggedOutState
			});
		};
		provide('useAuthorizer', () => {
			return { ...toRefs(globalContext), config: { ...toRefs(globalConfig) } };
		});
		onMounted(() => {
			getToken();
		});
		onUnmounted(() => {
			if (intervalRef) {
				clearInterval(intervalRef);
			}
		});
		watch([globalContext, globalConfig], () => {
			if (props?.onStateChangeCallback) {
				props.onStateChangeCallback({ ...globalContext, config: globalConfig });
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
					authorizerURL: props?.config?.authorizerURL || globalConfig.authorizerURL,
					redirectURL: props?.config?.redirectURL || globalConfig.redirectURL,
					clientID: props?.config?.clientID || globalConfig.client_id
				};
				Object.assign(globalConfig, updatedConfig);
				context.authorizerRef.value = new Authorizer({
					authorizerURL: config.authorizerURL.value,
					redirectURL: config.redirectURL.value,
					clientID: config.client_id.value
				});
			}
		);
	},
	render() {
		return this.$slots.default ? this.$slots.default() : null;
	}
};
</script>
