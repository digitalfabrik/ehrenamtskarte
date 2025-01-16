import React from 'react'
import { useTranslation } from 'react-i18next'

import { BlueCardEntitlementInput, BlueCardEntitlementType } from '../../../generated/graphql'
import i18next from '../../../i18n'
import SwitchComponent from '../SwitchComponent'
import { useUpdateStateCallback } from '../hooks/useUpdateStateCallback'
import { createRadioGroupForm } from '../primitive-inputs/RadioGroupForm'
import { Form, FormComponentProps } from '../util/FormType'
import {
  CompoundState,
  createCompoundGetArrayBufferKeys,
  createCompoundInitialState,
  createSwitchValidate,
} from '../util/compoundFormUtils'
import JuleicaEntitlementForm from './JuleicaEntitlementForm'
import MilitaryReserveEntitlementForm from './MilitaryReserveEntitlementForm'
import VolunteerServiceEntitlementForm from './VolunteerServiceEntitlementForm'
import WorkAtDepartmentEntitlementForm from './WorkAtDepartmentEntitlementForm'
import WorkAtOrganizationsEntitlementForm from './WorkAtOrganizationsEntitlementForm'

const EntitlementTypeRadioGroupForm = createRadioGroupForm<BlueCardEntitlementType>()
const entitlementTypeOptions: { labelByValue: { [K in BlueCardEntitlementType]: string } } = {
  labelByValue: {
    [BlueCardEntitlementType.WorkAtOrganizations]: i18next.t('application:blueCardWorkAtOrganizationsEntitlement'),
    [BlueCardEntitlementType.Juleica]: i18next.t('application:blueCardJuleicaEntitlement'),
    [BlueCardEntitlementType.WorkAtDepartment]: i18next.t('application:blueCardWorkAtDepartmentEntitlement'),
    [BlueCardEntitlementType.MilitaryReserve]: i18next.t('application:blueCardMilitaryReserveEntitlement'),
    [BlueCardEntitlementType.VolunteerService]: i18next.t('application:volunteerServiceEntitlement:title'),
  },
}

const SubForms = {
  entitlementType: EntitlementTypeRadioGroupForm,
  workAtOrganizationsEntitlement: WorkAtOrganizationsEntitlementForm,
  juleicaEntitlement: JuleicaEntitlementForm,
  workAtDepartmentEntitlement: WorkAtDepartmentEntitlementForm,
  militaryReserveEntitlement: MilitaryReserveEntitlementForm,
  volunteerServiceEntitlement: VolunteerServiceEntitlementForm,
}

type State = CompoundState<typeof SubForms>
type ValidatedInput = BlueCardEntitlementInput
type Options = Record<string, unknown>
type AdditionalProps = { applicantName: string }
const BlueCardEntitlementForm: Form<State, ValidatedInput, AdditionalProps, Options> = {
  initialState: createCompoundInitialState(SubForms),
  getArrayBufferKeys: createCompoundGetArrayBufferKeys(SubForms),
  validate: createSwitchValidate(SubForms, { entitlementType: entitlementTypeOptions }, 'entitlementType', {
    JULEICA: 'juleicaEntitlement',
    MILITARY_RESERVE: 'militaryReserveEntitlement',
    VOLUNTEER_SERVICE: 'volunteerServiceEntitlement',
    WORK_AT_DEPARTMENT: 'workAtDepartmentEntitlement',
    WORK_AT_ORGANIZATIONS: 'workAtOrganizationsEntitlement',
  }),
  Component: ({ state, setState, applicantName }: FormComponentProps<State, AdditionalProps, Options>) => {
    const { t } = useTranslation('applicationForms')
    return (
      <>
        <SubForms.entitlementType.Component
          state={state.entitlementType}
          divideItems
          title={t('blueCardRequirementsTitle')}
          options={entitlementTypeOptions}
          setState={useUpdateStateCallback(setState, 'entitlementType')}
        />
        <SwitchComponent value={state.entitlementType.selectedValue}>
          {{
            [BlueCardEntitlementType.WorkAtOrganizations]: (
              <SubForms.workAtOrganizationsEntitlement.Component
                state={state.workAtOrganizationsEntitlement}
                setState={useUpdateStateCallback(setState, 'workAtOrganizationsEntitlement')}
                applicantName={applicantName}
              />
            ),
            [BlueCardEntitlementType.Juleica]: (
              <SubForms.juleicaEntitlement.Component
                state={state.juleicaEntitlement}
                setState={useUpdateStateCallback(setState, 'juleicaEntitlement')}
              />
            ),
            [BlueCardEntitlementType.WorkAtDepartment]: (
              <SubForms.workAtDepartmentEntitlement.Component
                state={state.workAtDepartmentEntitlement}
                setState={useUpdateStateCallback(setState, 'workAtDepartmentEntitlement')}
                applicantName={applicantName}
              />
            ),
            [BlueCardEntitlementType.MilitaryReserve]: (
              <SubForms.militaryReserveEntitlement.Component
                state={state.militaryReserveEntitlement}
                setState={useUpdateStateCallback(setState, 'militaryReserveEntitlement')}
              />
            ),
            [BlueCardEntitlementType.VolunteerService]: (
              <SubForms.volunteerServiceEntitlement.Component
                state={state.volunteerServiceEntitlement}
                setState={useUpdateStateCallback(setState, 'volunteerServiceEntitlement')}
              />
            ),
          }}
        </SwitchComponent>
      </>
    )
  },
}

export default BlueCardEntitlementForm
