---
title: How to use
route: /usage/api
---

# How to use

API is simple, so just see the code below:

```js
import md2vue from 'md2vue'

// your markdown text
const sourceCode = `...`

// configuration object
const config = {
  target: 'js',
  componentName: 'common-comp',
  highlight: 'prism',
  customMarkups,
  documentInfo
}

// returns a promise
// the resolved value would be a string
const content = await md2vue(sourceCode, config)
```


## Explaination on config object

Referring to [build-doc.js](./build-doc.js) or [spec file](./test/md2vue.spec.js) is suggested.

### `.target`: String

Unless you specify this property to `js`, any other value will be treated as `vue`.

With this property beening `vue`, it means you will get .vue styled result. You can write the result to a single file with ".vue" extension for later use.

With this property beening `js`, you'll get a precompiled JavaScript result. You can write it to a ".js" file, and then do something like this:

```js
const MyComponent = require('common-comp.js')
Vue.use(MyComponent)
new Vue({
  el: '#app',
  template: '<common-comp />'
})
```

### `.componentName`: String

This property is required when the target is "js".

### `.highlight`: String | Function

You can specify this property to 'highlight.js' or 'prism'.

A function which accepts 2 arguments `code` and `language` is also accepted.

### `.customMarkups`: String | Function

Some custom markups you want to inject between the App block and source code block.

### `.documentInfo`: Object

Any stuff you want to provide for your vue component.


