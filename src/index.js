import warning from 'warning'

const isObject = obj => obj && typeof obj === 'object' && !Array.isArray(obj)

/**
 * Recursively extend styles.
 */
function extend(style, rule, sheet, newStyle = {}) {
  if (typeof style.extend === 'string') {
    if (sheet) {
      const refRule = sheet.getRule(style.extend)
      if (refRule) {
        if (refRule === rule) warning(false, '[JSS] A rule tries to extend itself \r\n%s', rule)
        else extend(refRule.originalStyle, rule, sheet, newStyle)
      }
    }
  }
  else if (Array.isArray(style.extend)) {
    for (let index = 0; index < style.extend.length; index++) {
      extend(style.extend[index], rule, sheet, newStyle)
    }
  }
  else {
    for (const prop in style.extend) {
      if (prop === 'extend') {
        extend(style.extend.extend, rule, sheet, newStyle)
      }
      else if (isObject(style.extend[prop])) {
        if (!newStyle[prop]) newStyle[prop] = {}
        extend(style.extend[prop], rule, sheet, newStyle[prop])
      }
      else {
        newStyle[prop] = style.extend[prop]
      }
    }
  }
  // Copy base style.
  for (const prop in style) {
    if (prop === 'extend') continue
    if (isObject(newStyle[prop]) && isObject(style[prop])) {
      extend(style[prop], rule, sheet, newStyle[prop])
    }
    else if (isObject(style[prop])) {
      newStyle[prop] = extend(style[prop], rule, sheet)
    }
    else {
      newStyle[prop] = style[prop]
    }
  }

  return newStyle
}

/**
 * Handle `extend` property.
 *
 * @param {Rule} rule
 * @api public
 */
export default () => (rule, sheet) => {
  const {style} = rule
  if (!style || !style.extend) return
  rule.style = extend(style, rule, sheet)
}
