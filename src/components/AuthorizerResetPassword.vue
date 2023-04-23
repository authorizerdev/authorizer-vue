<template>
	<styled-wrapper>
		<template v-if="error">
			<message :type="MessageType.Error" :text="error" @close="onErrorClose" />
		</template>
		<form @submit.prevent="onSubmit">
			<!-- password -->
			<div class="styled-form-group" :hasError="passwordError">
				<label class="form-input-label" for="authorizer-reset-password"
					><span>* </span>Password</label
				>
				<input
					id="authorizer-reset-password"
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
				<label class="form-input-label" for="authorizer-reset-confirm-password"
					><span>* </span>Confirm Password</label
				>
				<input
					id="authorizer-reset-confirm-password"
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

<script lang="ts">
import { reactive, toRefs, computed } from 'vue';
import globalConfig from '../state/globalConfig';
import globalContext from '../state/globalContext';
import { StyledButton, StyledWrapper } from '../styledComponents/index';
import { MessageType, ButtonAppearance } from '../constants/index';
import Message from './Message.vue';
import PasswordStrengthIndicator from './PasswordStrengthIndicator.vue';
import { getSearchParams } from '../utils/url';
export default {
	name: 'AuthorizerResetPassword',
	props: ['onReset'],
	components: {
		'styled-wrapper': StyledWrapper,
		'styled-button': StyledButton,
		'password-strength-indicator': PasswordStrengthIndicator,
		message: Message,
	},
	setup({ onReset }: { onReset?: (data: any) => void }) {
		const { token, redirect_uri } = getSearchParams();
		const config = toRefs(globalConfig);
		const { authorizerRef } = toRefs(globalContext);
		const componentState: {
			error: null | string;
			loading: boolean;
			disableContinueButton: boolean;
		} = reactive({
			error: !token ? 'Invalid token' : null,
			loading: false,
			disableContinueButton: false,
		});
		const formData: {
			password: null | string;
			confirmPassword: null | string;
		} = reactive({
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
					password: formData.password || '',
					confirm_password: formData.confirmPassword || '',
				});
				componentState.loading = false;
				componentState.error = null;
				if (onReset) {
					onReset(res);
				} else {
					window.location.href =
						redirect_uri || config.redirectURL.value || window.location.origin;
				}
			} catch (error: any) {
				componentState.loading = false;
				componentState.error = error.message;
			}
		};
		const setDisableButton = (value: boolean) => {
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

<style scoped>
@import '../styles/default.css';
</style>
