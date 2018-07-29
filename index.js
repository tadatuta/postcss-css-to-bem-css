'use strict'

const postcss = require('postcss')
const selectorParser = require('postcss-selector-parser')
const bemNamingParse = require('@bem/sdk.naming.entity.parse')
const bemNamingPresets = require('@bem/sdk.naming.presets')
const { toCamelCase, toKebabCase } = require('./lib/helpers')

function getEntity (str, naming) {
  const entity = bemNamingParse(naming)(str)

  if (!entity) {
    console.warn('WARN! Entity was not parsed for', str)
    return undefined
  }

  if (entity.block === 'FAKE-BLOCK') {
    const partualEntity = entity.valueOf()
    delete partualEntity.block

    return partualEntity
  }

  return entity
}

function buildRebemSelector (entity) {
  let bemSelector = ''

  if (entity.block) {
    bemSelector += `:block(${ entity.block })`
  }

  if (entity.elem) {
    bemSelector += `:elem(${ entity.elem })`
  }

  if (entity.mod) {
    bemSelector += `:mod(${ entity.mod.name } ${ entity.mod.val })`
  }

  return bemSelector
}

const defaultNameTransform = {
  block: block => block,
  elem: elem => elem,
  modName: modName => modName,
  modVal: modVal => modVal
}

function buildSelectorByNaming (entity, namingScheme, nameTransforms) {
  const namingDelims = namingScheme.delims

  const transforms = {
    ...defaultNameTransform,
    ...nameTransforms
  }

  return '.' +
    (entity.block ? transforms.block(entity.block) : '') +
    (entity.elem ? namingDelims.elem + transforms.elem(entity.elem) : '') +
    (entity.mod ? namingDelims.mod.name + transforms.modName(entity.mod.name) : '') +
    (entity.mod && entity.mod.val !== true ? namingDelims.mod.val + transforms.modVal(entity.mod.val) : '')
}

function buildReactSelector (entity) {
  return buildSelectorByNaming(entity, bemNamingPresets.react, {
    block: toCamelCase,
    elem: toCamelCase
  })
}

function buildOriginSelector (entity) {
  return buildSelectorByNaming(entity, bemNamingPresets.origin, {
    block: toKebabCase,
    elem: toKebabCase
  })
}

function replaceSelector (selector, entity, buildSelector) {
  if (!entity) return

  selector.replaceWith(
    selectorParser.pseudo({ value: buildSelector(entity) })
  )
}

const builders = {
  buildSelectorByNaming,
  buildRebemSelector,
  buildReactSelector,
  buildOriginSelector
}

module.exports = postcss.plugin('postcss-css-to-bem-css', opts => {
  opts = opts || {}

  const naming = opts.naming || 'origin'
  const normalizedNaming = typeof naming === 'string'
    ? bemNamingPresets[naming]
    : naming

  const buildSelector = (typeof opts.buildSelector === 'string'
    ? builders[opts.buildSelector]
    : opts.buildSelector) || buildReactSelector

  return root => {
    root.walkRules(rule => {
      rule.selector = selectorParser(selectors => {
        selectors.walk(selector => {
          if (selector.type === 'class') {
            replaceSelector(selector, getEntity(selector.value, normalizedNaming), buildSelector)
          } else if (selector.type === 'tag' && selector.value.startsWith(normalizedNaming.delims.elem)) {
            replaceSelector(selector, getEntity('FAKE-BLOCK' + selector.value, normalizedNaming), buildSelector)
          }
        })
      }).processSync(rule.selector)
    })
  }
})

module.exports.builders = builders
