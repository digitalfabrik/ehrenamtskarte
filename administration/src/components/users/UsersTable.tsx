import { Button } from '@blueprintjs/core'
import { useState } from 'react'
import styled from 'styled-components'
import { Administrator, Region, Role } from '../../generated/graphql'
import { useAppToaster } from '../AppToaster'
import CreateUserDialog from './CreateUserDialog'
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
    top: 0px;
    background: white;
    border-bottom: 1px solid lightgray;
  }
`

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
}) => {
  const appToaster = useAppToaster()
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false)

  const showNotImplementedToast = () =>
    appToaster?.show({
      message: 'Diese Funktion ist noch nicht verfügbar!',
      intent: 'danger',
    })

  return (
    <>
      <StyledTable>
        <thead>
          <tr>
            <th>Email-Adresse</th>
            {selectedRegionId !== null ? null : <th>Region</th>}
            <th>
              Rolle <RoleHelpButton />
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
                {selectedRegionId !== null ? null : <td>{regionName === null ? <i>(Keine)</i> : regionName}</td>}
                <td>{roleToText(user.role)}</td>
                <td>
                  <Button icon='edit' intent='warning' text='Bearbeiten' minimal onClick={showNotImplementedToast} />
                  <Button icon='trash' intent='danger' text='Entfernen' minimal onClick={showNotImplementedToast} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </StyledTable>
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <Button intent='success' text='Benutzer hinzufügen' icon='add' onClick={() => setCreateUserDialogOpen(true)} />
        <CreateUserDialog
          isOpen={createUserDialogOpen}
          onClose={() => setCreateUserDialogOpen(false)}
          onSuccess={refetch}
          regionIdOverride={selectedRegionId}
        />
      </div>
    </>
  )
}

export const roleToText = (role: Role): String => {
  switch (role) {
    case Role.NoRights:
      return 'Keine'
    case Role.ProjectAdmin:
      return 'Administrator'
    case Role.RegionAdmin:
      return 'Regionsadministrator'
    case Role.RegionManager:
      return 'Regionsverwalter'
    default:
      return role
  }
}

export default UsersTable
