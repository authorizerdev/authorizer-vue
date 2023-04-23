<template>
	<div :style="style">
		<slot></slot>
	</div>
</template>

<script lang="ts">
export default {
	name: 'StyledFlex',
	props: ['flexDirection', 'alignItems', 'justifyContent', 'wrap', 'width'],
	setup(props) {
		return {
			...props,
			style: {
				display: 'flex',
				'flex-direction': props.flexDirection || 'row',
				'align-items': props.alignItems || 'center',
				'justify-content': props.justifyContent || 'center',
				'flex-wrap': props.wrap || 'wrap',
				width: props.width || '100%',
			},
		};
	},
};
</script>
