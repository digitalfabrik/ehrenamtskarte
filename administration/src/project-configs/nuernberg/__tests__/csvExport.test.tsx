import { generateCardInfo, initializeCard } from '../../../cards/Card'
import { CreateCardsResult } from '../../../cards/createCards'
import { DynamicActivationCode } from '../../../generated/card_pb'
import { Region } from '../../../generated/graphql'
import nuernbergConfig from '../config'
import { buildCsvLine } from '../csvExport'

jest.mock('csv-stringify/browser/esm/sync', () => ({
  stringify: (input: string[][]) => input[0].join(','),
}))

jest.mock('../../getProjectConfig', () => ({
  __esModule: true,
  default: jest.fn(),
}))

describe('csvExport', () => {
  it('header should have same length as line', () => {
    const nuernberg: Region = {
      id: 0,
      name: 'augsburg',
      prefix: 'a',
      activatedForApplication: true,
      activatedForCardConfirmationMail: true,
    }
    const cards = [initializeCard(nuernbergConfig.card, nuernberg, { fullName: 'Thea Test' })]

    const codes: CreateCardsResult[] = [
      {
        dynamicCardInfoHashBase64: 'rS8nukf7S9j8V1j+PZEkBQWlAeM2WUKkmxBHi1k9hRo=',
        dynamicActivationCode: new DynamicActivationCode({ info: generateCardInfo(cards[0]) }),
      },
    ]

    const csvConfig = nuernbergConfig.csvExport
    expect(csvConfig.enabled).toBeTruthy()
    if (!csvConfig.enabled) {
      throw new Error('Tested failed')
    }
    expect(buildCsvLine(codes[0], cards[0]).split(',')).toHaveLength(csvConfig.csvHeader.length)
  })
})
