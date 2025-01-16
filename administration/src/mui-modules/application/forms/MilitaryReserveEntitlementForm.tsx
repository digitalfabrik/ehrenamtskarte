import React from 'react'
import { useTranslation } from 'react-i18next'

import { BlueCardMilitaryReserveEntitlementInput } from '../../../generated/graphql'
import CustomDivider from '../CustomDivider'
import { useUpdateStateCallback } from '../hooks/useUpdateStateCallback'
import FileInputForm, { FileRequirementsText } from '../primitive-inputs/FileInputForm'
import { Form, FormComponentProps } from '../util/FormType'
import {
  CompoundState,
  createCompoundGetArrayBufferKeys,
  createCompoundInitialState,
  createCompoundValidate,
} from '../util/compoundFormUtils'

const SubForms = {
  certificate: FileInputForm,
}

type State = CompoundState<typeof SubForms>
type ValidatedInput = BlueCardMilitaryReserveEntitlementInput
const MilitaryReserveEntitlementForm: Form<State, ValidatedInput> = {
  initialState: createCompoundInitialState(SubForms),
  getArrayBufferKeys: createCompoundGetArrayBufferKeys(SubForms),
  validate: createCompoundValidate(SubForms, {}),
  Component: ({ state, setState }: FormComponentProps<State>) => {
    const { t } = useTranslation('applicationForms')
    return (
      <>
        <CustomDivider label={t('activityInformation')} />
        <h4>{t('certificateHeadline')}</h4>
        <p>
          {t('certificateDescription')} {FileRequirementsText}
        </p>
        <FileInputForm.Component state={state.certificate} setState={useUpdateStateCallback(setState, 'certificate')} />
      </>
    )
  },
}

export default MilitaryReserveEntitlementForm
