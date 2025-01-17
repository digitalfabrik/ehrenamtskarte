import { Button, H2 } from '@blueprintjs/core'
import React, { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import SettingsCard from '../user-settings/SettingsCard'

const DataPrivacyCard = (): ReactElement => {
  const navigate = useNavigate()
  const { t } = useTranslation('regionSettings')
  return (
    <SettingsCard>
      <H2>{t('dataPrivacyHeading')}</H2>
      <p>{t('dataPrivacyExplanation')}</p>
      <div style={{ textAlign: 'right', padding: '10px 0' }}>
        <Button text={t('open')} intent='primary' onClick={() => navigate('/region/data-privacy-policy')} />
      </div>
    </SettingsCard>
  )
}

export default DataPrivacyCard
