const path = require('path')
const fs = require('fs-extra')
const express = require('express')
const serverRenderer = require('vue-server-renderer')
const createApp = require('../dist/ssr')

// const templatePath = path.join(__dirname, '../template/index.server.html')
// const template = fs.readFileSync(templatePath, 'utf-8')

const server = express()
const renderer = serverRenderer.createRenderer({ template: '<!--vue-ssr-outlet-->'})

module.exports = function ({
  ssrConfig,
  staticDirectory
}) {
  const entryServer = context => {
    const url = context.url

    ssrConfig.data.url = url
    ssrConfig.el = "#app"

    return new Promise((resolve, reject) => {
      const { app, router } = createApp(ssrConfig)
      const meta = app.$meta()
      context.meta = meta

      router.push(url)
      router.onReady(() => {
        const matchedComponents = router.getMatchedComponents()

        if (!matchedComponents.length) {
          return reject({ code: 404 })
        }

        resolve(app)
      }, reject)
    })
  }

  server.use('/assets', express.static(path.join(staticDirectory, 'assets')))

  server.get('*', async (req, res) => {
    if (req.path === '/favicon.ico') {
      return res.end()
    }

    const context = { url: req.url }
    const app = await entryServer(context)
    const renderStream = renderer.renderToStream(app)

    // render to file system
    const html = []
    const isIndex = req.path === '/'
    const dest = path.join(staticDirectory, (isIndex ? '' : req.path) + '/index.html')

    res.writeHead(200, {
      'Content-Type': 'text/html'
    })

    renderStream.once('data', () => {
      const {
        title, htmlAttrs, bodyAttrs, link, style, script, noscript, meta
      } = context.meta.inject()

      const arr = [title, link, style, script, noscript, meta]
      const content = `<!doctype html>
<html data-vue-meta-server-rendered ${htmlAttrs.text()}>
  <head>
    ${arr.map(it => it.text()).join('')}
    <link rel="stylesheet" href="/assets/bundle.css" />
  </head>
  <body ${bodyAttrs.text()}>`

      html.push(content)
      res.write(content)
    })

    renderStream.on('data', chunk => {
      html.push(chunk)
      res.write(chunk)
    })

    renderStream.on('end', async () => {
      const content = `
    <script src="/assets/bundle.js"></script>
    <script src="/assets/pageInfo.js"></script>
  </body>
</html>`

      html.push(content)
      res.end(content)

      await fs.createFile(dest)
      await fs.writeFile(dest, html.join(''))
    })

    renderStream.on('error', (error) => {
      console.log(error)
      res.status(500).end(`<pre>${error.stack}</pre>`)
    })
  })

  server.listen(1126)
}
