import { ApolloError } from '@apollo/client'
import { TFunction } from 'i18next'
import { ReactElement } from 'react'

import defaultErrorMap from './DefaultErrorMap'

type GraphQLErrorMessage = {
  title: string
  description?: string | ReactElement
}

const getMessageFromApolloError = (error: ApolloError, t: TFunction): GraphQLErrorMessage => {
  const defaultMessage = t('errors:unknown')
  console.log('TF', t)

  if (error.networkError) {
    return { title: t('errors:serverNotAvailable') }
  }

  const codesEqual = error.graphQLErrors.every(
    (value, index, array) => value.extensions!.code === array[0].extensions!.code
  )
  if (error.graphQLErrors.length < 1 || (error.graphQLErrors.length > 1 && !codesEqual)) {
    return { title: defaultMessage }
  }

  return defaultErrorMap(t, error.graphQLErrors[0].extensions)
}

export default getMessageFromApolloError
