import { OperationVariables, QueryResult } from '@apollo/client'
import { ReactElement } from 'react'

import getMessageFromApolloError from '../../errors/getMessageFromApolloError'
import ErrorHandler from '../ErrorHandler'
import LoadingSpinner from '../components/LoadingSpinner'

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
  queryResult: QueryResult<Data, Variables>
): QueryHandlerResult<Data> => {
  const { error, loading, data, refetch } = queryResult

  if (loading) return { successful: false, component: <LoadingSpinner /> }
  if (error) {
    const { title, description } = getMessageFromApolloError(error)
    return { successful: false, component: <ErrorHandler title={title} description={description} refetch={refetch} /> }
  }
  if (!data) return { successful: false, component: <ErrorHandler refetch={refetch} /> }
  return { successful: true, data: data }
}

export default getQueryResult
