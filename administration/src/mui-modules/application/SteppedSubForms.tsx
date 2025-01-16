import { Send } from '@mui/icons-material'
import { Button, ButtonBase, CircularProgress, Divider, Step, StepContent, StepLabel, Stepper } from '@mui/material'
import { useSnackbar } from 'notistack'
import React, { ReactElement, ReactNode, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SetState, useUpdateStateCallback } from './hooks/useUpdateStateCallback'
import { Form, ValidationResult } from './util/FormType'

type FormContextType = {
  showAllErrors: boolean
  disableAllInputs: boolean
}
const initialFormContext: FormContextType = { showAllErrors: false, disableAllInputs: false }

export const FormContext = React.createContext<FormContextType>(initialFormContext)

const SubForm = ({
  children,
  validate,
  index,
  setActiveStep,
  onSubmit,
  loading,
}: {
  children: ReactNode
  validate: () => ValidationResult<unknown>
  index: number
  setActiveStep: SetState<number>
  onSubmit?: () => void
  loading: boolean
}) => {
  const { t } = useTranslation('application')
  const [formContext, setFormContxt] = useState<FormContextType>(initialFormContext)
  const { enqueueSnackbar } = useSnackbar()
  useEffect(() => setFormContxt(state => ({ ...state, disableAllInputs: loading })), [loading])

  const handleOnSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (validate().type === 'error') {
        enqueueSnackbar('Ihre Eingaben sind ungültig oder nicht vollständig.', { variant: 'error' })
        setFormContxt(state => ({ ...state, showAllErrors: true }))
      } else if (onSubmit === undefined) {
        setActiveStep(() => index + 1)
      } else {
        onSubmit()
      }
    },
    [validate, onSubmit, setActiveStep, index, enqueueSnackbar]
  )
  return (
    <FormContext.Provider value={formContext}>
      <form onSubmit={handleOnSubmit}>
        {children}
        <Divider sx={{ margin: '16px' }} />
        {index === 0 ? null : (
          <Button onClick={() => setActiveStep(() => index - 1)} disabled={formContext.disableAllInputs}>
            {t('backButton')}
          </Button>
        )}
        {onSubmit === undefined ? (
          <Button type='submit' variant='contained' disabled={formContext.disableAllInputs}>
            {t('nextStepButton')}
          </Button>
        ) : (
          <Button
            type='submit'
            variant='contained'
            disabled={formContext.disableAllInputs}
            endIcon={loading ? <CircularProgress size={20} color='inherit' /> : <Send />}>
            {t('submitApplicationButton')}
          </Button>
        )}
      </form>
    </FormContext.Provider>
  )
}

export const useFormAsStep = <
  Options extends Record<string, unknown>,
  ValidatedInput,
  AdditionalProps extends Record<string, unknown>,
  ParentState,
  KeyInParent extends keyof ParentState
>(
  label: string,
  form: Form<ParentState[KeyInParent], ValidatedInput, AdditionalProps, Options>,
  parentState: ParentState,
  setParentState: SetState<ParentState>,
  keyInParent: KeyInParent,
  options: Options,
  additionalProps: AdditionalProps
): { label: string; validate: () => ValidationResult<unknown>; element: ReactNode } => {
  const state = parentState[keyInParent]
  const setState = useUpdateStateCallback(setParentState, keyInParent)
  const validate = useCallback(() => form.validate(state, options), [state, form, options])
  const formProps = { ...additionalProps, options, state, setState }
  const element = <form.Component {...formProps} />
  return { label, validate, element }
}

const SteppedSubForms = ({
  activeStep,
  setActiveStep,
  loading,
  subForms,
  onSubmit,
}: {
  activeStep: number
  setActiveStep: SetState<number>
  loading: boolean
  subForms: { label: string; element: ReactNode; validate: () => ValidationResult<unknown> }[]
  onSubmit: () => void
}): ReactElement => {
  const tryGoTo = (index: number) => {
    for (let i = 0; i < index; i++) {
      if (subForms[i].validate().type === 'error') {
        setActiveStep(() => i)
        break
      }
    }
    setActiveStep(() => index)
  }
  return (
    <Stepper activeStep={activeStep} orientation='vertical'>
      {subForms.map(({ validate, label, element }, index) => (
        <Step key={label}>
          <ButtonBase onClick={() => tryGoTo(index)} style={{ marginLeft: '-8px' }} disabled={loading}>
            <StepLabel style={{ cursor: 'pointer', padding: '8px' }}>{label}</StepLabel>
          </ButtonBase>
          <StepContent>
            <SubForm
              validate={validate}
              index={index}
              setActiveStep={setActiveStep}
              loading={loading}
              onSubmit={index === subForms.length - 1 ? onSubmit : undefined}>
              {element}
            </SubForm>
          </StepContent>
        </Step>
      ))}
    </Stepper>
  )
}

export default SteppedSubForms
