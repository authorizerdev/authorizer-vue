<template>
	<div>
		<h1 :style="{ textAlign: 'center' }">Welcome to Authorizer</h1>
		<br />
		<authorizer-root :onLogin="onLogin" />
	</div>
</template>

<script lang="ts">
import AuthorizerRoot from '../../src/components/AuthorizerRoot.vue';
import { inject, watch } from 'vue';
import { useRouter } from 'vue-router';
export default {
	name: 'Login',
	components: {
		'authorizer-root': AuthorizerRoot
	},
	setup() {
		const useAuthorizer: any = inject('useAuthorizer');
		const { token } = useAuthorizer();
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
		// watch(user, function (newvalue, oldvalue) {
		// 	console.log('old value from client ==>> ', oldvalue);
		// 	console.log('new value from client ==>> ', newvalue);
		// });
		// watch(config.is_google_login_enabled, function (newvalue, oldvalue) {
		// 	console.log('old value from client ==>> ', oldvalue);
		// 	console.log('new value from client ==>> ', newvalue);
		// });
		return {
			onLogin
		};
	}
};
</script>

<style scoped></style>
