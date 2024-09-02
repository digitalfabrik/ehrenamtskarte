import { buildConfigNuernberg } from 'build-configs'

import { StoresManagement } from '../getProjectConfig'
import {
  hasMandatoryValue,
  hasValidCategoryId,
  isCoordinate,
  noValidationRequired,
} from '../helper/storeFieldValidation'

export const FIELD_NAME = 'name'
export const FIELD_STREET = 'street'
export const FIELD_HOUSE_NUMBER = 'houseNumber'
export const FIELD_POSTAL_CODE = 'postalCode'
export const FIELD_LOCATION = 'location'
export const FIELD_LATITUDE = 'latitude'
export const FIELD_LONGITUDE = 'longitude'

export const storeConfig: StoresManagement = {
  enabled: true,
  fields: [
    { name: FIELD_NAME, isMandatory: true, isValid: hasMandatoryValue, columnWidth: 400 },
    { name: FIELD_STREET, isMandatory: true, isValid: hasMandatoryValue, columnWidth: 200 },
    { name: FIELD_HOUSE_NUMBER, isMandatory: true, isValid: hasMandatoryValue, columnWidth: 150 },
    { name: FIELD_POSTAL_CODE, isMandatory: true, isValid: hasMandatoryValue, columnWidth: 150 },
    { name: FIELD_LOCATION, isMandatory: true, isValid: hasMandatoryValue, columnWidth: 150 },
    { name: FIELD_LATITUDE, isMandatory: true, isValid: isCoordinate, columnWidth: 150 },
    { name: FIELD_LONGITUDE, isMandatory: true, isValid: isCoordinate, columnWidth: 150 },
    { name: 'telephone', isMandatory: false, isValid: noValidationRequired, columnWidth: 200 },
    { name: 'email', isMandatory: false, isValid: noValidationRequired, columnWidth: 400 },
    { name: 'homepage', isMandatory: false, isValid: noValidationRequired, columnWidth: 400 },
    { name: 'discountDE', isMandatory: false, isValid: noValidationRequired, columnWidth: 500 },
    { name: 'discountEN', isMandatory: false, isValid: noValidationRequired, columnWidth: 500 },
    {
      name: 'categoryId',
      isMandatory: true,
      isValid: category => hasValidCategoryId(category, buildConfigNuernberg.common.categories),
      columnWidth: 100,
    },
  ],
}