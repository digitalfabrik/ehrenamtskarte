import { H5 } from '@blueprintjs/core'
import React, { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const Container = styled.div`
  display: flex;
  flex-direction: column;
`

type StoreImportResultProps = {
  storesCreated: number
  storesDeleted: number
  storesUntouched: number
  dryRun: boolean
}

const StoresImportResult = ({
  storesDeleted,
  storesUntouched,
  storesCreated,
  dryRun,
}: StoreImportResultProps): ReactElement => {
  const { t } = useTranslation('stores')
  return (
    <Container>
      <H5 data-testid='import-result-headline'>{`${t('articleMale')} ${dryRun ? t('dryRunImport') : t('import')} ${t(
        'wasSuccessful'
      )}`}</H5>
      <span>{dryRun ? t('importResult') : t('importResult')}</span>
      <br />
      <div>
        {t('storesCreated')} <span data-testid='storesCreated'>{storesCreated}</span>
      </div>
      <div>
        {t('storesDeleted')} <span data-testid='storesDeleted'>{storesDeleted}</span>
      </div>
      <div>
        {t('storesUntouched')} <span data-testid='storesUntouched'>{storesUntouched}</span>
      </div>
    </Container>
  )
}

export default StoresImportResult
