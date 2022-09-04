<template>
	<template v-if="otpData.isScreenVisible.value">
		<authorizer-verify-otp
			:setView="setView"
			:onLogin="onLogin"
			:email="otpData.email.value"
		/>
	</template>
	<template v-else>
		<div>
			<template v-if="error">
				<message
					:type="MessageType.Error"
					:text="error"
					@close="onErrorClose"
				/>
			</template>
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
					<template v-if="loading">Processing ...</template>
					<template v-else>Log In</template>
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
						<styled-link @click="() => setView(Views.Signup)"
							>Sign Up</styled-link
						>
					</div>
				</styled-footer>
			</template>
		</div>
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
import globalState from '../state/globalState';
import { validateEmail } from '../utils/common';
import AuthorizerVerifyOtp from './AuthorizerVerifyOtp.vue';
import Message from './Message.vue';
import { MessageType } from '../constants/index';
export default {
	name: 'AuthorizerBasicAuthLogin',
	props: ['setView', 'onLogin', 'urlProps'],
	components: {
		'styled-button': StyledButton,
		'styled-form-group': StyledFormGroup,
		'styled-footer': StyledFooter,
		'styled-link': StyledLink,
		'authorizer-verify-otp': AuthorizerVerifyOtp,
		message: Message,
	},
	setup({ setView, onLogin, urlProps }) {
		const config = { ...toRefs(globalConfig) };
		const { setAuthData, authorizerRef } = { ...toRefs(globalState) };
		const componentState = reactive({
			loading: false,
			error: null,
		});
		const otpData = reactive({
			isScreenVisible: false,
			email: null,
		});
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
			if (formData.password === '') {
				return 'Password is required';
			}
		});
		const onErrorClose = () => {
			componentState.error = null;
		};
		const onSubmit = async () => {
			componentState.loading = true;
			try {
				const data = {
					email: formData.email,
					password: formData.password,
				};
				if (urlProps.scope) {
					data.scope = urlProps.scope;
				}
				const res = await authorizerRef.value.login(data);
				if (res && res?.should_show_otp_screen) {
					Object.assign(otpData, {
						isScreenVisible: true,
						email: data.email,
					});
					return;
				}
				if (res) {
					componentState.error = null;
					setAuthData.value({
						user: res.user || null,
						token: {
							access_token: res.access_token,
							expires_in: res.expires_in,
							refresh_token: res.refresh_token,
							id_token: res.id_token,
						},
						config,
						loading: false,
					});
				}
				if (onLogin) {
					onLogin(res);
				}
			} catch (error) {
				componentState.loading = false;
				componentState.error = error.message;
			}
		};
		return {
			...toRefs(formData),
			...toRefs(componentState),
			otpData: { ...toRefs(otpData) },
			emailError,
			passwordError,
			onSubmit,
			ButtonAppearance,
			setView,
			Views,
			config,
			MessageType,
			onErrorClose,
		};
	},
};
</script>

<style scoped></style>
