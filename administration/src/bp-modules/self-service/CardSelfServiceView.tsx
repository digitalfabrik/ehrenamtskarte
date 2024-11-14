import { Spinner } from '@blueprintjs/core'
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined'
import React, { ReactElement, useContext, useState } from 'react'
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
import useSupportedPdfCharset from '../../hooks/useSupportedPdfCharset'

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
const CardSelfServiceView = (): ReactElement | null => {
  const projectConfig = useContext(ProjectConfigContext)
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
const supportedPdfCharset= useSupportedPdfCharset()

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

  if(!supportedPdfCharset){
    return null
  }

  return (
    <Container>
      <Header>
        <HeaderLogo src={KoblenzLogo} />
        <StyledInfoTextButton onClick={() => setOpenHelpDialog(true)}>
          Hilfe
          <HelpOutlineOutlinedIcon />
        </StyledInfoTextButton>
      </Header>
      <Body>
        <Step>{`Schritt ${selfServiceStepInfo[selfServiceState].stepNr}/${selfServiceStepInfo.length}`}</Step>
        <Headline>{selfServiceStepInfo[selfServiceState].headline}</Headline>
        <SubHeadline>{selfServiceStepInfo[selfServiceState].subHeadline}</SubHeadline>
        <Text>{selfServiceStepInfo[selfServiceState].text}</Text>
        {selfServiceState === CardSelfServiceStep.form && (
          <CardSelfServiceForm
            supportedPdfCharset={supportedPdfCharset}
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
        title='Hilfe'
        content={
          <>
            <InfoText>
              Sie haben ein Problem bei der Aktivierung oder dem Abrufen des KoblenzPass? <br />
              Dann kontaktieren Sie uns bitte per E-Mail via koblenzpass@stadt.koblenz.de
            </InfoText>
            <ActionButton href='mailto:koblenzpass@stadt.koblenz.de'>E-Mail schreiben</ActionButton>
          </>
        }
      />
    </Container>
  )
}

export default CardSelfServiceView
