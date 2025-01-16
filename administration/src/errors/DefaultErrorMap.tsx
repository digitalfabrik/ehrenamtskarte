import { TFunction } from 'i18next'
import React, { ReactElement } from 'react'

import { CardInfo } from '../generated/card_pb'
import { CodeType, GraphQlExceptionCode } from '../generated/graphql'
import { base64ToUint8Array } from '../util/base64'
import InvalidLink from './templates/InvalidLink'
import InvalidPasswordResetLink from './templates/InvalidPasswordResetLink'
import PasswordResetKeyExpired from './templates/PasswordResetKeyExpired'

type GraphQLErrorMessage = {
  title: string
  description?: string | ReactElement<{ extensions: Record<string, unknown> }>
}

type ErrorExtensions = {
  code?: GraphQlExceptionCode
  maxSize?: number
  encodedCardInfoBase64?: string
  codeType?: CodeType
  [key: string]: unknown
}

const defaultErrorMap = (t: TFunction, extensions?: ErrorExtensions): GraphQLErrorMessage => {
  const defaultError = { title: t('errors:unknown') }

  if (!extensions || extensions.code === undefined) {
    return defaultError
  }
  switch (extensions.code) {
    case GraphQlExceptionCode.EmailAlreadyExists:
      return {
        title: t('errors:mailAddressAlreadyUsed'),
      }
    case GraphQlExceptionCode.InvalidLink:
      return {
        title: t('errors:invalidLink'),
        description: <InvalidLink />,
      }
    case GraphQlExceptionCode.InvalidCardHash:
      return {
        title: t('errors:invalidFormat'),
      }
    case GraphQlExceptionCode.InvalidCodeType:
      return {
        title: t('errors:invalidCodeType'),
      }
    case GraphQlExceptionCode.InvalidCredentials:
      return {
        title: t('errors:invalidCredentials'),
      }
    case GraphQlExceptionCode.InvalidFileType:
      return {
        title: t('errors:invalidFileType'),
      }
    case GraphQlExceptionCode.InvalidInput:
      return {
        title: t('errors:invalidInput'),
      }
    case GraphQlExceptionCode.InvalidFileSize:
      return {
        title: t('errors:invalidFileSize'),
      }
    case GraphQlExceptionCode.InvalidDataPolicySize:
      return {
        title: t('errors:invalidDataPolicySize', { maxSize: extensions.maxSize }),
      }
    case GraphQlExceptionCode.InvalidJson:
      return {
        title: t('errors:invalidJson'),
      }
    case GraphQlExceptionCode.InvalidNoteSize:
      return {
        title: t('errors:invalidNoteSize', { maxSize: extensions.maxSize }),
      }
    case GraphQlExceptionCode.InvalidPassword:
      return {
        title: t('errors:invalidPassword'),
      }
    case GraphQlExceptionCode.InvalidPasswordResetLink:
      return {
        title: t('errors:invalidPasswordResetLink'),
        description: <InvalidPasswordResetLink />,
      }
    case GraphQlExceptionCode.InvalidQrCodeSize: {
      const cardInfo = CardInfo.fromBinary(base64ToUint8Array(extensions.encodedCardInfoBase64!))
      const codeTypeText =
        extensions.codeType === CodeType.Dynamic
          ? t('errors:invalidQrCodeSize:dynamicType')
          : t('errors:invalidQrCodeSize:staticType')
      return {
        title: t('errors:invalidQrCodeSize:title', { codeType: codeTypeText, fullName: cardInfo.fullName }),
      }
    }
    case GraphQlExceptionCode.InvalidRole:
      return {
        title: t('errors:invalidRole'),
      }
    case GraphQlExceptionCode.UserEntitlementNotFound:
      return {
        title: t('errors:entitlementNotFound'),
      }
    case GraphQlExceptionCode.UserEntitlementExpired:
      return {
        title: t('errors:entitlementExpired'),
      }
    case GraphQlExceptionCode.MailNotSent:
      return {
        title: t('errors:mailNotSend', { recipient: extensions.recipient }),
      }
    case GraphQlExceptionCode.PasswordResetKeyExpired:
      return {
        title: t('errors:passwordResetKeyExpired'),
        description: <PasswordResetKeyExpired />,
      }
    case GraphQlExceptionCode.RegionNotFound:
      return {
        title: t('errors:regionNotFound'),
      }
    case GraphQlExceptionCode.RegionNotActivatedForApplication:
      return {
        title: t('errors:regionNotActivatedForApplication'),
      }
    case GraphQlExceptionCode.RegionNotActivatedCardConfirmationMail:
      return {
        title: t('errors:regionNotActivatedForConfirmationMail'),
      }
  }
}

export default defaultErrorMap
