const postcss = require('postcss');
const selectorParser = require('postcss-selector-parser');
const bemNamingParse = require('@bem/sdk.naming.entity.parse');
const bemNamingPresets = require('@bem/sdk.naming.presets');

function buildNewSelector(selector) {
    const entity = bemNamingParse(bemNamingPresets.origin)(selector);

    if (!entity) {
        console.warn('WARN! Entity was not parsed for selector', selector);
    }

    let bemSelector = entity.block === 'FAKE-BLOCK' ? '' : `:block(${entity.block})`;
    if (entity.elem) {
        bemSelector += `:elem(${entity.elem})`;
    }

    if (entity.mod) {
        bemSelector += `:mod(${entity.mod.name} ${entity.mod.val})`;
    }

    return bemSelector;
}

module.exports = postcss.plugin('postcss-css-to-bem-css', () => {
    return root => {
        root.walkRules(rule => {
            rule.selector = selectorParser(selectors => {
                selectors.walk(selector => {
                    if (selector.type === 'class') {
                        selector.replaceWith(
                            selectorParser.pseudo({ value: buildNewSelector(selector.value) })
                        );
                    } else if (selector.type === 'tag' && selector.value.startsWith('_')) {
                        selector.replaceWith(
                            selectorParser.pseudo({ value: buildNewSelector('FAKE-BLOCK' + selector.value) })
                        );
                    }
                });
            }).processSync(rule.selector);
        });
    };
});
