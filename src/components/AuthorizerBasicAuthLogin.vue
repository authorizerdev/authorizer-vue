<template>
	<form @submit.prevent="onSubmit">
		<!-- Email -->
		<div class="form-group" :class="{ error: emailError }">
			<label for="">Email</label>
			<input
				class="form-control"
				placeholder="Enter your username"
				type="email"
				v-model="email"
			/>
			<div class="pre-icon os-icon os-icon-user-male-circle"></div>
			<div v-if="emailError" class="error-msg">{{ emailError }}</div>
		</div>

		<!-- password -->
		<div class="form-group" :class="{ error: passwordError }">
			<label for="">Password</label>
			<input
				class="form-control"
				placeholder="Enter your password"
				type="password"
				v-model="password"
			/>
			<div class="pre-icon os-icon os-icon-fingerprint"></div>
			<div v-if="passwordError" class="error-msg">{{ passwordError }}</div>
		</div>
		<styled-button
			:appearance="ButtonAppearance.Primary"
			:disabled="emailError || passwordError || !email || !password"
		>
			Login
		</styled-button>
	</form>
</template>

<script>
import { reactive, toRefs, computed } from 'vue';
import { StyledButton } from '../styles/index';
import { ButtonAppearance } from '../constants/index';
export default {
	name: 'AuthorizerBasicAuthLogin',
	props: ['urlProps'],
	components: {
		'styled-button': StyledButton,
	},
	setup() {
		const formData = reactive({
			email: null,
			password: null,
		});
		const emailError = computed(() => {
			return formData.email === '' ? 'Email is required' : null;
		});
		const passwordError = computed(() => {
			return formData.password === '' ? 'Password is required' : null;
		});
		function onSubmit(values) {
			console.log('form submitted ==>> ', values);
		}
		return {
			...toRefs(formData),
			emailError,
			passwordError,
			onSubmit,
			ButtonAppearance,
		};
	},
};
</script>

<style scoped></style>
