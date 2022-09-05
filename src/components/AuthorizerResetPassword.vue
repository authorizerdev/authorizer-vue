<template>
	<styled-wrapper>
		<template v-if="error">
			<message :type="MessageType.Error" :text="error" @close="onErrorClose" />
		</template>
		<form @submit.prevent="onSubmit">
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

			<!-- confirm password -->
			<styled-form-group :hasError="confirmPasswordError">
				<label class="form-input-label" for=""
					><span>* </span>Confirm Password</label
				>
				<input
					class="form-input-field"
					placeholder="********"
					type="password"
					v-model="confirmPassword"
				/>
				<div v-if="confirmPasswordError" class="form-input-error">
					{{ confirmPasswordError }}
				</div>
			</styled-form-group>
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
					passwordError ||
					confirmPasswordError ||
					!password ||
					!confirmPassword ||
					loading ||
					disableContinueButton
				"
			>
				<template v-if="loading">Processing ...</template>
				<template v-else>Continue</template>
			</styled-button>
		</form>
	</styled-wrapper>
</template>

<script>
import { reactive, toRefs, computed } from 'vue';
import globalConfig from '../state/globalConfig';
import globalState from '../state/globalState';
import { StyledWrapper, StyledButton, StyledFormGroup } from '../styles/index';
import { MessageType } from '../constants/index';
import { ButtonAppearance } from '../constants/index';
import Message from './Message.vue';
import PasswordStrengthIndicator from './PasswordStrengthIndicator.vue';
import { getSearchParams } from '../utils/url';
export default {
	name: 'AuthorizerResetPassword',
	props: ['onReset'],
	components: {
		'styled-wrapper': StyledWrapper,
		'styled-button': StyledButton,
		'styled-form-group': StyledFormGroup,
		'password-strength-indicator': PasswordStrengthIndicator,
		message: Message,
	},
	setup({ onReset }) {
		const { token, redirect_uri } = getSearchParams();
		const config = { ...toRefs(globalConfig) };
		const { authorizerRef } = { ...toRefs(globalState) };
		const componentState = reactive({
			error: !token ? 'Invalid token' : null,
			loading: false,
			disableContinueButton: false,
		});
		const formData = reactive({
			password: null,
			confirmPassword: null,
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
			componentState.loading = true;
			try {
				const res = await authorizerRef.value.resetPassword({
					token,
					password: formData.password,
					confirm_password: formData.confirmPassword,
				});
				componentState.loading = false;
				componentState.error = null;
				if (onReset) {
					onReset(res);
				} else {
					window.location.href =
						redirect_uri || config.redirectURL.value || window.location.origin;
				}
			} catch (error) {
				componentState.loading = false;
				componentState.error = error.message;
			}
		};
		const setDisableButton = (value) => {
			componentState.disableContinueButton = value;
		};
		const onErrorClose = () => {
			componentState.error = null;
		};
		return {
			...toRefs(componentState),
			...toRefs(formData),
			config,
			passwordError,
			confirmPasswordError,
			onSubmit,
			MessageType,
			ButtonAppearance,
			setDisableButton,
			onErrorClose,
		};
	},
};
</script>

<style scoped></style>
