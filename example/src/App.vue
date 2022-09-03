<template>
	<div :style="{ display: 'flex', justifyContent: 'center' }">
		<div
			:style="{
				width: '400px',
				margin: `10px auto`,
				border: `1px solid #D1D5DB`,
				padding: `25px 20px`,
				borderRadius: 5,
			}"
		>
			<authorizer-provider
				:config="{
					authorizerURL: 'http://localhost:8080',
				}"
				:onStateChangeCallback="stateChangeCallback"
			>
				<login />
			</authorizer-provider>
		</div>
	</div>
</template>

<script>
import Login from './views/Login.vue';
export default {
	components: {
		login: Login,
	},
	setup() {
		const stateChangeCallback = (state) => {
			console.log('state changes from client ==>> ', state);
		};
		return {
			stateChangeCallback,
		};
	},
};
</script>

<style scoped></style>
