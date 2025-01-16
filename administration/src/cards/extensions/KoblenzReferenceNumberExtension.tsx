import { FormGroup, InputGroup, Intent } from '@blueprintjs/core'
import React, { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import FormErrorMessage from '../../bp-modules/self-service/components/FormErrorMessage'
import useWindowDimensions from '../../hooks/useWindowDimensions'
import ClearInputButton from './components/ClearInputButton'
import { Extension, ExtensionComponentProps } from './extensions'

export const KOBLENZ_REFERENCE_NUMBER_EXTENSION_NAME = 'koblenzReferenceNumber'

type KoblenzReferenceNumberExtensionState = { [KOBLENZ_REFERENCE_NUMBER_EXTENSION_NAME]: string }

const KoblenzReferenceNumberMinLength = 4
const KoblenzReferenceNumberMaxLength = 15
const hasSpecialChars = (referenceNr: string): boolean => /[`!@#$%^&*()_+\-=\]{};':"\\|,<>?~]/.test(referenceNr)
const hasInvalidLength = (referenceNumberLength: number): boolean =>
  referenceNumberLength < KoblenzReferenceNumberMinLength || referenceNumberLength > KoblenzReferenceNumberMaxLength

const KoblenzReferenceNumberExtensionForm = ({
  value,
  setValue,
  isValid,
  showRequired,
}: ExtensionComponentProps<KoblenzReferenceNumberExtensionState>): ReactElement => {
  const { t } = useTranslation('extensions')
  const [touched, setTouched] = useState(false)
  const { viewportSmall } = useWindowDimensions()
  const { koblenzReferenceNumber } = value
  const showErrorMessage = touched || showRequired
  const clearInput = () => setValue({ koblenzReferenceNumber: '' })

  const getErrorMessage = (): string | null => {
    const errors: string[] = []
    if (hasSpecialChars(value.koblenzReferenceNumber)) {
      errors.push(t('referenceNrSpecialCharactersError'))
    }
    if (hasInvalidLength(value.koblenzReferenceNumber.length)) {
      errors.push(
        t('referenceNrInvalidLengthError', { KoblenzReferenceNumberMinLength, KoblenzReferenceNumberMaxLength })
      )
    }
    return errors.join(' ')
  }

  return (
    <FormGroup label={t('referenceNrLabel')} labelFor='koblenz-reference-number-input'>
      <InputGroup
        fill
        large={viewportSmall}
        id='koblenz-reference-number-input'
        placeholder='5.012.067.281, 000D000001, 99478'
        intent={isValid || !showErrorMessage ? undefined : Intent.DANGER}
        onBlur={() => setTouched(true)}
        value={koblenzReferenceNumber}
        rightElement={
          <ClearInputButton viewportSmall={viewportSmall} onClick={clearInput} input={koblenzReferenceNumber} />
        }
        onChange={event => setValue({ koblenzReferenceNumber: event.target.value })}
      />
      {showErrorMessage && <FormErrorMessage errorMessage={getErrorMessage()} />}
    </FormGroup>
  )
}

const fromString = (value: string): KoblenzReferenceNumberExtensionState => ({ koblenzReferenceNumber: value })
const toString = ({ koblenzReferenceNumber }: KoblenzReferenceNumberExtensionState): string => koblenzReferenceNumber

const KoblenzReferenceNumberExtension: Extension<KoblenzReferenceNumberExtensionState> = {
  name: KOBLENZ_REFERENCE_NUMBER_EXTENSION_NAME,
  getInitialState: () => ({ koblenzReferenceNumber: '' }),
  Component: KoblenzReferenceNumberExtensionForm,
  causesInfiniteLifetime: () => false,
  getProtobufData: state => ({
    extensionKoblenzReferenceNumber: {
      referenceNumber: state.koblenzReferenceNumber,
    },
  }),
  isValid: state => {
    const koblenzReferenceNumber = state?.koblenzReferenceNumber ?? null
    return (
      koblenzReferenceNumber !== null &&
      koblenzReferenceNumber.length >= KoblenzReferenceNumberMinLength &&
      koblenzReferenceNumber.length <= KoblenzReferenceNumberMaxLength &&
      !hasSpecialChars(koblenzReferenceNumber)
    )
  },
  fromString,
  toString,
  fromSerialized: fromString,
  serialize: toString,
}

export default KoblenzReferenceNumberExtension
