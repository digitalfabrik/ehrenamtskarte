import { PartialMessage } from '@bufbuild/protobuf'

import { maxCardValidity } from '../bp-modules/cards/AddCardForm'
import { CardExtensions, CardInfo } from '../generated/card_pb'
import { Region } from '../generated/graphql'
import { CardConfig } from '../project-configs/getProjectConfig'
import PlainDate from '../util/PlainDate'
import { REGION_EXTENSION_NAME } from './extensions/RegionExtension'
import Extensions, { Extension, ExtensionKey, ExtensionState, InferExtensionStateType } from './extensions/extensions'

// Due to limited space on the cards
const MAX_NAME_LENGTH = 40
// Due to limited space on the qr code
const MAX_ENCODED_NAME_LENGTH = 50

export type Card = {
  id: number
  fullName: string
  expirationDate: PlainDate | null
  extensions: Partial<ExtensionState>
}

const createRandomId = () => Math.floor(Math.random() * 1000000)

const getInitialExtensionState = (cardConfig: CardConfig, region: Region | undefined) =>
  cardConfig.extensions.reduce(
    (acc, extension) =>
      Object.assign(acc, extension.getInitialState(extension.name === REGION_EXTENSION_NAME ? region : undefined)),
    {}
  )

export const initializeCard = (
  cardConfig: CardConfig,
  region: Region | undefined = undefined,
  { id, fullName, expirationDate, extensions }: Partial<Card> = {}
): Card => {
  const defaultExpirationDate = PlainDate.fromLocalDate(new Date()).add(cardConfig.defaultValidity)

  return {
    id: id ?? createRandomId(),
    fullName: fullName ?? '',
    extensions: {
      ...getInitialExtensionState(cardConfig, region),
      ...(extensions ?? {}),
    },
    expirationDate: expirationDate === undefined ? defaultExpirationDate : expirationDate,
  }
}

type ExtensionWithState = {
  extension: Extension<InferExtensionStateType<(typeof Extensions)[number]>>
  state: InferExtensionStateType<(typeof Extensions)[number]>
}
export const getExtensions = ({ extensions }: Card): ExtensionWithState[] => {
  const extensionKeys = Object.keys(extensions) as (keyof typeof Extensions)[]
  return extensionKeys.map(key => {
    const extensionObject = Extensions.find(extension => extension.name === key)!
    type ExtensionStateType = InferExtensionStateType<typeof extensionObject>
    // @ts-expect-error key is always a valid key
    return { extension: extensionObject, state: { [key]: extensions[key] } } as {
      extension: Extension<ExtensionStateType>
      state: ExtensionStateType
    }
  })
}

export const hasInfiniteLifetime = (card: Card): boolean =>
  getExtensions(card).some(({ extension, state }) => extension.causesInfiniteLifetime(state))

export const isFullNameValid = ({ fullName }: Card): boolean => {
  const encodedName = new TextEncoder().encode(fullName)
  return fullName.length > 0 && encodedName.length <= MAX_ENCODED_NAME_LENGTH && fullName.length <= MAX_NAME_LENGTH
}

export const isExpirationDateValid = (card: Card, { nullable } = { nullable: false }): boolean => {
  const today = PlainDate.fromLocalDate(new Date())
  const startDay = card.extensions.startDay

  if (card.expirationDate === null) {
    return nullable
  }

  return (
    card.expirationDate.isAfter(today) &&
    card.expirationDate.isBefore(today.add(maxCardValidity)) &&
    (startDay?.isBefore(card.expirationDate) ?? true)
  )
}

export const isValid = (card: Card, { expirationDateNullable } = { expirationDateNullable: false }): boolean =>
  isFullNameValid(card) &&
  getExtensions(card).every(({ extension, state }) => extension.isValid(state)) &&
  (isExpirationDateValid(card, { nullable: expirationDateNullable }) || hasInfiniteLifetime(card))

export const generateCardInfo = (card: Card): CardInfo => {
  const extensionsMessage: PartialMessage<CardExtensions> = getExtensions(card).reduce(
    (acc, { extension, state }) => Object.assign(acc, extension.getProtobufData(state)),
    {}
  )

  const expirationDate = card.expirationDate
  const expirationDay =
    expirationDate !== null && !hasInfiniteLifetime(card) ? Math.max(expirationDate.toDaysSinceEpoch(), 0) : undefined

  return new CardInfo({
    fullName: card.fullName,
    expirationDay,
    extensions: new CardExtensions(extensionsMessage),
  })
}

const getExtensionNameByCSVHeader = (cardConfig: CardConfig, columnHeader: string): ExtensionKey | null => {
  const extensionIndex = cardConfig.extensionColumnNames.indexOf(columnHeader)
  return (cardConfig.extensions[extensionIndex]?.name as ExtensionKey | undefined) ?? null
}

export const isValueValid = (card: Card, cardConfig: CardConfig, columnHeader: string): boolean => {
  switch (columnHeader) {
    case cardConfig.nameColumnName:
      return isFullNameValid(card)
    case cardConfig.expiryColumnName:
      return isExpirationDateValid(card) || hasInfiniteLifetime(card)
    default: {
      const extensionName = getExtensionNameByCSVHeader(cardConfig, columnHeader)
      const extension = cardConfig.extensions.find(extension => extension.name === extensionName)
      return extension?.isValid(card.extensions) ?? false
    }
  }
}

export const getValueByCSVHeader = (
  card: Card,
  cardConfig: CardConfig,
  columnHeader: string
): string | number | undefined => {
  switch (columnHeader) {
    case cardConfig.nameColumnName:
      return card.fullName
    case cardConfig.expiryColumnName:
      return card.expirationDate?.format()
    default: {
      const extensionName = getExtensionNameByCSVHeader(cardConfig, columnHeader)
      const extension = getExtensions(card).find(({ extension }) => extension.name === extensionName)
      return extension?.extension.toString(extension.state)
    }
  }
}

export const initializeCardFromCSV = (
  cardConfig: CardConfig,
  line: (string | null)[],
  headers: string[],
  region: Region,
  withDefaults = false
): Card => {
  const defaultCard = withDefaults
    ? initializeCard(cardConfig, region)
    : { fullName: '', expirationDate: null, extensions: { [REGION_EXTENSION_NAME]: region.id } }
  const extensions = headers.reduce((acc, header, index) => {
    const value = line[index]
    const extension = Extensions.find(extension => extension.name === getExtensionNameByCSVHeader(cardConfig, header))
    return extension && value != null ? Object.assign(acc, extension.fromString(value)) : acc
  }, defaultCard.extensions)

  const fullName = line[headers.indexOf(cardConfig.nameColumnName)] ?? defaultCard.fullName
  const rawExpirationDate = line[headers.indexOf(cardConfig.expiryColumnName)]
  const expirationDate = PlainDate.safeFromCustomFormat(rawExpirationDate) ?? defaultCard.expirationDate

  return {
    id: createRandomId(),
    fullName,
    expirationDate,
    extensions,
  }
}

export const updateCard = (oldCard: Card, updatedCard: Partial<Card>): Card => ({
  ...oldCard,
  ...updatedCard,
  extensions: {
    ...oldCard.extensions,
    ...(updatedCard.extensions ?? {}),
  },
})
