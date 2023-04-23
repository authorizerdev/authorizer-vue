export enum AuthorizerProviderActionType {
	SET_USER = 'SET_USER',
	SET_TOKEN = 'SET_TOKEN',
	SET_LOADING = 'SET_LOADING',
	SET_AUTH_DATA = 'SET_AUTH_DATA',
	SET_CONFIG = 'SET_CONFIG',
}

export enum Views {
	Login = 'Login',
	Signup = 'Signup',
	ForgotPassword = 'ForgotPassword',
}

export const ButtonAppearance: Record<string, string> = {
	Primary: 'Primary',
	Default: 'Default',
};

export const MessageType: Record<string, string> = {
	Error: 'Error',
	Success: 'Success',
};

// TODO use based on theme primary color
export const passwordStrengthIndicatorOpacity: Record<string, number> = {
	default: 0.15,
	weak: 0.4,
	good: 0.6,
	strong: 0.8,
	veryStrong: 1,
};
