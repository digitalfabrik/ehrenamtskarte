import { Button, FormGroup, InputGroup, Intent, Card as UiCard } from '@blueprintjs/core'
import { TextField } from '@mui/material'
import React, { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { Card, hasInfiniteLifetime, isExpirationDateValid, isFullNameValid } from '../../cards/Card'
import PlainDate from '../../util/PlainDate'
import ExtensionForms from './ExtensionForms'

const CardHeader = styled.div`
  margin: -20px -20px 20px -20px;
  padding: 1px;
  border-bottom: 1px solid rgba(16, 22, 26, 0.15);
  display: flex;
  justify-content: right;
`

type CreateCardsFormProps = {
  card: Card
  updateCard: (card: Partial<Card>) => void
  onRemove: () => void
}

export const maxCardValidity = { years: 99 }

const AddCardForm = ({ card, onRemove, updateCard }: CreateCardsFormProps): ReactElement => {
  const today = PlainDate.fromLocalDate(new Date())
  const { t } = useTranslation('cards')

  return (
    <UiCard>
      <CardHeader>
        <Button minimal icon='cross' onClick={() => onRemove()} />
      </CardHeader>
      <FormGroup label={t('name')}>
        <InputGroup
          placeholder='Erika Mustermann'
          autoFocus
          // If the size of the card is too large, show a warning at the name field as it is the only dynamically sized field
          intent={isFullNameValid(card) ? undefined : Intent.DANGER}
          value={card.fullName}
          onChange={event => updateCard({ fullName: event.target.value })}
        />
      </FormGroup>
      {!hasInfiniteLifetime(card) && (
        <FormGroup label={t('expirationDate')}>
          <TextField
            fullWidth
            type='date'
            required
            size='small'
            error={!isExpirationDateValid(card)}
            value={card.expirationDate?.toString()}
            sx={{ '& input[value=""]:not(:focus)': { color: 'transparent' }, '& fieldset': { borderRadius: 0 } }}
            inputProps={{
              style: { fontSize: 14, padding: '6px 10px' },
              min: today.toString(),
              max: today.add(maxCardValidity).toString(),
            }}
            onChange={event => updateCard({ expirationDate: PlainDate.safeFrom(event.target.value) })}
          />
        </FormGroup>
      )}
      <ExtensionForms card={card} updateCard={updateCard} showRequired />
    </UiCard>
  )
}

export default AddCardForm
