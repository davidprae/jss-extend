import warning from 'warning'

const isObject = obj => obj && typeof obj === 'object' && !Array.isArray(obj)
const baseStyleNs = `baseStyle${Date.now()}`

function mergeExtend(style, rule, sheet, newStyle) {
  // Extend using a rule name.
  if (typeof style.extend === 'string') {
    if (!sheet) return
    const refRule = sheet.getRule(style.extend)
    if (!refRule) return
    if (refRule === rule) {
      warning(false, '[JSS] A rule tries to extend itself \r\n%s', rule)
      return
    }
    if (refRule.options.parent) {
      const originalStyle = refRule.options.parent.rules.raw[style.extend]
      extend(originalStyle, rule, sheet, newStyle)
    }
    return
  }

  // Extend using an array of objects.
  if (Array.isArray(style.extend)) {
    for (let index = 0; index < style.extend.length; index++) {
      extend(style.extend[index], rule, sheet, newStyle)
    }
    return
  }

  // Extend is a style object.
  for (const prop in style.extend) {
    if (prop === 'extend') {
      extend(style.extend.extend, rule, sheet, newStyle)
      continue
    }
    if (isObject(style.extend[prop])) {
      if (!(prop in newStyle)) newStyle[prop] = {}
      extend(style.extend[prop], rule, sheet, newStyle[prop])
      continue
    }
    newStyle[prop] = style.extend[prop]
  }
}

/**
 * Recursively extend styles.
 */
function extend(style, rule, sheet, newStyle = {}) {
  mergeExtend(style, rule, sheet, newStyle)

  // Copy base style.
  for (const prop in style) {
    if (prop === 'extend') continue
    if (isObject(newStyle[prop]) && isObject(style[prop])) {
      extend(style[prop], rule, sheet, newStyle[prop])
      continue
    }

    if (isObject(style[prop])) {
      newStyle[prop] = extend(style[prop], rule, sheet)
      continue
    }

    newStyle[prop] = style[prop]
  }

  return newStyle
}

function copyBase(style, newStyle = {}) {
  for (const prop in style) {
    if (prop !== 'extend') {
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
export default function jssExtend() {
  function onProcessStyle(style, rule, sheet) {
    return 'extend' in style ? extend(style, rule, sheet) : style
  }

  function onUpdate(data, rule, sheet) {
    if (!('style' in rule)) return

    const {style} = rule

    if (rule[baseStyleNs] == null) {
      rule[baseStyleNs] = copyBase(style)
    }

    const extendingStyle = {
      ...rule[baseStyleNs],
      extend: style.extend
    }

    for (const prop in style) {
      if (rule[baseStyleNs][prop] == null) {
        delete style[prop]
      }
    }

    extend(extendingStyle, rule, sheet, style)
  }

  return {onProcessStyle, onUpdate}
}
