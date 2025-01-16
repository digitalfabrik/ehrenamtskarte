import CloseIcon from '@mui/icons-material/Close'
import { Breakpoint, Button, Dialog, DialogContent, DialogContentText, DialogTitle, styled } from '@mui/material'
import React, { ReactElement, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import useWindowDimensions from '../../hooks/useWindowDimensions'

const StyledDialogTitle = styled(DialogTitle)`
  display: flex;
  justify-content: space-between;
`

const CloseButtonDesktop = styled(CloseIcon)`
  cursor: pointer;
`

const StyledDialogText = styled(DialogContentText)`
  white-space: pre-line;
`
const ButtonContainer = styled('div')`
  display: flex;
  align-self: flex-end;
  justify-content: flex-end;
  padding: 8px 16px;
`

const CloseButtonMobile = styled(Button)`
  color: black;
  text-transform: none;
`

const BasicDialog = ({
  open,
  onUpdateOpen,
  title,
  content,
  maxWidth,
}: {
  open: boolean
  onUpdateOpen: (open: boolean) => void
  title: string
  content: ReactNode
  maxWidth?: Breakpoint | false
}): ReactElement => {
  const { t } = useTranslation('application')
  const { viewportSmall } = useWindowDimensions()
  return (
    <Dialog open={open} onBackdropClick={() => onUpdateOpen(false)} maxWidth={maxWidth}>
      <StyledDialogTitle>
        {title}
        {!viewportSmall && <CloseButtonDesktop onClick={() => onUpdateOpen(false)} />}
      </StyledDialogTitle>
      <DialogContent>
        <StyledDialogText>{content}</StyledDialogText>
      </DialogContent>
      {viewportSmall && (
        <ButtonContainer>
          <CloseButtonMobile onClick={() => onUpdateOpen(false)} variant='text'>
            {t('misc:close')}
          </CloseButtonMobile>
        </ButtonContainer>
      )}
    </Dialog>
  )
}

export default BasicDialog
