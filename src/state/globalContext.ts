import { markRaw, reactive } from 'vue';
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
	// markRaw: the client holds no reactive state, and letting reactive() deep-proxy
	// it both costs for nothing and breaks the cast — the unwrapped proxy type no
	// longer matches Authorizer once the class grows methods (authorizer-js 4.x).
	authorizerRef: markRaw(
		new Authorizer({
			authorizerURL: `http://localhost:8080`,
			redirectURL: hasWindow() ? window.location.origin : '/',
			clientID: ''
		})
	),
	logout: async () => undefined
}) as AuthorizerContextPropsType;
