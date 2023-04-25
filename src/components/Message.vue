<template>
	<styled-message-wrapper :type="type">
		<styled-flex align-items="center" justify-content="space-between">
			<div :style="{ flex: 1 }">{{ capitalizeFirstLetter(text) }}</div>
			<span v-if="onClose" :style="{ cursor: 'pointer' }" @click="onClose">
				<close />
			</span>
		</styled-flex>
	</styled-message-wrapper>
</template>

<script lang="ts">
import { StyledFlex, StyledMessageWrapper } from '../styledComponents/index';
import Close from '../icons/Close.vue';
import { capitalizeFirstLetter } from '../utils/common';
import { MessageType } from '../constants';
import type { PropType } from 'vue';
export default {
	name: 'Message',
	components: {
		'styled-message-wrapper': StyledMessageWrapper,
		'styled-flex': StyledFlex,
		close: Close
	},
	props: {
		type: {
			type: String,
			default: MessageType.Success
		},
		text: {
			type: String,
			default: ''
		},
		onClose: {
			type: Function as PropType<(arg: unknown) => void>,
			default: undefined
		}
	},
	setup() {
		return {
			capitalizeFirstLetter
		};
	}
};
</script>
