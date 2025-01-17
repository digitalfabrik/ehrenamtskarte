import { Button, Divider, Menu, Popover } from '@blueprintjs/core'
import React, { ReactElement, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { WhoAmIContext } from '../WhoAmIProvider'
import { roleToText } from './users/UsersTable'

type UserMenuProps = {
  onSignOut: () => void
}

const Backdrop = styled.div<{ isOpen: boolean }>`
  display: ${props => (props.isOpen ? 'block' : 'none')};
  width: 100%;
  height: 100%;
  position: fixed;
  z-index: 10;
  left: 0;
  top: 0;
`

const MenuContent = styled(Menu)`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`

const MenuItem = styled(Button)`
  display: inline-block;
  width: 100%;
`

const UserMenuButton = styled(Button)`
  min-width: 220px;
`

const RoleInfo = styled.span`
  padding: 5px 10px;
`

const UserMenu = ({ onSignOut }: UserMenuProps): ReactElement => {
  const { role, email } = useContext(WhoAmIContext).me!
  const { t } = useTranslation('misc')
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const navigate = useNavigate()
  const signOutAndRedirect = () => {
    onSignOut()
    navigate('/')
  }
  const userMenuContent = (
    <MenuContent onClick={() => setIsOpen(false)}>
      <RoleInfo>Rolle: {roleToText(role)}</RoleInfo>
      <Divider style={{ margin: '4px 0px' }} />
      <NavLink to='/user-settings'>
        <MenuItem minimal icon='settings' text={t('userSettings')} />
      </NavLink>
      <MenuItem minimal icon='log-out' text={t('logout')} onClick={signOutAndRedirect} />
    </MenuContent>
  )
  return (
    <>
      <Popover content={userMenuContent} placement='bottom' matchTargetWidth isOpen={isOpen} onInteraction={setIsOpen}>
        <UserMenuButton
          minimal
          alignText='left'
          icon='user'
          rightIcon={isOpen ? 'caret-up' : 'caret-down'}
          text={email}
        />
      </Popover>
      <Backdrop onClick={() => setIsOpen(false)} isOpen={isOpen} />
    </>
  )
}

export default UserMenu
