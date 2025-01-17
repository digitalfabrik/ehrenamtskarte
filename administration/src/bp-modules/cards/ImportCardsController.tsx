import { NonIdealState, Spinner } from '@blueprintjs/core'
import React, { ReactElement, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { WhoAmIContext } from '../../WhoAmIProvider'
import { Region } from '../../generated/graphql'
import useBlockNavigation from '../../util/useBlockNavigation'
import GenerationFinished from './CardsCreatedMessage'
import CreateCardsButtonBar from './CreateCardsButtonBar'
import ImportCardsInput from './ImportCardsInput'
import CardImportTable from './ImportCardsTable'
import useCardGenerator, { CardActivationState } from './hooks/useCardGenerator'

const InnerImportCardsController = ({ region }: { region: Region }): ReactElement => {
  const { state, setState, generateCardsPdf, generateCardsCsv, setCards, cards } = useCardGenerator(region)
  const navigate = useNavigate()
  const { t } = useTranslation('cards')

  useBlockNavigation({
    when: cards.length > 0,
    message: t('dataWillBeLostWarning'),
  })

  const goBack = () => {
    if (!cards.length) {
      navigate('/cards')
    } else {
      setCards([])
    }
  }

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
      {cards.length === 0 ? (
        <ImportCardsInput setCards={setCards} region={region} />
      ) : (
        <CardImportTable cards={cards} />
      )}
      <CreateCardsButtonBar
        cards={cards}
        goBack={goBack}
        generateCardsPdf={() => generateCardsPdf()}
        generateCardsCsv={() => generateCardsCsv()}
      />
    </>
  )
}

const ImportCardsController = (): ReactElement => {
  const { region } = useContext(WhoAmIContext).me!
  const { t } = useTranslation('errors')
  if (!region) {
    return <NonIdealState icon='cross' title={t('notAuthorized')} description={t('notAuthorizedToCreateCards')} />
  }

  return <InnerImportCardsController region={region} />
}

export default ImportCardsController
