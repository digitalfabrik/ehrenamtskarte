import { Button, Tooltip } from '@blueprintjs/core'
import React, { ReactElement, useContext } from 'react'
import { useTranslation } from 'react-i18next'

import { Card, isValid } from '../../cards/Card'
import { ProjectConfigContext } from '../../project-configs/ProjectConfigContext'
import ButtonBar from '../ButtonBar'

type CreateCardsButtonBarProps = {
  cards: Card[]
  goBack: () => void
  generateCardsPdf: () => Promise<void>
  generateCardsCsv: () => Promise<void>
}

const CreateCardsButtonBar = ({
  cards,
  generateCardsPdf,
  generateCardsCsv,
  goBack,
}: CreateCardsButtonBarProps): ReactElement => {
  const allCardsValid = cards.every(card => isValid(card))
  const { csvExport } = useContext(ProjectConfigContext)
  const { t } = useTranslation('cards')

  return (
    <ButtonBar>
      <Button icon='arrow-left' text={t('backToSelection')} onClick={goBack} />
      <Tooltip
        placement='top'
        content={cards.length === 0 ? t('createOnCard') : t('atLeastOnCardIsInvalid')}
        disabled={allCardsValid && cards.length > 0}>
        <Button
          icon='export'
          text={t('printQRCodes')}
          intent='success'
          onClick={generateCardsPdf}
          disabled={!allCardsValid || cards.length === 0}
        />
      </Tooltip>
      {csvExport.enabled && (
        <Tooltip
          placement='top'
          content={cards.length === 0 ? t('createOnCard') : t('atLeastOnCardIsInvalid')}
          disabled={allCardsValid && cards.length > 0}>
          <Button
            icon='th-derived'
            text={t('exportCsv')}
            intent='success'
            onClick={generateCardsCsv}
            disabled={!allCardsValid || cards.length === 0}
          />
        </Tooltip>
      )}
    </ButtonBar>
  )
}

export default CreateCardsButtonBar
