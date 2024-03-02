import {
  ACTIVATION_FRAGMENT,
  ACTIVATION_PATH,
  BAYERN_PRODUCTION_ID,
  BAYERN_STAGING_ID,
  CUSTOM_SCHEME,
  HTTPS_SCHEME,
} from 'build-configs'

import CardBlueprint from '../cards/CardBlueprint'
import { CreateCardsResult } from '../cards/createCards'
import BavariaCardTypeExtension from '../cards/extensions/BavariaCardTypeExtension'
import RegionExtension from '../cards/extensions/RegionExtension'
import { PdfQrCode } from '../cards/pdf/PdfQrCodeElement'
import { DynamicActivationCode } from '../generated/card_pb'
import { Region } from '../generated/graphql'
import { LOCAL_STORAGE_PROJECT_KEY } from '../project-configs/constants'
import { getBuildConfig } from './getBuildConfig'
import getDeepLinkFromQrCode from './getDeepLinkFromQrCode'

describe('DeepLink generation', () => {
  const region: Region = {
    id: 0,
    name: 'augsburg',
    prefix: 'a',
    activatedForApplication: true,
  }

  const cardConfigBayern = {
    defaultValidity: { years: 3 },
    nameColumnName: 'Name',
    expiryColumnName: 'Ablaufdatum',
    extensionColumnNames: ['Kartentyp', null],
    extensions: [BavariaCardTypeExtension, RegionExtension],
  }

  const card = new CardBlueprint('Thea Test', cardConfigBayern, [region])
  const code: CreateCardsResult = {
    dynamicCardInfoHashBase64: 'rS8nukf7S9j8V1j+PZEkBQWlAeM2WUKkmxBHi1k9hRo=',
    dynamicActivationCode: new DynamicActivationCode({ info: card.generateCardInfo() }),
  }

  const dynamicPdfQrCode: PdfQrCode = {
    case: 'dynamicActivationCode',
    value: code.dynamicActivationCode,
  }

  const encodedActivationCodeBase64 = 'ChsKGQoJVGhlYSBUZXN0EI%2BjARoICgIIACICCAA%3D'
  const defineHostname = (hostname: string) =>
    Object.defineProperty(window, 'location', {
      value: {
        hostname,
      },
      writable: true,
    })

  it('should generate a correct link for development', () => {
    localStorage.setItem(LOCAL_STORAGE_PROJECT_KEY, BAYERN_PRODUCTION_ID)
    const projectId = getBuildConfig(window.location.hostname).common.projectId.local
    expect(getDeepLinkFromQrCode(dynamicPdfQrCode)).toBe(
      `${CUSTOM_SCHEME}://${projectId}/${ACTIVATION_PATH}/${ACTIVATION_FRAGMENT}${encodedActivationCodeBase64}/`
    )
  })
  it('should generate a correct link for staging', () => {
    defineHostname(BAYERN_STAGING_ID)
    const projectId = getBuildConfig(window.location.hostname).common.projectId.staging
    expect(getDeepLinkFromQrCode(dynamicPdfQrCode)).toBe(
      `${HTTPS_SCHEME}://${projectId}/${ACTIVATION_PATH}/${ACTIVATION_FRAGMENT}${encodedActivationCodeBase64}/`
    )
  })
  it('should generate a correct link for production', () => {
    defineHostname(BAYERN_PRODUCTION_ID)
    const projectId = getBuildConfig(window.location.hostname).common.projectId.production
    expect(getDeepLinkFromQrCode(dynamicPdfQrCode)).toBe(
      `${HTTPS_SCHEME}://${projectId}/${ACTIVATION_PATH}/${ACTIVATION_FRAGMENT}${encodedActivationCodeBase64}/`
    )
  })
})
