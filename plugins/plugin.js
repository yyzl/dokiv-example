import objectAssign from 'object-assign'
import featherIcons from 'feather-icons/dist/icons.json'
Object.assign = objectAssign

export default { install }

function install(Vue) {
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
}
