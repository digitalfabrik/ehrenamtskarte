import { Button, H4, Popover } from '@blueprintjs/core'
import React, { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const HelpButton = styled(Button)`
  margin: 0 10px;
`

const Description = styled.ul`
  margin: 4px 0;
`

const Headline = styled(H4)`
  text-align: center;
`

const PopoverContent = styled.div`
  padding: 10px;
`

const ApplicationStatusHelpButton = (): ReactElement => {
  const { t } = useTranslation('applications')
  return (
    <Popover
      content={
        <PopoverContent>
          <Headline>{t('whichStatusMeansWhat')}</Headline>
          <Description>
            <li>
              <b>{t('accepted')}:</b>
              <Description>
                {t('acceptedDescription')}
                <br />
                {t('cardCouldBeCreated')}
              </Description>
            </li>
            <li>
              <b>{t('rejected')}:</b>
              <Description>
                {t('rejectedDescription')}
                <br />
                {t('applicationCouldBeDeleted')}
              </Description>
            </li>
            <li>
              <b>{t('withdrawed')}:</b>
              <Description>
                {t('withdrawedDescription')}
                <br />
                {t('applicationCouldBeDeleted')}
              </Description>
            </li>
            <li>
              <b>{t('open')}:</b>
              <Description>
                {t('pendingDescription')}
                <br />
                {t('cardShouldNotYetBeCreated')}
              </Description>
            </li>
          </Description>
        </PopoverContent>
      }>
      <HelpButton icon='help' minimal />
    </Popover>
  )
}

export default ApplicationStatusHelpButton
