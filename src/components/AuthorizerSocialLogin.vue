<template>
	<div
		style="
			 {
				width: '100%';
			}
		"
	>
		<div id="appleid-signin">
			<styled-button
				:appearance="ButtonAppearance.Primary"
				@click="
					() => {
						window.location.href = `${config.authorizerURL}/oauth_login/apple?${queryParams}`;
					}
				"
			>
				<!-- <Apple /> -->
				Sign in with Apple
			</styled-button>
			<br />
		</div>
	</div>
</template>

<script>
import { inject } from 'vue';
import { hasWindow } from '../utils/window';
import { createQueryParams } from '../utils/common';
import { StyledButton } from '../styles/index';
import { ButtonAppearance } from '../constants/index';
export default {
	name: 'AuthorizerSocialLogin',
	props: ['urlProps'],
	components: {
		'styled-button': StyledButton,
	},
	setup({ urlProps }) {
		const useAuthorizer = inject('useAuthorizer');
		const { config } = useAuthorizer();
		const hasSocialLogin =
			config.is_google_login_enabled ||
			config.is_github_login_enabled ||
			config.is_facebook_login_enabled ||
			config.is_linkedin_login_enabled ||
			config.is_apple_login_enabled;
		const queryParams = createQueryParams({
			...urlProps,
			scope: urlProps.scope.join(' '),
		});
		const windowObject = hasWindow() ? window : null;
		return {
			config: config.value,
			hasSocialLogin,
			queryParams,
			ButtonAppearance,
			window: windowObject,
		};
	},
};
</script>

<style scoped></style>
