import { render } from '@testing-library/react'
import { ReactElement } from 'react'

import { ProjectConfigProvider } from '../../../project-configs/ProjectConfigContext'
import StoresImportResult from '../StoresImportResult'

const wrapper = ({ children }: { children: ReactElement }) => <ProjectConfigProvider>{children}</ProjectConfigProvider>

describe('StoreImportResult', () => {
  it('should show the correct amount of stores that were affected', () => {
    const { getByTestId } = render(
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
    const { getByTestId } = render(
      <StoresImportResult dryRun={false} storesUntouched={5} storesCreated={15} storesDeleted={20} />,
      {
        wrapper,
      }
    )
    expect(getByTestId('import-result-headline').textContent).toBe('Der Import der Akzeptanzpartner war erfolgreich!')
  })

  it('should show the correct headline for production import', () => {
    const { getByTestId } = render(
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