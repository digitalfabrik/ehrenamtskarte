import React, { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

const InvalidPasswordResetLink = (): ReactElement => {
  const { t } = useTranslation('errorTemplates')
  return (
    <>
      <span>{t('invalidLinkHeadline')}</span>
      <ul>
        <li>{t('browserIssue')}</li>
        <li>{t('passwordAlreadyReset')}</li>
        <li>{t('passwordLinkInvalid')}</li>
      </ul>
    </>
  )
}
export default InvalidPasswordResetLink
