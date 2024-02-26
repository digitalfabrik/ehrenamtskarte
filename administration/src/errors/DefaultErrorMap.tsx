import { ReactElement } from 'react'

import { CardInfo } from '../generated/card_pb'
import { CodeType, GraphQlExceptionCode } from '../generated/graphql'
import { base64ToUint8Array } from '../util/base64'
import InvalidLink from './templates/InvalidLink'
import InvalidPasswordResetLink from './templates/InvalidPasswordResetLink'
import PasswordResetKeyExpired from './templates/PasswordResetKeyExpired'

type GraphQLErrorMessage = {
  title: string
  description?: string | ReactElement<{ extensions: Record<string, any> }>
}

type ErrorExtensions = {
  code?: GraphQlExceptionCode
  maxSize?: number
  encodedCardInfoBase64?: string
  codeType?: CodeType
  [key: string]: any
}

const defaultErrorMap = (extensions?: ErrorExtensions): GraphQLErrorMessage => {
  const defaultError = { title: 'Etwas ist schief gelaufen.' }

  if (!extensions || !extensions['code']) return defaultError

  switch (extensions['code']) {
    case GraphQlExceptionCode.EmailAlreadyExists:
      return {
        title: 'Die Email-Adresse wird bereits verwendet.',
      }
    case GraphQlExceptionCode.InvalidLink:
      return {
        title: 'Ihr Link ist ungültig',
        description: <InvalidLink />,
      }
    case GraphQlExceptionCode.InvalidCardHash:
      return {
        title: 'Die Karte hat ein ungültiges Format.',
      }
    case GraphQlExceptionCode.InvalidCodeType:
      return {
        title: 'Diese Kombination aus Karte und Kartentyp (statisch/dynamisch) existiert nicht.',
      }
    case GraphQlExceptionCode.InvalidCredentials:
      return {
        title: 'Der Login ist fehlgeschlagen.',
      }
    case GraphQlExceptionCode.InvalidFileType:
      return {
        title: 'Dieser Dateityp wird nicht unterstützt.',
      }
    case GraphQlExceptionCode.InvalidFileSize:
      return {
        title: 'Die Datei ist zu groß.',
      }
    case GraphQlExceptionCode.InvalidDataPolicySize:
      return {
        title: `Unzulässige Zeichenlänge der Datenschutzerklärung. Maximal sind ${extensions.maxSize} Zeichen erlaubt.`,
      }
    case GraphQlExceptionCode.InvalidJson:
      return {
        title: 'Daten konnten nicht geparsed werden.',
      }
    case GraphQlExceptionCode.InvalidPassword:
      return {
        title: 'Kein gültiges Passwort.',
      }
    case GraphQlExceptionCode.InvalidPasswordResetLink:
      return {
        title: 'Ungültiger Link',
        description: <InvalidPasswordResetLink />,
      }
    case GraphQlExceptionCode.InvalidQrCodeSize:
      const cardInfo = CardInfo.fromBinary(base64ToUint8Array(extensions.encodedCardInfoBase64!))
      const codeTypeText = extensions.codeType === CodeType.Dynamic ? 'Aktivierungscode' : 'statische QR-Code'
      return {
        title: `Der ${codeTypeText} für ${cardInfo.fullName} kann nicht generiert werden, da er zu viele Daten enthält.`,
      }
    case GraphQlExceptionCode.InvalidRole:
      return {
        title: 'Diese Rolle kann nicht zugewiesen werden.',
      }
    case GraphQlExceptionCode.MailNotSent:
      return {
        title: 'Email konnte nicht gesendet werden.',
      }
    case GraphQlExceptionCode.PasswordResetKeyExpired:
      return {
        title: 'Die Gültigkeit ihres Links ist abgelaufen',
        description: <PasswordResetKeyExpired />,
      }
    case GraphQlExceptionCode.RegionNotFound:
      return {
        title: 'Diese Region existiert nicht.',
      }
    case GraphQlExceptionCode.RegionNotActivatedForApplication:
      return {
        title:
          'Für diese Region kann der zentrale Beantragungsprozess noch nicht genutzt werden, kontaktieren Sie bitte Ihre zuständige Behörde direkt.',
      }
  }
}

export default defaultErrorMap
