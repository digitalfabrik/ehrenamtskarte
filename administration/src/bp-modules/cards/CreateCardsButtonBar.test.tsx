import { act, fireEvent, render } from '@testing-library/react'
import React, { ReactNode } from 'react'

import { initializeCard } from '../../cards/Card'
import { Region } from '../../generated/graphql'
import { ProjectConfigProvider } from '../../project-configs/ProjectConfigContext'
import bayernConfig from '../../project-configs/bayern/config'
import { renderWithTranslation } from '../../testing/render'
import CreateCardsButtonBar from './CreateCardsButtonBar'

jest.useFakeTimers()

const wrapper = ({ children }: { children: ReactNode }) => <ProjectConfigProvider>{children}</ProjectConfigProvider>

describe('CreateCardsButtonBar', () => {
  const region: Region = {
    id: 0,
    name: 'augsburg',
    prefix: 'a',
    activatedForApplication: true,
    activatedForCardConfirmationMail: true,
  }

  it('Should goBack when clicking back', async () => {
    const goBack = jest.fn()
    const { getByText } = render(
      <CreateCardsButtonBar
        goBack={goBack}
        cards={[]}
        generateCardsPdf={() => Promise.resolve()}
        generateCardsCsv={() => Promise.resolve()}
      />,
      { wrapper }
    )

    const backButton = getByText('Zurück zur Auswahl')
    expect(backButton).toBeTruthy()

    fireEvent.click(backButton)
    await act(async () => null) // Popper update() - https://github.com/popperjs/react-popper/issues/350

    expect(goBack).toHaveBeenCalled()
  })

  it('Should disable generate button for no cards', async () => {
    const generateCardsPdf = jest.fn()
    const generateCardsCsv = jest.fn()
    const { getByText } = renderWithTranslation(
      <CreateCardsButtonBar
        goBack={() => undefined}
        cards={[]}
        generateCardsPdf={generateCardsPdf}
        generateCardsCsv={generateCardsCsv}
      />,
      { wrapper }
    )

    const generateButton = getByText('QR-Codes drucken').closest('button') as HTMLButtonElement
    expect(generateButton).toBeTruthy()
    expect(generateButton.disabled).toBeTruthy()

    fireEvent.mouseOver(generateButton)
    fireEvent.click(generateButton)
    await act(async () => {
      jest.advanceTimersByTime(100)
    })

    expect(getByText('Legen Sie zunächst eine Karte an.')).toBeTruthy()
    expect(generateCardsPdf).not.toHaveBeenCalled()
  })

  it('Should disable generate button for invalid cards', async () => {
    const generateCardsPdf = jest.fn()
    const generateCardsCsv = jest.fn()
    const cards = [initializeCard(bayernConfig.card, region, { fullName: '' })]
    const { getByText } = renderWithTranslation(
      <CreateCardsButtonBar
        goBack={() => undefined}
        cards={cards}
        generateCardsPdf={generateCardsPdf}
        generateCardsCsv={generateCardsCsv}
      />,
      { wrapper }
    )

    const generateButton = getByText('QR-Codes drucken').closest('button') as HTMLButtonElement
    expect(generateButton).toBeTruthy()

    fireEvent.mouseOver(generateButton)
    fireEvent.click(generateButton)

    await act(async () => {
      jest.advanceTimersByTime(100)
    })

    expect(generateButton.disabled).toBeTruthy()
    expect(getByText('Mindestens eine Karte enthält ungültige Eingaben.')).toBeTruthy()
    expect(generateCardsPdf).not.toHaveBeenCalled()
  })

  it('Should generate valid cards', async () => {
    const generateCardsPdf = jest.fn()
    const generateCardsCsv = jest.fn()
    const cards = [initializeCard(bayernConfig.card, region, { fullName: 'Thea Test' })]
    const { getByText } = render(
      <CreateCardsButtonBar
        goBack={() => undefined}
        cards={cards}
        generateCardsPdf={generateCardsPdf}
        generateCardsCsv={generateCardsCsv}
      />,
      { wrapper }
    )

    const generateButton = getByText('QR-Codes drucken').closest('button') as HTMLButtonElement
    expect(generateButton).toBeTruthy()

    fireEvent.click(generateButton)
    await act(async () => null) // Popper update() - https://github.com/popperjs/react-popper/issues/350

    expect(generateCardsPdf).toHaveBeenCalled()
  })
})
