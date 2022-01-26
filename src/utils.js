export const isNil = (obj) => obj === undefined || obj === null

export const isFunction = (obj) => typeof obj === 'function'
export const isObject = (obj) => obj !== null && typeof obj === 'object'
export const isEmptyObject = (obj) =>
  isObject(obj) && Object.keys(obj).length === 0

export function wrapInArray(v) {
  if (isNil(v)) return []
  return Array.isArray(v) ? v : [v]
}