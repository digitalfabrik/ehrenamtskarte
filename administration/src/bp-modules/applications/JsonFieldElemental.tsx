import { Colors, Icon, Tag } from '@blueprintjs/core'
import React, { memo, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { AuthContext } from '../../AuthProvider'
import downloadDataUri from '../../util/downloadDataUri'
import { useAppToaster } from '../AppToaster'
import EmailLink from '../EmailLink'
import { printAwareCss } from './ApplicationCard'
import { GeneralJsonField, JsonField, JsonFieldViewProps } from './JsonFieldView'
import { isEmailValid } from './utils/verificationHelper'

const extensionByContentType = new Map([
  ['application/pdf', 'pdf'],
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
])

const PrintAwareTag = styled(Tag)`
  ${printAwareCss};
`

const PrintOnlySpan = styled.span`
  visibility: hidden;
  @media print {
    visibility: visible;
  }
`

// Some field names are equal therefore the parents are needed for resolving the label
const getTranslationKey = (fieldName: string, parentName?: string) =>
  parentName ? `${parentName}.${fieldName}` : fieldName

const JsonFieldAttachment = memo(
  ({ jsonField, baseUrl, attachmentAccessible, parentName }: JsonFieldViewProps<JsonField<'Attachment'>>) => {
    const appToaster = useAppToaster()
    const token = useContext(AuthContext).data?.token
    const { t } = useTranslation('application')

    const attachment = jsonField.value
    if (attachmentAccessible) {
      const downloadUrl = `${baseUrl}/file/${attachment.fileIndex}`
      const onClick = async () => {
        const loadingToastKey = appToaster?.show({
          message: `${t('applications:loadAttachment')} ${attachment.fileIndex + 1}...`,
          intent: 'primary',
          isCloseButtonShown: false,
        })
        try {
          const result = await fetch(downloadUrl, { headers: { authorization: `Bearer ${token}` } })
          const contentType = result.headers.get('content-type')
          if (result.status !== 200) {
            throw Error('Status Code is not OK')
          } else if (contentType === null || !extensionByContentType.has(contentType)) {
            throw Error('Invalid Content Type')
          }
          const filename = `${t('applications:attachment')}${attachment.fileIndex + 1}.${extensionByContentType.get(
            contentType
          )}`
          const arrayBuffer = await result.arrayBuffer()
          const file = new File([arrayBuffer], filename, { type: contentType })
          downloadDataUri(file, filename)
        } catch (e) {
          console.error(e)
          appToaster?.show({ message: t('errors:unknown'), intent: 'danger' })
        } finally {
          if (loadingToastKey !== undefined) {
            appToaster?.dismiss(loadingToastKey)
          }
        }
      }
      return (
        <p>
          {t(getTranslationKey(jsonField.name, parentName))}:&nbsp;
          <PrintAwareTag
            round
            rightIcon={<Icon icon='download' color={Colors.GRAY1} />}
            interactive
            minimal
            onClick={onClick}>{`${t('applications:attachment')} ${jsonField.value.fileIndex + 1}`}</PrintAwareTag>
          <PrintOnlySpan>{`(${t('applications:seeAttachment')} ${jsonField.value.fileIndex + 1})`}</PrintOnlySpan>
        </p>
      )
    }
    return (
      <p>
        {t(getTranslationKey(jsonField.name, parentName))}:&nbsp;
        <span>{t('applications:submittedButNotVisible')}</span>
      </p>
    )
  }
)

const JsonFieldElemental = ({
  jsonField,
  parentName,
  ...rest
}: JsonFieldViewProps<Exclude<GeneralJsonField, JsonField<'Array'>>>) => {
  const { t } = useTranslation('application')

  switch (jsonField.type) {
    case 'String':
      return (
        <p>
          {t(getTranslationKey(jsonField.name, parentName))}:{' '}
          {isEmailValid(jsonField.value) ? <EmailLink email={jsonField.value} /> : <span>{jsonField.value}</span>}
        </p>
      )
    case 'Date':
      return (
        <p>
          {t(getTranslationKey(jsonField.name, parentName))}: {new Date(jsonField.value).toLocaleDateString('de')}
        </p>
      )
    case 'Number':
      return (
        <p>
          {t(getTranslationKey(jsonField.name, parentName))}: {jsonField.value}
        </p>
      )
    case 'Boolean':
      return (
        <p>
          {t(getTranslationKey(jsonField.name, parentName))}:&nbsp;
          {jsonField.value ? (
            <>
              <Icon icon='tick' intent='success' /> {t('positiveAnswer')}
            </>
          ) : (
            <>
              <Icon icon='cross' intent='danger' /> {t('negativeAnswer')}
            </>
          )}
        </p>
      )
    case 'Attachment':
      return <JsonFieldAttachment jsonField={jsonField} parentName={parentName} {...rest} />
  }
}

export default memo(JsonFieldElemental)
