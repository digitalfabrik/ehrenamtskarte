import { fireEvent } from '@testing-library/react'
import React from 'react'

import { renderWithTranslation } from '../../testing/render'
import RegionSettingsCard from './RegionSettingsCard'

describe('RegionSettingsCard', () => {
  const onSave = jest.fn()
  const renderRegionSettingsCard = ({
    defaultApplicationActivation,
    defaultConfirmationMailActivation,
  }: {
    defaultApplicationActivation: boolean
    defaultConfirmationMailActivation: boolean
  }) =>
    renderWithTranslation(
      <RegionSettingsCard
        loading={false}
        defaultApplicationActivation={defaultApplicationActivation}
        defaultConfirmationMailActivation={defaultConfirmationMailActivation}
        onSave={onSave}
      />
    )

  it('should execute on save if button was clicked', () => {
    const { getByText } = renderRegionSettingsCard({
      defaultApplicationActivation: true,
      defaultConfirmationMailActivation: true,
    })
    const saveButton = getByText('Speichern')
    fireEvent.click(saveButton)
    expect(onSave).toHaveBeenCalled()
  })

  it('should check checkboxes according to the default values', () => {
    const { getByLabelText } = renderRegionSettingsCard({
      defaultApplicationActivation: true,
      defaultConfirmationMailActivation: false,
    })
    expect(getByLabelText('Region ist für den neuen Beantragungsprozess freigeschaltet')).toBeChecked()
    expect(
      getByLabelText(
        'Nach der Erstellung einer Karte verschickt das System eine E-Mail-Bestätigung an den Antragsstellenden mit einem Link zur Vorab-Aktivierung'
      )
    ).not.toBeChecked()
  })
})
