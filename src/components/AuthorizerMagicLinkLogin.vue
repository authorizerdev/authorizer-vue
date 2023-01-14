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
				:disabled="!email || emailError || loading"
			>
				<template v-if="loading">Processing ...</template>
				<template v-else>Send Email</template>
			</styled-button>
		</form>
	</template>
</template>

<script>
import { reactive, toRefs, computed } from 'vue';
import globalState from '../state/globalState';
import { StyledFormGroup } from '../styles/index';
import { StyledButton } from '../styledComponents/index';
import { MessageType, ButtonAppearance } from '../constants/index';
import { isValidEmail } from '../utils/common';
import Message from './Message.vue';
export default {
	name: 'AuthorizerMagicLinkLogin',
	props: ['onMagicLinkLogin', 'urlProps'],
	components: {
		'styled-button': StyledButton,
		'styled-form-group': StyledFormGroup,
		message: Message,
	},
	setup({ onMagicLinkLogin, urlProps }) {
		const { authorizerRef } = { ...toRefs(globalState) };
		const componentState = reactive({
			error: null,
			successMessage: null,
			loading: false,
		});
		const formData = reactive({
			email: null,
		});
		const emailError = computed(() => {
			if (formData.email === '') {
				return 'Email is required';
			}
			if (formData.email && !isValidEmail(formData.email)) {
				return 'Please enter valid email';
			}
		});
		const onErrorClose = () => {
			componentState.error = null;
		};
		const onSubmit = async () => {
			try {
				componentState.loading = true;
				const res = await authorizerRef.value.magicLinkLogin({
					email: formData.email,
					state: urlProps.state || '',
					redirect_uri: urlProps.redirect_uri || '',
				});
				componentState.loading = false;
				if (res) {
					componentState.error = null;
					componentState.successMessage = res.message || ``;
					if (onMagicLinkLogin) {
						onMagicLinkLogin(res);
					}
				}
				if (urlProps.redirect_uri) {
					setTimeout(() => {
						window.location.replace(urlProps.redirect_uri);
					}, 3000);
				}
			} catch (error) {
				componentState.loading = false;
				componentState.error = error.message;
			}
		};
		return {
			...toRefs(componentState),
			...toRefs(formData),
			emailError,
			MessageType,
			ButtonAppearance,
			onErrorClose,
			onSubmit,
		};
	},
};
</script>
