import { RenderOptions, RenderResult, render } from '@testing-library/react'
import React, { ReactElement, ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import { MemoryRouter } from 'react-router-dom'

import i18n from '../i18n'

export const renderWithRouter = (ui: ReactElement, options?: RenderOptions): RenderResult => {
  const CustomWrapper = options?.wrapper
  const wrapper = CustomWrapper
    ? (props: { children: ReactNode }) => (
        <MemoryRouter>
          <CustomWrapper {...props} />
        </MemoryRouter>
      )
    : MemoryRouter
  return render(ui, { wrapper })
}

export const renderWithTranslation = (ui: ReactElement, options?: RenderOptions): RenderResult => {
  const CustomWrapper = options?.wrapper

  const wrapper = (props: { children: ReactNode }) => (
    <I18nextProvider i18n={i18n}>{CustomWrapper ? <CustomWrapper {...props} /> : props.children}</I18nextProvider>
  )

  return render(ui, { wrapper })
}
