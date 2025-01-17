import i18next from 'i18next'

import { CardStatisticsResultModel, Region } from '../../../generated/graphql'
import bayernConfig from '../../../project-configs/bayern/config'
import nuernbergConfig from '../../../project-configs/nuernberg/config'
import { CsvStatisticsError, generateCsv, getCsvFileName } from '../CSVStatistics'

jest.mock('csv-stringify/browser/esm/sync', () => ({
  stringify: (input: string[][]) => input[0].join(','),
}))

jest.mock('../../../project-configs/showcase/config')
const TEST_BLOB_CONSTRUCTOR = jest.fn()
describe('CSVStatistics', () => {
  const region: Region = {
    id: 0,
    name: 'Augsburg',
    prefix: 'Stadt',
    activatedForApplication: true,
    activatedForCardConfirmationMail: true,
  }
  const dateString = '2023-02-01_2024-03-01'

  const statisticsData: CardStatisticsResultModel[] = [
    { region: 'Stadt Augsburg', cardsCreated: 10, cardsActivated: 0 },
  ]
  const statisticsHeader = Object.keys(statisticsData[0]).map(it => i18next.t(`statistics:${it}`))

  it('should create a proper filename for a single region', () => {
    const filename = getCsvFileName(dateString, region)
    expect(filename).toBe(`${region.prefix}${region.name}_CardStatistics_${dateString}.csv`)
  })

  it('should create a proper filename if no region was passed', () => {
    const filename = getCsvFileName(dateString)
    expect(filename).toBe(`CardStatistics_${dateString}.csv`)
  })

  it('should throw an error if card statistics are not enabled', () => {
    expect(() => generateCsv(statisticsData, nuernbergConfig.cardStatistics)).toThrow(
      new CsvStatisticsError('CSV statistic export is disabled for this project')
    )
  })

  it('should throw an error if there is no data to export', () => {
    expect(() => generateCsv([], bayernConfig.cardStatistics)).toThrow(
      new CsvStatisticsError('There is no data available to create a csv file')
    )
  })

  it('should create a correct csv blob', async () => {
    jest
      .spyOn(global, 'Blob')
      .mockImplementationOnce(
        (blobParts?: BlobPart[] | undefined, options?: BlobPropertyBag | undefined): Blob =>
          TEST_BLOB_CONSTRUCTOR(blobParts, options)
      )

    generateCsv(statisticsData, bayernConfig.cardStatistics)
    expect(TEST_BLOB_CONSTRUCTOR).toHaveBeenCalledWith(
      [
        `${statisticsHeader.join(',')}${statisticsData[0].region},${statisticsData[0].cardsCreated},${
          statisticsData[0].cardsActivated
        }`,
      ],
      {
        type: 'text/csv;charset=utf-8;',
      }
    )
  })
})
