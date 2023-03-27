import React, { ReactElement, useContext, useState } from 'react'
import { Application } from './ApplicationsOverview'
import VerificationsView from './VerificationsView'
import JsonFieldView, { GeneralJsonField } from './JsonFieldView'
import { ProjectConfigContext } from '../../project-configs/ProjectConfigContext'
import { useWithdrawApplicationMutation } from '../../generated/graphql'

import { styled } from '@mui/system'
import { Button, Card, CircularProgress, Divider, Typography } from '@mui/material'
import { format } from 'date-fns'
import ConfirmDialog from '../../application/components/ConfirmDialog'
import { Delete } from '@mui/icons-material'
import { useSnackbar } from 'notistack'

const ApplicationViewCard = styled(Card)`
  max-width: 800px;
  margin: 10px;
  align-self: center;
`

type ApplicationApplicantViewProps = {
  application: Application
  providedKey: string
  gotWithdrawed: () => void
}

const ApplicationApplicantView = ({
  application,
  providedKey,
  gotWithdrawed,
}: ApplicationApplicantViewProps): ReactElement => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const { createdDate: createdDateString, jsonValue, id } = application
  const createdDate = new Date(createdDateString)
  const jsonField: GeneralJsonField = JSON.parse(jsonValue)
  const config = useContext(ProjectConfigContext)
  const baseUrl = `${process.env.REACT_APP_API_BASE_URL}/application/${config.projectId}/${id}`
  const { enqueueSnackbar } = useSnackbar()

  const [withdrawApplication, { loading: withdrawalLoading }] = useWithdrawApplicationMutation({
    onError: error => {
      console.error(error)
      enqueueSnackbar('Etwas ist schief gelaufen.', { variant: 'error' })
    },
    onCompleted: ({ withdrawed }: { withdrawed: boolean }) => {
      if (withdrawed) gotWithdrawed()
      else {
        console.error('Withdraw operation returned false.')
        enqueueSnackbar('Der Antrag wurde bereits zurückgezogen.', { variant: 'error' })
      }
    },
  })

  const submitWithdrawal = () => {
    withdrawApplication({
      variables: {
        accessKey: providedKey,
      },
    })
  }

  if (withdrawalLoading) return <CircularProgress style={{ margin: 'auto' }} />

  return (
    <ApplicationViewCard elevation={2}>
      <div style={{ overflow: 'visible', padding: '20px' }}>
        <Typography mb='8px' variant='h6'>
          Ihr Antrag auf die Ehrenamtskarte Bayern vom {format(createdDate, 'dd.MM.yyyy, HH:mm')}
        </Typography>
        <JsonFieldView jsonField={jsonField} baseUrl={baseUrl} key={0} hierarchyIndex={0} />
        <Divider style={{ margin: '24px 0px' }} />
        <VerificationsView verifications={application.verifications} />
        {!application.withdrawalDate && (
          <>
            <Divider style={{ margin: '24px 0px' }} />
            <Typography mt='8px' mb='16px' variant='body2'>
              Hier können Sie Ihren Antrag zurückziehen und Ihre Eingaben unwiderruflich löschen.
            </Typography>
            <Button variant='contained' endIcon={<Delete />} onClick={() => setDialogOpen(true)}>
              Antrag zurückziehen
            </Button>
            <ConfirmDialog
              open={dialogOpen}
              onUpdateOpen={setDialogOpen}
              title='Antrag zurückziehen?'
              content='Möchten Sie den Antrag zurückziehen?'
              onConfirm={submitWithdrawal}
            />
          </>
        )}
      </div>
    </ApplicationViewCard>
  )
}

export default ApplicationApplicantView