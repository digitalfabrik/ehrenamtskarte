import { SetState, useUpdateStateCallback } from '../../useUpdateStateCallback'
import { ApplicationType, BlueCardApplicationInput, BlueCardEntitlementType } from '../../../generated/graphql'
import SwitchDisplay from '../SwitchDisplay'
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material'
import { Form } from '../../FormType'
import standardEntitlementForm, { StandardEntitlementFormState } from './StandardEntitlementForm'
import personalDataForm, { PersonalDataFormState } from './PersonalDataForm'

const EntitlementTypeInput = ({
  state,
  setState,
}: {
  state: BlueCardEntitlementType | null
  setState: SetState<BlueCardEntitlementType | null>
}) => {
  return (
    <FormControl>
      <FormLabel>In den folgenden Fällen können Sie eine blaue Ehrenamtskarte beantragen:</FormLabel>
      <RadioGroup value={state} onChange={e => setState(() => e.target.value as BlueCardEntitlementType)}>
        <FormControlLabel
          value={BlueCardEntitlementType.Standard}
          label='Ehrenamtliches Engagement seit mindestens 2 Jahren bei einem Verein oder einer Organisation'
          control={<Radio />}
        />
      </RadioGroup>
    </FormControl>
  )
}

export type ApplicationFormState = {
  entitlementType: BlueCardEntitlementType | null
  standardEntitlement: StandardEntitlementFormState
  personalData: PersonalDataFormState
}
type ValidatedInput = BlueCardApplicationInput
type Options = {}
type AdditionalProps = {}
const applicationForm: Form<ApplicationFormState, Options, ValidatedInput, AdditionalProps> = {
  initialState: {
    entitlementType: null,
    standardEntitlement: standardEntitlementForm.initialState,
    personalData: personalDataForm.initialState,
  },
  getArrayBufferKeys: state => [
    ...standardEntitlementForm.getArrayBufferKeys(state.standardEntitlement),
    ...personalDataForm.getArrayBufferKeys(state.personalData),
  ],
  getValidatedInput: state => {
    const personalData = personalDataForm.getValidatedInput(state.personalData)
    if (state.entitlementType === null || personalData.type === 'error') return { type: 'error' }
    switch (state.entitlementType) {
      case BlueCardEntitlementType.Standard:
        const workAtOrganizations = standardEntitlementForm.getValidatedInput(state.standardEntitlement)
        if (workAtOrganizations.type === 'error') return { type: 'error' }
        return {
          type: 'valid',
          value: {
            entitlement: {
              entitlementType: state.entitlementType,
              workAtOrganizations: workAtOrganizations.value,
            },
            personalData: personalData.value,
            hasAcceptedPrivacyPolicy: true, // TODO: Add a corresponding field
            applicationType: ApplicationType.FirstApplication, // TODO: Add a corresponding field
            givenInformationIsCorrectAndComplete: true, // TODO: Add a corresponding field
          },
        }
      default:
        throw Error('Not yet implemented.')
    }
  },
  Component: ({ state, setState }) => (
    <>
      <EntitlementTypeInput
        state={state.entitlementType}
        setState={useUpdateStateCallback(setState, 'entitlementType')}
      />
      <SwitchDisplay value={state.entitlementType}>
        {{
          [BlueCardEntitlementType.Standard]: (
            <standardEntitlementForm.Component
              state={state.standardEntitlement}
              setState={useUpdateStateCallback(setState, 'standardEntitlement')}
            />
          ),
          [BlueCardEntitlementType.Juleica]: null,
          [BlueCardEntitlementType.Service]: null,
        }}
      </SwitchDisplay>
      <personalDataForm.Component
        state={state.personalData}
        setState={useUpdateStateCallback(setState, 'personalData')}
      />
    </>
  ),
}

export default applicationForm
