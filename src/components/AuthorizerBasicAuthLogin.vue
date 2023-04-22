<template>
	<template v-if="otpData.isScreenVisible.value">
		<authorizer-verify-otp
			:setView="setView"
			:onLogin="onLogin"
			:email="otpData.email.value"
			:urlProps="urlProps"
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
				<div class="styled-form-group">
					<label class="form-input-label" for="authorizer-login-email"
						><span>* </span>Email</label
					>
					<input
						id="authorizer-login-email"
						:class="`form-input-field ${
							emailError ? 'input-error-content' : null
						}`"
						placeholder="eg. foo@bar.com"
						type="email"
						v-model="email"
					/>
					<div v-if="emailError" class="form-input-error">{{ emailError }}</div>
				</div>

				<!-- password -->
				<div class="styled-form-group">
					<label class="form-input-label" for="authorizer-login-password"
						><span>* </span>Password</label
					>
					<input
						id="authorizer-login-password"
						:class="`form-input-field ${
							passwordError ? 'input-error-content' : null
						}`"
						placeholder="********"
						type="password"
						v-model="password"
					/>
					<div v-if="passwordError" class="form-input-error">
						{{ passwordError }}
					</div>
				</div>
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
	StyledFooter,
	StyledLink,
} from '../styledComponents/index';
import { ButtonAppearance, MessageType, Views } from '../constants/index';
import globalConfig from '../state/globalConfig';
import globalContext from '../state/globalContext';
import { isValidEmail } from '../utils/common';
import AuthorizerVerifyOtp from './AuthorizerVerifyOtp.vue';
import Message from './Message.vue';
export default {
	name: 'AuthorizerBasicAuthLogin',
	props: ['setView', 'onLogin', 'urlProps', 'roles'],
	components: {
		'styled-button': StyledButton,
		'styled-footer': StyledFooter,
		'styled-link': StyledLink,
		'authorizer-verify-otp': AuthorizerVerifyOtp,
		message: Message,
	},
	setup({ setView, onLogin, urlProps, roles }) {
		const config = { ...toRefs(globalConfig) };
		const { setAuthData, authorizerRef } = { ...toRefs(globalContext) };
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
			if (formData.email && !isValidEmail(formData.email)) {
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
				if (urlProps.state) {
					data.state = urlProps.state;
				}
				if (roles && roles.length) {
					data.roles = roles;
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
						config: globalConfig,
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
			urlProps,
		};
	},
};
</script>

<style scoped>
.styled-form-group {
	width: 100%;
	border: 0px;
	background-color: var(--authorizer-white-color);
	padding: 0 0 15px;
}
.form-input-label {
	padding: 2.5px;
}
.form-input-label > span {
	color: var(--authorizer-danger-color);
}
.form-input-field {
	width: 100%;
	margin-top: 5px;
	padding: 10px;
	display: flex;
	flex-direction: column;
	align-items: center;
	border-radius: var(--authorizer-radius-input);
	border: 1px;
	border-style: solid;
	border-color: var(--authorizer-text-color);
}
.input-error-content {
	border-color: var(--authorizer-danger-color) !important;
}
.input-error-content:hover {
	outline-color: var(--authorizer-danger-color);
}
.input-error-content:focus {
	outline-color: var(--authorizer-danger-color);
}
.form-input-error {
	font-size: 12px;
	font-weight: 400;
	color: red;
	border-color: var(--authorizer-danger-color);
}
</style>
