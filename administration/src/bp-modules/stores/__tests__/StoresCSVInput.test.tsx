import { OverlayToaster } from '@blueprintjs/core'
import { fireEvent, waitFor } from '@testing-library/react'
import { parse } from 'csv-parse/browser/esm/sync'
import { mocked } from 'jest-mock'
import React, { ReactNode } from 'react'

import { ProjectConfigProvider } from '../../../project-configs/ProjectConfigContext'
import nuernbergConfig from '../../../project-configs/nuernberg/config'
import { renderWithTranslation } from '../../../testing/render'
import { AppToasterProvider } from '../../AppToaster'
import StoresCSVInput, { DEFAULT_ERROR_TIMEOUT } from '../StoresCSVInput'
import StoresImportDuplicates from '../StoresImportDuplicates'

// TODO #1575 Remove mock values when jest can handle ECMA modules (#1574)

const fieldNames = nuernbergConfig.storesManagement.enabled
  ? nuernbergConfig.storesManagement.fields.map(field => field.name)
  : []
jest.mock('csv-parse/browser/esm/sync', () => ({
  parse: jest.fn(),
}))
const wrapper = ({ children }: { children: ReactNode }) => (
  <AppToasterProvider>
    <ProjectConfigProvider>{children}</ProjectConfigProvider>
  </AppToasterProvider>
)
const setAcceptingStores = jest.fn()
const setIsLoadingCoordinates = jest.fn()

describe('StoresCSVInput', () => {
  beforeEach(jest.resetAllMocks)
  const renderAndSubmitStoreInput = async (csv: string) => {
    const fileReaderMock = {
      // eslint-disable-next-line func-names
      readAsText: jest.fn(function (this: FileReader, _: Blob) {
        this.onloadend!({ target: { result: csv } } as ProgressEvent<FileReader>)
      }),
    } as unknown as FileReader
    jest.spyOn(global, 'FileReader').mockReturnValue(fileReaderMock)
    const file = new File([csv], 'Stores.csv', { type: 'text/csv' })
    const fields = nuernbergConfig.storesManagement.enabled ? nuernbergConfig.storesManagement.fields : []
    const { getByTestId } = renderWithTranslation(
      <StoresCSVInput
        setAcceptingStores={setAcceptingStores}
        fields={fields}
        setIsLoadingCoordinates={setIsLoadingCoordinates}
      />,
      {
        wrapper,
      }
    )

    const fileInput = getByTestId('store-file-upload') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })
    fireEvent.input(fileInput)

    await waitFor(() => expect(fileReaderMock.readAsText).toHaveBeenCalledTimes(1))
  }

  it(`should correctly import csv store`, async () => {
    const csv = ''
    const toaster = jest.spyOn(OverlayToaster.prototype, 'show')
    mocked(parse).mockReturnValueOnce([
      fieldNames,
      [
        'Test store',
        'Teststr.',
        '10',
        '90408',
        'Nürnberg',
        '12.700',
        '11.0765467',
        '0911/123456',
        'info@test.de',
        'https://www.test.de/kontakt/',
        '20% Ermäßigung für Erwachsene',
        '20% discount for adults',
        '17',
      ],
    ])

    await waitFor(async () => renderAndSubmitStoreInput(csv))
    expect(toaster).not.toHaveBeenCalled()
    expect(setAcceptingStores).toHaveBeenCalledTimes(1)
  })

  it(`should fail with error if empty csv is provided`, async () => {
    const error = 'Die gewählte Datei ist leer.'
    const csv = ''
    const toaster = jest.spyOn(OverlayToaster.prototype, 'show')
    mocked(parse).mockReturnValueOnce([])
    await waitFor(async () => renderAndSubmitStoreInput(csv))
    expect(toaster).toHaveBeenCalledWith({ intent: 'danger', message: error, timeout: DEFAULT_ERROR_TIMEOUT })
    expect(setAcceptingStores).not.toHaveBeenCalled()
  })

  it(`should fail if no store entry is provided`, async () => {
    const error = 'Die Datei muss mindestens einen Eintrag enthalten.'
    const csv = ''
    const toaster = jest.spyOn(OverlayToaster.prototype, 'show')
    mocked(parse).mockReturnValueOnce([fieldNames])
    await waitFor(async () => renderAndSubmitStoreInput(csv))
    expect(toaster).toHaveBeenCalledWith({ intent: 'danger', message: error, timeout: DEFAULT_ERROR_TIMEOUT })
    expect(setAcceptingStores).not.toHaveBeenCalled()
  })

  it(`should fail if the column format is not correct`, async () => {
    const error = 'Die erforderlichen Spalten sind nicht vorhanden oder nicht in der richtigen Reihenfolge.'
    const csv = ''
    const toaster = jest.spyOn(OverlayToaster.prototype, 'show')
    mocked(parse).mockReturnValueOnce([
      [
        'name',
        'street',
        'categoryId',
        'lat',
        'long',
        'customColumn',
        'random',
        'houseNr',
        'discount',
        'test',
        'test2',
        'test3',
        'test4',
      ],
      [
        'Test store',
        'Teststr.',
        '10',
        '90408',
        'Nürnberg',
        '12.700',
        '11.0765467',
        '0911/123456',
        'info@test.de',
        'https://www.test.de/kontakt/',
        '20% Ermäßigung für Erwachsene',
        '20% discount for adults',
        '17',
      ],
    ])
    await waitFor(async () => renderAndSubmitStoreInput(csv))
    expect(toaster).toHaveBeenCalledWith({ intent: 'danger', message: error, timeout: DEFAULT_ERROR_TIMEOUT })
    expect(setAcceptingStores).not.toHaveBeenCalled()
  })

  it(`should fail if the column amount is not correct`, async () => {
    const error = `Die CSV enthält eine ungültige Anzahl an Spalten.`
    const csv = ''
    const toaster = jest.spyOn(OverlayToaster.prototype, 'show')
    mocked(parse).mockReturnValueOnce([
      [
        'name',
        'street',
        'houseNr',
        'postalCode',
        'location',
        'latitude',
        'longitude',
        'telephone',
        'email',
        'homepage',
        'discountDE',
        'discountEN',
        'categoryId',
        'test3',
      ],
      [
        'Test store',
        'Teststr.',
        '10',
        '90408',
        'Nürnberg',
        '12.700',
        '11.0765467',
        '0911/123456',
        'info@test.de',
        'https://www.test.de/kontakt/',
        '20% Ermäßigung für Erwachsene',
        '20% discount for adults',
        '17',
        'test',
      ],
    ])
    await waitFor(async () => renderAndSubmitStoreInput(csv))
    expect(toaster).toHaveBeenCalledWith({ intent: 'danger', message: error, timeout: DEFAULT_ERROR_TIMEOUT })
    expect(setAcceptingStores).not.toHaveBeenCalled()
  })

  it(`should fail if the csv includes duplicated stores`, async () => {
    const error = <StoresImportDuplicates entries={[[1, 2]]} />
    const csv = ''
    const toaster = jest.spyOn(OverlayToaster.prototype, 'show')
    mocked(parse).mockReturnValueOnce([
      fieldNames,
      [
        'Test store',
        'Teststr.',
        '10',
        '90408',
        'Nürnberg',
        '12.700',
        '11.0765467',
        '0911/123456',
        'info@test.de',
        'https://www.test.de/kontakt/',
        '20% Ermäßigung für Erwachsene',
        '20% discount for adults',
        '17',
      ],
      [
        'Test store',
        'Teststr.',
        '10',
        '90408',
        'Nürnberg',
        '12.700',
        '11.0765467',
        '0911/123456',
        'info@test.de',
        'https://www.test.de/kontakt/',
        '20% Ermäßigung für Erwachsene',
        '20% discount for adults',
        '17',
      ],
    ])
    await waitFor(async () => renderAndSubmitStoreInput(csv))
    expect(toaster).toHaveBeenCalledWith({ intent: 'danger', message: error, timeout: 0 })
    expect(setAcceptingStores).not.toHaveBeenCalled()
  })
})
