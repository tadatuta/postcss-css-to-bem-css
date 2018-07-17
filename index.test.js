'use strict'

const postcss = require('postcss')
const plugin = require('./')

function run (input, output, opts) {
  return postcss([plugin(opts)]).process(input)
    .then(result => {
      expect(result.css).toEqual(output)
      expect(result.warnings()).toHaveLength(0)
    })
}

function runRebem (input, output, opts) {
  return run(input, output, { buildSelector: plugin.builders.buildRebemSelector, ...opts })
}

function runOrigin (input, output, opts) {
  return run(input, output, {
    buildSelector: plugin.builders.buildOriginSelector,
    naming: 'react',
    ...opts
  })
}

describe('postcss-css-to-bem-css', () => {
  describe('default [react]', () => {
    it('should convert block', () => run('.b1 {}', '.B1 {}'))
    it('should convert block nested in tag', () => run('h1 .b1 {}', 'h1 .B1 {}'))
    it('should convert mixes', () => run('.parent.b1 {}', '.Parent.B1 {}'))
    it('should convert nested blocks', () => run('.parent .b1 {}', '.Parent .B1 {}'))
    it('should convert elem', () => run('.b1__e1 {}', '.B1-E1 {}'))
    it('should convert boolean modifier', () => run('.b1_m1 {}', '.B1_m1 {}'))
    it('should convert key/value modifier', () => run('.b1_m1_v1 {}', '.B1_m1_v1 {}'))
    it('should convert elem boolean modifier', () => run('.b1__e1_m1 {}', '.B1-E1_m1 {}'))
    it('should convert elem key/value modifier', () => run('.b1__e1_m1_v1 {}', '.B1-E1_m1_v1 {}'))
  })

  describe('origin', () => {
    it('should convert block', () => runOrigin('.B1 {}', '.b1 {}'))
    it('should convert block nested in tag', () => runOrigin('h1 .B1 {}', 'h1 .b1 {}'))
    it('should convert mixes', () => runOrigin('.Parent.B1 {}', '.parent.b1 {}'))
    it('should convert nested blocks', () => runOrigin('.Parent .B1 {}', '.parent .b1 {}'))
    it('should convert elem', () => runOrigin('.B1-E1 {}', '.b1__e1 {}'))
    it('should convert boolean modifier', () => runOrigin('.B1_m1 {}', '.b1_m1 {}'))
    it('should convert key/value modifier', () => runOrigin('.B1_m1_v1 {}', '.b1_m1_v1 {}'))
    it('should convert elem boolean modifier', () => runOrigin('.B1-E1_m1 {}', '.b1__e1_m1 {}'))
    it('should convert elem key/value modifier', () => runOrigin('.B1-E1_m1_v1 {}', '.b1__e1_m1_v1 {}'))
  })

  describe('rebem-css', () => {
    it('should convert block', () => runRebem('.b1 {}', ':block(b1) {}'))
    it('should convert block nested in tag', () => runRebem('h1 .b1 {}', 'h1 :block(b1) {}'))
    it('should convert mixes', () => runRebem('.parent.b1 {}', ':block(parent):block(b1) {}'))
    it('should convert nested blocks', () => runRebem('.parent .b1 {}', ':block(parent) :block(b1) {}'))
    it('should convert elem', () => runRebem('.b1__e1 {}', ':block(b1):elem(e1) {}'))
    it('should convert boolean modifier', () => runRebem('.b1_m1 {}', ':block(b1):mod(m1 true) {}'))
    it('should convert key/value modifier', () => runRebem('.b1_m1_v1 {}', ':block(b1):mod(m1 v1) {}'))
    it('should convert elem boolean modifier', () => runRebem('.b1__e1_m1 {}', ':block(b1):elem(e1):mod(m1 true) {}'))
    it('should convert elem key/value modifier', () =>
      runRebem('.b1__e1_m1_v1 {}', ':block(b1):elem(e1):mod(m1 v1) {}'))
  })

  describe('custom', () => {
    it('should convert custom naming scheme', () =>
      runRebem('.B1-E1 {}', ':block(B1):elem(E1) {}', { naming: 'react' }))
  })

  describe('other cases', () => {
    it('should keep invalid selectors as is', () => runRebem('.b1__e1__subelem {}', '.b1__e1__subelem {}'))
    it('should convert nested selectors', () => runRebem('__e1 {}', ':elem(e1) {}'))
  })
})
