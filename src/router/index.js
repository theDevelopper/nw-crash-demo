import Vue from 'vue';
import Router from 'vue-router';
import Launch from 'views/launch.vue';


Vue.use(Router);

export default new Router({
	routes: [
		{
			path: '/',
			name: 'launch',
			component: Launch,
			meta: { keepAlive: false },
		},
	],
});
