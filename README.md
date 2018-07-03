# postcss-css-to-bem-css

`postcss` plugin to convert CSS to [rebem-css](https://www.npmjs.com/package/rebem-css).

## Usage

```js
const postcss = require('postcss');
const bemCss = require('postcss-css-to-bem-css);

postcss([bemCss]).process('.b1 {}', { from: undefined })
    .then(result => console.log(result.css)); // :block(b1) {}
```
