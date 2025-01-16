import { Delete } from '@mui/icons-material'
import { Button } from '@mui/material'
import React, { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import ConfirmDialog from './ConfirmDialog'

const DiscardAllInputsButton = ({ discardAll }: { discardAll: () => void }): ReactElement => {
  const { t } = useTranslation('application')
  const [dialogOpen, setDialogOpen] = useState(false)
  return (
    <>
      <Button variant='outlined' endIcon={<Delete />} onClick={() => setDialogOpen(true)}>
        Alle Eingaben verwerfen
      </Button>
      <ConfirmDialog
        open={dialogOpen}
        onUpdateOpen={setDialogOpen}
        title={t('discardInputsTitle')}
        content={t('discardInputsContent')}
        onConfirm={discardAll}
      />
    </>
  )
}

export default DiscardAllInputsButton
