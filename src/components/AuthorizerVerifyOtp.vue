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
		<div class="styled-form-group" :hasError="otpError">
			<label class="form-input-label" for=""
				><span>* </span>OTP (One Time Password)</label
			>
			<input
				:class="`form-input-field ${otpError ? 'input-error-content' : null}`"
				placeholder="eg. AB123C"
				type="password"
				v-model="otp"
			/>
			<div v-if="otpError" class="form-input-error">{{ otpError }}</div>
		</div>
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
	StyledFooter,
	StyledLink,
} from '../styledComponents/index';
import { isValidOtp } from '../utils/common';
import { MessageType, ButtonAppearance, Views } from '../constants/index';
import Message from './Message.vue';
export default {
	name: 'AuthorizerVerifyOtp',
	props: ['setView', 'onLogin', 'email', 'urlProps'],
	components: {
		'styled-button': StyledButton,
		'styled-footer': StyledFooter,
		'styled-link': StyledLink,
		message: Message,
	},
	setup({ setView, onLogin, email, urlProps }) {
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
				const data = {
					email,
					otp: componentState.otp,
				};
				if (urlProps.state) {
					data.state = urlProps.state;
				}
				const res = await authorizerRef.value.verifyOtp(data);
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
