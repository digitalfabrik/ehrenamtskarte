import { OperationVariables, QueryResult } from '@apollo/client'
import { CircularProgress, styled } from '@mui/material'
import { TFunction } from 'i18next'
import React, { ReactElement } from 'react'

import getMessageFromApolloError from '../../errors/getMessageFromApolloError'
import ErrorHandler from '../ErrorHandler'

const LoadingSpinner = styled(CircularProgress)`
  position: fixed;
  z-index: 999;
  top: 50%;
`

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
  t: TFunction
): QueryHandlerResult<Data> => {
  const { error, loading, data, refetch } = queryResult

  if (loading) {
    return { successful: false, component: <LoadingSpinner /> }
  }
  if (error) {
    const { title, description } = getMessageFromApolloError(error, t)
    return { successful: false, component: <ErrorHandler title={title} description={description} refetch={refetch} /> }
  }
  if (data === undefined) {
    return { successful: false, component: <ErrorHandler refetch={refetch} /> }
  }
  return { successful: true, data }
}

export default getQueryResult
