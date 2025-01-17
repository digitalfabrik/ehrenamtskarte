import { ButtonGroup, NonIdealState } from '@blueprintjs/core'
import React, { ReactElement, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { FREINET_PARAM } from '../../Router'
import { WhoAmIContext } from '../../WhoAmIProvider'
import { ProjectConfigContext } from '../../project-configs/ProjectConfigContext'
import StandaloneCenter from '../StandaloneCenter'
import CardFormButton from './CardFormButton'

const Buttons = styled(ButtonGroup)`
  width: 400px;
`

const CreateCardsController = (): ReactElement => {
  const { region } = useContext(WhoAmIContext).me!
  const { freinetCSVImportEnabled } = useContext(ProjectConfigContext)
  const { t } = useTranslation('cards')

  const navigate = useNavigate()
  if (!region) {
    return (
      <NonIdealState
        icon='cross'
        title={t('errors:notAuthorized')}
        description={t('errors:notAuthorizedToCreateCards')}
      />
    )
  }

  return (
    <StandaloneCenter>
      <Buttons vertical>
        <CardFormButton text={t('createSingleCards')} icon='add' onClick={() => navigate('./add')} />
        <CardFormButton text={t('importMultipleCards')} icon='upload' onClick={() => navigate('./import')} />
        {freinetCSVImportEnabled && (
          <CardFormButton
            text={t('importCardsFromFreinet')}
            icon='upload'
            onClick={() => navigate(`./import?${FREINET_PARAM}=true`)}
          />
        )}
      </Buttons>
    </StandaloneCenter>
  )
}

export default CreateCardsController
