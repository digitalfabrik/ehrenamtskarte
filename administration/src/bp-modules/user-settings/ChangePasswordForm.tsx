import { Button, Callout, H2 } from '@blueprintjs/core'
import React, { ReactElement, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { WhoAmIContext } from '../../WhoAmIProvider'
import getMessageFromApolloError from '../../errors/getMessageFromApolloError'
import { useChangePasswordMutation } from '../../generated/graphql'
import { ProjectConfigContext } from '../../project-configs/ProjectConfigContext'
import { useAppToaster } from '../AppToaster'
import PasswordInput from '../PasswordInput'
import validatePasswordInput from '../auth/validateNewPasswordInput'
import SettingsCard from './SettingsCard'

const ChangePasswordForm = (): ReactElement => {
  const { t: tAuth } = useTranslation('auth')
  const { t } = useTranslation('userSettings')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [repeatNewPassword, setRepeatNewPassword] = useState('')

  const appToaster = useAppToaster()
  const [changePassword, { loading }] = useChangePasswordMutation({
    onError: error => {
      const { title } = getMessageFromApolloError(error)
      appToaster?.show({ intent: 'danger', message: title })
    },
    onCompleted: () => {
      appToaster?.show({
        intent: 'success',
        message: t('passwordChangeSuccessful'),
      })
      setCurrentPassword('')
      setNewPassword('')
      setRepeatNewPassword('')
    },
  })

  const project = useContext(ProjectConfigContext).projectId
  const email = useContext(WhoAmIContext).me!.email

  const isDirty = newPassword !== '' || repeatNewPassword !== ''

  const warnMessage = isDirty ? validatePasswordInput(newPassword, repeatNewPassword, tAuth) : null

  const valid = warnMessage === null

  const submit = async () =>
    changePassword({
      variables: {
        newPassword,
        currentPassword,
        email,
        project,
      },
    })

  return (
    <SettingsCard>
      <H2>{t('changePassword')}</H2>
      <p>{t('changePasswordExplanation')}</p>
      <form
        onSubmit={event => {
          event.preventDefault()
          submit()
        }}>
        <PasswordInput label={t('currentPassword')} value={currentPassword} setValue={setCurrentPassword} />
        <PasswordInput label={t('newPassword')} value={newPassword} setValue={setNewPassword} />
        <PasswordInput label={t('newPasswordConfirm')} value={repeatNewPassword} setValue={setRepeatNewPassword} />
        {warnMessage === null ? null : <Callout intent='danger'>{warnMessage}</Callout>}
        <div style={{ textAlign: 'right', padding: '10px 0' }}>
          <Button text={t('changePassword')} intent='primary' type='submit' disabled={!valid} loading={loading} />
        </div>
      </form>
    </SettingsCard>
  )
}

export default ChangePasswordForm
