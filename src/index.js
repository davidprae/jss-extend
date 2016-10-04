import merge from 'lodash.merge'

const warn = console.warn.bind(console) // eslint-disable-line no-console
const isNested = (prop) => prop.indexOf('&') !== -1
/**
 * Recursively extend styles.
 */
function extend(rule, newStyle, style) {
  if (typeof style.extend == 'string') {
    if (rule.options && rule.options.sheet) {
      const refRule = rule.options.sheet.getRule(style.extend)
      if (refRule) {
        if (refRule === rule) warn(`[JSS] A rule tries to extend itself \r\n${rule.toString()}`)
        else extend(rule, newStyle, refRule.originalStyle)
      }
    }
  }
  else if (Array.isArray(style.extend)) {
    for (let index = 0; index < style.extend.length; index++) {
      extend(rule, newStyle, style.extend[index])
    }
  }
  else {
    for (const prop in style.extend) {
      if (style[prop] && isNested(prop)) {
        newStyle[prop] = merge(
          extend(rule, {}, style[prop]),
          extend(rule, {}, style.extend[prop])
        )
      }
      else {
        if (prop === 'extend') extend(rule, newStyle, style.extend.extend)
        else newStyle[prop] = style.extend[prop]
      }
    }
  }

  // Copy base style.
  for (const prop in style) {
    if (prop !== 'extend' && !isNested(prop)) newStyle[prop] = style[prop]
  }

  return newStyle
}

/**
 * Handle `extend` property.
 *
 * @param {Rule} rule
 * @api public
 */
export default () => rule => {
  if (!rule.style || !rule.style.extend) return
  rule.style = extend(rule, {}, rule.style)
}
