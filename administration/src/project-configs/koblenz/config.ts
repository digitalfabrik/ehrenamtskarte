import { QUERY_PARAM_BIRTHDAY, QUERY_PARAM_KOBLENZ_REFERENCE_NUMBER, QUERY_PARAM_NAME } from 'build-configs'

import BirthdayExtension from '../../cards/extensions/BirthdayExtension'
import KoblenzReferenceNumberExtension from '../../cards/extensions/KoblenzReferenceNumberExtension'
import { ActivationText } from '../common/ActivationText'
import { ProjectConfig } from '../getProjectConfig'
import { storesManagementConfig } from '../storesManagementConfig'
import { DataPrivacyBaseText, dataPrivacyBaseHeadline } from './dataPrivacyBase'
import pdfConfig from './pdf'

const config: ProjectConfig = {
  name: 'KoblenzPass',
  projectId: 'koblenz.sozialpass.app',
  staticQrCodesEnabled: true,
  card: {
    nameColumnName: QUERY_PARAM_NAME,
    expiryColumnName: 'Ablaufdatum',
    extensionColumnNames: [QUERY_PARAM_BIRTHDAY, QUERY_PARAM_KOBLENZ_REFERENCE_NUMBER],
    defaultValidity: { years: 1 },
    extensions: [BirthdayExtension, KoblenzReferenceNumberExtension],
  },
  dataPrivacyHeadline: dataPrivacyBaseHeadline,
  dataPrivacyContent: DataPrivacyBaseText,
  timezone: 'Europe/Berlin',
  pdf: pdfConfig,
  csvExport: {
    enabled: false,
  },
  activation: {
    activationText: ActivationText,
    downloadLink: 'https://download.koblenz.sozialpass.app/',
  },
  cardStatistics: { enabled: false },
  freinetCSVImportEnabled: false,
  cardCreation: false,
  selfServiceEnabled: true,
  storesManagement: storesManagementConfig,
  userImportApiEnabled: true,
  showBirthdayMinorHint: true,
}

export default config
