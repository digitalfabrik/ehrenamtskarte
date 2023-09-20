import { memo } from 'react'

import JsonFieldArray from './JsonFieldArray'
import JsonFieldElemental from './JsonFieldElemental'

export type JsonField<T extends keyof JsonFieldValueByType> = {
  name: string
  translations: { de: string }
  type: T
  value: JsonFieldValueByType[T]
}

export type GeneralJsonField = { [K in keyof JsonFieldValueByType]: JsonField<K> }[keyof JsonFieldValueByType]

export type JsonFieldValueByType = {
  Array: GeneralJsonField[]
  String: string
  Number: number
  Boolean: boolean
  Attachment: { fileIndex: number }
  Date: string
}

export const findValue = <T extends keyof JsonFieldValueByType>(
  object: JsonField<'Array'>,
  key: string,
  type: T
): JsonField<T> | undefined => {
  const entry = object.value.find(entry => entry.name === key)
  if (entry?.type === type) {
    return entry as JsonField<typeof type>
  }
  return undefined
}

export type JsonFieldViewProps<JsonFieldType extends GeneralJsonField> = {
  jsonField: JsonFieldType
  hierarchyIndex: number
  baseUrl: string
  attachmentAccessible: boolean
}

const JsonFieldView = (props: JsonFieldViewProps<GeneralJsonField>) => {
  if (props.jsonField.type === 'Array') {
    return <JsonFieldArray {...props} jsonField={props.jsonField} />
  } else {
    return <JsonFieldElemental {...props} jsonField={props.jsonField} />
  }
}

export default memo(JsonFieldView)
