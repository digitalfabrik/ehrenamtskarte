import { DynamicActivationCode } from '../../generated/card_pb'
import { Region } from '../../generated/graphql'
import bayernConfig from '../../project-configs/bayern/config'
import nuernbergConfig from '../../project-configs/nuernberg/config'
import { generateCardInfo, initializeCardBlueprint } from '../CardBlueprint'
import { CsvError, generateCsv, getCSVFilename } from '../CsvFactory'
import { CreateCardsResult } from '../createCards'
import { NUERNBERG_PASS_ID_EXTENSION_NAME } from '../extensions/NuernbergPassIdExtension'

jest.mock('csv-stringify/browser/esm/sync', () => ({
  stringify: (input: string[][]) => input[0].join(','),
}))

jest.mock('../../project-configs/showcase/config')

const TEST_BLOB_CONSTRUCTOR = jest.fn()

describe('CsvFactory', () => {
  const nuernberg: Region = {
    id: 0,
    name: 'augsburg',
    prefix: 'a',
    activatedForApplication: true,
    activatedForCardConfirmationMail: true,
  }

  it('should use pass id for single cards export', () => {
    const testPassId = 86152
    const cards = [
      initializeCardBlueprint(nuernbergConfig.card, nuernberg, {
        fullName: 'Thea Test',
        extensions: {
          [NUERNBERG_PASS_ID_EXTENSION_NAME]: testPassId,
        },
      }),
    ]
    const filename = getCSVFilename(cards)
    expect(filename).toBe(`${testPassId}.csv`)
  })

  it('should use bulkname for multiple cards export', () => {
    const cards = [
      initializeCardBlueprint(nuernbergConfig.card, nuernberg, { fullName: 'Thea Test' }),
      initializeCardBlueprint(nuernbergConfig.card, nuernberg, { fullName: 'Theo Test' }),
    ]
    const filename = getCSVFilename(cards)
    expect(filename).toBe('SozialpassMassExport.csv')
  })

  it('should throw error if csv export is disabled', () => {
    const cards = [initializeCardBlueprint(nuernbergConfig.card, nuernberg, { fullName: 'Thea Test' })]

    const codes: CreateCardsResult[] = [
      {
        dynamicCardInfoHashBase64: 'rS8nukf7S9j8V1j+PZEkBQWlAeM2WUKkmxBHi1k9hRo=',
        dynamicActivationCode: new DynamicActivationCode({ info: generateCardInfo(cards[0]) }),
      },
    ]

    expect(() => generateCsv(codes, cards, bayernConfig.csvExport)).toThrow(
      new CsvError('CSV Export is disabled for this project')
    )
  })

  it('should return only header csv for empty input', async () => {
    jest
      .spyOn(global, 'Blob')
      .mockImplementationOnce(
        (blobParts?: BlobPart[] | undefined, options?: BlobPropertyBag | undefined): Blob =>
          TEST_BLOB_CONSTRUCTOR(blobParts, options)
      )

    if (!nuernbergConfig.csvExport.enabled) {
      throw Error('test failed')
    }
    generateCsv([], [], nuernbergConfig.csvExport)
    expect(TEST_BLOB_CONSTRUCTOR).toHaveBeenCalledWith([nuernbergConfig.csvExport.csvHeader.join(',')], {
      type: 'text/csv;charset=utf-8;',
    })
  })
})
