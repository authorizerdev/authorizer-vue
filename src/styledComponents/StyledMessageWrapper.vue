<template>
	<div class="styled-message-wrapper" :style="style">
		<slot></slot>
	</div>
</template>

<script lang="ts">
import { MessageType } from '../constants/index';

export default {
	name: 'StyledMessageWrapper',
	props: ['type'],
	setup(props) {
		return {
			...props,
			style: {
				'background-color':
					props.type === MessageType.Error
						? 'var(--authorizer-danger-color)'
						: 'var(--authorizer-success-color)',
			},
		};
	},
};
</script>

<style scoped>
@import '../styles/default.css';
</style>
