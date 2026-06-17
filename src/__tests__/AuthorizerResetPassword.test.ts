import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import AuthorizerResetPassword from '../components/AuthorizerResetPassword.vue';
import globalConfig from '../state/globalConfig';

const { mockResetPassword } = vi.hoisted(() => ({
	mockResetPassword: vi.fn()
}));

vi.mock('@authorizerdev/authorizer-js', () => {
	const MockAuthorizer = vi.fn().mockImplementation(() => ({
		resetPassword: mockResetPassword,
		getMetaData: vi.fn().mockResolvedValue({ data: {}, errors: null }),
		getSession: vi.fn().mockResolvedValue({ data: null, errors: null })
	}));
	return { Authorizer: MockAuthorizer };
});

vi.mock('../utils/url', () => ({
	getSearchParams: () => ({ token: 'test-reset-token', redirect_uri: '' })
}));

describe('AuthorizerResetPassword', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		Object.assign(globalConfig, {
			is_strong_password_enabled: false,
			redirectURL: 'http://localhost:3000'
		});
	});

	it('renders password and confirm password fields', () => {
		const wrapper = mount(AuthorizerResetPassword);
		expect(wrapper.find('#authorizer-reset-password').exists()).toBe(true);
		expect(wrapper.find('#authorizer-reset-confirm-password').exists()).toBe(true);
	});

	it('validates password mismatch', async () => {
		const wrapper = mount(AuthorizerResetPassword);
		await wrapper.find('#authorizer-reset-password').setValue('password1');
		await wrapper.find('#authorizer-reset-confirm-password').setValue('password2');
		expect(wrapper.text()).toContain("Password and confirm passwords don't match");
	});

	it('calls resetPassword on submit', async () => {
		mockResetPassword.mockResolvedValueOnce({
			data: { message: 'Password reset successfully' },
			errors: null
		});

		const onReset = vi.fn();
		const wrapper = mount(AuthorizerResetPassword, { props: { onReset } });

		await wrapper.find('#authorizer-reset-password').setValue('NewPass@123');
		await wrapper.find('#authorizer-reset-confirm-password').setValue('NewPass@123');
		await wrapper.find('form').trigger('submit');
		await flushPromises();

		expect(mockResetPassword).toHaveBeenCalledWith(
			expect.objectContaining({
				token: 'test-reset-token',
				password: 'NewPass@123',
				confirm_password: 'NewPass@123'
			})
		);
		expect(onReset).toHaveBeenCalled();
	});

	it('shows error on resetPassword failure', async () => {
		mockResetPassword.mockResolvedValueOnce({
			data: null,
			errors: [{ message: 'Token expired' }]
		});

		const wrapper = mount(AuthorizerResetPassword);
		await wrapper.find('#authorizer-reset-password').setValue('NewPass@123');
		await wrapper.find('#authorizer-reset-confirm-password').setValue('NewPass@123');
		await wrapper.find('form').trigger('submit');
		await flushPromises();

		expect(wrapper.text()).toContain('Token expired');
	});
});
