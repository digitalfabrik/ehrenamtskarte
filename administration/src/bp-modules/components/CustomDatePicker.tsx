import { DesktopDatePicker } from '@mui/x-date-pickers'
import { deDE } from '@mui/x-date-pickers/locales'
import React, { ReactElement } from 'react'
import styled from 'styled-components'

import useWindowDimensions from '../../hooks/useWindowDimensions'

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
`
type CustomDatePickerProps = {
  date: Date | null
  onBlur: () => void
  onChange: (date: Date | null) => void
  onClear: () => void
  isValid: boolean
  minDate?: Date
  maxDate?: Date
  disableFuture: boolean
  sideComponent?: ReactElement
}

const CustomDatePicker = ({
  date,
  onBlur,
  onChange,
  onClear,
  isValid,
  minDate,
  maxDate,
  disableFuture,
  sideComponent,
}: CustomDatePickerProps): ReactElement => {
  const { viewportSmall } = useWindowDimensions()
  const formStyle = viewportSmall ? { fontSize: 16, padding: '9px 10px' } : { fontSize: 14, padding: '6px 10px' }
  const textFieldBoxShadow =
    '0 0 0 0 rgba(205, 66, 70, 0), 0 0 0 0 rgba(205, 66, 70, 0), inset 0 0 0 1px #cd4246, inset 0 0 0 1px rgba(17, 20, 24, 0.2), inset 0 1px 1px rgba(17, 20, 24, 0.3)'
  return (
    <StyledDiv>
      <DesktopDatePicker
        views={['year', 'month', 'day']}
        value={date}
        format='dd.MM.yyyy'
        slotProps={{
          clearIcon: { fontSize: viewportSmall ? 'medium' : 'small' },
          openPickerIcon: { fontSize: 'small' },
          field: { clearable: true, onClear },
          textField: {
            placeholder: 'TT.MM.JJJJ',
            error: !isValid,
            spellCheck: false,
            onBlur,
            sx: {
              width: '100%',
              input: formStyle,
              boxShadow: !isValid ? textFieldBoxShadow : undefined,
            },
          },
        }}
        localeText={deDE.components.MuiLocalizationProvider.defaultProps.localeText}
        disableFuture={disableFuture}
        minDate={minDate}
        maxDate={maxDate}
        onChange={onChange}
      />
      {sideComponent}
    </StyledDiv>
  )
}

export default CustomDatePicker
