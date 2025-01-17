import React, { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { FILE_SIZE_LIMIT_MEGA_BYTES } from './StoresCSVInput'

const RequirementsList = styled.ul`
  text-align: left;
  padding-left: 20px;
`

type ImportCardsRequirementsProps = {
  header: string[]
}

const StoresRequirementsText = ({ header }: ImportCardsRequirementsProps): ReactElement => {
  const { t } = useTranslation('stores')
  return (
    <RequirementsList>
      <li>{t('maxFileSize', { maxFileSize: FILE_SIZE_LIMIT_MEGA_BYTES })} </li>
      <li>{t('fileFormat')}</li>
      <li>
        {t('neededColumns')} {header.join(', ')}
      </li>
    </RequirementsList>
  )
}

export default StoresRequirementsText
