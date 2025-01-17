import { stringify } from 'csv-stringify/browser/esm/sync'
import i18next from 'i18next'

import { CardStatisticsResultModel, Region } from '../../generated/graphql'
import { CardStatistics } from '../../project-configs/getProjectConfig'

export class CsvStatisticsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CSVStatisticsError'
  }
}

export const getCsvFileName = (dateRange: string, region?: Region): string =>
  region ? `${region.prefix}${region.name}_CardStatistics_${dateRange}.csv` : `CardStatistics_${dateRange}.csv`

export const generateCsv = (statistics: CardStatisticsResultModel[], cardStatistics: CardStatistics): Blob => {
  if (!cardStatistics.enabled) {
    throw new CsvStatisticsError('CSV statistic export is disabled for this project')
  }
  if (statistics.length === 0) {
    throw new CsvStatisticsError('There is no data available to create a csv file')
  }
  const header = Object.keys(statistics[0]).map(it => i18next.t(`statistics:${it}`))
  let csvContent = stringify([header])
  try {
    statistics.forEach(element => {
      csvContent += stringify([[element.region, element.cardsCreated, element.cardsActivated]])
    })
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  } catch (error) {
    if (error instanceof Error) {
      throw new CsvStatisticsError(error.message)
    }
    throw error
  }
}
