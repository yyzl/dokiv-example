const path = require('path')
const fs = require('fs-extra')
const { loadFront } = require('yaml-front-matter')

const { pascalCase } = require('./util')

module.exports = extractMetadata

/**
 * extract front matters and document from markdown file
 */
async function extractMetadata (file, ext = 'md') {
  const markdown = await fs.readFile(file, 'utf-8')

  const {
    body,
    group,
    index,
    name,
    title
  } = loadFront(markdown, 'body')

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
