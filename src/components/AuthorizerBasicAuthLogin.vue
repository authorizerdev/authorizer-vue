<template>
	<form @submit.prevent="onSubmit">
		<!-- Email -->
		<styled-form-group :hasError="emailError">
			<label class="form-input-label" for=""><span>* </span>Email</label>
			<input
				class="form-input-field"
				placeholder="eg. foo@bar.com"
				type="email"
				v-model="email"
			/>
			<div v-if="emailError" class="form-input-error">{{ emailError }}</div>
		</styled-form-group>

		<!-- password -->
		<styled-form-group :hasError="passwordError">
			<label class="form-input-label" for=""><span>* </span>Password</label>
			<input
				class="form-input-field"
				placeholder="********"
				type="password"
				v-model="password"
			/>
			<div v-if="passwordError" class="form-input-error">
				{{ passwordError }}
			</div>
		</styled-form-group>
		<br />
		<styled-button
			:appearance="ButtonAppearance.Primary"
			:disabled="emailError || passwordError || !email || !password"
		>
			Login
		</styled-button>
	</form>
	<template v-if="setView">
		<styled-footer>
			<styled-link
				@click="() => setView(Views.ForgotPassword)"
				:style="{ marginBottom: '10px' }"
			>
				Forgot Password?
			</styled-link>
			<div v-if="config.is_sign_up_enabled.value">
				Don't have an account?
				<styled-link @click="() => setView(Views.Signup)">Sign Up</styled-link>
			</div>
		</styled-footer>
	</template>
</template>

<script>
import { reactive, toRefs, computed } from 'vue';
import {
	StyledButton,
	StyledFormGroup,
	StyledFooter,
	StyledLink,
} from '../styles/index';
import { ButtonAppearance } from '../constants/index';
import { Views } from '../constants/index';
import globalConfig from '../state/globalConfig';
import { validateEmail } from '../utils/common';
export default {
	name: 'AuthorizerBasicAuthLogin',
	props: ['setView', 'onLogin', 'urlProps'],
	components: {
		'styled-button': StyledButton,
		'styled-form-group': StyledFormGroup,
		'styled-footer': StyledFooter,
		'styled-link': StyledLink,
	},
	setup({ setView, onLogin, urlProps }) {
		const formData = reactive({
			email: null,
			password: null,
		});
		const emailError = computed(() => {
			if (formData.email === '') {
				return 'Email is required';
			}
			if (formData.email && !validateEmail(formData.email)) {
				return 'Please enter valid email';
			}
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
			setView,
			Views,
			config: { ...toRefs(globalConfig) },
		};
	},
};
</script>

<style scoped></style>
