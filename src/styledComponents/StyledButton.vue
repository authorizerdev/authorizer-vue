<template>
	<button :type="type" :disabled="disabled" :onClick="onClick">
		<slot></slot>
	</button>
</template>

<script>
import { ButtonAppearance } from '../constants/index';

export default {
	name: 'StyledButton',
	props: ['style', 'type', 'appearance', 'disabled', 'onClick'],
	setup(props) {
		return { ...props, ButtonAppearance };
	},
};
</script>
