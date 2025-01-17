import { act, fireEvent } from '@testing-library/react'
import React from 'react'

import { renderWithTranslation } from '../../testing/render'
import TextAreaDialog from './TextAreaDialog'

describe('TextAreaDialog', () => {
  const onClose = jest.fn()
  const onSave = jest.fn()
  const defaultText = 'Hallo'
  const placeholderText = 'Hier kann ein Text stehen...'
  const renderTextDialog = ({ maxChars, defaultText }: { maxChars?: number; defaultText: string | null }) =>
    renderWithTranslation(
      <TextAreaDialog
        loading={false}
        maxChars={maxChars}
        defaultText={defaultText}
        placeholder={placeholderText}
        isOpen
        onClose={onClose}
        onSave={onSave}
      />
    )

  it('should disable save button when character limit is exceeded', async () => {
    const { getByText, getByDisplayValue } = renderTextDialog({ maxChars: 10, defaultText })
    const input = getByDisplayValue(defaultText)
    fireEvent.change(input, { target: { value: 'Das ist ein zu langer Text' } })
    await act(async () => null) // Popper update() - https://github.com/popperjs/react-popper/issues/350
    const saveButton = getByText('Speichern').closest('button')
    expect(saveButton?.hasAttribute('disabled')).toBeTruthy()
  })

  it('should display the character counter if max characters were provided', () => {
    const { getByLabelText } = renderTextDialog({ maxChars: 10, defaultText })
    const characterCounter = getByLabelText('Character Counter')
    expect(characterCounter).toBeDefined()
  })

  it('should not display the character counter if max characters were provided', () => {
    const { queryByLabelText } = renderTextDialog({ defaultText })
    expect(queryByLabelText('Character Counter')).toBeNull()
  })

  it('should call onSave if character count was not exceeded and button was clicked', async () => {
    const { getByText, getByDisplayValue } = renderTextDialog({ maxChars: 15, defaultText })
    const input = getByDisplayValue(defaultText)
    fireEvent.change(input, { target: { value: 'Das ist kurz' } })
    await act(async () => null) // Popper update() - https://github.com/popperjs/react-popper/issues/350
    const saveButton = getByText('Speichern').closest('button')
    expect(saveButton?.hasAttribute('disabled')).toBeFalsy()
    fireEvent.click(getByText('Speichern'))
    expect(onSave).toHaveBeenCalled()
  })

  it('should call onClose if character count was not exceeded', async () => {
    const { getByText } = renderTextDialog({ maxChars: 10, defaultText })
    fireEvent.click(getByText('Schließen'))
    expect(onClose).toHaveBeenCalled()
  })

  it('should show placeholder text if no default text was provided', async () => {
    const { getByPlaceholderText } = renderTextDialog({ maxChars: 10, defaultText: null })
    expect(getByPlaceholderText(placeholderText)).toBeTruthy()
  })
})
