'use strict'

const postcss = require('postcss')
const plugin = require('./')
const nested = require('postcss-nested')

function run (input, output, opts) {
  return postcss([nested, plugin(opts)]).process(input)
    .then(result => {
      expect(result.css).toEqual(output)
      expect(result.warnings()).toHaveLength(0)
    })
}

function runRebem (input, output, opts) {
  return run(input, output, {
    targetNaming: 'origin',
    transforms: {
      block: block => `:block(${ block })`,
      elem: elem => `:elem(${ elem })`,
      modName: modName => `:mod(${ modName }`,
      modVal: modVal => ` ${ modVal })`
    },
    stringify: bemEntityName => {
      let result = bemEntityName.block
      if (bemEntityName.elem) result += bemEntityName.elem
      if (bemEntityName.mod) result += bemEntityName.mod.name + bemEntityName.mod.val
      return result
    },
    ...opts
  })
}

function runOrigin (input, output, opts) {
  return run(input, output, {
    sourceNaming: 'react',
    targetNaming: 'origin',
    ...opts
  })
}

describe('postcss-css-to-bem-css', () => {
  describe('default [origin -> react]', () => {
    it('should convert block', () => run('.b1 {}', '.B1 {}'))
    it('should convert block with long name', () => run('.block-with-long-name {}', '.BlockWithLongName {}'))
    it('should convert block nested in tag', () => run('h1 .b1 {}', 'h1 .B1 {}'))
    it('should convert mixes', () => run('.parent.b1 {}', '.Parent.B1 {}'))
    it('should convert nested blocks', () => run('.parent .b1 {}', '.Parent .B1 {}'))
    it('should convert elem', () => run('.b1__e1 {}', '.B1-E1 {}'))
    it('should convert elem with long name', () => run('.block-with-long-name__elem-with-long-name {}',
      '.BlockWithLongName-ElemWithLongName {}'))
    it('should convert boolean modifier', () => run('.b1_m1 {}', '.B1_m1 {}'))
    it('should convert key/value modifier', () => run('.b1_m1_v1 {}', '.B1_m1_v1 {}'))
    it('should convert elem boolean modifier', () => run('.b1__e1_m1 {}', '.B1-E1_m1 {}'))
    it('should convert elem key/value modifier', () => run('.b1__e1_m1_v1 {}', '.B1-E1_m1_v1 {}'))
  })

  describe('react -> origin', () => {
    it('should convert block', () => runOrigin('.B1 {}', '.b1 {}'))
    it('should convert block nested in tag', () => runOrigin('h1 .B1 {}', 'h1 .b1 {}'))
    it('should convert mixes', () => runOrigin('.Parent.B1 {}', '.parent.b1 {}'))
    it('should convert nested blocks', () => runOrigin('.Parent .B1 {}', '.parent .b1 {}'))
    it('should convert elem', () => runOrigin('.B1-E1 {}', '.b1__e1 {}'))
    it('should convert elem with long name', () => runOrigin('.BlockWithLongName-ElemWithLongName {}',
      '.block-with-long-name__elem-with-long-name {}'))
    it('should convert boolean modifier', () => runOrigin('.B1_m1 {}', '.b1_m1 {}'))
    it('should convert key/value modifier', () => runOrigin('.B1_m1_v1 {}', '.b1_m1_v1 {}'))
    it('should convert elem boolean modifier', () => runOrigin('.B1-E1_m1 {}', '.b1__e1_m1 {}'))
    it('should convert elem key/value modifier', () => runOrigin('.B1-E1_m1_v1 {}', '.b1__e1_m1_v1 {}'))
  })

  describe('origin -> rebem-css', () => {
    it('should convert block', () => runRebem('.b1 {}', ':block(b1) {}'))
    it('should convert block nested in tag', () => runRebem('h1 .b1 {}', 'h1 :block(b1) {}'))
    it('should convert mixes', () => runRebem('.parent.b1 {}', ':block(parent):block(b1) {}'))
    it('should convert nested blocks', () => runRebem('.parent .b1 {}', ':block(parent) :block(b1) {}'))
    it('should convert elem', () => runRebem('.b1__e1 {}', ':block(b1):elem(e1) {}'))
    it('should convert boolean modifier', () => runRebem('.b1_m1 {}', ':block(b1):mod(m1 true) {}'))
    it('should convert key/value modifier', () => runRebem('.b1_m1_v1 {}', ':block(b1):mod(m1 v1) {}'))
    it('should convert elem boolean modifier', () =>
      runRebem('.b1__e1_m1 {}', ':block(b1):elem(e1):mod(m1 true) {}'))
    it('should convert elem key/value modifier', () =>
      runRebem('.b1__e1_m1_v1 {}', ':block(b1):elem(e1):mod(m1 v1) {}'))
  })

  describe('custom', () => {
    it('should convert custom naming scheme', () => {
      // TBD
    })
  })

  describe('prefix', () => {
    it('origin -> origin', () => run('.b1__e1 {}', '.b-b1__e1 {}', {
      sourceNaming: 'origin',
      targetNaming: 'origin',
      transforms: { prefix: 'b-' }
    }))

    it('react -> origin', () => run('.B1-E1 {}', '.b-b1__e1 {}', {
      sourceNaming: 'react',
      targetNaming: 'origin',
      transforms: { prefix: 'b-' }
    }))
  })

  describe('other cases', () => {
    it('should keep invalid selectors as is', () => run('.b1__e1__subelem {}', '.b1__e1__subelem {}'))
    it('should convert nested selectors', () => run('.b1 { &__e1 {} }', '.B1-E1 {}'))
    it('should drop `yes` as modificator value', () => run('.b1_mod_yes {}', '.B1_mod {}', {
      transforms: { modVal: modVal => modVal === 'yes' ? true : modVal }
    }))
    it('should ignore blacklisted entities', () => run('.b1 {}', '.b1 {}', { blacklist: ['b1'] }))
    it('should apply transform only for whitelisted entities', () => run('.b1 {}', '.B1 {}', {
      whitelist: ['b1']
    }))
    it('should not apply transform for non-whitelisted entities', () => run('.b1 {}', '.b1 {}', {
      whitelist: ['b2']
    }))
  })
})
