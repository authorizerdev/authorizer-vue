<template>
	<div :style="style">
		<slot></slot>
	</div>
</template>

<script lang="ts">
import type { CSSProperties } from 'vue';

export default {
	name: 'StyledFlex',
	props: {
		flexDirection: {
			type: String,
			default: 'row'
		},
		alignItems: {
			type: String,
			default: 'center'
		},
		justifyContent: {
			type: String,
			default: 'center'
		},
		wrap: {
			type: String,
			default: 'wrap'
		},
		width: {
			type: String,
			default: '100%'
		}
	},
	setup(props) {
		return {
			...props,
			style: {
				display: 'flex',
				'flex-direction': props.flexDirection,
				'align-items': props.alignItems,
				'justify-content': props.justifyContent,
				'flex-wrap': props.wrap,
				width: props.width
			} as CSSProperties
		};
	}
};
</script>
