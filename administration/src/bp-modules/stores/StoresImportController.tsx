import { NonIdealState, Spinner } from '@blueprintjs/core'
import React, { ReactElement, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { WhoAmIContext } from '../../WhoAmIProvider'
import getMessageFromApolloError from '../../errors/getMessageFromApolloError'
import { Role, useImportAcceptingStoresMutation } from '../../generated/graphql'
import { ProjectConfigContext } from '../../project-configs/ProjectConfigContext'
import { StoresFieldConfig } from '../../project-configs/getProjectConfig'
import { useAppToaster } from '../AppToaster'
import { AcceptingStoresEntry } from './AcceptingStoresEntry'
import StoresButtonBar from './StoresButtonBar'
import StoresCSVInput from './StoresCSVInput'
import StoresImportResult from './StoresImportResult'
import StoresTable from './StoresTable'

const CenteredSpinner = styled(Spinner)`
  z-index: 999;
  top: 50%;
  left: 50%;
  position: fixed;
`

type StoreImportProps = {
  fields: StoresFieldConfig[]
}

export type StoresData = {
  [key: string]: string
}
const StoresImport = ({ fields }: StoreImportProps): ReactElement => {
  const { projectId } = useContext(ProjectConfigContext)
  const navigate = useNavigate()
  const appToaster = useAppToaster()
  const [acceptingStores, setAcceptingStores] = useState<AcceptingStoresEntry[]>([])
  const [dryRun, setDryRun] = useState<boolean>(false)
  const [isLoadingCoordinates, setIsLoadingCoordinates] = useState(false)
  const [importStores, { loading: isApplyingStoreTransaction }] = useImportAcceptingStoresMutation({
    onCompleted: ({ result }) => {
      appToaster?.show({
        intent: 'none',
        timeout: 0,
        message: (
          <StoresImportResult
            dryRun={dryRun}
            storesUntouched={result.storesUntouched}
            storesDeleted={result.storesDeleted}
            storesCreated={result.storesCreated}
          />
        ),
      })
      setAcceptingStores([])
    },
    onError: error => {
      const { title } = getMessageFromApolloError(error)
      appToaster?.show({ intent: 'danger', message: title })
    },
  })

  const goBack = () => {
    if (!acceptingStores.length) {
      navigate('/stores')
    } else {
      setAcceptingStores([])
    }
  }

  const onImportStores = () =>
    importStores({ variables: { stores: acceptingStores.map(store => store.data), project: projectId, dryRun } })

  return (
    <>
      {(isApplyingStoreTransaction || isLoadingCoordinates) && <CenteredSpinner intent='primary' />}
      {acceptingStores.length === 0 ? (
        <StoresCSVInput
          setAcceptingStores={setAcceptingStores}
          fields={fields}
          setIsLoadingCoordinates={setIsLoadingCoordinates}
        />
      ) : (
        <StoresTable fields={fields} acceptingStores={acceptingStores} />
      )}
      <StoresButtonBar
        goBack={goBack}
        acceptingStores={acceptingStores}
        importStores={onImportStores}
        dryRun={dryRun}
        setDryRun={setDryRun}
      />
    </>
  )
}

const StoresImportController = (): ReactElement => {
  const { role } = useContext(WhoAmIContext).me!
  const storesManagement = useContext(ProjectConfigContext).storesManagement
  const { t } = useTranslation('errors')
  if (role !== Role.ProjectStoreManager || !storesManagement.enabled) {
    return <NonIdealState icon='cross' title={t('notAuthorized')} description={t('notAuthorizedToManageStores')} />
  }

  return <StoresImport fields={storesManagement.fields} />
}

export default StoresImportController
