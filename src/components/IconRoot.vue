<template>
	<svg :viewBox="viewBox" :width="width" :height="height" :style="style">
		<slot></slot>
	</svg>
</template>

<script>
import { computed } from 'vue';
export default {
	name: 'IconRoot',
	props: ['height', 'width', 'viewBox', 'style'],
	setup(props) {
		const rootStyle = { userSelect: 'none' };
		const composedStyle = computed(function () {
			return { ...rootStyle, ...props.style };
		});
		return {
			height: props?.height || 16,
			width: props?.width || 16,
			viewBox: props.viewBox,
			style: composedStyle,
		};
	},
};
</script>
