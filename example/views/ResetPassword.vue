<template>
	<div>
		<h1 :style="{ textAlign: 'center' }">Reset Password</h1>
		<br />
		<authorizer-reset-password />
	</div>
</template>

<script lang="ts">
import { AuthorizerResetPassword } from '../../src';

export default {
	name: 'ResetPassword',
	components: {
		'authorizer-reset-password': AuthorizerResetPassword
	}
};
</script>

<style scoped></style>
