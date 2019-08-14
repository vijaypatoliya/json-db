module.exports = {
  getProp,
  setProp,
  deleteProp
}

function split (path, options) {
  const id = createKey(path, options)
  if (setProp.memo[id]) return setProp.memo[id]

  const char = (options && options.separator) ? options.separator : '.'
  let keys = []
  const res = []

  if (options && typeof options.split === 'function') {
    keys = options.split(path)
  } else {
    keys = path.split(char)
  }

  for (let i = 0; i < keys.length; i++) {
    let prop = keys[i]
    while (prop && prop.slice(-1) === '\\' && keys[i + 1]) {
      prop = prop.slice(0, -1) + char + keys[++i]
    }
    res.push(prop)
  }
  setProp.memo[id] = res
  return res
}

function createKey (pattern, options) {
  let id = pattern
  if (typeof options === 'undefined') {
    return id + ''
  }
  const keys = Object.keys(options)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    id += ';' + key + '=' + String(options[key])
  }
  return id
}

function isValidKey (key) {
  return key !== '__proto__' && key !== 'constructor' && key !== 'prototype'
}

function isObject (val) {
  return val !== null && (typeof val === 'object' || typeof val === 'function')
}

function isObjectObject (o) {
  return isObject(o) === true &&
        Object.prototype.toString.call(o) === '[object Object]'
}

function isPlainObject (o) {
  var ctor, prot

  if (isObjectObject(o) === false) return false

  ctor = o.constructor
  if (typeof ctor !== 'function') return false

  prot = ctor.prototype
  if (isObjectObject(prot) === false) return false

  if (Object.prototype.hasOwnProperty.call(prot, 'isPrototypeOf') === false) {
    return false
  }

  return true
};

function getProp (o, s) {
  s = s.replace(/\[(\w+)\]/g, '.$1') // convert indexes to properties
  s = s.replace(/^\./, '') // strip a leading dot
  var a = s.split('.')
  for (var i = 0, n = a.length; i < n; ++i) {
    var k = a[i]
    if (k in o) {
      o = o[k]
    } else {
      return
    }
  }
  return o
}

function setProp (obj, path, value) {
  if (typeof obj !== 'object' || typeof path !== 'string') {
    return obj
  }
  const isArray = Array.isArray(path)
  if (!isArray && typeof path !== 'string') {
    return obj
  }

  const merge = Object.assign

  const keys = (isArray ? path : split(path, {})).filter(isValidKey)
  const len = keys.length
  const orig = obj

  if (keys.length === 1) {
    const keyPath = keys[0]
    if (merge && isPlainObject(obj[keyPath]) && isPlainObject(value)) {
      obj[keyPath] = merge({}, obj[keyPath], value)
    } else {
      obj[keyPath] = value
    }
    return obj
  }

  for (let i = 0; i < len; i++) {
    const prop = keys[i]

    if (!isObject(obj[prop])) {
      obj[prop] = {}
    }

    if (i === len - 1) {
      if (merge && isPlainObject(obj[prop]) && isPlainObject(value)) {
        obj[prop] = merge({}, obj[prop], value)
      } else {
        obj[prop] = value
      }
      break
    }

    obj = obj[prop]
  }

  return orig
}
setProp.memo = {}

function deleteProp (obj, prop) {
  if (typeof obj !== 'object') {
    throw new TypeError('Invalid object!')
  }
  if (Object.prototype.hasOwnProperty.call(obj, prop)) {
    delete obj[prop]
    return true
  }

  var segs = prop.split('.')
  var last = segs.pop()
  while (segs.length && segs[segs.length - 1].slice(-1) === '\\') {
    last = segs.pop().slice(0, -1) + '.' + last
  }
  while (segs.length) obj = obj[prop = segs.shift()]
  return (delete obj[last])
};
