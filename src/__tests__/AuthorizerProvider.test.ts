import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, inject } from 'vue';
import AuthorizerProvider from '../components/AuthorizerProvider.vue';
import globalContext from '../state/globalContext';
import globalConfig from '../state/globalConfig';

const { mockGetMetaData, mockGetSession, mockLogout } = vi.hoisted(() => ({
	mockGetMetaData: vi.fn().mockResolvedValue({
		data: {
			is_google_login_enabled: true,
			is_basic_authentication_enabled: true,
			is_sign_up_enabled: true
		},
		errors: null
	}),
	mockGetSession: vi.fn().mockResolvedValue({
		data: null,
		errors: [{ message: 'unauthorized' }]
	}),
	mockLogout: vi.fn().mockResolvedValue({ data: { message: 'logged out' } })
}));

vi.mock('@authorizerdev/authorizer-js', () => {
	const MockAuthorizer = vi.fn().mockImplementation(() => ({
		getMetaData: mockGetMetaData,
		getSession: mockGetSession,
		logout: mockLogout
	}));
	return { Authorizer: MockAuthorizer };
});

const ChildComponent = defineComponent({
	setup() {
		const useAuthorizer = inject('useAuthorizer') as () => unknown;
		const ctx = useAuthorizer?.();
		return { ctx };
	},
	render() {
		return h('div', { class: 'child' }, 'Child content');
	}
});

describe('AuthorizerProvider', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		Object.assign(globalContext, {
			user: null,
			token: null,
			loading: false
		});
		Object.assign(globalConfig, {
			authorizerURL: '',
			redirectURL: '',
			client_id: ''
		});
		mockGetMetaData.mockResolvedValue({
			data: {
				is_google_login_enabled: true,
				is_basic_authentication_enabled: true,
				is_sign_up_enabled: true
			},
			errors: null
		});
		mockGetSession.mockResolvedValue({
			data: null,
			errors: [{ message: 'unauthorized' }]
		});
	});

	it('renders slot content', () => {
		const wrapper = mount(AuthorizerProvider, {
			props: {
				config: {
					authorizerURL: 'http://localhost:8080',
					redirectURL: 'http://localhost:3000',
					clientID: 'test-client'
				}
			},
			slots: {
				default: () => h('span', 'Hello')
			}
		});
		expect(wrapper.text()).toContain('Hello');
	});

	it('provides useAuthorizer to children', () => {
		const wrapper = mount(AuthorizerProvider, {
			props: {
				config: {
					authorizerURL: 'http://localhost:8080',
					redirectURL: 'http://localhost:3000',
					clientID: 'test-client'
				}
			},
			slots: {
				default: () => h(ChildComponent)
			}
		});
		expect(wrapper.find('.child').exists()).toBe(true);
	});

	it('calls getMetaData and getSession on mount', async () => {
		mount(AuthorizerProvider, {
			props: {
				config: {
					authorizerURL: 'http://localhost:8080',
					redirectURL: 'http://localhost:3000',
					clientID: 'test-client'
				}
			},
			slots: {
				default: () => h('div', 'test')
			}
		});
		await flushPromises();
		expect(mockGetMetaData).toHaveBeenCalled();
		expect(mockGetSession).toHaveBeenCalled();
	});

	it('sets user and token on successful session', async () => {
		const mockUser = { id: '1', email: 'test@example.com' };
		const mockToken = {
			access_token: 'test-token',
			expires_in: 3600,
			user: mockUser
		};
		mockGetSession.mockResolvedValueOnce({
			data: mockToken,
			errors: null
		});
		mount(AuthorizerProvider, {
			props: {
				config: {
					authorizerURL: 'http://localhost:8080',
					redirectURL: 'http://localhost:3000',
					clientID: 'test-client'
				}
			},
			slots: {
				default: () => h('div', 'test')
			}
		});
		await flushPromises();
		expect(globalContext.user).toEqual(mockUser);
		expect(globalContext.token).toEqual(mockToken);
	});

	it('handles session errors gracefully', async () => {
		mockGetSession.mockResolvedValueOnce({
			data: null,
			errors: [{ message: 'session expired' }]
		});
		mount(AuthorizerProvider, {
			props: {
				config: {
					authorizerURL: 'http://localhost:8080',
					redirectURL: 'http://localhost:3000',
					clientID: 'test-client'
				}
			},
			slots: {
				default: () => h('div', 'test')
			}
		});
		await flushPromises();
		expect(globalContext.user).toBeNull();
		expect(globalContext.token).toBeNull();
		expect(globalContext.loading).toBe(false);
	});
});
