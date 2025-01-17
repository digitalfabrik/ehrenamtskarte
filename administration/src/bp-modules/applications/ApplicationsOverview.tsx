import { NonIdealState } from '@blueprintjs/core'
import { TFunction } from 'i18next'
import React, { ReactElement, useMemo, useState } from 'react'
import FlipMove from 'react-flip-move'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { GetApplicationsQuery } from '../../generated/graphql'
import StandaloneCenter from '../StandaloneCenter'
import ApplicationCard, { ApplicationCardProps } from './ApplicationCard'
import ApplicationStatusBar from './ApplicationStatusBar'
import { getStatus } from './VerificationsView'
import { ApplicationStatusBarItemType, barItems } from './constants'
import usePrintApplication from './hooks/usePrintApplication'
import { getApplicationStatus } from './utils'

const ApplicationListCard = styled.li`
  display: flex;
  width: 100%;
  justify-content: center;
  list-style-type: none;
`

const ApplicationList = styled(FlipMove)`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  align-items: center;
`

export type Application = GetApplicationsQuery['applications'][number]

// Necessary for FlipMove, as it cannot handle functional components
// eslint-disable-next-line react/prefer-stateless-function
export class ApplicationViewComponent extends React.Component<ApplicationCardProps> {
  render(): ReactElement {
    const { application } = this.props
    return (
      <ApplicationListCard key={application.id}>
        <ApplicationCard {...this.props} />
      </ApplicationListCard>
    )
  }
}

const sortByStatus = (a: number, b: number): number => a - b
const sortByDateAsc = (a: Date, b: Date): number => a.getTime() - b.getTime()

// Applications will be sorted by status f.e. fullyVerified/fullyRejected/withdrawed/ambiguous and within this status by creation date asc
const sortApplications = (applications: Application[]): Application[] =>
  applications
    .map(application => ({
      ...application,
      status: getApplicationStatus(application.verifications.map(getStatus), !!application.withdrawalDate),
    }))
    .sort((a, b) => sortByStatus(a.status, b.status) || sortByDateAsc(new Date(a.createdDate), new Date(b.createdDate)))

const getEmptyApplicationsListStatusDescription = (activeBarItem: ApplicationStatusBarItemType, t: TFunction): string =>
  activeBarItem.status !== undefined ? `${t(activeBarItem.title).toLowerCase()}en` : ''

const ApplicationsOverview = ({ applications }: { applications: Application[] }): ReactElement => {
  const [updatedApplications, setUpdatedApplications] = useState(applications)
  const { applicationIdForPrint, printApplicationById } = usePrintApplication()
  const [activeBarItem, setActiveBarItem] = useState<ApplicationStatusBarItemType>(barItems[0])
  const { t } = useTranslation('applications')
  const sortedApplications: Application[] = useMemo(() => sortApplications(updatedApplications), [updatedApplications])
  const filteredApplications: Application[] = useMemo(
    () =>
      sortedApplications.filter(application => {
        if (activeBarItem.status === undefined) {
          return application
        }
        return (
          getApplicationStatus(application.verifications.map(getStatus), !!application.withdrawalDate) ===
          activeBarItem.status
        )
      }),
    [activeBarItem, sortedApplications]
  )

  return (
    <>
      <ApplicationStatusBar
        applications={updatedApplications}
        activeBarItem={activeBarItem}
        setActiveBarItem={setActiveBarItem}
        barItems={barItems}
      />
      {filteredApplications.length > 0 ? (
        <ApplicationList>
          {filteredApplications.map(application => (
            <ApplicationViewComponent
              isSelectedForPrint={application.id === applicationIdForPrint}
              printApplicationById={printApplicationById}
              key={application.id}
              application={application}
              onDelete={() => setUpdatedApplications(sortedApplications.filter(a => a !== application))}
              onChange={application =>
                setUpdatedApplications(sortedApplications.map(a => (a.id === application.id ? application : a)))
              }
            />
          ))}
        </ApplicationList>
      ) : (
        <StandaloneCenter>
          <NonIdealState
            title={t('noApplicationsOfType', { status: getEmptyApplicationsListStatusDescription(activeBarItem, t) })}
            icon='clean'
            description={t('noApplicationsOfTypeDescription', {
              status: getEmptyApplicationsListStatusDescription(activeBarItem, t),
            })}
          />
        </StandaloneCenter>
      )}
    </>
  )
}

export default ApplicationsOverview
