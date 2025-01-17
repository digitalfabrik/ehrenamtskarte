import { Checkbox } from '@blueprintjs/core'
import React, { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const StyledCheckbox = styled(Checkbox)`
  margin: 12px 0;
  align-self: center;
`

const CheckboxContainer = styled.div`
  padding: 0 12px;
  display: flex;
`

const DurationContainer = styled.div`
  margin-top: 12px;
`

type StoreImportAlertProps = {
  dryRun: boolean
  setDryRun: (value: boolean) => void
  storesCount: number
}

const STORES_COUNT_NOTE_THRESHOLD = 500
const STORES_IMPORT_PER_SECOND = 100
const StoresImportAlert = ({ dryRun, setDryRun, storesCount }: StoreImportAlertProps): ReactElement => {
  const { t } = useTranslation('stores')
  return (
    <>
      {dryRun ? (
        <span data-testid='dry-run-alert'>
          <b>{t('dryRun')}:</b> {t('dryRunDescription')}
        </span>
      ) : (
        <>
          <span data-testid='prod-run-alert'>
            <b>{t('caution')}:</b> {t('cautionDescription')}
          </span>
          <br />
          {storesCount > STORES_COUNT_NOTE_THRESHOLD && (
            <DurationContainer data-testid='duration-alert'>
              <b>{t('timeForImport')}:</b> {Math.ceil(storesCount / STORES_IMPORT_PER_SECOND / 60)} {t('minutes')}.{' '}
              <br />
              {t('pleaseDoNotCloseTheWindow')}
            </DurationContainer>
          )}
        </>
      )}
      <CheckboxContainer>
        <StyledCheckbox checked={dryRun} onChange={e => setDryRun(e.currentTarget.checked)} label={t('dryRun')} />
      </CheckboxContainer>
    </>
  )
}

export default StoresImportAlert
