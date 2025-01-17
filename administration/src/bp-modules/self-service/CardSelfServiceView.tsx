import { Spinner } from '@blueprintjs/core'
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined'
import React, { ReactElement, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import KoblenzLogo from '../../assets/koblenz_logo.svg'
import { updateCard } from '../../cards/Card'
import BasicDialog from '../../mui-modules/application/BasicDialog'
import { ProjectConfigContext } from '../../project-configs/ProjectConfigContext'
import CardSelfServiceActivation from './CardSelfServiceActivation'
import CardSelfServiceForm from './CardSelfServiceForm'
import CardSelfServiceInformation from './CardSelfServiceInformation'
import { ActionButton } from './components/ActionButton'
import { IconTextButton } from './components/IconTextButton'
import { InfoText } from './components/InfoText'
import selfServiceStepInfo from './constants/selfServiceStepInfo'
import useCardGeneratorSelfService, { CardSelfServiceStep } from './hooks/useCardGeneratorSelfService'

const CenteredSpinner = styled(Spinner)`
  position: absolute;
  top: 45vh;
  left: 45vw;
`

const Header = styled.div`
  background-color: #f7f7f7;
  display: flex;
  justify-content: space-between;
  justify-self: center;
  padding: 12px;
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
`

const Container = styled.div`
  align-self: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 500px;
  border: 1px solid #f7f7f7;
  font-family: Roboto Roboto, Helvetica, Arial, sans-serif;
`

const Step = styled.div`
  color: #595959;
  font-size: 16px;
  padding: 14px;
  align-self: flex-end;
`

const Headline = styled.h1`
  color: #e2007a;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 0;
`

const SubHeadline = styled.h2`
  color: #131314;
  font-size: 22px;
`

const Text = styled.div`
  margin-bottom: 24px;
  font-size: 16px;
`

const HeaderLogo = styled.img`
  height: 40px;
`

const StyledInfoTextButton = styled(IconTextButton)`
  margin: 0;
`

export enum DataPrivacyAcceptingStatus {
  untouched,
  accepted,
  denied,
}

// TODO 1646 Add tests for CardSelfService
const CardSelfServiceView = (): ReactElement => {
  const projectConfig = useContext(ProjectConfigContext)
  const { t } = useTranslation('selfService')
  const [dataPrivacyCheckbox, setDataPrivacyCheckbox] = useState<DataPrivacyAcceptingStatus>(
    DataPrivacyAcceptingStatus.untouched
  )
  const {
    selfServiceState,
    setSelfServiceState,
    isLoading,
    generateCards,
    setSelfServiceCard,
    selfServiceCard,
    deepLink,
    code,
    downloadPdf,
  } = useCardGeneratorSelfService()
  const [openHelpDialog, setOpenHelpDialog] = useState(false)

  const onDownloadPdf = async () => {
    if (code) {
      await downloadPdf(code, projectConfig.name)
    }
  }

  const goToActivation = () => {
    setSelfServiceState(CardSelfServiceStep.activation)
  }

  if (isLoading) {
    return <CenteredSpinner />
  }

  return (
    <Container>
      <Header>
        <HeaderLogo src={KoblenzLogo} />
        <StyledInfoTextButton onClick={() => setOpenHelpDialog(true)}>
          {t('help')}
          <HelpOutlineOutlinedIcon />
        </StyledInfoTextButton>
      </Header>
      <Body>
        <Step>{`${t('step')} ${selfServiceStepInfo[selfServiceState].stepNr}/${selfServiceStepInfo.length}`}</Step>
        <Headline>{selfServiceStepInfo[selfServiceState].headline}</Headline>
        <SubHeadline>{selfServiceStepInfo[selfServiceState].subHeadline}</SubHeadline>
        <Text>{selfServiceStepInfo[selfServiceState].text}</Text>
        {selfServiceState === CardSelfServiceStep.form && (
          <CardSelfServiceForm
            card={selfServiceCard}
            dataPrivacyAccepted={dataPrivacyCheckbox}
            setDataPrivacyAccepted={setDataPrivacyCheckbox}
            updateCard={updatedCard => setSelfServiceCard(updateCard(selfServiceCard, updatedCard))}
            generateCards={generateCards}
          />
        )}
        {selfServiceState === CardSelfServiceStep.information && (
          <CardSelfServiceInformation goToActivation={goToActivation} />
        )}
        {selfServiceState === CardSelfServiceStep.activation && (
          <CardSelfServiceActivation downloadPdf={onDownloadPdf} deepLink={deepLink} />
        )}
      </Body>
      <BasicDialog
        open={openHelpDialog}
        maxWidth='lg'
        onUpdateOpen={setOpenHelpDialog}
        title={t('help')}
        content={
          <>
            <InfoText>
              {t('youHaveProblemsCreatingAPass')} <br />
              {t('pleaseContactUsForHelp')}
            </InfoText>
            <ActionButton href='mailto:koblenzpass@stadt.koblenz.de'>{t('sendMail')}</ActionButton>
          </>
        }
      />
    </Container>
  )
}

export default CardSelfServiceView
