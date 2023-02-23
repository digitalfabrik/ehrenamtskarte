import { AddressInput } from '../../../generated/graphql'
import ShortTextForm, { OptionalShortTextForm } from '../primitive-inputs/ShortTextForm'
import { useUpdateStateCallback } from '../../useUpdateStateCallback'
import { Form } from '../../FormType'
import {
  CompoundState,
  createCompoundGetArrayBufferKeys,
  createCompoundValidate,
  createCompoundInitialState,
} from '../../compoundFormUtils'

const SubForms = {
  street: ShortTextForm,
  houseNumber: ShortTextForm,
  addressSupplement: OptionalShortTextForm,
  location: ShortTextForm,
  postalCode: ShortTextForm,
  country: ShortTextForm,
}

type State = CompoundState<typeof SubForms>
type ValidatedInput = AddressInput
type Options = {}
type AdditionalProps = {}

const AddressForm: Form<State, Options, ValidatedInput, AdditionalProps> = {
  initialState: { ...createCompoundInitialState(SubForms), country: { shortText: 'Deutschland' } },
  getArrayBufferKeys: createCompoundGetArrayBufferKeys(SubForms),
  validate: createCompoundValidate(SubForms, {}),
  Component: ({ state, setState }) => (
    <>
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
        <div style={{ flex: '3' }}>
          <SubForms.street.Component
            state={state.street}
            setState={useUpdateStateCallback(setState, 'street')}
            label='Straße'
          />
        </div>
        <div style={{ flex: '1' }}>
          <SubForms.houseNumber.Component
            state={state.houseNumber}
            setState={useUpdateStateCallback(setState, 'houseNumber')}
            label='Hausnummer'
            minWidth={100}
          />
        </div>
      </div>
      <SubForms.addressSupplement.Component
        label='Adresszusatz'
        state={state.addressSupplement}
        setState={useUpdateStateCallback(setState, 'addressSupplement')}
      />
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
        <div style={{ flex: '1' }}>
          <SubForms.postalCode.Component
            state={state.postalCode}
            setState={useUpdateStateCallback(setState, 'postalCode')}
            label='Postleitzahl'
          />
        </div>
        <div style={{ flex: '3' }}>
          <SubForms.location.Component
            state={state.location}
            setState={useUpdateStateCallback(setState, 'location')}
            label='Ort'
          />
        </div>
        <SubForms.country.Component
          state={state.country}
          setState={useUpdateStateCallback(setState, 'postalCode')}
          label='Land'
        />
      </div>
    </>
  ),
}

export default AddressForm
