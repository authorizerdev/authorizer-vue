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
			<div class="styled-form-group">
				<label class="form-input-label" for="authorizer-magic-link-login-email"
					><span>* </span>Email</label
				>
				<input
					id="authorizer-magic-link-login-email"
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
import globalContext from '../state/globalContext';
import { StyledButton } from '../styledComponents/index';
import { MessageType, ButtonAppearance } from '../constants/index';
import { isValidEmail } from '../utils/common';
import Message from './Message.vue';
export default {
	name: 'AuthorizerMagicLinkLogin',
	props: ['onMagicLinkLogin', 'urlProps', 'roles'],
	components: {
		'styled-button': StyledButton,
		message: Message,
	},
	setup({ onMagicLinkLogin, urlProps, roles }) {
		const { authorizerRef } = { ...toRefs(globalContext) };
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
				const data = {
					email: formData.email,
					state: urlProps.state || '',
					redirect_uri: urlProps.redirect_uri || '',
				};
				if (roles && roles.length) {
					data.roles = roles;
				}
				const res = await authorizerRef.value.magicLinkLogin(data);
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
