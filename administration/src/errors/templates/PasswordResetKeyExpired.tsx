import React, { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

const PasswordResetKeyExpired = (): ReactElement => {
  const { t } = useTranslation('errorTemplates')
  return (
    <>
      {t('passwordResetKeyExpired')}
      <a href={`${window.location.origin}/forgot-password`} target='_blank' rel='noreferrer'>
        {`${window.location.origin}/forgot-password`}
      </a>
    </>
  )
}
export default PasswordResetKeyExpired
