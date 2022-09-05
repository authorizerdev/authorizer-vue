<template>
	<template v-if="successMessage">
		<message
			:type="MessageType.Success"
			:text="successMessage"
			@close="onSuccessClose"
		/>
	</template>
	<template v-if="error">
		<message :type="MessageType.Error" :text="error" @close="onErrorClose" />
	</template>
	<p :style="{ textAlign: 'center', margin: '10px 0px' }">
		Please enter the OTP you received on your email address.
	</p>
	<br />
	<form @submit.prevent="onSubmit">
		<!-- OTP -->
		<styled-form-group :hasError="otpError">
			<label class="form-input-label" for=""
				><span>* </span>OTP (One Time Password)</label
			>
			<input
				class="form-input-field"
				placeholder="eg. AB123C"
				type="password"
				v-model="otp"
			/>
			<div v-if="otpError" class="form-input-error">{{ otpError }}</div>
		</styled-form-group>
		<br />
		<styled-button
			:appearance="ButtonAppearance.Primary"
			:disabled="otpError || !otp"
		>
			<template v-if="loading">Processing ...</template>
			<template v-else>Submit</template>
		</styled-button>
	</form>
	<template v-if="setView">
		<styled-footer>
			<div v-if="sendingOtp" :style="{ marginBottom: '10px' }">Sending ...</div>
			<styled-link v-else @click="resendOtp" :style="{ marginBottom: '10px' }">
				Resend OTP
			</styled-link>
			<div v-if="config.is_sign_up_enabled.value">
				Don't have an account?
				<styled-link @click="() => setView(Views.Signup)">Sign Up</styled-link>
			</div>
		</styled-footer>
	</template>
</template>

<script>
import { computed, reactive, toRefs } from 'vue';
import globalConfig from '../state/globalConfig';
import globalState from '../state/globalState';
import {
	StyledButton,
	StyledFormGroup,
	StyledFooter,
	StyledLink,
} from '../styles/index';
import { isValidOtp } from '../utils/common';
import { MessageType } from '../constants/index';
import { ButtonAppearance } from '../constants/index';
import { Views } from '../constants/index';
import Message from './Message.vue';
export default {
	name: 'AuthorizerVerifyOtp',
	props: ['setView', 'onLogin', 'email'],
	components: {
		'styled-button': StyledButton,
		'styled-form-group': StyledFormGroup,
		'styled-footer': StyledFooter,
		'styled-link': StyledLink,
		message: Message,
	},
	setup({ setView, onLogin, email }) {
		const config = { ...toRefs(globalConfig) };
		const { setAuthData, authorizerRef } = { ...toRefs(globalState) };
		const componentState = reactive({
			error: null,
			successMessage: null,
			loading: false,
			sendingOtp: false,
			otp: null,
		});
		const otpError = computed(() => {
			if (componentState.otp === '') {
				return 'OTP is required';
			}
			if (componentState.otp && !isValidOtp(componentState.otp)) {
				return 'Please enter valid OTP';
			}
		});
		const onSubmit = async () => {
			componentState.successMessage = null;
			try {
				componentState.loading = true;
				const res = await authorizerRef.value.verifyOtp({
					email,
					otp: componentState.otp,
				});
				componentState.loading = false;
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
		const onSuccessClose = () => {
			componentState.successMessage = null;
		};
		const onErrorClose = () => {
			componentState.error = null;
		};
		const resendOtp = async () => {
			componentState.successMessage = null;
			try {
				componentState.sendingOtp = true;
				const res = await authorizerRef.value.resendOtp({
					email,
				});
				componentState.sendingOtp = false;
				if (res && res?.message) {
					componentState.error = null;
					componentState.successMessage = res.message;
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
			...toRefs(componentState),
			config,
			otpError,
			onSubmit,
			MessageType,
			onSuccessClose,
			onErrorClose,
			ButtonAppearance,
			resendOtp,
			Views,
			setView,
		};
	},
};
</script>

<style scoped></style>
