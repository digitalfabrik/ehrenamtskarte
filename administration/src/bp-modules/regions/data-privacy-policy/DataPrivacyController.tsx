import { NonIdealState } from '@blueprintjs/core'
import React, { ReactElement, useContext } from 'react'
import { useTranslation } from 'react-i18next'

import { WhoAmIContext } from '../../../WhoAmIProvider'
import { Role, useGetDataPolicyQuery } from '../../../generated/graphql'
import getQueryResult from '../../util/getQueryResult'
import DataPrivacyOverview from './DataPrivacyOverview'

const DataPrivacyController = ({ regionId }: { regionId: number }) => {
  const { t } = useTranslation('errors')
  const dataPolicyQuery = useGetDataPolicyQuery({
    variables: { regionId },
    onError: error => console.error(error),
  })
  const dataPolicyQueryResult = getQueryResult(dataPolicyQuery, t)
  if (!dataPolicyQueryResult.successful) {
    return dataPolicyQueryResult.component
  }

  const dataPrivacyPolicy = dataPolicyQueryResult.data.dataPolicy.dataPrivacyPolicy ?? ''

  return <DataPrivacyOverview dataPrivacyPolicy={dataPrivacyPolicy} regionId={regionId} />
}

const DataPrivacyWithRegion = (): ReactElement => {
  const { region, role } = useContext(WhoAmIContext).me!
  const { t } = useTranslation('errors')
  if (!region || role !== Role.RegionAdmin) {
    return <NonIdealState icon='cross' title={t('notAuthorized')} description={t('notAuthorizedForDataPrivacy')} />
  }
  return <DataPrivacyController regionId={region.id} />
}

export default DataPrivacyWithRegion
