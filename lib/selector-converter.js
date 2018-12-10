'use strict'

const selectorParser = require('postcss-selector-parser')
const bemNamingEntityParse = require('@bem/sdk.naming.entity.parse')
const bemNamingEntityStringify = require('@bem/sdk.naming.entity.stringify')
const bemNamingPresets = require('@bem/sdk.naming.presets')
const bemEntityNamingTransform = require('bem-naming-transformations')

function normalizeNaming (naming) {
  return typeof naming === 'string'
    ? bemNamingPresets[naming]
    : naming
}

module.exports = function (cssSelector, opts) {
  opts = opts || {}

  return selectorParser(selectors => {
    selectors.walkClasses(selector => {
      const entityName = bemNamingEntityParse(normalizeNaming(opts.sourceNaming || 'origin'))(selector.value)

      if (!entityName) {
        // TODO: proper debug
        console.warn(`WARN! ${ selector } was not parsed`)
        return
      }

      const transformedEntityName = bemEntityNamingTransform(entityName, {
        naming: opts.targetNaming,
        transforms: opts.transforms,
        blacklist: opts.blacklist,
        whitelist: opts.whitelist
      })

      const targetNaming = normalizeNaming(opts.targetNaming || 'react')

      const newSelector = opts.stringify
        ? opts.stringify(transformedEntityName, targetNaming)
        : '.' + bemNamingEntityStringify(targetNaming)(transformedEntityName)

      selector.replaceWith(
        selectorParser.pseudo({ value: newSelector })
      )
    })
  }).processSync(cssSelector)
}
