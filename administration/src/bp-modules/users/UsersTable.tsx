import { Button } from '@blueprintjs/core'
import i18next from 'i18next'
import React, { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { Administrator, Region, Role } from '../../generated/graphql'
import CreateUserDialog from './CreateUserDialog'
import DeleteUserDialog from './DeleteUserDialog'
import EditUserDialog from './EditUserDialog'
import RoleHelpButton from './RoleHelpButton'

const StyledTable = styled.table`
  border-spacing: 0;

  & tbody tr:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  & td,
  & th {
    margin: 0;
    padding: 16px;
    text-align: center;
  }

  & th {
    position: sticky;
    top: 0;
    background: white;
    border-bottom: 1px solid lightgray;
  }
`

export const roleToText = (role: Role): string => {
  switch (role) {
    case Role.NoRights:
      return i18next.t('users:noRights')
    case Role.ProjectAdmin:
      return i18next.t('users:projectAdmin')
    case Role.ProjectStoreManager:
      return i18next.t('users:projectStoreManager')
    case Role.RegionAdmin:
      return i18next.t('users:regionAdmin')
    case Role.RegionManager:
      return i18next.t('users:regionManager')
    case Role.ExternalVerifiedApiUser:
      return i18next.t('users:externalVerifiedApiUser')
    default:
      return role
  }
}

const UsersTable = ({
  users,
  regions,
  selectedRegionId = null,
  refetch,
}: {
  users: Administrator[]
  regions: Region[]
  // If selectedRegionId is given, the users array is assumed to contain all users of that region.
  // Moreover, the region column of the table is hidden.
  selectedRegionId?: number | null
  refetch: () => void
}): ReactElement => {
  const { t } = useTranslation('users')
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false)
  const [userInEditDialog, setUserInEditDialog] = useState<Administrator | null>(null)
  const [userInDeleteDialog, setUserInDeleteDialog] = useState<Administrator | null>(null)

  return (
    <>
      <StyledTable>
        <thead>
          <tr>
            <th>{t('eMail')}</th>
            {selectedRegionId !== null ? null : <th>{t('role')}</th>}
            <th>
              {t('role')} <RoleHelpButton />
            </th>
            <th>{/* Action Buttons */}</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => {
            const region = regions.find(r => r.id === user.regionId)
            const regionName = region === undefined ? null : `${region.prefix} ${region.name}`
            return (
              <tr key={user.id}>
                <td>{user.email}</td>
                {selectedRegionId !== null ? null : <td>{regionName === null ? <i>({t('none')})</i> : regionName}</td>}
                <td>{roleToText(user.role)}</td>
                <td>
                  <Button
                    icon='edit'
                    intent='warning'
                    text={t('edit')}
                    minimal
                    onClick={() => setUserInEditDialog(user)}
                  />
                  <Button
                    icon='trash'
                    intent='danger'
                    text={t('delete')}
                    minimal
                    onClick={() => setUserInDeleteDialog(user)}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </StyledTable>
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <Button intent='success' text={t('addUser')} icon='add' onClick={() => setCreateUserDialogOpen(true)} />
        <CreateUserDialog
          isOpen={createUserDialogOpen}
          onClose={() => setCreateUserDialogOpen(false)}
          onSuccess={refetch}
          regionIdOverride={selectedRegionId}
        />
      </div>
      <EditUserDialog
        selectedUser={userInEditDialog}
        onClose={() => setUserInEditDialog(null)}
        onSuccess={refetch}
        regionIdOverride={selectedRegionId}
      />
      <DeleteUserDialog
        selectedUser={userInDeleteDialog}
        onClose={() => setUserInDeleteDialog(null)}
        onSuccess={refetch}
      />
    </>
  )
}

export default UsersTable
