import AddressExtensions from '../../cards/extensions/AddressFieldExtensions'
import BirthdayExtension from '../../cards/extensions/BirthdayExtension'
import NuernbergPassIdExtension from '../../cards/extensions/NuernbergPassIdExtension'
import RegionExtension from '../../cards/extensions/RegionExtension'
import StartDayExtension from '../../cards/extensions/StartDayExtension'
import { ProjectConfig } from '../getProjectConfig'
import { storesManagementConfig } from '../storesManagementConfig'
import ActivityLogEntry from './ActivityLogEntry'
import { buildCsvLine } from './csvExport'
import { DataPrivacyBaseText, dataPrivacyBaseHeadline } from './dataPrivacyBase'
import pdfConfig from './pdf'

const config: ProjectConfig = {
  name: 'Digitaler Nürnberg-Pass',
  projectId: 'nuernberg.sozialpass.app',
  staticQrCodesEnabled: true,
  card: {
    nameColumnName: 'Name',
    expiryColumnName: 'Ablaufdatum',
    extensionColumnNames: [
      'Startdatum',
      'Geburtsdatum',
      'Pass-ID',
      'Adresszeile 1',
      'Adresszeile 2',
      'PLZ',
      'Ort',
      null,
    ],
    defaultValidity: { years: 1 },
    extensions: [StartDayExtension, BirthdayExtension, NuernbergPassIdExtension, ...AddressExtensions, RegionExtension],
  },
  dataPrivacyHeadline: dataPrivacyBaseHeadline,
  dataPrivacyContent: DataPrivacyBaseText,
  timezone: 'Europe/Berlin',
  activityLogConfig: {
    columnNames: ['Erstellt', 'Name', 'Pass-ID', 'Geburtstag', 'Gültig bis'],
    renderLogEntry: ActivityLogEntry,
  },
  pdf: pdfConfig,
  csvExport: {
    enabled: true,
    csvHeader: [
      'Name',
      'AddressLine1',
      'AddressLine2',
      'AddressLocation',
      'PassId',
      'Birthday',
      'StartDate',
      'ExpirationDate',
      'CardHash',
      'ActivationCode',
      'StaticUserCode',
    ],
    buildCsvLine,
  },
  cardStatistics: { enabled: false },
  freinetCSVImportEnabled: false,
  cardCreation: true,
  selfServiceEnabled: false,
  storesManagement: storesManagementConfig,
  userImportApiEnabled: false,
  showBirthdayMinorHint: false,
}

export default config
