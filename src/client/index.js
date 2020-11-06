var App = require('./page/app.vue');
var Vue = require('vue');

new Vue({
	el: '#gydo',
	render: h => {
		return h(App, { props: { title: "Dashboard Rendering" } })
	}
});
