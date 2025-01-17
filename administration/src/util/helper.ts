import XRegExp from 'xregexp'

export const isDevMode = (): boolean => window.location.hostname === 'localhost'
export const isStagingMode = (): boolean => !!window.location.hostname.match(/staging./)

export const updateArrayItem = <T>(array: T[], updatedItem: T, index: number): T[] => {
  if (index >= array.length || index < 0) {
    throw new RangeError(`Index ${index} is out of range`)
  }
  return [...array.slice(0, index), updatedItem, ...array.slice(index + 1)]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never

const multipleSpacePattern = /\s\s+/g
export const removeMultipleSpaces = (value: string): string => value.replace(multipleSpacePattern, ' ')
export const containsSpecialCharacters = (value: string): boolean =>
  /[`!@#$%^&*()_+=\]{};:"\\|,<>?€¥°[£¢§~¡“¶≠¿«∑®†Ω¨øπ•±‘æœ∆ª©ƒ∂å≈ç√∫–µ0123456789]/.test(value)

/** This regEx is needed to avoid breaking pdf creation due to incompatible charsets in form fields
 * Common charset includes common pattern f.e. empty spaces.
 * Checking for latin charset should be fine because all fonts we're going to use for pdf generation should be latin based.
 * */
export const containsOnlyLatinAndCommonCharset = (value: string): boolean =>
  XRegExp('^[\\p{Latin}\\p{Common}]+$').test(value)

export const toLowerCaseFirstLetter = (value: string): string => value.charAt(0).toLowerCase() + value.slice(1)
