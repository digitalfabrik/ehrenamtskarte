import { Checkbox, FormGroup, InputGroup, Intent } from '@blueprintjs/core'
import InfoOutlined from '@mui/icons-material/InfoOutlined'
import { Alert, styled } from '@mui/material'
import React, { ReactElement, useContext, useEffect, useRef, useState } from 'react'

import { Card, isFullNameValid, isValid } from '../../cards/Card'
import ClearInputButton from '../../cards/extensions/components/ClearInputButton'
import useWindowDimensions from '../../hooks/useWindowDimensions'
import BasicDialog from '../../mui-modules/application/BasicDialog'
import { ProjectConfigContext } from '../../project-configs/ProjectConfigContext'
import PlainDate from '../../util/PlainDate'
import ExtensionForms from '../cards/ExtensionForms'
import { ActionButton } from './components/ActionButton'
import { IconTextButton } from './components/IconTextButton'
import { UnderlineTextButton } from './components/UnderlineTextButton'

const StyledCheckbox = styled(Checkbox)`
  margin-top: 24px;
  font-size: 16px;
  margin-left: 4px;
`

const StyledAlert = styled(Alert)`
  margin-bottom: 24px;
  white-space: pre-line;
`

const Container = styled('div')`
  margin-bottom: 24px;
`

type CardSelfServiceFormProps = {
  card: Card
  cardQueryParams: URLSearchParams
  updateCard: (card: Partial<Card>) => void
  dataPrivacyAccepted: boolean
  setDataPrivacyAccepted: (value: boolean) => void
  generateCards: () => Promise<void>
}

const getTooltipMessage = (cardsValid: boolean, dataPrivacyAccepted: boolean): string => {
  const tooltipMessages: string[] = []
  if (!cardsValid) {
    tooltipMessages.push('Mindestens eine Ihrer Angaben ist ungültig.')
  }
  if (!dataPrivacyAccepted) {
    tooltipMessages.push('Bitte akzeptieren Sie die Datenschutzerklärung.')
  }

  return tooltipMessages.join('\n')
}

const useInitializeCard = (cardQueryParams: URLSearchParams, updateCard: (card: Partial<Card>) => void) => {
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true

      const fullName = cardQueryParams.get('name')
      const birthday = cardQueryParams.get('geburtsdatum')

      const parsedBirthday: PlainDate | null = (() => {
        if (!birthday) {
          return null
        }
        try {
          return PlainDate.from(birthday)
        } catch {
          return null
        }
      })()

      const referenceNumber = cardQueryParams.get('ref')

      updateCard({
        ...(fullName !== null && { fullName }),
        extensions: {
          ...(referenceNumber !== null && { koblenzReferenceNumber: referenceNumber }),
          ...(parsedBirthday !== null && { birthday: parsedBirthday }),
        },
      })
    }
  }, [cardQueryParams, updateCard])
}

const CardSelfServiceForm = ({
  card,
  cardQueryParams,
  updateCard,
  dataPrivacyAccepted,
  setDataPrivacyAccepted,
  generateCards,
}: CardSelfServiceFormProps): ReactElement => {
  const { viewportSmall } = useWindowDimensions()
  const projectConfig = useContext(ProjectConfigContext)
  const [openDataPrivacy, setOpenDataPrivacy] = useState<boolean>(false)
  const [openReferenceInformation, setOpenReferenceInformation] = useState<boolean>(false)
  const cardValid = isValid(card, { expirationDateNullable: true })
  const cardCreationDisabled = !cardValid || !dataPrivacyAccepted

  useInitializeCard(cardQueryParams, updateCard)

  return (
    <>
      <Container key={card.id}>
        <FormGroup label='Vorname Nachname'>
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
            intent={isFullNameValid(card) ? undefined : Intent.DANGER}
            value={card.fullName}
            onChange={event => updateCard({ fullName: event.target.value })}
          />
        </FormGroup>
        <ExtensionForms card={card} updateCard={updateCard} />
        <IconTextButton onClick={() => setOpenReferenceInformation(true)}>
          <InfoOutlined />
          Informationen zur Referenznummer
        </IconTextButton>
        <StyledCheckbox checked={dataPrivacyAccepted} onChange={() => setDataPrivacyAccepted(!dataPrivacyAccepted)}>
          Ich akzeptiere die{' '}
          <UnderlineTextButton onClick={() => setOpenDataPrivacy(true)}>Datenschutzerklärung</UnderlineTextButton>.
        </StyledCheckbox>
      </Container>
      {cardCreationDisabled && (
        <StyledAlert variant='outlined' severity='warning'>
          {getTooltipMessage(cardValid, dataPrivacyAccepted)}
        </StyledAlert>
      )}
      <ActionButton onClick={generateCards} variant='contained' disabled={cardCreationDisabled} size='large'>
        Pass erstellen
      </ActionButton>
      <BasicDialog
        open={openReferenceInformation}
        maxWidth='lg'
        onUpdateOpen={setOpenReferenceInformation}
        title='Informationen zur Referenznummer'
        content={<>Noch keine Informationen verfügtbar, bitte wenden Sie sich an den Support.</>}
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
