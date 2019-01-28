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

  const targetNaming = normalizeNaming(opts.targetNaming || 'react')

  function parseEntityName (str) {
    return bemNamingEntityParse(normalizeNaming(opts.sourceNaming || 'origin'))(str)
  }

  function transformEntityName (entityName) {
    return bemEntityNamingTransform(entityName, {
      naming: opts.targetNaming,
      transforms: opts.transforms,
      blacklist: opts.blacklist,
      whitelist: opts.whitelist
    })
  }

  function stringify (transformedEntityName, prefix = '', postfix = '') {
    return opts.stringify
      ? opts.stringify(transformedEntityName, targetNaming)
      : prefix + bemNamingEntityStringify(targetNaming)(transformedEntityName) + postfix
  }

  return selectorParser(selectors => {
    selectors.walkClasses(selector => {
      const entityName = parseEntityName(selector.value)

      if (!entityName) {
        // TODO: proper debug
        console.warn(`WARN! ${ selector } was not parsed`)
        return
      }

      const newSelector = stringify(transformEntityName(entityName), '.')

      selector.replaceWith(
        selectorParser.pseudo({ value: newSelector })
      )
    })

    selectors.walkAttributes(selector => {
      if (selector.attribute !== 'class') return

      const entityName = parseEntityName(selector.value)

      if (!entityName) {
        // TODO: proper debug
        console.warn(`WARN! ${ selector } was not parsed`)
        return
      }

      const newAttributeValue = `'${ stringify(transformEntityName(entityName)) }'`

      selector.replaceWith(
        selectorParser.attribute({
          attribute: 'class',
          operator: selector.operator,
          value: newAttributeValue
        })
      )
    })
  }).processSync(cssSelector)
}
