<template>
	<Wrapper :theme="theme">Authorizer Root Component</Wrapper>
</template>

<script>
import { Wrapper } from '../styles/styledComponents';
import { theme } from '../styles/theme';

export default {
	name: 'AuthorizerRoot',
	data() {
		return {
			theme,
		};
	},
	components: {
		Wrapper,
	},
};
</script>

<style scoped></style>
