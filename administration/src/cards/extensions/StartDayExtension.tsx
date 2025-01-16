import { FormGroup } from '@blueprintjs/core'
import { TextField } from '@mui/material'
import React, { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import PlainDate from '../../util/PlainDate'
import { Extension, ExtensionComponentProps } from './extensions'

export const START_DAY_EXTENSION_NAME = 'startDay'
export type StartDayExtensionState = { [START_DAY_EXTENSION_NAME]: PlainDate }

// Some minimum start day after 1970 is necessary, as we use an uint32 in the protobuf.
const minStartDay = new PlainDate(2020, 1, 1)

const StartDayForm = ({ value, setValue, isValid }: ExtensionComponentProps<StartDayExtensionState>): ReactElement => {
  const { t } = useTranslation('extensions')
  return (
    <FormGroup label={t('startDayLabel')}>
      <TextField
        fullWidth
        type='date'
        required
        size='small'
        error={!isValid}
        value={value.startDay.toString()}
        sx={{ '& input[value=""]:not(:focus)': { color: 'transparent' }, '& fieldset': { borderRadius: 0 } }}
        inputProps={{
          min: minStartDay.toString(),
          style: { fontSize: 14, padding: '6px 10px' },
        }}
        onChange={event => {
          const date = PlainDate.safeFrom(event.target.value)
          if (date !== null) {
            setValue({ startDay: date })
          }
        }}
      />
    </FormGroup>
  )
}

const isStartDayValid = ({ startDay }: StartDayExtensionState): boolean => startDay.isAfter(minStartDay)

const StartDayExtension: Extension<StartDayExtensionState> = {
  name: START_DAY_EXTENSION_NAME,
  Component: StartDayForm,
  getInitialState: () => ({ startDay: PlainDate.fromLocalDate(new Date()) }),
  causesInfiniteLifetime: () => false,
  getProtobufData: (state: StartDayExtensionState) => ({
    extensionStartDay: {
      startDay: isStartDayValid(state) ? state.startDay.toDaysSinceEpoch() : minStartDay.toDaysSinceEpoch(),
    },
  }),
  isValid: isStartDayValid,
  fromString: (value: string) => {
    const startDay = PlainDate.safeFromCustomFormat(value)
    return startDay === null ? null : { startDay }
  },
  toString: ({ startDay }: StartDayExtensionState) => startDay.format(),
  fromSerialized: (value: string) => {
    const startDay = PlainDate.safeFrom(value)
    return startDay === null ? null : { startDay }
  },
  serialize: ({ startDay }: StartDayExtensionState) => startDay.formatISO(),
}

export default StartDayExtension
