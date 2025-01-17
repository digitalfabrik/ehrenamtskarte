import { Button, Checkbox, H2 } from '@blueprintjs/core'
import React, { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import SettingsCard from '../user-settings/SettingsCard'

const ButtonContainer = styled.div`
  text-align: right;
  padding: 10px 0;
`

const Headline = styled(H2)`
  margin-bottom: 16px;
`

const RegionSettingsCard = ({
  onSave,
  loading,
  defaultApplicationActivation,
  defaultConfirmationMailActivation,
}: {
  onSave: (activatedForApplication: boolean, activatedForConfirmationMail: boolean) => void
  loading: boolean
  defaultApplicationActivation: boolean
  defaultConfirmationMailActivation: boolean
}): ReactElement => {
  const { t } = useTranslation('regionSettings')
  const [activatedForApplication, setActivatedForApplication] = useState<boolean>(defaultApplicationActivation)
  const [activatedForCardConfirmationMail, setActivatedForCardConfirmationMail] = useState<boolean>(
    defaultConfirmationMailActivation
  )

  return (
    <SettingsCard>
      <Headline>{t('regionSettings')}</Headline>
      <Checkbox
        checked={activatedForApplication}
        onChange={e => setActivatedForApplication(e.currentTarget.checked)}
        label={t('activatedForApplication')}
      />
      <Checkbox
        checked={activatedForCardConfirmationMail}
        onChange={e => setActivatedForCardConfirmationMail(e.currentTarget.checked)}
        label={t('activatedForCardConfirmationMail')}
      />
      <ButtonContainer>
        <Button
          text={t('save')}
          intent='primary'
          onClick={() => onSave(activatedForApplication, activatedForCardConfirmationMail)}
          loading={loading}
        />
      </ButtonContainer>
    </SettingsCard>
  )
}

export default RegionSettingsCard
