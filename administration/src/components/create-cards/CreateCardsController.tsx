import React, { useContext, useState } from 'react'
import { Spinner } from '@blueprintjs/core'
import { CardBlueprint } from '../../cards/CardBlueprint'
import CreateCardsForm from './CreateCardsForm'
import { useApolloClient } from '@apollo/client'
import { useAppToaster } from '../AppToaster'
import GenerationFinished from './CardsCreatedMessage'
import downloadDataUri from '../../util/downloadDataUri'
import { WhoAmIContext } from '../../WhoAmIProvider'
import { Exception } from '../../exception'
import { activateCards } from '../../cards/activation'
import { generatePdf, loadTTFFont } from '../../cards/PdfFactory'

enum CardActivationState {
  input,
  loading,
  finished,
}

const CreateCardsController = () => {
  const [cardBlueprints, setCardBlueprints] = useState<CardBlueprint[]>([])
  const client = useApolloClient()
  const { region } = useContext(WhoAmIContext).me!
  const [state, setState] = useState(CardActivationState.input)
  const appToaster = useAppToaster()

  if (!region) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <p>Sie sind nicht berechtigt, Karten auszustellen.</p>
      </div>
    )
  }

  const confirm = async () => {
    try {
      setState(CardActivationState.loading)
      const activationCodes = cardBlueprints.map(cardBlueprint => {
        return cardBlueprint.generateActivationCode(region)
      })

      await activateCards(client, activationCodes, region)

      const font = await loadTTFFont('NotoSans', 'normal', '/pdf-fonts/NotoSans-Regular.ttf')
      const pdfDataUri = generatePdf(font, activationCodes, region)

      downloadDataUri(pdfDataUri, 'ehrenamtskarten.pdf')
      setState(CardActivationState.finished)
    } catch (e) {
      console.error(e)
      if (e instanceof Exception) {
        switch (e.data.type) {
          case 'pdf-generation':
            appToaster?.show({
              message: 'Etwas ist schiefgegangen beim erstellen der PDF.',
              intent: 'danger',
            })
            break
          case 'unicode':
            appToaster?.show({
              message: `Ein Zeichen konnte nicht in der PDF eingebunden werden: ${e.data.unsupportedChar}`,
              intent: 'danger',
            })
            break
        }
      } else {
        appToaster?.show({ message: 'Etwas ist schiefgegangen.', intent: 'danger' })
      }
      setState(CardActivationState.input)
    }
  }
  if (state === CardActivationState.input) {
    return <CreateCardsForm cardBlueprints={cardBlueprints} setCardBlueprints={setCardBlueprints} confirm={confirm} />
  } else if (state === CardActivationState.loading) {
    return <Spinner />
  } else {
    return (
      <GenerationFinished
        reset={() => {
          setCardBlueprints([])
          setState(CardActivationState.input)
        }}
      />
    )
  }
}

export default CreateCardsController
