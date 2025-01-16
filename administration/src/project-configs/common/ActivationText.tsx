import { Button, Typography, styled } from '@mui/material'
import { TFunction } from 'i18next'
import React, { ReactElement } from 'react'
import { Trans } from 'react-i18next'

const ActivationButton = styled(Button)`
  margin-top: 12px;
  :hover {
    color: white;
  }
`

export const ActivationText = (
  applicationName: string,
  downloadLink: string,
  deepLink: string,
  t: TFunction
): ReactElement => (
  <div>
    <Typography variant='h6' mb='8px'>
      {t('headline')}
    </Typography>
    <span>
      <Trans i18nKey='activation:description' values={{ applicationName }} /> <br />{' '}
      <ActivationButton href={deepLink} variant='contained' size='small'>
        {t('activateButton')}
      </ActivationButton>
      <br /> <br />
      <b>{t('steps')}</b>
    </span>
    <ol>
      <li>
        <Trans i18nKey='activation:downloadApp' values={{ applicationName }} />
        Laden Sie sich die App <b>{applicationName}</b> im App- oder PlayStore auf Ihrem Smartphone herunter.
      </li>
      <li>
        {' '}
        {t('openOnMobileDevice')}
        <br />
        <a href={downloadLink} target='_blank' rel='noreferrer'>
          {downloadLink}
        </a>
      </li>
      <li>{t('explanation')}</li>
    </ol>
  </div>
)
