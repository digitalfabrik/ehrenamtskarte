import { Button, Checkbox, Classes, Dialog, FormGroup, InputGroup } from '@blueprintjs/core'
import React, { ReactElement, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import getMessageFromApolloError from '../../errors/getMessageFromApolloError'
import { Role, useCreateAdministratorMutation } from '../../generated/graphql'
import { ProjectConfigContext } from '../../project-configs/ProjectConfigContext'
import { useAppToaster } from '../AppToaster'
import RegionSelector from './RegionSelector'
import RoleHelpButton from './RoleHelpButton'
import RoleSelector from './RoleSelector'

const RoleFormGroupLabel = styled.span`
  & span {
    display: inline-block !important;
  }
`

const CreateUserDialog = ({
  isOpen,
  onClose,
  onSuccess,
  regionIdOverride,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  // If regionIdOverride is set, the region selector will be hidden, and only RegionAdministrator and RegionManager
  // roles are selectable.
  regionIdOverride: number | null
}): ReactElement => {
  const appToaster = useAppToaster()
  const { t } = useTranslation('users')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role | null>(null)
  const [regionId, setRegionId] = useState<number | null>(null)
  const [sendWelcomeMail, setSendWelcomeMail] = useState(true)
  const project = useContext(ProjectConfigContext).projectId
  const rolesWithRegion = [Role.RegionManager, Role.RegionAdmin]

  const [createAdministrator, { loading }] = useCreateAdministratorMutation({
    onError: error => {
      const { title } = getMessageFromApolloError(error)
      appToaster?.show({ intent: 'danger', message: title })
    },
    onCompleted: () => {
      appToaster?.show({ intent: 'success', message: t('addUserSuccess') })
      onClose()
      onSuccess()
      // Reset State
      setEmail('')
      setRole(null)
      setRegionId(null)
      setSendWelcomeMail(true)
    },
  })

  const getRegionId = () => {
    if (regionIdOverride !== null) {
      return regionIdOverride
    }
    return role !== null && rolesWithRegion.includes(role) ? regionId : null
  }

  return (
    <Dialog title={t('addUser')} isOpen={isOpen} onClose={onClose}>
      <form
        onSubmit={e => {
          e.preventDefault()
          createAdministrator({
            variables: {
              project,
              email,
              role: role as Role,
              regionId: getRegionId(),
              sendWelcomeMail,
            },
          })
        }}>
        <div className={Classes.DIALOG_BODY}>
          <FormGroup label={t('createUserEmailLabel')}>
            <InputGroup
              value={email}
              required
              onChange={e => setEmail(e.target.value)}
              type='email'
              placeholder='erika.musterfrau@example.org'
            />
          </FormGroup>
          <FormGroup
            label={
              <RoleFormGroupLabel>
                {t('role')} <RoleHelpButton />
              </RoleFormGroupLabel>
            }>
            <RoleSelector role={role} onChange={setRole} hideProjectAdmin={regionIdOverride !== null} />
          </FormGroup>
          {regionIdOverride !== null || role === null || !rolesWithRegion.includes(role) ? null : (
            <FormGroup label={t('region')}>
              <RegionSelector onSelect={region => setRegionId(region.id)} selectedId={regionId} />
            </FormGroup>
          )}
          <FormGroup>
            <Checkbox checked={sendWelcomeMail} onChange={e => setSendWelcomeMail(e.currentTarget.checked)}>
              <b>{t('sendWelcomeMail')}</b>
              <br />
              {t('sendWelcomeMailExplanation')}
            </Checkbox>
          </FormGroup>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button type='submit' intent='success' text={t('addUser')} icon='add' loading={loading} />
          </div>
        </div>
      </form>
    </Dialog>
  )
}

export default CreateUserDialog
