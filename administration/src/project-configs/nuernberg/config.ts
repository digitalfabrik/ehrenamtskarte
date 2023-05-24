import BirthdayExtension from '../../cards/extensions/BirthdayExtension'
import NuernbergPassIdExtension from '../../cards/extensions/NuernbergPassIdExtension'
import NuernbergPassNumberExtension from '../../cards/extensions/NuernbergPassNumberExtension'
import RegionExtension from '../../cards/extensions/RegionExtension'
import { ProjectConfig } from '../getProjectConfig'
import ActivityLogEntry from './ActivityLogEntry'
import { DataPrivacyBaseText, dataPrivacyBaseHeadline } from './dataPrivacyBase'
import pdfConfig from './pdf'

const config: ProjectConfig = {
  name: 'Digitaler Nürnberg-Pass',
  projectId: 'nuernberg.sozialpass.app',
  applicationFeatureEnabled: false,
  staticQrCodesEnabled: true,
  card: {
    nameColumnName: 'Name',
    expiryColumnName: 'Ablaufdatum',
    extensionColumnNames: ['Geburtsdatum', 'Passnummer', 'Pass-ID', null],
    defaultValidity: { years: 1 },
    extensions: [BirthdayExtension, NuernbergPassNumberExtension, NuernbergPassIdExtension, RegionExtension],
  },
  dataPrivacyHeadline: dataPrivacyBaseHeadline,
  dataPrivacyContent: DataPrivacyBaseText,
  timezone: 'Europe/Berlin',
  activityLogConfig: {
    columnNames: ['Erstellt', 'Name', 'Passnummer', 'Geburtstag', 'Gültig bis'],
    renderLogEntry: ActivityLogEntry,
  },
  pdf: pdfConfig,
}

export default config
