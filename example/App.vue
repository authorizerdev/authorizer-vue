<template>
	<div :style="{ display: 'flex', justifyContent: 'center' }">
		<div
			:style="{
				width: '400px',
				margin: `10px auto`,
				border: `1px solid #D1D5DB`,
				padding: `25px 20px`,
				'border-radius': `5px`,
			}"
		>
			<authorizer-provider
				:config="{
					authorizerURL: 'http://localhost:8080',
				}"
				:onStateChangeCallback="stateChangeCallback"
			>
				<router-view />
			</authorizer-provider>
		</div>
	</div>
</template>

<script lang="ts">
import AuthorizerProvider from '../src/components/AuthorizerProvider.vue';

export default {
	components: {
		'authorizer-provider': AuthorizerProvider,
	},
	setup() {
		const stateChangeCallback = (state: any) => {
			console.log('state changes from client ==>> ', state);
		};
		return {
			stateChangeCallback,
		};
	},
};
</script>

<style scoped></style>
