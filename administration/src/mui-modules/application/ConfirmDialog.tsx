import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import React, { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

const ConfirmDialog = ({
  open,
  onUpdateOpen,
  title,
  content,
  onConfirm,
  confirmButtonText,
}: {
  open: boolean
  onUpdateOpen: (open: boolean) => void
  title: string
  content: string
  onConfirm: () => void
  confirmButtonText?: string
}): ReactElement => {
  const { t } = useTranslation('application')
  return (
    <Dialog open={open} onClick={() => onUpdateOpen(false)}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onUpdateOpen(false)}>Abbrechen</Button>
        <Button
          onClick={() => {
            onUpdateOpen(false)
            onConfirm()
          }}>
          {confirmButtonText ?? t('misc:confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmDialog
