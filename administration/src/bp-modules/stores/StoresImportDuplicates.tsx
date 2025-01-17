import React, { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type StoresImportDuplicatesProps = { entries: number[][] }

const Container = styled.div`
  display: flex;
  flex-direction: column;
`
const StoresImportDuplicates = ({ entries }: StoresImportDuplicatesProps): ReactElement => {
  const { t } = useTranslation('stores')
  return (
    <Container>
      {t('csvInvalidDuplicateEntries')}:
      {entries.map(entry => {
        const entries = entry.join(', ')
        return <span key={entries}>{t('theseEntriesAreDuplicated', { entries })}</span>
      })}
      {t('pleaseDeleteDuplicates')}
    </Container>
  )
}

export default StoresImportDuplicates
