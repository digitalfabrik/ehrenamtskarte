import { Alignment, Button, Navbar } from '@blueprintjs/core'
import React, { ReactElement, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

import { WhoAmIContext } from '../WhoAmIProvider'
import { Role } from '../generated/graphql'
import { ProjectConfigContext } from '../project-configs/ProjectConfigContext'
import UserMenu from './UserMenu'
import dimensions from './constants/dimensions'

const PrintAwareNavbar = styled(Navbar)`
  @media print {
    display: none;
  }
  height: ${dimensions.navigationBarHeight};
`

type Props = {
  onSignOut: () => void
}

const Navigation = ({ onSignOut }: Props): ReactElement => {
  const { t } = useTranslation('misc')
  const config = useContext(ProjectConfigContext)
  const { region, role } = useContext(WhoAmIContext).me!
  const canSeeProjectSettings =
    (role === Role.ProjectAdmin && config.userImportApiEnabled) || role === Role.ExternalVerifiedApiUser

  return (
    <PrintAwareNavbar style={{ height: 'auto' }}>
      <Navbar.Group>
        <Navbar.Heading>
          <NavLink to='/' style={{ color: 'black', textDecoration: 'none', display: 'block' }}>
            <div style={{ flexDirection: 'column' }}>
              {config.name} {t('administration')}
            </div>
            {!region ? null : (
              <span>
                {region.prefix} {region.name} {`(${process.env.REACT_APP_VERSION})`}
              </span>
            )}
          </NavLink>
        </Navbar.Heading>
        <Navbar.Divider />
        {role === Role.RegionAdmin || role === Role.RegionManager ? (
          <>
            {config.applicationFeature ? (
              <NavLink to='/applications'>
                <Button minimal icon='form' text={t('inComingApplications')} />
              </NavLink>
            ) : null}
            {config.cardCreation ? (
              <NavLink to='/cards'>
                <Button minimal icon='id-number' text={t('createCards')} />
              </NavLink>
            ) : null}
          </>
        ) : null}
        {role === Role.ProjectAdmin || role === Role.RegionAdmin ? (
          <>
            <NavLink to='/users'>
              <Button minimal icon='people' text={t('manageUsers')} />
            </NavLink>
            {config.cardStatistics.enabled ? (
              <NavLink to='/statistics'>
                <Button minimal icon='stacked-chart' text={t('statistics')} />
              </NavLink>
            ) : null}
          </>
        ) : null}
        {role === Role.RegionAdmin && config.applicationFeature ? (
          <NavLink to='/region'>
            <Button minimal icon='path-search' text={t('manageRegion')} />
          </NavLink>
        ) : null}
        {canSeeProjectSettings ? (
          <NavLink to='/project'>
            <Button minimal icon='projects' text={t('manageProject')} />
          </NavLink>
        ) : null}
        {role === Role.ProjectStoreManager ? (
          <NavLink to='/stores'>
            <Button minimal icon='shop' text={t('manageStores')} />
          </NavLink>
        ) : null}
      </Navbar.Group>
      <Navbar.Group align={Alignment.RIGHT}>
        <UserMenu onSignOut={onSignOut} />
      </Navbar.Group>
    </PrintAwareNavbar>
  )
}

export default Navigation
