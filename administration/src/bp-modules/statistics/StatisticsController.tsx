import { NonIdealState } from '@blueprintjs/core'
import React, { ReactElement, useContext } from 'react'
import { useTranslation } from 'react-i18next'

import { WhoAmIContext } from '../../WhoAmIProvider'
import {
  Region,
  Role,
  useGetCardStatisticsInProjectQuery,
  useGetCardStatisticsInRegionQuery,
} from '../../generated/graphql'
import { ProjectConfigContext } from '../../project-configs/ProjectConfigContext'
import getQueryResult from '../util/getQueryResult'
import StatisticsOverview from './StatisticsOverview'
import { defaultEndDate, defaultStartDate } from './constants'

const ViewProjectStatistics = () => {
  const { t } = useTranslation('errors')
  const { projectId } = useContext(ProjectConfigContext)
  const cardStatisticsQuery = useGetCardStatisticsInProjectQuery({
    variables: { projectId, dateEnd: defaultEndDate, dateStart: defaultStartDate },
  })
  const cardStatisticsQueryResult = getQueryResult(cardStatisticsQuery, t)

  const applyFilter = (dateStart: string, dateEnd: string) => {
    cardStatisticsQuery.refetch({ projectId, dateEnd, dateStart })
  }

  if (!cardStatisticsQueryResult.successful) {
    return cardStatisticsQueryResult.component
  }
  return <StatisticsOverview onApplyFilter={applyFilter} statistics={cardStatisticsQueryResult.data.result} />
}

const ViewRegionStatistics = ({ region }: { region: Region }) => {
  const { t } = useTranslation('errors')
  const { projectId } = useContext(ProjectConfigContext)
  const cardStatisticsQuery = useGetCardStatisticsInRegionQuery({
    variables: {
      projectId,
      dateEnd: defaultEndDate,
      dateStart: defaultStartDate,
      regionId: region.id,
    },
  })
  const cardStatisticsQueryResult = getQueryResult(cardStatisticsQuery, t)

  const applyFilter = (dateStart: string, dateEnd: string) => {
    cardStatisticsQuery.refetch({ projectId, dateEnd, dateStart, regionId: region.id })
  }

  if (!cardStatisticsQueryResult.successful) {
    return cardStatisticsQueryResult.component
  }
  return (
    <StatisticsOverview
      onApplyFilter={applyFilter}
      statistics={cardStatisticsQueryResult.data.result}
      region={region}
    />
  )
}
const StatisticsController = (): ReactElement => {
  const { role, region } = useContext(WhoAmIContext).me!
  const { cardStatistics } = useContext(ProjectConfigContext)
  const { t } = useTranslation('errors')

  if (role === Role.RegionAdmin && region && cardStatistics.enabled) {
    return <ViewRegionStatistics region={region} />
  }
  if (role === Role.ProjectAdmin && cardStatistics.enabled) {
    return <ViewProjectStatistics />
  }
  return <NonIdealState icon='cross' title={t('notAuthorized')} description={t('notAuthorizedToSeeStatistics')} />
}
export default StatisticsController
