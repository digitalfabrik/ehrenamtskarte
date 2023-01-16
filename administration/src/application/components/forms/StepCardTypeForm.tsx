import { ApplicationType, BavariaCardType } from '../../../generated/graphql'
import { useUpdateStateCallback } from '../../useUpdateStateCallback'
import { Form } from '../../FormType'
import { Typography } from '@mui/material'
import CheckboxForm from '../primitive-inputs/CheckboxForm'
import CustomDivider from '../CustomDivider'
import { createRadioGroupForm } from '../primitive-inputs/RadioGroupForm'
import {
  CompoundState,
  createCompoundGetArrayBufferKeys,
  createCompoundValidate,
  createCompoundInitialState,
} from '../../compoundFormUtils'

const CardTypeForm = createRadioGroupForm<BavariaCardType>()
const cardTypeOptions = {
  labelByValue: {
    [BavariaCardType.Blue]: 'Blaue Ehrenamtskarte',
    [BavariaCardType.Golden]: 'Goldene Ehrenamtskarte',
  },
}

const ApplicationTypeForm = createRadioGroupForm<ApplicationType>()
const applicationTypeOptions = {
  labelByValue: {
    [ApplicationType.FirstApplication]: 'Erstantrag',
    [ApplicationType.RenewalApplication]: 'Verlängerungsantrag',
  },
}

const wantsDigitalCardOptions = { required: false } as const

const SubForms = {
  cardType: CardTypeForm,
  applicationType: ApplicationTypeForm,
  wantsDigitalCard: CheckboxForm,
}

type State = CompoundState<typeof SubForms>
type ValidatedInput = { cardType: BavariaCardType; applicationType: ApplicationType; wantsDigitalCard: boolean }
type Options = {}
type AdditionalProps = {}
const StepCardTypeForm: Form<State, Options, ValidatedInput, AdditionalProps> = {
  initialState: { ...createCompoundInitialState(SubForms), wantsDigitalCard: { checked: true } },
  getArrayBufferKeys: createCompoundGetArrayBufferKeys(SubForms),
  validate: createCompoundValidate(SubForms, {
    cardType: cardTypeOptions,
    applicationType: applicationTypeOptions,
    wantsDigitalCard: wantsDigitalCardOptions,
  }),
  Component: ({ state, setState }) => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <CardTypeForm.Component
        divideItems={false}
        title='Antrag auf:'
        options={cardTypeOptions}
        state={state.cardType}
        setState={useUpdateStateCallback(setState, 'cardType')}
      />
      <CustomDivider />
      <ApplicationTypeForm.Component
        divideItems={false}
        title='Art des Antrags:'
        options={applicationTypeOptions}
        state={state.applicationType}
        setState={useUpdateStateCallback(setState, 'applicationType')}
      />
      <CustomDivider />
      <Typography>
        Die Ehrenamtskarte ist als physische Karte und als digitale Version für Ihr Smartphone oder Tablet erhältlich.
        Hier können Sie wählen, ob Sie neben der physischen auch kostenfrei die digitale Ehrenamtskarte beantragen
        möchten.
      </Typography>
      <CheckboxForm.Component
        state={state.wantsDigitalCard}
        setState={useUpdateStateCallback(setState, 'wantsDigitalCard')}
        label='Ich beantrage neben der physischen auch die digitale Ehrenamtskarte.'
        options={wantsDigitalCardOptions}
      />
    </div>
  ),
}

export default StepCardTypeForm
