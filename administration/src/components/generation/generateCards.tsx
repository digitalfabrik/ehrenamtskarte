import { CardBlueprint } from './CardBlueprint'
import { CardType } from '../../models/CardType'
import generateActivationCodes from '../../util/generateActivationCodes'
import generateHashFromCardDetails from '../../util/generateHashFromCardDetails'
import uint8ArrayToBase64 from '../../util/uint8ArrayToBase64'
import { generatePdf, loadTTFFont } from './PdfFactory'
import { ApolloClient } from '@apollo/client'
import {
  AddCardDocument,
  AddCardMutation,
  AddCardMutationVariables,
  CardGenerationModelInput,
  Region,
} from '../../generated/graphql'
import { BavariaCardType } from '../../generated/card_pb'

const generateCards = async (client: ApolloClient<object>, cardBlueprints: CardBlueprint[], region: Region) => {
  const activationCodes = cardBlueprints.map(cardBlueprint => {
    const cardType = cardBlueprint.cardType === CardType.gold ? BavariaCardType.GOLD : BavariaCardType.STANDARD
    return generateActivationCodes(
      `${cardBlueprint.forename} ${cardBlueprint.surname}`,
      region.id,
      cardBlueprint.expirationDate,
      cardType
    )
  })

  const graphQLModel: CardGenerationModelInput[] = await Promise.all(
    activationCodes.map(async activationCode => {
      const cardDetailsHash = await generateHashFromCardDetails(activationCode.hashSecret, activationCode.info!)
      return {
        cardExpirationDay: activationCode.info!.expiration!.day!,
        cardDetailsHashBase64: uint8ArrayToBase64(cardDetailsHash),
        totpSecretBase64: uint8ArrayToBase64(activationCode.totpSecret),
        regionId: region.id,
      }
    })
  )
  const results = await Promise.all(
    graphQLModel.map(cardGenerationInput =>
      client.mutate<AddCardMutation, AddCardMutationVariables>({
        mutation: AddCardDocument,
        variables: { card: cardGenerationInput },
      })
    )
  )
  const fail = results.find(result => !result.data?.success)
  if (fail) throw Error(JSON.stringify(fail))

  const font = await loadTTFFont('NotoSans', 'normal', '/pdf-fonts/NotoSans-Regular.ttf')

  return generatePdf(font, activationCodes, region)
}

export default generateCards
