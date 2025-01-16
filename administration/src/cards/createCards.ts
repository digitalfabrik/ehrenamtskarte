import { ApolloClient, ApolloError } from '@apollo/client'
import { TFunction } from 'i18next'

import getMessageFromApolloError from '../errors/getMessageFromApolloError'
import { CardInfo, DynamicActivationCode, StaticVerificationCode } from '../generated/card_pb'
import { CreateCardsDocument, CreateCardsMutation, CreateCardsMutationVariables } from '../generated/graphql'
import { base64ToUint8Array, uint8ArrayToBase64 } from '../util/base64'

export class CreateCardsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CreateCardsError'
  }
}

export type CreateCardsResult = {
  dynamicCardInfoHashBase64: string
  dynamicActivationCode: DynamicActivationCode
  staticCardInfoHashBase64?: string
  staticVerificationCode?: StaticVerificationCode
}

const createCards = async (
  client: ApolloClient<object>,
  projectId: string,
  cardInfos: CardInfo[],
  generateStaticCodes: boolean,
  t: TFunction,
  applicationIdToMarkAsProcessed?: number
): Promise<CreateCardsResult[]> => {
  const encodedCardInfos = cardInfos.map(cardInfo => uint8ArrayToBase64(cardInfo.toBinary()))
  const result = await client.mutate<CreateCardsMutation, CreateCardsMutationVariables>({
    mutation: CreateCardsDocument,
    variables: { project: projectId, encodedCardInfos, generateStaticCodes, applicationIdToMarkAsProcessed },
  })

  if (result.errors) {
    const { title } = getMessageFromApolloError(new ApolloError({ graphQLErrors: result.errors }), t)
    throw new CreateCardsError(title)
  }
  if (!result.data) {
    throw new CreateCardsError('Beim erstellen der Karte(n) ist ein Fehler aufgetreten.')
  }

  return result.data.cards.map(card => {
    const dynamicActivationCode = DynamicActivationCode.fromBinary(
      base64ToUint8Array(card.dynamicActivationCode.codeBase64)
    )
    const staticVerificationCode = card.staticVerificationCode
      ? StaticVerificationCode.fromBinary(base64ToUint8Array(card.staticVerificationCode.codeBase64))
      : undefined
    return {
      dynamicActivationCode,
      staticVerificationCode,
      staticCardInfoHashBase64: card.staticVerificationCode?.cardInfoHashBase64,
      dynamicCardInfoHashBase64: card.dynamicActivationCode.cardInfoHashBase64,
    }
  })
}

export default createCards
