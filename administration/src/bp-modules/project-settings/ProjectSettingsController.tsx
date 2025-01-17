import { NonIdealState } from '@blueprintjs/core'
import React, { ReactElement, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { WhoAmIContext } from '../../WhoAmIProvider'
import { Role } from '../../generated/graphql'
import { ProjectConfigContext } from '../../project-configs/ProjectConfigContext'
import ApiTokenSettings from './ApiTokenSettings'

const ProjectSettingsContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`

const ProjectSettingsController = (): ReactElement => {
  const { userImportApiEnabled } = useContext(ProjectConfigContext)
  const { role } = useContext(WhoAmIContext).me!
  const { t } = useTranslation('errors')

  if ((role !== Role.ProjectAdmin || !userImportApiEnabled) && role !== Role.ExternalVerifiedApiUser) {
    return <NonIdealState icon='cross' title={t('notAuthorized')} description={t('notAuthorizedForProjectSettings')} />
  }
  return (
    <ProjectSettingsContainer>
      <ApiTokenSettings showPepperSection={role === Role.ProjectAdmin && userImportApiEnabled} />
    </ProjectSettingsContainer>
  )
}

export default ProjectSettingsController
