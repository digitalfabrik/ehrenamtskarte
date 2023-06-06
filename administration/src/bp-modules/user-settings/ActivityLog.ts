import { format } from 'date-fns'

import { CardBlueprint, JSONCardBlueprint } from '../../cards/CardBlueprint'

const STORAGE_KEY = 'activity-log'

export class ActivityLog {
  card: JSONCardBlueprint
  timestamp: string

  constructor(cardBlueprint: CardBlueprint) {
    this.card = {
      ...cardBlueprint,
      expirationDate: cardBlueprint.expirationDate?.toString() ?? null,
    }
    this.timestamp = format(Date.now(), 'dd.MM.yyyy kk:mm:ss')
  }

  saveToSessionStorage = () => {
    const logEntries = loadActivityLog()
    logEntries.push(this)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(logEntries))
  }
}

export const loadActivityLog = (): ActivityLog[] => JSON.parse(sessionStorage.getItem(STORAGE_KEY)!) || []
