'use strict'

const postcss = require('postcss')
const selectorConverter = require('./lib/selector-converter')

module.exports = postcss.plugin('postcss-css-to-bem-css', opts => {
  return root => {
    root.walkRules(rule => {
      rule.selector = selectorConverter(rule.selector, opts)
    })
  }
})
