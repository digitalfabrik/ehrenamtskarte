import { addDays, subYears } from 'date-fns'

import PlainDate from '../../../util/PlainDate'

// subtract a year from now and add a day to have exactly one year, since end date is included in time period. this approach also considers leap years
export const defaultStartDate = PlainDate.fromLocalDate(addDays(subYears(new Date(), 1), 1)).toString()
export const defaultEndDate = PlainDate.fromLocalDate(new Date()).toString()

export const statisticKeyLabels = ['region', 'cardsCreated', 'cardsActivated']
