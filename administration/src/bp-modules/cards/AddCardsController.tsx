import { NonIdealState, Spinner } from '@blueprintjs/core'
import React, { ReactElement, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { WhoAmIContext } from '../../WhoAmIProvider'
import { Region } from '../../generated/graphql'
import useBlockNavigation from '../../util/useBlockNavigation'
import AddCardsForm from './AddCardsForm'
import GenerationFinished from './CardsCreatedMessage'
import CreateCardsButtonBar from './CreateCardsButtonBar'
import useCardGenerator, { CardActivationState } from './hooks/useCardGenerator'

const InnerAddCardsController = ({ region }: { region: Region }) => {
  const navigate = useNavigate()
  const { t } = useTranslation('cards')
  const {
    state,
    setState,
    generateCardsPdf,
    generateCardsCsv,
    setCards,
    updateCard,
    cards,
    applicationIdToMarkAsProcessed,
    setApplicationIdToMarkAsProcessed,
  } = useCardGenerator(region)

  useBlockNavigation({
    when: cards.length > 0,
    message: t('dataWillBeLostWarning'),
  })

  if (state === CardActivationState.loading) {
    return <Spinner />
  }
  if (state === CardActivationState.finished) {
    return (
      <GenerationFinished
        reset={() => {
          setCards([])
          setState(CardActivationState.input)
        }}
      />
    )
  }

  return (
    <>
      <AddCardsForm
        region={region}
        cards={cards}
        setCards={setCards}
        updateCard={updateCard}
        setApplicationIdToMarkAsProcessed={setApplicationIdToMarkAsProcessed}
      />
      <CreateCardsButtonBar
        cards={cards}
        goBack={() => navigate('/cards')}
        generateCardsPdf={() => generateCardsPdf(applicationIdToMarkAsProcessed)}
        generateCardsCsv={() => generateCardsCsv(applicationIdToMarkAsProcessed)}
      />
    </>
  )
}

const AddCardsController = (): ReactElement => {
  const { region } = useContext(WhoAmIContext).me!
  const { t } = useTranslation('cards')

  if (!region) {
    return (
      <NonIdealState icon='cross' title={t('error:SnotAuthorized')} description={t('notAuthorizedToCreateCards')} />
    )
  }

  return <InnerAddCardsController region={region} />
}

export default AddCardsController
