import { reactive } from 'vue';
export default reactive({
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
