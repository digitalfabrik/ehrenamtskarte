import { TextField } from '@mui/material'
import { useContext, useState } from 'react'
import { Form, FormComponentProps, ValidationResult } from '../../FormType'
import { ShortTextInput } from '../../../generated/graphql'
import { FormContext } from '../SteppedSubForms'

export const MAX_SHORT_TEXT_LENGTH = 300

type State = { shortText: string }
type ValidatedInput = ShortTextInput
type Options = {}
type AdditionalProps = { label: string; minWidth?: number }

const Component = <I,>({
  state,
  setState,
  label,
  minWidth = 200,
  validate,
  required,
}: FormComponentProps<State, AdditionalProps, Options> & {
  validate: (state: State) => ValidationResult<I>
  required: boolean
}) => {
  const [touched, setTouched] = useState(false)
  const { showAllErrors, disableAllInputs } = useContext(FormContext)
  const validationResult = validate(state)
  const isInvalid = validationResult.type === 'error'

  return (
    <TextField
      variant='standard'
      fullWidth
      style={{ margin: '4px 0', minWidth }}
      label={label}
      required={required}
      inputProps={{ maxLength: MAX_SHORT_TEXT_LENGTH }}
      disabled={disableAllInputs}
      error={touched && isInvalid}
      onBlur={() => setTouched(true)}
      value={state.shortText}
      onChange={e => setState(() => ({ shortText: e.target.value }))}
      helperText={(showAllErrors || touched) && isInvalid ? validationResult.message : ''}
    />
  )
}

const ShortTextForm: Form<State, Options, ValidatedInput, AdditionalProps> = {
  initialState: { shortText: '' },
  getArrayBufferKeys: () => [],
  validate: ({ shortText }) => {
    if (shortText.length === 0) return { type: 'error', message: 'Feld ist erforderlich.' }
    if (shortText.length > MAX_SHORT_TEXT_LENGTH)
      return {
        type: 'error',
        message: `Text überschreitet die maximal erlaubten ${MAX_SHORT_TEXT_LENGTH} Zeichen.`,
      }
    return { type: 'valid', value: { shortText } }
  },
  Component: props => Component({ ...props, validate: ShortTextForm.validate, required: true }),
}

export const OptionalShortTextForm: Form<State, Options, ValidatedInput | null, AdditionalProps> = {
  initialState: ShortTextForm.initialState,
  getArrayBufferKeys: ShortTextForm.getArrayBufferKeys,
  validate: state => {
    if (state.shortText.length === 0) return { type: 'valid', value: null }
    return ShortTextForm.validate(state)
  },
  Component: props => Component({ ...props, validate: OptionalShortTextForm.validate, required: false }),
}

export default ShortTextForm
