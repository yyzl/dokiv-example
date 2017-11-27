const fs = require('fs-extra')
const path = require('path')
const yaml = require('js-yaml')
const globby = require('globby')
const { loadFront } = require('yaml-front-matter')
const md2vue = require('md2vue')
const UglifyJS = require('uglify-js')
const Prepack = require("prepack")
const ora = require('ora')
const spinner = ora('Loading unicorns')

const cwd = process.cwd()
const configFile = path.resolve(cwd, './vmdoc.yml')

const { locales, output } = yaml.safeLoad(fs.readFileSync(configFile, 'utf8'))
const outputDirectory = path.resolve(cwd, output)

// TODO
// mutil locales??
parseLocaleConfig(locales[0]).catch(e => console.log(e))

async function parseLocaleConfig ({
  name = 'zh-CN',
  text = '中文',
  title = 'vmDoc', 
  links = [],
  groups = [],
  docs = []
}) {
  spinner.start('Task starts...')

  const language = name

  const categories = groups.reduce((acc, { text, name }) => {
    acc[name] = { name, text, pages: []}
    return acc
  }, {})

  for (file of await globby(docs)) {
    const {
      markdown,
      category,
      route,
      index,
      title,
      componentName
    } = await extractMetadata(file)

    // category not specified
    if (!category) {
      console.log(`Skip ${file}: group not specified!`)
      continue
    }

    // category not listed in config file
    if (category in categories === false) {
      console.log(
        `Skip ${file}: group \`${category}\` is not included ` +
        `in configuration!`
      )
      continue
    }

    const categoryPages = categories[category].pages
    categoryPages[index] = {
      title,
      path: route,
      component: await compileVue({ markdown, componentName, title })
    }
  }

  const routers = []
  const sideNavs = []

  for (let key of Object.keys(categories)) {
    const { pages, name, text } = categories[key]
    const cateList = []

    for (let page of pages) {
      if (page) {
        const { component, path, title } = page

        if (routers.length === 0) {
          routers.push(`{ path: "/", redirect: "${path}" }`)
        }
        routers.push(`{ path: "${path}", component: (${component}) }`)
        cateList.push({ title, path })
      }
    }

    sideNavs.push({
      text,
      pages: cateList
    })
  }
  
  routers.push(`{ path: "*", redirect: "/" }`)

  const templateLoc = abs('../template/app.html')
  const template = await fs.readFile(templateLoc, 'utf-8')
  const data = { groups: sideNavs, links }
  const source = `(function (){
var template = ${JSON.stringify(template)};
var routes = [${routers.join(',\n')}];
myapp = createApp({
  el: "#app",
  // mode: "history",
  routes: routes,
  template: template,
  data: ${JSON.stringify(data)}
});
}());
`
  const { code } = UglifyJS.minify(source)

  await fs.ensureDir(outputDirectory)
  await fs.writeFile(`${outputDirectory}/pageInfo.js`, code)
  await fs.copy(abs('../dist/'), outputDirectory)
  await fs.copy(abs('../template/index.html'), `${outputDirectory}/index.html`)

  spinner.succeed('Task completed!')
}

/**
 * compile markdown to precompiled vue component
 */
async function compileVue ({
  markdown,
  componentName,
  title
}) {
  let id = 0
  const rawComponent = await md2vue(markdown, {
    target: 'js',
    componentName,
    highlight: 'prism',
    customMarkups () {
      const uid = `${componentName}-${id++}`
      return `<input id="${uid}" type="checkbox" /><label for="${uid}"></label>`
    },
    documentInfo: {
      // eslin-disale-next-line
      metaInfo: new Function(`return { title: "${title}" }`)
    }
  })
  
  const { code } = Prepack.prepack(rawComponent)

  return `(function(){
var ${componentName} = null;
${code};
return ${componentName};
})()`
}

/**
 * extract front matters and document from markdown file
 */
async function extractMetadata (file, ext = 'md') {
  const markdownSource = await fs.readFile(file, 'utf-8')
  const metadata = loadFront(markdownSource, 'body')
  const { body, group, index, name, title } = metadata
  const pageName = name || path.basename(file, ext)
  const componentName = pascalCase(`${group}-${pageName}`)

  return {
    markdown: body,
    category: group,
    route: `/${group}/${pageName}`,
    index,
    title,
    componentName
  }
}

/**
 * my-comp => MyComp
 */
function pascalCase (name) {
  return kebabCase(name)
    .replace(/-([0-9a-zA-Z])/g, (m, g1) => g1.toUpperCase())
    .replace(/^[a-z]/, m => m.toUpperCase())
}

/**
 * MyComp => my-comp
 */
function kebabCase (name) {
  return name
    .replace(/^[A-Z]/, m => m.toLowerCase())
    .replace(
      /([0-9a-zA-Z])[\b\s]*([0-9A-Z])/g,
      (m, g1, g2) => `${g1}-${g2.toLowerCase()}`
    )
}

/**
 * absolute path to this file
 */
function abs (arg) {
  return path.resolve(__dirname, arg)
}
