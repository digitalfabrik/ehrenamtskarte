import React from 'react'
import { useTranslation } from 'react-i18next'

import { GoldenCardEntitlementInput, GoldenCardEntitlementType } from '../../../generated/graphql'
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
import HonoredByMinisterPresidentEntitlementForm from './HonoredByMinisterPresidentEntitlementForm'
import MilitaryReserveEntitlementForm from './MilitaryReserveEntitlementForm'
import WorkAtDepartmentEntitlementForm from './WorkAtDepartmentEntitlementForm'
import WorkAtOrganizationsEntitlementForm from './WorkAtOrganizationsEntitlementForm'

const entitlementTypeOptions: { labelByValue: { [K in GoldenCardEntitlementType]: string } } = {
  labelByValue: {
    [GoldenCardEntitlementType.WorkAtOrganizations]: i18next.t('application:goldenCardWorkAtOrganizationsEntitlement'),
    [GoldenCardEntitlementType.HonoredByMinisterPresident]: i18next.t(
      'application:goldenCardHonoredByMinisterPresidentEntitlement:title'
    ),
    [GoldenCardEntitlementType.WorkAtDepartment]: i18next.t('application:goldenCardWorkAtDepartmentEntitlement'),
    [GoldenCardEntitlementType.MilitaryReserve]: i18next.t('application:goldenCardMilitaryReserveEntitlement'),
  },
}

const EntitlementTypeRadioGroupForm = createRadioGroupForm<GoldenCardEntitlementType>()

const SubForms = {
  entitlementType: EntitlementTypeRadioGroupForm,
  workAtOrganizationsEntitlement: WorkAtOrganizationsEntitlementForm,
  honoredByMinisterPresidentEntitlement: HonoredByMinisterPresidentEntitlementForm,
  workAtDepartmentEntitlement: WorkAtDepartmentEntitlementForm,
  militaryReserveEntitlement: MilitaryReserveEntitlementForm,
}

type State = CompoundState<typeof SubForms>
type ValidatedInput = GoldenCardEntitlementInput
type Options = Record<string, unknown>
type AdditionalProps = { applicantName: string }
const GoldenCardEntitlementForm: Form<State, ValidatedInput, AdditionalProps, Options> = {
  initialState: createCompoundInitialState(SubForms),
  getArrayBufferKeys: createCompoundGetArrayBufferKeys(SubForms),
  validate: createSwitchValidate(SubForms, { entitlementType: entitlementTypeOptions }, 'entitlementType', {
    WORK_AT_ORGANIZATIONS: 'workAtOrganizationsEntitlement',
    WORK_AT_DEPARTMENT: 'workAtDepartmentEntitlement',
    MILITARY_RESERVE: 'militaryReserveEntitlement',
    HONORED_BY_MINISTER_PRESIDENT: 'honoredByMinisterPresidentEntitlement',
  }),
  Component: ({ state, setState, applicantName }: FormComponentProps<State, AdditionalProps, Options>) => {
    const { t } = useTranslation('applicationForms')
    return (
      <>
        <SubForms.entitlementType.Component
          state={state.entitlementType}
          setState={useUpdateStateCallback(setState, 'entitlementType')}
          options={entitlementTypeOptions}
          divideItems
          title={t('goldenCardRequirementsTitle')}
        />
        <SwitchComponent value={state.entitlementType.selectedValue}>
          {{
            [GoldenCardEntitlementType.WorkAtOrganizations]: (
              <SubForms.workAtOrganizationsEntitlement.Component
                state={state.workAtOrganizationsEntitlement}
                setState={useUpdateStateCallback(setState, 'workAtOrganizationsEntitlement')}
                applicantName={applicantName}
              />
            ),
            [GoldenCardEntitlementType.HonoredByMinisterPresident]: (
              <SubForms.honoredByMinisterPresidentEntitlement.Component
                state={state.honoredByMinisterPresidentEntitlement}
                setState={useUpdateStateCallback(setState, 'honoredByMinisterPresidentEntitlement')}
              />
            ),
            [GoldenCardEntitlementType.WorkAtDepartment]: (
              <SubForms.workAtDepartmentEntitlement.Component
                state={state.workAtDepartmentEntitlement}
                setState={useUpdateStateCallback(setState, 'workAtDepartmentEntitlement')}
                applicantName={applicantName}
              />
            ),
            [GoldenCardEntitlementType.MilitaryReserve]: (
              <SubForms.militaryReserveEntitlement.Component
                state={state.militaryReserveEntitlement}
                setState={useUpdateStateCallback(setState, 'militaryReserveEntitlement')}
              />
            ),
          }}
        </SwitchComponent>
      </>
    )
  },
}

export default GoldenCardEntitlementForm
