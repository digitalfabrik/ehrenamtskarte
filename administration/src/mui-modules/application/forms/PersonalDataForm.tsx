import { sub } from 'date-fns'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { PersonalDataInput, Region } from '../../../generated/graphql'
import CustomDivider from '../CustomDivider'
import { useUpdateStateCallback } from '../hooks/useUpdateStateCallback'
import DateForm from '../primitive-inputs/DateForm'
import EmailForm from '../primitive-inputs/EmailForm'
import ShortTextForm, { OptionalShortTextForm } from '../primitive-inputs/ShortTextForm'
import { Form, FormComponentProps } from '../util/FormType'
import {
  CompoundState,
  createCompoundGetArrayBufferKeys,
  createCompoundInitialState,
  createCompoundValidate,
} from '../util/compoundFormUtils'
import AddressForm from './AddressForm'
import RegionForm from './RegionForm'

const SubForms = {
  forenames: ShortTextForm,
  surname: ShortTextForm,
  address: AddressForm,
  emailAddress: EmailForm,
  telephone: OptionalShortTextForm,
  dateOfBirth: DateForm,
  region: RegionForm,
}

const dateOfBirthOptions = {
  maximumDate: sub(Date.now(), { years: 16 }),
  maximumDateErrorMessage: 'Sie müssen mindestens 16 Jahre alt sein, um eine Ehrenamtskarte beantragen zu können.',
} as const

type State = CompoundState<typeof SubForms>
type ValidatedInput = PersonalDataInput & { region: { regionId: number } }
type Options = { regions: Region[] }
type AdditionalProps = Record<string, unknown>
const PersonalDataForm: Form<State, ValidatedInput, AdditionalProps, Options> = {
  initialState: createCompoundInitialState(SubForms),
  getArrayBufferKeys: createCompoundGetArrayBufferKeys(SubForms),
  validate: (state, options) =>
    createCompoundValidate(SubForms, { dateOfBirth: dateOfBirthOptions, region: options })(state),
  Component: ({ state, setState, options }: FormComponentProps<State, AdditionalProps, Options>) => {
    const { t } = useTranslation('application')
    return (
      <>
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <SubForms.forenames.Component
              state={state.forenames}
              setState={useUpdateStateCallback(setState, 'forenames')}
              label={t('forenames')}
            />
          </div>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <SubForms.surname.Component
              state={state.surname}
              setState={useUpdateStateCallback(setState, 'surname')}
              label={t('surname')}
            />
          </div>
        </div>
        <CustomDivider label={t('applicationForms:personalAddress')} />
        <SubForms.address.Component state={state.address} setState={useUpdateStateCallback(setState, 'address')} />
        <CustomDivider label={t('applicationForms:personalFurtherInformation')} />
        <SubForms.emailAddress.Component
          state={state.emailAddress}
          setState={useUpdateStateCallback(setState, 'emailAddress')}
          label={t('emailAddress')}
        />
        <SubForms.telephone.Component
          state={state.telephone}
          setState={useUpdateStateCallback(setState, 'telephone')}
          label={t('telephone')}
        />
        <SubForms.dateOfBirth.Component
          state={state.dateOfBirth}
          setState={useUpdateStateCallback(setState, 'dateOfBirth')}
          label={t('dateOfBirth')}
          options={dateOfBirthOptions}
        />
        <CustomDivider label={t('region')} />
        <SubForms.region.Component
          state={state.region}
          setState={useUpdateStateCallback(setState, 'region')}
          postalCode={state.address.postalCode.shortText}
          options={{ regions: options.regions }}
        />
      </>
    )
  },
}

export default PersonalDataForm
