<template>
	<div>
		<h1 :style="{ textAlign: 'center' }">Welcome to Authorizer</h1>
		<br />
		<authorizer-root :on-login="onLogin" />
	</div>
</template>

<script lang="ts">
import { inject, watch } from 'vue';
import { useRouter } from 'vue-router';
import { AuthorizerRoot } from '../../src';
import type { AuthorizerContextOutputType } from '../../src/types';
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
			console.log('test login');
		};
		watch(
			token,
			(newvalue) => {
				if (newvalue) {
					console.log('access token ==>> ', token?.value?.access_token);
					router.push('/dashboard');
				}
			},
			{
				immediate: true
			}
		);
		config &&
			watch(config.is_basic_authentication_enabled, (newvalue, oldvalue) => {
				console.log('basic auth enabled (old value) ==>> ', oldvalue);
				console.log('basic auth enabled (new value) ==>> ', newvalue);
			});
		return {
			onLogin
		};
	}
};
</script>

<style scoped></style>
