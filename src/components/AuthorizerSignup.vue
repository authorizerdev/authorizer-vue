<template>
	<template v-if="successMessage">
		<message :type="MessageType.Success" :text="successMessage" />
	</template>
	<template v-else>
		<template v-if="error">
			<message :type="MessageType.Error" :text="error" @close="onErrorClose" />
		</template>
		<form @submit.prevent="onSubmit">
			<!-- Email -->
			<div class="styled-form-group" :hasError="emailError">
				<label class="form-input-label" for=""><span>* </span>Email</label>
				<input
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
			<div class="styled-form-group" :hasError="passwordError">
				<label class="form-input-label" for=""><span>* </span>Password</label>
				<input
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

			<!-- confirm password -->
			<div class="styled-form-group" :hasError="confirmPasswordError">
				<label class="form-input-label" for=""
					><span>* </span>Confirm Password</label
				>
				<input
					:class="`form-input-field ${
						confirmPasswordError ? 'input-error-content' : null
					}`"
					placeholder="********"
					type="password"
					v-model="confirmPassword"
				/>
				<div v-if="confirmPasswordError" class="form-input-error">
					{{ confirmPasswordError }}
				</div>
			</div>
			<template v-if="config.is_strong_password_enabled.value">
				<password-strength-indicator
					:value="password"
					:setDisableButton="setDisableButton"
				/>
				<br />
			</template>
			<styled-button
				:appearance="ButtonAppearance.Primary"
				:disabled="
					emailError ||
					passwordError ||
					confirmPasswordError ||
					!email ||
					!password ||
					!confirmPassword ||
					loading ||
					disableSignupButton
				"
			>
				<template v-if="loading">Processing ...</template>
				<template v-else>Sign Up</template>
			</styled-button>
		</form>
		<template v-if="setView">
			<styled-footer>
				<div>
					Already have an account?
					<styled-link @click="() => setView(Views.Login)">Log In</styled-link>
				</div>
			</styled-footer>
		</template>
	</template>
</template>

<script>
import { reactive, toRefs, computed } from 'vue';
import globalConfig from '../state/globalConfig';
import globalState from '../state/globalState';
import {
	StyledButton,
	StyledFooter,
	StyledLink,
} from '../styledComponents/index';
import { Views, MessageType, ButtonAppearance } from '../constants/index';
import { isValidEmail } from '../utils/common';
import Message from './Message.vue';
import PasswordStrengthIndicator from './PasswordStrengthIndicator.vue';
export default {
	name: 'AuthorizerSignup',
	props: ['setView', 'onSignup', 'urlProps', 'roles'],
	components: {
		'password-strength-indicator': PasswordStrengthIndicator,
		'styled-button': StyledButton,
		'styled-footer': StyledFooter,
		'styled-link': StyledLink,
		message: Message,
	},
	setup({ setView, onSignup, urlProps, roles }) {
		const config = { ...toRefs(globalConfig) };
		const { setAuthData, authorizerRef } = { ...toRefs(globalState) };
		const componentState = reactive({
			error: null,
			successMessage: null,
			loading: false,
			disableSignupButton: false,
		});
		const formData = reactive({
			email: null,
			password: null,
			confirmPassword: null,
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
			if (
				formData.password &&
				formData.confirmPassword &&
				formData.confirmPassword !== formData.password
			) {
				return `Password and confirm passwords don't match`;
			}
		});
		const confirmPasswordError = computed(() => {
			if (formData.confirmPassword === '') {
				return 'Confirm password is required';
			}
			if (
				formData.password &&
				formData.confirmPassword &&
				formData.confirmPassword !== formData.password
			) {
				return `Password and confirm passwords don't match`;
			}
		});
		const onSubmit = async () => {
			try {
				componentState.loading = true;
				const data = {
					email: formData.email,
					password: formData.password,
					confirm_password: formData.confirmPassword,
				};
				if (urlProps.scope) {
					data.scope = urlProps.scope;
				}
				if (urlProps.roles) {
					data.roles = urlProps.roles;
				}
				if (urlProps.redirect_uri) {
					data.redirect_uri = urlProps.redirect_uri;
				}
				if (urlProps.state) {
					data.state = urlProps.state;
				}
				if (roles && roles.length) {
					data.roles;
				}
				const res = await authorizerRef.value.signup(data);
				if (res) {
					componentState.error = null;
					if (res.access_token) {
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
					} else {
						componentState.error = null;
						componentState.successMessage = res?.message ? res.message : null;
					}
					if (onSignup) {
						onSignup(res);
					}
				}
			} catch (error) {
				componentState.loading = false;
				componentState.error = error.message;
			}
		};
		const onErrorClose = () => {
			componentState.error = null;
		};
		const setDisableButton = (value) => {
			componentState.disableSignupButton = value;
		};
		return {
			...toRefs(componentState),
			...toRefs(formData),
			config,
			onSubmit,
			onErrorClose,
			MessageType,
			ButtonAppearance,
			Views,
			emailError,
			passwordError,
			confirmPasswordError,
			setDisableButton,
			setView,
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
