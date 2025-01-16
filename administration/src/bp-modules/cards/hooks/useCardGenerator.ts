import { useApolloClient } from '@apollo/client'
import { useCallback, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Card, generateCardInfo, updateCard as updateCardObject } from '../../../cards/Card'
import { CsvError, generateCsv, getCSVFilename } from '../../../cards/CsvFactory'
import { PdfError, generatePdf } from '../../../cards/PdfFactory'
import createCards, { CreateCardsError, CreateCardsResult } from '../../../cards/createCards'
import deleteCards from '../../../cards/deleteCards'
import { EMAIL_NOTIFICATION_EXTENSION_NAME } from '../../../cards/extensions/EMailNotificationExtension'
import getMessageFromApolloError from '../../../errors/getMessageFromApolloError'
import { Region, useSendCardCreationConfirmationMailMutation } from '../../../generated/graphql'
import { ProjectConfigContext } from '../../../project-configs/ProjectConfigContext'
import downloadDataUri from '../../../util/downloadDataUri'
import getDeepLinkFromQrCode from '../../../util/getDeepLinkFromQrCode'
import { updateArrayItem } from '../../../util/helper'
import normalizeString from '../../../util/normalizeString'
import { useAppToaster } from '../../AppToaster'
import { saveActivityLog } from '../../user-settings/ActivityLog'

export enum CardActivationState {
  input,
  loading,
  finished,
}

const extractCardInfoHashes = (codes: CreateCardsResult[]) =>
  codes.flatMap(code => {
    if (code.staticCardInfoHashBase64) {
      return [code.dynamicCardInfoHashBase64, code.staticCardInfoHashBase64]
    }
    return code.dynamicCardInfoHashBase64
  })

type UseCardGeneratorReturn = {
  state: CardActivationState
  setState: (state: CardActivationState) => void
  generateCardsPdf: (applicationId?: number) => Promise<void>
  generateCardsCsv: (applicationId?: number) => Promise<void>
  setCards: (cards: Card[]) => void
  updateCard: (updatedCard: Partial<Card>, index: number) => void
  cards: Card[]
  setApplicationIdToMarkAsProcessed: (applicationId: number | undefined) => void
  applicationIdToMarkAsProcessed: number | undefined
}

const useCardGenerator = (region: Region): UseCardGeneratorReturn => {
  const { t } = useTranslation('errors')
  const projectConfig = useContext(ProjectConfigContext)
  const [cards, setCards] = useState<Card[]>([])
  const [state, setState] = useState(CardActivationState.input)
  const [applicationIdToMarkAsProcessed, setApplicationIdToMarkAsProcessed] = useState<number>()
  const client = useApolloClient()
  const appToaster = useAppToaster()
  const [sendMail] = useSendCardCreationConfirmationMailMutation({
    onCompleted: () => {
      appToaster?.show({ intent: 'success', message: t('cards:cardCreationConfirmationMessage') })
    },
    onError: error => {
      const { title } = getMessageFromApolloError(error, t)
      appToaster?.show({
        intent: 'danger',
        message: title,
        timeout: 0,
      })
    },
  })

  const updateCard = useCallback(
    (updatedCard: Partial<Card>, index: number) =>
      setCards(updateArrayItem(cards, updateCardObject(cards[index], updatedCard), index)),
    [cards]
  )

  const sendCardConfirmationMails = useCallback(
    async (codes: CreateCardsResult[], cards: Card[], projectId: string): Promise<void> => {
      for (let k = 0; k < codes.length; k++) {
        const card = cards[k]
        const mailNotificationExtensionState = card.extensions[EMAIL_NOTIFICATION_EXTENSION_NAME]
        const dynamicCode = codes[k].dynamicActivationCode
        if (!mailNotificationExtensionState || dynamicCode.info?.extensions?.extensionRegion?.regionId === undefined) {
          return
        }
        const deepLink = getDeepLinkFromQrCode({
          case: 'dynamicActivationCode',
          value: dynamicCode,
        })
        // eslint-disable-next-line no-await-in-loop
        await sendMail({
          variables: {
            project: projectId,
            regionId: dynamicCode.info.extensions.extensionRegion.regionId,
            recipientAddress: mailNotificationExtensionState,
            recipientName: card.fullName,
            deepLink,
          },
        })
      }
    },
    [sendMail]
  )

  const handleError = useCallback(
    async (error: unknown, codes: CreateCardsResult[] | undefined) => {
      if (codes !== undefined) {
        // try rollback
        try {
          await deleteCards(client, region.id, extractCardInfoHashes(codes), t)
        } catch (e) {
          console.log(e)
        }
      }
      if (error instanceof CreateCardsError) {
        appToaster?.show({
          message: error.message,
          intent: 'danger',
        })
      } else if (error instanceof PdfError) {
        appToaster?.show({
          message: t('pdfCreationError'),
          intent: 'danger',
        })
      } else if (error instanceof CsvError) {
        appToaster?.show({
          message: t('csvCreationError'),
          intent: 'danger',
        })
      } else {
        appToaster?.show({
          message: t('unknownError'),
          intent: 'danger',
        })
      }
      setState(CardActivationState.input)
    },
    [appToaster, client, region, t]
  )

  const generateCards = useCallback(
    async (
      generateFunction: (codes: CreateCardsResult[], cards: Card[]) => Promise<Blob> | Blob,
      filename: string,
      applicationIdToMarkAsProcessed?: number
    ): Promise<void> => {
      let codes: CreateCardsResult[] | undefined
      setState(CardActivationState.loading)

      try {
        const cardInfos = cards.map(generateCardInfo)
        codes = await createCards(
          client,
          projectConfig.projectId,
          cardInfos,
          projectConfig.staticQrCodesEnabled,
          t,
          applicationIdToMarkAsProcessed
        )

        const dataUri = await generateFunction(codes, cards)

        cards.forEach(saveActivityLog)

        downloadDataUri(dataUri, filename)
        if (region.activatedForCardConfirmationMail) {
          await sendCardConfirmationMails(codes, cards, projectConfig.projectId)
        }
        setState(CardActivationState.finished)
      } catch (error) {
        await handleError(error, codes)
      } finally {
        setCards([])
      }
    },
    [cards, client, projectConfig, handleError, sendCardConfirmationMails, region.activatedForCardConfirmationMail, t]
  )

  const generateCardsPdf = useCallback(
    async (applicationIdToMarkAsProcessed?: number) => {
      // "Berechtigungskarte_" prefix needs to always be in the filename to ensure Nuernberg automation will not break
      await generateCards(
        (codes: CreateCardsResult[], cards: Card[]) => generatePdf(codes, cards, projectConfig.pdf, region),
        cards.length === 1
          ? `Berechtigungskarte_${normalizeString(cards[0].fullName)}-${new Date().getFullYear()}.pdf`
          : 'berechtigungskarten.pdf',
        applicationIdToMarkAsProcessed
      )
    },
    [projectConfig, region, generateCards, cards]
  )

  const generateCardsCsv = useCallback(
    async (applicationIdToMarkAsProcessed?: number) => {
      await generateCards(
        (codes: CreateCardsResult[], cards: Card[]) => generateCsv(codes, cards, projectConfig.csvExport),
        getCSVFilename(cards),
        applicationIdToMarkAsProcessed
      )
    },
    [cards, generateCards, projectConfig.csvExport]
  )

  return {
    state,
    setState,
    generateCardsPdf,
    generateCardsCsv,
    setCards,
    cards,
    updateCard,
    setApplicationIdToMarkAsProcessed,
    applicationIdToMarkAsProcessed,
  }
}

export default useCardGenerator
