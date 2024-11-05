import React, { ReactNode } from 'react'

import { ActivityLog } from '../../bp-modules/user-settings/ActivityLog'
import { BIRTHDAY_EXTENSION_NAME } from '../../cards/extensions/BirthdayExtension'
import { NUERNBERG_PASS_ID_EXTENSION_NAME } from '../../cards/extensions/NuernbergPassIdExtension'

// Check column names of the activityLogConfig have the same order and amount than here
const ActivityLogEntry = (logEntry: ActivityLog): ReactNode => {
  const { card, timestamp } = logEntry
  const birthdayExtension = card.extensions[BIRTHDAY_EXTENSION_NAME] ?? null
  const passIdExtension = card.extensions[NUERNBERG_PASS_ID_EXTENSION_NAME] ?? null

  return (
    <tr key={card.id}>
      <td>{timestamp}</td>
      <td>{card.fullName}</td>
      {passIdExtension !== null && <td>{passIdExtension}</td>}
      {birthdayExtension !== null && <td>{birthdayExtension.format()}</td>}
      {card.expirationDate !== null && <td>{card.expirationDate.format()}</td>}
    </tr>
  )
}

export default ActivityLogEntry
