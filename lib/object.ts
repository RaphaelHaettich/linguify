import _ from 'lodash'
import type { DynamicObject } from './types'

/**
 * option props
 */
interface Options {
  separator?: string
}

/**
 * clear options props
 */
interface ClearOptions {
  skipFirstDepth?: boolean
}

/**
 * flatten object into single-depth object
 *
 * @param object - source object
 * @param options - options
 *
 * @returns flattened object
 */
export const flatten = (object: DynamicObject, { separator = '.' }: Options = {}) => {
  const flattened: DynamicObject = {}

  if (!_.isObject(object)) throw new Error("'object' parameter must be a valid object")

  for (const key in object) {
    if (!object.hasOwnProperty(key)) continue

    if (object[key] !== null && typeof object[key] == 'object') {
      // flattening child objects recursively
      let flatObject = flatten(object[key], { separator })
      for (let x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue
        flattened[key + separator + x] = flatObject[x]
      }
    } else {
      flattened[key] = object[key]
    }
  }

  return flattened
}

/**
 * Convert a flattened object into a nested object.
 *
 * @param object - source object
 * @param options - options
 *
 * @returns nested object
 */
export const unflatten = (flatObject: DynamicObject, { separator = '.' }: Options = {}) => {
  const nested: DynamicObject = {}

  if (!_.isObject(flatObject)) throw new Error("'object' parameter must be a valid object")

  for (const key in flatObject) {
    if (!flatObject.hasOwnProperty(key)) continue

    const keyParts = key.split(separator)
    let currentNode = nested

    for (let i = 0; i < keyParts.length; i++) {
      const keyPart = keyParts[i]

      if (keyPart !== undefined && keyPart !== '') {
        if (i === keyParts.length - 1) {
          // If it's the last part of the key, assign the value
          currentNode[keyPart] = flatObject[key]
        } else {
          // Create an empty object if it doesn't exist, or use the existing one
          currentNode = currentNode[keyPart] = currentNode[keyPart] || {}
        }
      }
    }
  }

  return nested
}

/**
 * clears object from empty nested objects
 *
 * @param object - object to clear
 * @param options - options
 *
 * @note if `skipFirstDepth` is true it will reset any first depth key that is not object
 *
 * @returns clear object
 */
export const clear = (object: DynamicObject, { skipFirstDepth = false }: ClearOptions = {}): DynamicObject =>
  skipFirstDepth
    ? _(object)
        .pickBy(_.isObject)
        .mapValues(clear)
        .assign(_.omitBy(object, _.isObject))
        .mapValues(v => (_.isObject(v) ? v : {}))
        .value()
    : _(object).pickBy(_.isObject).mapValues(clear).omitBy(_.isEmpty).assign(_.omitBy(object, _.isObject)).value()

/**
 * sorts object and nested objects keys by alphabetical order.
 *
 * @param object - object to sort
 *
 * @returns sorted object
 */
export const sort = (object: DynamicObject): DynamicObject =>
  _(object)
    .toPairs()
    .map(([key, value]) => [key, _.isObject(value) ? sort(value) : value])
    .sortBy(0)
    .fromPairs()
    .value()

/**
 * check if a path is assignable to the object, returns unvalid path if not
 *
 * @param object - object to validate
 * @param path - path to check
 * @param options - options
 *
 * @returns true is path assignable, point string if not
 */
export const isAssignable = (object: DynamicObject, path: _.Many<string>, { separator = '.' }: Options = {}) => {
  const pathArray = typeof path == 'string' ? path.split(separator) : path
  // getting the path points
  const pathPoints = pathArray.reduce<string[]>(
    (arr, point, index) => [...arr, index > 0 ? `${arr[index - 1]}.${point}` : point],
    []
  )

  // checking if all the points are valid
  for (const point of pathPoints) {
    if (_.has(object, point) && typeof _.get(object, point) != 'object') return point
  }

  return true
}
