import React, { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

const InvalidLink = (): ReactElement => {
  const { t } = useTranslation('errorTemplates')
  return (
    <>
      <span>{t('invalidLinkHeadline')}</span>
      <ul>
        <li>{t('browserIssue')}</li>
        <li>{t('applicationApproved')}</li>
        <li>{t('applicationRejected')}</li>
        <li>{t('applicationRequirementsNotFulfilled')}</li>
      </ul>
    </>
  )
}
export default InvalidLink
