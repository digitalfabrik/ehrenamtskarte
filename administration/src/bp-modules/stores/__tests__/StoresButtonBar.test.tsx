import { act, fireEvent } from '@testing-library/react'
import React, { ReactNode } from 'react'

import { ProjectConfigProvider } from '../../../project-configs/ProjectConfigContext'
import { LOCAL_STORAGE_PROJECT_KEY } from '../../../project-configs/constants'
import koblenzConfig from '../../../project-configs/koblenz/config'
import nuernbergConfig from '../../../project-configs/nuernberg/config'
import { renderWithTranslation } from '../../../testing/render'
import { AcceptingStoresEntry } from '../AcceptingStoresEntry'
import StoresButtonBar from '../StoresButtonBar'
import { invalidStoreData, validStoreData } from '../__mock__/mockStoreEntry'

jest.useFakeTimers()

const setDryRun = jest.fn()

const goBack = jest.fn()
const importStores = jest.fn()
const wrapper = ({ children }: { children: ReactNode }) => <ProjectConfigProvider>{children}</ProjectConfigProvider>

describe('StoresButtonBar', () => {
  const projectConfigsWithStoreUpload = [{ projectConfig: nuernbergConfig }, { projectConfig: koblenzConfig }]
  it.each(projectConfigsWithStoreUpload)(
    `should goBack when clicking back for $projectConfig.name`,
    async ({ projectConfig }) => {
      localStorage.setItem(LOCAL_STORAGE_PROJECT_KEY, projectConfig.projectId)
      const { getByText } = renderWithTranslation(
        <StoresButtonBar
          dryRun
          setDryRun={setDryRun}
          goBack={goBack}
          acceptingStores={[]}
          importStores={importStores}
        />,
        {
          wrapper,
        }
      )

      const backButton = getByText('Zurück zur Auswahl')
      expect(backButton).toBeTruthy()

      fireEvent.click(backButton)
      await act(async () => null) // Popper update() - https://github.com/popperjs/react-popper/issues/350

      expect(goBack).toHaveBeenCalled()
    }
  )

  it.each(projectConfigsWithStoreUpload)(
    `should disable import button for no stores for $projectConfig.name`,
    async ({ projectConfig }) => {
      localStorage.setItem(LOCAL_STORAGE_PROJECT_KEY, projectConfig.projectId)
      const { getByText } = renderWithTranslation(
        <StoresButtonBar
          dryRun
          setDryRun={setDryRun}
          goBack={goBack}
          acceptingStores={[]}
          importStores={importStores}
        />,
        {
          wrapper,
        }
      )

      const importButton = getByText('Importiere Akzeptanzpartner').closest('button') as HTMLButtonElement
      expect(importButton).toBeTruthy()
      expect(importButton.disabled).toBeTruthy()
      fireEvent.mouseOver(importButton)
      fireEvent.click(importButton)
      await act(async () => {
        jest.advanceTimersByTime(100)
      })

      expect(getByText('Laden sie bitte eine Datei mit Akzeptanzpartnern hoch.')).toBeTruthy()
      expect(importStores).not.toHaveBeenCalled()
    }
  )

  it.each(projectConfigsWithStoreUpload)(
    `should disable import stores for invalid store entries for $projectConfig.name`,
    async ({ projectConfig }) => {
      localStorage.setItem(LOCAL_STORAGE_PROJECT_KEY, projectConfig.projectId)
      const fields = projectConfig.storesManagement.enabled ? projectConfig.storesManagement.fields : []
      const stores = [new AcceptingStoresEntry(invalidStoreData, fields)]
      const { getByText } = renderWithTranslation(
        <StoresButtonBar
          dryRun
          setDryRun={setDryRun}
          goBack={goBack}
          acceptingStores={stores}
          importStores={importStores}
        />,
        { wrapper }
      )

      const importButton = getByText('Importiere Akzeptanzpartner').closest('button') as HTMLButtonElement
      expect(importButton).toBeTruthy()
      fireEvent.mouseOver(importButton)
      fireEvent.click(importButton)

      await act(async () => {
        jest.advanceTimersByTime(100)
      })

      expect(importButton.disabled).toBeTruthy()
      expect(getByText('Fehlerhafte Einträge. Bitte prüfen sie die rot markierten Felder.')).toBeTruthy()
      expect(importStores).not.toHaveBeenCalled()
    }
  )

  it.each(projectConfigsWithStoreUpload)(
    `should import valid stores for $projectConfig.name`,
    async ({ projectConfig }) => {
      localStorage.setItem(LOCAL_STORAGE_PROJECT_KEY, projectConfig.projectId)
      const fields = projectConfig.storesManagement.enabled ? projectConfig.storesManagement.fields : []
      const stores = [new AcceptingStoresEntry(validStoreData, fields)]
      const { getAllByText } = renderWithTranslation(
        <StoresButtonBar
          dryRun
          setDryRun={setDryRun}
          goBack={goBack}
          acceptingStores={stores}
          importStores={importStores}
        />,
        { wrapper }
      )

      const importButton = getAllByText('Importiere Akzeptanzpartner')[0].closest('button') as HTMLButtonElement
      expect(importButton).toBeTruthy()
      fireEvent.click(importButton)
      const importConfirmationButton = getAllByText('Importiere Akzeptanzpartner')[1].closest(
        'button'
      ) as HTMLButtonElement
      fireEvent.click(importConfirmationButton)
      await act(async () => null) // Popper update() - https://github.com/popperjs/react-popper/issues/350

      expect(importStores).toHaveBeenCalled()
    }
  )
})
