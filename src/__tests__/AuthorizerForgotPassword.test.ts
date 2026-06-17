import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import AuthorizerForgotPassword from '../components/AuthorizerForgotPassword.vue';
import globalConfig from '../state/globalConfig';

const { mockForgotPassword } = vi.hoisted(() => ({
	mockForgotPassword: vi.fn()
}));

vi.mock('@authorizerdev/authorizer-js', () => {
	const MockAuthorizer = vi.fn().mockImplementation(() => ({
		forgotPassword: mockForgotPassword,
		getMetaData: vi.fn().mockResolvedValue({ data: {}, errors: null }),
		getSession: vi.fn().mockResolvedValue({ data: null, errors: null })
	}));
	return { Authorizer: MockAuthorizer };
});

describe('AuthorizerForgotPassword', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		Object.assign(globalConfig, {
			redirectURL: 'http://localhost:3000'
		});
	});

	it('renders email field', () => {
		const wrapper = mount(AuthorizerForgotPassword);
		expect(wrapper.find('#authorizer-forgot-password-email').exists()).toBe(true);
	});

	it('validates empty email', async () => {
		const wrapper = mount(AuthorizerForgotPassword);
		await wrapper.find('#authorizer-forgot-password-email').setValue('');
		expect(wrapper.text()).toContain('Email is required');
	});

	it('calls forgotPassword and shows success message', async () => {
		mockForgotPassword.mockResolvedValueOnce({
			data: { message: 'Reset link sent to your email' },
			errors: null
		});

		const wrapper = mount(AuthorizerForgotPassword);
		await wrapper.find('#authorizer-forgot-password-email').setValue('test@test.com');
		await wrapper.find('form').trigger('submit');
		await flushPromises();

		expect(mockForgotPassword).toHaveBeenCalledWith(
			expect.objectContaining({ email: 'test@test.com' })
		);
		expect(wrapper.text()).toContain('Reset link sent to your email');
	});

	it('shows error on forgotPassword failure', async () => {
		mockForgotPassword.mockResolvedValueOnce({
			data: null,
			errors: [{ message: 'User not found' }]
		});

		const wrapper = mount(AuthorizerForgotPassword);
		await wrapper.find('#authorizer-forgot-password-email').setValue('test@test.com');
		await wrapper.find('form').trigger('submit');
		await flushPromises();

		expect(wrapper.text()).toContain('User not found');
	});
});
