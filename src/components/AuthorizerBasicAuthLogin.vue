<template>
	<div v-if="otpData.isScreenVisible.value">
		<authorizer-verify-otp
			:set-view="setView"
			:on-login="onLogin"
			:email="otpData.email.value"
			:url-props="urlProps"
		/>
	</div>
	<div v-else>
		<div>
			<template v-if="error">
				<message :type="MessageType.Error" :text="error" @close="onErrorClose" />
			</template>
			<form @submit.prevent="onSubmit">
				<!-- Email -->
				<div class="styled-form-group">
					<label class="form-input-label" for="authorizer-login-email"><span>* </span>Email</label>
					<input
						id="authorizer-login-email"
						v-model="email"
						:class="`form-input-field ${emailError ? 'input-error-content' : null}`"
						placeholder="eg. foo@bar.com"
						type="email"
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
						v-model="password"
						:class="`form-input-field ${passwordError ? 'input-error-content' : null}`"
						placeholder="********"
						type="password"
					/>
					<div v-if="passwordError" class="form-input-error">
						{{ passwordError }}
					</div>
				</div>
				<br />
				<styled-button
					:appearance="ButtonAppearance.Primary"
					:disabled="!!emailError || !!passwordError || !email || !password"
				>
					<template v-if="loading">Processing ...</template>
					<template v-else>Log In</template>
				</styled-button>
			</form>
			<template v-if="setView">
				<styled-footer>
					<styled-link
						:style="{ marginBottom: '10px' }"
						@click="() => setView(Views.ForgotPassword)"
					>
						Forgot Password?
					</styled-link>
					<div v-if="config.is_sign_up_enabled.value">
						Don't have an account?
						<styled-link @click="() => setView(Views.Signup)">Sign Up</styled-link>
					</div>
				</styled-footer>
			</template>
		</div>
	</div>
</template>

<script lang="ts">
import { reactive, toRefs, computed, type PropType } from 'vue';
import type { AuthToken, LoginInput } from '@authorizerdev/authorizer-js';
import { StyledButton, StyledFooter, StyledLink } from '../styledComponents/index';
import { ButtonAppearance, MessageType, Views } from '../constants/index';
import globalConfig from '../state/globalConfig';
import globalContext from '../state/globalContext';
import { isValidEmail } from '../utils/common';
import AuthorizerVerifyOtp from './AuthorizerVerifyOtp.vue';
import Message from './Message.vue';
export default {
	name: 'AuthorizerBasicAuthLogin',
	components: {
		'styled-button': StyledButton,
		'styled-footer': StyledFooter,
		'styled-link': StyledLink,
		'authorizer-verify-otp': AuthorizerVerifyOtp,
		message: Message
	},
	props: {
		setView: {
			type: Function,
			default: (_v: Views) => undefined
		},
		onLogin: {
			type: Function,
			default: (_data: AuthToken | void) => undefined
		},
		urlProps: {
			type: Object as PropType<{
				scope: string[] | undefined;
				state: string | undefined;
			}>,
			default: () => {
				return {
					scope: undefined,
					state: undefined
				};
			}
		},
		roles: {
			type: Object as PropType<string[] | undefined>,
			default: () => undefined
		}
	},
	setup(props) {
		const config = toRefs(globalConfig);
		const { setAuthData, authorizerRef } = toRefs(globalContext);
		const componentState: {
			loading: boolean;
			error: null | string;
		} = reactive({
			loading: false,
			error: null
		});
		const otpData: {
			isScreenVisible: boolean;
			email: null | string;
		} = reactive({
			isScreenVisible: false,
			email: null
		});
		const formData: {
			email: null | string;
			password: null | string;
		} = reactive({
			email: null,
			password: null
		});
		const emailError = computed((): string | null => {
			if (formData.email === '') {
				return 'Email is required';
			}
			if (formData.email && !isValidEmail(formData.email)) {
				return 'Please enter valid email';
			}
			return null;
		});
		const passwordError = computed((): string | null => {
			if (formData.password === '') {
				return 'Password is required';
			}
			return null;
		});
		const onErrorClose = () => {
			componentState.error = null;
		};
		const onSubmit = async () => {
			componentState.loading = true;
			try {
				const data: LoginInput = {
					email: formData.email || '',
					password: formData.password || ''
				};
				if (props.urlProps.scope) {
					data.scope = props.urlProps.scope;
				}
				if (props.urlProps.state) {
					data.state = props.urlProps.state;
				}
				if (props.roles && props.roles.length) {
					data.roles = props.roles;
				}
				const res = await authorizerRef.value.login(data);
				if (res && res?.should_show_otp_screen) {
					Object.assign(otpData, {
						isScreenVisible: true,
						email: data.email
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
		return {
			...toRefs(formData),
			...toRefs(componentState),
			otpData: toRefs(otpData),
			emailError,
			passwordError,
			onSubmit,
			ButtonAppearance,
			Views,
			config,
			MessageType,
			onErrorClose
		};
	}
};
</script>

<style scoped>
@import '../styles/default.css';
</style>
