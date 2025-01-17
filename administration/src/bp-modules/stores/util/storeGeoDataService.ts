import { FeatureCollection, GeoJSON, Point } from 'geojson'
import i18next from 'i18next'

import { AcceptingStoresEntry } from '../AcceptingStoresEntry'
import { LONG_ERROR_TIMEOUT } from '../StoresCSVInput'

const GEO_SERVICE_URL = 'https://nominatim.maps.tuerantuer.org/nominatim/search'

const isStoreMissingLocationInformation = (store: AcceptingStoresEntry): boolean =>
  store.data.location.length === 0 || store.data.street.length === 0 || store.data.houseNumber.length === 0

const handleStoreWithMissingLocationInformation = (
  store: AcceptingStoresEntry,
  storeIndex: number,
  showInputError: (message: string, timeout?: number) => void
): AcceptingStoresEntry => {
  showInputError(
    `${i18next.t('stores:entry')} ${storeIndex + 1}: ${i18next.t('stores:missingAddressData')}`,
    LONG_ERROR_TIMEOUT
  )
  return store
}
const getGeoDataUrlWithParams = (location: string, street: string, houseNr: string): URL => {
  const geoServiceUrl = new URL(GEO_SERVICE_URL)
  geoServiceUrl.searchParams.append('format', 'geojson')
  geoServiceUrl.searchParams.append('countrycodes', 'de')
  geoServiceUrl.searchParams.append('city', location)
  geoServiceUrl.searchParams.append('street', `${houseNr} ${street}`)
  return geoServiceUrl
}

const getStoreCoordinatesFromGeoDataService = (
  store: AcceptingStoresEntry,
  storeIndex: number,
  showInputError: (message: string, timeout?: number) => void
): Promise<AcceptingStoresEntry> =>
  fetch(getGeoDataUrlWithParams(store.data.location, store.data.street, store.data.houseNumber).href)
    .then(response => response.json())
    .then(({ features }: FeatureCollection<Point, GeoJSON>) => {
      if (features.length === 0) {
        showInputError(
          `${i18next.t('stores:entry')} ${storeIndex + 1}: ${i18next.t('stores:noGeoDataFoundForAddress')}`,
          LONG_ERROR_TIMEOUT
        )
        return store
      }
      const feature = features[0]
      const updatedStore = store
      updatedStore.data.longitude = feature.geometry.coordinates[0].toString()
      updatedStore.data.latitude = feature.geometry.coordinates[1].toString()
      return updatedStore
    })

export const getStoresWithCoordinates = (
  stores: AcceptingStoresEntry[],
  showInputError: (message: string, timeout?: number) => void
): Promise<AcceptingStoresEntry>[] =>
  stores.map((store, index) => {
    if (store.hasValidCoordinates()) {
      return Promise.resolve(store)
    }
    if (isStoreMissingLocationInformation(store)) {
      return Promise.resolve(handleStoreWithMissingLocationInformation(store, index, showInputError))
    }
    if (!store.hasEmptyCoordinates() && !store.hasValidCoordinates()) {
      showInputError(
        `${i18next.t('stores:entry')} ${index + 1}: ${i18next.t('stores:coordinatesContainInvalidChars')}`,
        LONG_ERROR_TIMEOUT
      )
      return Promise.resolve(store)
    }
    return getStoreCoordinatesFromGeoDataService(store, index, showInputError)
  })
