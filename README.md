# postcss-css-to-bem-css

`postcss` plugin to convert CSS to [rebem-css](https://www.npmjs.com/package/rebem-css).

## Usage

```js
const postcss = require('postcss');
const bemCss = require('postcss-css-to-bem-css);

postcss([bemCss]).process('.b1 {}', { from: undefined })
    .then(result => console.log(result.css)); // :block(b1) {}
```

### Convert all files in a folder
```js
const fs = require('fs');
const util = require('util');
const postcss = require('postcss');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const glob = util.promisify(require('glob'));
const bemCss = postcss([require('.')]);

glob('**/*.css').then(files =>
    files.map(file =>
        readFile(file).then(originalCss =>
            bemCss.process(originalCss, { from: file })
                .then(css => writeFile(file, css))
        )
    ));
```
