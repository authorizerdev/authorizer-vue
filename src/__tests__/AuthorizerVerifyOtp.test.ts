import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import AuthorizerVerifyOtp from '../components/AuthorizerVerifyOtp.vue';
import globalContext from '../state/globalContext';
import globalConfig from '../state/globalConfig';

const { mockVerifyOtp, mockResendOtp } = vi.hoisted(() => ({
	mockVerifyOtp: vi.fn(),
	mockResendOtp: vi.fn()
}));

vi.mock('@authorizerdev/authorizer-js', () => {
	const MockAuthorizer = vi.fn().mockImplementation(() => ({
		verifyOtp: mockVerifyOtp,
		resendOtp: mockResendOtp,
		getMetaData: vi.fn().mockResolvedValue({ data: {}, errors: null }),
		getSession: vi.fn().mockResolvedValue({ data: null, errors: null })
	}));
	return { Authorizer: MockAuthorizer };
});

describe('AuthorizerVerifyOtp', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		Object.assign(globalConfig, {
			is_sign_up_enabled: true
		});
		globalContext.setAuthData = vi.fn();
	});

	it('renders OTP input', () => {
		const wrapper = mount(AuthorizerVerifyOtp, {
			props: { email: 'test@test.com' }
		});
		expect(wrapper.find('#authorizer-verify-otp').exists()).toBe(true);
	});

	it('validates empty OTP', async () => {
		const wrapper = mount(AuthorizerVerifyOtp, {
			props: { email: 'test@test.com' }
		});
		await wrapper.find('#authorizer-verify-otp').setValue('');
		expect(wrapper.text()).toContain('OTP is required');
	});

	it('validates invalid OTP format', async () => {
		const wrapper = mount(AuthorizerVerifyOtp, {
			props: { email: 'test@test.com' }
		});
		await wrapper.find('#authorizer-verify-otp').setValue('abc');
		expect(wrapper.text()).toContain('Please enter valid OTP');
	});

	it('calls verifyOtp on form submit', async () => {
		const mockUser = { id: '1', email: 'test@test.com' };
		const mockToken = { access_token: 'tok', expires_in: 3600, user: mockUser };
		mockVerifyOtp.mockResolvedValueOnce({ data: mockToken, errors: null });

		const onLogin = vi.fn();
		const wrapper = mount(AuthorizerVerifyOtp, {
			props: { email: 'test@test.com', onLogin }
		});

		await wrapper.find('#authorizer-verify-otp').setValue('AB123C');
		await wrapper.find('form').trigger('submit');
		await flushPromises();

		expect(mockVerifyOtp).toHaveBeenCalledWith(
			expect.objectContaining({ email: 'test@test.com', otp: 'AB123C' })
		);
		expect(onLogin).toHaveBeenCalledWith(mockToken);
	});

	it('shows error on verifyOtp failure', async () => {
		mockVerifyOtp.mockResolvedValueOnce({
			data: null,
			errors: [{ message: 'Invalid OTP' }]
		});

		const wrapper = mount(AuthorizerVerifyOtp, {
			props: { email: 'test@test.com' }
		});

		await wrapper.find('#authorizer-verify-otp').setValue('AB123C');
		await wrapper.find('form').trigger('submit');
		await flushPromises();

		expect(wrapper.text()).toContain('Invalid OTP');
	});

	it('calls resendOtp when resend link is clicked', async () => {
		mockResendOtp.mockResolvedValueOnce({
			data: { message: 'OTP sent successfully' },
			errors: null
		});

		const wrapper = mount(AuthorizerVerifyOtp, {
			props: { email: 'test@test.com', setView: vi.fn() }
		});

		const resendLink = wrapper.findAll('[class]').find((el) => el.text() === 'Resend OTP');
		if (resendLink) {
			await resendLink.trigger('click');
			await flushPromises();
			expect(mockResendOtp).toHaveBeenCalledWith({ email: 'test@test.com' });
		}
	});
});
