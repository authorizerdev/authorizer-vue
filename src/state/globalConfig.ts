import type { AuthorizerConfig } from '../types';
import { reactive } from 'vue';
export default reactive({
	authorizerURL: '',
	redirectURL: '',
	client_id: '',
	is_google_login_enabled: false,
	is_github_login_enabled: false,
	is_facebook_login_enabled: false,
	is_linkedin_login_enabled: false,
	is_apple_login_enabled: false,
	is_email_verification_enabled: false,
	is_basic_authentication_enabled: false,
	is_magic_link_login_enabled: false,
	is_sign_up_enabled: false,
	is_strong_password_enabled: true,
	is_twitter_login_enabled: false,
	is_microsoft_login_enabled: false
}) as AuthorizerConfig;
