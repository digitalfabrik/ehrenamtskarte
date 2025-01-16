import { Button, Checkbox, H2 } from '@blueprintjs/core'
import React, { ReactElement, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import getMessageFromApolloError from '../../errors/getMessageFromApolloError'
import { useGetNotificationSettingsQuery, useUpdateNotificationSettingsMutation } from '../../generated/graphql'
import { useAppToaster } from '../AppToaster'
import getQueryResult from '../util/getQueryResult'
import SettingsCard from './SettingsCard'

type NotificationSettingsProps = {
  projectId: string
}

const NotificationSettings = ({ projectId }: NotificationSettingsProps): ReactElement => {
  const { t } = useTranslation('userSettings')
  const [receiveEmailForActivation, setReceiveEmailForActivation] = useState<boolean>(false)
  const [receiveEmailForVerification, setReceiveEmailForVerification] = useState<boolean>(false)

  const appToaster = useAppToaster()
  const [updateNotificationSettings, { loading }] = useUpdateNotificationSettingsMutation({
    onError: error => {
      const { title } = getMessageFromApolloError(error, t)
      appToaster?.show({ intent: 'danger', message: title })
    },
    onCompleted: () => appToaster?.show({ intent: 'success', message: t('notificationUpdateSuccess') }),
  })

  const notificationSettingsQuery = useGetNotificationSettingsQuery({ variables: { project: projectId } })

  useEffect(() => {
    const notificationQueryResult = getQueryResult(notificationSettingsQuery, t)
    if (notificationQueryResult.successful) {
      const { notificationOnApplication, notificationOnVerification } =
        notificationQueryResult.data.notificationSettings
      setReceiveEmailForActivation(notificationOnApplication)
      setReceiveEmailForVerification(notificationOnVerification)
    }
  }, [notificationSettingsQuery, t])

  const notificationQueryResult = getQueryResult(notificationSettingsQuery, t)
  if (!notificationQueryResult.successful) {
    return notificationQueryResult.component
  }

  const submit = () => {
    updateNotificationSettings({
      variables: {
        project: projectId,
        notificationSettings: {
          notificationOnApplication: receiveEmailForActivation,
          notificationOnVerification: receiveEmailForVerification,
        },
      },
    })
  }

  return (
    <SettingsCard>
      <H2>{t('notifications')}</H2>
      <p>{t('notificationsExplanation')}</p>
      <form
        onSubmit={event => {
          event.preventDefault()
          submit()
        }}>
        <Checkbox
          checked={receiveEmailForActivation}
          onChange={e => setReceiveEmailForActivation(e.currentTarget.checked)}
          label={t('newApplications')}
        />
        <Checkbox
          checked={receiveEmailForVerification}
          onChange={e => setReceiveEmailForVerification(e.currentTarget.checked)}
          label={t('newVerifications')}
        />
        <div style={{ textAlign: 'right', padding: '10px 0' }}>
          <Button text={t('save')} intent='primary' type='submit' loading={loading} />
        </div>
      </form>
    </SettingsCard>
  )
}

export default NotificationSettings
