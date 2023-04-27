import { type AuthToken, type User, type Authorizer } from '@authorizerdev/authorizer-js';
import { AuthorizerProviderActionType } from '../constants';
import type { Ref } from 'vue';

export type AuthorizerConfig = {
	authorizerURL: string;
	redirectURL: string;
	client_id: string;
	is_google_login_enabled: boolean;
	is_github_login_enabled: boolean;
	is_facebook_login_enabled: boolean;
	is_linkedin_login_enabled: boolean;
	is_apple_login_enabled: boolean;
	is_twitter_login_enabled: boolean;
	is_microsoft_login_enabled: boolean;
	is_email_verification_enabled: boolean;
	is_basic_authentication_enabled: boolean;
	is_magic_link_login_enabled: boolean;
	is_sign_up_enabled: boolean;
	is_strong_password_enabled: boolean;
};

export type AuthorizerConfigInput = {
	authorizerURL: string;
	redirectURL?: string;
	clientID?: string;
};

export type AuthorizerState = {
	user: User | null;
	token: AuthToken | null;
	loading: boolean;
	config: AuthorizerConfig;
};

export type AuthorizerProviderAction = {
	type: AuthorizerProviderActionType;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	payload: any;
};

export type AuthorizerContextPropsType = {
	user: null | User;
	token: null | AuthToken;
	loading: boolean;
	logout: () => Promise<void>;
	setLoading: (data: boolean) => void;
	setUser: (data: null | User) => void;
	setToken: (data: null | AuthToken) => void;
	setAuthData: (data: AuthorizerState) => void;
	authorizerRef: Authorizer;
};

export type AuthorizerContextOutputType = {
	user: Ref<null | User>;
	token: Ref<null | AuthToken>;
	loading: Ref<boolean>;
	logout: Ref<() => Promise<void>>;
	setLoading: Ref<(data: boolean) => void>;
	setUser: Ref<(data: null | User) => void>;
	setToken: Ref<(data: null | AuthToken) => void>;
	setAuthData: Ref<(data: AuthorizerState) => void>;
	authorizerRef: Ref<Authorizer>;
	config?: {
		authorizerURL: Ref<string>;
		redirectURL: Ref<string>;
		client_id: Ref<string>;
		is_google_login_enabled: Ref<boolean>;
		is_github_login_enabled: Ref<boolean>;
		is_facebook_login_enabled: Ref<boolean>;
		is_linkedin_login_enabled: Ref<boolean>;
		is_apple_login_enabled: Ref<boolean>;
		is_twitter_login_enabled: Ref<boolean>;
		is_microsoft_login_enabled: Ref<boolean>;
		is_email_verification_enabled: Ref<boolean>;
		is_basic_authentication_enabled: Ref<boolean>;
		is_magic_link_login_enabled: Ref<boolean>;
		is_sign_up_enabled: Ref<boolean>;
		is_strong_password_enabled: Ref<boolean>;
	};
};

export type OtpDataType = {
	isScreenVisible: boolean;
	email: string;
};

export type URLPropsType = {
	redirectURL?: string;
	scope?: string[];
	state?: string;
	redirect_uri?: string;
	roles?: string[];
};
