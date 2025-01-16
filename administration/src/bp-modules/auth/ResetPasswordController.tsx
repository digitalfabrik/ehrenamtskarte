import { Button, Callout, Card, Classes, FormGroup, H2, H3, H4, InputGroup } from '@blueprintjs/core'
import React, { ReactElement, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import getMessageFromApolloError from '../../errors/getMessageFromApolloError'
import { useCheckPasswordResetLinkQuery, useResetPasswordMutation } from '../../generated/graphql'
import { ProjectConfigContext } from '../../project-configs/ProjectConfigContext'
import { useAppToaster } from '../AppToaster'
import PasswordInput from '../PasswordInput'
import StandaloneCenter from '../StandaloneCenter'
import getQueryResult from '../util/getQueryResult'
import validateNewPasswordInput from './validateNewPasswordInput'

const ResetPasswordController = (): ReactElement => {
  const config = useContext(ProjectConfigContext)
  const appToaster = useAppToaster()
  const [queryParams] = useSearchParams()
  const adminEmail = queryParams.get('email') ?? ''
  const { t } = useTranslation('auth')
  const [newPassword, setNewPassword] = useState('')
  const [repeatNewPassword, setRepeatNewPassword] = useState('')
  const navigate = useNavigate()

  const checkPasswordResetLinkQuery = useCheckPasswordResetLinkQuery({
    variables: {
      project: config.projectId,
      resetKey: queryParams.get('token')!,
    },
  })

  const [resetPassword, { loading }] = useResetPasswordMutation({
    onCompleted: () => {
      appToaster?.show({ intent: 'success', message: t('setPasswordSuccess') })
      navigate('/')
    },
    onError: error => {
      const { title } = getMessageFromApolloError(error, t)
      appToaster?.show({
        intent: 'danger',
        message: title,
      })
    },
  })

  const submit = () =>
    resetPassword({
      variables: {
        project: config.projectId,
        email: adminEmail,
        newPassword,
        passwordResetKey: queryParams.get('token')!,
      },
    })

  const warnMessage = validateNewPasswordInput(newPassword, repeatNewPassword, t)
  const isDirty = newPassword !== '' || repeatNewPassword !== ''

  const checkPasswordResetLinkQueryResult = getQueryResult(checkPasswordResetLinkQuery, t)

  if (!checkPasswordResetLinkQueryResult.successful) {
    return checkPasswordResetLinkQueryResult.component
  }

  return (
    <StandaloneCenter>
      <Card style={{ width: '100%', maxWidth: '500px' }}>
        <H2>{config.name}</H2>
        <H3>{t('administration')}</H3>
        <H4>{t('resetPassword')}</H4>
        <p>{t('setPasswordText')}</p>
        <form
          onSubmit={e => {
            e.preventDefault()
            submit()
          }}>
          <FormGroup label={t('eMail')}>
            <InputGroup value={adminEmail} disabled type='email' />
          </FormGroup>
          <PasswordInput label={t('newPassword')} setValue={setNewPassword} value={newPassword} />
          <PasswordInput label={t('newPasswordRepeat')} setValue={setRepeatNewPassword} value={repeatNewPassword} />
          {warnMessage === null || !isDirty ? null : <Callout intent='danger'>{warnMessage}</Callout>}
          <div
            className={Classes.DIALOG_FOOTER_ACTIONS}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' }}>
            <Link to='/'>{t('backToLogin')}</Link>
            <Button
              type='submit'
              intent='primary'
              text={t('resetPassword')}
              loading={loading}
              disabled={warnMessage !== null}
            />
          </div>
        </form>
      </Card>
    </StandaloneCenter>
  )
}

export default ResetPasswordController
