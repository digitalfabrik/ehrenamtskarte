import React from 'react'
import { useTranslation } from 'react-i18next'

import { BlueCardWorkAtDepartmentEntitlementInput } from '../../../generated/graphql'
import CustomDivider from '../CustomDivider'
import { useUpdateStateCallback } from '../hooks/useUpdateStateCallback'
import { FileRequirementsText, OptionalFileInputForm } from '../primitive-inputs/FileInputForm'
import ShortTextForm from '../primitive-inputs/ShortTextForm'
import { Form, FormComponentProps } from '../util/FormType'
import {
  CompoundState,
  createCompoundGetArrayBufferKeys,
  createCompoundInitialState,
  createCompoundValidate,
} from '../util/compoundFormUtils'
import OrganizationForm from './OrganizationForm'

const SubForms = {
  organization: OrganizationForm,
  responsibility: ShortTextForm,
  certificate: OptionalFileInputForm,
}

type State = CompoundState<typeof SubForms>
type ValidatedInput = BlueCardWorkAtDepartmentEntitlementInput
type AdditionalProps = { applicantName: string }
const WorkAtDepartmentEntitlementForm: Form<State, ValidatedInput, AdditionalProps> = {
  initialState: createCompoundInitialState(SubForms),
  getArrayBufferKeys: createCompoundGetArrayBufferKeys(SubForms),
  validate: createCompoundValidate(SubForms, {}),
  Component: ({ state, setState, applicantName }: FormComponentProps<State, AdditionalProps>) => {
    const { t } = useTranslation('applicationForms')
    return (
      <>
        <CustomDivider label={t('activityInformation')} />
        <SubForms.organization.Component
          state={state.organization}
          setState={useUpdateStateCallback(setState, 'organization')}
          applicantName={applicantName}
        />
        <h4>{t('activityInformation')}</h4>
        <SubForms.responsibility.Component
          label={t('activityFunction')}
          state={state.responsibility}
          setState={useUpdateStateCallback(setState, 'responsibility')}
        />
        <h4>{t('certificateHeadline')}</h4>
        <p>
          {t('certificateDescription')} {FileRequirementsText}
        </p>
        <SubForms.certificate.Component
          state={state.certificate}
          setState={useUpdateStateCallback(setState, 'certificate')}
        />
      </>
    )
  },
}

export default WorkAtDepartmentEntitlementForm
