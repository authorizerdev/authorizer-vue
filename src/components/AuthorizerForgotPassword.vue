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

<script>
import { computed, reactive, toRefs } from 'vue';
import globalConfig from '../state/globalConfig';
import globalState from '../state/globalState';
import { MessageType, ButtonAppearance, Views } from '../constants/index';
import Message from './Message.vue';
import {
	StyledButton,
	StyledFormGroup,
	StyledFooter,
	StyledLink,
} from '../styles/index';
import { isValidEmail } from '../utils/common';
export default {
	name: 'AuthorizerForgotPassword',
	props: ['setView', 'onForgotPassword', 'urlProps'],
	components: {
		'styled-button': StyledButton,
		'styled-form-group': StyledFormGroup,
		'styled-footer': StyledFooter,
		'styled-link': StyledLink,
		message: Message,
	},
	setup({ setView, onForgotPassword, urlProps }) {
		const config = { ...toRefs(globalConfig) };
		const { authorizerRef } = { ...toRefs(globalState) };
		const componentState = reactive({
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
					email: componentState.email,
					state: urlProps.state || '',
					redirect_uri:
						urlProps.redirect_uri ||
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
			} catch (error) {
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
