<template>
	<div class="styled-message-wrapper" :style="style">
		<slot></slot>
	</div>
</template>

<script>
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
.styled-message-wrapper {
	padding: 10px;
	color: white;
	border-radius: var(--authorizer-radius-card);
	margin: 10px 0px;
	font-size: var(--authorizer-fonts-small-text);
}
</style>
