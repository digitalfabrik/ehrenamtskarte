import { Button, Tooltip } from '@blueprintjs/core'
import React, { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import getMessageFromApolloError from '../../errors/getMessageFromApolloError'
import { useUpdateApplicationNoteMutation } from '../../generated/graphql'
import { useAppToaster } from '../AppToaster'
import TextAreaDialog from '../components/TextAreaDialog'
import { Application } from './ApplicationsOverview'

const NoteButton = styled(Button)`
  margin-right: 10px;
  align-self: flex-start;
  @media print {
    display: none;
  }
`

const MultilineContent = styled(Tooltip)`
  white-space: pre-wrap;
`

type NoteDialogControllerProps = {
  application: Application
  onOpenNoteDialog: (value: boolean) => void
  isOpen: boolean
  onChange: (application: Application) => void
}

const EXCERPT_LENGTH = 80

const NoteDialogController = ({
  application,
  onOpenNoteDialog,
  isOpen,
  onChange,
}: NoteDialogControllerProps): ReactElement | null => {
  const appToaster = useAppToaster()
  const { t } = useTranslation('applications')
  const [updateApplicationNote, { loading }] = useUpdateApplicationNoteMutation({
    onError: error => {
      const { title } = getMessageFromApolloError(error, t)
      appToaster?.show({ intent: 'danger', message: title })
    },
    onCompleted: () => {
      appToaster?.show({ intent: 'success', message: t('noteChangedSuccessfully'), timeout: 2000 })
      onOpenNoteDialog(false)
    },
  })

  const onClose = () => onOpenNoteDialog(false)

  const onSave = (text: string) => {
    updateApplicationNote({ variables: { applicationId: application.id, text } }).then(
      result => result.data?.success && onChange({ ...application, note: text })
    )
  }

  const getNoteExcerpt = (maxChars: number, text: string): string =>
    text.length > maxChars ? `${text.slice(0, maxChars)} ...` : text

  const note = application.note

  const toolTipContent =
    note && note.length > 0 ? <MultilineContent>{getNoteExcerpt(EXCERPT_LENGTH, note)}</MultilineContent> : undefined
  return (
    <>
      <Tooltip content={toolTipContent}>
        <NoteButton onClick={() => onOpenNoteDialog(true)} intent='none' icon='annotation'>
          Notiz anzeigen
        </NoteButton>
      </Tooltip>
      {isOpen && (
        <TextAreaDialog
          defaultText={note}
          isOpen={isOpen}
          maxChars={1000}
          loading={loading}
          onSave={onSave}
          onClose={onClose}
          placeholder={t('applicationNotePlaceholder')}
        />
      )}
    </>
  )
}

export default NoteDialogController
