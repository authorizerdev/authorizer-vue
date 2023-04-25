<template>
	<div class="styled-message-wrapper" :style="style">
		<slot></slot>
	</div>
</template>

<script lang="ts">
import type { CSSProperties } from 'vue';
import { MessageType } from '../constants/index';

export default {
	name: 'StyledMessageWrapper',
	props: {
		type: {
			type: String,
			default: MessageType.Success
		}
	},
	setup(props) {
		return {
			...props,
			style: {
				'background-color':
					props.type === MessageType.Error
						? 'var(--authorizer-danger-color)'
						: 'var(--authorizer-success-color)'
			} as CSSProperties
		};
	}
};
</script>

<style scoped>
@import '../styles/default.css';
</style>
