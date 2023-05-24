import { MockedProvider as ApolloProvider } from '@apollo/client/testing'
import { Toaster } from '@blueprintjs/core'
import { act, renderHook } from '@testing-library/react'
import { mocked } from 'jest-mock'
import { ReactElement } from 'react'

import CardBlueprint from '../../../cards/CardBlueprint'
import { PDFError, generatePdf } from '../../../cards/PdfFactory'
import createCards, { CreateCardsError } from '../../../cards/createCards'
import { Region } from '../../../generated/graphql'
import { ProjectConfigProvider } from '../../../project-configs/ProjectConfigContext'
import bayernConfig from '../../../project-configs/bayern/config'
import downloadDataUri from '../../../util/downloadDataUri'
import { AppToasterProvider } from '../../AppToaster'
import useCardGenerator, { CardActivationState } from './useCardGenerator'

const wrapper = ({ children }: { children: ReactElement }) => {
  return (
    <AppToasterProvider>
      <ApolloProvider>
        <ProjectConfigProvider>{children}</ProjectConfigProvider>
      </ApolloProvider>
    </AppToasterProvider>
  )
}

jest.mock('../../../util/downloadDataUri')

jest.mock('../../../cards/createCards', () => ({
  ...jest.requireActual('../../../cards/createCards'),
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('../../../cards/PdfFactory', () => ({
  ...jest.requireActual('../../../cards/PdfFactory'),
  generatePdf: jest.fn(() => new Blob(['pdf'], { type: 'application/pdf' })),
}))

describe('useCardGenerator', () => {
  const region: Region = {
    id: 0,
    name: 'augsburg',
    prefix: 'a',
  }

  const cards = [
    new CardBlueprint('Thea Test', bayernConfig.card, [region]),
    new CardBlueprint('Thea Test', bayernConfig.card, [region]),
  ]

  it('should successfully create multiple cards', async () => {
    const toasterSpy = jest.spyOn(Toaster.prototype, 'show')

    const { result } = renderHook(() => useCardGenerator(region), { wrapper })

    act(() => result.current.setCardBlueprints(cards))

    expect(result.current.cardBlueprints).toEqual(cards)
    await act(async () => {
      await result.current.generateCards()
    })

    expect(toasterSpy).not.toHaveBeenCalled()
    expect(createCards).toHaveBeenCalled()
    expect(downloadDataUri).toHaveBeenCalled()
    expect(result.current.state).toBe(CardActivationState.finished)
    expect(result.current.cardBlueprints).toEqual([])
  })

  it('should show error message for failed card generation', async () => {
    mocked(createCards).mockImplementationOnce(() => {
      throw new CreateCardsError('error')
    })
    const toasterSpy = jest.spyOn(Toaster.prototype, 'show')

    const { result } = renderHook(() => useCardGenerator(region), { wrapper: wrapper })

    act(() => result.current.setCardBlueprints(cards))

    expect(result.current.cardBlueprints).toEqual(cards)
    await act(async () => {
      await result.current.generateCards()
    })

    expect(toasterSpy).toHaveBeenCalledWith({ message: 'error', intent: 'danger' })
    expect(result.current.state).toBe(CardActivationState.input)
    expect(result.current.cardBlueprints).toEqual([])
  })

  it('should show error message for failed pdf generation', async () => {
    mocked(generatePdf).mockImplementationOnce(() => {
      throw new PDFError('error')
    })
    const toasterSpy = jest.spyOn(Toaster.prototype, 'show')

    const { result } = renderHook(() => useCardGenerator(region), { wrapper: wrapper })

    act(() => result.current.setCardBlueprints(cards))

    expect(result.current.cardBlueprints).toEqual(cards)
    await act(async () => {
      await result.current.generateCards()
    })

    expect(toasterSpy).toHaveBeenCalledWith(expect.objectContaining({ intent: 'danger' }))
    expect(result.current.state).toBe(CardActivationState.input)
    expect(result.current.cardBlueprints).toEqual([])
  })
})