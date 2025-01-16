import React from 'react'
import { useTranslation } from 'react-i18next'

import { BlueCardVolunteerServiceEntitlementInput } from '../../../generated/graphql'
import CustomDivider from '../CustomDivider'
import { useUpdateStateCallback } from '../hooks/useUpdateStateCallback'
import FileInputForm, { FileRequirementsText } from '../primitive-inputs/FileInputForm'
import ShortTextForm from '../primitive-inputs/ShortTextForm'
import { Form, FormComponentProps } from '../util/FormType'
import {
  CompoundState,
  createCompoundGetArrayBufferKeys,
  createCompoundInitialState,
  createCompoundValidate,
} from '../util/compoundFormUtils'

const SubForms = {
  programName: ShortTextForm,
  certificate: FileInputForm,
}

type State = CompoundState<typeof SubForms>
type ValidatedInput = BlueCardVolunteerServiceEntitlementInput
const VolunteerServiceEntitlementForm: Form<State, ValidatedInput> = {
  initialState: createCompoundInitialState(SubForms),
  getArrayBufferKeys: createCompoundGetArrayBufferKeys(SubForms),
  validate: createCompoundValidate(SubForms, {}),
  Component: ({ state, setState }: FormComponentProps<State>) => {
    const { t } = useTranslation('applicationForms')
    return (
      <>
        <CustomDivider label={t('activityInformation')} />
        <ShortTextForm.Component
          label={t('application:volunteerServiceEntitlement:programName')}
          state={state.programName}
          setState={useUpdateStateCallback(setState, 'programName')}
        />
        <h4>{t('application:volunteerServiceEntitlement:certificate')}</h4>
        <p>
          {t('certificateDescription')} {FileRequirementsText}
        </p>
        <FileInputForm.Component state={state.certificate} setState={useUpdateStateCallback(setState, 'certificate')} />
      </>
    )
  },
}

export default VolunteerServiceEntitlementForm
