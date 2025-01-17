import { NonIdealState } from '@blueprintjs/core'
import React, { ChangeEvent, ReactElement, useCallback, useContext, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'

import { FREINET_PARAM } from '../../Router'
import { Card, initializeCardFromCSV } from '../../cards/Card'
import { Region } from '../../generated/graphql'
import { ProjectConfigContext } from '../../project-configs/ProjectConfigContext'
import { getCsvHeaders } from '../../project-configs/helper'
import { useAppToaster } from '../AppToaster'
import FileInputStateIcon from '../FileInputStateIcon'
import convertFreinetImport from '../util/convertFreinetImport'
import ImportCardsRequirementsText from './ImportCardsRequirementsText'

const CardImportInputContainer = styled.div`
  display: flex;
  align-items: center;
`

const InputContainer = styled(NonIdealState)`
  display: flex;
  align-items: center;
  flex-grow: 1;
  justify-content: center;
`

const defaultExtensionsByMIMEType = {
  'text/csv': '.csv',
}

export const FILE_SIZE_LIMIT_MEGA_BYTES = 2
const FILE_SIZE_LIMIT_BYTES = FILE_SIZE_LIMIT_MEGA_BYTES * 1000 * 1000
export const ENTRY_LIMIT = 300

type ImportCardsInputProps = {
  setCards: (cards: Card[]) => void
  region: Region
}

const ImportCardsInput = ({ setCards, region }: ImportCardsInputProps): ReactElement => {
  const isFreinetFormat = new URLSearchParams(useLocation().search).get(FREINET_PARAM) === 'true'
  const projectConfig = useContext(ProjectConfigContext)
  const csvHeaders = getCsvHeaders(projectConfig)
  const { t } = useTranslation('cards')
  const [inputState, setInputState] = useState<'loading' | 'error' | 'idle'>('idle')
  const fileInput = useRef<HTMLInputElement>(null)
  const appToaster = useAppToaster()

  const showInputError = useCallback(
    (message: string) => {
      appToaster?.show({ intent: 'danger', message })
      setInputState('error')
      if (!fileInput.current) {
        return
      }
      fileInput.current.value = ''
    },
    [appToaster]
  )

  const onLoadEnd = useCallback(
    (event: ProgressEvent<FileReader>) => {
      const content = event.target?.result as string
      const lines = content
        .split('\n')
        .filter(line => line.trim().length)
        .map(line => line.split(/[,;]/).map(cell => cell.trim()))

      const numberOfColumns = lines[0]?.length

      if (!numberOfColumns) {
        showInputError(t('importFileIsEmpty'))
        return
      }

      if (lines.length < 2) {
        showInputError(t('importFileHasNoEntries'))
        return
      }

      if (!lines.every(line => line.length === numberOfColumns)) {
        showInputError(t('importFileInvalidLineLength'))
        return
      }

      if (lines.length > ENTRY_LIMIT + 1) {
        showInputError(t('importFileTooManyEntries', { limit: ENTRY_LIMIT }))
        return
      }

      const [csvHeaders, ...entries] = isFreinetFormat ? convertFreinetImport(lines, projectConfig) : lines
      const cards = entries.map(line => initializeCardFromCSV(projectConfig.card, line, csvHeaders, region))

      setCards(cards)
      setInputState('idle')
    },
    [setCards, showInputError, isFreinetFormat, projectConfig, region, t]
  )

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.currentTarget.files) {
      return
    }
    const reader = new FileReader()
    reader.onloadend = onLoadEnd

    const file = event.currentTarget.files[0]
    if (!(file.type in defaultExtensionsByMIMEType)) {
      showInputError(t('importFileWrongFormat'))
      return
    }

    if (file.size > FILE_SIZE_LIMIT_BYTES) {
      showInputError(t('importFileTooBig'))
      return
    }
    setInputState('loading')
    reader.readAsText(file)
  }

  return (
    <InputContainer
      title={t('selectAFile')}
      icon={<FileInputStateIcon inputState={inputState} />}
      description={<ImportCardsRequirementsText csvHeaders={csvHeaders} isFreinetFormat={isFreinetFormat} />}
      action={
        <CardImportInputContainer>
          <input
            data-testid='file-upload'
            ref={fileInput}
            accept='.csv, text/csv'
            type='file'
            onInput={onInputChange}
          />
        </CardImportInputContainer>
      }
    />
  )
}

export default ImportCardsInput
