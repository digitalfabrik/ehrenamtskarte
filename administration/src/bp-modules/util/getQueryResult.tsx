import { OperationVariables, QueryResult } from '@apollo/client'
import { Spinner } from '@blueprintjs/core'
import { ReactElement } from 'react'

import getMessageFromApolloError from '../../errors/getMessageFromApolloError'
import ErrorHandler from '../ErrorHandler'

type QueryHandlerResult<Data> =
  | {
      successful: true
      data: Data
    }
  | {
      successful: false
      component: ReactElement
    }

const getQueryResult = <Data, Variables extends OperationVariables>(
  queryResult: QueryResult<Data, Variables>,
  errorComponent?: ReactElement
): QueryHandlerResult<Data> => {
  const { error, loading, data, refetch } = queryResult
  if (loading) return { successful: false, component: <Spinner /> }
  if (error) {
    const { title, description } = getMessageFromApolloError(error)
    return {
      successful: false,
      component: errorComponent ?? <ErrorHandler title={title} description={description} refetch={refetch} />,
    }
  }
  if (!data) return { successful: false, component: <ErrorHandler refetch={refetch} /> }
  return { successful: true, data: data }
}

export default getQueryResult
