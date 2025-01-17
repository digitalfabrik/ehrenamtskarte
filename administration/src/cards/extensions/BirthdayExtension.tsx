import { Classes, FormGroup, Tooltip } from '@blueprintjs/core'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import React, { ReactElement, useContext, useState } from 'react'
import styled from 'styled-components'

import CustomDatePicker from '../../bp-modules/components/CustomDatePicker'
import FormErrorMessage from '../../bp-modules/self-service/components/FormErrorMessage'
import { ProjectConfigContext } from '../../project-configs/ProjectConfigContext'
import PlainDate from '../../util/PlainDate'
import { Extension, ExtensionComponentProps } from './extensions'

const StyledToolTip = styled(Tooltip)`
  border: 0;
  width: 20px;
  margin-left: 16px;
`

const StyledHelpOutlineIcon = styled(HelpOutlineIcon)`
  color: #595959;
`

export const BIRTHDAY_EXTENSION_NAME = 'birthday'
export type BirthdayExtensionState = { [BIRTHDAY_EXTENSION_NAME]: PlainDate | null }

const minBirthday = new PlainDate(1900, 1, 1)
const getInitialState = (): BirthdayExtensionState => ({ birthday: null })

const BirthdayForm = ({
  value,
  setValue,
  isValid,
  showRequired,
}: ExtensionComponentProps<BirthdayExtensionState>): ReactElement => {
  const [touched, setTouched] = useState(false)
  const { birthday } = value
  const showErrorMessage = touched || showRequired
  const projectConfig = useContext(ProjectConfigContext)

  const getErrorMessage = (): string | null => {
    if (!birthday) {
      return 'Bitte geben Sie ein gültiges Geburtsdatum an.'
    }
    if (birthday.isAfter(PlainDate.fromLocalDate(new Date()))) {
      return 'Das Geburtsdatum darf nicht in der Zukunft liegen.'
    }
    return null
  }

  const changeBirthday = (date: Date | null) => {
    setValue({ birthday: PlainDate.safeFromLocalDate(date) })
  }

  return (
    <FormGroup label='Geburtsdatum'>
      <CustomDatePicker
        date={birthday?.toLocalDate() ?? null}
        onBlur={() => setTouched(true)}
        onChange={changeBirthday}
        onClear={() => setValue({ birthday: null })}
        isValid={isValid || !showErrorMessage}
        maxDate={new Date()}
        disableFuture
        sideComponent={
          <>
            {projectConfig.showBirthdayMinorHint && (
              <StyledToolTip
                className={Classes.TOOLTIP_INDICATOR}
                content='Bei Minderjährigen unter 16 Jahren darf der KoblenzPass nur mit Einverständnis der Erziehungsberechtigten abgerufen werden.'>
                <StyledHelpOutlineIcon fontSize='small' />
              </StyledToolTip>
            )}
          </>
        }
      />
      {showErrorMessage && <FormErrorMessage errorMessage={getErrorMessage()} />}
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
      birthday: birthday?.toDaysSinceEpoch() ?? undefined,
    },
  }),
  isValid: ({ birthday }: BirthdayExtensionState) => {
    if (!birthday) {
      return false
    }
    const today = PlainDate.fromLocalDate(new Date())
    return !birthday.isBefore(minBirthday) && !birthday.isAfter(today)
  },
  fromString: (value: string) => {
    const birthday = PlainDate.safeFromCustomFormat(value)
    return birthday === null ? null : { birthday }
  },
  toString: ({ birthday }: BirthdayExtensionState) => birthday?.format() ?? '',
  fromSerialized: (value: string) => {
    const birthday = PlainDate.safeFrom(value)
    return birthday === null ? null : { birthday }
  },
  serialize: ({ birthday }: BirthdayExtensionState) => birthday?.formatISO() ?? '',
}

export default BirthdayExtension
