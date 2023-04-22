<template>
	<div>
		<div id="appleid-signin" v-if="config.is_apple_login_enabled.value">
			<styled-button
				:appearance="ButtonAppearance.Default"
				@click="
					() => {
						window.location.href = `${config.authorizerURL.value}/oauth_login/apple?${queryParams}`;
					}
				"
			>
				<apple />
				Sign in with Apple
			</styled-button>
			<br />
		</div>
		<template v-if="config.is_google_login_enabled.value">
			<styled-button
				:appearance="ButtonAppearance.Default"
				@click="
					() => {
						window.location.href = `${config.authorizerURL.value}/oauth_login/google?${queryParams}`;
					}
				"
			>
				<google />
				Sign in with Google
			</styled-button>
			<br />
		</template>
		<template v-if="config.is_github_login_enabled.value">
			<styled-button
				:appearance="ButtonAppearance.Default"
				@click="
					() => {
						window.location.href = `${config.authorizerURL.value}/oauth_login/github?${queryParams}`;
					}
				"
			>
				<github />
				Sign in with Github
			</styled-button>
			<br />
		</template>
		<template v-if="config.is_facebook_login_enabled.value">
			<styled-button
				:appearance="ButtonAppearance.Default"
				@click="
					() => {
						window.location.href = `${config.authorizerURL.value}/oauth_login/facebook?${queryParams}`;
					}
				"
			>
				<facebook />
				Sign in with Facebook
			</styled-button>
			<br />
		</template>
		<template v-if="config.is_linkedin_login_enabled.value">
			<styled-button
				:appearance="ButtonAppearance.Default"
				@click="
					() => {
						window.location.href = `${config.authorizerURL.value}/oauth_login/linkedin?${queryParams}`;
					}
				"
			>
				<linkedin />
				Sign in with Linkedin
			</styled-button>
			<br />
		</template>
		<template v-if="config.is_twitter_login_enabled.value">
			<styled-button
				:appearance="ButtonAppearance.Default"
				@click="
					() => {
						window.location.href = `${config.authorizerURL.value}/oauth_login/twitter?${queryParams}`;
					}
				"
			>
				<twitter />
				Sign in with Twitter
			</styled-button>
			<br />
		</template>
		<template v-if="config.is_microsoft_login_enabled.value">
			<styled-button
				:appearance="ButtonAppearance.Default"
				@click="
					() => {
						window.location.href = `${config.authorizerURL.value}/oauth_login/microsoft?${queryParams}`;
					}
				"
			>
				<microsoft />
				Sign in with Microsoft
			</styled-button>
			<br />
		</template>
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
import { StyledButton, StyledSeparator } from '../styledComponents/index';
import { ButtonAppearance } from '../constants/index';
import globalConfig from '../state/globalConfig';
import { computed, toRefs } from 'vue';
import Google from '../icons/Google.vue';
import Facebook from '../icons/Facebook.vue';
import Github from '../icons/Github.vue';
import Linkedin from '../icons/Linkedin.vue';
import Apple from '../icons/Apple.vue';
import Twitter from '../icons/Twitter.vue';
import Microsoft from '../icons/Microsoft.vue';
export default {
	name: 'AuthorizerSocialLogin',
	props: ['urlProps', 'roles'],
	components: {
		'styled-button': StyledButton,
		'styled-separator': StyledSeparator,
		google: Google,
		github: Github,
		facebook: Facebook,
		linkedin: Linkedin,
		apple: Apple,
		twitter: Twitter,
		microsoft: Microsoft,
	},
	setup({ urlProps, roles }) {
		const config = toRefs(globalConfig);
		const hasSocialLogin = computed(function () {
			return (
				config.is_google_login_enabled.value ||
				config.is_github_login_enabled.value ||
				config.is_facebook_login_enabled.value ||
				config.is_linkedin_login_enabled.value ||
				config.is_apple_login_enabled.value ||
				config.is_twitter_login_enabled.value ||
				config.is_microsoft_login_enabled.value
			);
		});
		const data = { ...urlProps, scope: urlProps.scope.join(' ') };
		if (roles && roles.length) {
			data.roles = roles;
		}
		const queryParams = createQueryParams(data);
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
