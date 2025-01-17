import { PartialMessage } from '@bufbuild/protobuf'
import { ReactElement } from 'react'

import { CardExtensions } from '../../generated/card_pb'
import { Region } from '../../generated/graphql'
import { UnionToIntersection } from '../../util/helper'
import {
  AddressLine1Extension,
  AddressLine2Extension,
  AddressLocationExtension,
  AddressPlzExtension,
} from './AddressFieldExtensions'
import BavariaCardTypeExtension from './BavariaCardTypeExtension'
import BirthdayExtension from './BirthdayExtension'
import EMailNotificationExtension from './EMailNotificationExtension'
import KoblenzReferenceNumberExtension from './KoblenzReferenceNumberExtension'
import NuernbergPassIdExtension from './NuernbergPassIdExtension'
import RegionExtension from './RegionExtension'
import StartDayExtension from './StartDayExtension'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InferExtensionStateType<T extends Extension<any>> = T extends Extension<infer ExtensionStateType>
  ? ExtensionStateType
  : never

export type ExtensionComponentProps<T> = {
  value: T
  setValue: (value: T) => void
  isValid: boolean
  showRequired: boolean
}

export type Extension<T = Record<string, unknown>> = {
  name: string
  getInitialState(region?: Region): T
  isValid(state: T | undefined | null): boolean
  Component(props: ExtensionComponentProps<T>): ReactElement | null
  causesInfiniteLifetime(state: T): boolean
  getProtobufData(state: T): PartialMessage<CardExtensions>
  fromString(value: string): T | null
  toString(state: T): string
  fromSerialized(value: string): T | null
  serialize(state: T): string
}

const Extensions = [
  BirthdayExtension,
  RegionExtension,
  StartDayExtension,
  BavariaCardTypeExtension,
  AddressLine1Extension,
  AddressLine2Extension,
  AddressPlzExtension,
  AddressLocationExtension,
  NuernbergPassIdExtension,
  EMailNotificationExtension,
  KoblenzReferenceNumberExtension,
] as const

export type PossibleExtensionTypes = (typeof Extensions)[number]
export type PossibleExtensionStateTypes = InferExtensionStateType<PossibleExtensionTypes>
export type ExtensionState = UnionToIntersection<PossibleExtensionStateTypes>
export type ExtensionKey = keyof ExtensionState

export default Extensions
