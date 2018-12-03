// import JS
import Vue from 'vue';
import { AsyncDataPlugin } from 'vue-async-data-2';
import App from 'App.vue';
import router from 'router';
import { info, warning, error } from 'lib/logger';


function formatComponentName(vm) {
	if (vm) {
		if (vm.$root === vm) {
			return 'root instance';
		}
		const name = vm._isVue ? vm.$options.name || vm.$options._componentTag : vm.name;
		return (
			(name ? `compo…nent <${name}>` : 'anonymous component') +
			(vm._isVue && vm.$options.__file ? ` at ${vm.$options.__file}` : '')
		);
	}

	return 'unknown instance';
}

Vue.config.errorHandler = function vueErrorHandler(err, vm, info) {
	error(`[Global Vue Error Handler]: Error in ${formatComponentName(vm)} in ${info}: ${err}`);
};

Vue.config.warnHandler = function vueWarningHandler(msg, vm, trace) {
	warning(`[Global Vue Warning]: Warning in ${formatComponentName(vm)}: ${msg}`);
	warning(trace);
};

// --------------------------
// Load App
// --------------------------

Vue.use(AsyncDataPlugin);

// eslint-disable-next-line no-new
new Vue({
	router,
	el: '#app',
	render: h => h(App),
});
