# JSS plugin that enables inheritance

This plugin implements a custom `extend` style property.

[Demo](http://cssinjs.github.io/examples/index.html#plugin-jss-extend) -
[JSS](https://github.com/cssinjs/jss)

[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/cssinjs/lobby)


Value of `extend` property can be a string, object and array. If string is used, it will look for a rule with such a name. If object - plain rule object is expected, if array - an array of plain rule objects is expected.

Rule's own properties always take precedence over extended rules, so you can always override the extended definition.


## Examples

```javascript
const styles = {
  redContainer: {
    background: 'red'
  },
  container: {
    extend: 'redContainer',
    'font-size': '20px'
  }
}
```

```javascript
const redContainer = {
  background: 'red'
}
const styles = {
  container: {
    extend: redContainer, // Can be an array of styles
    'font-size': '20px'
  }
}
```

Compiles to:

```css
.jss-23g44j5 {
  background: red;
  font-size: 20px;
}
```

## Issues

File a bug against [cssinjs/jss prefixed with \[jss-extend\]](https://github.com/cssinjs/jss/issues/new?title=[jss-extend]%20).

## Run tests

```bash
npm i
npm run test
```

## License

MIT
