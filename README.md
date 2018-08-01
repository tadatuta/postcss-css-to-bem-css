# PostCSS Css To Bem Css [![Build Status][ci-img]][ci]

[PostCSS] plugin to convert CSS to different [BEM notations](https://en.bem.info/methodology/naming-convention/).

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/tadatuta/postcss-css-to-bem-css.svg
[ci]:      https://travis-ci.org/tadatuta/postcss-css-to-bem-css

```css
/* Input example */
.b1__e1 {

}

/* Output example */
.B1-E1 {

}
```

## Usage

```js
postcss([ require('postcss-css-to-bem-css') ])
```

See [PostCSS] docs for examples for your environment.

### Convert all files in a folder
```js
const fs = require('fs');
const util = require('util');
const postcss = require('postcss');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const glob = util.promisify(require('glob'));
const bemCss = postcss([require('postcss-css-to-bem-css')]);

glob('**/*.css').then(files =>
    files.map(file =>
        readFile(file).then(originalCss =>
            bemCss.process(originalCss, { from: file })
                .then(css => writeFile(file, css))
        )
    ));
```
