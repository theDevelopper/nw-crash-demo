<template>
	<div id="app-container" class="app-container hidden">
		<router-view></router-view>
	</div>
</template>

<script>
	import * as logger from 'lib/logger';

	export default {
		mounted() {
			logger.info('mounted App.vue');
		},

	};
</script>