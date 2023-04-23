<template>
	<template v-if="successMessage">
		<message :type="MessageType.Success" :text="successMessage" />
	</template>
	<template v-else>
		<template v-if="error">
			<message :type="MessageType.Error" :text="error" @close="onErrorClose" />
		</template>
		<p :style="{ textAlign: 'center', margin: '10px 0px' }">
			Please enter your email address.
			<br />
			We will send you an email to reset your password.
		</p>
		<br />
		<form @submit.prevent="onSubmit">
			<!-- Email -->
			<div class="styled-form-group">
				<label class="form-input-label" for="authorizer-forgot-password-email"
					><span>* </span>Email</label
				>
				<input
					id="authorizer-forgot-password-email"
					:class="`form-input-field ${
						emailError ? 'input-error-content' : null
					}`"
					placeholder="eg. foo@bar.com"
					type="email"
					v-model="email"
				/>
				<div v-if="emailError" class="form-input-error">{{ emailError }}</div>
			</div>
			<br />
			<styled-button
				:appearance="ButtonAppearance.Primary"
				:disabled="emailError || !email"
			>
				<template v-if="loading">Processing ...</template>
				<template v-else>Send Email</template>
			</styled-button>
		</form>
		<template v-if="setView">
			<styled-footer>
				<div>
					Remember your password?
					<styled-link @click="() => setView(Views.Login)">Log In</styled-link>
				</div>
			</styled-footer>
		</template>
	</template>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from 'vue';
import globalConfig from '../state/globalConfig';
import globalContext from '../state/globalContext';
import { MessageType, ButtonAppearance, Views } from '../constants/index';
import Message from './Message.vue';
import {
	StyledButton,
	StyledFooter,
	StyledLink,
} from '../styledComponents/index';
import { isValidEmail } from '../utils/common';
export default {
	name: 'AuthorizerForgotPassword',
	props: ['setView', 'onForgotPassword', 'urlProps'],
	components: {
		'styled-button': StyledButton,
		'styled-footer': StyledFooter,
		'styled-link': StyledLink,
		message: Message,
	},
	setup({
		setView,
		onForgotPassword,
		urlProps,
	}: {
		setView?: (v: Views) => void;
		onForgotPassword?: (data: any) => void;
		urlProps?: Record<string, any>;
	}) {
		const config = toRefs(globalConfig);
		const { authorizerRef } = toRefs(globalContext);
		const componentState: {
			error: null | string;
			successMessage: null | string;
			loading: boolean;
			email: null | string;
		} = reactive({
			error: null,
			successMessage: null,
			loading: false,
			email: null,
		});
		const emailError = computed(() => {
			if (componentState.email === '') {
				return 'Email is required';
			}
			if (componentState.email && !isValidEmail(componentState.email)) {
				return 'Please enter valid email';
			}
		});
		const onSubmit = async () => {
			try {
				componentState.loading = true;
				const res = await authorizerRef.value.forgotPassword({
					email: componentState.email || '',
					state: urlProps?.state || '',
					redirect_uri:
						urlProps?.redirect_uri ||
						config.redirectURL.value ||
						window.location.origin,
				});
				componentState.loading = false;
				if (res && res.message) {
					componentState.error = null;
					componentState.successMessage = res.message;
				}
				if (onForgotPassword) {
					onForgotPassword(res);
				}
			} catch (error: any) {
				componentState.loading = false;
				componentState.error = error.message;
			}
		};
		const onErrorClose = () => {
			componentState.error = null;
		};
		return {
			...toRefs(componentState),
			onSubmit,
			onErrorClose,
			MessageType,
			ButtonAppearance,
			Views,
			setView,
			emailError,
		};
	},
};
</script>

<style scoped>
@import '../styles/default.css';
</style>
