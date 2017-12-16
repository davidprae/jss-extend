import warning from 'warning'

const isObject = obj => obj && typeof obj === 'object' && !Array.isArray(obj)
const now = Date.now()
const baseStyleNs = `baseStyle${now}`

/**
 * Recursively extend styles.
 */
function extend(style, rule, sheet, newStyle = {}) {
  if (typeof style.extend === 'string') {
    if (sheet) {
      const refRule = sheet.getRule(style.extend)
      if (refRule) {
        if (refRule === rule) warning(false, '[JSS] A rule tries to extend itself \r\n%s', rule)
        else if (refRule.options.parent) {
          const originalStyle = refRule.options.parent.rules.raw[style.extend]
          extend(originalStyle, rule, sheet, newStyle)
        }
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
    return style.extend ? extend(style, rule, sheet) : style
  }

  function onUpdate(data, rule) {
    const {style, sheet} = rule
    if (!style || (style.extend == null && rule[baseStyleNs] == null)) return

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
