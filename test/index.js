const assert = require('assert');
const postcss = require('postcss');
const bemCss = postcss([require('..')]);

const process = css => bemCss.process(css, { from: undefined });

const test = (css, expected) => process(css)
    .then(result => assert.equal(result.css, expected));

describe('postcss-css-to-bem-css', function() {
    it('should convert block', () => test('.b1 {}', ':block(b1) {}'));
    it('should convert block nested in tag', () => test('h1 .b1 {}', 'h1 :block(b1) {}'));
    it('should convert mixes', () => test('.parent.b1 {}', ':block(parent):block(b1) {}'));
    it('should convert nested blocks', () => test('.parent .b1 {}', ':block(parent) :block(b1) {}'));
    it('should convert elem', () => test('.b1__e1 {}', ':block(b1):elem(e1) {}'));
    it('should convert boolean modifier', () => test('.b1_m1 {}', ':block(b1):mod(m1 true) {}'));
    it('should convert key/value modifier', () => test('.b1_m1_v1 {}', ':block(b1):mod(m1 v1) {}'));
    it('should convert elem boolean modifier', () => test('.b1__e1_m1 {}', ':block(b1):elem(e1):mod(m1 true) {}'));
    it('should convert elem key/value modifier', () => test('.b1__e1_m1_v1 {}', ':block(b1):elem(e1):mod(m1 v1) {}'));
});
