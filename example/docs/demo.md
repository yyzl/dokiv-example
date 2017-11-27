---
group: usage
name: demo
title: Demo
index: 2
---

# Demo

All code blocks with language specified to `html` or `vue` are treated as Vue apps.

But What if you want to demonstrate that code block just for its sake? Simply specify the language to `xml`.

The following code in vue can be rendered into an real tiny vue app:

```html
<style>
  .wrapper input {
    width: 50px;
    text-align: center;
  }
</style>

<template>
  <div class="wrapper">
    <button @click="incr(-1)">-</button>
    <input type="text" readonly :value="count">
    <button @click="incr(+1)">+</button>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        count: 0
      }
    },
    methods: {
      incr(delta) {
        this.count += delta
      }
    }
  }
</script>
```

You can also leave out `<template>` tags, just like this:

```html
<style>
  button {
    font-size: 14px;
  }
</style>

<button @click="click">click me!</button>

<script>
  export default {
    methods: {
      click() {
        alert('clicked!')
      }
    }
  }
</script>
```

What if you only want the app without source code? Follow the code:

```xml
<style>
  button {
    font-size: 14px;
  }
</style>

<template demo-only>
  <button @click="click">click me!</button>
</template>

<script>
  export default {
    methods: {
      click() {
        alert('clicked!')
      }
    }
  }
</script>
```

Noticed the difference? Hmm, just wrap your template, append a `demo-only` attribute to it. So let's take a look:


```html
<style>
  button {
    font-size: 14px;
  }
</style>

<template demo-only>
  <button @click="click">click me!</button>
</template>

<script>
  export default {
    methods: {
      click() {
        alert('clicked!')
      }
    }
  }
</script>
```
