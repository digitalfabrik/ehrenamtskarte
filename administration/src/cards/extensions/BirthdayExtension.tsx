import { Colors, FormGroup } from '@blueprintjs/core'
import { TextField } from '@mui/material'
import React, { ReactElement } from 'react'

import useWindowDimensions from '../../hooks/useWindowDimensions'
import PlainDate from '../../util/PlainDate'
import { Extension, ExtensionComponentProps } from './extensions'

export const BIRTHDAY_EXTENSION_NAME = 'birthday'
export type BirthdayExtensionState = { [BIRTHDAY_EXTENSION_NAME]: number | null }

const minBirthday = new PlainDate(1900, 1, 1)
const getInitialState = (): BirthdayExtensionState => ({ birthday: minBirthday.toDaysSinceEpoch() })

const BirthdayForm = ({ value, setValue, isValid }: ExtensionComponentProps<BirthdayExtensionState>): ReactElement => {
  const { viewportSmall } = useWindowDimensions()
  const inputColor = value === getInitialState() ? Colors.GRAY1 : Colors.BLACK
  const formStyle = viewportSmall
    ? { fontSize: 16, padding: '9px 10px', color: inputColor }
    : { fontSize: 14, padding: '6px 10px', color: inputColor }

  const birthdayDate = value.birthday !== null ? PlainDate.fromDaysSinceEpoch(value.birthday).toString() : ''

  return (
    <FormGroup label='Geburtsdatum'>
      <TextField
        fullWidth
        type='date'
        required
        error={!isValid}
        value={birthdayDate}
        sx={{ '& input[value=""]:not(:focus)': { color: 'transparent' }, '& fieldset': { borderRadius: 0 } }}
        inputProps={{
          min: minBirthday.toString(),
          max: PlainDate.fromLocalDate(new Date()).toString(),
          style: formStyle,
        }}
        onChange={event => {
          console.log('target', event.target.value)
          const date = PlainDate.safeEpochsFrom(event.target.value)
          if (date !== null) {
            setValue({ birthday: date })
          }
        }}
      />
    </FormGroup>
  )
}

const BirthdayExtension: Extension<BirthdayExtensionState> = {
  name: BIRTHDAY_EXTENSION_NAME,
  Component: BirthdayForm,
  getInitialState,
  causesInfiniteLifetime: () => false,
  getProtobufData: ({ birthday }: BirthdayExtensionState) => ({
    extensionBirthday: {
      birthday: birthday ?? undefined,
    },
  }),
  isValid: ({ birthday }: BirthdayExtensionState) => {
    if (birthday === null) {
      return false
    }
    const date = PlainDate.fromDaysSinceEpoch(birthday)
    const today = PlainDate.fromLocalDate(new Date())
    return !date.isBefore(minBirthday) && !date.isAfter(today)
  },
  fromString: (value: string) => {
    const birthday = PlainDate.safeEpochsFromCustomFormat(value)
    return birthday === null ? null : { birthday }
  },
  toString: ({ birthday }: BirthdayExtensionState) =>
    birthday !== null ? PlainDate.fromDaysSinceEpoch(birthday).format() : '',
}

export default BirthdayExtension
