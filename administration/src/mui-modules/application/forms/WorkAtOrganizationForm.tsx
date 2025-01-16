import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { WorkAtOrganizationInput } from '../../../generated/graphql'
import ConfirmDialog from '../ConfirmDialog'
import CustomDivider from '../CustomDivider'
import { useUpdateStateCallback } from '../hooks/useUpdateStateCallback'
import CheckboxForm from '../primitive-inputs/CheckboxForm'
import DateForm from '../primitive-inputs/DateForm'
import { FileRequirementsText, OptionalFileInputForm } from '../primitive-inputs/FileInputForm'
import NumberForm from '../primitive-inputs/NumberForm'
import ShortTextForm from '../primitive-inputs/ShortTextForm'
import { Form, FormComponentProps } from '../util/FormType'
import {
  CompoundState,
  createCompoundGetArrayBufferKeys,
  createCompoundInitialState,
  createCompoundValidate,
} from '../util/compoundFormUtils'
import OrganizationForm from './OrganizationForm'

const ActivityDivider = ({ onDelete }: { onDelete?: () => void }) => {
  const { t } = useTranslation('applicationForms')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  return (
    <>
      <CustomDivider
        label={t('workAtOrganization')}
        onDelete={onDelete === undefined ? undefined : () => setDeleteDialogOpen(true)}
      />
      {onDelete === undefined ? null : (
        <ConfirmDialog
          open={deleteDialogOpen}
          onUpdateOpen={setDeleteDialogOpen}
          confirmButtonText={t('misc:delete')}
          content={t('deleteActivityContent')}
          onConfirm={onDelete}
          title={t('deleteActivityTitle')}
        />
      )}
    </>
  )
}

const amountOfWorkOptions = { min: 0, max: 100 }
const paymentOptions = { required: false } as const

const SubForms = {
  organization: OrganizationForm,
  amountOfWork: NumberForm,
  workSinceDate: DateForm,
  payment: CheckboxForm,
  responsibility: ShortTextForm,
  certificate: OptionalFileInputForm,
}

type State = CompoundState<typeof SubForms>
type ValidatedInput = WorkAtOrganizationInput
type AdditionalProps = { onDelete?: () => void; applicantName: string }
const WorkAtOrganizationForm: Form<State, ValidatedInput, AdditionalProps> = {
  initialState: createCompoundInitialState(SubForms),
  getArrayBufferKeys: createCompoundGetArrayBufferKeys(SubForms),
  validate: createCompoundValidate(SubForms, {
    amountOfWork: amountOfWorkOptions,
    payment: paymentOptions,
    workSinceDate: { maximumDate: null },
  }),
  Component: ({ state, setState, onDelete, applicantName }: FormComponentProps<State, AdditionalProps>) => {
    const { t } = useTranslation('application')
    return (
      <>
        <ActivityDivider onDelete={onDelete} />
        <h4>{t('applicationForms:workAtOrganizationHeadline')}</h4>
        <SubForms.responsibility.Component
          state={state.responsibility}
          setState={useUpdateStateCallback(setState, 'responsibility')}
          label={t('applicationForms:workAtOrganization')}
        />
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
          <div style={{ flex: '2' }}>
            <SubForms.workSinceDate.Component
              label={t('workSinceDate')}
              state={state.workSinceDate}
              setState={useUpdateStateCallback(setState, 'workSinceDate')}
              options={{ maximumDate: null }}
            />
          </div>
          <div style={{ flex: '3' }}>
            <SubForms.amountOfWork.Component
              label={t('amountOfWork')}
              state={state.amountOfWork}
              setState={useUpdateStateCallback(setState, 'amountOfWork')}
              options={amountOfWorkOptions}
              minWidth={250}
            />
          </div>
        </div>
        <SubForms.organization.Component
          state={state.organization}
          setState={useUpdateStateCallback(setState, 'organization')}
          applicantName={applicantName}
        />
        <SubForms.payment.Component
          state={state.payment}
          setState={useUpdateStateCallback(setState, 'payment')}
          label={t('payment')}
          options={paymentOptions}
        />
        <h4>{t('applicationForms:certificateHeadline')}</h4>
        <p>
          {t('certificate')} {FileRequirementsText}
        </p>
        <SubForms.certificate.Component
          state={state.certificate}
          setState={useUpdateStateCallback(setState, 'certificate')}
        />
      </>
    )
  },
}

export default WorkAtOrganizationForm
