import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import AuthorizerSocialLogin from '../components/AuthorizerSocialLogin.vue';
import globalConfig from '../state/globalConfig';

vi.mock('@authorizerdev/authorizer-js', () => {
	const MockAuthorizer = vi.fn().mockImplementation(() => ({
		getMetaData: vi.fn().mockResolvedValue({ data: {}, errors: null }),
		getSession: vi.fn().mockResolvedValue({ data: null, errors: null })
	}));
	return { Authorizer: MockAuthorizer };
});

describe('AuthorizerSocialLogin', () => {
	beforeEach(() => {
		Object.assign(globalConfig, {
			authorizerURL: 'http://localhost:8080',
			is_google_login_enabled: false,
			is_github_login_enabled: false,
			is_facebook_login_enabled: false,
			is_linkedin_login_enabled: false,
			is_apple_login_enabled: false,
			is_twitter_login_enabled: false,
			is_microsoft_login_enabled: false,
			is_discord_login_enabled: false,
			is_roblox_login_enabled: false,
			is_basic_authentication_enabled: false,
			is_magic_link_login_enabled: false
		});
	});

	it('renders Google button when enabled', () => {
		globalConfig.is_google_login_enabled = true;
		const wrapper = mount(AuthorizerSocialLogin);
		expect(wrapper.text()).toContain('Sign in with Google');
	});

	it('renders Github button when enabled', () => {
		globalConfig.is_github_login_enabled = true;
		const wrapper = mount(AuthorizerSocialLogin);
		expect(wrapper.text()).toContain('Sign in with Github');
	});

	it('renders Facebook button when enabled', () => {
		globalConfig.is_facebook_login_enabled = true;
		const wrapper = mount(AuthorizerSocialLogin);
		expect(wrapper.text()).toContain('Sign in with Facebook');
	});

	it('hides disabled providers', () => {
		const wrapper = mount(AuthorizerSocialLogin);
		expect(wrapper.text()).not.toContain('Sign in with Google');
		expect(wrapper.text()).not.toContain('Sign in with Github');
		expect(wrapper.text()).not.toContain('Sign in with Facebook');
	});

	it('renders multiple providers when enabled', () => {
		globalConfig.is_google_login_enabled = true;
		globalConfig.is_github_login_enabled = true;
		globalConfig.is_apple_login_enabled = true;
		const wrapper = mount(AuthorizerSocialLogin);
		expect(wrapper.text()).toContain('Sign in with Google');
		expect(wrapper.text()).toContain('Sign in with Github');
		expect(wrapper.text()).toContain('Sign in with Apple');
	});

	it('shows separator when social login and basic auth are both enabled', () => {
		globalConfig.is_google_login_enabled = true;
		globalConfig.is_basic_authentication_enabled = true;
		const wrapper = mount(AuthorizerSocialLogin);
		expect(wrapper.text()).toContain('OR');
	});

	it('hides separator when only social login is enabled', () => {
		globalConfig.is_google_login_enabled = true;
		globalConfig.is_basic_authentication_enabled = false;
		globalConfig.is_magic_link_login_enabled = false;
		const wrapper = mount(AuthorizerSocialLogin);
		expect(wrapper.text()).not.toContain('OR');
	});
});
