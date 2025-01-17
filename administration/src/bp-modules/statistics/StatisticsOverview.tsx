import React, { ReactElement, useContext } from 'react'
import { useTranslation } from 'react-i18next'

import { WhoAmIContext } from '../../WhoAmIProvider'
import { CardStatisticsResultModel, Region, Role } from '../../generated/graphql'
import { ProjectConfigContext } from '../../project-configs/ProjectConfigContext'
import downloadDataUri from '../../util/downloadDataUri'
import { useAppToaster } from '../AppToaster'
import { generateCsv, getCsvFileName } from './CSVStatistics'
import StatisticsBarChart from './components/StatisticsBarChart'
import StatisticsFilterBar from './components/StatisticsFilterBar'
import StatisticsTotalCardsCount from './components/StatisticsTotalCardsCount'

type StatisticsOverviewProps = {
  statistics: CardStatisticsResultModel[]
  onApplyFilter: (dateStart: string, dateEnd: string) => void
  region?: Region
}

const StatisticsOverview = ({ statistics, onApplyFilter, region }: StatisticsOverviewProps): ReactElement => {
  const { role } = useContext(WhoAmIContext).me!
  const appToaster = useAppToaster()
  const { cardStatistics } = useContext(ProjectConfigContext)
  const { t } = useTranslation('statistics')
  const exportCardDataToCsv = (dateStart: string, dateEnd: string) => {
    try {
      downloadDataUri(generateCsv(statistics, cardStatistics), getCsvFileName(`${dateStart}_${dateEnd}`, region))
    } catch {
      appToaster?.show({
        message: t('exportCsvNotPossible'),
        intent: 'danger',
      })
    }
  }

  return (
    <>
      {role === Role.ProjectAdmin && <StatisticsTotalCardsCount statistics={statistics} />}
      <StatisticsBarChart statistics={statistics} />
      <StatisticsFilterBar
        onApplyFilter={onApplyFilter}
        onExportCsv={exportCardDataToCsv}
        isDataAvailable={statistics.length > 0}
      />
    </>
  )
}

export default StatisticsOverview
