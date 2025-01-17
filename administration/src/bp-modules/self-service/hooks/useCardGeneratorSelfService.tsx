import { ApolloError } from '@apollo/client'
import React, { useCallback, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { Card, generateCardInfo, initializeCardFromCSV } from '../../../cards/Card'
import { generatePdf } from '../../../cards/PdfFactory'
import { CreateCardsError, CreateCardsResult } from '../../../cards/createCards'
import getMessageFromApolloError from '../../../errors/getMessageFromApolloError'
import { DynamicActivationCode, StaticVerificationCode } from '../../../generated/card_pb'
import { useCreateCardsFromSelfServiceMutation } from '../../../generated/graphql'
import { ProjectConfigContext } from '../../../project-configs/ProjectConfigContext'
import { getCsvHeaders } from '../../../project-configs/helper'
import { base64ToUint8Array, uint8ArrayToBase64 } from '../../../util/base64'
import downloadDataUri from '../../../util/downloadDataUri'
import getCustomDeepLinkFromQrCode from '../../../util/getCustomDeepLinkFromQrCode'
import { useAppToaster } from '../../AppToaster'
import FormErrorMessage from '../components/FormErrorMessage'

export enum CardSelfServiceStep {
  form,
  information,
  activation,
}

type UseCardGeneratorSelfServiceReturn = {
  selfServiceState: CardSelfServiceStep
  setSelfServiceState: (step: CardSelfServiceStep) => void
  isLoading: boolean
  deepLink: string
  code: CreateCardsResult | null
  selfServiceCard: Card
  setSelfServiceCard: (card: Card) => void
  generateCards: () => Promise<void>
  downloadPdf: (code: CreateCardsResult, fileName: string) => Promise<void>
}

const useCardGeneratorSelfService = (): UseCardGeneratorSelfServiceReturn => {
  const projectConfig = useContext(ProjectConfigContext)
  const appToaster = useAppToaster()
  const { t } = useTranslation('errors')
  const [searchParams] = useSearchParams()
  const [selfServiceCard, setSelfServiceCard] = useState(() => {
    const headers = getCsvHeaders(projectConfig)
    const values = headers.map(header => searchParams.get(header))
    return initializeCardFromCSV(projectConfig.card, values, headers, undefined, true)
  })
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selfServiceState, setSelfServiceState] = useState<CardSelfServiceStep>(CardSelfServiceStep.form)
  const [deepLink, setDeepLink] = useState<string>('')
  const [code, setCode] = useState<CreateCardsResult | null>(null)
  const [createCardsSelfService] = useCreateCardsFromSelfServiceMutation()

  const handleErrors = useCallback(
    (error: unknown) => {
      if (error instanceof CreateCardsError) {
        appToaster?.show({
          message: error.message,
          intent: 'danger',
        })
      }
      if (error instanceof ApolloError) {
        const { title } = getMessageFromApolloError(error)
        appToaster?.show({
          message: <FormErrorMessage style={{ color: 'white' }} errorMessage={title} />,
          timeout: 0,
          intent: 'danger',
        })
      } else {
        appToaster?.show({
          message: t('unknown'),
          intent: 'danger',
        })
      }
      setSelfServiceState(CardSelfServiceStep.form)
      setIsLoading(false)
    },
    [appToaster, setSelfServiceState, t]
  )

  const generateCards = useCallback(async (): Promise<void> => {
    setIsLoading(true)

    try {
      const cardInfo = generateCardInfo(selfServiceCard)
      const result = await createCardsSelfService({
        variables: {
          project: projectConfig.projectId,
          generateStaticCodes: true,
          encodedCardInfo: uint8ArrayToBase64(cardInfo.toBinary()),
        },
      })

      if (result.errors) {
        const { title } = getMessageFromApolloError(new ApolloError({ graphQLErrors: result.errors }))
        return Promise.reject(new CreateCardsError(title))
      }
      if (!result.data) {
        return Promise.reject(new CreateCardsError(t('cardCreationFailed')))
      }
      const cardResult = result.data.card
      const dynamicActivationCode = DynamicActivationCode.fromBinary(
        base64ToUint8Array(cardResult.dynamicActivationCode.codeBase64)
      )
      const staticVerificationCode = cardResult.staticVerificationCode
        ? StaticVerificationCode.fromBinary(base64ToUint8Array(cardResult.staticVerificationCode.codeBase64))
        : undefined
      const code = {
        dynamicActivationCode,
        staticVerificationCode,
        staticCardInfoHashBase64: cardResult.staticVerificationCode?.cardInfoHashBase64,
        dynamicCardInfoHashBase64: cardResult.dynamicActivationCode.cardInfoHashBase64,
      }
      setCode(code)
      setDeepLink(
        getCustomDeepLinkFromQrCode({
          case: 'dynamicActivationCode',
          value: code.dynamicActivationCode,
        })
      )

      setIsLoading(false)
      setSelfServiceState(CardSelfServiceStep.information)
    } catch (error) {
      handleErrors(error)
    }
  }, [projectConfig, setIsLoading, setDeepLink, setCode, createCardsSelfService, handleErrors, selfServiceCard, t])

  const downloadPdf = async (code: CreateCardsResult, fileName: string): Promise<void> => {
    const blob = await generatePdf([code], [selfServiceCard], projectConfig.pdf)
    downloadDataUri(blob, fileName)
  }

  return {
    selfServiceState,
    setSelfServiceState,
    isLoading,
    deepLink,
    code,
    selfServiceCard,
    setSelfServiceCard,
    generateCards,
    downloadPdf,
  }
}
export default useCardGeneratorSelfService
