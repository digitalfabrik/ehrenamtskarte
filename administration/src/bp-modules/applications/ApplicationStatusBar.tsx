import React, { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ApplicationStatusHelpButton from './ApplicationStatusBarHelpButton'
import ApplicationStatusBarItem from './ApplicationStatusBarItem'
import { Application } from './ApplicationsOverview'
import { getStatus } from './VerificationsView'
import { ApplicationStatus, ApplicationStatusBarItemType } from './constants'
import { getApplicationStatus } from './utils'

const Container = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
  max-width: 90%;
  width: 1000px;
  align-self: center;
  @media print {
    display: none;
  }
`
const BarItemContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: space-evenly;
  border: 1px solid #8f99a84d;
  border-radius: 2px;
  box-shadow: 0 0 0 1px rgba(17, 20, 24, 0.1), 0 1px 1px rgba(17, 20, 24, 0.2);

  > * {
    &:not(:first-child) {
      border-left: 1px solid #585858;
    }
  }
`
const Title = styled.span`
  font-size: 20px;
  font-weight: bold;
`

type ApplicationStatusBarProps = {
  applications: Application[]
  setActiveBarItem: (item: ApplicationStatusBarItemType) => void
  activeBarItem: ApplicationStatusBarItemType
  barItems: ApplicationStatusBarItemType[]
}

const getApplicationCount = (applications: Application[], status?: ApplicationStatus): number => {
  if (status === undefined) {
    return applications.length
  }
  return applications.filter(
    application =>
      getApplicationStatus(application.verifications.map(getStatus), !!application.withdrawalDate) === status
  ).length
}

const ApplicationStatusBar = ({
  applications,
  activeBarItem,
  barItems,
  setActiveBarItem,
}: ApplicationStatusBarProps): ReactElement => {
  const { t } = useTranslation('applications')
  return (
    <Container>
      <Title>{t('status')}</Title>
      <ApplicationStatusHelpButton />
      <BarItemContainer>
        {barItems.map(item => (
          <ApplicationStatusBarItem
            key={item.title}
            count={getApplicationCount(applications, item.status)}
            item={item}
            setActiveBarItem={setActiveBarItem}
            active={item === activeBarItem}
          />
        ))}
      </BarItemContainer>
    </Container>
  )
}

export default ApplicationStatusBar
