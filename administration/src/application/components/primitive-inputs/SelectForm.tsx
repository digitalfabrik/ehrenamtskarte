import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material'
import { useState } from 'react'
import { Form } from '../../FormType'
import { ShortTextInput } from '../../../generated/graphql'

export type SelectFormState = { selectedText: string }
type ValidatedInput = ShortTextInput
type Options = { items: string[] }
type AdditionalProps = { label: string }
const SelectForm: Form<SelectFormState, Options, ValidatedInput, AdditionalProps> = {
  initialState: { selectedText: '' },
  getArrayBufferKeys: () => [],
  getValidatedInput: ({ selectedText }, options) => {
    if (selectedText.length === 0) return { type: 'error', message: 'Feld ist erforderlich.' }
    if (!options.items.includes(selectedText))
      return {
        type: 'error',
        message: `Wert muss einer der auswählbaren Optionen entsprechen.`,
      }
    return { type: 'valid', value: { shortText: selectedText } }
  },
  Component: ({ state, setState, label, options }) => {
    const [touched, setTouched] = useState(false)
    const validationResult = SelectForm.getValidatedInput(state, options)
    const isInvalid = validationResult.type === 'error'

    return (
      <FormControl fullWidth variant='standard' required style={{ margin: '4px 0' }} error={touched && isInvalid}>
        <InputLabel>{label}</InputLabel>
        <Select
          value={state}
          label={label}
          onBlur={() => setTouched(true)}
          onChange={e => setState(() => e.target.value)}>
          {options.items.map(item => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </Select>
        {!touched || !isInvalid ? null : <FormHelperText>{validationResult.message}</FormHelperText>}
      </FormControl>
    )
  },
}

export default SelectForm
