import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import deTranslations from './util/translations/de.json'

type Translation = typeof deTranslations

type Translations = {
  de: Translation
}

export const loadTranslations = (): Translations => ({
  de: {
    application: deTranslations.application,
    applications: deTranslations.applications,
    auth: deTranslations.auth,
    cards: deTranslations.cards,
    errors: deTranslations.errors,
    misc: deTranslations.misc,
    home: deTranslations.home,
    projectSettings: deTranslations.projectSettings,
    regionSettings: deTranslations.regionSettings,
    selfService: deTranslations.selfService,
    statistics: deTranslations.statistics,
    stores: deTranslations.stores,
    userSettings: deTranslations.userSettings,
    users: deTranslations.users,
  },
})

i18n.use(initReactI18next).init({
  fallbackLng: 'de',
  resources: loadTranslations(),
})

export default i18n
