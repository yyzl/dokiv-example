const UglifyJS = require('uglify-js')
const vueCompiler = require('vue-template-compiler')

module.exports = bundle

/**
 * generate bundle of pages
 */
function bundle ({
  routerMode = 'hash',
  template = '',
  routers = [],
  initialState = {}
}) {
  const {
    render,
    staticRenderFns
  } = vueCompiler.compile(template)

  const renderFn = `function () {${render}}`
  const staticFns = staticRenderFns.map(fn => `function() {${fn}}`)

  const routesString = `var routes = [${routers.join(',\n')}];`
  const appConfig = `
  el: "#app",
  mode: "${routerMode}",
  routes: routes,
  render: ${renderFn},
  staticRenderFns: [${staticFns.join(', ')}],
  data: ${JSON.stringify(initialState)}
`

  const clientSource = `
(function (){
  ${routesString}
  createApp({
    ${appConfig}
  });
}());
`
  const serverSource = `
${routesString}
module.exports = {
  ${appConfig}
};
`

   const { code } = UglifyJS.minify(clientSource)
   return {
    clientSource: code,
    serverSource
   }
}
