<template>
	<styled-message-wrapper :type="type">
		<styled-flex alignItems="center" justifyContent="space-between">
			<div :style="{ flex: 1 }">{{ text }}</div>
			<span v-if="onClose" :style="{ cursor: 'pointer' }" @click="onClose">
				<close height="10px" width="10px" />
			</span>
		</styled-flex>
	</styled-message-wrapper>
</template>

<script>
import { StyledMessageWrapper, StyledFlex } from '../styles/index';
import Close from '../icons/Close.vue';
import { capitalizeFirstLetter } from '../utils/common';
export default {
	name: 'Message',
	props: ['type', 'text', 'onClose'],
	components: {
		'styled-message-wrapper': StyledMessageWrapper,
		'styled-flex': StyledFlex,
		close: Close,
	},
	setup({ type, text, onClose }) {
		return {
			type,
			text: capitalizeFirstLetter(text),
			onClose,
		};
	},
};
</script>

<style scoped></style>
