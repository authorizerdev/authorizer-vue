<template>
	<div>
		<template v-if="successMessage">
			<message :type="MessageType.Success" :text="successMessage" @close="onSuccessClose" />
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
				<label class="form-input-label" for="authorizer-verify-otp"
					><span>* </span>OTP (One Time Password)</label
				>
				<input
					id="authorizer-verify-otp"
					v-model="otp"
					:class="`form-input-field ${otpError ? 'input-error-content' : null}`"
					placeholder="eg. AB123C"
					type="password"
				/>
				<div v-if="otpError" class="form-input-error">{{ otpError }}</div>
			</div>
			<br />
			<styled-button :appearance="ButtonAppearance.Primary" :disabled="!!otpError || !otp">
				<template v-if="loading">Processing ...</template>
				<template v-else>Submit</template>
			</styled-button>
		</form>
		<template v-if="setView">
			<styled-footer>
				<div v-if="sendingOtp" :style="{ marginBottom: '10px' }">Sending ...</div>
				<styled-link v-else :style="{ marginBottom: '10px' }" @click="resendOtp">
					Resend OTP
				</styled-link>
				<div v-if="config.is_sign_up_enabled.value">
					Don't have an account?
					<styled-link @click="() => setView(Views.Signup)">Sign Up</styled-link>
				</div>
			</styled-footer>
		</template>
	</div>
</template>

<script lang="ts">
import { computed, reactive, toRefs, type PropType } from 'vue';
import type { AuthToken, VerifyOtpInput } from '@authorizerdev/authorizer-js';
import globalConfig from '../state/globalConfig';
import globalContext from '../state/globalContext';
import { StyledButton, StyledFooter, StyledLink } from '../styledComponents/index';
import { isValidOtp } from '../utils/common';
import { MessageType, ButtonAppearance, Views } from '../constants/index';
import Message from './Message.vue';
import type { URLPropsType } from '../types';
export default {
	name: 'AuthorizerVerifyOtp',
	components: {
		'styled-button': StyledButton,
		'styled-footer': StyledFooter,
		'styled-link': StyledLink,
		message: Message
	},
	props: {
		setView: {
			type: Function as PropType<(arg: Views) => void>,
			default: (_v: Views) => undefined
		},
		onLogin: {
			type: Function as PropType<(arg: AuthToken | void) => void>,
			default: undefined
		},
		email: {
			type: String,
			required: true
		},
		urlProps: {
			type: Object as PropType<URLPropsType>,
			default: undefined
		}
	},
	setup(props) {
		const config = toRefs(globalConfig);
		const { setAuthData, authorizerRef } = toRefs(globalContext);
		const componentState: {
			error: null | string;
			successMessage: null | string;
			loading: boolean;
			sendingOtp: boolean;
			otp: null | string;
		} = reactive({
			error: null,
			successMessage: null,
			loading: false,
			sendingOtp: false,
			otp: null
		});
		const otpError = computed((): string | null => {
			if (componentState.otp === '') {
				return 'OTP is required';
			}
			if (componentState.otp && !isValidOtp(componentState.otp)) {
				return 'Please enter valid OTP';
			}
			return null;
		});
		const onSubmit = async () => {
			componentState.successMessage = null;
			try {
				componentState.loading = true;
				const data: VerifyOtpInput = {
					email: props.email,
					otp: componentState.otp || ''
				};
				if (props.urlProps?.state) {
					data.state = props.urlProps.state;
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
							id_token: res.id_token
						},
						config: globalConfig,
						loading: false
					});
				}
				if (props.onLogin) {
					props.onLogin(res);
				}
			} catch (error: unknown) {
				componentState.loading = false;
				componentState.error = error instanceof Error ? error.message : 'Internal error!';
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
					email: props.email
				});
				componentState.sendingOtp = false;
				if (res && res?.message) {
					componentState.error = null;
					componentState.successMessage = res.message;
					if (props.onLogin) {
						props.onLogin(res as AuthToken);
					}
				}
			} catch (error: unknown) {
				componentState.loading = false;
				componentState.error = error instanceof Error ? error.message : 'Internal error!';
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
			Views
		};
	}
};
</script>
<style scoped>
@import '../styles/default.css';
</style>
