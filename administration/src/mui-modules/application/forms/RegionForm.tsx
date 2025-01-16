import { Alert, CircularProgress, Typography } from '@mui/material'
import { styled } from '@mui/system'
import { TFunction } from 'i18next'
import React, { useContext, useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { Region, useGetRegionsByPostalCodeQuery } from '../../../generated/graphql'
import { ProjectConfigContext } from '../../../project-configs/ProjectConfigContext'
import { useUpdateStateCallback } from '../hooks/useUpdateStateCallback'
import SelectForm, { SelectItem } from '../primitive-inputs/SelectForm'
import { Form, FormComponentProps } from '../util/FormType'
import { CompoundState, createCompoundGetArrayBufferKeys, createCompoundInitialState } from '../util/compoundFormUtils'

const StyledAlert = styled(Alert)`
  margin: 16px 0;
  transition: background-color 0.2s, color 0.2s;
`

const StyledRegionsList = styled('ul')`
  margin-block-start: 4px;
  margin-block-end: 4px;
`

const SubForms = {
  region: SelectForm,
}

type State = CompoundState<typeof SubForms> & { postalCodeUsedForAutoSelect: string | null }
type ValidatedInput = { regionId: number }
type Options = { regions: Region[] }
type AdditionalProps = { postalCode: string }

const getOptionsLabel = (prefix: string, name: string) => `${name} (${prefix})`

export const getOptions = (regions: Region[]): SelectItem[] =>
  regions.map(region => ({ label: getOptionsLabel(region.prefix, region.name), value: region.id.toString() }))

const renderAlert = (
  state: State,
  postalCode: string,
  query: ReturnType<typeof useGetRegionsByPostalCodeQuery>,
  t: TFunction
) => {
  if (state.region.manuallySelected) {
    return null
  }
  if (postalCode.length !== 5) {
    return <StyledAlert severity='error'>{t('regionAlertPostalCode')}</StyledAlert>
  }
  if (query.loading) {
    return <StyledAlert severity='info' icon={<CircularProgress size='1em' />} />
  }
  if (query.error) {
    return (
      <StyledAlert severity='warning'>
        <Trans i18nKey='applicationForms:regionNotDetermined' />
      </StyledAlert>
    )
  }
  if (query.data && query.data.regions.length > 1) {
    const regions = query.data.regions
    return (
      <StyledAlert severity='warning'>
        <Trans i18nKey='applicationForms:regionNotUnique' />
        <StyledRegionsList>
          {regions.map(region => {
            const displayName = `${region.name} (${region.prefix})`
            return <li key={displayName}>{displayName}</li>
          })}
        </StyledRegionsList>
      </StyledAlert>
    )
  }
  if (query.data) {
    return <StyledAlert severity='success'>{t('regionDetermined')}</StyledAlert>
  }
  return null
}

const RegionForm: Form<State, ValidatedInput, AdditionalProps, Options> = {
  initialState: { ...createCompoundInitialState(SubForms), postalCodeUsedForAutoSelect: null },
  getArrayBufferKeys: createCompoundGetArrayBufferKeys(SubForms),
  validate: (state, options) => {
    const result = SubForms.region.validate(state.region, { items: getOptions(options.regions) })
    if (result.type === 'error') {
      return { type: 'error' }
    }
    return { type: 'valid', value: { regionId: Number(result.value.shortText) } }
  },
  Component: ({ state, setState, options, postalCode }: FormComponentProps<State, AdditionalProps, Options>) => {
    const { t } = useTranslation('applicationForms')
    const setRegionState = useUpdateStateCallback(setState, 'region')
    const project = useContext(ProjectConfigContext).projectId
    const regionQuery = useGetRegionsByPostalCodeQuery({
      onCompleted: result => {
        if (result.regions.length === 1) {
          const region = result.regions[0]
          setState(prevState => {
            if (prevState.region.manuallySelected) {
              return prevState
            }
            return {
              region: { selectedValue: region.id.toString(), manuallySelected: false },
              postalCodeUsedForAutoSelect: postalCode,
            }
          })
        }
      },
      variables: { postalCode, project },
      skip: postalCode.length !== 5 || state.region.manuallySelected,
    })

    // Clear auto-selected region when postal code changes
    useEffect(() => {
      if (state.region.manuallySelected && state.postalCodeUsedForAutoSelect !== null) {
        // Clear postalCodeUsedForAutoSelect, as the region was manually selected.
        setState(prevState => ({ ...prevState, postalCodeUsedForAutoSelect: null }))
      } else if (state.postalCodeUsedForAutoSelect !== null && postalCode !== state.postalCodeUsedForAutoSelect) {
        // Clear the auto-selected region
        setState(() => ({
          region: { selectedValue: '', manuallySelected: false },
          postalCodeUsedForAutoSelect: null,
        }))
      }
    }, [setState, state.region.manuallySelected, state.postalCodeUsedForAutoSelect, postalCode])

    return (
      <>
        <Typography>
          {t('regionSelectionDescriptionStart')}
          <a
            href='https://www.ehrenamt.bayern.de/vorteile-wettbewerbe/ehrenamtskarte/'
            target='_blank'
            rel='noreferrer'>
            {t('misc:clickHere')}
          </a>{' '}
          {t('regionSelectionDescriptionEnd')}
          .
          <br />
          <Trans i18nKey='applicationForms:regionSelectionListTextStart' />{' '}
          <a
            href='https://www.ehrenamt.bayern.de/vorteile-wettbewerbe/ehrenamtskarte/landkreise.php'
            target='_blank'
            rel='noreferrer'>
            {t('misc:clickHere')}
          </a>{' '}
          {t('regionSelectionListTextEnd')}
        </Typography>
        {renderAlert(state, postalCode, regionQuery, t)}
        <SubForms.region.Component
          state={state.region}
          setState={setRegionState}
          label={t('regionSelectionLabel')}
          options={{ items: getOptions(options.regions) }}
        />
      </>
    )
  },
}

export default RegionForm
