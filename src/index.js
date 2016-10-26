import warning from 'warning'

function isObject(obj) {
  return obj && typeof obj === 'object' && !Array.isArray(obj)
}

/**
 * Recursively extend styles.
 */
function extend(rule, newStyle, style) {
  if (typeof style.extend == 'string') {
    if (rule.options && rule.options.sheet) {
      const refRule = rule.options.sheet.getRule(style.extend)
      if (refRule) {
        if (refRule === rule) warning(false, '[JSS] A rule tries to extend itself \r\n%s', rule)
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
      if (prop === 'extend') {
        extend(rule, newStyle, style.extend.extend)
      }
      else if (isObject(style.extend[prop])) {
        if (!newStyle[prop]) newStyle[prop] = {}
        extend(rule, newStyle[prop], style.extend[prop])
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
      extend(rule, newStyle[prop], style[prop])
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
export default () => rule => {
  if (!rule.style || !rule.style.extend) return
  rule.style = extend(rule, {}, rule.style)
}
