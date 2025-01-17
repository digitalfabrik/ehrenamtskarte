import React, { ReactNode } from 'react'

import { ProjectConfigProvider } from '../../../project-configs/ProjectConfigContext'
import { renderWithTranslation } from '../../../testing/render'
import StoresImportResult from '../StoresImportResult'

const wrapper = ({ children }: { children: ReactNode }) => <ProjectConfigProvider>{children}</ProjectConfigProvider>

describe('StoresImportResult', () => {
  it('should show the correct amount of stores that were affected', () => {
    const { getByTestId } = renderWithTranslation(
      <StoresImportResult dryRun={false} storesUntouched={5} storesCreated={15} storesDeleted={20} />,
      {
        wrapper,
      }
    )
    expect(getByTestId('storesUntouched').textContent).toBe('5')
    expect(getByTestId('storesCreated').textContent).toBe('15')
    expect(getByTestId('storesDeleted').textContent).toBe('20')
  })

  it('should show the correct headline for test import', () => {
    const { getByTestId } = renderWithTranslation(
      <StoresImportResult dryRun={false} storesUntouched={5} storesCreated={15} storesDeleted={20} />,
      {
        wrapper,
      }
    )
    expect(getByTestId('import-result-headline').textContent).toBe('Der Import der Akzeptanzpartner war erfolgreich!')
  })

  it('should show the correct headline for production import', () => {
    const { getByTestId } = renderWithTranslation(
      <StoresImportResult dryRun storesUntouched={5} storesCreated={15} storesDeleted={20} />,
      {
        wrapper,
      }
    )
    expect(getByTestId('import-result-headline').textContent).toBe(
      'Der Testimport der Akzeptanzpartner war erfolgreich!'
    )
  })
})
