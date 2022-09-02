<template>
	<div>
		<div id="appleid-signin" v-if="config.is_apple_login_enabled.value">
			<styled-button
				:appearance="ButtonAppearance.Primary"
				@click="
					() => {
						window.location.href = `${config.authorizerURL.value}/oauth_login/apple?${queryParams}`;
					}
				"
			>
				<!-- <Apple /> -->
				Sign in with Apple
			</styled-button>
			<br />
		</div>
		<styled-button
			v-if="config.is_google_login_enabled.value"
			:appearance="ButtonAppearance.Primary"
			@click="
				() => {
					window.location.href = `${config.authorizerURL.value}/oauth_login/google?${queryParams}`;
				}
			"
		>
			<!-- <Google /> -->
			Sign in with Google
		</styled-button>
		<styled-button
			v-if="config.is_github_login_enabled.value"
			:appearance="ButtonAppearance.Primary"
			@click="
				() => {
					window.location.href = `${config.authorizerURL.value}/oauth_login/github?${queryParams}`;
				}
			"
		>
			<!-- <Github /> -->
			Sign in with Github
		</styled-button>
		<styled-button
			v-if="config.is_facebook_login_enabled.value"
			:appearance="ButtonAppearance.Primary"
			@click="
				() => {
					window.location.href = `${config.authorizerURL.value}/oauth_login/facebook?${queryParams}`;
				}
			"
		>
			<!-- <Facebook /> -->
			Sign in with Facebook
		</styled-button>
		<styled-button
			v-if="config.is_linkedin_login_enabled.value"
			:appearance="ButtonAppearance.Primary"
			@click="
				() => {
					window.location.href = `${config.authorizerURL.value}/oauth_login/linkedin?${queryParams}`;
				}
			"
		>
			<!-- <Linkedin /> -->
			Sign in with Linkedin
		</styled-button>
		<styled-separator
			v-if="
				hasSocialLogin &&
				(config.is_basic_authentication_enabled.value ||
					config.is_magic_link_login_enabled.value)
			"
		>
			OR
		</styled-separator>
	</div>
</template>

<script>
import { hasWindow } from '../utils/window';
import { createQueryParams } from '../utils/common';
import { StyledButton, StyledSeparator } from '../styles/index';
import { ButtonAppearance } from '../constants/index';
import globalConfig from '../state/globalConfig';
import { computed, toRefs } from 'vue';
export default {
	name: 'AuthorizerSocialLogin',
	props: ['urlProps'],
	components: {
		'styled-button': StyledButton,
		'styled-separator': StyledSeparator,
	},
	setup({ urlProps }) {
		const config = { ...toRefs(globalConfig) };
		const hasSocialLogin = computed(function () {
			return (
				config.is_google_login_enabled.value ||
				config.is_github_login_enabled.value ||
				config.is_facebook_login_enabled.value ||
				config.is_linkedin_login_enabled.value ||
				config.is_apple_login_enabled.value
			);
		});
		const queryParams = createQueryParams({
			...urlProps,
			scope: urlProps.scope.join(' '),
		});
		const windowObject = hasWindow() ? window : null;
		return {
			config,
			hasSocialLogin,
			queryParams,
			ButtonAppearance,
			window: windowObject,
		};
	},
};
</script>

<style scoped></style>
