import { Button, H4, Popover } from '@blueprintjs/core'
import React, { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { Role } from '../../generated/graphql'
import { roleToText } from './UsersTable'

const RoleHelpButton = (): ReactElement => {
  const { t } = useTranslation('users')
  return (
    <Popover
      content={
        <div style={{ padding: '10px' }}>
          <H4 style={{ textAlign: 'center' }}>{t('roleRightsHeading')}</H4>
          <ul>
            <li>
              <b>{roleToText(Role.ProjectAdmin)}:</b>
              <ul>
                <li>{t('projectAdminRight')}</li>
              </ul>
            </li>
            <li>
              <b>{roleToText(Role.RegionAdmin)}:</b>
              <ul>
                <li>{t('regionAdminRight1')}</li>
                <li>{t('regionAdminRight2')}</li>
                <li>{t('regionAdminRight3')}</li>
                <li>{t('regionAdminRight4')}</li>
              </ul>
              <div>
                <span style={{ color: 'red', fontWeight: 'bold' }}>{t('hint')}: </span>
                {t('regionAdminHint')}
              </div>
            </li>
            <li>
              <b>{roleToText(Role.RegionManager)}:</b>
              <ul>
                <li>{t('regionManagerRight1')}</li>
                <li>{t('regionManagerRight2')}</li>
              </ul>
            </li>
            <li>
              <b>{roleToText(Role.ExternalVerifiedApiUser)}:</b>
              <ul>
                <li>
                  {t('externalVerifiedApiUser1')}
                  <br />
                  {t('externalVerifiedApiUser2')}
                </li>
              </ul>
            </li>
          </ul>
        </div>
      }>
      <Button icon='help' minimal />
    </Popover>
  )
}

export default RoleHelpButton
