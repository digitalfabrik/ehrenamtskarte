import { Checkbox, FormGroup, InputGroup, Intent } from '@blueprintjs/core'
import InfoOutlined from '@mui/icons-material/InfoOutlined'
import { styled } from '@mui/material'
import React, { ReactElement, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { Card, getFullNameValidationErrorMessage, isFullNameValid, isValid } from '../../cards/Card'
import ClearInputButton from '../../cards/extensions/components/ClearInputButton'
import useWindowDimensions from '../../hooks/useWindowDimensions'
import BasicDialog from '../../mui-modules/application/BasicDialog'
import { ProjectConfigContext } from '../../project-configs/ProjectConfigContext'
import { removeMultipleSpaces } from '../../util/helper'
import { useAppToaster } from '../AppToaster'
import ExtensionForms from '../cards/ExtensionForms'
import { DataPrivacyAcceptingStatus } from './CardSelfServiceView'
import { ActionButton } from './components/ActionButton'
import FormErrorMessage from './components/FormErrorMessage'
import { IconTextButton } from './components/IconTextButton'
import { UnderlineTextButton } from './components/UnderlineTextButton'

const StyledCheckbox = styled(Checkbox)`
  margin-top: 24px;
  font-size: 16px;
  margin-left: 4px;
`

const Container = styled('div')`
  margin-bottom: 24px;
`

type CardSelfServiceFormProps = {
  card: Card
  updateCard: (card: Partial<Card>) => void
  dataPrivacyAccepted: DataPrivacyAcceptingStatus
  setDataPrivacyAccepted: (status: DataPrivacyAcceptingStatus) => void
  generateCards: () => Promise<void>
}

const CardSelfServiceForm = ({
  card,
  updateCard,
  dataPrivacyAccepted,
  setDataPrivacyAccepted,
  generateCards,
}: CardSelfServiceFormProps): ReactElement => {
  const { viewportSmall } = useWindowDimensions()
  const projectConfig = useContext(ProjectConfigContext)
  const { t } = useTranslation('selfService')
  const [formSendAttempt, setFormSendAttempt] = useState(false)
  const [touchedFullName, setTouchedFullName] = useState(false)
  const [openDataPrivacy, setOpenDataPrivacy] = useState<boolean>(false)
  const [openReferenceInformation, setOpenReferenceInformation] = useState<boolean>(false)
  const [_, setSearchParams] = useSearchParams()
  const cardValid = isValid(card, { expirationDateNullable: true })
  const appToaster = useAppToaster()
  const showErrorMessage = touchedFullName || formSendAttempt

  const createKoblenzPass = async () => {
    setFormSendAttempt(true)
    if (dataPrivacyAccepted === DataPrivacyAcceptingStatus.untouched) {
      setDataPrivacyAccepted(DataPrivacyAcceptingStatus.denied)
    }
    if (!cardValid || dataPrivacyAccepted !== DataPrivacyAcceptingStatus.accepted) {
      appToaster?.show({
        message: <FormErrorMessage style={{ color: 'white' }} errorMessage={t('atLeastOneInputIsInvalid')} />,
        timeout: 0,
        intent: 'danger',
      })
      return
    }
    await generateCards()
    setSearchParams(undefined, { replace: true })
  }

  return (
    <>
      <Container key={card.id}>
        <FormGroup label={t('firstNameLastName')}>
          <InputGroup
            large={viewportSmall}
            placeholder='Erika Musterfrau'
            autoFocus
            rightElement={
              <ClearInputButton
                viewportSmall={viewportSmall}
                onClick={() => updateCard({ fullName: '' })}
                input={card.fullName}
              />
            }
            intent={isFullNameValid(card) || !showErrorMessage ? undefined : Intent.DANGER}
            value={card.fullName}
            onBlur={() => setTouchedFullName(true)}
            onChange={event => updateCard({ fullName: removeMultipleSpaces(event.target.value) })}
          />
          {showErrorMessage && <FormErrorMessage errorMessage={getFullNameValidationErrorMessage(card.fullName)} />}
        </FormGroup>
        <ExtensionForms card={card} updateCard={updateCard} showRequired={formSendAttempt} />
        <IconTextButton onClick={() => setOpenReferenceInformation(true)}>
          <InfoOutlined />
          {t('whereToFindReferenceNumber')}
        </IconTextButton>
        <StyledCheckbox
          checked={dataPrivacyAccepted === DataPrivacyAcceptingStatus.accepted}
          onChange={() =>
            setDataPrivacyAccepted(
              dataPrivacyAccepted === DataPrivacyAcceptingStatus.accepted
                ? DataPrivacyAcceptingStatus.denied
                : DataPrivacyAcceptingStatus.accepted
            )
          }>
          {t('iAccept')}
          <UnderlineTextButton onClick={() => setOpenDataPrivacy(true)}>
            {t('datePrivacyAgreement')}
          </UnderlineTextButton>
          .
        </StyledCheckbox>
        {dataPrivacyAccepted === DataPrivacyAcceptingStatus.denied && (
          <FormErrorMessage errorMessage={t('pleaseAcceptPrivacyPolicy')} />
        )}
      </Container>
      <ActionButton onClick={createKoblenzPass} variant='contained' size='large'>
        {t('createKoblenzPass')}
      </ActionButton>
      <BasicDialog
        open={openReferenceInformation}
        maxWidth='lg'
        onUpdateOpen={setOpenReferenceInformation}
        title={t('whereToFindReferenceNumber')}
        content={
          <>
            {t('whereToFindReferenceNumberExplanation')} <br />
            {t('moreInformationAndExamples')}
            <a href='https://www.koblenz.de/koblenzpass' target='_blank' rel='noreferrer'>
              www.koblenz.de/koblenzpass
            </a>
            . <br />
            <br /> {t('forQuestionsPleaseContact')}
            <a href='mailto:koblenzpass@stadt.koblenz.de'>koblenzpass@stadt.koblenz.de</a>.
          </>
        }
      />
      <BasicDialog
        open={openDataPrivacy}
        maxWidth='md'
        onUpdateOpen={setOpenDataPrivacy}
        title={projectConfig.dataPrivacyHeadline}
        content={<projectConfig.dataPrivacyContent />}
      />
    </>
  )
}

export default CardSelfServiceForm
