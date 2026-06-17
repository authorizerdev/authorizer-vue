import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import AuthorizerBasicAuthLogin from '../components/AuthorizerBasicAuthLogin.vue';
import globalContext from '../state/globalContext';
import globalConfig from '../state/globalConfig';

const { mockLogin, mockVerifyOtp, mockResendOtp } = vi.hoisted(() => ({
	mockLogin: vi.fn(),
	mockVerifyOtp: vi.fn(),
	mockResendOtp: vi.fn()
}));

vi.mock('@authorizerdev/authorizer-js', () => {
	const MockAuthorizer = vi.fn().mockImplementation(() => ({
		login: mockLogin,
		verifyOtp: mockVerifyOtp,
		resendOtp: mockResendOtp,
		getMetaData: vi.fn().mockResolvedValue({ data: {}, errors: null }),
		getSession: vi.fn().mockResolvedValue({ data: null, errors: null })
	}));
	return { Authorizer: MockAuthorizer };
});

describe('AuthorizerBasicAuthLogin', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		Object.assign(globalConfig, {
			is_sign_up_enabled: true,
			is_basic_authentication_enabled: true,
			is_strong_password_enabled: false
		});
		globalContext.setAuthData = vi.fn();
	});

	it('renders email and password fields', () => {
		const wrapper = mount(AuthorizerBasicAuthLogin);
		expect(wrapper.find('#authorizer-login-email').exists()).toBe(true);
		expect(wrapper.find('#authorizer-login-password').exists()).toBe(true);
	});

	it('validates empty email', async () => {
		const wrapper = mount(AuthorizerBasicAuthLogin);
		const emailInput = wrapper.find('#authorizer-login-email');
		await emailInput.setValue('');
		expect(wrapper.text()).toContain('Email is required');
	});

	it('validates invalid email', async () => {
		const wrapper = mount(AuthorizerBasicAuthLogin);
		const emailInput = wrapper.find('#authorizer-login-email');
		await emailInput.setValue('not-an-email');
		expect(wrapper.text()).toContain('Please enter valid email');
	});

	it('validates empty password', async () => {
		const wrapper = mount(AuthorizerBasicAuthLogin);
		const passwordInput = wrapper.find('#authorizer-login-password');
		await passwordInput.setValue('');
		expect(wrapper.text()).toContain('Password is required');
	});

	it('calls login on form submit and handles success', async () => {
		const mockUser = { id: '1', email: 'test@test.com' };
		const mockToken = { access_token: 'tok', expires_in: 3600, user: mockUser };
		mockLogin.mockResolvedValueOnce({ data: mockToken, errors: null });

		const onLogin = vi.fn();
		const wrapper = mount(AuthorizerBasicAuthLogin, {
			props: { onLogin }
		});

		await wrapper.find('#authorizer-login-email').setValue('test@test.com');
		await wrapper.find('#authorizer-login-password').setValue('password123');
		await wrapper.find('form').trigger('submit');
		await flushPromises();

		expect(mockLogin).toHaveBeenCalledWith(
			expect.objectContaining({ email: 'test@test.com', password: 'password123' })
		);
		expect(onLogin).toHaveBeenCalledWith(mockToken);
	});

	it('handles login errors', async () => {
		mockLogin.mockResolvedValueOnce({
			data: null,
			errors: [{ message: 'Invalid credentials' }]
		});

		const wrapper = mount(AuthorizerBasicAuthLogin);
		await wrapper.find('#authorizer-login-email').setValue('test@test.com');
		await wrapper.find('#authorizer-login-password').setValue('wrong');
		await wrapper.find('form').trigger('submit');
		await flushPromises();

		expect(wrapper.text()).toContain('Invalid credentials');
	});

	it('shows OTP screen when MFA is required', async () => {
		mockLogin.mockResolvedValueOnce({
			data: { should_show_email_otp_screen: true },
			errors: null
		});

		const wrapper = mount(AuthorizerBasicAuthLogin);
		await wrapper.find('#authorizer-login-email').setValue('test@test.com');
		await wrapper.find('#authorizer-login-password').setValue('password123');
		await wrapper.find('form').trigger('submit');
		await flushPromises();

		expect(wrapper.find('#authorizer-verify-otp').exists()).toBe(true);
	});
});
