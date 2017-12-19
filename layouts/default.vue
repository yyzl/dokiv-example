<template>
  <div id="app">
    <nav class="navbar">
      <a class="navbar-brand" href="/">
        <icon type="layers" />
        <span class="name">md2vue</span>
      </a>
      <ul class="navbar-nav">
        <li v-for="link in links" :key="link.url">
          <a :href="link.url" :target="link.target || '_blank'">{{link.text}}</a>
        </li>
      </ul>
    </nav>

    <div class="container">
      <div class="sidebar">
        <ul class="group">
          <li
            v-if="group.pages.length"
            v-for="group in groups"
            :key="group.text"
            class="group-item"
          >
            <p class="group-title">
              <icon type="layers" />
              {{group.text}}
            </p>

            <ul class="doc">
              <li
                v-for="page in group.pages"
                :key="page.title"
                class="doc-item"
              >
                <router-link :to="page.path">{{page.title}}</router-link>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      <div class="content">
        <transition name="fade">
          <router-view></router-view>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
  const data = {
    links: [
      { text: 'Home', url: '/' },
      { text: 'GitHub', url: '//github.com/AngusFu/md2vu' },
      { text: 'Issue', url: '//github.com/AngusFu/md2vu/issues' }
    ],
    groups: [
      {
        name: 'intro',
        text: '简介',
        pages: [
          {
            title: 'Introduction',
            path: '/'
          }
        ]
      },
      {
        name: 'usage',
        text: '使用方法',
        pages: [
          {
            title: 'How to use',
            path: '/usage/api'
          },
          {
            title: 'Demo',
            path: '/usage/demo'
          }
        ]
      }
    ]
  }

  export default {
    data () {
      return data
    }
  }
</script>
