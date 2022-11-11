import { OrganizationInput } from '../../../generated/graphql'
import { useUpdateStateCallback } from '../../useUpdateStateCallback'
import { Form } from '../../FormType'
import shortTextForm, { ShortTextFormState } from '../primitive-inputs/ShortTextForm'
import addressForm, { AddressFormState } from './AddressForm'
import selectForm, { SelectFormState } from '../primitive-inputs/SelectForm'
import emailForm, { EmailFormState } from '../primitive-inputs/EmailForm'

const organizationCategoryOptions = {
  items: [
    'Soziales/Jugend/Senioren',
    'Tierschutz',
    'Sport',
    'Bildung',
    'Umwelt-/Naturschutz',
    'Kultur',
    'Gesundheit',
    'Katastrophenschutz/Feuerwehr/Rettungsdienst',
    'Kirchen',
    'Andere',
  ],
}

export type OrganizationFormState = {
  name: ShortTextFormState
  address: AddressFormState
  category: SelectFormState
  contactName: ShortTextFormState
  contactEmail: EmailFormState
  contactPhone: ShortTextFormState
}
type ValidatedInput = OrganizationInput
type Options = {}
type AdditionalProps = {}
const organizationForm: Form<OrganizationFormState, Options, ValidatedInput, AdditionalProps> = {
  initialState: {
    name: shortTextForm.initialState,
    address: addressForm.initialState,
    category: selectForm.initialState,
    contactName: shortTextForm.initialState,
    contactEmail: emailForm.initialState,
    contactPhone: shortTextForm.initialState,
  },
  getValidatedInput: state => {
    const name = shortTextForm.getValidatedInput(state.name)
    const address = addressForm.getValidatedInput(state.address)
    const category = selectForm.getValidatedInput(state.category, organizationCategoryOptions)
    const contactName = shortTextForm.getValidatedInput(state.contactName)
    const contactEmail = emailForm.getValidatedInput(state.contactEmail)
    const contactPhone = shortTextForm.getValidatedInput(state.contactPhone)
    if (
      name.type === 'error' ||
      address.type === 'error' ||
      category.type === 'error' ||
      contactName.type === 'error' ||
      contactEmail.type === 'error' ||
      contactPhone.type === 'error'
    )
      return { type: 'error' }
    return {
      type: 'valid',
      value: {
        name: name.value,
        address: address.value,
        category: category.value,
        contact: {
          name: contactName.value,
          email: contactEmail.value,
          telephone: contactPhone.value,
          hasGivenPermission: true, // TODO: Add a field for this.
        },
      },
    }
  },
  Component: ({ state, setState }) => (
    <>
      <h4>Angaben zur Organisation</h4>
      <shortTextForm.Component
        state={state.name}
        setState={useUpdateStateCallback(setState, 'name')}
        label={'Name der Organisation bzw. des Vereins'}
      />
      <addressForm.Component state={state.address} setState={useUpdateStateCallback(setState, 'address')} />
      <selectForm.Component
        state={state.category}
        setState={useUpdateStateCallback(setState, 'category')}
        label='Einsatzgebiet'
        options={organizationCategoryOptions}
      />
      <h4>Kontaktperson der Organisation</h4>
      <shortTextForm.Component
        state={state.contactName}
        setState={useUpdateStateCallback(setState, 'contactName')}
        label='Vor- und Nachname'
      />
      <emailForm.Component
        state={state.contactEmail}
        setState={useUpdateStateCallback(setState, 'contactEmail')}
        label='E-Mail-Adresse'
      />
      <shortTextForm.Component
        state={state.contactPhone}
        setState={useUpdateStateCallback(setState, 'contactPhone')}
        label='Telefon'
      />
    </>
  ),
}

export default organizationForm
