import { TFunction } from 'i18next'

const isUpperCase = (value: string) => value === value.toUpperCase() && value !== value.toLowerCase()

const isLowerCase = (value: string) => value === value.toLowerCase() && value !== value.toUpperCase()

const isNumeric = (value: string) => !Number.isNaN(parseInt(value, 10))

const isSpecialChar = (value: string) => !isUpperCase(value) && !isLowerCase(value) && !isNumeric(value)

const getNumChars = (value: string, predicate: (char: string) => boolean): number =>
  value.split('').filter(predicate).length
const minPasswordLength = 12

const validateNewPasswordInput = (
  newPassword: string,
  repeatNewPassword: string,
  t: TFunction<'auth', undefined>
): string | null => {
  if (newPassword.length < minPasswordLength) {
    return t('passwordValidationNeedsLength', {
      minPasswordLength,
      currentPasswordLength: newPassword.length,
    })
  }
  if (getNumChars(newPassword, isLowerCase) < 1) {
    return t('passwordValidationNeedsLowerCaseLetter')
  }
  if (getNumChars(newPassword, isUpperCase) < 1) {
    return t('passwordValidationNeedsUpperCaseLetter')
  }
  if (getNumChars(newPassword, isSpecialChar) < 1) {
    return t('passwordValidationNeedsSpecialCharacter')
  }
  if (newPassword !== repeatNewPassword) {
    return t('passwordValidationMustBeEqual')
  }
  return null
}

export default validateNewPasswordInput
