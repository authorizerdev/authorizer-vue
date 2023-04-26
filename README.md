# authorizer-vue

Authorizer Vue SDK allows you to implement authentication in your [Vue](https://vuejs.org/) application quickly. It also allows you to access the user profile.

Here is a quick guide on getting started with `@authorizerdev/authorizer-vue` package.

<!-- Todo: update code sandbox link -->

## Code Sandbox Demo: https://codesandbox.io/s/authorizer-vue-example-700l1h

## Step 1 - Create Instance

Get Authorizer URL by instantiating [Authorizer instance](/deployment) and configuring it with necessary [environment variables](/core/env).

## Step 2 - Install package

Install `@authorizerdev/authorizer-vue` library

```sh
npm i --save @authorizerdev/authorizer-vue
OR
yarn add @authorizerdev/authorizer-vue
```

## Step 3 - Configure Provider and use Authorizer Components

Authorizer comes with a [Provider](https://vuejs.org/api/composition-api-dependency-injection.html#provide) component that exposes a composable function to return a [reactive](https://vuejs.org/api/reactivity-core.html#reactive) state to it's children by using the `useAuthorizer` injection key, internally [toRefs](https://vuejs.org/api/reactivity-utilities.html#torefs) are used when returning the reactive state so that the consuming component(s) can destructure/spread the returned object without losing reactivity and each property could be watched to perform actions accordingly.

```vue
<template>
	<div :style="{ display: 'flex', justifyContent: 'center' }">
		<authorizer-provider
			:config="{
				authorizerURL: 'http://localhost:8080',
				redirectURL: window.location.origin,
				clientID: 'AUTHORIZER_CLIENT_ID'
			}"
			:onStateChangeCallback="stateChangeCallback"
		>
			<router-view />
		</authorizer-provider>
	</div>
</template>

<script lang="ts">
import { AuthorizerProvider } from '@authorizerdev/authorizer-vue';

export default {
	components: {
		'authorizer-provider': AuthorizerProvider
	},
	setup() {
		const stateChangeCallback = (state: any) => {
			console.log('state changed ==>> ', state);
		};
		return {
			stateChangeCallback
		};
	}
};
</script>
```

```vue
<template>
	<div>
		<h1 :style="{ textAlign: 'center' }">Welcome to Authorizer</h1>
		<br />
		<authorizer-root :onLogin="onLogin" />
	</div>
</template>

<script lang="ts">
import { AuthorizerRoot } from '@authorizerdev/authorizer-vue';
import { inject, watch } from 'vue';
import { useRouter } from 'vue-router';
export default {
	name: 'Login',
	components: {
		'authorizer-root': AuthorizerRoot
	},
	setup() {
		const useAuthorizer: any = inject('useAuthorizer');
		const { token, config } = useAuthorizer();
		const router = useRouter();
		const onLogin = () => {
			console.log('test login');
		};
		watch(
			token,
			(newvalue) => {
				if (newvalue) {
					console.log('access token ==>> ', token.value.access_token);
					router.push('/dashboard');
				}
			},
			{
				immediate: true
			}
		);
		watch(config.is_basic_authentication_enabled, function (newvalue, oldvalue) {
			console.log('basic auth enabled (old value) ==>> ', oldvalue);
			console.log('basic auth enabled (new value) ==>> ', newvalue);
		});
		return {
			onLogin
		};
	}
};
</script>
```

## Commands

### Local Development

### The recommended workflow is to run authorizer in one terminal:

```bash
npm run dev # or yarn dev
```

This starts a local dev-server with a sandbox environment.

```bash
npm run build # or yarn build
```

This uses Vite to build the project files to `/dist` and call `build:types` script.

```bash
npm run build:types # or yarn build:types
```

This generates TypeScript declaration files for our .vue files (using `vue-tsc`).

```bash
npm run typecheck # or yarn typecheck
```

This runs a typecheck against our Vue components to make sure there are no type errors (using `vue-tsc`).

## Configuration

### Typescript:

- Root tsconfig: `tsconfig.json` contains a reference to all the others tsconfig files.
- Components tsconfig: `tsconfig.app.json` will take care of compiling our Vue components inside `src/`.
- Build-types tsconfig: `tsconfig.build-types.json` will take care of generating the proper types declaration files of our Vue components inside `src/`.
- Tools tsconfig: `tsconfig.config.json` will take care of all our tooling configuration files (we only have vite at the moment).

### Vite:

- Vite requires a configuration to compile and bundle `.vue` to `.js` files that can be consumed through an npm module. It uses [rollup.js](https://rollupjs.org/) under the hood, check out the comments in `vite.config.ts` file in the project root to learn more about the configuarition details.

### Eslint:

- All required linting configurations are specified in the `.elsintrc.json` file in the project root, check the comments in each section to learn more about the configuarition details.

### Prettier:

- We have the `"usePrettierrc"` option set to true in the `eslint` configuration file which tells the `prettier-vue` plugin to use the Prettier configuration file `.prettierrc` in the project root directory and override any default settings.

### Husky:

- A pre-commit hook is set in `.husky/pre-commit` which formats the code and checks for any linting errors.
