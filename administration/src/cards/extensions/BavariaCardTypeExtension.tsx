import { Button, FormGroup, MenuItem } from '@blueprintjs/core'
import { ItemRenderer, Select } from '@blueprintjs/select'
import React, { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { BavariaCardType as BavariaCardTypeEnum } from '../../generated/card_pb'
import { Extension, ExtensionComponentProps } from './extensions'

export const BAVARIA_CARD_TYPE_EXTENSION_NAME = 'bavariaCardType'

export const BAVARIA_CARD_TYPE_STANDARD = 'Standard'
const BAVARIA_CARD_TYPE_STANDARD_LEGACY = 'blau'
export const BAVARIA_CARD_TYPE_GOLD = 'Goldkarte'
const BAVARIA_CARD_TYPE_GOLD_LEGACY = 'gold'
type BavariaCardTypeState = typeof BAVARIA_CARD_TYPE_STANDARD | typeof BAVARIA_CARD_TYPE_GOLD
export type BavariaCardTypeExtensionState = { [BAVARIA_CARD_TYPE_EXTENSION_NAME]: BavariaCardTypeState }

const StartDayForm = ({ value, setValue }: ExtensionComponentProps<BavariaCardTypeExtensionState>): ReactElement => {
  const { t } = useTranslation('extensions')
  const CardTypeSelect = Select.ofType<BavariaCardTypeState>()

  const renderCardType: ItemRenderer<BavariaCardTypeState> = (cardType, { handleClick, modifiers }) => {
    if (!modifiers.matchesPredicate) {
      return null
    }
    return (
      <MenuItem
        active={modifiers.active}
        disabled={modifiers.disabled}
        text={cardType}
        key={cardType}
        onClick={handleClick}
      />
    )
  }

  return (
    <FormGroup label={t('bavariaCardTypeLabel')}>
      <CardTypeSelect
        items={[BAVARIA_CARD_TYPE_STANDARD, BAVARIA_CARD_TYPE_GOLD]}
        activeItem={value.bavariaCardType}
        onItemSelect={value => setValue({ bavariaCardType: value })}
        itemRenderer={renderCardType}
        filterable={false}>
        <Button text={value.bavariaCardType} rightIcon='caret-down' />
      </CardTypeSelect>
    </FormGroup>
  )
}

const fromString = (state: string): BavariaCardTypeExtensionState | null => {
  if (state === BAVARIA_CARD_TYPE_STANDARD || state === BAVARIA_CARD_TYPE_STANDARD_LEGACY) {
    return { bavariaCardType: BAVARIA_CARD_TYPE_STANDARD }
  }
  if (state === BAVARIA_CARD_TYPE_GOLD || state === BAVARIA_CARD_TYPE_GOLD_LEGACY) {
    return { bavariaCardType: BAVARIA_CARD_TYPE_GOLD }
  }
  return null
}

const toString = ({ bavariaCardType }: BavariaCardTypeExtensionState): string => bavariaCardType

const BavariaCardTypeExtension: Extension<BavariaCardTypeExtensionState> = {
  name: BAVARIA_CARD_TYPE_EXTENSION_NAME,
  Component: StartDayForm,
  getInitialState: () => ({ bavariaCardType: BAVARIA_CARD_TYPE_STANDARD }),
  causesInfiniteLifetime: state => state.bavariaCardType === BAVARIA_CARD_TYPE_GOLD,
  getProtobufData: state => ({
    extensionBavariaCardType: {
      cardType:
        state.bavariaCardType === BAVARIA_CARD_TYPE_GOLD ? BavariaCardTypeEnum.GOLD : BavariaCardTypeEnum.STANDARD,
    },
  }),
  isValid: state =>
    state?.bavariaCardType === BAVARIA_CARD_TYPE_STANDARD || state?.bavariaCardType === BAVARIA_CARD_TYPE_GOLD,
  fromString,
  toString,
  fromSerialized: fromString,
  serialize: toString,
}

export default BavariaCardTypeExtension
