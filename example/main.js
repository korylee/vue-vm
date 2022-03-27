import { createApp } from 'vue'
import vueCompositionApi from '@vue/composition-api'
import Vue from 'vue2'
import App from './App.vue'

// Vue.use(vueCompositionApi)
(createApp(App).mount('#app'))
// new Vue({
//   render: (h) => h(App),
// }).$mount('#app')