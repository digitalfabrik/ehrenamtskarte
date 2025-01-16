import { MockedProvider as ApolloProvider } from '@apollo/client/testing'
import { OverlayToaster } from '@blueprintjs/core'
import { act, renderHook } from '@testing-library/react'
import { mocked } from 'jest-mock'
import React, { ReactNode } from 'react'

import { generateCardInfo, initializeCard } from '../../../cards/Card'
import { PdfError, generatePdf } from '../../../cards/PdfFactory'
import createCards, { CreateCardsError, CreateCardsResult } from '../../../cards/createCards'
import deleteCards from '../../../cards/deleteCards'
import { DynamicActivationCode, StaticVerificationCode } from '../../../generated/card_pb'
import { Region } from '../../../generated/graphql'
import { ProjectConfigProvider } from '../../../project-configs/ProjectConfigContext'
import bayernConfig from '../../../project-configs/bayern/config'
import downloadDataUri from '../../../util/downloadDataUri'
import { AppToasterProvider } from '../../AppToaster'
import useCardGenerator, { CardActivationState } from './useCardGenerator'

const wrapper = ({ children }: { children: ReactNode }) => (
  <AppToasterProvider>
    <ApolloProvider>
      <ProjectConfigProvider>{children}</ProjectConfigProvider>
    </ApolloProvider>
  </AppToasterProvider>
)

jest.mock('../../../cards/PdfFactory', () => ({
  ...jest.requireActual('../../../cards/PdfFactory'),
  generatePdf: jest.fn(),
}))
jest.mock('../../../cards/createCards', () => ({
  ...jest.requireActual('../../../cards/createCards'),
  __esModule: true,
  default: jest.fn(),
}))
jest.mock('../../../cards/deleteCards')
jest.mock('../../../util/downloadDataUri')

describe('useCardGenerator', () => {
  const region: Region = {
    id: 0,
    name: 'augsburg',
    prefix: 'a',
    activatedForApplication: true,
    activatedForCardConfirmationMail: true,
  }

  const cards = [
    initializeCard(bayernConfig.card, region, { fullName: 'Thea Test' }),
    initializeCard(bayernConfig.card, region, { fullName: 'Thea Test' }),
  ]
  const codes: CreateCardsResult[] = [
    {
      dynamicCardInfoHashBase64: 'rS8nukf7S9j8V1j+PZEkBQWlAeM2WUKkmxBHi1k9hRo=',
      dynamicActivationCode: new DynamicActivationCode({ info: generateCardInfo(cards[0]) }),
    },
    {
      dynamicCardInfoHashBase64: 'rS8nukf7S9j8V1j+PZEkBQWlAeM2WUKkmxBHi1k9hRo=',
      dynamicActivationCode: new DynamicActivationCode({ info: generateCardInfo(cards[1]) }),
      staticCardInfoHashBase64: 'rS8nukf7S9j8V1j+PZEkBQWlAeM2WUKkmxBHi1k9hRo=',
      staticVerificationCode: new StaticVerificationCode({ info: generateCardInfo(cards[1]) }),
    },
  ]

  beforeEach(jest.resetAllMocks)

  it('should successfully create multiple cards', async () => {
    const toasterSpy = jest.spyOn(OverlayToaster.prototype, 'show')
    mocked(createCards).mockReturnValueOnce(Promise.resolve(codes))
    const { result } = renderHook(() => useCardGenerator(region), { wrapper })

    act(() => result.current.setCards(cards))

    expect(result.current.cards).toEqual(cards)
    await act(async () => {
      await result.current.generateCardsPdf()
    })

    expect(toasterSpy).not.toHaveBeenCalled()
    expect(createCards).toHaveBeenCalled()
    expect(downloadDataUri).toHaveBeenCalled()
    expect(result.current.state).toBe(CardActivationState.finished)
    expect(result.current.cards).toEqual([])
  })

  it('should show error message for failed card generation', async () => {
    const toasterSpy = jest.spyOn(OverlayToaster.prototype, 'show')
    mocked(createCards).mockImplementation(() => {
      throw new CreateCardsError('error')
    })

    const { result } = renderHook(() => useCardGenerator(region), { wrapper })

    act(() => result.current.setCards(cards))

    expect(result.current.cards).toEqual(cards)
    await act(async () => {
      await result.current.generateCardsPdf()
    })

    expect(toasterSpy).toHaveBeenCalledWith({ message: 'error', intent: 'danger' })
    expect(downloadDataUri).not.toHaveBeenCalled()
    expect(result.current.state).toBe(CardActivationState.input)
    expect(result.current.cards).toEqual([])
  })

  it('should show error message and run rollback for failed pdf generation', async () => {
    mocked(createCards).mockReturnValueOnce(Promise.resolve(codes))
    mocked(deleteCards).mockReturnValueOnce(Promise.resolve())
    mocked(generatePdf).mockImplementationOnce(() => {
      throw new PdfError('error')
    })
    const toasterSpy = jest.spyOn(OverlayToaster.prototype, 'show')

    const { result } = renderHook(() => useCardGenerator(region), { wrapper })

    act(() => result.current.setCards(cards))

    expect(result.current.cards).toEqual(cards)
    await act(async () => {
      await result.current.generateCardsPdf()
    })
    /*
    const codesToDelete = [
      codes[0].dynamicCardInfoHashBase64,
      codes[1].staticCardInfoHashBase64,
      codes[1].dynamicCardInfoHashBase64,
    ]
  */
    expect(toasterSpy).toHaveBeenCalledWith(expect.objectContaining({ intent: 'danger' }))
    expect(deleteCards).toHaveBeenCalled()
    // TODO 1869 Finalize translations - fix test to call delete cards with parameters
    // expect(deleteCards).toHaveBeenCalledWith(expect.anything(), region.id, codesToDelete)
    expect(downloadDataUri).not.toHaveBeenCalled()
    expect(result.current.state).toBe(CardActivationState.input)
    expect(result.current.cards).toEqual([])
  })
})
