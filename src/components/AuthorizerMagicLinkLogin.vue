<template>
	<div v-if="successMessage">
		<message :type="MessageType.Success" :text="successMessage" />
	</div>
	<div v-else>
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
					v-model="email"
					:class="`form-input-field ${emailError ? 'input-error-content' : null}`"
					placeholder="eg. foo@bar.com"
					type="email"
				/>
				<div v-if="emailError" class="form-input-error">{{ emailError }}</div>
			</div>
			<br />
			<styled-button
				:appearance="ButtonAppearance.Primary"
				:disabled="!email || !!emailError || loading"
			>
				<template v-if="loading">Processing ...</template>
				<template v-else>Send Email</template>
			</styled-button>
		</form>
	</div>
</template>

<script lang="ts">
import { reactive, toRefs, computed, type PropType } from 'vue';
import type { MagicLinkLoginInput } from '@authorizerdev/authorizer-js';
import globalContext from '../state/globalContext';
import { StyledButton } from '../styledComponents/index';
import { MessageType, ButtonAppearance } from '../constants/index';
import { isValidEmail } from '../utils/common';
import Message from './Message.vue';
import type { URLPropsType } from '../types';
export default {
	name: 'AuthorizerMagicLinkLogin',
	components: {
		'styled-button': StyledButton,
		message: Message
	},
	props: {
		onMagicLinkLogin: {
			type: Function as PropType<(arg: unknown) => void>,
			default: undefined
		},
		urlProps: {
			type: Object as PropType<URLPropsType>,
			default: undefined
		},
		roles: {
			type: Object as PropType<string[]>,
			default: undefined
		}
	},
	setup(props) {
		const { authorizerRef } = toRefs(globalContext);
		const componentState: {
			error: null | string;
			successMessage: null | string;
			loading: boolean;
		} = reactive({
			error: null,
			successMessage: null,
			loading: false
		});
		const formData: {
			email: null | string;
		} = reactive({
			email: null
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
		const onErrorClose = () => {
			componentState.error = null;
		};
		const onSubmit = async () => {
			try {
				componentState.loading = true;
				const data: MagicLinkLoginInput = {
					email: formData.email || '',
					state: props.urlProps?.state || '',
					redirect_uri: props.urlProps?.redirect_uri || ''
				};
				if (props.roles && props.roles.length) {
					data.roles = props.roles;
				}
				const res = await authorizerRef.value.magicLinkLogin(data);
				componentState.loading = false;
				if (res) {
					componentState.error = null;
					componentState.successMessage = res.message || ``;
					if (props.onMagicLinkLogin) {
						props.onMagicLinkLogin(res);
					}
				}
				if (props.urlProps?.redirect_uri) {
					setTimeout(() => {
						window.location.replace(props.urlProps?.redirect_uri || '');
					}, 3000);
				}
			} catch (error: unknown) {
				componentState.loading = false;
				componentState.error = error instanceof Error ? error.message : 'Internal error!';
			}
		};
		return {
			...toRefs(componentState),
			...toRefs(formData),
			emailError,
			MessageType,
			ButtonAppearance,
			onErrorClose,
			onSubmit
		};
	}
};
</script>

<style scoped>
@import '../styles/default.css';
</style>
