import { Button, Card, Typography } from '@mui/material'
import { styled } from '@mui/system'
import React, { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

type ErrorHandlerProps = {
  title?: string
  description?: string | ReactElement
  refetch: () => void
}

const ErrorContainer = styled(Card)`
  padding: 20px;
`

const ErrorHandler = ({ refetch, title, description }: ErrorHandlerProps): ReactElement => {
  const { t } = useTranslation('errors')
  return (
    <ErrorContainer>
      <Typography variant='h6'>{title ?? t('unknownError')}</Typography>
      <Typography my='8px' variant='body1' component='div'>
        {description}
      </Typography>
      <Button color='primary' variant='contained' onClick={() => refetch()}>
        {t('retry')}
      </Button>
    </ErrorContainer>
  )
}

export default ErrorHandler
