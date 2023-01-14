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
				<styled-flex justifyContent="flex-start" alignItems="center">
					<input
						readOnly
						@click="eventHandler"
						@keydown="eventHandler"
						type="checkbox"
						:checked="hasSixChar"
					/>
					<div class="styled-check-box-label">At least 6 characters</div>
				</styled-flex>
				<styled-flex justifyContent="flex-start" alignItems="center">
					<input
						readOnly
						@click="eventHandler"
						@keydown="eventHandler"
						type="checkbox"
						:checked="hasLowerCase"
					/>
					<div class="styled-check-box-label">At least 1 lowercase letter</div>
				</styled-flex>
				<styled-flex justifyContent="flex-start" alignItems="center">
					<input
						readOnly
						@click="eventHandler"
						@keydown="eventHandler"
						type="checkbox"
						:checked="hasUpperCase"
					/>
					<div class="styled-check-box-label">At least 1 uppercase letter</div>
				</styled-flex>
				<styled-flex justifyContent="flex-start" alignItems="center">
					<input
						readOnly
						@click="eventHandler"
						@keydown="eventHandler"
						type="checkbox"
						:checked="hasNumericChar"
					/>
					<div class="styled-check-box-label">At least 1 numeric character</div>
				</styled-flex>
				<styled-flex justifyContent="flex-start" alignItems="center">
					<input
						readOnly
						@click="eventHandler"
						@keydown="eventHandler"
						type="checkbox"
						:checked="hasSpecialChar"
					/>
					<div class="styled-check-box-label">At least 1 special character</div>
				</styled-flex>
				<styled-flex justifyContent="flex-start" alignItems="center">
					<input
						readOnly
						@click="eventHandler"
						@keydown="eventHandler"
						type="checkbox"
						:checked="maxThirtySixChar"
					/>
					<div class="styled-check-box-label">Maximum 36 characters</div>
				</styled-flex>
			</styled-flex>
		</styled-password-strength-wrapper>
	</div>
</template>

<script>
import { reactive, toRefs, watch } from 'vue';
import {
	StyledFlex,
	StyledPasswordStrength,
	StyledPasswordStrengthWrapper,
} from '../styledComponents/index';
import { validatePassword } from '../utils/common';
export default {
	name: 'PasswordStrengthIndicator',
	props: ['value', 'setDisableButton'],
	components: {
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

<style scoped>
.styled-check-box-label {
	margin-left: 5px;
}
</style>
