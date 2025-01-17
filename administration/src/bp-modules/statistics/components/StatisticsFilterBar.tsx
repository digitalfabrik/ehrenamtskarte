import { Button, FormGroup, Tooltip } from '@blueprintjs/core'
import { TextField } from '@mui/material'
import React, { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import PlainDate from '../../../util/PlainDate'
import StickyBottomBar from '../../StickyBottomBar'
import { defaultEndDate, defaultStartDate } from '../constants'

const StyledFormGroup = styled(FormGroup)`
  margin: 0 16px 0 0;
  align-self: center;
`

const InputContainer = styled.div`
  flex-direction: row;
  display: flex;
  justify-content: flex-start;
  flex: 1;
  padding: 0 20px;
`
type StatisticsFilterBarProps = {
  onApplyFilter: (dateStart: string, dateEnd: string) => void
  isDataAvailable: boolean
  onExportCsv: (dateStart: string, dateEnd: string) => void
}

const isValidDateString = (value: string): boolean => {
  try {
    PlainDate.from(value)
    return true
  } catch (error) {
    console.error(`Could not parse date from string '${value}'.`, error)
    return false
  }
}
const IsValidDateTimePeriod = (dateStart: string, dateEnd: string): boolean => {
  if (!isValidDateString(dateStart) || !isValidDateString(dateEnd)) {
    return false
  }
  return PlainDate.compare(PlainDate.from(dateStart), PlainDate.from(dateEnd)) <= 0
}

const StatisticsFilterBar = ({
  onApplyFilter,
  isDataAvailable,
  onExportCsv,
}: StatisticsFilterBarProps): ReactElement => {
  const { t } = useTranslation('statistics')
  const [dateStart, setDateStart] = useState(defaultStartDate)
  const [dateEnd, setDateEnd] = useState(defaultEndDate)

  return (
    <StickyBottomBar>
      <InputContainer>
        <StyledFormGroup label={t('start')} inline>
          <TextField
            fullWidth
            type='date'
            required
            size='small'
            error={!isValidDateString(dateStart)}
            value={dateStart}
            sx={{ '& input[value=""]:not(:focus)': { color: 'transparent' }, '& fieldset': { borderRadius: 0 } }}
            inputProps={{
              max: dateEnd,
              style: { fontSize: 14, padding: '6px 10px' },
            }}
            onChange={e => setDateStart(e.target.value)}
          />
        </StyledFormGroup>
        <StyledFormGroup label={t('end')} inline>
          <TextField
            fullWidth
            type='date'
            required
            size='small'
            error={!isValidDateString(dateEnd)}
            value={dateEnd}
            sx={{ '& input[value=""]:not(:focus)': { color: 'transparent' }, '& fieldset': { borderRadius: 0 } }}
            inputProps={{
              max: PlainDate.fromLocalDate(new Date()).toString(),
              style: { fontSize: 14, padding: '6px 10px' },
            }}
            onChange={e => setDateEnd(e.target.value)}
          />
        </StyledFormGroup>
        <Tooltip disabled={IsValidDateTimePeriod(dateStart, dateEnd)} content={t('invalidStartOrEnd')}>
          <Button
            icon='tick'
            text={t('applyFilter')}
            intent='success'
            onClick={() => onApplyFilter(dateStart, dateEnd)}
            disabled={!IsValidDateTimePeriod(dateStart, dateEnd)}
          />
        </Tooltip>
      </InputContainer>
      <Tooltip disabled={isDataAvailable} content={t('noDataAvailableForExport')}>
        <Button
          icon='floppy-disk'
          text={t('exportToCsv')}
          intent='primary'
          onClick={() => onExportCsv(dateStart, dateEnd)}
          disabled={!isDataAvailable}
        />
      </Tooltip>
    </StickyBottomBar>
  )
}

export default StatisticsFilterBar
