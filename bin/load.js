const path = require('path')
const fs = require('fs-extra')
const globby = require('globby')
const yaml = require('js-yaml')

const bundle = require('../lib/bundle')
const compileVue = require('../lib/md2vue')
const getMetadata = require('../lib/metadata')

const cwd = process.cwd()
const spinner = require('ora')('Loading unicorns')
const configFile = path.resolve(cwd, './vmdoc.yml')

const {
  mode,
  output,
  locales
} = yaml.safeLoad(fs.readFileSync(configFile, 'utf8'))

const routerMode = mode
const outputDirectory = path.resolve(cwd, output)

// TODO
buildFromLocale(locales[0])
  .catch(e => console.log(e))

async function buildFromLocale ({
  name = 'zh-CN',
  text = '中文',
  title = 'vmDoc', 
  links = [],
  groups = [],
  docs = []
}) {
  // const language = name
  spinner.start('Task starts...')

  // name -> text(title)
  const cateMap = groups.reduce((acc, { text, name }) => {
    acc[name] = text
    return acc
  }, {})

  // group -> page[]
  const pageMap = await traversFiles({
    glob: docs,
    categories: Object.keys(cateMap)
  })

  const routers = []
  const sideNavs = []

  for (let cateName of Object.keys(pageMap)) {
    const cateList = []

    for (let page of pageMap[cateName]) {
      if (page) {
        const { component, path, title } = page

        if (routers.length === 0) {
          routers.push(`{ path: "/", redirect: "${path}" }`)
        }

        cateList.push({ title, path })
        routers.push(`{ path: "${path}", component: (${component}) }`)
      }
    }

    sideNavs.push({
      // group title
      text: cateMap[cateName],
      // info of detail pages
      pages: cateList
    })
  }

  routers.push(`{ path: "*", redirect: "/" }`)

  const initialState = {
    links,
    groups: sideNavs
  }

  const template = await fs.readFile(
    abs('../template/app.html'),
    'utf-8'
  )

  const code = bundle({
    template,
    routers,
    routerMode,
    initialState
  })

  await fs.ensureDir(outputDirectory)
  await fs.writeFile(`${outputDirectory}/pageInfo.js`, code)
  await fs.copy(abs('../dist/'), outputDirectory)
  await fs.copy(abs('../template/index.html'), `${outputDirectory}/index.html`)

  spinner.succeed('Task completed!')
}

async function traversFiles ({
  glob,
  categories
}) {
  const map = {}

  for (file of await globby(glob)) {
    const {
      route,
      index,
      title,
      markdown,
      category,
      componentName
    } = await getMetadata(file)

    // category not specified
    if (!category) {
      spinner.warn(`Skip ${file}: group not specified!`)
      continue
    }

    // category not listed in config file
    if (categories.includes(category) === false) {
      spinner.warn(
        `Skip ${file}: group \`${category}\` is not included ` +
        `in configuration!`
      )
      continue
    }

    const component = await compileVue({ markdown, componentName, title })

    map[category] = map[category] || []
    map[category][index] = {
      title,
      component,
      path: route
    }
  }

  return map
}

/**
 * absolute path to this file
 */
function abs (arg) {
  return path.resolve(__dirname, arg)
}
