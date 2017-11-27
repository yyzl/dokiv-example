import objectAssign from 'object-assign'
import Vue from 'vue'
import VueRouter from 'vue-router'
import VueMeta from 'vue-meta'

import featherIcons from 'feather-icons/dist/icons.json'
import './style/index.css'

Vue.use(VueRouter)
Vue.use(VueMeta)

Object.assign = objectAssign
window.Vue = Vue

Vue.component('icon', {
  name: 'icon',
  props: {
    type: {
      type: String,
      required: true
    }
  },
  template: '<svg class="feather-icon" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="content"></svg>',
  computed: {
    content () {
      return featherIcons[this.type] || featherIcons['alert-triangle']
    }
  }
})

export default function createApp ({
  routes,
  mode = 'hash',
  linkActiveClass = 'active',
  el,
  template,
  data,
  render,
  staticRenderFns
}) {
  const routerConfig = {
    mode,
    routes,
    linkActiveClass,
    scrollBehavior: () => ({ x: 0, y: 0 })
  }

  const app = new Vue({
    template,
    router: new VueRouter(routerConfig),
    data () {
      return data || {}
    },
    render,
    staticRenderFns
  })

  return el ? app.$mount(el) : app
}

