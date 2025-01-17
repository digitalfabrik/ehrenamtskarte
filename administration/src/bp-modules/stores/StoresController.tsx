import { ButtonGroup, NonIdealState } from '@blueprintjs/core'
import React, { ReactElement, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { WhoAmIContext } from '../../WhoAmIProvider'
import { Role } from '../../generated/graphql'
import { ProjectConfigContext } from '../../project-configs/ProjectConfigContext'
import StandaloneCenter from '../StandaloneCenter'
import CardFormButton from '../cards/CardFormButton'

const Buttons = styled(ButtonGroup)`
  width: 400px;
`

const StoresController = (): ReactElement => {
  const navigate = useNavigate()
  const { role } = useContext(WhoAmIContext).me!
  const storesManagement = useContext(ProjectConfigContext).storesManagement
  const { t } = useTranslation('stores')

  if (role !== Role.ProjectStoreManager || !storesManagement.enabled) {
    return (
      <NonIdealState
        icon='cross'
        title={t('errors:notAuthorized')}
        description={
          storesManagement.enabled ? t('errors:notAuthorizedToManageStores') : t('errors:manageStoresNotActivated')
        }
      />
    )
  }
  return (
    <StandaloneCenter>
      <Buttons vertical>
        <CardFormButton text={t('storesCsvImport')} icon='upload' onClick={() => navigate('./import')} />
      </Buttons>
    </StandaloneCenter>
  )
}

export default StoresController
