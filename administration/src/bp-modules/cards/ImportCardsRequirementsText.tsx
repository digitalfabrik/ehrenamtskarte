import React, { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ENTRY_LIMIT, FILE_SIZE_LIMIT_MEGA_BYTES } from './ImportCardsInput'

const RequirementsList = styled.ul`
  text-align: left;
  padding-left: 20px;
`

type ImportCardsRequirementsProps = {
  csvHeaders: string[]
  isFreinetFormat: boolean | undefined
}

const ImportCardsRequirementsText = ({
  csvHeaders,
  isFreinetFormat = false,
}: ImportCardsRequirementsProps): ReactElement => {
  const { t } = useTranslation('cards')
  return (
    <RequirementsList>
      <li>{t('maxFileSize', { maxFileSize: FILE_SIZE_LIMIT_MEGA_BYTES })}</li>
      <li>{t('fileFormatCSV')}</li>
      <li>
        {t('maxNumberOfEntries')}: {ENTRY_LIMIT}
      </li>
      <li>{isFreinetFormat ? t('minColumnsForFreinet') : `${t('columnFormat')}:  ${csvHeaders.join(', ')}`}</li>
      <li>{t('dateFormatHint')}</li>
    </RequirementsList>
  )
}

export default ImportCardsRequirementsText
