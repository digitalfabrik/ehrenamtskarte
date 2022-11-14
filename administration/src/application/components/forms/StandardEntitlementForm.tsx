import { Alert, Button } from '@mui/material'
import WorkAtOrganizationForm, { WorkAtOrganizationFormState } from './WorkAtOrganizationForm'
import { WorkAtOrganizationInput } from '../../../generated/graphql'
import { SetState } from '../../useUpdateStateCallback'
import { useCallback, useMemo } from 'react'
import { Form } from '../../FormType'

const WorkAtOrganizationFormHelper = ({
  listKey,
  setStateByKey,
  ...otherProps
}: {
  state: WorkAtOrganizationFormState
  listKey: number
  setStateByKey: (key: number) => SetState<WorkAtOrganizationFormState>
  onDelete?: () => void
}) => {
  const setState = useMemo(() => setStateByKey(listKey), [setStateByKey, listKey])
  return <WorkAtOrganizationForm.Component setState={setState} {...otherProps} />
}

function replaceAt<T>(array: T[], index: number, newItem: T): T[] {
  const newArray = [...array]
  newArray[index] = newItem
  return newArray
}

function removeAt<T>(array: T[], index: number): T[] {
  const newArray = [...array]
  newArray.splice(index, 1)
  return newArray
}

export type StandardEntitlementFormState = { key: number; value: WorkAtOrganizationFormState }[]
type ValidatedInput = WorkAtOrganizationInput[]
type Options = {}
type AdditionalProps = {}
const StandardEntitlementForm: Form<StandardEntitlementFormState, Options, ValidatedInput, AdditionalProps> = {
  initialState: [{ key: 0, value: WorkAtOrganizationForm.initialState }],
  getArrayBufferKeys: state => state.map(({ value }) => WorkAtOrganizationForm.getArrayBufferKeys(value)).flat(),
  getValidatedInput: state => {
    const validationResults = state.map(({ value }) => WorkAtOrganizationForm.getValidatedInput(value))
    if (validationResults.some(({ type }) => type === 'error')) {
      return { type: 'error' }
    }
    return {
      type: 'valid',
      value: validationResults.map(x => {
        if (x.type !== 'valid') {
          throw Error('Found an invalid entry despite previous validity check.')
        }
        return x.value
      }),
    }
  },
  Component: ({ state, setState }) => {
    const addActivity = () =>
      setState(state => {
        const newKey = Math.max(...state.map(({ key }) => key), 0) + 1
        return [...state, { key: newKey, value: WorkAtOrganizationForm.initialState }]
      })

    const setStateByKey: (key: number) => SetState<WorkAtOrganizationFormState> = useCallback(
      key => update =>
        setState(state => {
          const index = state.findIndex(element => element.key === key)
          return replaceAt(state, index, { key, value: update(state[index].value) })
        }),
      [setState]
    )

    return (
      <>
        <h3>Ehrenamtliche Tätigkeit(en)</h3>
        {state.map(({ key, value }, index) => (
          <WorkAtOrganizationFormHelper
            key={key}
            listKey={key}
            state={value}
            onDelete={state.length <= 1 ? undefined : () => setState(state => removeAt(state, index))}
            setStateByKey={setStateByKey}
          />
        ))}
        {state.length < 10 ? (
          <Button onClick={addActivity}>Weitere Tätigkeit hinzufügen</Button>
        ) : (
          <Alert severity='info'>Maximale Anzahl an Tätigkeiten erreicht.</Alert>
        )}
      </>
    )
  },
}

export default StandardEntitlementForm
