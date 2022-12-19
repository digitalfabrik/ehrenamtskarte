import React, { useContext } from 'react'
import { Spinner } from '@blueprintjs/core'
import { RegionContext } from '../../RegionProvider'
import ApplicationsOverview from './ApplicationsOverview'
import { Region, useGetApplicationsQuery } from '../../generated/graphql'
import ErrorHandler from '../../ErrorHandler'

const ApplicationsController = (props: { region: Region; token: string }) => {
  const { loading, error, data, refetch } = useGetApplicationsQuery({
    variables: { regionId: props.region.id },
    onError: error => console.error(error),
  })
  if (loading) return <Spinner />
  else if (error || !data) return <ErrorHandler refetch={refetch} />
  else return <ApplicationsOverview applications={data.applications} token={props.token} />
}

const ControllerWithRegion = (props: { token: string }) => {
  const region = useContext(RegionContext)

  if (region === null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <p>Sie sind nicht berechtigt, Anträge einzusehen.</p>
      </div>
    )
  } else {
    return <ApplicationsController region={region} token={props.token} />
  }
}

export default ControllerWithRegion
