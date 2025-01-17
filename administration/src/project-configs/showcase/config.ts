import BavariaCardTypeExtension from '../../cards/extensions/BavariaCardTypeExtension'
import RegionExtension from '../../cards/extensions/RegionExtension'
import { applicationJsonToCardQuery, applicationJsonToPersonalData } from '../bayern/config'
import { DataPrivacyBaseText, dataPrivacyBaseHeadline } from '../bayern/dataPrivacyBase'
import pdfConfiguration from '../bayern/pdf'
import { ProjectConfig } from '../getProjectConfig'

const config: ProjectConfig = {
  name: 'Showcase Berechtigungskarte',
  projectId: 'showcase.entitlementcard.app',
  applicationFeature: {
    applicationJsonToPersonalData,
    applicationJsonToCardQuery,
    applicationUsableWithApiToken: true,
  },
  staticQrCodesEnabled: false,
  card: {
    nameColumnName: 'Name',
    expiryColumnName: 'Ablaufdatum',
    extensionColumnNames: ['Kartentyp', null],
    defaultValidity: { years: 3 },
    extensions: [BavariaCardTypeExtension, RegionExtension],
  },
  dataPrivacyHeadline: dataPrivacyBaseHeadline,
  dataPrivacyContent: DataPrivacyBaseText,
  timezone: 'Europe/Berlin',
  pdf: pdfConfiguration,
  csvExport: {
    enabled: false,
  },
  cardStatistics: { enabled: false },
  freinetCSVImportEnabled: true,
  cardCreation: true,
  selfServiceEnabled: false,
  storesManagement: {
    enabled: false,
  },
  userImportApiEnabled: false,
  showBirthdayMinorHint: false,
}

export default config
