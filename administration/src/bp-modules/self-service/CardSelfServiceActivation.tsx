import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import { styled } from '@mui/material'
import React, { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { ActionButton } from './components/ActionButton'
import { IconTextButton } from './components/IconTextButton'
import { InfoText } from './components/InfoText'

const Container = styled('div')`
  display: flex;
  flex-direction: column;
`

const StyledIconTextButton = styled(IconTextButton)`
  color: #131314;
`

type CardSelfServiceActivationProps = {
  deepLink: string
  downloadPdf: () => Promise<void>
}

const CardSelfServiceActivation = ({ deepLink, downloadPdf }: CardSelfServiceActivationProps): ReactElement => {
  const { t } = useTranslation('selfService')
  return (
    <Container>
      <StyledIconTextButton onClick={downloadPdf}>
        <FileDownloadOutlinedIcon />
        {t('koblenzPassPdf')}
      </StyledIconTextButton>
      <InfoText>
        {t('howToActivateHint')} <br />
        <br />
        <b>{t('important')}: </b>
        {t('koblenzPassAppNeedsToBeInstalled')}
      </InfoText>
      <ActionButton href={deepLink} variant='contained' size='large'>
        {t('activatePass')}
      </ActionButton>
    </Container>
  )
}

export default CardSelfServiceActivation
