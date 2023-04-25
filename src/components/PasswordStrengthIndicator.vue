<template>
	<div>
		<styled-password-strength-wrapper>
			<styled-flex align-items="center" justify-content="center" wrap="nowrap">
				<styled-password-strength :strength="score > 2 ? 'weak' : 'default'" />
				<styled-password-strength :strength="score > 3 ? 'good' : 'default'" />
				<styled-password-strength :strength="score > 4 ? 'strong' : 'default'" />
				<styled-password-strength :strength="score > 5 ? 'veryStrong' : 'default'" />
				<div>{{ strength }}</div>
			</styled-flex>
			<p>
				<b>Criteria for a strong password:</b>
			</p>
			<styled-flex flex-direction="column">
				<styled-flex justify-content="flex-start" align-items="center">
					<input
						readOnly
						type="checkbox"
						:checked="hasSixChar"
						@click="eventHandler"
						@keydown="eventHandler"
					/>
					<div class="styled-check-box-label">At least 6 characters</div>
				</styled-flex>
				<styled-flex justify-content="flex-start" align-items="center">
					<input
						readOnly
						type="checkbox"
						:checked="hasLowerCase"
						@click="eventHandler"
						@keydown="eventHandler"
					/>
					<div class="styled-check-box-label">At least 1 lowercase letter</div>
				</styled-flex>
				<styled-flex justify-content="flex-start" align-items="center">
					<input
						readOnly
						type="checkbox"
						:checked="hasUpperCase"
						@click="eventHandler"
						@keydown="eventHandler"
					/>
					<div class="styled-check-box-label">At least 1 uppercase letter</div>
				</styled-flex>
				<styled-flex justify-content="flex-start" align-items="center">
					<input
						readOnly
						type="checkbox"
						:checked="hasNumericChar"
						@click="eventHandler"
						@keydown="eventHandler"
					/>
					<div class="styled-check-box-label">At least 1 numeric character</div>
				</styled-flex>
				<styled-flex justify-content="flex-start" align-items="center">
					<input
						readOnly
						type="checkbox"
						:checked="hasSpecialChar"
						@click="eventHandler"
						@keydown="eventHandler"
					/>
					<div class="styled-check-box-label">At least 1 special character</div>
				</styled-flex>
				<styled-flex justify-content="flex-start" align-items="center">
					<input
						readOnly
						type="checkbox"
						:checked="maxThirtySixChar"
						@click="eventHandler"
						@keydown="eventHandler"
					/>
					<div class="styled-check-box-label">Maximum 36 characters</div>
				</styled-flex>
			</styled-flex>
		</styled-password-strength-wrapper>
	</div>
</template>

<script lang="ts">
import { reactive, toRefs, watch, type PropType } from 'vue';
import {
	StyledFlex,
	StyledPasswordStrength,
	StyledPasswordStrengthWrapper
} from '../styledComponents/index';
import { validatePassword } from '../utils/common';
export default {
	name: 'PasswordStrengthIndicator',
	components: {
		'styled-password-strength-wrapper': StyledPasswordStrengthWrapper,
		'styled-password-strength': StyledPasswordStrength,
		'styled-flex': StyledFlex
	},
	props: {
		value: {
			type: String,
			default: ''
		},
		setDisableButton: {
			type: Function as PropType<(arg: boolean) => void>,
			default: (_status: boolean) => undefined
		}
	},
	setup(props) {
		const componentState: {
			strength: string;
			score: number;
			hasSixChar: boolean;
			hasLowerCase: boolean;
			hasNumericChar: boolean;
			hasSpecialChar: boolean;
			hasUpperCase: boolean;
			maxThirtySixChar: boolean;
		} = reactive({
			strength: '',
			score: 0,
			hasSixChar: false,
			hasLowerCase: false,
			hasNumericChar: false,
			hasSpecialChar: false,
			hasUpperCase: false,
			maxThirtySixChar: false
		});
		const eventHandler = (e: { preventDefault: () => void }) => {
			e.preventDefault();
		};
		watch(
			() => props.value,
			(newValue) => {
				const validationData = validatePassword(newValue);
				Object.assign(componentState, validationData);
				if (!validationData.isValid) {
					props.setDisableButton(true);
				} else {
					props.setDisableButton(false);
				}
			}
		);
		return {
			...toRefs(componentState),
			eventHandler
		};
	}
};
</script>

<style scoped>
@import '../styles/default.css';
</style>
