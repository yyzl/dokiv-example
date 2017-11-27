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

  const source = `(function (){
  var routes = [${routers.join(',\n')}];
  myapp = createApp({
    el: "#app",
    mode: "${routerMode}",
    routes: routes,
    render: ${renderFn},
    staticRenderFns: [${staticFns.join(', ')}],
    data: ${JSON.stringify(initialState)}
  });
}());
  `
   const { code } = UglifyJS.minify(source)
   return code
}
