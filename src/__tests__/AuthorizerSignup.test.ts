import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import AuthorizerSignup from '../components/AuthorizerSignup.vue';
import globalContext from '../state/globalContext';
import globalConfig from '../state/globalConfig';

const { mockSignup } = vi.hoisted(() => ({
	mockSignup: vi.fn()
}));

vi.mock('@authorizerdev/authorizer-js', () => {
	const MockAuthorizer = vi.fn().mockImplementation(() => ({
		signup: mockSignup,
		getMetaData: vi.fn().mockResolvedValue({ data: {}, errors: null }),
		getSession: vi.fn().mockResolvedValue({ data: null, errors: null })
	}));
	return { Authorizer: MockAuthorizer };
});

describe('AuthorizerSignup', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		Object.assign(globalConfig, {
			is_sign_up_enabled: true,
			is_strong_password_enabled: false
		});
		globalContext.setAuthData = vi.fn();
	});

	it('renders email, password, and confirm password fields', () => {
		const wrapper = mount(AuthorizerSignup);
		expect(wrapper.find('#authorizer-sign-up-email').exists()).toBe(true);
		expect(wrapper.find('#authorizer-sign-up-password').exists()).toBe(true);
		expect(wrapper.find('#authorizer-sign-up-confirm-password').exists()).toBe(true);
	});

	it('validates password mismatch', async () => {
		const wrapper = mount(AuthorizerSignup);
		await wrapper.find('#authorizer-sign-up-password').setValue('password1');
		await wrapper.find('#authorizer-sign-up-confirm-password').setValue('password2');
		expect(wrapper.text()).toContain("Password and confirm passwords don't match");
	});

	it('calls signup on form submit with access_token response', async () => {
		const mockUser = { id: '1', email: 'test@test.com' };
		const mockToken = { access_token: 'tok', expires_in: 3600, user: mockUser };
		mockSignup.mockResolvedValueOnce({ data: mockToken, errors: null });

		const onSignup = vi.fn();
		const wrapper = mount(AuthorizerSignup, { props: { onSignup } });

		await wrapper.find('#authorizer-sign-up-email').setValue('test@test.com');
		await wrapper.find('#authorizer-sign-up-password').setValue('Test@123');
		await wrapper.find('#authorizer-sign-up-confirm-password').setValue('Test@123');
		await wrapper.find('form').trigger('submit');
		await flushPromises();

		expect(mockSignup).toHaveBeenCalledWith(
			expect.objectContaining({
				email: 'test@test.com',
				password: 'Test@123',
				confirm_password: 'Test@123'
			})
		);
		expect(onSignup).toHaveBeenCalledWith(mockToken);
	});

	it('shows success message when signup returns message instead of token', async () => {
		mockSignup.mockResolvedValueOnce({
			data: { message: 'Please verify your email' },
			errors: null
		});

		const wrapper = mount(AuthorizerSignup);
		await wrapper.find('#authorizer-sign-up-email').setValue('test@test.com');
		await wrapper.find('#authorizer-sign-up-password').setValue('Test@123');
		await wrapper.find('#authorizer-sign-up-confirm-password').setValue('Test@123');
		await wrapper.find('form').trigger('submit');
		await flushPromises();

		expect(wrapper.text()).toContain('Please verify your email');
	});

	it('handles signup errors', async () => {
		mockSignup.mockResolvedValueOnce({
			data: null,
			errors: [{ message: 'Email already exists' }]
		});

		const wrapper = mount(AuthorizerSignup);
		await wrapper.find('#authorizer-sign-up-email').setValue('test@test.com');
		await wrapper.find('#authorizer-sign-up-password').setValue('Test@123');
		await wrapper.find('#authorizer-sign-up-confirm-password').setValue('Test@123');
		await wrapper.find('form').trigger('submit');
		await flushPromises();

		expect(wrapper.text()).toContain('Email already exists');
	});
});
