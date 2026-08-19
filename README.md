# authorizer-vue

Vue 3 SDK for [authorizer.dev](https://authorizer.dev). Adds authentication to your [Vue](https://vuejs.org/) application in minutes. Current version: **2.0.0**.

## Migration Guide: v1 -> v2

v2.0.0 updates the underlying `@authorizerdev/authorizer-js` dependency to v3.x. The response shape of all SDK methods changed from returning data directly (v1.x) to a uniform `{ data, errors }` envelope (v3.x). If you were calling SDK methods directly through the injected context, update your call sites to destructure `data` from the response.

The `AuthorizerProvider` component now accepts an optional `protocol` prop.

## Code Sandbox Demo: https://codesandbox.io/s/authorizer-vue-example-700l1h

## Step 1 - Create an Authorizer instance

Deploy an Authorizer instance and grab the URL and client ID from the dashboard. See the [deployment guide](https://docs.authorizer.dev/deployment).

## Step 2 - Install package

```sh
npm i --save @authorizerdev/authorizer-vue
# or
yarn add @authorizerdev/authorizer-vue
```

## Step 3 - Configure provider and use components

`AuthorizerProvider` uses Vue's [provide/inject](https://vuejs.org/api/composition-api-dependency-injection.html#provide) to make a reactive auth context available to all descendants via the `useAuthorizer` injection key.

### App root (`App.vue` or router layout)

```vue
<template>
	<div :style="{ display: 'flex', justifyContent: 'center' }">
		<authorizer-provider
			:config="{
				authorizerURL: 'http://localhost:8080',
				redirectURL: window.location.origin,
				clientID: 'AUTHORIZER_CLIENT_ID'
			}"
			protocol="graphql"
			:onStateChangeCallback="stateChangeCallback"
		>
			<router-view />
		</authorizer-provider>
	</div>
</template>

<script lang="ts">
import { AuthorizerProvider } from '@authorizerdev/authorizer-vue';
import type { AuthorizerState } from '@authorizerdev/authorizer-vue/dist/types/types';

export default {
	components: {
		'authorizer-provider': AuthorizerProvider
	},
	setup() {
		const stateChangeCallback = (state: AuthorizerState) => {
			console.log('state changed ==>> ', state);
		};
		return { stateChangeCallback, window };
	}
};
</script>
```

### Login page

```vue
<template>
	<div>
		<h1 :style="{ textAlign: 'center' }">Welcome to Authorizer</h1>
		<br />
		<authorizer-root :onLogin="onLogin" />
	</div>
</template>

<script lang="ts">
import { inject, watch } from 'vue';
import { useRouter } from 'vue-router';
import { AuthorizerRoot } from '@authorizerdev/authorizer-vue';
import type { AuthorizerContextOutputType } from '@authorizerdev/authorizer-vue/dist/types/types';

export default {
	name: 'Login',
	components: {
		'authorizer-root': AuthorizerRoot
	},
	setup() {
		const useAuthorizer = inject('useAuthorizer') as () => AuthorizerContextOutputType;
		const { token, config } = useAuthorizer?.();
		const router = useRouter();

		const onLogin = () => {
			console.log('login event');
		};

		watch(
			token,
			(newValue) => {
				if (newValue) {
					router.push('/dashboard');
				}
			},
			{ immediate: true }
		);

		config &&
			watch(config.is_basic_authentication_enabled, (newValue, oldValue) => {
				console.log('basic auth enabled changed', oldValue, '->', newValue);
			});

		return { onLogin };
	}
};
</script>
```

### `AuthorizerProvider` props

| Prop                    | Type                               | Required | Description                                 |
| ----------------------- | ---------------------------------- | -------- | ------------------------------------------- |
| `config`                | `ConfigType`                       | Yes      | Authorizer connection config (see below)    |
| `protocol`              | `'graphql' \| 'rest'`              | No       | Transport protocol. Defaults to `'graphql'` |
| `onStateChangeCallback` | `(state: AuthorizerState) => void` | No       | Called whenever auth state changes          |

The `protocol` prop selects which transport the underlying `authorizer-js` v3 SDK uses. Use `'rest'` if your deployment restricts the GraphQL endpoint.

### `config` fields

| Field                                    | Type      | Description                                     |
| ---------------------------------------- | --------- | ----------------------------------------------- |
| `authorizerURL`                          | `string`  | Base URL of your Authorizer instance            |
| `redirectURL`                            | `string`  | URL to redirect to after login                  |
| `clientID`                               | `string`  | Client ID from the dashboard                    |
| `is_google_login_enabled`                | `boolean` | Google social login                             |
| `is_github_login_enabled`                | `boolean` | GitHub social login                             |
| `is_facebook_login_enabled`              | `boolean` | Facebook social login                           |
| `is_linkedin_login_enabled`              | `boolean` | LinkedIn social login                           |
| `is_apple_login_enabled`                 | `boolean` | Apple social login                              |
| `is_twitter_login_enabled`               | `boolean` | Twitter/X social login                          |
| `is_microsoft_login_enabled`             | `boolean` | Microsoft social login                          |
| `is_twitch_login_enabled`                | `boolean` | Twitch social login                             |
| `is_discord_login_enabled`               | `boolean` | Discord social login                            |
| `is_roblox_login_enabled`                | `boolean` | Roblox social login                             |
| `is_basic_authentication_enabled`        | `boolean` | Email/password login                            |
| `is_magic_link_login_enabled`            | `boolean` | Magic link (passwordless) login                 |
| `is_sign_up_enabled`                     | `boolean` | Allow new user registration                     |
| `is_strong_password_enabled`             | `boolean` | Enforce strong password policy                  |
| `is_multi_factor_auth_enabled`           | `boolean` | TOTP-based two-factor authentication            |
| `is_mobile_basic_authentication_enabled` | `boolean` | Mobile (phone number + password) authentication |
| `is_phone_verification_enabled`          | `boolean` | Phone number OTP verification                   |

These fields are populated automatically from the server's `/api/meta` response when the provider mounts.

---

## Local Development

```bash
# Start dev server
npm run dev

# Build library
npm run build

# Generate TypeScript declarations
npm run build:types

# Type check
npm run typecheck
```

### Tooling notes

- **Vite** builds and bundles `.vue` to `.js` via rollup. See `vite.config.ts` for details.
- **TypeScript**: `tsconfig.json` references `tsconfig.app.json` (components), `tsconfig.build-types.json` (declaration gen), and `tsconfig.config.json` (tooling).
- **ESLint / Prettier**: config in `.eslintrc.json` and `.prettierrc`. A pre-commit hook formats and lint-checks via Husky.

---

## Release

1. Bump the version in `package.json`.
2. Tag the commit: `git tag v<version>`
3. Push with tags: `git push origin main --tags`

The GitHub Actions release workflow handles npm publish and GitHub Release creation automatically.
