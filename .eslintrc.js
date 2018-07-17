module.exports = {
    root: true,
    extends: 'eslint-config-postcss',
    env: {
        jest: true,
        es6: true,
        node: true,
    },
    rules: {
        'multiline-ternary': 'off',
        'max-len': ['error', { code: 120 }],
        'no-nested-ternary': 'off',
        'node/no-unsupported-features': 'off'
    }
}
