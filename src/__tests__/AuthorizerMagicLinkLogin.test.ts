import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import AuthorizerMagicLinkLogin from '../components/AuthorizerMagicLinkLogin.vue';

const { mockMagicLinkLogin } = vi.hoisted(() => ({
	mockMagicLinkLogin: vi.fn()
}));

vi.mock('@authorizerdev/authorizer-js', () => {
	const MockAuthorizer = vi.fn().mockImplementation(() => ({
		magicLinkLogin: mockMagicLinkLogin,
		getMetaData: vi.fn().mockResolvedValue({ data: {}, errors: null }),
		getSession: vi.fn().mockResolvedValue({ data: null, errors: null })
	}));
	return { Authorizer: MockAuthorizer };
});

describe('AuthorizerMagicLinkLogin', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders email field', () => {
		const wrapper = mount(AuthorizerMagicLinkLogin);
		expect(wrapper.find('#authorizer-magic-link-login-email').exists()).toBe(true);
	});

	it('validates empty email', async () => {
		const wrapper = mount(AuthorizerMagicLinkLogin);
		await wrapper.find('#authorizer-magic-link-login-email').setValue('');
		expect(wrapper.text()).toContain('Email is required');
	});

	it('validates invalid email', async () => {
		const wrapper = mount(AuthorizerMagicLinkLogin);
		await wrapper.find('#authorizer-magic-link-login-email').setValue('not-email');
		expect(wrapper.text()).toContain('Please enter valid email');
	});

	it('calls magicLinkLogin and shows success message', async () => {
		mockMagicLinkLogin.mockResolvedValueOnce({
			data: { message: 'Magic link sent to your email' },
			errors: null
		});

		const wrapper = mount(AuthorizerMagicLinkLogin);
		await wrapper.find('#authorizer-magic-link-login-email').setValue('test@test.com');
		await wrapper.find('form').trigger('submit');
		await flushPromises();

		expect(mockMagicLinkLogin).toHaveBeenCalledWith(
			expect.objectContaining({ email: 'test@test.com' })
		);
		expect(wrapper.text()).toContain('Magic link sent to your email');
	});

	it('shows error on magicLinkLogin failure', async () => {
		mockMagicLinkLogin.mockResolvedValueOnce({
			data: null,
			errors: [{ message: 'User not found' }]
		});

		const wrapper = mount(AuthorizerMagicLinkLogin);
		await wrapper.find('#authorizer-magic-link-login-email').setValue('test@test.com');
		await wrapper.find('form').trigger('submit');
		await flushPromises();

		expect(wrapper.text()).toContain('User not found');
	});
});
