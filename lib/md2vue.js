const md2vue = require('md2vue')
const Prepack = require("prepack")

module.exports = compileVue

/**
 * compile markdown to precompiled vue component
 */
async function compileVue ({
  title,
  markdown,
  componentName
}) {
  let id = 0

  const customMarkups = () => {
    const uid = `${componentName}-${id++}`
    return `<input id="${uid}" type="checkbox" /><label for="${uid}"></label>`
  }

  const documentInfo = {
    // eslin-disale-next-line
    metaInfo: new Function(`return { title: "${title}" }`)
  }

  const raw = await md2vue(markdown, {
    target: 'js',
    highlight: 'prism',
    documentInfo,
    componentName,
    customMarkups
  })

  const { code } = Prepack.prepack(raw)

  return `
(function(){
  var ${componentName} = null;
  ${code};
  return ${componentName};
})()`
}