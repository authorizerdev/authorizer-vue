import { reactive } from 'vue';
import { Authorizer } from '@authorizerdev/authorizer-js';
import type { AuthorizerContextPropsType } from '../types';
import { hasWindow } from '../utils/window';
export default reactive({
	user: null,
	token: null,
	loading: false,
	setLoading: () => undefined,
	setToken: () => undefined,
	setUser: () => undefined,
	setAuthData: () => undefined,
	authorizerRef: new Authorizer({
		authorizerURL: `http://localhost:8080`,
		redirectURL: hasWindow() ? window.location.origin : '/',
		clientID: ''
	}),
	logout: async () => undefined
}) as AuthorizerContextPropsType;
