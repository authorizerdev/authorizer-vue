<template>
	<div>
		<styled-password-strength-wrapper>
			<styled-flex alignItems="center" justifyContent="center" wrap="nowrap">
				<styled-password-strength :strength="score > 2 ? 'weak' : 'default'" />
				<styled-password-strength :strength="score > 3 ? 'good' : 'default'" />
				<styled-password-strength
					:strength="score > 4 ? 'strong' : 'default'"
				/>
				<styled-password-strength
					:strength="score > 5 ? 'veryStrong' : 'default'"
				/>
				<div>{{ strength }}</div>
			</styled-flex>
			<p>
				<b>Criteria for a strong password:</b>
			</p>
			<styled-flex flexDirection="column">
				<styled-flex justifyContent="start" alignItems="center">
					<input
						readOnly
						@click="eventHandler"
						@keydown="eventHandler"
						type="checkbox"
						:checked="hasSixChar"
					/>
					<styled-check-box-label>At least 6 characters</styled-check-box-label>
				</styled-flex>
				<styled-flex justifyContent="start" alignItems="center">
					<input
						readOnly
						@click="eventHandler"
						@keydown="eventHandler"
						type="checkbox"
						:checked="hasLowerCase"
					/>
					<styled-check-box-label
						>At least 1 lowercase letter</styled-check-box-label
					>
				</styled-flex>
				<styled-flex justifyContent="start" alignItems="center">
					<input
						readOnly
						@click="eventHandler"
						@keydown="eventHandler"
						type="checkbox"
						:checked="hasUpperCase"
					/>
					<styled-check-box-label
						>At least 1 uppercase letter</styled-check-box-label
					>
				</styled-flex>
				<styled-flex justifyContent="start" alignItems="center">
					<input
						readOnly
						@click="eventHandler"
						@keydown="eventHandler"
						type="checkbox"
						:checked="hasNumericChar"
					/>
					<styled-check-box-label
						>At least 1 numeric character</styled-check-box-label
					>
				</styled-flex>
				<styled-flex justifyContent="start" alignItems="center">
					<input
						readOnly
						@click="eventHandler"
						@keydown="eventHandler"
						type="checkbox"
						:checked="hasSpecialChar"
					/>
					<styled-check-box-label
						>At least 1 special character</styled-check-box-label
					>
				</styled-flex>
				<styled-flex justifyContent="start" alignItems="center">
					<input
						readOnly
						@click="eventHandler"
						@keydown="eventHandler"
						type="checkbox"
						:checked="maxThirtySixChar"
					/>
					<styled-check-box-label>Maximum 36 characters</styled-check-box-label>
				</styled-flex>
			</styled-flex>
		</styled-password-strength-wrapper>
	</div>
</template>

<script>
import { reactive, toRefs, watch } from 'vue';
import {
	StyledCheckBoxLabel,
	StyledPasswordStrengthWrapper,
	StyledPasswordStrength,
	StyledFlex,
} from '../styles/index';
import { validatePassword } from '../utils/common';
export default {
	name: 'PasswordStrengthIndicator',
	props: ['value', 'setDisableButton'],
	components: {
		'styled-check-box-label': StyledCheckBoxLabel,
		'styled-password-strength-wrapper': StyledPasswordStrengthWrapper,
		'styled-password-strength': StyledPasswordStrength,
		'styled-flex': StyledFlex,
	},
	setup(props) {
		const { setDisableButton } = props;
		const componentState = reactive({
			strength: '',
			score: 0,
			hasSixChar: false,
			hasLowerCase: false,
			hasNumericChar: false,
			hasSpecialChar: false,
			hasUpperCase: false,
			maxThirtySixChar: false,
		});
		const eventHandler = (e) => {
			e.preventDefault();
		};
		watch(
			() => props.value,
			(newValue) => {
				const validationData = validatePassword(newValue);
				Object.assign(componentState, validationData);
				if (!validationData.isValid) {
					setDisableButton(true);
				} else {
					setDisableButton(false);
				}
			}
		);
		return {
			...toRefs(componentState),
			eventHandler,
		};
	},
};
</script>
