// TODO
module.exports = {
  install (Vue) {
    Vue.component('vue-demo-tools', {
      template: `
<div class="vue-demo-tools">
  <input :id="id" v-model="checked" @change="togglePre" type="checkbox" tabindex="-1" aria-hidden="true"/>
  <label :for="id" aria-hidden="true"></label>
</div>
`,
      props: {
        index: {
          type: Number,
          required: true
        },
        page: {
          type: String,
          required: true
        }
      },
      data () {
        return { checked: false }
      },
      created () {
        const { page, index } = this
        this.id = `${page}-${index}`
      },
      methods: {
        togglePre () {
          const pre = this.$el.nextElementSibling
          if (pre) {
            pre.style.height = this.checked ? (pre.scrollHeight + 'px') : 0
          }
        }
      }
    })
  }
}
