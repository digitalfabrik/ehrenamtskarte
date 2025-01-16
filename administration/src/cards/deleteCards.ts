import { ApolloClient, ApolloError } from '@apollo/client'
import { TFunction } from 'i18next'

import getMessageFromApolloError from '../errors/getMessageFromApolloError'
import { DeleteCardsDocument, DeleteCardsMutation, DeleteCardsMutationVariables } from '../generated/graphql'
import { CreateCardsError } from './createCards'

const deleteCards = async (
  client: ApolloClient<object>,
  regionId: number,
  cardInfoHashesBase64: string[],
  t: TFunction
): Promise<void> => {
  const result = await client.mutate<DeleteCardsMutation, DeleteCardsMutationVariables>({
    mutation: DeleteCardsDocument,
    variables: { regionId, cardInfoHashBase64List: cardInfoHashesBase64 },
  })
  if (result.errors) {
    const { title } = getMessageFromApolloError(new ApolloError({ graphQLErrors: result.errors }), t)
    throw new CreateCardsError(title)
  }
}

export default deleteCards
